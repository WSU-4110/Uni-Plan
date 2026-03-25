from Backend.routers.courses import format_time_range

def test_format_time_range_normal():
    r={"start_min": 540, "end_min": 650}
    result = format_time_range(r)
    assert result == "09:00 - 10:50"

def test_format_time_range_start_none():
    r={"start_min": None, "end_min": 650}
    result = format_time_range(r)
    assert result == "TBA"

def test_format_time_range_end_none():
    r={"start_min": 540, "end_min": None}
    result = format_time_range(r)
    assert result == "TBA"