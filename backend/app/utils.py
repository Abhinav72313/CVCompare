import logging
import datetime
import httpx
from typing import Dict, Any, Optional
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.messages import HumanMessage, AIMessage
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from fastapi import UploadFile, HTTPException
import json
import tempfile
import os
from io import BytesIO
from models import QueryResumeAnalysis, ResumeAnalysis, User, UserCreate, UserUpdate, ChatMessage

logger = logging.getLogger(__name__)


def get_analysis(
    job_description: str,
    resume_text: str,
    messages: list,
    prompt: str,
    model,
) -> Dict[str, Any]:
    """Analyze resume against job description using AI."""
    try:
        # Format the prompt with resume text and job description
        formatted_prompt = (prompt % (resume_text, job_description)).strip()

        # Generate analysis using Gemini AI
        messages.append(HumanMessage(formatted_prompt))
        response = model.invoke(messages)

        result = response.content[7:-4].strip()

        # Parse JSON response
        try:
            result = json.loads(result)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500, detail="Failed to parse response from AI model."
            )

        return result

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


async def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    """Extract text content from uploaded PDF file."""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            contents = await pdf_file.read()
            temp_pdf.write(contents)
            temp_pdf_path = temp_pdf.name

        loader = PyPDFLoader(temp_pdf_path, mode="single", extract_images=False)
        documents = loader.load()

        return documents[0].page_content

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500, detail=f"Failed to extract text from PDF: {str(e)}"
        )

    finally:
        os.remove(temp_pdf_path)  # Clean up temporary file


def add_to_vector_store(
    id,
    file_name,
    vector_store,
    resume_text: str,
    job_description: str,
    resume_hash: int,
    job_hash: int,
):
    """Add resume and job description to the vector store."""
    try:

        # Check if this specific resume already exists
        existing_resume = vector_store.similarity_search(
            query="",
            filter={
                "user_id": id,
                "document_type": "resume",
                "content_hash": resume_hash,
            },
            k=1,
        )

        # Check if this specific job description already exists
        existing_job = vector_store.similarity_search(
            query="",
            filter={
                "user_id": id,
                "document_type": "job_description",
                "content_hash": job_hash,
            },
            k=1,
        )

        # Split text into manageable chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800, chunk_overlap=100, separators=["\n\n", "\n", ".", " "]
        )

        documents = []

        # Add resume chunks if not already exists
        if not existing_resume:
            resume_chunks = text_splitter.split_text(resume_text)
            for i, chunk in enumerate(resume_chunks):
                doc = Document(
                    metadata={
                        "source": file_name,
                        "chunk_index": i,
                        "user_id": id,
                        "document_type": "resume",
                        "content_hash": resume_hash,
                    },
                    page_content=chunk,
                )
                documents.append(doc)
        else:
            print(f"Resume with hash {resume_hash} already exists for user {id}")

        # Add job description chunks if not already exists
        if not existing_job:
            job_description_chunks = text_splitter.split_text(job_description)
            for i, chunk in enumerate(job_description_chunks):
                doc = Document(
                    metadata={
                        "source": "job_description",
                        "chunk_index": i,
                        "user_id": id,
                        "document_type": "job_description",
                        "content_hash": job_hash,
                    },
                    page_content=chunk,
                )
                documents.append(doc)
        else:
            print(f"Job description with hash {job_hash} already exists for user {id}")

        # Add documents to vector store if any new ones were created
        if documents:
            vector_store.add_documents(documents)
        else:
            print(f"No new documents to add for user {id}")

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500, detail=f"Failed to add to vector store: {str(e)}"
        )


async def get_analysis_by_hashes(
    user_id: str, resume_hash: str, jd_hash: str
) -> Optional[ResumeAnalysis]:
    """Get existing analysis by resume and job description hashes"""
    try:
        return await ResumeAnalysis.find_one(
            ResumeAnalysis.user_id == user_id,
            ResumeAnalysis.resume_hash == resume_hash,
            ResumeAnalysis.jd_hash == jd_hash,
        )
    except Exception as e:
        logger.error(f"Error getting analysis by hashes: {e}")
        return None

