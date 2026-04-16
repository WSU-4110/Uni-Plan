"""
Member 5 — Jimin Lee
Test: POST /api/auth/login returns success: false for invalid credentials.
"""

import pytest


def test_login_invalid_credentials_returns_success_false(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "definitelynotarealusername", "password": "wrongpassword"},
    )

    assert response.status_code == 200
    assert response.json().get("success") is False
