"""
Member 5 — Jimin Lee
Test: POST /api/plans/save response contains a "received" field.
"""

import pytest

TEST_USERNAME = "testuser"


def test_save_plan_response_contains_received_field(client, monkeypatch):
    monkeypatch.setattr(
        "routers.plans.save_courses_to_plan",
        lambda course_ids, user, term, name: {"received": course_ids},
    )

    payload = {
        "course_ids": [101, 202],
        "user": TEST_USERNAME,
        "term": 202501,
        "name": "myplan",
    }
    response = client.post("/api/plans/save", json=payload)

    assert response.status_code == 200
    assert "received" in response.json()
