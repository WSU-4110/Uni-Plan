from fastapi import APIRouter, Request
from db import get_conn

router = APIRouter()

def days_overlap(a, b):
    return (
        (a["monday"] and b["monday"]) or
        (a["tuesday"] and b["tuesday"]) or
        (a["wednesday"] and b["wednesday"]) or
        (a["thursday"] and b["thursday"]) or
        (a["friday"] and b["friday"])
    )

def time_overlap(a, b):
    return not (a["end_time"] <= b["start_time"] or b["end_time"] <= a["start_time"])

def has_conflict(a, b):
    if not days_overlap(a["time_slot"], b["time_slot"]):
        return False
    return time_overlap(a["time_slot"], b["time_slot"])

def is_valid_addition(schedule, new_section):
    for existing in schedule:
        if has_conflict(existing, new_section):
            return False
    return True


def build_schedules(course_sections, index, current, results, limit=100):
    if len(results) >= limit:
        return

    if index == len(course_sections):
        results.append(current.copy())
        return

    for section in course_sections[index]:
        if is_valid_addition(current, section):
            current.append(section)
            build_schedules(course_sections, index + 1, current, results, limit)
            current.pop()


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
        build_schedules(course_sections, 0, [], results, limit=100)
        
        return {
            "count": len(results),
            "schedules": results
        }

    finally:
        cur.close()
        conn.close()