import hashlib
from fastapi import  Form, Request, HTTPException ,APIRouter
from fastapi.responses import JSONResponse
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from ..shared_resources import get_app_resources
from ..vector_store import get_vector_store
from ..utils import *
from ..models.resume import ResumeAnalysis

load_dotenv()

curr_dir = os.path.dirname(__file__)

# Load prompts once at module level
with open(os.path.join(curr_dir, "prompt.txt"), "r") as f:
    prompt = f.read()

with open(os.path.join(curr_dir, "system_prompt.txt"), "r") as f:
    system_prompt = f.read()

messages = [
    SystemMessage(system_prompt.strip()),
]

router = APIRouter(
    prefix="/analysis",
)


@router.post("/analyze-resume")
async def analyze_resume(
    request: Request,
    job_description: str = Form(...),
    file_url: str = Form(...),
    file_name: str = Form(...),
):
    try:        # Get LLM and vector store from app state
        _, vector_store = get_app_resources(request)
        
        # Create model for compatibility
        model = init_chat_model("gemini-2.0-flash", model_provider="google_genai")
        
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
        
        analysis_record = ResumeAnalysis(
            user_id=user_id,
            resume_hash=resume_hash,
            jd_hash=jd_hash,
            analysis_result=analysis,
            resume_filename=file_name,  # Use the original filename or default to "resume.pdf"
            job_description=job_description,
            file_path=file_url,  # Store the UploadThing file URL
            resume_text=resume_text,
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

@router.post("/set-score")
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
    

@router.post("/get-analysis")
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

