from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import patients

app = FastAPI()

# 👇 This fixes the CORS issue
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
# app.include_router(doctors.router)
