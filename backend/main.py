from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import patients, doctors, appointments, records, billing, inventory
from backend import models, database


# Create the database tables (if they don't exist)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # front‑end origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(records.router)
app.include_router(billing.router)
app.include_router(inventory.router)
