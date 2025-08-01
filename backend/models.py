from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# Association table for many-to-many relationship between snippets and tags
snippet_tags = Table(
    "snippet_tags",
    Base.metadata,
    Column("snippet_id", Integer, ForeignKey("snippets.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    snippets = relationship("Snippet", back_populates="user")


class Snippet(Base):
    __tablename__ = "snippets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="snippets")
    tags = relationship("Tag", secondary=snippet_tags, back_populates="snippets")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    snippets = relationship("Snippet", secondary=snippet_tags, back_populates="tags")
