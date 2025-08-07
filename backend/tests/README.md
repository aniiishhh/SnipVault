# SnipVault Backend Tests

This directory contains comprehensive unit tests for the SnipVault backend API.

## Test Structure

### `conftest.py`

- **Purpose**: Pytest configuration and fixtures
- **Key Features**:
  - In-memory SQLite database for testing
  - Test client setup
  - User, snippet, and tag fixtures
  - Database session management

### `test_auth.py`

- **Purpose**: Authentication and authorization tests
- **Coverage**:
  - User signup (success, duplicate username/email, invalid data)
  - User login (success, invalid credentials)
  - JWT token validation
  - Password hashing and verification
  - Current user retrieval

### `test_snippets.py`

- **Purpose**: Snippet CRUD operations
- **Coverage**:
  - Create snippets (success, invalid data, unauthorized)
  - Read snippets (user snippets, specific snippet, not found)
  - Update snippets (success, unauthorized access)
  - Delete snippets (success, unauthorized access)
  - Toggle snippet visibility
  - Filter snippets by language and public status

### `test_public_sharing.py`

- **Purpose**: Public snippet sharing functionality
- **Coverage**:
  - Get all public snippets
  - Get specific public snippet by ID
  - Private snippet access restrictions
  - Filter public snippets by language and tags
  - Pagination and date filtering
  - Authentication requirements (none for public endpoints)

### `test_tags.py`

- **Purpose**: Tag management functionality
- **Coverage**:
  - Create tags (success, duplicates, invalid data)
  - Get all tags
  - Snippet-tag associations
  - Filter snippets by tags
  - Tag name validation and case sensitivity

## Running Tests

### Run All Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Run Specific Test File

```bash
python -m pytest tests/test_auth.py -v
```

### Run Specific Test Class

```bash
python -m pytest tests/test_auth.py::TestAuth -v
```

### Run Specific Test Method

```bash
python -m pytest tests/test_auth.py::TestAuth::test_signup_success -v
```

### Using the Test Runner Script

```bash
# Run all tests
python run_tests.py

# Run specific test file
python run_tests.py test_auth.py
```

## Test Features

### 🔐 Authentication Testing

- **User Registration**: Tests for valid signup, duplicate handling, and validation
- **User Login**: Tests for successful login and invalid credentials
- **JWT Tokens**: Token creation, validation, and expiration
- **Authorization**: Protected endpoint access with and without valid tokens

### 📝 Snippet CRUD Testing

- **Create**: Valid snippet creation with tags and validation
- **Read**: User snippet retrieval and specific snippet access
- **Update**: Snippet modification with ownership validation
- **Delete**: Snippet removal with authorization checks
- **Visibility**: Public/private toggle functionality

### 🌐 Public Sharing Testing

- **Public Access**: Unauthenticated access to public snippets
- **Privacy**: Private snippet access restrictions
- **Filtering**: Language, tag, and date-based filtering
- **Pagination**: Large dataset handling

### 🏷️ Tag Management Testing

- **Tag Creation**: Valid and invalid tag creation
- **Duplicate Handling**: Case-insensitive duplicate detection
- **Snippet Association**: Tag-snippet relationship testing
- **Filtering**: Snippet filtering by tags

## Test Database

Tests use an in-memory SQLite database to ensure:

- **Isolation**: Each test runs in isolation
- **Speed**: No external database dependencies
- **Clean State**: Fresh database for each test
- **No Side Effects**: Tests don't affect production data

## Fixtures

### `client`

- FastAPI test client for making HTTP requests

### `db_session`

- Database session for direct database operations

### `test_user`

- Pre-created test user with hashed password

### `test_user_token`

- Valid JWT token for the test user

### `test_snippet`

- Pre-created private snippet owned by test user

### `test_public_snippet`

- Pre-created public snippet owned by test user

### `test_tag`

- Pre-created tag for testing

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Database is reset between tests
3. **Realistic Data**: Tests use realistic but safe test data
4. **Comprehensive Coverage**: Tests cover success, failure, and edge cases
5. **Clear Naming**: Test names clearly describe what they test
6. **Documentation**: Each test has a docstring explaining its purpose

## Adding New Tests

When adding new tests:

1. **Follow Naming**: Use `test_*.py` for test files
2. **Use Fixtures**: Leverage existing fixtures when possible
3. **Test Both Success and Failure**: Include positive and negative test cases
4. **Add Documentation**: Include clear docstrings
5. **Update This README**: Document new test categories

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

- **Fast Execution**: In-memory database for speed
- **No Dependencies**: Self-contained test environment
- **Clear Output**: Verbose output for debugging
- **Exit Codes**: Proper exit codes for CI systems
