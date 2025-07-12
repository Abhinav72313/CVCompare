from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import MessagesPlaceholder
from langchain.schema import BaseRetriever
from langchain.schema import Document
from typing import List, Any
from pydantic import Field

system_prompt = """
You are an expert resume evaluator.

Based on the following resume and job description (provided as context), answer the user's question.

Only use the information available in the context. Do not say things like:
- "I need to see the resume"
- "I need to see the job description"
- "I need to see the context"

Keep your response concise and relevant. Do not answer questions unrelated to the resume or job description.

You MUST only answer questions related to the provided resume and job description. But you should reply to greetings.

DO NOT answer questions unrelated to resumes, jobs, or careers.

Only use the provided context. If the question is unrelated or you don't know the answer, respond with:
> "Sorry, I can only assist with questions related to your resume or the job description."

Context:
{context}
"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)


contextualize_q_system_prompt = (
    "Given a chat history and the latest user question "
    "which might reference context in the chat history, "
    "formulate a standalone question which can be understood "
    "without the chat history. Do NOT answer the question, "
    "just reformulate it if needed and otherwise return it as is."
)

contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)


class CombinedRetriever(BaseRetriever):
    """Custom retriever that combines job description and resume retrievers."""

    jd_retriever: Any = Field(description="Job description retriever")
    resume_retriever: Any = Field(description="Resume retriever")

    def __init__(self, jd_retriever, resume_retriever, **kwargs):
         super().__init__(
            jd_retriever=jd_retriever, resume_retriever=resume_retriever, **kwargs # type: ignore
        )

    def _get_relevant_documents(self, query: str) -> List[Document]:
        """Retrieve relevant documents from both JD and resume sources."""
        jd_docs = self.jd_retriever.invoke(query)
        resume_docs = self.resume_retriever.invoke(query)
        
        return jd_docs + resume_docs

    async def _aget_relevant_documents(self, query: str) -> List[Document]:
        """Async version of get_relevant_documents."""
        jd_docs = await self.jd_retriever.ainvoke(query)
        resume_docs = await self.resume_retriever.ainvoke(query)
        return jd_docs + resume_docs



def get_rag_chain(llm, vector_store, user_id, resume_hash, jd_hash):
    
    jd_retriever = vector_store.as_retriever(
        search_kwargs={
            "k": 3, 
            "where": {
                "$and": [
                    {"user_id": {"$eq": user_id}}, 
                    {"content_hash": {"$eq": jd_hash}}
                ]
            }
        }
    )

    resume_retriever = vector_store.as_retriever(
        search_kwargs={
            "k": 5,
            "where": {
                "$and": [
                    {"user_id": {"$eq": user_id}}, 
                    {"content_hash": {"$eq": resume_hash}}
                ]
            }
        },
    )

    # Combine both retrievers
    retriever = CombinedRetriever(jd_retriever, resume_retriever)

    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_q_prompt
    )

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

    return rag_chain
