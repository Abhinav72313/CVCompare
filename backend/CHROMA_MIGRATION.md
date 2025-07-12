# Vector Store Migration: AstraDB to ChromaDB

This document describes the migration from AstraDB to ChromaDB for the ResumeFitter application.

## Changes Made

### 1. Dependencies Updated

**Before (requirements.txt):**
```
langchain-astradb==0.6
```

**After (requirements.txt):**
```
langchain-chroma==0.1.4
chromadb==0.5.23
```

### 2. Vector Store Implementation

**File:** `backend/app/vector_store.py`

- **Before:** Used AstraDBVectorStore with API endpoint and token authentication
- **After:** Uses Chroma with local persistent storage in `backend/data/` directory

### 3. Filter Syntax Changes

ChromaDB uses a different filter syntax compared to AstraDB:

**Before (AstraDB format):**
```python
filter={
    "user_id": user_id,
    "document_type": "resume",
    "content_hash": resume_hash
}
```

**After (ChromaDB format):**
```python
where={
    "$and": [
        {"user_id": {"$eq": user_id}},
        {"document_type": {"$eq": "resume"}},
        {"content_hash": {"$eq": resume_hash}}
    ]
}
```

### 4. Files Modified

1. `backend/requirements.txt` - Updated dependencies
2. `backend/app/vector_store.py` - Changed from AstraDB to ChromaDB
3. `backend/app/utils.py` - Updated filter syntax in `add_to_vector_store()`
4. `backend/app/rag.py` - Updated filter syntax in `get_rag_chain()`
5. `backend/.gitignore` - Added `data/` directory to ignore vector store data

### 5. New Directory Structure

```
backend/
├── data/                    # ChromaDB persistent storage (ignored by git)
│   ├── chroma.sqlite3      # ChromaDB database file
│   └── ...                 # Other ChromaDB files
```

## Environment Variables

### No Longer Needed
- `ASTRA_DB_API_ENDPOINT`
- `ASTRA_DB_APPLICATION_TOKEN`

ChromaDB uses local file storage, so no external database credentials are required.

## Installation

1. Install new dependencies:
```bash
pip install -r requirements.txt
```

2. The `data/` directory will be created automatically when the vector store is first initialized.

## Testing

Run the test script to verify the migration:

```bash
python test_chroma.py
```

## Benefits of ChromaDB

1. **No External Dependencies:** No need for cloud database setup or API keys
2. **Local Development:** Easier local development and testing
3. **Cost Effective:** No usage-based pricing for vector operations
4. **Persistent Storage:** Data persists between application restarts
5. **Performance:** Fast local operations without network latency

## Considerations

1. **Backup:** The `data/` directory should be backed up separately if needed
2. **Scaling:** For high-scale deployments, consider using ChromaDB server mode
3. **Concurrent Access:** ChromaDB file-based storage may have limitations with multiple processes

## Migration Notes

- All existing functionality remains the same from the application perspective
- The filter syntax change is handled internally
- No changes required to API endpoints or client code
- Vector embeddings will be rebuilt as users upload new resumes
