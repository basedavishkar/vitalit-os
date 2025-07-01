from fastapi import FastAPI
from backend.routers import patients, doctors
from backend import models, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.include_router(patients.router)
app.include_router(doctors.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to VITALIt-OS backend 🚑"}
