from Backend.routers.courses import days_str

def test_days_none():
    result = days_str(None)
    assert result == "TBA"