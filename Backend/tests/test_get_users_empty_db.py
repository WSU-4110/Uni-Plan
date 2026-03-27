"""
Member 5 — Jimin Lee
Test: get_users returns empty dict when DB has no rows.
"""

from unittest.mock import MagicMock, patch
from services.auth_service import get_users


def test_get_users_empty_db_returns_empty_dict():
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.fetchall.return_value = []

    with patch("services.auth_service.get_conn", return_value=mock_conn):
        result = get_users()

    assert result == {}
