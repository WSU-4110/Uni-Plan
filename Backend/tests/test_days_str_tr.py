import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from routers.courses import days_str
# case 1: Tuesday and Thursday are True, the rest are False. The expected output is "TR".
def test_days_str_tr():
    r = {
        "monday": False,
        "tuesday": True,
        "wednesday": False,
        "thursday": True,
        "friday": False,
    }
    assert days_str(r) == "TR"

# additional case 2: only Monday is True, the rest are False. The expected output is "M".
def test_days_str_monday_only():
    r = {
        "monday": True,
        "tuesday": False,
        "wednesday": False,
        "thursday": False,
        "friday": False,
    }
    assert days_str(r) == "M"
