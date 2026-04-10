from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from auth import verify_password
import os

# import admin router
from routes.admin import router as admin_router

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


# include admin routes
app.include_router(admin_router)