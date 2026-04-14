from pydantic import BaseModel
from typing import List

class Course(BaseModel):
    subject: str
    course_number: str

class ScheduleRequest(BaseModel):
    courses: List[Course]
    days: List[str]
