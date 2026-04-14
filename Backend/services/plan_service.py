from fastapi import HTTPException
from Backend.db import get_conn
from Backend.routers.courses import days_str, format_location, format_time_range

def save_courses_to_plan(course_ids, user, term, name):

    conn = get_conn()
    try:
        cur = conn.cursor()

        delete_sql = "DELETE FROM plan WHERE student_id = %s AND term_id = %s AND name = %s"
        cur.execute(delete_sql, (user, term, name))

        for course_id in course_ids:
            sql = "INSERT INTO plan(student_id, course_id, term_id, name, is_active) VALUES (%s, %s, %s, %s, %s)"
            cur.execute(sql, (user, course_id, term, name, True))

        conn.commit()

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save plan: {e}")

    finally:
        conn.close()

    return {"success": True, "received": course_ids}

def load_courses_from_plan(user: str, term: int, name: str):

    conn = get_conn()

    try:
        cur = conn.cursor()

        sql = "SELECT course_id FROM plan WHERE student_id = %s AND term_id = %s AND name = %s"
        cur.execute(sql, (user, term, name))

        result = cur.fetchall()

        course_ids = [r["course_id"] for r in result]

        if not course_ids:
            return {"results": []}

        sql = """
        SELECT
            s."CRN" AS crn,
            s.term_id AS term_id,
            s.max_reg AS max_reg,
            s.registered AS registered,
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
          AND s.term_id = %s
        ORDER BY c.subject, c.course_number
        """

        cur.execute(sql, (course_ids, term))
        rows = cur.fetchall()

    finally:
        conn.close()

    results = []

    for r in rows:
        max_seats = r["max_reg"] or 0
        registered_seats = r["registered"] or 0

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

                # WeeklySchedule format
                "meetingDays": days_str(r),
                "meetingTime": format_time_range(r),
                "building": r["building"],
                "room": r["room_number"],

                # raw values for conflict detection
                "startMin": r["start_min"],
                "endMin": r["end_min"],
                "monday": r["monday"],
                "tuesday": r["tuesday"],
                "wednesday": r["wednesday"],
                "thursday": r["thursday"],
                "friday": r["friday"],

                "maxSeats": max_seats,
                "registeredSeats": registered_seats,
                "availableSeats": max_seats - registered_seats,
            }
        )

    return {"results": results}


def load_plans_from_user(user: str):
    conn = get_conn()
    try:
        cur = conn.cursor()

        sql = "SELECT DISTINCT name FROM plan WHERE student_id = %s"
        cur.execute(sql, (user,))

        result = cur.fetchall()
        planName = [r["name"] for r in result]

        results = [{"planName": r} for r in planName]

        return {"results": results}

    except Exception as e:
        print("ERROR in load_plans:", e)
        raise
    finally:
        conn.close()