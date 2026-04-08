from fastapi import APIRouter, Query
from db import get_conn

router = APIRouter()

def days_str(r: dict) -> str:
    """boolean columns -> 'MWF' / 'TR' / 'TBA'"""
    out = ""
    if r.get("monday"):
        out += "M"
    if r.get("tuesday"):
        out += "T"
    if r.get("wednesday"):
        out += "W"
    if r.get("thursday"):
        out += "R"
    if r.get("friday"):
        out += "F"
    return out or "TBA"

def minutes_to_time_str(m):
    if m is None:
        return None
    hour = m // 100
    minute = m % 100
    return f"{hour:02d}:{minute:02d}"

def format_time_range(r: dict) -> str:
    start = r.get("start_min")
    end = r.get("end_min")
    if start is None or end is None:
        return "TBA"
    return f"{minutes_to_time_str(start)} - {minutes_to_time_str(end)}"

def format_location(r: dict) -> str:
    building = r.get("building")
    room = r.get("room_number")
    if building and room:
        return f"{building} {room}"
    if building:
        return building
    return "TBA"

@router.get("/search")
def search_courses(
    q: str = Query(default=""),
    term_id: int | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
):
    q = (q or "").strip().lower()

    sql = """
    SELECT
        s."CRN" AS crn,
        s.term_id AS term_id,
        c.id AS course_id,
        c.subject AS subject,
        c.course_number AS course_number,
        c.title AS title,
        c.credit_hours AS credit_hours,
        c.instructor AS instructor,
        c.building AS building,
        c.room_number AS room_number,
        t.monday AS monday,
        t.tuesday AS tuesday,
        t.wednesday AS wednesday,
        t.thursday AS thursday,
        t.friday AS friday,
        t.start_min AS start_min,
        t.end_min AS end_min,
        s.max_reg AS max_reg,
        s.registered AS registered
    FROM section s
    JOIN course c ON c.id = s.course_id
    LEFT JOIN time_slot t ON t.id = c.id
    WHERE
        (%(term_id)s IS NULL OR s.term_id = %(term_id)s)
        AND (
            %(q)s = '' OR
            LOWER(c.title) LIKE %(q_like)s OR
            LOWER(c.subject) LIKE %(q_like)s OR
            LOWER(c.course_number) LIKE %(q_like)s OR
            CAST(s."CRN" AS TEXT) LIKE %(q_like)s OR
            LOWER(COALESCE(c.instructor, '')) LIKE %(q_like)s
        )
    ORDER BY c.subject, c.course_number, s."CRN"
    LIMIT %(limit)s;
    """

    params = {
        "q": q,
        "q_like": f"%{q}%",
        "term_id": term_id,
        "limit": limit,
    }

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
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
                "maxSeats": max_seats,
                "registeredSeats": registered_seats,
                "availableSeats": max_seats - registered_seats,
            }
        )

    return {"results": results}