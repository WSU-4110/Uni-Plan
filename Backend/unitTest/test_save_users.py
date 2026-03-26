import pytest
from unittest.mock import MagicMock

from Backend.routers.plans import save_courses

class TestSaveFunctions:

    def test_save_courses_success(self, mocker):
        # Case 3: Successful save returns {"received": [...]}
        mock_save = mocker.patch("your_module.save_courses_to_plan")
        mock_save.return_value = {"received": ["CS101", "MA202"]}
        
        # Mocking the CourseList Pydantic model input
        mock_courses = MagicMock()
        mock_courses.course_ids = ["CS101", "MA202"]
        
        result = save_courses(mock_courses)
        assert "received" in result
        assert result["received"] == ["CS101", "MA202"]

    def test_save_courses_empty_list(self, mocker):
        # Case 4: Empty course list handled without error
        mock_save = mocker.patch("your_module.save_courses_to_plan")
        mock_save.return_value = {"received": []}
        
        mock_courses = MagicMock()
        mock_courses.course_ids = []
        
        result = save_courses(mock_courses)
        assert result["received"] == []