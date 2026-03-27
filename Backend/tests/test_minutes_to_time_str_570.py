import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from routers.courses import minutes_to_time_str

# case 1: 570 minutes is equivalent to 9 hours and 30 minutes, so the expected output is "09:30".
def test_minutes_to_time_str_570():
    assert minutes_to_time_str(570) == "09:30"

# additional case 2: 60 minutes is equivalent to 1 hour, so the expected output is "01:00".
def test_minutes_to_time_str_60():
    assert minutes_to_time_str(60) == "01:00"