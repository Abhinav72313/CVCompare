import os
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from .models.user import User
from .models.resume import ResumeAnalysis
from .models.chat import ChatMessage

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database = None

    @classmethod
    async def connect_to_mongo(cls):
        """Create database connection and initialize Beanie"""
        mongodb_uri = os.getenv("MONGODB_URI")
        
        if not mongodb_uri:
            raise ValueError("MONGODB_URI environment variable is required")
        
        try:
            cls.client = AsyncIOMotorClient(mongodb_uri,serverSelectionTimeoutMS=30000)
            
            db_name = 'CVCompare' 
                
            cls.database = cls.client[db_name]
            
            # Test the connection
            await cls.client.admin.command('ping')
            
            # Initialize Beanie with document models
            await init_beanie(
                database=cls.database,
                document_models=[User, ResumeAnalysis,ChatMessage]
            )
            
            print(f"✅ Successfully connected to MongoDB database: {db_name}")
            
        except Exception as e:
            print(f"❌ Error connecting to MongoDB: {e}")
            raise

    @classmethod
    async def close_mongo_connection(cls):
        """Close database connection"""
        if cls.client:
            cls.client.close()
            print("🔌 Disconnected from MongoDB")

    @classmethod
    def get_database(cls):
        """Get database instance"""
        return cls.database

# Initialize MongoDB connection
mongodb = MongoDB()
