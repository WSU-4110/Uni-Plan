from fastapi import APIRouter
from auth import verify_password
import os

router = APIRouter()

# reuse get_users logic here
def get_users():
    users = {}

    users_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../users.txt")

    with open(users_path, "r") as file:
        for line in file:
            line = line.strip()

            if not line:
                continue

            username, hashed = line.split(":", 1)
            users[username] = hashed

    return users


from schemas.override import OverrideRequest

@router.post("/api/admin/override")
def admin_override(data: OverrideRequest):
    users = get_users()

    if data.username not in users:
        return {"success": False, "message": "User not found"}

    if not verify_password(data.password, users[data.username]):
        return {"success": False, "message": "Invalid credentials"}

    if data.username != "admin1":
        return {"success": False, "message": "Not authorized"}

    conflict_detected = True

    if conflict_detected:
        return {
            "success": True,
            "message": f"Conflict detected, but admin override applied for: {data.action}"
        }

    return {
        "success": True,
        "message": "No conflict found"
    }