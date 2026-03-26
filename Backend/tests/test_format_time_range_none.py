import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from routers.courses import format_time_range

def test_format_time_range_start_min_none_returns_tba():
    r = {
        "start_min": None,
        "end_min": 600,
    }

    assert format_time_range(r) == "TBA"