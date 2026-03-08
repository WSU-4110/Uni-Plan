from fastapi import FastAPI
from pydantic import BaseModel
from routers.courses import router as courses_router
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

# LOGOUT
@app.post("/api/logout")
def logout():
    return {
        "success": True,
        "message": "Logged out successfully"
    }


# Root route (so you don't see "Not Found")
@app.get("/")
def root():
    return {"message": "FastAPI backend is running"}

app.include_router(courses_router, prefix="/api/courses")

