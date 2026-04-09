from fastapi import APIRouter
from Backend.schemas.auth_schema import LoginRequest
from Backend.services.auth_service import get_users
from Backend.auth import verify_password

router = APIRouter()

@router.post("/login")
def login(data: LoginRequest):
    users = get_users()

    user = users.get(data.username)

    if user and verify_password(data.password, user["password_hash"]):
        return {
            "success": True,
            "message": "Login successful",
            "username": data.username,
            "role": user["role"]
        }

    return {
        "success": False,
        "message": "Invalid username or password"
    }


@router.post("/logout")
def logout():
    return {
        "success": True,
        "message": "Logged out successfully"
    }