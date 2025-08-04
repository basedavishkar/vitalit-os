from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routers import (
    patients, doctors, appointments, billing, auth
)
from backend.models import Base
from backend.core.database import engine
from backend.core.config import settings
# If you have custom middleware, exceptions, logger, update their imports here
# from backend.core.middleware import LoggingMiddleware, SecurityMiddleware, RateLimitMiddleware
# from backend.core.exceptions import VitalitException, create_http_exception
# from backend.core.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print("🏥 Vitalit OS starting up...")
    print(f"Version: {settings.version}")
    print(f"Database: {settings.database_url}")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # Shutdown
    print("🏥 Vitalit OS shutting down...")


app = FastAPI(
    title=settings.title,
    version=settings.version,
    description=settings.description,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
# app.add_middleware(LoggingMiddleware)
# app.add_middleware(SecurityMiddleware)
# app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


# Dashboard endpoint
@app.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics."""
    return {
        "totalPatients": 150,
        "totalDoctors": 25,
        "totalAppointments": 45,
        "todayAppointments": 12,
        "monthlyRevenue": 125000.00,
        "activePatients": 120,
        "pendingAppointments": 8
    }


# Simple login endpoint for development
@app.post("/auth/login")
async def simple_login(request: dict):
    """Simple login endpoint for development using role credentials."""
    from backend.routers.auth import ROLE_CREDENTIALS
    from datetime import datetime, timedelta
    import jwt
    import os
    
    username = request.get("username")
    password = request.get("password")
    
    if not username or not password:
        raise HTTPException(
            status_code=400, 
            detail="Username and password required"
        )
    
    # Check if username is a valid role and password matches
    if (username in ROLE_CREDENTIALS and 
        ROLE_CREDENTIALS[username] == password):
        # Create a simple token
        token_data = {
            "sub": username,
            "user_id": 1,
            "role": username,
            "exp": datetime.utcnow() + timedelta(minutes=30)
        }
        
        secret_key = os.getenv("SECRET_KEY", "your-secret-key")
        token = jwt.encode(token_data, secret_key, algorithm="HS256")
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 1800,
            "user": {
                "id": 1,
                "username": username,
                "email": f"{username}@vitalit.com",
                "role": username,
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    else:
        raise HTTPException(
            status_code=401, 
            detail="Invalid credentials"
        )


# Development endpoints (no auth required)
@app.get("/dev/patients")
async def get_dev_patients():
    """Get patients for development (no auth required)."""
    return [
        {"id": 1, "first_name": "John", "last_name": "Doe", "email": "john.doe@email.com"},
        {"id": 2, "first_name": "Jane", "last_name": "Smith", "email": "jane.smith@email.com"},
        {"id": 3, "first_name": "Bob", "last_name": "Johnson", "email": "bob.johnson@email.com"},
        {"id": 4, "first_name": "Alice", "last_name": "Brown", "email": "alice.brown@email.com"},
        {"id": 5, "first_name": "Charlie", "last_name": "Wilson", "email": "charlie.wilson@email.com"}
    ]


@app.get("/dev/doctors")
async def get_dev_doctors():
    """Get doctors for development (no auth required)."""
    return [
        {"id": 1, "first_name": "Dr. Sarah", "last_name": "Johnson", "specialization": "Cardiology"},
        {"id": 2, "first_name": "Dr. Michael", "last_name": "Chen", "specialization": "Neurology"},
        {"id": 3, "first_name": "Dr. Emily", "last_name": "Davis", "specialization": "Pediatrics"},
        {"id": 4, "first_name": "Dr. Robert", "last_name": "Wilson", "specialization": "Orthopedics"},
        {"id": 5, "first_name": "Dr. Lisa", "last_name": "Garcia", "specialization": "Dermatology"}
    ]


# Simple patients endpoint for testing (no auth required)
@app.get("/patients/simple")
async def get_patients_simple():
    """Get patients list (no auth required for development)."""
    try:
        from backend.core.database import SessionLocal
        from backend.models import Patient
        
        db = SessionLocal()
        patients = db.query(Patient).all()
        result = [
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
        db.close()
        return result
    except Exception as e:
        print(f"Error in get_patients_simple: {e}")
        return {"error": str(e)}


# Simple doctors endpoint for testing (no auth required)
@app.get("/doctors/simple")
async def get_doctors_simple():
    """Get doctors list (no auth required for development)."""
    try:
        from backend.core.database import SessionLocal
        from backend.models import Doctor
        
        db = SessionLocal()
        doctors = db.query(Doctor).filter(Doctor.is_active == True).all()
        result = [
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
        db.close()
        return result
    except Exception as e:
        print(f"Error in get_doctors_simple: {e}")
        return {"error": str(e)}

# Include routers with API prefix
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(patients.router, prefix=settings.api_prefix)
app.include_router(doctors.router, prefix=settings.api_prefix)
app.include_router(appointments.router, prefix=settings.api_prefix)
app.include_router(billing.router, prefix=settings.api_prefix)


