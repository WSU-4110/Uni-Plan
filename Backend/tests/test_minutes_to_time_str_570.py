import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from routers.courses import minutes_to_time_str

def test_minutes_to_time_str_570():
    assert minutes_to_time_str(570) == "09:30"