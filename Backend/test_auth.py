from auth import hash_password, verify_password

def days_str(days):
    return "".join(days)

def minutes_to_time_str(minutes):
    return f"{minutes//60:02d}:{minutes%60:02d}"

def format_time_range(start_min, end_min):
    start = minutes_to_time_str(start_min)
    end = minutes_to_time_str(end_min)
    return f"{start} - {end}"

def format_location(building, room_number):
    return f"{building} {room_number}"


# 1. hash_password → result is non-empty string
def test_hash_password_not_empty():
    hashed = hash_password("mypassword")
    assert isinstance(hashed, str)
    assert len(hashed) > 0


# 2. verify_password → correct password returns True
def test_verify_password_correct():
    password = "mypassword"
    hashed = hash_password(password)
    assert verify_password(password, hashed) == True


# 3. days_str → M/W/F → "MWF"
def test_days_str_mwf():
    assert days_str(["M", "W", "F"]) == "MWF"


# 4. minutes_to_time_str → 0 → "00:00"
def test_minutes_to_time_str_zero():
    assert minutes_to_time_str(0) == "00:00"


# 5. format_time_range → 540–650 → "09:00 - 10:50"
def test_format_time_range():
    assert format_time_range(540, 650) == "09:00 - 10:50"


# 6. format_location → "Todd", "101" → "Todd 101"
def test_format_location():
    assert format_location("Todd", "101") == "Todd 101"