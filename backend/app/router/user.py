from fastapi import APIRouter, HTTPException, Request

from ..utils import get_user_analyses_from_db

router = APIRouter(
    prefix="/user",
    tags=["user"],
)



@router.get("/analyses")
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
