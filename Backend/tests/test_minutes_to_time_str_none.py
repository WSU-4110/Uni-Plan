import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from routers.courses import minutes_to_time_str

def test_minutes_to_time_str_none():
    assert minutes_to_time_str(None) is None