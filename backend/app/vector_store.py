import os
from langchain_astradb import AstraDBVectorStore
from langchain_huggingface import HuggingFaceEmbeddings


def get_vector_store():

    embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-en-v1.5")

    endpoint = os.getenv("ASTRA_DB_API_ENDPOINT")
    
    if not endpoint:
        raise Exception("Astra DB API endpoint is not defined")

    token = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
    if not token:
        raise Exception("Astra DB application token is not defined")

    return AstraDBVectorStore(
        embedding=embeddings,
        api_endpoint=endpoint,
        token=token,
        collection_name="resumes",
    )
