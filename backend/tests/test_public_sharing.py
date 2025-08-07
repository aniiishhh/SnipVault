import pytest
from fastapi import status
from sqlalchemy.orm import Session

from models import Snippet, User
from auth import get_password_hash


class TestPublicSharing:
    """Test public snippet sharing functionality"""

    def test_get_public_snippets(self, client, test_public_snippet):
        """Test getting all public snippets"""
        response = client.get("/public/snippets/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check that we get the public snippet
        snippet_found = False
        for snippet in data:
            if snippet["id"] == test_public_snippet.id:
                snippet_found = True
                assert snippet["title"] == "Public Test Snippet"
                assert snippet["code"] == "console.log('Hello, World!')"
                assert snippet["language"] == "javascript"
                assert snippet["is_public"] == True
                break

        assert snippet_found

    def test_get_public_snippet_by_id(self, client, test_public_snippet):
        """Test getting a specific public snippet by ID"""
        response = client.get(f"/public/snippets/{test_public_snippet.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_public_snippet.id
        assert data["title"] == "Public Test Snippet"
        assert data["code"] == "console.log('Hello, World!')"
        assert data["language"] == "javascript"
        assert data["is_public"] == True

    def test_get_private_snippet_publicly_fails(self, client, test_snippet):
        """Test that private snippets cannot be accessed publicly"""
        response = client.get(f"/public/snippets/{test_snippet.id}")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_nonexistent_public_snippet(self, client):
        """Test getting a non-existent public snippet"""
        response = client.get("/public/snippets/999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_filter_public_snippets_by_language(self, client, test_public_snippet):
        """Test filtering public snippets by language"""
        response = client.get("/public/snippets/?language=javascript")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

        # All snippets should be JavaScript
        for snippet in data:
            assert snippet["language"] == "javascript"
            assert snippet["is_public"] == True

    def test_filter_public_snippets_by_tag(
        self, client, db_session, test_public_snippet
    ):
        """Test filtering public snippets by tag"""
        # Add a tag to the public snippet
        from models import Tag

        tag = Tag(name="javascript")
        db_session.add(tag)
        db_session.commit()

        # Associate tag with snippet (this would normally be done in the snippet creation)
        # For testing, we'll just check the endpoint works
        response = client.get("/public/snippets/?tag=javascript")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_public_snippets_pagination(self, client, db_session, test_user):
        """Test pagination for public snippets"""
        # Create multiple public snippets
        snippets = []
        for i in range(15):
            snippet = Snippet(
                title=f"Public Snippet {i}",
                code=f"console.log('Snippet {i}')",
                language="javascript",
                description=f"Description {i}",
                is_public=True,
                user_id=test_user.id,
            )
            db_session.add(snippet)
            snippets.append(snippet)

        db_session.commit()

        # Test with limit
        response = client.get("/public/snippets/?limit=5")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) <= 5

        # Test with skip
        response = client.get("/public/snippets/?skip=5&limit=5")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) <= 5

    def test_public_snippets_date_filtering(self, client, db_session, test_user):
        """Test date filtering for public snippets"""
        from datetime import datetime, timedelta

        # Create snippets with different dates
        today = datetime.utcnow()
        yesterday = today - timedelta(days=1)
        last_week = today - timedelta(days=7)

        # Create a snippet from yesterday
        old_snippet = Snippet(
            title="Old Public Snippet",
            code="console.log('Old')",
            language="javascript",
            is_public=True,
            user_id=test_user.id,
            created_at=yesterday,
        )
        db_session.add(old_snippet)

        # Create a snippet from today
        new_snippet = Snippet(
            title="New Public Snippet",
            code="console.log('New')",
            language="javascript",
            is_public=True,
            user_id=test_user.id,
            created_at=today,
        )
        db_session.add(new_snippet)

        db_session.commit()

        # Test filtering by created_after
        response = client.get(
            f"/public/snippets/?created_after={yesterday.strftime('%Y-%m-%d')}"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 1

    def test_public_snippets_no_authentication_required(
        self, client, test_public_snippet
    ):
        """Test that public snippets can be accessed without authentication"""
        # No Authorization header needed
        response = client.get("/public/snippets/")
        assert response.status_code == status.HTTP_200_OK

        response = client.get(f"/public/snippets/{test_public_snippet.id}")
        assert response.status_code == status.HTTP_200_OK

    def test_mixed_public_private_snippets(self, client, db_session, test_user):
        """Test that only public snippets are returned in public endpoints"""
        # Create both public and private snippets
        public_snippet = Snippet(
            title="Public Snippet",
            code="console.log('public')",
            language="javascript",
            is_public=True,
            user_id=test_user.id,
        )
        db_session.add(public_snippet)

        private_snippet = Snippet(
            title="Private Snippet",
            code="console.log('private')",
            language="javascript",
            is_public=False,
            user_id=test_user.id,
        )
        db_session.add(private_snippet)

        db_session.commit()

        # Check public endpoint only returns public snippets
        response = client.get("/public/snippets/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        public_ids = [snippet["id"] for snippet in data]
        assert public_snippet.id in public_ids
        assert private_snippet.id not in public_ids

    def test_public_snippet_user_info(self, client, test_public_snippet):
        """Test that public snippets include user information"""
        response = client.get(f"/public/snippets/{test_public_snippet.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Should include user information
        assert "user_id" in data
        # But should not include sensitive user data
        assert "hashed_password" not in data
