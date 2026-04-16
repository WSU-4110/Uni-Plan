import pytest
from unittest.mock import MagicMock

from Backend.routers.plans import save_courses

class TestSaveFunctions:

    def test_save_courses_success(self, mocker):
        mock_save = mocker.patch("Backend.routers.plans.save_courses_to_plan")
        mock_save.return_value = {"received": ["CS101", "MA202"]}
        
        mock_courses = MagicMock()
        mock_courses.course_ids = ["CS101", "MA202"]
        
        result = save_courses(mock_courses)
        assert "received" in result
        assert result["received"] == ["CS101", "MA202"]
