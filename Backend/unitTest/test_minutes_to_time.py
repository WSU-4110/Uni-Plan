from Backend.routers.courses import minutes_to_time_str

def test_minutes_to_time_str_none():
    m=None
    result = minutes_to_time_str(m)
    assert result == None