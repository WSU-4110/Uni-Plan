from pydantic import BaseModel

class OverrideRequest(BaseModel):
    username: str
    password: str
    action: str
    