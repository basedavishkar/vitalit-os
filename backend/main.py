from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import patients, doctors
from backend import models, database

# Create the database tables (if they don't exist)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Enable CORS so your frontend (React) can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during dev you can allow all; tighten this in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(patients.router)
app.include_router(doctors.router)
