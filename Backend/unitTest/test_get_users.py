import pytest
from unittest.mock import MagicMock

from Backend.services.auth_service import get_users

class TestUserFunctions:


    def test_get_users_returns_dict(self, mocker):
        # Case 1: Returns a {id: hash} dict from DB
        mock_conn = mocker.patch("your_module.get_conn")
        mock_cur = mock_conn.return_value.cursor.return_value
        
        # Simulate DB returning rows
        mock_cur.fetchall.return_value = [
            {"id": 1, "password_hash": "hash_one"},
            {"id": 2, "password_hash": "hash_two"}
        ]
        
        result = get_users()
        assert result == {1: "hash_one", 2: "hash_two"}
        mock_conn.return_value.close.assert_called_once()

    def test_get_users_empty_db(self, mocker):
        # Case 2: Empty DB result -> empty dict
        mock_conn = mocker.patch("your_module.get_conn")
        mock_cur = mock_conn.return_value.cursor.return_value
        mock_cur.fetchall.return_value = []
        
        result = get_users()
        assert result == {}