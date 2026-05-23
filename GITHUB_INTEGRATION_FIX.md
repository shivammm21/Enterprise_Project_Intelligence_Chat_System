# GitHub Integration Import Fix

## Issue
The backend was failing to start with the error:
```
ImportError: cannot import name 'DocumentProcessor' from 'app.rag.document_processor'
```

## Root Cause
The `github.py` router was trying to import classes that don't exist:
- `DocumentProcessor` (doesn't exist - only functions available)
- `EmbeddingService` (doesn't exist - use `get_embeddings()` function)
- `VectorStore` (doesn't exist - use `get_vector_store()` function)

## Fix Applied
Updated `backend/app/routers/github.py` to use the correct imports:

**Before:**
```python
from ..rag.document_processor import DocumentProcessor
from ..rag.embeddings import EmbeddingService
from ..rag.vector_store import VectorStore
```

**After:**
```python
from ..rag.document_processor import split_documents
from ..rag.embeddings import get_embeddings
from ..rag.vector_store import get_vector_store, add_documents_to_store
from langchain.schema import Document as LangchainDocument
```

## Changes to Import Logic

1. **Document Processing**: Now uses `split_documents()` function directly with LangChain Document objects
2. **Embeddings**: Removed manual embedding generation - handled by `add_documents_to_store()`
3. **Vector Store**: Uses `add_documents_to_store()` to batch-add all chunks at once (more efficient)

## Result
- Backend now starts successfully
- GitHub integration uses the correct RAG pipeline functions
- More efficient: all chunks are added to vector store in one batch operation
- Returns both `documents_created` and `chunks_created` in the response

## Testing
Run the backend server:
```bash
cd backend
# Activate virtual environment first
uvicorn app.main:app --reload
```

The server should start without import errors.
