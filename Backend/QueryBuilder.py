import psycopg2


class QueryBuilder:

    def __init__(self):
        self.base_query = "SELECT course.* FROM course"
        self.joins = []
        self.conditions = []
        self.params = []

    def filter_crn(self, crn):
        self.joins.append("JOIN section ON course.id = section.course_id")
        self.conditions.append("section.crn = %s")
        self.params.append(crn)
        return self

    def filter_credits(self, credits):
        self.conditions.append("course.credit_hours = %s")
        self.params.append(credits)
        return self

    def filter_course_number(self, course_number):
        self.conditions.append("course.course_number = %s")
        self.params.append(course_number)
        return self

    def filter_class_name(self, class_name):
        self.conditions.append("course.title ILIKE %s")
        self.params.append(f"%{class_name}%")
        return self

    def filter_subject(self, subject):
        self.conditions.append("course.subject = %s")
        self.params.append(subject)
        return self

    def build(self):
        query = self.base_query

        if self.joins:
            query += " " + " ".join(self.joins)

        if self.conditions:
            query += " WHERE " + " AND ".join(self.conditions)

        return query, self.params

    def execute(self):
        query, params = self.build()

        conn = psycopg2.connect(
            host="localhost",
            database="your_db",
            user="your_user",
            password="your_password"
        )

        cur = conn.cursor()
        cur.execute(query, params)

        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in cur.fetchall()]

        cur.close()
        conn.close()

        return results