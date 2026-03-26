"""
Member 5 — API endpoint tests (Jimin Lee)

Covers:
  1. GET  /                → 200 + "FastAPI backend is running"
  2. GET  /api/auth/login  → valid credentials   → success: true
  3. GET  /api/auth/login  → invalid credentials → success: false
  4. POST /api/auth/logout → 200 + success: true
  5. POST /api/plans/save  → valid body           → response contains "received"
  6. GET  /api/plans/load  → non-existent plan    → {"results": []}
"""

import json
import pytest

TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpass"

# Helper: send a GET request with a JSON body (FastAPI LoginRequest is a body param)
def _login(client, username, password):
    return client.request(
        "GET",
        "/api/auth/login",
        content=json.dumps({"username": username, "password": password}),
        headers={"Content-Type": "application/json"},
    )


# ---------------------------------------------------------------------------
# 1. Root health-check
# ---------------------------------------------------------------------------

def test_root_returns_200_and_message(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json().get("message") == "FastAPI backend is running"


# ---------------------------------------------------------------------------
# 2 & 3. Login endpoint
# ---------------------------------------------------------------------------

def test_login_valid_credentials_returns_success_true(client, mock_users, monkeypatch):
    monkeypatch.setattr("routers.auth.get_users", lambda: mock_users)

    response = _login(client, TEST_USERNAME, TEST_PASSWORD)
    assert response.status_code == 200
    assert response.json().get("success") is True


def test_login_invalid_credentials_returns_success_false(client, mock_users, monkeypatch):
    monkeypatch.setattr("routers.auth.get_users", lambda: mock_users)

    response = _login(client, TEST_USERNAME, "wrongpassword")
    assert response.status_code == 200
    assert response.json().get("success") is False


# ---------------------------------------------------------------------------
# 4. Logout endpoint
# ---------------------------------------------------------------------------

def test_logout_returns_200_and_success_true(client):
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json().get("success") is True


# ---------------------------------------------------------------------------
# 5. Save plan endpoint
# ---------------------------------------------------------------------------

def test_save_plan_response_contains_received_field(client, monkeypatch):
    course_ids = [101, 202]

    monkeypatch.setattr(
        "routers.plans.save_courses_to_plan",
        lambda course_ids, user, term, name: {"received": course_ids},
    )

    payload = {
        "course_ids": course_ids,
        "user": TEST_USERNAME,
        "term": 202501,
        "name": "myplan",
    }
    response = client.post("/api/plans/save", json=payload)
    assert response.status_code == 200
    assert "received" in response.json()


# ---------------------------------------------------------------------------
# 6. Load plan endpoint — non-existent plan
# ---------------------------------------------------------------------------

def test_load_plan_nonexistent_returns_empty_results(client, monkeypatch):
    monkeypatch.setattr(
        "routers.plans.load_courses_from_plan",
        lambda user, term, name: {"results": []},
    )

    response = client.get(
        "/api/plans/load",
        params={"user": "nobody", "term": 999999, "name": "ghost"},
    )
    assert response.status_code == 200
    assert response.json() == {"results": []}
