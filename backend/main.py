from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routers import (
    patients, doctors, appointments, billing, auth, dashboard,
)
from backend.models import Base
from backend.core.database import engine
from backend.core.config import settings
# If you have custom middleware, exceptions, logger, update their imports here
# from backend.core.middleware import LoggingMiddleware, SecurityMiddleware,
# RateLimitMiddleware
# from backend.core.exceptions import VitalitException, create_http_exception
# from backend.core.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print("🏥 Vitalit OS starting up...")
    print(f"Version: {settings.APP_VERSION}")
    print(f"Database: {settings.DATABASE_URL}")

    # Create database tables
    Base.metadata.create_all(bind=engine)

    yield

    # Shutdown
    print("🏥 Vitalit OS shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Add middleware
# app.add_middleware(LoggingMiddleware)
# app.add_middleware(SecurityMiddleware)
# app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://vitalit.vercel.app",
        "https://vitalit-os-l6br-git-main-av1shkars-projects.vercel.app",
        "https://vitalit-os-l6br-m9d5wbdpt-av1shkars-projects.vercel.app",
    ],
    allow_origin_regex=(
        r"https?://(localhost|127\.0\.0\.1)(:\d{1,5})?"
    ),
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
        "PATCH",
    ],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Global exception handler
# @app.exception_handler(VitalitException)
# async def vitalit_exception_handler(request: Request, exc: VitalitException):
#     """Handle custom Vitalit exceptions."""
#     print(f"VitalitException: {exc.message} - {exc.error_code}")
#     return create_http_exception(exc)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions."""
    print(f"Unhandled exception: {str(exc)}")
    import traceback

    print(f"Full stack trace: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "error_code": "INTERNAL_ERROR",
            "detail": (
                str(exc) if settings.DEBUG else "An unexpected error occurred"
            ),
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.APP_VERSION}


# Test endpoint for frontend debugging
@app.get("/test")
async def test_endpoint():
    """Test endpoint for frontend debugging."""
    return {
        "message": "Backend is working!",
        "timestamp": "2025-08-06T20:22:27Z",
    }


# Test patients endpoint (no auth required)
@app.get("/test/patients")
async def test_patients():
    """Test patients endpoint for frontend debugging."""
    return [
        {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "address": "123 Main St",
            "phone": "555-1234",
            "email": "john@example.com",
        },
        {
            "id": 2,
            "first_name": "Jane",
            "last_name": "Smith",
            "date_of_birth": "1985-05-15",
            "gender": "female",
            "address": "456 Oak Ave",
            "phone": "555-5678",
            "email": "jane@example.com",
        },
    ]


# Development endpoints for testing
@app.get("/dev/patients")
async def get_dev_patients():
    """Get development patients data."""
    return [
        {
            "id": 1,
            "patient_id": "P001",
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "blood_group": "A+",
            "address": "123 Main St",
            "phone": "555-0123",
            "email": "john.doe@email.com",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "555-0124",
            "emergency_contact_relationship": "Spouse",
            "insurance_provider": "Blue Cross",
            "insurance_number": "BC123456",
            "allergies": "None",
            "medical_history": "Hypertension",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": None,
        },
        {
            "id": 2,
            "patient_id": "P002",
            "first_name": "Jane",
            "last_name": "Smith",
            "date_of_birth": "1985-05-15",
            "gender": "female",
            "blood_group": "O+",
            "address": "456 Oak Ave",
            "phone": "555-0125",
            "email": "jane.smith@email.com",
            "emergency_contact_name": "John Smith",
            "emergency_contact_phone": "555-0126",
            "emergency_contact_relationship": "Spouse",
            "insurance_provider": "Aetna",
            "insurance_number": "AE789012",
            "allergies": "Penicillin",
            "medical_history": "Diabetes Type 2",
            "created_at": "2024-01-02T00:00:00",
            "updated_at": None,
        },
    ]


@app.get("/dev/doctors")
async def get_dev_doctors():
    """Get development doctors data."""
    return [
        {
            "id": 1,
            "doctor_id": "D001",
            "first_name": "Dr. Sarah",
            "last_name": "Johnson",
            "specialization": "Cardiology",
            "qualification": "MD, FACC",
            "license_number": "MD123456",
            "phone": "555-0201",
            "email": "sarah.johnson@vitalit.com",
            "address": "789 Medical Center Dr",
            "consultation_fee": 150.00,
            "is_active": True,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": None,
        },
        {
            "id": 2,
            "doctor_id": "D002",
            "first_name": "Dr. Michael",
            "last_name": "Chen",
            "specialization": "Neurology",
            "qualification": "MD, PhD",
            "license_number": "MD789012",
            "phone": "555-0202",
            "email": "michael.chen@vitalit.com",
            "address": "321 Neurology Ave",
            "consultation_fee": 200.00,
            "is_active": True,
            "created_at": "2024-01-02T00:00:00",
            "updated_at": None,
        },
    ]


@app.get("/patients/simple")
async def get_patients_simple():
    """Get simple patients list for development."""
    return [
        {
            "id": 1,
            "patient_id": "P001",
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "blood_group": "A+",
            "address": "123 Main St",
            "phone": "555-0123",
            "email": "john.doe@email.com",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "555-0124",
            "emergency_contact_relationship": "Spouse",
            "insurance_provider": "Blue Cross",
            "insurance_number": "BC123456",
            "allergies": "None",
            "medical_history": "Hypertension",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": None,
        },
        {
            "id": 2,
            "patient_id": "P002",
            "first_name": "Jane",
            "last_name": "Smith",
            "date_of_birth": "1985-05-15",
            "gender": "female",
            "blood_group": "O+",
            "address": "456 Oak Ave",
            "phone": "555-0125",
            "email": "jane.smith@email.com",
            "emergency_contact_name": "John Smith",
            "emergency_contact_phone": "555-0126",
            "emergency_contact_relationship": "Spouse",
            "insurance_provider": "Aetna",
            "insurance_number": "AE789012",
            "allergies": "Penicillin",
            "medical_history": "Diabetes Type 2",
            "created_at": "2024-01-02T00:00:00",
            "updated_at": None,
        },
    ]


@app.get("/doctors/simple")
async def get_doctors_simple():
    """Get simple doctors list for development."""
    return [
        {
            "id": 1,
            "doctor_id": "D001",
            "first_name": "Dr. Sarah",
            "last_name": "Johnson",
            "specialization": "Cardiology",
            "qualification": "MD, FACC",
            "license_number": "MD123456",
            "phone": "555-0201",
            "email": "sarah.johnson@vitalit.com",
            "address": "789 Medical Center Dr",
            "consultation_fee": 150.00,
            "is_active": True,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": None,
        },
        {
            "id": 2,
            "doctor_id": "D002",
            "first_name": "Dr. Michael",
            "last_name": "Chen",
            "specialization": "Neurology",
            "qualification": "MD, PhD",
            "license_number": "MD789012",
            "phone": "555-0202",
            "email": "michael.chen@vitalit.com",
            "address": "321 Neurology Ave",
            "consultation_fee": 200.00,
            "is_active": True,
            "created_at": "2024-01-02T00:00:00",
            "updated_at": None,
        },
    ]


# Include routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(billing.router)
app.include_router(dashboard.router)


