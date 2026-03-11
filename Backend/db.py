import psycopg2
import psycopg2.extras

def get_conn():
    conn = psycopg2.connect(
        host="localhost",
        dbname="UniPlan-test",
        user="username",  # change to your PostgreSQL username
        password="1234", # change to your PostgreSQL password
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn