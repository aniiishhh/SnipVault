from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_user_by_username,
    get_user_by_email,
    get_current_user,
)
from schemas import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
    SnippetCreate,
    SnippetUpdate,
    SnippetResponse,
    TagCreate,
)
from models import User, Snippet, Tag
from typing import List

app = FastAPI(
    title="SnipVault API",
    description="A secure code snippet management system",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to SnipVault API! 🧠",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/db-test")
async def test_db(db: Session = Depends(get_db)):
    try:
        # Test database connection
        from sqlalchemy import text

        db.execute(text("SELECT 1"))
        return {"status": "Database connection successful"}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e)}


# Authentication endpoints
@app.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account."""
    # Check if username already exists
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email already exists
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        is_active=True,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# Protected routes
@app.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


# Snippet routes
@app.get("/snippets/", response_model=List[SnippetResponse])
async def get_snippets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get all snippets for the current user."""
    snippets = (
        db.query(Snippet)
        .filter(Snippet.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return snippets


@app.get("/snippets/public/", response_model=List[SnippetResponse])
async def get_public_snippets(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get all public snippets (no authentication required)."""
    snippets = (
        db.query(Snippet)
        .filter(Snippet.is_public == True)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return snippets


@app.get("/snippets/public/{snippet_id}", response_model=SnippetResponse)
async def get_public_snippet(
    snippet_id: int,
    db: Session = Depends(get_db),
):
    """Get a specific public snippet by ID (no authentication required)."""
    snippet = (
        db.query(Snippet)
        .filter(Snippet.id == snippet_id, Snippet.is_public == True)
        .first()
    )
    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Public snippet not found"
        )
    return snippet


@app.post("/snippets/", response_model=SnippetResponse)
async def create_snippet(
    snippet_data: SnippetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new snippet for the current user."""
    # Create the snippet
    db_snippet = Snippet(
        title=snippet_data.title,
        code=snippet_data.code,
        language=snippet_data.language,
        description=snippet_data.description,
        is_public=snippet_data.is_public,
        user_id=current_user.id,
    )

    # Handle tags
    if snippet_data.tags:
        for tag_name in snippet_data.tags:
            # Check if tag exists, create if not
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.flush()  # Flush to get the tag ID
            db_snippet.tags.append(tag)

    db.add(db_snippet)
    db.commit()
    db.refresh(db_snippet)
    return db_snippet


@app.get("/snippets/{snippet_id}", response_model=SnippetResponse)
async def get_snippet(
    snippet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific snippet by ID (only if owned by current user)."""
    snippet = (
        db.query(Snippet)
        .filter(Snippet.id == snippet_id, Snippet.user_id == current_user.id)
        .first()
    )
    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )
    return snippet


@app.put("/snippets/{snippet_id}", response_model=SnippetResponse)
async def update_snippet(
    snippet_id: int,
    snippet_data: SnippetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a snippet (only if owned by current user)."""
    snippet = (
        db.query(Snippet)
        .filter(Snippet.id == snippet_id, Snippet.user_id == current_user.id)
        .first()
    )
    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )

    # Update fields if provided
    update_data = snippet_data.dict(exclude_unset=True)
    if "tags" in update_data:
        tags = update_data.pop("tags")
        # Clear existing tags
        snippet.tags.clear()
        # Add new tags
        if tags:
            for tag_name in tags:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.flush()
                snippet.tags.append(tag)

    for field, value in update_data.items():
        setattr(snippet, field, value)

    db.commit()
    db.refresh(snippet)
    return snippet


@app.patch("/snippets/{snippet_id}/toggle-public", response_model=SnippetResponse)
async def toggle_snippet_public(
    snippet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle the public status of a snippet (only if owned by current user)."""
    snippet = (
        db.query(Snippet)
        .filter(Snippet.id == snippet_id, Snippet.user_id == current_user.id)
        .first()
    )
    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )

    # Toggle the is_public field
    snippet.is_public = not snippet.is_public
    db.commit()
    db.refresh(snippet)
    return snippet


@app.delete("/snippets/{snippet_id}")
async def delete_snippet(
    snippet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a snippet (only if owned by current user)."""
    snippet = (
        db.query(Snippet)
        .filter(Snippet.id == snippet_id, Snippet.user_id == current_user.id)
        .first()
    )
    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )

    db.delete(snippet)
    db.commit()
    return {"message": "Snippet deleted successfully"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
