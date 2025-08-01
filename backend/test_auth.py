#!/usr/bin/env python3
"""
Test script for authentication endpoints
"""
import requests
import json
import time

BASE_URL = "http://0.0.0.0:8000"


def test_signup():
    """Test user signup endpoint"""
    print("Testing signup endpoint...")

    # Use timestamp to make username unique
    timestamp = int(time.time())
    signup_data = {
        "email": f"test{timestamp}@example.com",
        "username": f"testuser{timestamp}",
        "password": "testpass123",
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200, signup_data
    except Exception as e:
        print(f"Error: {e}")
        return False, None


def test_login(username, password):
    """Test user login endpoint"""
    print("\nTesting login endpoint...")

    login_data = {"username": username, "password": password}

    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False


if __name__ == "__main__":
    print("🧠 Testing SnipVault Authentication System")
    print("=" * 50)

    # Test signup
    signup_success, user_data = test_signup()

    # Test login with the new user
    if signup_success and user_data:
        login_success = test_login(user_data["username"], user_data["password"])
    else:
        login_success = False

    print("\n" + "=" * 50)
    if signup_success and login_success:
        print("✅ All authentication tests passed!")
    else:
        print("❌ Some tests failed!")
