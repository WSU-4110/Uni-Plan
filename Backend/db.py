import psycopg2
import psycopg2.extras

def get_conn():
    conn = psycopg2.connect(
        host="localhost",
        dbname="your_db_name",
        user="your_username",
        password="your_password",
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn