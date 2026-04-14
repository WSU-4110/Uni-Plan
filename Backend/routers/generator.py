from fastapi import APIRouter, Request
from Backend.schemas.generator_schema import Course, ScheduleRequest
from Backend.db import get_conn
from psycopg2.extras import RealDictCursor

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
    if a["start_min"] is None or b["start_min"] is None:
        return False
    return not (a["end_min"] <= b["start_min"] or b["end_min"] <= a["start_min"])

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


@router.post("/generate-schedules")
async def generate_schedules(request_data: ScheduleRequest):
    courses = request_data.courses
    days = request_data.days
    blocked_days = set(day.lower() for day in days)

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    course_sections = []

    try:
        # Wrap main logic in a try/except to catch runtime errors
        try:
            #print("Courses received:", courses)  # debug

            for course in courses:
                #print("Processing course:", course.subject, course.course_number)
                cur.execute(
                    "SELECT id FROM course WHERE subject=%s AND course_number=%s AND credit_hours > 0",
                    (course.subject, course.course_number)
                )
                course_rows = cur.fetchall()
                #print("course_rows:", course_rows)  # debug

                if not course_rows:
                    continue

                all_sections = []

                for row in course_rows:
                    course_id = row["id"]
                    cur.execute("""
                        SELECT c.id AS section_id,
                            t.start_min,
                            t.end_min,
                            t.monday,
                            t.tuesday,
                            t.wednesday,
                            t.thursday,
                            t.friday
                        FROM course c
                        JOIN time_slot t ON t.id = c.id
                        WHERE c.id = %s;
                    """, (course_id,))
                    sections = cur.fetchall()
                    #print("sections:", sections)  # debug

                    for s in sections:
                        all_sections.append({

                            "course_id": course_id,
                            "time_slot": {
                                "start_min": s.get("start_min"),
                                "end_min": s.get("end_min"),
                                "monday": s.get("monday"),
                                "tuesday": s.get("tuesday"),
                                "wednesday": s.get("wednesday"),
                                "thursday": s.get("thursday"),
                                "friday": s.get("friday"),
                            }
                        })

                if all_sections:
                    course_sections.append(all_sections)

            results = []
            build_schedules(course_sections, 0, [], results, limit=100)

            return {
                "count": len(results),
                "schedules": results
            }

        except Exception as e:
            print("ERROR in generate_schedules:", e)
            raise  # re-raise so FastAPI still returns 500 but you get console logs

    finally:
        cur.close()
        conn.close()