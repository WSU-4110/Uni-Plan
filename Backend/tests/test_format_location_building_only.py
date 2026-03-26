import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from routers.courses import format_location

def test_format_location_building_only_returns_building():
    r = {
        "building": "Todd",
        "room_number": None,
    }
    
    assert format_location(r) == "Todd"