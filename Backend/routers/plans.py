from fastapi import APIRouter, Query
from db import get_conn
from main import CourseList
from routers.courses import search_courses

router = APIRouter()


@router.post("/save")
def save_courses(courses: CourseList):

    conn = get_conn()
    try:
        cur = conn.cursor()

        # delete previous plan with same user and name
        delete_sql = "DELETE FROM plan WHERE student_id = %s AND name = %s"
        cur.execute(delete_sql, (courses.user, courses.name))

        for course_id in courses.course_ids:
            sql = "INSERT INTO plan(student_id, id, term_id, name) Values (%s, %s, %s, %s)"
            cur.execute(sql,(courses.user, course_id, courses.term, courses.name))

        conn.commit()
    finally:
        conn.close()

    return {"received": courses.course_ids}




@router.get("/load")
def load_courses(student_id: str, name : str):

    conn = get_conn()
    try:
        cur = conn.cursor()

        sql = "SELECT id FROM plan  WHERE student_id = %s AND name = %s"
        cur.execute(sql,(student_id, name))

        result = cur.fetchall()

        return {"courses": result}
    
    finally:
        conn.close()

    return {}