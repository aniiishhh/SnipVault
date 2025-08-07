import pytest
from fastapi import status
from sqlalchemy.orm import Session

from models import Snippet, Tag


class TestSnippetCRUD:
    """Test snippet CRUD operations"""

    def test_create_snippet_success(self, client, test_user_token):
        """Test successful snippet creation"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        snippet_data = {
            "title": "Test Snippet",
            "code": "print('Hello, World!')",
            "language": "python",
            "description": "A test snippet",
            "is_public": False,
            "tags": ["python", "test"],
        }

        response = client.post("/snippets/", json=snippet_data, headers=headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "Test Snippet"
        assert data["code"] == "print('Hello, World!')"
        assert data["language"] == "python"
        assert data["description"] == "A test snippet"
        assert data["is_public"] == False
        assert "id" in data
        assert "created_at" in data
        assert "user_id" in data

    def test_create_snippet_without_auth(self, client):
        """Test snippet creation without authentication"""
        snippet_data = {
            "title": "Test Snippet",
            "code": "print('Hello, World!')",
            "language": "python",
            "description": "A test snippet",
            "is_public": False,
        }

        response = client.post("/snippets/", json=snippet_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_snippet_invalid_data(self, client, test_user_token):
        """Test snippet creation with invalid data"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        snippet_data = {
            "title": "",  # Empty title
            "code": "",  # Empty code
            "language": "python",
            "is_public": False,
        }

        response = client.post("/snippets/", json=snippet_data, headers=headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_user_snippets(self, client, test_user_token, test_snippet):
        """Test getting user's snippets"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get("/snippets/", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check that we get the test snippet
        snippet_found = False
        for snippet in data:
            if snippet["id"] == test_snippet.id:
                snippet_found = True
                assert snippet["title"] == "Test Snippet"
                assert snippet["code"] == "print('Hello, World!')"
                assert snippet["language"] == "python"
                break

        assert snippet_found

    def test_get_user_snippets_without_auth(self, client):
        """Test getting snippets without authentication"""
        response = client.get("/snippets/")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_specific_snippet(self, client, test_user_token, test_snippet):
        """Test getting a specific snippet"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get(f"/snippets/{test_snippet.id}", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_snippet.id
        assert data["title"] == "Test Snippet"
        assert data["code"] == "print('Hello, World!')"
        assert data["language"] == "python"

    def test_get_snippet_not_found(self, client, test_user_token):
        """Test getting a non-existent snippet"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get("/snippets/999", headers=headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_snippet_success(self, client, test_user_token, test_snippet):
        """Test successful snippet update"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        update_data = {
            "title": "Updated Snippet",
            "code": "print('Updated code!')",
            "language": "python",
            "description": "Updated description",
            "is_public": True,
        }

        response = client.put(
            f"/snippets/{test_snippet.id}", json=update_data, headers=headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Updated Snippet"
        assert data["code"] == "print('Updated code!')"
        assert data["description"] == "Updated description"
        assert data["is_public"] == True

    def test_update_snippet_not_owner(
        self, client, test_user_token, db_session, test_user
    ):
        """Test updating snippet owned by another user"""
        # Create another user and snippet
        from models import User
        from auth import get_password_hash

        # Check if other user already exists
        existing_other_user = (
            db_session.query(User).filter(User.username == "otheruser").first()
        )
        if existing_other_user:
            other_user = existing_other_user
        else:
            other_user = User(
                username="otheruser",
                email="other@example.com",
                hashed_password=get_password_hash("password123"),
            )
            db_session.add(other_user)
            db_session.commit()

        other_snippet = Snippet(
            title="Other User's Snippet",
            code="print('Other user code')",
            language="python",
            user_id=other_user.id,
        )
        db_session.add(other_snippet)
        db_session.commit()

        headers = {"Authorization": f"Bearer {test_user_token}"}
        update_data = {"title": "Unauthorized Update"}

        response = client.put(
            f"/snippets/{other_snippet.id}", json=update_data, headers=headers
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_snippet_success(self, client, test_user_token, test_snippet):
        """Test successful snippet deletion"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.delete(f"/snippets/{test_snippet.id}", headers=headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_delete_snippet_not_owner(
        self, client, test_user_token, db_session, test_user
    ):
        """Test deleting snippet owned by another user"""
        # Create another user and snippet
        from models import User
        from auth import get_password_hash

        # Check if other user already exists
        existing_other_user = (
            db_session.query(User).filter(User.username == "otheruser").first()
        )
        if existing_other_user:
            other_user = existing_other_user
        else:
            other_user = User(
                username="otheruser",
                email="other@example.com",
                hashed_password=get_password_hash("password123"),
            )
            db_session.add(other_user)
            db_session.commit()

        other_snippet = Snippet(
            title="Other User's Snippet",
            code="print('Other user code')",
            language="python",
            user_id=other_user.id,
        )
        db_session.add(other_snippet)
        db_session.commit()

        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.delete(f"/snippets/{other_snippet.id}", headers=headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_toggle_snippet_visibility(self, client, test_user_token, test_snippet):
        """Test toggling snippet visibility"""
        headers = {"Authorization": f"Bearer {test_user_token}"}

        # Toggle to public
        response = client.patch(
            f"/snippets/{test_snippet.id}/toggle-public", headers=headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_public"] == True

        # Toggle back to private
        response = client.patch(
            f"/snippets/{test_snippet.id}/toggle-public", headers=headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_public"] == False

    def test_filter_snippets_by_language(self, client, test_user_token, test_snippet):
        """Test filtering snippets by language"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get("/snippets/?language=python", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

        # All snippets should be Python
        for snippet in data:
            assert snippet["language"] == "python"

    def test_filter_snippets_by_public_status(
        self, client, test_user_token, test_snippet
    ):
        """Test filtering snippets by public status"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get("/snippets/?is_public=false", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

        # All snippets should be private
        for snippet in data:
            assert snippet["is_public"] == False
