from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, case, extract

from backend import database, models, schemas, audit
from backend.auth_enhanced import require_staff

router = APIRouter(prefix="/analytics", tags=["Analytics Dashboard"])


class DashboardMetrics:
    """Real-time dashboard metrics calculator"""
    
    @staticmethod
    def get_overview_metrics(db: Session) -> Dict[str, Any]:
        """Get overview metrics for dashboard"""
        today = date.today()
        start_of_month = today.replace(day=1)
        start_of_year = today.replace(month=1, day=1)
        
        # Total counts
        total_patients = db.query(models.Patient).count()
        total_doctors = db.query(models.Doctor).filter(models.Doctor.is_active == True).count()
        total_appointments = db.query(models.Appointment).count()
        total_bills = db.query(models.Bill).count()
        
        # Today's metrics
        today_appointments = db.query(models.Appointment).filter(
            func.date(models.Appointment.scheduled_datetime) == today
        ).count()
        
        today_patients = db.query(models.Patient).filter(
            func.date(models.Patient.created_at) == today
        ).count()
        
        # Monthly metrics
        monthly_appointments = db.query(models.Appointment).filter(
            func.date(models.Appointment.scheduled_datetime) >= start_of_month
        ).count()
        
        monthly_revenue = db.query(func.sum(models.Payment.amount)).filter(
            func.date(models.Payment.payment_date) >= start_of_month
        ).scalar() or 0
        
        # Yearly metrics
        yearly_revenue = db.query(func.sum(models.Payment.amount)).filter(
            func.date(models.Payment.payment_date) >= start_of_year
        ).scalar() or 0
        
        return {
            "overview": {
                "total_patients": total_patients,
                "total_doctors": total_doctors,
                "total_appointments": total_appointments,
                "total_bills": total_bills
            },
            "today": {
                "appointments": today_appointments,
                "new_patients": today_patients
            },
            "monthly": {
                "appointments": monthly_appointments,
                "revenue": float(monthly_revenue)
            },
            "yearly": {
                "revenue": float(yearly_revenue)
            }
        }
    
    @staticmethod
    def get_appointment_metrics(db: Session, days: int = 30) -> Dict[str, Any]:
        """Get appointment-related metrics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Appointment status distribution
        status_counts = db.query(
            models.Appointment.status,
            func.count(models.Appointment.id)
        ).filter(
            models.Appointment.scheduled_datetime >= start_date
        ).group_by(models.Appointment.status).all()
        
        # Daily appointments
        daily_appointments = db.query(
            func.date(models.Appointment.scheduled_datetime).label('date'),
            func.count(models.Appointment.id).label('count')
        ).filter(
            models.Appointment.scheduled_datetime >= start_date
        ).group_by(func.date(models.Appointment.scheduled_datetime)).all()
        
        # Doctor workload
        doctor_workload = db.query(
            models.Doctor.first_name,
            models.Doctor.last_name,
            func.count(models.Appointment.id).label('appointments')
        ).join(models.Appointment).filter(
            models.Appointment.scheduled_datetime >= start_date
        ).group_by(models.Doctor.id).order_by(
            func.count(models.Appointment.id).desc()
        ).limit(10).all()
        
        return {
            "status_distribution": [
                {"status": status.value, "count": count}
                for status, count in status_counts
            ],
            "daily_appointments": [
                {"date": str(day.date), "count": day.count}
                for day in daily_appointments
            ],
            "doctor_workload": [
                {
                    "doctor": f"Dr. {workload.first_name} {workload.last_name}",
                    "appointments": workload.appointments
                }
                for workload in doctor_workload
            ]
        }
    
    @staticmethod
    def get_financial_metrics(db: Session, days: int = 30) -> Dict[str, Any]:
        """Get financial metrics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Revenue by payment method
        revenue_by_method = db.query(
            models.Payment.payment_method,
            func.sum(models.Payment.amount).label('total')
        ).filter(
            models.Payment.payment_date >= start_date
        ).group_by(models.Payment.payment_method).all()
        
        # Daily revenue
        daily_revenue = db.query(
            func.date(models.Payment.payment_date).label('date'),
            func.sum(models.Payment.amount).label('revenue')
        ).filter(
            models.Payment.payment_date >= start_date
        ).group_by(func.date(models.Payment.payment_date)).all()
        
        # Outstanding bills
        outstanding_bills = db.query(
            func.sum(models.Bill.total_amount - models.Bill.paid_amount)
        ).filter(
            models.Bill.payment_status.in_([
                models.PaymentStatusEnum.PENDING,
                models.PaymentStatusEnum.PARTIAL
            ])
        ).scalar() or 0
        
        return {
            "revenue_by_method": [
                {"method": method, "total": float(total)}
                for method, total in revenue_by_method
            ],
            "daily_revenue": [
                {"date": str(day.date), "revenue": float(day.revenue)}
                for day in daily_revenue
            ],
            "outstanding_amount": float(outstanding_bills)
        }
    
    @staticmethod
    def get_patient_metrics(db: Session) -> Dict[str, Any]:
        """Get patient-related metrics"""
        # Age distribution
        age_distribution = db.query(
            case(
                (extract('year', func.age(models.Patient.date_of_birth)) < 18, 'Under 18'),
                (extract('year', func.age(models.Patient.date_of_birth)) < 30, '18-29'),
                (extract('year', func.age(models.Patient.date_of_birth)) < 50, '30-49'),
                (extract('year', func.age(models.Patient.date_of_birth)) < 65, '50-64'),
                else_='65+'
            ).label('age_group'),
            func.count(models.Patient.id).label('count')
        ).group_by('age_group').all()
        
        # Gender distribution
        gender_distribution = db.query(
            models.Patient.gender,
            func.count(models.Patient.id).label('count')
        ).group_by(models.Patient.gender).all()
        
        # Insurance coverage
        insurance_coverage = db.query(
            case(
                (models.Patient.insurance_provider.isnot(None), 'With Insurance'),
                else_='Without Insurance'
            ).label('coverage'),
            func.count(models.Patient.id).label('count')
        ).group_by('coverage').all()
        
        return {
            "age_distribution": [
                {"age_group": age.age_group, "count": age.count}
                for age in age_distribution
            ],
            "gender_distribution": [
                {"gender": gender.gender.value, "count": gender.count}
                for gender in gender_distribution
            ],
            "insurance_coverage": [
                {"coverage": coverage.coverage, "count": coverage.count}
                for coverage in insurance_coverage
            ]
        }