async def get_user_analyses_from_db(user_id:str,limit:int,offset:int):
    """Get all analyses for a user with pagination"""
    try:
        return await ResumeAnalysis.find(
            ResumeAnalysis.user_id == user_id,
            projection_model=QueryResumeAnalysis
        ).sort(-ResumeAnalysis.created_at).skip(offset).limit(limit).to_list()
    except Exception as e:
        logger.error(f"Error getting user analyses: {e}")
        return []

async def get_user_by_clerk_id(clerk_user_id: str) -> Optional[User]:
    """Get user by Clerk user ID"""
    try:
        return await User.find_one(User.clerk_user_id == clerk_user_id)
    except Exception as e:
        logger.error(f"Error getting user by clerk_id: {e}")
        return None


async def create_user(user_data: UserCreate) -> User:
    """Create a new user"""
    try:
        user = User(**user_data.dict())
        await user.insert()
        return user

    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return None


async def update_user(clerk_user_id: str, user_data: UserUpdate) -> Optional[User]:
    """Update user information"""
    try:
        user = await User.find_one(User.clerk_user_id == clerk_user_id)
        if not user:
            return None

        update_dict = {k: v for k, v in user_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()

        await user.update({"$set": update_dict})
        return await User.find_one(User.clerk_user_id == clerk_user_id)

    except Exception as e:
        logger.error(f"Error updating user: {e}")
        return None


async def delete_user(clerk_user_id: str) -> bool:
    """Delete user and all associated data"""
    try:
        # Delete user's analysis records first
        await ResumeAnalysis.find(ResumeAnalysis.user_id == clerk_user_id).delete()

        # Delete user
        user = await User.find_one(User.clerk_user_id == clerk_user_id)
        if user:
            await user.delete()
            return True
        return False

    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        return False

async def get_chat_history_for_rag(user_id: str, resume_hash: str, jd_hash: str) -> list:
    """Get chat history and format it for the RAG chain."""
    try:
        messages = await ChatMessage.find(
            ChatMessage.user_id == user_id,
            ChatMessage.resume_hash == resume_hash,
            ChatMessage.jd_hash == jd_hash
        ).sort(ChatMessage.created_at).limit(20).to_list()

        history = []
        for msg in messages:
            if msg.role == 'user':
                history.append(HumanMessage(content=msg.message))
            elif msg.role == 'assistant':
                history.append(AIMessage(content=msg.message))
        return history
    except Exception as e:
        logger.error(f"Error getting chat history for RAG: {e}")
        return []

async def get_chat_history_for_user(user_id: str, resume_hash: str, jd_hash: str) -> list:
    """Get chat history and format it for the user interface."""
    try:
        messages = await ChatMessage.find(
            ChatMessage.user_id == user_id,
            ChatMessage.resume_hash == resume_hash,
            ChatMessage.jd_hash == jd_hash
        ).sort(ChatMessage.created_at).limit(20).to_list()

        return messages 
    except Exception as e:
        logger.error(f"Error getting chat history for RAG: {e}")
        return []



async def download_file_from_url(file_url: str, filename: str = None) -> UploadFile:
    """
    Download a file from a URL and return an UploadFile object that can be used with extract_text_from_pdf.
    
    Args:
        file_url (str): The URL to download the file from
        filename (str, optional): The filename to use. If not provided, extracts from URL
    
    Returns:
        UploadFile: An UploadFile object containing the downloaded file content
    
    Raises:
        HTTPException: If download fails or file is not accessible
    """
    try:
        # Extract filename from URL if not provided
        if not filename:
            filename = file_url.split('/')[-1] if '/' in file_url else "downloaded_file.pdf"
            if not filename.endswith('.pdf'):
                filename += '.pdf'
        
        # Download the file
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(file_url)
            response.raise_for_status()

            
            # Create a BytesIO object from the downloaded content
            file_content = BytesIO(response.content)
            
            # Create an UploadFile object (without content_type parameter)
            upload_file = UploadFile(
                filename=filename,
                file=file_content,
                size=len(response.content)
            )
            
            # Reset file pointer to beginning for reading
            file_content.seek(0)
            
            return upload_file
            
    except httpx.RequestError as e:
        logger.error(f"Network error downloading file from {file_url}: {e}")
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to download file from URL: Network error - {str(e)}"
        )
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error downloading file from {file_url}: {e}")
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to download file from URL: HTTP {e.response.status_code} - {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error downloading file from {file_url}: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to download file from URL: {str(e)}"
        )

