from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from auth import verify_password
import os

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class LoginRequest(BaseModel):
    username: str
    password: str

# ✅ NEW: Override request model
class OverrideRequest(BaseModel):
    username: str
    password: str
    action: str


# Read users from users.txt
def get_users():
    users = {}

    users_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users.txt")
    with open(users_path, "r") as file:
        for line in file:
            line = line.strip()

            if not line:
                continue

            username, hashed = line.split(":", 1)
            users[username] = hashed

    return users


# LOGIN ENDPOINT
@app.post("/api/auth/login")
def login(data: LoginRequest):
    users = get_users()

    if data.username in users and verify_password(data.password, users[data.username]):
        return {
            "success": True,
            "message": "Login successful"
        }

    return {
        "success": False,
        "message": "Invalid username or password"
    }


# ✅ NEW: ADMIN OVERRIDE ENDPOINT (FR-18)
@app.post("/api/admin/override")
def admin_override(data: OverrideRequest):
    users = get_users()

    # check user exists
    if data.username not in users:
        return {
            "success": False,
            "message": "User not found"
        }

    # check password
    if not verify_password(data.password, users[data.username]):
        return {
            "success": False,
            "message": "Invalid credentials"
        }

    # 🔥 simple admin check (safe, no DB changes)
    if data.username != "admin1":
        return {
            "success": False,
            "message": "Not authorized"
        }

    # 🔥 simulate constraint / conflict
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