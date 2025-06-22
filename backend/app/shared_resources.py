"""
Shared utilities for accessing application-wide resources like LLM and vector store.
"""
from fastapi import HTTPException, Request


def get_app_resources(request: Request):
    """
    Get LLM and vector store from app state.
    
    Args:
        request: FastAPI request object
        
    Returns:
        tuple: (llm, vector_store)
        
    Raises:
        HTTPException: If resources are not initialized
    """
    llm = getattr(request.app.state, 'llm', None)
    vector_store = getattr(request.app.state, 'vector_store', None)
    
    if llm is None or vector_store is None:
        raise HTTPException(
            status_code=500, 
            detail="Application resources (LLM or vector store) not initialized"
        )
    
    return llm, vector_store


def get_llm(request: Request):
    """
    Get LLM from app state.
    
    Args:
        request: FastAPI request object
        
    Returns:
        LLM instance
        
    Raises:
        HTTPException: If LLM is not initialized
    """
    llm = getattr(request.app.state, 'llm', None)
    
    if llm is None:
        raise HTTPException(
            status_code=500, 
            detail="LLM not initialized"
        )
    
    return llm


def get_vector_store(request: Request):
    """
    Get vector store from app state.
    
    Args:
        request: FastAPI request object
        
    Returns:
        Vector store instance
        
    Raises:
        HTTPException: If vector store is not initialized
    """
    vector_store = getattr(request.app.state, 'vector_store', None)
    
    if vector_store is None:
        raise HTTPException(
            status_code=500, 
            detail="Vector store not initialized"
        )
    
    return vector_store
