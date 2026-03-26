from auth import hash_password, verify_password


# 1. Hash should NOT equal original password
def test_hash_password_changes_value():
    password = "mypassword"
    hashed = hash_password(password)
    assert hashed != password


# 2. Hash should return a string
def test_hash_password_returns_string():
    hashed = hash_password("mypassword")
    assert isinstance(hashed, str)


# 3. Correct password should verify TRUE
def test_verify_password_success():
    password = "mypassword"
    hashed = hash_password(password)
    assert verify_password(password, hashed) == True


# 4. Wrong password should verify FALSE
def test_verify_password_fail():
    password = "mypassword"
    hashed = hash_password(password)
    assert verify_password("wrongpassword", hashed) == False


# 5. Empty password test
def test_empty_password():
    password = ""
    hashed = hash_password(password)
    assert verify_password("", hashed) == True


# 6. Same password should produce DIFFERENT hashes (bcrypt behavior)
def test_hashes_are_different():
    password = "mypassword"
    hash1 = hash_password(password)
    hash2 = hash_password(password)
    assert hash1 != hash2