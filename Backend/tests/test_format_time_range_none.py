import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from routers.courses import format_time_range
# case 1: start_min is None, end_min is 600. The expected output is "TBA".
def test_format_time_range_start_min_none_returns_tba():
    r = {
        "start_min": None,
        "end_min": 600,
    }

    assert format_time_range(r) == "TBA"

# additional case 2: start_min is 60, end_min is 120. The expected output is "01:00 - 02:00".
def test_format_time_range_exact_hour_range():
    r = {
        "start_min": 60,
        "end_min": 120,
    }
    assert format_time_range(r) == "01:00 - 02:00"