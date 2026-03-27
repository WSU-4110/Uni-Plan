from Backend.db import get_conn

def get_users():
    conn = get_conn()
    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id, password_hash
            FROM "user"
            """
        )

        rows = cur.fetchall()

        users = {}
        for row in rows:
            users[row["id"]] = row["password_hash"]

        return users

    finally:
        conn.close()