"""
Member 5 — Jimin Lee
Test: load_courses_from_plan returns items that contain a courseCode field.
"""

from unittest.mock import MagicMock, patch
from services.plan_service import load_courses_from_plan

TEST_USERNAME = "testuser"

FAKE_ROW = {
    "course_id": 1,
    "subject": "CSC",
    "course_number": "1000",
    "title": "Intro to CS",
    "credit_hours": 3,
    "instructor": "Dr. Smith",
    "building": "State Hall",
    "room_number": "101",
    "monday": True,
    "tuesday": False,
    "wednesday": True,
    "thursday": False,
    "friday": False,
    "start_min": 540,
    "end_min": 600,
    "crn": 12345,
    "term_id": 202501,
}


def test_load_courses_items_have_course_code():
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.fetchall.side_effect = [
        [{"course_id": 1}],
        [FAKE_ROW],
    ]

    with patch("services.plan_service.get_conn", return_value=mock_conn):
        result = load_courses_from_plan(TEST_USERNAME, 202501, "myplan")

    assert "results" in result
    assert len(result["results"]) == 1
    assert "courseCode" in result["results"][0]
