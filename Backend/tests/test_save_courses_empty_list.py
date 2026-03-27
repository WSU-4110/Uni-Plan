"""
Member 5 — Jimin Lee
Test: save_courses_to_plan handles an empty course list without error.
"""

from unittest.mock import MagicMock, patch
from services.plan_service import save_courses_to_plan

TEST_USERNAME = "testuser"


def test_save_courses_empty_list_no_error():
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = MagicMock()

    with patch("services.plan_service.get_conn", return_value=mock_conn):
        result = save_courses_to_plan([], TEST_USERNAME, 202501, "myplan")

    assert result == {"received": []}
