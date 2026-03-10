from fastapi import APIRouter, Query
from db import get_conn
from main import CourseList

router = APIRouter()


@router.post("/save")
def save_courses(courses: CourseList):

    conn = get_conn()
    try:
        cur = conn.cursor()
        for course_id in courses.course_ids:
            sql = "INSERT INTO plan(student_id, id, term_id, name) Values (%s, %s, %s, %s)"
            cur.execute(sql,(courses.user, course_id, courses.term, courses.name))

        conn.commit()
    finally:
        conn.close()

    return {"received": courses.course_ids}