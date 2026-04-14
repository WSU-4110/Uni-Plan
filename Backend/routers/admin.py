from fastapi import APIRouter, Query, HTTPException
from Backend.services.auth_service import get_users
from Backend.services.plan_service import load_courses_from_plan, save_courses_to_plan
from Backend.schemas.plan_schema import AdminCourseList

router = APIRouter()


def _verify_admin(admin_user: str):
    users = get_users()
    admin = users.get(admin_user)

    if not admin:
        raise HTTPException(status_code=404, detail="Admin user not found")

    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return admin


@router.get("/plans/load")
def admin_load_student_plan(
    admin_user: str = Query(...),
    student_id: str = Query(...),
    term: int = Query(...),
    name: str = Query(...)
):
    _verify_admin(admin_user)

    return load_courses_from_plan(
        user=student_id,
        term=term,
        name=name
    )


@router.post("/plans/save")
def admin_save_student_plan(data: AdminCourseList):
    _verify_admin(data.admin_user)

    return save_courses_to_plan(
        course_ids=data.course_ids,
        user=data.student_id,
        term=data.term,
        name=data.name
    )