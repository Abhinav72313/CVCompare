import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


def get_vector_store():
    """
    Initialize and return a ChromaDB vector store with persistent storage.
    
    Returns:
        Chroma: ChromaDB vector store instance
    """
    embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-en-v1.5")

    # Get the backend directory path
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    persist_directory = os.path.join(backend_dir, "data")
    
    # Ensure the data directory exists
    os.makedirs(persist_directory, exist_ok=True)

    return Chroma(
        embedding_function=embeddings,
        persist_directory=persist_directory,
        collection_name="resumes",
    )

