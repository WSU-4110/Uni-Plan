from db import get_conn

def get_users():
    conn = get_conn()
    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id, password_hash, role
            FROM "user"
            """
        )

        rows = cur.fetchall()

        users = {}
        for row in rows:
            users[row["id"]] = {
                "password_hash": row["password_hash"],
                "role": row["role"]
            }

        return users

    finally:
        conn.close()