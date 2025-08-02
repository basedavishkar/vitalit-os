import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routers import (
    patients, doctors, appointments, records, billing, inventory, auth, system, analytics_dashboard
)
# from backend.routers import auth_enhanced, patients_enhanced, appointments_enhanced, ehr_enhanced, billing_enhanced, communication_hub
from backend.models import Base
from backend.database import engine
from backend.config import settings
from backend.middleware import LoggingMiddleware, SecurityMiddleware, RateLimitMiddleware
from backend.exceptions import VitalitException, create_http_exception
from backend.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Vitalit OS starting up...")
    logger.info(f"Version: {settings.version}")
    logger.info(f"Database: {settings.database_url}")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # Shutdown
    logger.info("Vitalit OS shutting down...")


app = FastAPI(
    title=settings.title,
    version=settings.version,
    description=settings.description,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(SecurityMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(VitalitException)
async def vitalit_exception_handler(request: Request, exc: VitalitException):
    """Handle custom Vitalit exceptions."""
    logger.error(f"VitalitException: {exc.message} - {exc.error_code}")
    return create_http_exception(exc)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "error_code": "INTERNAL_ERROR"
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.version}


# Simple dashboard endpoint for testing (no auth required)
@app.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get basic dashboard statistics."""
    from backend.database import SessionLocal
    from backend.models import Patient, Doctor, Appointment
    
    db = SessionLocal()
    try:
        total_patients = db.query(Patient).count()
        total_doctors = db.query(Doctor).filter(Doctor.is_active == True).count()
        total_appointments = db.query(Appointment).count()
        
        return {
            "totalPatients": total_patients,
            "totalDoctors": total_doctors,
            "totalAppointments": total_appointments,
            "todayAppointments": 0,  # Will be implemented later
            "monthlyRevenue": 0,     # Will be implemented later
            "activePatients": total_patients,
            "pendingAppointments": 0  # Will be implemented later
        }
    finally:
        db.close()


# Simple patients endpoint for testing (no auth required)
@app.get("/patients/simple")
async def get_patients_simple():
    """Get patients list (no auth required for development)."""
    from backend.database import SessionLocal
    from backend.models import Patient
    
    db = SessionLocal()
    try:
        patients = db.query(Patient).all()
        return [
            {
                "id": p.id,
                "patient_id": p.patient_id,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "email": p.email,
                "phone": p.phone,
                "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
                "gender": p.gender.value if p.gender else None,
                "address": p.address,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in patients
        ]
    finally:
        db.close()


# Simple doctors endpoint for testing (no auth required)
@app.get("/doctors/simple")
async def get_doctors_simple():
    """Get doctors list (no auth required for development)."""
    from backend.database import SessionLocal
    from backend.models import Doctor
    
    db = SessionLocal()
    try:
        doctors = db.query(Doctor).filter(Doctor.is_active == True).all()
        return [
            {
                "id": d.id,
                "doctor_id": d.doctor_id,
                "first_name": d.first_name,
                "last_name": d.last_name,
                "email": d.email,
                "phone": d.phone,
                "specialization": d.specialization,
                "license_number": d.license_number,
                "is_active": d.is_active,
                "created_at": d.created_at.isoformat() if d.created_at else None
            }
            for d in doctors
        ]
    finally:
        db.close()

# Include routers with API prefix
app.include_router(auth.router, prefix=settings.api_prefix)
# app.include_router(auth_enhanced.router, prefix=settings.api_prefix)
app.include_router(patients.router, prefix=settings.api_prefix)
# app.include_router(patients_enhanced.router, prefix=settings.api_prefix)
app.include_router(doctors.router, prefix=settings.api_prefix)
app.include_router(appointments.router, prefix=settings.api_prefix)
# app.include_router(appointments_enhanced.router, prefix=settings.api_prefix)
app.include_router(records.router, prefix=settings.api_prefix)
# app.include_router(ehr_enhanced.router, prefix=settings.api_prefix)
app.include_router(billing.router, prefix=settings.api_prefix)
# app.include_router(billing_enhanced.router, prefix=settings.api_prefix)
app.include_router(inventory.router, prefix=settings.api_prefix)
app.include_router(analytics_dashboard.router, prefix=settings.api_prefix)
# app.include_router(communication_hub.router, prefix=settings.api_prefix)
app.include_router(system.router, prefix=settings.api_prefix)


