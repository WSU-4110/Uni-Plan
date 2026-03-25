from Backend.routers.courses import format_time_range

def test_format_time_range_normal():
    r={"start_min": 540, "end_min": 650}
    result = format_time_range(r)
    assert result == "09:00 - 10:50"