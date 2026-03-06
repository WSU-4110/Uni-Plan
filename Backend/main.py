from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from QueryBuilder import QueryBuilder

app = FastAPI()

# Allow frontend to connect (development safe)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change later to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fake users 
users = [
    {"username": "habib", "password": "1234"},
    {"username": "jimin", "password": "password1"},
    {"username": "alyssa", "password": "planner2026"},
    {"username": "nahyun", "password": "schedule!"},
    {"username": "zach", "password": "uni123"},
]

# Request body model
class LoginRequest(BaseModel):
    username: str
    password: str


# LOGIN
@app.post("/api/login")
def login(data: LoginRequest):
    for user in users:
        if user["username"] == data.username and user["password"] == data.password:
            return {
                "success": True,
                "message": "Login successful"
            }

    return {
        "success": False,
        "message": "Invalid username or password"
    }


# LOGOUT
@app.post("/api/logout")
def logout():
    return {
        "success": True,
        "message": "Logged out successfully"
    }


# Root route (so you don't see "Not Found")
@app.get("/")
def root():
    return {"message": "FastAPI backend is running"}


@app.get("/courses")
def get_courses(
    credits: int | None = None,
    crn: int | None = None,
    course_number: int | None = None,
    class_name: str | None = None,
    subject: str | None = None
):

    builder = QueryBuilder()

    if crn:
        builder.filter_crn(crn)

    if credits:
        builder.filter_credits(credits)

    if course_number:
        builder.filter_course_number(course_number)

    if class_name:
        builder.filter_class_name(class_name)

    if subject:
        builder.filter_subject(subject)

    return builder.execute()