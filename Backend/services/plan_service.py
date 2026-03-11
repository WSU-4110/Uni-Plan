from db import get_conn

def save_courses_to_plan(course_ids: list[int], user: str, term: int, name: str):
    conn = get_conn()
    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id
            FROM plan
            WHERE student_id = %s
              AND term_id = %s
              AND name = %s
            LIMIT 1
            """,
            (user, term, name)
        )
        plan = cur.fetchone()

        if not plan:
            cur.execute(
                """
                INSERT INTO plan (student_id, term_id, name, is_active)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (user, term, name, True)
            )
            plan = cur.fetchone()

        plan_id = plan["id"]

        cur.execute(
            """
            DELETE FROM plan_section
            WHERE plan_id = %s
              AND term_id = %s
            """,
            (plan_id, term)
        )

        for course_id in course_ids:
            cur.execute(
                """
                SELECT "CRN"
                FROM section
                WHERE course_id = %s
                  AND term_id = %s
                LIMIT 1
                """,
                (course_id, term)
            )
            section = cur.fetchone()

            if not section:
                continue

            crn = section["CRN"]

            cur.execute(
                """
                INSERT INTO plan_section (plan_id, "CRN", term_id)
                VALUES (%s, %s, %s)
                """,
                (plan_id, crn, term)
            )

        conn.commit()

        return {
            "success": True,
            "plan_id": plan_id
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
            SELECT id
            FROM plan
            WHERE student_id = %s
              AND term_id = %s
              AND name = %s
            LIMIT 1
            """,
            (user, term, name)
        )
        plan = cur.fetchone()

        if not plan:
            return {
                "success": False,
                "courses": []
            }

        plan_id = plan["id"]

        cur.execute(
            """
            SELECT s.course_id
            FROM plan_section ps
            JOIN section s
              ON ps."CRN" = s."CRN"
             AND ps.term_id = s.term_id
            WHERE ps.plan_id = %s
            """,
            (plan_id,)
        )
        courses = cur.fetchall()

        return {
            "success": True,
            "courses": courses
        }

    finally:
        conn.close()