from pydantic import BaseModel

class CourseList(BaseModel):
    course_ids: list[int]
    user: str
    term: int
    name: str