from pydantic import BaseModel
# Request model
class LoginRequest(BaseModel):
    username: str
    password: str