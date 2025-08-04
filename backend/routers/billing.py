from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from backend import models, schemas
from backend.core import database
from backend.core import security as auth
from backend import audit
from backend.core.security import generate_bill_id, generate_payment_id

router = APIRouter(prefix="/billing", tags=["Billing"])

@router.post("/bills", response_model=schemas.Bill)
async def create_bill(
    bill_data: schemas.BillCreate,
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create a new bill with items."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(
        models.Patient.id == bill_data.patient_id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify appointment exists if provided
    if bill_data.appointment_id:
        appointment = db.query(models.Appointment).filter(
            models.Appointment.id == bill_data.appointment_id
        ).first()
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
    
    # Generate unique bill ID
    bill_id = generate_bill_id()
    
    # Create bill
    db_bill = models.Bill(
        bill_id=bill_id,
        patient_id=bill_data.patient_id,
        appointment_id=bill_data.appointment_id,
        bill_date=bill_data.bill_date,
        due_date=bill_data.due_date,
        subtotal=bill_data.subtotal,
        tax_amount=bill_data.tax_amount,
        discount_amount=bill_data.discount_amount,
        total_amount=bill_data.total_amount,
        paid_amount=0.0,
        payment_status=models.PaymentStatusEnum.PENDING,
        notes=bill_data.notes
    )
    
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    
    # Create bill items
    for item_data in bill_data.bill_items:
        db_item = models.BillItem(
            bill_id=db_bill.id,
            item_name=item_data.item_name,
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=item_data.total_price
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_bill)
    
    # Log bill creation
    audit.AuditLogger.log_create(
        db, current_user.id, "bills", db_bill.id,
        {
            "bill_id": bill_id,
            "patient_id": bill_data.patient_id,
            "total_amount": bill_data.total_amount,
            "items_count": len(bill_data.bill_items)
        },
        request
    )
    
    return db_bill

@router.get("/bills", response_model=List[schemas.Bill])
async def get_bills(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    status: Optional[str] = Query(None, description="Filter by payment status"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db)
):
    """Get bills with optional filtering."""
    
    query = db.query(models.Bill)
    
    # Apply filters
    if patient_id:
        query = query.filter(models.Bill.patient_id == patient_id)
    
    if status:
        query = query.filter(models.Bill.payment_status == status)
    
    if start_date:
        query = query.filter(models.Bill.bill_date >= start_date)
    
    if end_date:
        query = query.filter(models.Bill.bill_date <= end_date)
    
    # Apply pagination
    bills = query.order_by(models.Bill.bill_date.desc()).offset(skip).limit(limit).all()
    
    return bills

@router.get("/bills/{bill_id}", response_model=schemas.Bill)
async def get_bill(
    bill_id: int,
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db)
):
    """Get a specific bill by ID."""
    
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )
    
    return bill

@router.put("/bills/{bill_id}", response_model=schemas.Bill)
async def update_bill(
    bill_id: int,
    bill_data: schemas.BillUpdate,
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update a bill."""
    
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )
    
    # Store old values for audit
    old_values = {
        "patient_id": bill.patient_id,
        "appointment_id": bill.appointment_id,
        "bill_date": bill.bill_date,
        "due_date": bill.due_date,
        "subtotal": bill.subtotal,
        "tax_amount": bill.tax_amount,
        "discount_amount": bill.discount_amount,
        "total_amount": bill.total_amount,
        "notes": bill.notes
    }
    
    # Update bill fields
    update_data = bill_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bill, field, value)
    
    # Recalculate payment status
    if bill.paid_amount >= bill.total_amount:
        bill.payment_status = models.PaymentStatusEnum.PAID
    elif bill.paid_amount > 0:
        bill.payment_status = models.PaymentStatusEnum.PARTIAL
    else:
        bill.payment_status = models.PaymentStatusEnum.PENDING
    
    db.commit()
    db.refresh(bill)
    
    # Log bill update
    audit.AuditLogger.log_update(
        db, current_user.id, "bills", bill.id,
        old_values, update_data, request
    )
    
    return bill

@router.delete("/bills/{bill_id}")
async def delete_bill(
    bill_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Delete a bill (admin only)."""
    
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )
    
    # Check if bill has payments
    has_payments = db.query(models.Payment).filter(
        models.Payment.bill_id == bill_id
    ).first() is not None
    
    if has_payments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete bill with existing payments"
        )
    
    # Store old values for audit
    old_values = {
        "bill_id": bill.bill_id,
        "patient_id": bill.patient_id,
        "total_amount": bill.total_amount,
        "payment_status": bill.payment_status.value
    }
    
    # Delete bill items first
    db.query(models.BillItem).filter(models.BillItem.bill_id == bill_id).delete()
    
    # Delete bill
    db.delete(bill)
    db.commit()
    
    # Log bill deletion
    audit.AuditLogger.log_delete(
        db, current_user.id, "bills", bill_id,
        old_values, request
    )
    
    return {"message": "Bill deleted successfully"}

