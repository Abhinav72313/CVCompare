import os
import uvicorn
from fastapi import FastAPI,  Request    
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from .utils import *
from .vector_store import get_vector_store
from .database import mongodb
from .webhooks import webhook_router
from contextlib import asynccontextmanager
from .router import user,analysis,chat,health
from .middleware.authMiddleware import auth_middleware

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise Exception("API key not defined")

# Global variables for LLM and vector store
llm = None
vector_store = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global llm, vector_store
    
    # Initialize database connection
    await mongodb.connect_to_mongo()
    
    # Initialize LLM and vector store once
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    vector_store = get_vector_store()
    
    # Store in app state for access by other modules
    app.state.llm = llm
    app.state.vector_store = vector_store
    
    yield
    
    # Shutdown
    await mongodb.close_mongo_connection()


allowed_origin = os.getenv("ALLOWED_ORIGIN")

app = FastAPI(title="CVCompare API", version="1.0.0", lifespan=lifespan)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://api.clerk.dev",
        "https://cv-compare.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add auth Middleware
app.middleware("http")(auth_middleware)

# Include webhook router
app.include_router(webhook_router)

@app.get("/")
async def root(request: Request):
    return {"message": "CVCompare API is running"}

app.include_router(user.router)
app.include_router(analysis.router)
app.include_router(chat.router)
app.include_router(health.router)

# Run the application
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "development") != "production",
        log_level=os.getenv("LOG_LEVEL", "info")
    )
