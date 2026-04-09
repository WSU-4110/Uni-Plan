from fastapi import APIRouter, Query, HTTPException
from Backend.services.auth_service import get_users
from Backend.services.plan_service import load_courses_from_plan

router = APIRouter()

@router.get("/plans/load")
def admin_load_student_plan(
    admin_user: str = Query(...),
    student_id: str = Query(...),
    term: int = Query(...),
    name: str = Query(...)
):
    users = get_users()
    admin = users.get(admin_user)

    if not admin:
        raise HTTPException(status_code=404, detail="Admin user not found")

    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return load_courses_from_plan(
        user=student_id,
        term=term,
        name=name
    )