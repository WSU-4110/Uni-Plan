from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from auth import verify_password

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

    with open("users.txt", "r") as file:
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