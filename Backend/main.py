from fastapi import FastAPI
from Backend.routers.courses import router as courses_router
from Backend.routers.plans import router as plans_router
from Backend.routers.auth import router as auth_router
from Backend.routers.generator import router as generator_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route (so you don't see "Not Found")
@app.get("/")
def root():
    return {"message": "FastAPI backend is running"}

app.include_router(auth_router, prefix="/api/auth")
app.include_router(courses_router, prefix="/api/courses")
app.include_router(plans_router, prefix="/api/plans")
app.include_router(generator_router, prefix="/api/generator")
