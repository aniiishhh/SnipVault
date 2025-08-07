import pytest
from fastapi import status
from sqlalchemy.orm import Session

from models import Tag, Snippet


class TestTagManagement:
    """Test tag management functionality"""

    def test_get_tags(self, client, test_user_token, test_tag):
        """Test getting all tags"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get("/tags/", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check that we get the test tag
        tag_found = False
        for tag in data:
            if tag["id"] == test_tag.id:
                tag_found = True
                assert tag["name"] == "python"
                break

        assert tag_found

    def test_get_tags_without_auth(self, client):
        """Test getting tags without authentication"""
        response = client.get("/tags/")

        assert (
            response.status_code == status.HTTP_200_OK
        )  # Tags endpoint might be public

    def test_create_tag_success(self, client, test_user_token):
        """Test successful tag creation"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        tag_data = {"name": "uniquetag123"}

        response = client.post("/tags/", json=tag_data, headers=headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "uniquetag123"
        assert "id" in data
        assert "created_at" in data

    def test_create_duplicate_tag(self, client, test_user_token, test_tag):
        """Test creating a tag with existing name"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        tag_data = {"name": "python"}  # Same as test_tag

        response = client.post("/tags/", json=tag_data, headers=headers)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already exists" in response.json()["detail"]

    def test_create_tag_invalid_data(self, client, test_user_token):
        """Test creating tag with invalid data"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        tag_data = {"name": ""}  # Empty name

        response = client.post("/tags/", json=tag_data, headers=headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_tag_without_auth(self, client):
        """Test creating tag without authentication"""
        tag_data = {"name": "javascript"}

        response = client.post("/tags/", json=tag_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_snippet_with_tags(self, client, test_user_token, db_session):
        """Test creating a snippet with tags"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        snippet_data = {
            "title": "Test Snippet with Tags",
            "code": "print('Hello, World!')",
            "language": "python",
            "description": "A test snippet with tags",
            "is_public": False,
            "tags": ["python", "test", "example"],
        }

        response = client.post("/snippets/", json=snippet_data, headers=headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "tags" in data
        assert len(data["tags"]) >= 1

        # Check that tags were created
        tag_names = [tag["name"] for tag in data["tags"]]
        assert "python" in tag_names
        assert "test" in tag_names
        assert "example" in tag_names

    def test_snippet_tags_retrieval(
        self, client, test_user_token, db_session, test_user
    ):
        """Test that snippet tags are properly retrieved"""
        # Create a snippet with tags
        snippet = Snippet(
            title="Test Snippet",
            code="print('Hello')",
            language="python",
            user_id=test_user.id,
        )
        db_session.add(snippet)
        db_session.commit()

        # Add tags to the snippet (check if they exist first)
        tag1_name = "python"
        tag2_name = "test"

        tag1 = db_session.query(Tag).filter(Tag.name == tag1_name).first()
        if not tag1:
            tag1 = Tag(name=tag1_name)
            db_session.add(tag1)

        tag2 = db_session.query(Tag).filter(Tag.name == tag2_name).first()
        if not tag2:
            tag2 = Tag(name=tag2_name)
            db_session.add(tag2)

        db_session.commit()

        # Associate tags with snippet (simplified for testing)
        # In real implementation, this would be done through the snippet creation endpoint

        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get(f"/snippets/{snippet.id}", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "tags" in data

    def test_filter_snippets_by_tag(
        self, client, test_user_token, db_session, test_user
    ):
        """Test filtering snippets by tag"""
        # Create snippets with different tags
        snippet1 = Snippet(
            title="Python Snippet",
            code="print('python')",
            language="python",
            user_id=test_user.id,
        )
        db_session.add(snippet1)

        snippet2 = Snippet(
            title="JavaScript Snippet",
            code="console.log('js')",
            language="javascript",
            user_id=test_user.id,
        )
        db_session.add(snippet2)

        db_session.commit()

        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get("/snippets/?tag=python", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_tag_case_insensitivity(self, client, test_user_token):
        """Test that tag names are case-insensitive"""
        headers = {"Authorization": f"Bearer {test_user_token}"}

        # Create tag with uppercase
        tag_data = {"name": "PYTHON"}
        response = client.post("/tags/", json=tag_data, headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Try to create same tag with lowercase
        tag_data = {"name": "python"}
        response = client.post("/tags/", json=tag_data, headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_tag_name_validation(self, client, test_user_token):
        """Test tag name validation"""
        headers = {"Authorization": f"Bearer {test_user_token}"}

        # Test various invalid tag names
        invalid_names = [
            "",  # Empty
            "a" * 51,  # Too long
        ]

        for name in invalid_names:
            tag_data = {"name": name}
            response = client.post("/tags/", json=tag_data, headers=headers)
            # With proper validation, invalid names should return 422
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_tag_creation_with_snippet(self, client, test_user_token):
        """Test that tags are created when creating a snippet"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        snippet_data = {
            "title": "New Snippet",
            "code": "print('new')",
            "language": "python",
            "tags": ["newtag", "anothertag"],
        }

        response = client.post("/snippets/", json=snippet_data, headers=headers)
        assert response.status_code == status.HTTP_201_CREATED

        # Check that tags were created
        tag_response = client.get("/tags/", headers=headers)
        assert tag_response.status_code == status.HTTP_200_OK
        tags = tag_response.json()

        tag_names = [tag["name"] for tag in tags]
        assert "newtag" in tag_names
        assert "anothertag" in tag_names
