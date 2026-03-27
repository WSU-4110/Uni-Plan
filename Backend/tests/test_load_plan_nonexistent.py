"""
Member 5 — Jimin Lee
Test: GET /api/plans/load returns {"results": []} for a non-existent plan.
"""

import pytest


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
