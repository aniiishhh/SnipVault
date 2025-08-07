import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import get_db, Base
from models import User, Snippet, Tag
from auth import create_access_token, get_password_hash

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override the database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override the database dependency
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture
def db_session():
    """Database session fixture"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    # Check if user already exists
    existing_user = db_session.query(User).filter(User.username == "testuser").first()
    if existing_user:
        return existing_user

    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_user_token(test_user):
    """Create a JWT token for the test user"""
    return create_access_token(data={"sub": test_user.username})


@pytest.fixture
def test_snippet(db_session, test_user):
    """Create a test snippet"""
    snippet = Snippet(
        title="Test Snippet",
        code="print('Hello, World!')",
        language="python",
        description="A test snippet",
        is_public=False,
        user_id=test_user.id,
    )
    db_session.add(snippet)
    db_session.commit()
    db_session.refresh(snippet)
    return snippet


@pytest.fixture
def test_public_snippet(db_session, test_user):
    """Create a test public snippet"""
    snippet = Snippet(
        title="Public Test Snippet",
        code="console.log('Hello, World!')",
        language="javascript",
        description="A public test snippet",
        is_public=True,
        user_id=test_user.id,
    )
    db_session.add(snippet)
    db_session.commit()
    db_session.refresh(snippet)
    return snippet


@pytest.fixture
def test_tag(db_session):
    """Create a test tag"""
    # Check if tag already exists
    existing_tag = db_session.query(Tag).filter(Tag.name == "python").first()
    if existing_tag:
        return existing_tag

    tag = Tag(name="python")
    db_session.add(tag)
    db_session.commit()
    db_session.refresh(tag)
    return tag
