from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_active_user
from ..models.user import User
from ..schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> DashboardStats:
    """
    Get dashboard statistics.
    Returns mock data for development.
    TODO: Replace with real database queries when models are ready.
    """
    try:
        # For now, return static mock data
        # TODO: Replace with real database queries when models are ready
        stats = DashboardStats(
            totalPatients=120,
            totalDoctors=15,
            totalAppointments=50,
            todayAppointments=7,
            monthlyRevenue=12500.0,
            activePatients=85,
            pendingAppointments=5
        )
        
        print(f"Dashboard stats requested by user {current_user.username}")
        return stats
        
    except Exception as e:
        print(f"Error in dashboard stats: {e}")
        # Return fallback data if there's an error
        return DashboardStats(
            totalPatients=0,
            totalDoctors=0,
            totalAppointments=0,
            todayAppointments=0,
            monthlyRevenue=0.0,
            activePatients=0,
            pendingAppointments=0
        )


@router.get("/stats/dev", response_model=DashboardStats)
async def get_stats_dev() -> DashboardStats:
    """
    Get dashboard statistics without authentication for development.
    """
    try:
        # Return static mock data for development
        stats = DashboardStats(
            totalPatients=120,
            totalDoctors=15,
            totalAppointments=50,
            todayAppointments=7,
            monthlyRevenue=12500.0,
            activePatients=85,
            pendingAppointments=5
        )
        
        print("Dashboard stats requested (dev endpoint)")
        return stats
        
    except Exception as e:
        print(f"Error in dashboard stats (dev): {e}")
        # Return fallback data if there's an error
        return DashboardStats(
            totalPatients=0,
            totalDoctors=0,
            totalAppointments=0,
            todayAppointments=0,
            monthlyRevenue=0.0,
            activePatients=0,
            pendingAppointments=0
        ) 