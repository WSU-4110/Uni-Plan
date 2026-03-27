"""
Member 5 — Jimin Lee
Test: GET /api/auth/login returns success: false for invalid credentials.
"""

import json
import pytest

TEST_USERNAME = "testuser"


def test_login_invalid_credentials_returns_success_false(client, mock_users, monkeypatch):
    monkeypatch.setattr("routers.auth.get_users", lambda: mock_users)

    response = client.request(
        "GET",
        "/api/auth/login",
        content=json.dumps({"username": TEST_USERNAME, "password": "wrongpassword"}),
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 200
    assert response.json().get("success") is False
