import bcrypt
from Backend.auth import verify_password

def test_verify_password_empty():
    #creating bcrypt
    hashed_password = bcrypt.hashpw(b"testpassword", bcrypt.gensalt()).decode("utf-8")
    
    result = verify_password("", hashed_password)
    assert result == False