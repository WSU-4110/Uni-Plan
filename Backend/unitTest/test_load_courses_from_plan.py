import pytest
from unittest.mock import MagicMock

from Backend.routers.plans import load_courses

class TestLoadFunctions:

    def test_load_courses_no_plan(self, mocker):
        mock_load = mocker.patch("Backend.routers.plans.load_courses_from_plan")
        mock_load.return_value = {"results": []}
        
        result = load_courses(user="test_user", term=2024, name="my_plan")
        assert result == {"results": []}
