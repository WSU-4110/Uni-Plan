import bcrypt
from Backend.auth import hash_password

def test_hash_password_prefix():
    hashed_password = hash_password("testpassword")
    assert hashed_password.startswith("$2b$")