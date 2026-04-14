from fastapi import APIRouter, Query
from Backend.schemas.plan_schema import CourseList, RegisterCourseList
from Backend.services.plan_service import (
    save_courses_to_plan,
    load_courses_from_plan,
    load_plans_from_user,
    list_student_plans,
    register_courses,
    load_registered_courses,
)

router = APIRouter()

@router.post("/save")
def save_courses(courses: CourseList):
    return save_courses_to_plan(
            course_ids=courses.course_ids,
            user=courses.user,
            term=courses.term,
            name=courses.name
        )

@router.get("/load")
def load_courses(user: str, term: int, name: str):
    return load_courses_from_plan(
        user=user,
        term=term,
        name=name
    )

@router.post("/register")
def register(data: RegisterCourseList):
    return register_courses(user=data.user, course_ids=data.course_ids)

@router.get("/registered")
def get_registered(user: str):
    return load_registered_courses(user)

@router.get("/list")
def list_plans(user: str):
    return list_student_plans(user)

@router.post("/load-plans")
def load_plans(user: str):
    return load_plans_from_user(
        user=user
    )
