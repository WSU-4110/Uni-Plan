"""
Shared fixtures for all unit tests.

Usage in any test file:
    from conftest import client, mock_users, hashed_password
or simply declare the fixture name as a parameter — pytest will inject it automatically.
"""

import sys
import os
import pytest

# Make the Backend root importable regardless of where pytest is invoked from.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import bcrypt
from fastapi.testclient import TestClient
from main import app


# ---------------------------------------------------------------------------
# App / HTTP client
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def client():
    """FastAPI TestClient — reused across the whole test session."""
    with TestClient(app) as c:
        yield c


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpass"


@pytest.fixture(scope="session")
def hashed_password():
    """A single bcrypt hash of TEST_PASSWORD, generated once per session."""
    return bcrypt.hashpw(TEST_PASSWORD.encode(), bcrypt.gensalt()).decode()


@pytest.fixture(scope="session")
def mock_users(hashed_password):
    """
    A {username: hashed_password} dict that mimics the DB user table.
    Import TEST_USERNAME / TEST_PASSWORD from this module when you need
    matching plain-text credentials.
    """
    return {TEST_USERNAME: hashed_password}
