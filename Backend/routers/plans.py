from fastapi import APIRouter, Query
from schemas.plan_schema import CourseList, LoadPlanRequest
from services.plan_service import save_courses_to_plan,load_courses_from_plan

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
def load_courses(data: LoadPlanRequest):
    return load_courses_from_plan(
        user=data.user,
        term=data.term,
        name=data.name
    )
