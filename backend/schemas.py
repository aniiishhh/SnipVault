from pydantic import BaseModel, EmailStr
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
    name: str


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Snippet schemas
class SnippetBase(BaseModel):
    title: str
    code: str
    language: str
    description: Optional[str] = None
    is_public: bool = False


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
