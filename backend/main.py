from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend import models, database
from backend.routers import patients, doctors

# Create all tables in the database
models.Base.metadata.create_all(bind=database.engine)

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router)
app.include_router(doctors.router)

# Root route
@app.get("/")
def read_root():
    return {"message": "Welcome to VITALIt-OS backend 🚑"}
