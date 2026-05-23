from typing import List, Dict, Any
from langchain.schema import Document
from langchain.prompts import ChatPromptTemplate
from app.rag.vector_store import similarity_search
from app.rag.embeddings import get_llm

RAG_PROMPT = ChatPromptTemplate.from_template("""
You are a helpful AI assistant for an enterprise knowledge base that includes documents and code repositories.
Answer the user's question based ONLY on the provided context.

When answering about code:
- Explain the file structure, components, and their relationships
- Describe what the code does and how it works
- Reference specific files and functions when relevant
- Be detailed and technical when appropriate

If the answer is not found in the context, say "I couldn't find relevant information in the project documents."
Do NOT use any external knowledge beyond what is provided.

Context:
{context}

Question: {question}

Answer:
""")


async def run_rag_query(project_id: int, question: str) -> Dict[str, Any]:
    """
    Run the full RAG pipeline for a specific project.
    ISOLATION: Only retrieves from collection_project_{project_id}.
    """
    # Step 1: Retrieve relevant chunks from THIS project only (increased to 8 for better context)
    results = similarity_search(project_id=project_id, query=question, k=8)

    if not results:
        return {
            "answer": "I couldn't find any relevant documents in this project. Please upload documents first.",
            "sources": [],
        }

    # Step 2: Build context from retrieved chunks
    context_parts = []
    sources = []
    seen_sources = set()

    for doc, score in results:
        if score < 0.05:  # Lower threshold for code files (was 0.1)
            continue
        context_parts.append(doc.page_content)
        source_name = doc.metadata.get("source", doc.metadata.get("filename", "Unknown"))
        page = doc.metadata.get("page", doc.metadata.get("chunk_index", 1))
        source_key = f"{source_name}_{page}"
        if source_key not in seen_sources:
            seen_sources.add(source_key)
            sources.append({
                "document": source_name,
                "page": page,
                "content": doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content,
                "relevance_score": round(score, 3),
            })

    if not context_parts:
        return {
            "answer": "The retrieved documents don't seem relevant enough to answer your question. Try rephrasing.",
            "sources": [],
        }

    context = "\n\n---\n\n".join(context_parts)

    # Step 3: Generate answer using LLM
    llm = get_llm()
    prompt = RAG_PROMPT.format_messages(context=context, question=question)
    response = await llm.ainvoke(prompt)

    return {
        "answer": response.content,
        "sources": sources,
    }
