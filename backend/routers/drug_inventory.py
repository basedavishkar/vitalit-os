from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import date, datetime, timedelta
import secrets

from backend.core.database import get_db
from backend.core.security import get_current_active_user
from backend.models.inventory import Drug, DrugBatch, InventoryTransaction, TransactionTypeEnum
from backend.models.user import User
from backend.schemas.inventory import (
    Drug as DrugSchema,
    DrugCreate,
    DrugUpdate,
    DrugBatch as DrugBatchSchema,
    DrugBatchCreate,
    DrugBatchUpdate,
    InventoryTransaction as InventoryTransactionSchema,
    InventoryTransactionCreate,
)

router = APIRouter(prefix="/inventory", tags=["Drug Inventory"])


# ==================== DRUG MANAGEMENT ====================

@router.post("/drugs", response_model=DrugSchema, status_code=status.HTTP_201_CREATED)
def create_drug(
    drug: DrugCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new drug in the inventory catalog"""
    # Generate unique drug code
    drug_code = f"DRG{secrets.token_hex(4).upper()}"
    
    db_drug = Drug(
        drug_code=drug_code,
        **drug.dict()
    )
    db.add(db_drug)
    db.commit()
    db.refresh(db_drug)
    return db_drug


@router.get("/drugs", response_model=List[DrugSchema])
def list_drugs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    category: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all drugs with optional filtering"""
    query = db.query(Drug)
    
    if active_only:
        query = query.filter(Drug.is_active == True)
    
    if search:
        search_filter = or_(
            Drug.name.ilike(f"%{search}%"),
            Drug.generic_name.ilike(f"%{search}%"),
            Drug.drug_code.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if category:
        query = query.filter(Drug.category == category)
    
    return query.offset(skip).limit(limit).all()


@router.get("/drugs/{drug_id}", response_model=DrugSchema)
def get_drug(
    drug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific drug by ID"""
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")
    return drug


@router.put("/drugs/{drug_id}", response_model=DrugSchema)
def update_drug(
    drug_id: int,
    drug_update: DrugUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update drug information"""
    db_drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not db_drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    update_data = drug_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_drug, field, value)

    db.commit()
    db.refresh(db_drug)
    return db_drug


@router.delete("/drugs/{drug_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_drug(
    drug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Soft delete a drug (mark as inactive)"""
    db_drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not db_drug:
        raise HTTPException(status_code=404, detail="Drug not found")
    
    db_drug.is_active = False
    db.commit()
    return None


# ==================== BATCH MANAGEMENT ====================

@router.post("/batches", response_model=DrugBatchSchema, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch: DrugBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a new batch of drugs to inventory"""
    # Verify drug exists
    drug = db.query(Drug).filter(Drug.id == batch.drug_id).first()
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")
    
    # Calculate total cost
    total_cost = batch.quantity_received * batch.unit_cost
    
    db_batch = DrugBatch(
        **batch.dict(),
        quantity_available=batch.quantity_received,
        total_cost=total_cost
    )
    db.add(db_batch)
    
    # Create purchase transaction
    transaction_id = f"TXN{secrets.token_hex(4).upper()}"
    transaction = InventoryTransaction(
        transaction_id=transaction_id,
        drug_id=batch.drug_id,
        batch_id=None,  # Will be updated after batch is created
        transaction_type=TransactionTypeEnum.PURCHASE,
        quantity=batch.quantity_received,
        unit_price=batch.unit_cost,
        total_amount=total_cost,
        reference_number=batch.purchase_order_number,
        created_by=current_user.id
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(db_batch)
    
    # Update transaction with batch_id
    transaction.batch_id = db_batch.id
    db.commit()

    return db_batch


@router.get("/batches", response_model=List[DrugBatchSchema])
def list_batches(
    drug_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all drug batches"""
    query = db.query(DrugBatch)

    if drug_id:
        query = query.filter(DrugBatch.drug_id == drug_id)

    if active_only:
        query = query.filter(DrugBatch.is_active == True)

    return query.order_by(DrugBatch.expiry_date).offset(skip).limit(limit).all()


@router.get("/batches/{batch_id}", response_model=DrugBatchSchema)
def get_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific batch by ID"""
    batch = db.query(DrugBatch).filter(DrugBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.put("/batches/{batch_id}", response_model=DrugBatchSchema)
def update_batch(
    batch_id: int,
    batch_update: DrugBatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update batch information"""
    db_batch = db.query(DrugBatch).filter(DrugBatch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    update_data = batch_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_batch, field, value)

    db.commit()
    db.refresh(db_batch)
    return db_batch


# ==================== STOCK MANAGEMENT ====================

@router.get("/stock/summary")
def get_stock_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get overall stock summary with total available quantities per drug"""
    # Get total available quantity per drug from all active batches
    stock_query = db.query(
        Drug.id,
        Drug.drug_code,
        Drug.name,
        Drug.generic_name,
        Drug.category,
        Drug.unit,
        Drug.minimum_stock,
        Drug.reorder_level,
        func.sum(DrugBatch.quantity_available).label('total_available')
    ).join(
        DrugBatch, Drug.id == DrugBatch.drug_id
    ).filter(
        Drug.is_active == True,
        DrugBatch.is_active == True
    ).group_by(Drug.id).all()

    summary = []
    for item in stock_query:
        total_available = item.total_available or 0
        status = "adequate"

        if total_available == 0:
            status = "out_of_stock"
        elif total_available <= item.minimum_stock:
            status = "critical"
        elif total_available <= item.reorder_level:
            status = "low"

        summary.append({
            "drug_id": item.id,
            "drug_code": item.drug_code,
            "name": item.name,
            "generic_name": item.generic_name,
            "category": item.category,
            "unit": item.unit,
            "total_available": total_available,
            "minimum_stock": item.minimum_stock,
            "reorder_level": item.reorder_level,
            "status": status
        })

    return summary


@router.get("/stock/low-stock")
def get_low_stock_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get drugs with low stock levels (below reorder level)"""
    stock_query = db.query(
        Drug.id,
        Drug.drug_code,
        Drug.name,
        Drug.generic_name,
        Drug.minimum_stock,
        Drug.reorder_level,
        func.sum(DrugBatch.quantity_available).label('total_available')
    ).join(
        DrugBatch, Drug.id == DrugBatch.drug_id
    ).filter(
        Drug.is_active == True,
        DrugBatch.is_active == True
    ).group_by(Drug.id).having(
        func.sum(DrugBatch.quantity_available) <= Drug.reorder_level
    ).all()

    low_stock = []
    for item in stock_query:
        low_stock.append({
            "drug_id": item.id,
            "drug_code": item.drug_code,
            "name": item.name,
            "generic_name": item.generic_name,
            "total_available": item.total_available or 0,
            "minimum_stock": item.minimum_stock,
            "reorder_level": item.reorder_level,
            "shortage": item.reorder_level - (item.total_available or 0)
        })

    return low_stock


@router.get("/stock/expiring")
def get_expiring_items(
    days: int = Query(30, ge=1, le=365, description="Number of days to check for expiry"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get drugs expiring within specified days"""
    expiry_date = date.today() + timedelta(days=days)

    expiring_batches = db.query(
        DrugBatch.id,
        DrugBatch.batch_number,
        DrugBatch.expiry_date,
        DrugBatch.quantity_available,
        Drug.id.label('drug_id'),
        Drug.drug_code,
        Drug.name,
        Drug.generic_name,
        Drug.unit
    ).join(
        Drug, DrugBatch.drug_id == Drug.id
    ).filter(
        DrugBatch.is_active == True,
        DrugBatch.quantity_available > 0,
        DrugBatch.expiry_date <= expiry_date,
        DrugBatch.expiry_date >= date.today()
    ).order_by(DrugBatch.expiry_date).all()

    expiring = []
    for batch in expiring_batches:
        days_to_expiry = (batch.expiry_date - date.today()).days
        urgency = "critical" if days_to_expiry <= 7 else "warning" if days_to_expiry <= 30 else "notice"

        expiring.append({
            "batch_id": batch.id,
            "batch_number": batch.batch_number,
            "drug_id": batch.drug_id,
            "drug_code": batch.drug_code,
            "name": batch.name,
            "generic_name": batch.generic_name,
            "unit": batch.unit,
            "quantity_available": batch.quantity_available,
            "expiry_date": batch.expiry_date.isoformat(),
            "days_to_expiry": days_to_expiry,
            "urgency": urgency
        })

    return expiring


@router.get("/stock/expired")
def get_expired_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get expired drugs that still have available quantity"""
    expired_batches = db.query(
        DrugBatch.id,
        DrugBatch.batch_number,
        DrugBatch.expiry_date,
        DrugBatch.quantity_available,
        Drug.id.label('drug_id'),
        Drug.drug_code,
        Drug.name,
        Drug.generic_name,
        Drug.unit
    ).join(
        Drug, DrugBatch.drug_id == Drug.id
    ).filter(
        DrugBatch.is_active == True,
        DrugBatch.quantity_available > 0,
        DrugBatch.expiry_date < date.today()
    ).order_by(DrugBatch.expiry_date).all()

    expired = []
    for batch in expired_batches:
        days_expired = (date.today() - batch.expiry_date).days

        expired.append({
            "batch_id": batch.id,
            "batch_number": batch.batch_number,
            "drug_id": batch.drug_id,
            "drug_code": batch.drug_code,
            "name": batch.name,
            "generic_name": batch.generic_name,
            "unit": batch.unit,
            "quantity_available": batch.quantity_available,
            "expiry_date": batch.expiry_date.isoformat(),
            "days_expired": days_expired
        })

    return expired


# ==================== TRANSACTIONS ====================

@router.post("/transactions", response_model=InventoryTransactionSchema, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction: InventoryTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new inventory transaction (sale, return, adjustment, etc.)"""
    # Verify drug exists
    drug = db.query(Drug).filter(Drug.id == transaction.drug_id).first()
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    # If batch_id provided, verify it exists and has enough quantity
    if transaction.batch_id:
        batch = db.query(DrugBatch).filter(DrugBatch.id == transaction.batch_id).first()
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")

        if transaction.transaction_type in [TransactionTypeEnum.SALE, TransactionTypeEnum.EXPIRED, TransactionTypeEnum.DAMAGED]:
            if batch.quantity_available < transaction.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient quantity in batch. Available: {batch.quantity_available}"
                )

    # Generate transaction ID
    transaction_id = f"TXN{secrets.token_hex(4).upper()}"

    # Calculate total amount
    unit_price = transaction.unit_price or drug.selling_price
    total_amount = unit_price * transaction.quantity

    # Create transaction
    db_transaction = InventoryTransaction(
        transaction_id=transaction_id,
        **transaction.dict(),
        unit_price=unit_price,
        total_amount=total_amount,
        created_by=current_user.id
    )
    db.add(db_transaction)

    # Update batch quantities based on transaction type
    if transaction.batch_id:
        batch = db.query(DrugBatch).filter(DrugBatch.id == transaction.batch_id).first()

        if transaction.transaction_type == TransactionTypeEnum.SALE:
            batch.quantity_available -= transaction.quantity
            batch.quantity_sold += transaction.quantity
        elif transaction.transaction_type == TransactionTypeEnum.RETURN:
            batch.quantity_available += transaction.quantity
            batch.quantity_sold -= transaction.quantity
        elif transaction.transaction_type == TransactionTypeEnum.EXPIRED:
            batch.quantity_available -= transaction.quantity
            batch.quantity_expired += transaction.quantity
        elif transaction.transaction_type == TransactionTypeEnum.DAMAGED:
            batch.quantity_available -= transaction.quantity
            batch.quantity_damaged += transaction.quantity
        elif transaction.transaction_type == TransactionTypeEnum.ADJUSTMENT:
            # Adjustment can be positive or negative
            batch.quantity_available += transaction.quantity

    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.get("/transactions", response_model=List[InventoryTransactionSchema])
def list_transactions(
    drug_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all inventory transactions"""
    query = db.query(InventoryTransaction)

    if drug_id:
        query = query.filter(InventoryTransaction.drug_id == drug_id)

    if transaction_type:
        query = query.filter(InventoryTransaction.transaction_type == transaction_type)

    return query.order_by(InventoryTransaction.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/transactions/{transaction_id}", response_model=InventoryTransactionSchema)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific transaction by ID"""
    transaction = db.query(InventoryTransaction).filter(InventoryTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


# ==================== ALERTS & NOTIFICATIONS ====================

@router.get("/alerts")
def get_inventory_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all inventory alerts (low stock, expiring, expired)"""
    alerts = {
        "low_stock": [],
        "expiring_soon": [],
        "expired": [],
        "out_of_stock": []
    }

    # Low stock alerts
    low_stock_query = db.query(
        Drug.id,
        Drug.drug_code,
        Drug.name,
        Drug.minimum_stock,
        Drug.reorder_level,
        func.sum(DrugBatch.quantity_available).label('total_available')
    ).join(
        DrugBatch, Drug.id == DrugBatch.drug_id
    ).filter(
        Drug.is_active == True,
        DrugBatch.is_active == True
    ).group_by(Drug.id).having(
        func.sum(DrugBatch.quantity_available) <= Drug.reorder_level
    ).all()

    for item in low_stock_query:
        total_available = item.total_available or 0
        if total_available == 0:
            alerts["out_of_stock"].append({
                "drug_id": item.id,
                "drug_code": item.drug_code,
                "name": item.name,
                "severity": "critical",
                "message": f"{item.name} is out of stock"
            })
        else:
            alerts["low_stock"].append({
                "drug_id": item.id,
                "drug_code": item.drug_code,
                "name": item.name,
                "total_available": total_available,
                "reorder_level": item.reorder_level,
                "severity": "critical" if total_available <= item.minimum_stock else "warning",
                "message": f"{item.name} stock is low ({total_available} {item.name} remaining)"
            })

    # Expiring soon (within 30 days)
    expiry_date = date.today() + timedelta(days=30)
    expiring_batches = db.query(
        DrugBatch.id,
        DrugBatch.batch_number,
        DrugBatch.expiry_date,
        DrugBatch.quantity_available,
        Drug.drug_code,
        Drug.name
    ).join(
        Drug, DrugBatch.drug_id == Drug.id
    ).filter(
        DrugBatch.is_active == True,
        DrugBatch.quantity_available > 0,
        DrugBatch.expiry_date <= expiry_date,
        DrugBatch.expiry_date >= date.today()
    ).all()

    for batch in expiring_batches:
        days_to_expiry = (batch.expiry_date - date.today()).days
        severity = "critical" if days_to_expiry <= 7 else "warning"

        alerts["expiring_soon"].append({
            "batch_id": batch.id,
            "batch_number": batch.batch_number,
            "drug_code": batch.drug_code,
            "name": batch.name,
            "quantity": batch.quantity_available,
            "expiry_date": batch.expiry_date.isoformat(),
            "days_to_expiry": days_to_expiry,
            "severity": severity,
            "message": f"{batch.name} (Batch: {batch.batch_number}) expires in {days_to_expiry} days"
        })

    # Expired items
    expired_batches = db.query(
        DrugBatch.id,
        DrugBatch.batch_number,
        DrugBatch.expiry_date,
        DrugBatch.quantity_available,
        Drug.drug_code,
        Drug.name
    ).join(
        Drug, DrugBatch.drug_id == Drug.id
    ).filter(
        DrugBatch.is_active == True,
        DrugBatch.quantity_available > 0,
        DrugBatch.expiry_date < date.today()
    ).all()

    for batch in expired_batches:
        days_expired = (date.today() - batch.expiry_date).days

        alerts["expired"].append({
            "batch_id": batch.id,
            "batch_number": batch.batch_number,
            "drug_code": batch.drug_code,
            "name": batch.name,
            "quantity": batch.quantity_available,
            "expiry_date": batch.expiry_date.isoformat(),
            "days_expired": days_expired,
            "severity": "critical",
            "message": f"{batch.name} (Batch: {batch.batch_number}) expired {days_expired} days ago"
        })

    # Calculate summary
    summary = {
        "total_alerts": (
            len(alerts["low_stock"]) +
            len(alerts["expiring_soon"]) +
            len(alerts["expired"]) +
            len(alerts["out_of_stock"])
        ),
        "critical_count": (
            len(alerts["out_of_stock"]) +
            len([a for a in alerts["low_stock"] if a["severity"] == "critical"]) +
            len([a for a in alerts["expiring_soon"] if a["severity"] == "critical"]) +
            len(alerts["expired"])
        ),
        "warning_count": (
            len([a for a in alerts["low_stock"] if a["severity"] == "warning"]) +
            len([a for a in alerts["expiring_soon"] if a["severity"] == "warning"])
        )
    }

    return {
        "summary": summary,
        "alerts": alerts
    }

