from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import requests
import os
import tempfile
import shutil
from pathlib import Path
from ..database import get_db
from ..utils.auth import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.document import Document
from ..rag.document_processor import split_documents
from ..rag.embeddings import get_embeddings
from ..rag.vector_store import get_vector_store, add_documents_to_store
from ..config import settings
from langchain.schema import Document as LangchainDocument
from pydantic import BaseModel

router = APIRouter(prefix="/github", tags=["github"])

class GitHubAuthRequest(BaseModel):
    code: str

class GitHubRepoRequest(BaseModel):
    project_id: int
    repo_full_name: str
    branch: str = "main"

@router.post("/auth")
async def github_auth(
    request: GitHubAuthRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Exchange GitHub OAuth code for access token"""
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub OAuth not configured"
        )
    
    # Exchange code for access token
    response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": request.code
        }
    )
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to authenticate with GitHub"
        )
    
    data = response.json()
    access_token = data.get("access_token")
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No access token received"
        )
    
    # Store token in user metadata
    current_user.github_token = access_token
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return {"message": "GitHub account connected successfully"}

@router.get("/status")
async def github_status(
    current_user: User = Depends(get_current_user)
):
    """Check if GitHub account is connected"""
    is_connected = hasattr(current_user, 'github_token') and current_user.github_token is not None
    return {"connected": is_connected}

@router.get("/repos")
async def list_repos(
    current_user: User = Depends(get_current_user)
):
    """List user's GitHub repositories"""
    if not hasattr(current_user, 'github_token') or not current_user.github_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GitHub account not connected"
        )
    
    response = requests.get(
        "https://api.github.com/user/repos",
        headers={
            "Authorization": f"token {current_user.github_token}",
            "Accept": "application/vnd.github.v3+json"
        },
        params={"per_page": 100, "sort": "updated"}
    )
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to fetch repositories"
        )
    
    repos = response.json()
    return [
        {
            "id": repo["id"],
            "name": repo["name"],
            "full_name": repo["full_name"],
            "description": repo["description"],
            "private": repo["private"],
            "default_branch": repo["default_branch"],
            "updated_at": repo["updated_at"]
        }
        for repo in repos
    ]

@router.post("/import")
async def import_repo(
    request: GitHubRepoRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clone and index a GitHub repository"""
    if not hasattr(current_user, 'github_token') or not current_user.github_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GitHub account not connected"
        )
    
    # Verify project access
    result = await db.execute(select(Project).filter(Project.id == request.project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create temporary directory
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Clone repository
        clone_url = f"https://{current_user.github_token}@github.com/{request.repo_full_name}.git"
        os.system(f"git clone --depth 1 --branch {request.branch} {clone_url} {temp_dir}")
        
        # Process code files
        code_extensions = ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.h', 
                          '.cs', '.go', '.rb', '.php', '.swift', '.kt', '.rs', '.md', '.txt']
        
        documents_created = 0
        all_chunks = []
        
        for root, dirs, files in os.walk(temp_dir):
            # Skip common directories
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'venv', 'dist', 'build']]
            
            for file in files:
                if any(file.endswith(ext) for ext in code_extensions):
                    file_path = Path(root) / file
                    relative_path = file_path.relative_to(temp_dir)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        
                        # Skip empty files
                        if not content.strip():
                            continue
                        
                        # Create LangChain document with rich metadata
                        langchain_doc = LangchainDocument(
                            page_content=content,
                            metadata={
                                "source": f"{request.repo_full_name}/{relative_path}",
                                "filename": str(relative_path),
                                "repo": request.repo_full_name,
                                "file_type": "code",
                                "extension": file_path.suffix
                            }
                        )
                        
                        # Split into larger chunks for code (2000 chars with 400 overlap)
                        chunks = split_documents([langchain_doc], chunk_size=2000, chunk_overlap=400)
                        
                        # Add file header to each chunk for context
                        for i, chunk in enumerate(chunks):
                            chunk.metadata["chunk_index"] = i
                            chunk.metadata["total_chunks"] = len(chunks)
                            # Prepend file info to chunk content for better context
                            chunk.page_content = f"File: {relative_path}\n\n{chunk.page_content}"
                        
                        all_chunks.extend(chunks)
                        
                        # Create document record
                        doc = Document(
                            project_id=project.id,
                            filename=f"{request.repo_full_name}/{relative_path}",
                            filepath=str(relative_path),
                            file_type="code",
                            file_size=len(content),
                            chunk_count=len(chunks)
                        )
                        db.add(doc)
                        documents_created += 1
                        
                    except Exception as e:
                        print(f"Error processing {file_path}: {e}")
                        continue
        
        # Add all chunks to vector store at once
        if all_chunks:
            add_documents_to_store(project.id, all_chunks)
        
        await db.commit()
        
        return {
            "message": f"Repository imported successfully",
            "documents_created": documents_created,
            "chunks_created": len(all_chunks),
            "repo": request.repo_full_name
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import repository: {str(e)}"
        )
    finally:
        # Cleanup - handle Windows file locks
        if os.path.exists(temp_dir):
            try:
                # On Windows, git files can be locked, so we need to handle this
                def handle_remove_readonly(func, path, exc):
                    """Error handler for Windows readonly files"""
                    import stat
                    if not os.access(path, os.W_OK):
                        os.chmod(path, stat.S_IWUSR)
                        func(path)
                    else:
                        raise
                
                shutil.rmtree(temp_dir, onerror=handle_remove_readonly)
            except Exception as e:
                print(f"Warning: Could not remove temp directory {temp_dir}: {e}")

@router.delete("/disconnect")
async def disconnect_github(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Disconnect GitHub account"""
    current_user.github_token = None
    db.add(current_user)
    await db.commit()
    return {"message": "GitHub account disconnected"}
