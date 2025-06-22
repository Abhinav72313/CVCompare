import os
from fastapi import APIRouter, Request, Response,status
from .models.user import UserCreate, UserUpdate
import json
import logging
from svix.webhooks import Webhook
from dotenv import load_dotenv
from .utils import get_user_by_clerk_id,create_user,update_user,delete_user

load_dotenv()

secret = os.getenv("CLERK_WEBHOOK_SIGNING_SECRET")

logger = logging.getLogger(__name__)

webhook_router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@webhook_router.post("/clerk",status_code=status.HTTP_204_NO_CONTENT)
async def handle_clerk_webhook(request: Request,response:Response):
    """Handle Clerk webhooks for user events"""

    headers = request.headers

    try:
        # Get the raw body
        body = await request.body()
        wh = Webhook(secret)
        
        payload = wh.verify(body, headers)

        payload = json.loads(body.decode('utf-8'))
        
        event_type = payload.get("type")
        user_data = payload.get("data", {})
        
        logger.info(f"Received Clerk webhook: {event_type}")
        
        if event_type == "user.created":
            # Create user in our database
            user_create = UserCreate(
                clerk_user_id=user_data.get("id"),
                email=user_data.get("email_addresses", [{}])[0].get("email_address", ""),
                first_name=user_data.get("first_name"),
                last_name=user_data.get("last_name"),
                profile_image_url=user_data.get("profile_image_url")
            )
            
            # Check if user already exists
            existing_user = await get_user_by_clerk_id(user_create.clerk_user_id)
            if not existing_user:
                await create_user(user_create)
                logger.info(f"Created user: {user_create.email}")
            else:
                logger.info(f"User already exists: {user_create.email}")
                
        elif event_type == "user.updated":
            # Update user in our database
            clerk_user_id = user_data.get("id")
            if clerk_user_id:
                user_update = UserUpdate(
                    email=user_data.get("email_addresses", [{}])[0].get("email_address"),
                    first_name=user_data.get("first_name"),
                    last_name=user_data.get("last_name"),
                    profile_image_url=user_data.get("profile_image_url")
                )
                
                await update_user(clerk_user_id, user_update)
                logger.info(f"Updated user: {clerk_user_id}")
                
        elif event_type == "user.deleted":
            # Delete user from our database
            clerk_user_id = user_data.get("id")
            if clerk_user_id:
                await delete_user(clerk_user_id)
                logger.info(f"Deleted user: {clerk_user_id}")
        
        
        
    except Exception as e:
        logger.error(f"Error handling Clerk webhook: {e}")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return
