from fastapi import APIRouter, Request
from db import get_conn

router = APIRouter()











@router.post("generate-schedules")
def generate_schedules(request: Request):
    body = await request.json()
    courses = body.get("courses", [])

    conn = get_conn()
    cur = conn.cursor()

    course_sections = []

    try:
        for course in courses:
            subject = course.get("subject")
            number = course.get("course_number")

            cur.execute("""
                SELECT id FROM course
                WHERE subject = %s AND course_number = %s
            """, (subject, number))

            row = cur.fetchone()
            if not row:
                continue

            course_id = row["id"]

            cur.execute("""
                SELECT s.id as section_id,
                       t.start_time,
                       t.end_time,
                       t.monday,
                       t.tuesday,
                       t.wednesday,
                       t.thursday,
                       t.friday
                FROM section s
                JOIN time_slot t ON s.time_slot_id = t.id
                WHERE s.course_id = %s
            """, (course_id,))

            sections = cur.fetchall()

            formatted = []
            for s in sections:
                formatted.append({
                    "section_id": s["section_id"],
                    "course_id": course_id,
                    "time_slot": {
                        "start_time": s["start_time"],
                        "end_time": s["end_time"],
                        "monday": s["monday"],
                        "tuesday": s["tuesday"],
                        "wednesday": s["wednesday"],
                        "thursday": s["thursday"],
                        "friday": s["friday"],
                    }
                })

            if formatted:
                course_sections.append(formatted)

        results = []

        return {
            "count": len(results),
            "schedules": results
        }

    finally:
        cur.close()
        conn.close()