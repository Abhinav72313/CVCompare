import os
import hashlib
from fastapi import FastAPI, File, Request, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import AIMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage
from utils import *
from vector_store import get_vector_store 
from rag import get_rag_chain

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")


if not api_key:
    raise Exception("API key not defined")


app = FastAPI(title="Resume Fitter API", version="1.0.0")


with open("../prompt.txt", "r") as f:
    prompt = f.read()

with open("../system_prompt.txt", "r") as f:
    system_prompt = f.read()


model = init_chat_model("gemini-2.0-flash", model_provider="google_genai")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
)


messages = [
    SystemMessage(system_prompt.strip()),
]

vector_store = get_vector_store()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

user_chains = {}


@app.get("/")
async def root():
    return {"message": "Resume Fitter API is running"}

@app.post("/chat")
async def query(request:Request):

    try:
        data = await request.json()

        print(data)
        if "message" not in data:
            raise HTTPException(status_code=400, detail="Query must include 'message' field")
        
        if "user_id" not in data:
            raise HTTPException(status_code=400, detail="Query must include 'user_id' field")
        
        if "resume_hash" not in data:
            raise HTTPException(status_code=400, detail="Query must include 'resume_hash' field")

        if "jd_hash" not in data:
            raise HTTPException(status_code=400, detail="Query must include 'jd_hash' field")
        
        resume_hash = data["resume_hash"]
        jd_hash = data["jd_hash"]
        user_id = data["user_id"]
        
        session_key = f"{user_id}_{resume_hash}_{jd_hash}"
        
        if session_key not in user_chains:
            user_chains[session_key] = {
                'chain': get_rag_chain(llm, vector_store, user_id, resume_hash, jd_hash),
                'chat_history': []
            }

        chain = user_chains[session_key]['chain']
        chat_history = user_chains[session_key]['chat_history']

        response = chain.invoke({
            "input": data["message"],
            "chat_history": chat_history,
        })

        chat_history.extend(
            [
                HumanMessage(content=data["message"]),
                AIMessage(content=response["answer"])
            ]
        )

        user_chains[session_key]['chat_history'] = chat_history

        return {"response": response["answer"]}
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/analyze-resume")
async def analyze_resume(
    session_id:str = Form(...) ,resume: UploadFile = File(...), job_description: str = Form(...)
):

    try:
        # Validate file type
        allowed_types = ["application/pdf"]

        if resume.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload PDF files only.",
            )

        # Validate job description
        if not job_description.strip():
            raise HTTPException(
                status_code=400, detail="Job description cannot be empty."
            )

        # Validate session ID
        if not session_id.strip():
            raise HTTPException(
                status_code=400, detail="Session ID cannot be empty."
            )

        # Extract text from the uploaded PDF
        resume_text = await extract_text_from_pdf(resume)
        
        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. Please ensure the PDF contains readable text.",
            )



        # Analyze resume with actual content
        analysis = get_analysis(job_description, resume_text,messages,prompt,model)
        resume_hash = hashlib.md5(resume_text.encode()).hexdigest()
        jd_hash = hashlib.md5(job_description.encode()).hexdigest()

        add_to_vector_store(session_id,resume.filename,vector_store, resume_text, job_description,resume_hash, jd_hash)
        
        return {
            "analysis": analysis,
            "resume_hash": resume_hash,
            "jd_hash": jd_hash,
        } 

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
