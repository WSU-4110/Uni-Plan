from pydantic import BaseModel

class CourseList(BaseModel):
    course_ids: list[int]
    user: str
    term: int
    name: str

class RegisterCourseList(BaseModel):
    user: str
    course_ids: list[int]

class AdminCourseList(BaseModel):
    admin_user: str
    student_id: str
    course_ids: list[int]
    term: int
    name: str

class AdminRegisterCourseList(BaseModel):
    admin_user: str
    student_id: str
    course_ids: list[int]