from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Authentication schemas
class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Tag schemas
class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Tag name")

    @validator("name")
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Tag name cannot be empty")
        if len(v.strip()) > 50:
            raise ValueError("Tag name cannot exceed 50 characters")
        return v.strip()


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Snippet schemas
class SnippetBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Snippet title")
    code: str = Field(..., min_length=1, description="Snippet code")
    language: str = Field(
        ..., min_length=1, max_length=50, description="Programming language"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Snippet description"
    )
    is_public: bool = False

    @validator("title")
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

    @validator("code")
    def validate_code(cls, v):
        if not v or not v.strip():
            raise ValueError("Code cannot be empty")
        return v.strip()

    @validator("language")
    def validate_language(cls, v):
        if not v or not v.strip():
            raise ValueError("Language cannot be empty")
        return v.strip()


class SnippetCreate(SnippetBase):
    tags: Optional[List[str]] = []


class SnippetUpdate(BaseModel):
    title: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = []


class SnippetResponse(SnippetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True