@router.post("/bills/{bill_id}/payments", response_model=schemas.Payment)
async def create_payment(
    bill_id: int,
    payment_data: schemas.PaymentCreate,
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create a payment for a bill."""
    
    # Verify bill exists
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )
    
    # Check if payment amount exceeds remaining balance
    remaining_balance = bill.total_amount - bill.paid_amount
    if payment_data.amount > remaining_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment amount exceeds remaining balance of ${remaining_balance:.2f}"
        )
    
    # Generate unique payment ID
    payment_id = generate_payment_id()
    
    # Create payment
    db_payment = models.Payment(
        payment_id=payment_id,
        bill_id=bill_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        payment_date=payment_data.payment_date,
        reference_number=payment_data.reference_number,
        notes=payment_data.notes
    )
    
    db.add(db_payment)
    
    # Update bill paid amount and status
    bill.paid_amount += payment_data.amount
    
    if bill.paid_amount >= bill.total_amount:
        bill.payment_status = models.PaymentStatusEnum.PAID
    else:
        bill.payment_status = models.PaymentStatusEnum.PARTIAL
    
    db.commit()
    db.refresh(db_payment)
    
    # Log payment creation
    audit.AuditLogger.log_create(
        db, current_user.id, "payments", db_payment.id,
        {
            "payment_id": payment_id,
            "bill_id": bill_id,
            "amount": payment_data.amount,
            "payment_method": payment_data.payment_method
        },
        request
    )
    
    return db_payment

@router.get("/bills/{bill_id}/payments", response_model=List[schemas.Payment])
async def get_bill_payments(
    bill_id: int,
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db)
):
    """Get all payments for a specific bill."""
    
    # Verify bill exists
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )
    
    payments = db.query(models.Payment).filter(
        models.Payment.bill_id == bill_id
    ).order_by(models.Payment.payment_date.desc()).all()
    
    return payments

@router.get("/payments", response_model=List[schemas.Payment])
async def get_payments(
    skip: int = 0,
    limit: int = 100,
    payment_method: Optional[str] = Query(None, description="Filter by payment method"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db)
):
    """Get payments with optional filtering."""
    
    query = db.query(models.Payment)
    
    # Apply filters
    if payment_method:
        query = query.filter(models.Payment.payment_method == payment_method)
    
    if start_date:
        query = query.filter(models.Payment.payment_date >= start_date)
    
    if end_date:
        query = query.filter(models.Payment.payment_date <= end_date)
    
    # Apply pagination
    payments = query.order_by(models.Payment.payment_date.desc()).offset(skip).limit(limit).all()
    
    return payments

@router.get("/reports/revenue")
async def get_revenue_report(
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db)
):
    """Get revenue report for the specified period."""
    
    query = db.query(models.Payment)
    
    if start_date:
        query = query.filter(models.Payment.payment_date >= start_date)
    
    if end_date:
        query = query.filter(models.Payment.payment_date <= end_date)
    
    # Get total revenue
    total_revenue = query.with_entities(func.sum(models.Payment.amount)).scalar() or 0
    
    # Get revenue by payment method
    revenue_by_method = db.query(
        models.Payment.payment_method,
        func.sum(models.Payment.amount).label('total')
    ).filter(query.whereclause).group_by(models.Payment.payment_method).all()
    
    # Get daily revenue
    daily_revenue = db.query(
        func.date(models.Payment.payment_date).label('date'),
        func.sum(models.Payment.amount).label('total')
    ).filter(query.whereclause).group_by(
        func.date(models.Payment.payment_date)
    ).order_by(func.date(models.Payment.payment_date)).all()
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "total_revenue": float(total_revenue),
        "revenue_by_method": [
            {"method": item.payment_method, "total": float(item.total)}
            for item in revenue_by_method
        ],
        "daily_revenue": [
            {"date": item.date.isoformat(), "total": float(item.total)}
            for item in daily_revenue
        ]
    }

@router.get("/reports/outstanding-bills")
async def get_outstanding_bills_report(
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db)
):
    """Get report of outstanding bills."""
    
    # Get outstanding bills
    outstanding_bills = db.query(models.Bill).filter(
        models.Bill.payment_status.in_([
            models.PaymentStatusEnum.PENDING,
            models.PaymentStatusEnum.PARTIAL
        ])
    ).all()
    
    # Calculate totals
    total_outstanding = sum(bill.total_amount - bill.paid_amount for bill in outstanding_bills)
    total_bills = len(outstanding_bills)
    
    # Group by status
    pending_bills = [b for b in outstanding_bills if b.payment_status == models.PaymentStatusEnum.PENDING]
    partial_bills = [b for b in outstanding_bills if b.payment_status == models.PaymentStatusEnum.PARTIAL]
    
    return {
        "total_outstanding_amount": float(total_outstanding),
        "total_outstanding_bills": total_bills,
        "pending_bills_count": len(pending_bills),
        "partial_bills_count": len(partial_bills),
        "outstanding_bills": outstanding_bills
    }

@router.get("/reports/patient-billing/{patient_id}")
async def get_patient_billing_report(
    patient_id: int,
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db)
):
    """Get billing report for a specific patient."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get all bills for patient
    bills = db.query(models.Bill).filter(
        models.Bill.patient_id == patient_id
    ).order_by(models.Bill.bill_date.desc()).all()
    
    # Calculate totals
    total_billed = sum(bill.total_amount for bill in bills)
    total_paid = sum(bill.paid_amount for bill in bills)
    total_outstanding = total_billed - total_paid
    
    # Get payment history
    payments = db.query(models.Payment).join(models.Bill).filter(
        models.Bill.patient_id == patient_id
    ).order_by(models.Payment.payment_date.desc()).all()
    
    return {
        "patient": patient,
        "billing_summary": {
            "total_bills": len(bills),
            "total_billed": float(total_billed),
            "total_paid": float(total_paid),
            "total_outstanding": float(total_outstanding)
        },
        "bills": bills,
        "payments": payments
    }
