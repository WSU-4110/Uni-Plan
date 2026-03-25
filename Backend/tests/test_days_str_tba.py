import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from routers.courses import days_str


def test_days_str_tba():
    r = {}
    assert days_str(r) == "TBA"