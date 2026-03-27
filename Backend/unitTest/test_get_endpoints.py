import pytest
from fastapi.testclient import TestClient
from Backend.main import app
client = TestClient(app)


def test_api_success():
    payload = {"username":"habib", "password":"1234"}

    response = client.post("/api/auth/login", json=payload)

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Login successful"
    }


def test_logout():

    response = client.post("/api/auth/logout")

    assert response.status_code == 200
    assert response.json() == {
            "success": True,
            "message": "Logged out successfully"
        }


def test_get_response():

    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "FastAPI backend is running"
    }
