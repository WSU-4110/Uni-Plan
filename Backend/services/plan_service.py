from db import get_conn

def save_courses_to_plan(course_ids: list[int], user: str, term: int, name: str):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            DELETE FROM plan
            WHERE student_id = %s
              AND term_id = %s
              AND name = %s
            """,
            (user, term, name)
        )

        for course_id in course_ids:
            cur.execute(
                """
                INSERT INTO plan (student_id, course_id, term_id, name, is_active)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (user, course_id, term, name, True)
            )

        conn.commit()

        return {
            "success": True,
            "message": "Plan saved successfully"
        }
    
    except Exception as e:
        conn.rollback()
        return {
            "success": False,
            "message": str(e)
        }

    finally:
        conn.close()

def load_courses_from_plan(user: str, term: int, name: str):
    conn = get_conn()
    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT course_id
            FROM plan
            WHERE student_id = %s
              AND term_id = %s
              AND name = %s
            """,
            (user, term, name)
        )

        rows = cur.fetchall()
        courses = [row["course_id"] for row in rows]

        return {
            "success": True,
            "courses": courses
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e),
            "courses": []
        }
    
    finally:
        conn.close()