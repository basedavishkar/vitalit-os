import stripe
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from backend import database, models, schemas, audit
from backend.auth_enhanced import require_staff
from backend.config import settings

router = APIRouter(prefix="/billing", tags=["Enhanced Billing & Insurance"])

# Initialize Stripe
stripe.api_key = settings.stripe_secret_key


class AutomatedBilling:
    """Automated billing system"""
    
    @staticmethod
    def calculate_bill_amount(
        appointment_id: int,
        additional_services: List[Dict[str, Any]] = None
    ) -> Dict[str, float]:
        """Calculate bill amount based on appointment and services"""
        db = database.get_db()
        appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
        
        if not appointment:
            return {"error": "Appointment not found"}
        
        # Base consultation fee
        base_amount = appointment.doctor.consultation_fee
        
        # Add additional services
        services_total = 0
        if additional_services:
            for service in additional_services:
                services_total += service.get("amount", 0)
        
        subtotal = base_amount + services_total
        tax_rate = 0.08  # 8% tax
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount
        
        return {
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "total_amount": total_amount,
            "base_consultation": base_amount,
            "services": services_total
        }
    
    @staticmethod
    def generate_bill(
        db: Session,
        patient_id: int,
        appointment_id: int,
        bill_items: List[Dict[str, Any]],
        current_user: models.User
    ) -> models.Bill:
        """Generate automated bill"""
        # Calculate amounts
        subtotal = sum(item["total_price"] for item in bill_items)
        tax_amount = subtotal * 0.08  # 8% tax
        total_amount = subtotal + tax_amount
        
        # Create bill
        bill = models.Bill(
            bill_id=f"BILL{datetime.now().strftime('%Y%m%d%H%M%S')}",
            patient_id=patient_id,
            appointment_id=appointment_id,
            bill_date=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=30),
            subtotal=subtotal,
            tax_amount=tax_amount,
            discount_amount=0.0,
            total_amount=total_amount,
            paid_amount=0.0,
            payment_status=models.PaymentStatusEnum.PENDING
        )
        
        db.add(bill)
        db.commit()
        db.refresh(bill)
        
        # Create bill items
        for item_data in bill_items:
            bill_item = models.BillItem(
                bill_id=bill.id,
                item_name=item_data["item_name"],
                description=item_data.get("description"),
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=item_data["total_price"]
            )
            db.add(bill_item)
        
        db.commit()
        
        # Log bill generation
        audit.AuditLogger.log_action(
            db, current_user.id, "BILL_GENERATED", "bills",
            record_id=bill.id,
            new_values={
                "patient_id": patient_id,
                "appointment_id": appointment_id,
                "total_amount": total_amount
            }
        )
        
        return bill


class InsuranceProcessor:
    """Insurance claim processing"""
    
    @staticmethod
    def process_insurance_claim(
        db: Session,
        bill_id: int,
        insurance_provider: str,
        insurance_number: str
    ) -> Dict[str, Any]:
        """Process insurance claim for a bill"""
        bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
        if not bill:
            return {"error": "Bill not found"}
        
        # Simulate insurance processing
        # In production, this would integrate with actual insurance APIs
        coverage_percentage = 0.8  # 80% coverage
        covered_amount = bill.total_amount * coverage_percentage
        patient_responsibility = bill.total_amount - covered_amount
        
        # Create insurance claim record
        claim = models.InsuranceClaim(
            bill_id=bill_id,
            insurance_provider=insurance_provider,
            insurance_number=insurance_number,
            claim_amount=bill.total_amount,
            covered_amount=covered_amount,
            patient_responsibility=patient_responsibility,
            status="pending"
        )
        
        db.add(claim)
        db.commit()
        
        return {
            "claim_id": claim.id,
            "total_amount": bill.total_amount,
            "covered_amount": covered_amount,
            "patient_responsibility": patient_responsibility,
            "coverage_percentage": coverage_percentage
        }


class PaymentProcessor:
    """Payment processing with Stripe integration"""
    
    @staticmethod
    def create_payment_intent(
        amount: float,
        currency: str = "usd",
        metadata: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Create Stripe payment intent"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency=currency,
                metadata=metadata or {}
            )
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id
            }
        except stripe.error.StripeError as e:
            return {"error": str(e)}
    
    @staticmethod
    def process_payment(
        db: Session,
        bill_id: int,
        payment_method: str,
        amount: float,
        payment_intent_id: str = None,
        current_user: models.User = None
    ) -> models.Payment:
        """Process payment for a bill"""
        bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        # Create payment record
        payment = models.Payment(
            payment_id=f"PAY{datetime.now().strftime('%Y%m%d%H%M%S')}",
            bill_id=bill_id,
            amount=amount,
            payment_method=payment_method,
            payment_date=datetime.utcnow(),
            reference_number=payment_intent_id
        )
        
        db.add(payment)
        
        # Update bill payment status
        bill.paid_amount += amount
        if bill.paid_amount >= bill.total_amount:
            bill.payment_status = models.PaymentStatusEnum.PAID
        elif bill.paid_amount > 0:
            bill.payment_status = models.PaymentStatusEnum.PARTIAL
        
        db.commit()
        db.refresh(payment)
        
        # Log payment
        if current_user:
            audit.AuditLogger.log_action(
                db, current_user.id, "PAYMENT_PROCESSED", "payments",
                record_id=payment.id,
                new_values={
                    "bill_id": bill_id,
                    "amount": amount,
                    "payment_method": payment_method
                }
            )
        
        return payment


