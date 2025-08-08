from pydantic import BaseModel
from typing import Optional


class DashboardStats(BaseModel):
    totalPatients: int
    totalDoctors: int
    totalAppointments: int
    todayAppointments: int
    monthlyRevenue: float
    activePatients: int
    pendingAppointments: int 