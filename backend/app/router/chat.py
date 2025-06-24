from fastapi import APIRouter, HTTPException, Request
from ..models.chat import ChatMessage
from ..rag import get_rag_chain,prompt
from ..utils import get_chat_history_for_rag, get_chat_history_for_user,get_analysis_by_hashes
from ..shared_resources import get_app_resources

from langchain_core.messages import AIMessage, HumanMessage

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

user_chains = {}

def should_use_vector(query: str) -> bool:
    # Naive logic: use vector for specific/narrow queries
    keywords = ["when", "where", "what did", "which", "skills", "experience", "worked at"]
    return any(kw in query.lower() for kw in keywords)


@router.get("/history")
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


@router.post("/message")
async def query(request: Request):

    try:        # Get LLM and vector store from app state
        llm, vector_store = get_app_resources(request)
        
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

        query = data["message"]
        chat_history = user_chains[session_key]["chat_history"]

        if should_use_vector(query):
            # Use vector-based RAG chain 
            chain = user_chains[session_key]["chain"]

            response = chain.invoke({
                "input": query,
                "chat_history": chat_history,
            })

            model_response = response["answer"]

        else:
            doc = await get_analysis_by_hashes(user_id, resume_hash, jd_hash)
            if not doc:
                raise HTTPException(status_code=404, detail="Analysis not found")

            resume = doc.resume_text
            jd = doc.job_description

            context = f"Your are an expert resume evaluator. Keep Your answers concise. Resume:\n{resume}\n\nJob Description:\n{jd}"

            result = await (prompt | llm).ainvoke({
                "input": query,
                "context": context,
                "chat_history": chat_history,
            })

            model_response = result.content if hasattr(result, "content") else str(result)

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
            message=model_response,
            role="assistant",
        )

        await currUserMsg.insert()
        await currAssistantMsg.insert()

        chat_history.extend(
            [
                HumanMessage(content=data["message"]),
                AIMessage(content=model_response),
            ]
        )

        if len(chat_history) > 20:
            chat_history.pop(0)

        user_chains[session_key]["chat_history"] = chat_history

        return {"response": model_response}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/clear")
async def clear_chat(request:Request):
    try:
    
        user_id = request.state._state.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=401, detail="Unauthorized: User not authenticated"
            )

        data = await request.json()

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

        session_key = f"{user_id}_{resume_hash}_{jd_hash}"

        if session_key in user_chains:
            del user_chains[session_key]

        # Optionally clear chat history from database
        await ChatMessage.find_all(user_id=user_id, resume_hash=resume_hash, jd_hash=jd_hash).delete()
        user_chains[session_key]["chat_history"] = []
        
        return {"message": "Chat cleared successfully"}
    except Exception as e:
        print("Error clearing chat:", e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    