@router.post("/generate-bill")
async def generate_automated_bill(
    bill_data: schemas.AutomatedBillRequest,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Generate automated bill for appointment"""
    # Validate appointment exists
    appointment = db.query(models.Appointment).filter(models.Appointment.id == bill_data.appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Generate bill
    bill = AutomatedBilling.generate_bill(
        db, appointment.patient_id, bill_data.appointment_id, bill_data.bill_items, current_user
    )
    
    return bill


@router.post("/calculate-amount")
async def calculate_bill_amount(
    calculation_data: schemas.BillCalculationRequest,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Calculate bill amount before generation"""
    amounts = AutomatedBilling.calculate_bill_amount(
        calculation_data.appointment_id, calculation_data.additional_services
    )
    
    return amounts


@router.post("/insurance/claim")
async def process_insurance_claim(
    claim_data: schemas.InsuranceClaimRequest,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Process insurance claim for a bill"""
    result = InsuranceProcessor.process_insurance_claim(
        db, claim_data.bill_id, claim_data.insurance_provider, claim_data.insurance_number
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/payment/create-intent")
async def create_payment_intent(
    payment_data: schemas.PaymentIntentRequest,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Create payment intent for Stripe"""
    bill = db.query(models.Bill).filter(models.Bill.id == payment_data.bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    metadata = {
        "bill_id": str(payment_data.bill_id),
        "patient_id": str(bill.patient_id),
        "appointment_id": str(bill.appointment_id) if bill.appointment_id else ""
    }
    
    result = PaymentProcessor.create_payment_intent(
        payment_data.amount, payment_data.currency, metadata
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/payment/process")
async def process_payment(
    payment_data: schemas.PaymentProcessRequest,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Process payment for a bill"""
    payment = PaymentProcessor.process_payment(
        db, payment_data.bill_id, payment_data.payment_method, 
        payment_data.amount, payment_data.payment_intent_id, current_user
    )
    
    return payment


@router.get("/reports/revenue")
async def get_revenue_report(
    start_date: datetime.date = Query(...),
    end_date: datetime.date = Query(...),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get revenue report for date range"""
    # Get all payments in date range
    payments = db.query(models.Payment).filter(
        and_(
            models.Payment.payment_date >= start_date,
            models.Payment.payment_date <= end_date
        )
    ).all()
    
    # Calculate revenue by payment method
    revenue_by_method = {}
    total_revenue = 0
    
    for payment in payments:
        method = payment.payment_method
        amount = payment.amount
        
        if method not in revenue_by_method:
            revenue_by_method[method] = 0
        revenue_by_method[method] += amount
        total_revenue += amount
    
    # Get daily revenue
    daily_revenue = db.query(
        func.date(models.Payment.payment_date).label('date'),
        func.sum(models.Payment.amount).label('revenue')
    ).filter(
        and_(
            models.Payment.payment_date >= start_date,
            models.Payment.payment_date <= end_date
        )
    ).group_by(func.date(models.Payment.payment_date)).all()
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_revenue": total_revenue,
        "revenue_by_method": revenue_by_method,
        "daily_revenue": [
            {"date": str(day.date), "revenue": float(day.revenue)}
            for day in daily_revenue
        ]
    }


@router.get("/reports/outstanding")
async def get_outstanding_bills(
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get outstanding bills report"""
    outstanding_bills = db.query(models.Bill).filter(
        models.Bill.payment_status.in_([
            models.PaymentStatusEnum.PENDING,
            models.PaymentStatusEnum.PARTIAL
        ])
    ).all()
    
    total_outstanding = sum(bill.total_amount - bill.paid_amount for bill in outstanding_bills)
    
    return {
        "total_outstanding": total_outstanding,
        "bills_count": len(outstanding_bills),
        "bills": [
            {
                "bill_id": bill.bill_id,
                "patient_name": f"{bill.patient.first_name} {bill.patient.last_name}",
                "total_amount": bill.total_amount,
                "paid_amount": bill.paid_amount,
                "outstanding_amount": bill.total_amount - bill.paid_amount,
                "due_date": bill.due_date,
                "status": bill.payment_status.value
            }
            for bill in outstanding_bills
        ]
    }


@router.post("/bills/{bill_id}/send-reminder")
async def send_bill_reminder(
    bill_id: int,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Send bill reminder to patient"""
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Send email reminder (simplified)
    if bill.patient.email:
        # In production, send actual email
        print(f"Sending bill reminder to {bill.patient.email}")
        
        # Log reminder sent
        audit.AuditLogger.log_action(
            db, current_user.id, "BILL_REMINDER_SENT", "bills",
            record_id=bill_id
        )
        
        return {"message": "Bill reminder sent successfully"}
    else:
        raise HTTPException(status_code=400, detail="Patient has no email address") 