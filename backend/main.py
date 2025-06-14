import os
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from dotenv import load_dotenv
from google import genai
from google.genai.types import GenerateContentConfig
import PyPDF2
import io
import json

load_dotenv()

app = FastAPI(title="Resume Fitter API", version="1.0.0")


api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise Exception("API key not defined")

client = genai.Client(api_key=api_key)

with open("prompt.txt", "r") as f:
    prompt = f.read()

with open("system_prompt.txt", "r") as f:
    system_prompt = f.read()

def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    """Extract text content from uploaded PDF file."""
    try:
        # Read the uploaded file content
        pdf_content = pdf_file.file.read()
        
        # Create a PDF reader object from the bytes
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        
        # Extract text from all pages
        text_content = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_content += page.extract_text() + "\n"
        
        # Reset file pointer for potential future use
        pdf_file.file.seek(0)
        
        return text_content.strip()
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to extract text from PDF: {str(e)}"
        )


# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Resume Fitter API is running"}


@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...), job_description: str = Form(...)
):

    # Validate file type
    allowed_types = ["application/pdf"]

    if resume.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, detail="Invalid file type. Please upload PDF files only."
        )

    # Validate job description
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    # Extract text from the uploaded PDF
    resume_text = extract_text_from_pdf(resume)
    
    if not resume_text.strip():
        raise HTTPException(
            status_code=400, 
            detail="Could not extract text from PDF. Please ensure the PDF contains readable text."
        )

    # Analyze resume with actual content
    analysis = get_analysis(job_description, resume_text)

    return analysis


def get_analysis(job_description: str, resume_text: str) -> Dict[str, Any]:
    """Analyze resume against job description using AI."""
    try:
        # Format the prompt with resume text and job description
        formatted_prompt = (prompt % (resume_text, job_description)).strip()
        
        # Generate analysis using Gemini AI
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=formatted_prompt,
            config=GenerateContentConfig(
                system_instruction=system_prompt.strip()
            )
        )

        result = response.text[7:-4].strip()

        # Parse JSON response
        try:
            
            result = json.loads(result)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500, 
                detail="Failed to parse response from AI model."
            )

        return result
    
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500, 
            detail=f"Analysis failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
