import pytest
from Backend.services.auth_service import get_users

class TestUserFunctions:

    def test_get_users_returns_dict(self, mocker):
        mock_conn = mocker.patch("Backend.services.auth_service.get_conn")
        mock_cur = mock_conn.return_value.cursor.return_value

        mock_cur.fetchall.return_value = [
            {"id": 'habib', "password_hash": "$2b$12$c4PMr1xigoksIGa/tSLmB.S0LkCFMwkS/tEASixNiEBSjtHVN.tpS"},
            {"id": 'nahyun', "password_hash": "$2b$12$Nk5UWw6ElE78DaNwmYxgRetxVBi8BZzgV8AmajJSXEybJWC2B6un."}
        ]

        result = get_users()

        assert result == {
            "habib": "$2b$12$c4PMr1xigoksIGa/tSLmB.S0LkCFMwkS/tEASixNiEBSjtHVN.tpS",
            "nahyun": "$2b$12$Nk5UWw6ElE78DaNwmYxgRetxVBi8BZzgV8AmajJSXEybJWC2B6un."
        }

        mock_conn.return_value.close.assert_called_once()

    def test_get_users_empty_db(self, mocker):
        mock_conn = mocker.patch("Backend.services.auth_service.get_conn")
        mock_cur = mock_conn.return_value.cursor.return_value
        mock_cur.fetchall.return_value = []

        result = get_users()

        assert result == {}
        mock_conn.return_value.close.assert_called_once()