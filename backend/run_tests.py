#!/usr/bin/env python3
"""
Test runner script for SnipVault backend tests
"""

import subprocess
import sys
import os


def run_tests():
    """Run all tests with pytest"""
    print("🧪 Running SnipVault Backend Tests...")
    print("=" * 50)

    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Run pytest with verbose output
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        "tests/",
        "-v",
        "--tb=short",
        "--disable-warnings",
    ]

    try:
        result = subprocess.run(cmd, capture_output=False)
        return result.returncode
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return 1


def run_specific_test(test_file):
    """Run a specific test file"""
    print(f"🧪 Running specific test: {test_file}")
    print("=" * 50)

    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    cmd = [
        sys.executable,
        "-m",
        "pytest",
        f"tests/{test_file}",
        "-v",
        "--tb=short",
        "--disable-warnings",
    ]

    try:
        result = subprocess.run(cmd, capture_output=False)
        return result.returncode
    except Exception as e:
        print(f"❌ Error running test: {e}")
        return 1


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Run specific test file
        test_file = sys.argv[1]
        exit_code = run_specific_test(test_file)
    else:
        # Run all tests
        exit_code = run_tests()

    if exit_code == 0:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed!")

    sys.exit(exit_code)
