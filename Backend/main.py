from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fake users 
users = [
    {"username": "habib", "password": "1234"},
    {"username": "jimin", "password": "password1"},
    {"username": "alyssa", "password": "planner2026"},
    {"username": "nahyun", "password": "schedule!"},
    {"username": "zach", "password": "uni123"},
]

# Request body model
class LoginRequest(BaseModel):
    username: str
    password: str


# LOGIN
@app.post("/login")
def login(data: LoginRequest):
    user = next(
        (u for u in users if u["username"] == data.username and u["password"] == data.password),
        None
    )

    if user:
        return {
            "success": True,
            "message": "Login successful"
        }
    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


# LOGOUT
@app.post("/logout")
def logout():
    return {
        "success": True,
        "message": "Logged out successfully"
    }
