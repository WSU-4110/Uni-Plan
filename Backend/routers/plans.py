from fastapi import APIRouter, Query
from db import get_conn
from main import CourseList
from routers.courses import days_str, format_location, format_time_range

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

        course_ids = [r["id"] for r in result]

        if not course_ids:
            return {"results": []}
    
        # query the courses
        sql = """
        SELECT
            s."CRN" AS crn,
            s.term_id AS term_id,
            c.id AS course_id,
            c.subject,
            c.course_number,
            c.title,
            c.credit_hours,
            c.instructor,
            c.building,
            c.room_number,
            t.monday,
            t.tuesday,
            t.wednesday,
            t.thursday,
            t.friday,
            t.start_min,
            t.end_min
        FROM section s
        JOIN course c ON c.id = s.course_id
        LEFT JOIN time_slot t ON t.id = c.id
        WHERE c.id = ANY(%s)
        ORDER BY c.subject, c.course_number
        """

        cur.execute(sql, (course_ids,))
        rows = cur.fetchall()

    finally:
        conn.close()

    results = []
    for r in rows:
        results.append(
            {
                "courseId": r["course_id"],
                "subject": r["subject"],
                "courseNumber": r["course_number"],
                "courseCode": f"{r['subject']} {r['course_number']}",
                "crn": str(r["crn"]),
                "term": str(r["term_id"]),
                "name": r["title"],
                "credits": r["credit_hours"],
                "instructor": r["instructor"] or "TBA",
                "days": days_str(r),
                "time": format_time_range(r),
                "location": format_location(r),
            }
        )

    return {"results": results}