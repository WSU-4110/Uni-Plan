from fastapi import APIRouter, Query
from db import get_conn
from main import CourseList

router = APIRouter()


@router.post("/save")
def save_courses(courses: CourseList):

    #query for injection


    for course_id in CourseList.course_ids:

        #append query with new course
        return
    
    return {"received": courses.course_ids}