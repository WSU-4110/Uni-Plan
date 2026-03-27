import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from auth import hash_password

def test_hash_password_same_input_different_hashes():
    password = "1234"

    hash1 = hash_password(password)
    hash2 = hash_password(password)

    assert hash1 != hash2