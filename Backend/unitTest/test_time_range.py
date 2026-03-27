from Backend.routers.courses import format_time_range

def test_format_time_range_end_none():
    r={"start_min": 540, "end_min": None}
    result = format_time_range(r)
    assert result == "TBA"