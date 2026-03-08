import psycopg2
import psycopg2.extras

def get_conn():
    conn = psycopg2.connect(
        host="localhost",
        dbname="UniPlan-test",
        user="kimnahyun",
        password="5178",
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn