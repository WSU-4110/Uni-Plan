from Backend.routers.courses import format_location

def test_format_location_normal():
    r={"building": "Todd", "room_number": "101"}
    result = format_location(r)
    assert result == "Todd 101"

def test_format_location_number_none():
    r={"building": "Todd", "room_number": None}
    result = format_location(r)
    assert result == "Todd"

def test_format_location_none():
    r={"building": None, "room_number": None}
    result = format_location(r)
    assert result == "TBA"