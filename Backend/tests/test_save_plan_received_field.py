"""
Member 5 — Jimin Lee
Test: POST /api/plans/save response contains a "received" field.
"""

import pytest

TEST_USERNAME = "testuser"


def test_save_plan_response_contains_received_field(client):
    payload = {
        "course_ids": [],
        "user": TEST_USERNAME,
        "term": 202501,
        "name": "myplan",
    }
    response = client.post("/api/plans/save", json=payload)

    assert response.status_code == 200
    assert "received" in response.json()
