from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routers import (
    patients, doctors, appointments, records, billing, inventory, auth, system
)
from backend.models import Base
from backend.database import engine
from backend.config import settings
from backend.middleware import LoggingMiddleware, SecurityMiddleware, RateLimitMiddleware
from backend.exceptions import VitalitException, create_http_exception
from backend.logger import logger

# Create the database tables (if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.title,
    version=settings.version,
    description=settings.description,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(SecurityMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
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

# Include routers
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(patients.router, prefix=settings.api_prefix)
app.include_router(doctors.router, prefix=settings.api_prefix)
app.include_router(appointments.router, prefix=settings.api_prefix)
app.include_router(records.router, prefix=settings.api_prefix)
app.include_router(billing.router, prefix=settings.api_prefix)
app.include_router(inventory.router, prefix=settings.api_prefix)
app.include_router(system.router, prefix=settings.api_prefix)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    logger.info("Vitalit OS starting up...")
    logger.info(f"Version: {settings.version}")
    logger.info(f"Database: {settings.database_url}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    logger.info("Vitalit OS shutting down...")
