import os

# Read users from users.txt
def get_users():
    users = {}

    users_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "users.txt"
    )    
    with open(users_path, "r") as file:
        for line in file:
            line = line.strip()

            if not line:
                continue

            username, hashed = line.split(":", 1)
            users[username] = hashed

    return users