from auth import hash_password, verify_password


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


# 3. verify_password → wrong password returns False
def test_verify_password_wrong():
    password = "mypassword"
    hashed = hash_password(password)
    assert verify_password("wrongpassword", hashed) == False


# 4. empty password test
def test_empty_password():
    password = ""
    hashed = hash_password(password)
    assert verify_password("", hashed) == True


# 5. hash should always return string
def test_hash_returns_string():
    hashed = hash_password("mypassword")
    assert isinstance(hashed, str)


# 6. bcrypt generates different hashes
def test_hashes_are_different():
    password = "mypassword"
    assert hash_password(password) != hash_password(password)