@router.get("/dashboard/overview")
async def get_dashboard_overview(
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get dashboard overview metrics"""
    return DashboardMetrics.get_overview_metrics(db)


@router.get("/dashboard/appointments")
async def get_appointment_metrics(
    days: int = Query(30, ge=1, le=365),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get appointment metrics"""
    return DashboardMetrics.get_appointment_metrics(db, days)


@router.get("/dashboard/financial")
async def get_financial_metrics(
    days: int = Query(30, ge=1, le=365),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get financial metrics"""
    return DashboardMetrics.get_financial_metrics(db, days)


@router.get("/dashboard/patients")
async def get_patient_metrics(
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get patient metrics"""
    return DashboardMetrics.get_patient_metrics(db)


@router.get("/reports/performance")
async def get_performance_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get comprehensive performance report"""
    # Patient satisfaction (simulated)
    total_appointments = db.query(models.Appointment).filter(
        and_(
            models.Appointment.scheduled_datetime >= start_date,
            models.Appointment.scheduled_datetime <= end_date
        )
    ).count()
    
    completed_appointments = db.query(models.Appointment).filter(
        and_(
            models.Appointment.scheduled_datetime >= start_date,
            models.Appointment.scheduled_datetime <= end_date,
            models.Appointment.status == models.AppointmentStatusEnum.COMPLETED
        )
    ).count()
    
    # Revenue metrics
    total_revenue = db.query(func.sum(models.Payment.amount)).filter(
        and_(
            models.Payment.payment_date >= start_date,
            models.Payment.payment_date <= end_date
        )
    ).scalar() or 0
    
    # New patients
    new_patients = db.query(models.Patient).filter(
        and_(
            func.date(models.Patient.created_at) >= start_date,
            func.date(models.Patient.created_at) <= end_date
        )
    ).count()
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "appointments": {
            "total": total_appointments,
            "completed": completed_appointments,
            "completion_rate": (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0
        },
        "revenue": {
            "total": float(total_revenue),
            "average_per_appointment": float(total_revenue / completed_appointments) if completed_appointments > 0 else 0
        },
        "patients": {
            "new_patients": new_patients
        }
    }


@router.get("/reports/doctor-performance")
async def get_doctor_performance_report(
    doctor_id: Optional[int] = Query(None),
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get doctor performance report"""
    query = db.query(models.Doctor)
    if doctor_id:
        query = query.filter(models.Doctor.id == doctor_id)
    
    doctors = query.all()
    
    performance_data = []
    for doctor in doctors:
        # Appointments
        appointments = db.query(models.Appointment).filter(
            and_(
                models.Appointment.doctor_id == doctor.id,
                models.Appointment.scheduled_datetime >= start_date,
                models.Appointment.scheduled_datetime <= end_date
            )
        ).all()
        
        completed = len([a for a in appointments if a.status == models.AppointmentStatusEnum.COMPLETED])
        cancelled = len([a for a in appointments if a.status == models.AppointmentStatusEnum.CANCELLED])
        
        # Revenue generated
        revenue = db.query(func.sum(models.Payment.amount)).join(models.Bill).filter(
            and_(
                models.Bill.doctor_id == doctor.id,
                models.Payment.payment_date >= start_date,
                models.Payment.payment_date <= end_date
            )
        ).scalar() or 0
        
        performance_data.append({
            "doctor_id": doctor.id,
            "doctor_name": f"Dr. {doctor.first_name} {doctor.last_name}",
            "specialization": doctor.specialization,
            "appointments": {
                "total": len(appointments),
                "completed": completed,
                "cancelled": cancelled,
                "completion_rate": (completed / len(appointments) * 100) if appointments else 0
            },
            "revenue": float(revenue)
        })
    
    return {
        "period": {"start_date": start_date, "end_date": end_date},
        "doctors": performance_data
    } 