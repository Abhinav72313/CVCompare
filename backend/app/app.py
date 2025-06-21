import os
import hashlib
from fastapi import FastAPI, File, Request, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langchain_core.messages import AIMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage
from utils import *
from vector_store import get_vector_store
from rag import get_rag_chain
from database import mongodb
from webhooks import webhook_router
from models import ResumeAnalysis
from contextlib import asynccontextmanager
from middleware import auth_middleware
from uploadthing_py.utapi import *

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise Exception("API key not defined")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await mongodb.connect_to_mongo()
    yield
    # Shutdown
    await mongodb.close_mongo_connection()


app = FastAPI(title="CVCompare API", version="1.0.0", lifespan=lifespan)


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
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.56.1:3000",
        "http://127.0.0.1:3000",
        "https://api.clerk.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add auth Middleware
app.middleware("http")(auth_middleware)

# Include webhook router
app.include_router(webhook_router)

user_chains = {}


@app.get("/")
async def root(request: Request):
    return {"message": "CVCompare API is running"}


@app.get("/chat/history")
async def get_chat_history(request: Request, resume_hash: str, jd_hash: str):
    try:
        user_id = request.state._state.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=401, detail="Unauthorized: User not authenticated"
            )

        chat_history = await get_chat_history_for_user(user_id, resume_hash, jd_hash)

        return {"chat_history": chat_history}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/chat")
async def query(request: Request):

    try:
        data = await request.json()

        if "message" not in data:
            raise HTTPException(
                status_code=400, detail="Query must include 'message' field"
            )

        if "resume_hash" not in data:
            raise HTTPException(
                status_code=400, detail="Query must include 'resume_hash' field"
            )

        if "jd_hash" not in data:
            raise HTTPException(
                status_code=400, detail="Query must include 'jd_hash' field"
            )

        resume_hash = data["resume_hash"]
        jd_hash = data["jd_hash"]
        user_id = request.state._state.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=401, detail="Unauthorized: User not authenticated"
            )

        session_key = f"{user_id}_{resume_hash}_{jd_hash}"

        if session_key not in user_chains:
            user_chains[session_key] = {
                "chain": get_rag_chain(
                    llm, vector_store, user_id, resume_hash, jd_hash
                ),
                "chat_history": await get_chat_history_for_rag(
                    user_id, resume_hash, jd_hash
                ),
            }

            if len(user_chains) > 30:
                user_chains.popitem()

        chain = user_chains[session_key]["chain"]
        chat_history = user_chains[session_key]["chat_history"]

        response = chain.invoke(
            {
                "input": data["message"],
                "chat_history": chat_history,
            }
        )

        currUserMsg = ChatMessage(
            user_id=user_id,
            resume_hash=resume_hash,
            jd_hash=jd_hash,
            message=data["message"],
            role="user",
        )

        currAssistantMsg = ChatMessage(
            user_id=user_id,
            resume_hash=resume_hash,
            jd_hash=jd_hash,
            message=response["answer"],
            role="assistant",
        )

        await currUserMsg.insert()
        await currAssistantMsg.insert()

        chat_history.extend(
            [
                HumanMessage(content=data["message"]),
                AIMessage(content=response["answer"]),
            ]
        )

        if len(chat_history) > 20:
            chat_history.pop(0)

        user_chains[session_key]["chat_history"] = chat_history

        return {"response": response["answer"]}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/analyze-resume")
async def analyze_resume(
    request: Request,
    job_description: str = Form(...),
    file_url: str = Form(...),
    file_name: str = Form(...),
):
    try:
        user_id = request.state._state.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=401, detail="Unauthorized: User not authenticated"
            )

        # Validate that we have either a file or file_url
        if not file_url:
            raise HTTPException(status_code=400, detail="file_url must be provided.")

        # Validate job description
        if not job_description.strip():
            raise HTTPException(
                status_code=400, detail="Job description cannot be empty."
            )
        if not file_name:
            raise HTTPException(
                status_code=400, detail="File name must be provided."
            )

        actual_resume = await download_file_from_url(file_url)

        # Extract text from the PDF
        resume_text = await extract_text_from_pdf(actual_resume)

        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. Please ensure the PDF contains readable text.",
            )

        # Generate hashes
        resume_hash = hashlib.md5(resume_text.encode()).hexdigest()
        jd_hash = hashlib.md5(
            job_description.encode()
        ).hexdigest()  # Check if analysis already exists

        existing_analysis = await get_analysis_by_hashes(user_id, resume_hash, jd_hash)

        if existing_analysis:
            # Return cached analysis
            return {"resume_hash": resume_hash, "jd_hash": jd_hash, "cached": True}

        # Analyze resume with actual content
        analysis = get_analysis(
            job_description, resume_text, messages, prompt, model
        )  # Save analysis to database
        
        print(file_name)
        analysis_record = ResumeAnalysis(
            user_id=user_id,
            resume_hash=resume_hash,
            jd_hash=jd_hash,
            analysis_result=analysis,
            resume_filename=file_name,  # Use the original filename or default to "resume.pdf"
            job_description=job_description,
            file_path=file_url,  # Store the UploadThing file URL
        )

        await analysis_record.insert()

        # Add to vector store (keeping existing functionality)
        add_to_vector_store(
            user_id,
            actual_resume.filename,
            vector_store,
            resume_text,
            job_description,
            resume_hash,
            jd_hash,
        )

        return {"resume_hash": resume_hash, "jd_hash": jd_hash, "cached": False}

    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500, content={"error": str(e), "success": False}
        )

@app.post("/set-score")
async def set_score_and_weights(request: Request):
    try:
        data = await request.json()

        if "resume_hash" not in data or "jd_hash" not in data or "score" not in data or "weights" not in data:
            raise HTTPException(
                status_code=400,
                detail="Request must include 'resume_hash', 'jd_hash', 'score', and 'weights' fields",
            )

        resume_hash = data["resume_hash"]
        jd_hash = data["jd_hash"]
        score = float(data["score"])
        weights = json.loads(data["weights"])

        user_id = request.state._state.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=401, detail="Unauthorized: User not authenticated"
            )

        analysis = await get_analysis_by_hashes(user_id, resume_hash, jd_hash)

        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        analysis.ats_score = score
        analysis.weights = weights
        await analysis.save()

        return {"message": "Score updated successfully"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    

@app.post("/get-analysis")
async def get_user_analysis(request: Request):
    try:

        if request.state._state.get("user_id") is None:
            raise HTTPException(
                status_code=401, detail="Unauthorized: User not authenticated"
            )

        user_id = request.state._state.get("user_id")
        data = await request.json()
        resume_hash = data.get("resume_hash")
        jd_hash = data.get("jd_hash")

        if not resume_hash or not jd_hash:
            raise HTTPException(
                status_code=400,
                detail="Both 'resume_hash' and 'jd_hash' must be provided",
            )

        analysis = await get_analysis_by_hashes(user_id, resume_hash, jd_hash)

        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        return {
            "analysis": analysis.analysis_result,
            "job_description": analysis.job_description,
            "file_path": analysis.file_path,
            "file_name": analysis.resume_filename,
            "weights": analysis.weights,
            "ats_score": analysis.ats_score,
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/user/analyses")
async def get_user_analyses(request: Request, limit: int = 10, offset: int = 0):
    try:
        user_id = request.state._state.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=401, detail="Unauthorized: User not authenticated"
            )

        analyses = await get_user_analyses_from_db(user_id, limit, offset)
        return {"analyses": analyses}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
