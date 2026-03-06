import psycopg2


def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="your_db",
        user="your_user",
        password="your_password"
    )


def search_courses(
    credits=None,
    crn=None,
    course_number=None,
    class_name=None,
    subject=None
):

    base_query = """
        SELECT course.*
        FROM course
    """

    joins = []
    conditions = []
    params = []

    if crn is not None:
        joins.append("JOIN section ON course.id = section.course_id")
        conditions.append("section.crn = %s")
        params.append(crn)

    if credits is not None:
        conditions.append("course.credit_hours = %s")
        params.append(credits)

    if course_number is not None:
        conditions.append("course.course_number = %s")
        params.append(course_number)

    if class_name is not None:
        conditions.append("course.title ILIKE %s")
        params.append(f"%{class_name}%")

    if subject is not None:
        conditions.append("course.subject = %s")
        params.append(subject)

    query = base_query

    if joins:
        query += " " + " ".join(joins)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(query, params)

    columns = [desc[0] for desc in cur.description]
    results = [dict(zip(columns, row)) for row in cur.fetchall()]

    cur.close()
    conn.close()

    return results