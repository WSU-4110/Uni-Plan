from Backend.routers.courses import format_location

def test_format_location_none():
    r={"building": None, "room_number": None}
    result = format_location(r)
    assert result == "TBA"