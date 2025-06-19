from typing import Dict, Any
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.messages import HumanMessage
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from fastapi import UploadFile, HTTPException
import json
import tempfile
import os

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
    id, file_name, vector_store, resume_text: str, job_description: str,resume_hash: int, job_hash: int
):
    """Add resume and job description to the vector store."""
    try:
       
        # Check if this specific resume already exists
        existing_resume = vector_store.similarity_search(
            query="", 
            filter={"user_id": id, "document_type": "resume", "content_hash": resume_hash},
            k=1
        )
        
        # Check if this specific job description already exists
        existing_job = vector_store.similarity_search(
            query="", 
            filter={"user_id": id, "document_type": "job_description", "content_hash": job_hash},
            k=1
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
                        "content_hash": resume_hash
                    },
                    page_content=chunk
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
                        "content_hash": job_hash
                    },
                    page_content=chunk
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
