from fastapi import HTTPException, status
from typing import Any, Dict


class VitalitException(Exception):
    """Base exception for Vitalit OS."""
    
    def __init__(self, message: str, error_code: str = None, 
                 details: Dict[str, Any] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class DatabaseException(VitalitException):
    """Database-related exceptions."""
    pass


class ValidationException(VitalitException):
    """Data validation exceptions."""
    pass


class AuthenticationException(VitalitException):
    """Authentication-related exceptions."""
    pass


class AuthorizationException(VitalitException):
    """Authorization-related exceptions."""
    pass


class BusinessLogicException(VitalitException):
    """Business logic violations."""
    pass


class ResourceNotFoundException(VitalitException):
    """Resource not found exceptions."""
    pass


class ConflictException(VitalitException):
    """Resource conflict exceptions."""
    pass


def create_http_exception(
    exception: VitalitException,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
) -> HTTPException:
    """Convert VitalitException to HTTPException."""
    return HTTPException(
        status_code=status_code,
        detail={
            "message": exception.message,
            "error_code": exception.error_code,
            "details": exception.details
        }
    )


# Predefined exceptions
class PatientNotFoundException(ResourceNotFoundException):
    def __init__(self, patient_id: str):
        super().__init__(
            f"Patient with ID {patient_id} not found",
            "PATIENT_NOT_FOUND",
            {"patient_id": patient_id}
        )


class DoctorNotFoundException(ResourceNotFoundException):
    def __init__(self, doctor_id: str):
        super().__init__(
            f"Doctor with ID {doctor_id} not found",
            "DOCTOR_NOT_FOUND",
            {"doctor_id": doctor_id}
        )


class AppointmentConflictException(ConflictException):
    def __init__(self, doctor_id: int, scheduled_datetime: str):
        super().__init__(
            "Appointment time conflict with existing appointment",
            "APPOINTMENT_CONFLICT",
            {
                "doctor_id": doctor_id,
                "scheduled_datetime": scheduled_datetime
            }
        )


class InsufficientInventoryException(BusinessLogicException):
    def __init__(self, item_name: str, required: int, available: int):
        super().__init__(
            f"Insufficient inventory for {item_name}",
            "INSUFFICIENT_INVENTORY",
            {
                "item_name": item_name,
                "required": required,
                "available": available
            }
        )


class InvalidCredentialsException(AuthenticationException):
    def __init__(self):
        super().__init__(
            "Invalid username or password",
            "INVALID_CREDENTIALS"
        )


class InsufficientPermissionsException(AuthorizationException):
    def __init__(self, required_role: str, user_role: str):
        super().__init__(
            f"Insufficient permissions. Required: {required_role}, "
            f"User has: {user_role}",
            "INSUFFICIENT_PERMISSIONS",
            {
                "required_role": required_role,
                "user_role": user_role
            }
        ) 