import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from auth import hash_password, verify_password

def test_verify_password_wrong_password_returns_false():
    correct_password = "1234"
    wrong_password = "wrongpw1234"

    hashed = hash_password(correct_password)

    assert verify_password(wrong_password, hashed) is False