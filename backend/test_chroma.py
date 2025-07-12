#!/usr/bin/env python3
"""
Simple test script to verify ChromaDB integration works.
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.vector_store import get_vector_store

def test_vector_store():
    """Test that we can initialize the vector store."""
    try:
        print("Testing ChromaDB vector store initialization...")
        vector_store = get_vector_store()
        print(f"✓ Vector store initialized successfully")
        print(f"✓ Type: {type(vector_store)}")
        print(f"✓ Collection name: {vector_store._collection.name}")
        print(f"✓ Persist directory: {vector_store._persist_directory}")
        
        # Test basic functionality
        print("\nTesting basic functionality...")
        
        # This should work without errors (even if no documents exist)
        results = vector_store.similarity_search(
            query="test query",
            where={"$and": [{"user_id": {"$eq": "test_user"}}]},
            k=1
        )
        print(f"✓ Similarity search works (found {len(results)} documents)")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_vector_store()
    if success:
        print("\n🎉 All tests passed! ChromaDB integration is working.")
    else:
        print("\n❌ Tests failed. Please check the configuration.")
        sys.exit(1)
