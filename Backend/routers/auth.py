from fastapi import APIRouter
from Backend.schemas.auth_schema import LoginRequest
from Backend.services.auth_service import get_users
from Backend.auth import verify_password

router = APIRouter()

@router.get("/login")
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


@router.post("/logout")
def logout():
    return {
        "success": True,
        "message": "Logged out successfully"
    }