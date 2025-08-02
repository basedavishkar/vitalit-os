from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import models, schemas, database, auth, audit
from auth import generate_inventory_id, generate_transaction_id

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.post("/items", response_model=schemas.InventoryItem)
async def create_inventory_item(
    item_data: schemas.InventoryItemCreate,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create a new inventory item."""
    
    # Generate unique item ID
    item_id = generate_inventory_id()
    
    # Create inventory item
    db_item = models.InventoryItem(
        item_id=item_id,
        **item_data.dict()
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    # Log item creation
    audit.AuditLogger.log_create(
        db, current_user.id, "inventory", db_item.id,
        {
            "item_id": item_id,
            "name": item_data.name,
            "category": item_data.category,
            "current_quantity": item_data.current_quantity,
            "unit_price": item_data.unit_price
        },
        request
    )
    
    return db_item

@router.get("/items", response_model=List[schemas.InventoryItem])
async def get_inventory_items(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="Filter by category"),
    supplier: Optional[str] = Query(None, description="Filter by supplier"),
    low_stock: Optional[bool] = Query(None, description="Filter low stock items"),
    expiring_soon: Optional[bool] = Query(None, description="Filter items expiring soon"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get inventory items with optional filtering."""
    
    query = db.query(models.InventoryItem)
    
    # Apply filters
    if category:
        query = query.filter(models.InventoryItem.category == category)
    
    if supplier:
        query = query.filter(models.InventoryItem.supplier.ilike(f"%{supplier}%"))
    
    if low_stock:
        query = query.filter(
            models.InventoryItem.current_quantity <= models.InventoryItem.minimum_quantity
        )
    
    if expiring_soon:
        # Items expiring within 30 days
        expiry_date = date.today() + timedelta(days=30)
        query = query.filter(
            and_(
                models.InventoryItem.expiry_date.isnot(None),
                models.InventoryItem.expiry_date <= expiry_date
            )
        )
    
    # Apply pagination
    items = query.order_by(models.InventoryItem.name).offset(skip).limit(limit).all()
    
    return items

@router.get("/items/{item_id}", response_model=schemas.InventoryItem)
async def get_inventory_item(
    item_id: int,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get a specific inventory item by ID."""
    
    item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == item_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    return item

@router.put("/items/{item_id}", response_model=schemas.InventoryItem)
async def update_inventory_item(
    item_id: int,
    item_data: schemas.InventoryItemUpdate,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update an inventory item."""
    
    item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == item_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    # Store old values for audit
    old_values = {
        "name": item.name,
        "description": item.description,
        "category": item.category,
        "unit": item.unit,
        "current_quantity": item.current_quantity,
        "minimum_quantity": item.minimum_quantity,
        "maximum_quantity": item.maximum_quantity,
        "unit_price": item.unit_price,
        "supplier": item.supplier,
        "expiry_date": item.expiry_date,
        "location": item.location,
        "is_active": item.is_active
    }
    
    # Update item fields
    update_data = item_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    
    # Log item update
    audit.AuditLogger.log_update(
        db, current_user.id, "inventory", item.id,
        old_values, update_data, request
    )
    
    return item

@router.delete("/items/{item_id}")
async def delete_inventory_item(
    item_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Delete an inventory item (admin only)."""
    
    item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == item_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    # Check if item has transactions
    has_transactions = db.query(models.InventoryTransaction).filter(
        models.InventoryTransaction.item_id == item_id
    ).first() is not None
    
    if has_transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete item with existing transactions"
        )
    
    # Store old values for audit
    old_values = {
        "item_id": item.item_id,
        "name": item.name,
        "category": item.category,
        "current_quantity": item.current_quantity,
        "unit_price": item.unit_price
    }
    
    # Delete item
    db.delete(item)
    db.commit()
    
    # Log item deletion
    audit.AuditLogger.log_delete(
        db, current_user.id, "inventory", item_id,
        old_values, request
    )
    
    return {"message": "Inventory item deleted successfully"}

@router.post("/transactions", response_model=schemas.InventoryTransaction)
async def create_inventory_transaction(
    transaction_data: schemas.InventoryTransactionCreate,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create an inventory transaction (in/out/adjustment)."""
    
    # Verify item exists
    item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == transaction_data.item_id,
        models.InventoryItem.is_active == True
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found or inactive"
        )
    
    # Validate transaction
    if transaction_data.transaction_type == "out":
        if item.current_quantity < transaction_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Available: {item.current_quantity}, Requested: {transaction_data.quantity}"
            )
    
    # Generate unique transaction ID
    transaction_id = generate_transaction_id()
    
    # Create transaction
    db_transaction = models.InventoryTransaction(
        transaction_id=transaction_id,
        item_id=transaction_data.item_id,
        transaction_type=transaction_data.transaction_type,
        quantity=transaction_data.quantity,
        unit_price=transaction_data.unit_price,
        total_amount=transaction_data.total_amount,
        reference_number=transaction_data.reference_number,
        notes=transaction_data.notes,
        created_by=current_user.id
    )
    
    db.add(db_transaction)
    
    # Update item quantity
    if transaction_data.transaction_type == "in":
        item.current_quantity += transaction_data.quantity
    elif transaction_data.transaction_type == "out":
        item.current_quantity -= transaction_data.quantity
    elif transaction_data.transaction_type == "adjustment":
        # For adjustment, quantity represents the new total
        item.current_quantity = transaction_data.quantity
    
    db.commit()
    db.refresh(db_transaction)
    
    # Log transaction creation
    audit.AuditLogger.log_create(
        db, current_user.id, "inventory_transactions", db_transaction.id,
        {
            "transaction_id": transaction_id,
            "item_id": transaction_data.item_id,
            "transaction_type": transaction_data.transaction_type,
            "quantity": transaction_data.quantity,
            "new_stock_level": item.current_quantity
        },
        request
    )
    
    return db_transaction

@router.get("/transactions", response_model=List[schemas.InventoryTransaction])
async def get_inventory_transactions(
    skip: int = 0,
    limit: int = 100,
    item_id: Optional[int] = Query(None, description="Filter by item ID"),
    transaction_type: Optional[str] = Query(None, description="Filter by transaction type"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get inventory transactions with optional filtering."""
    
    query = db.query(models.InventoryTransaction)
    
    # Apply filters
    if item_id:
        query = query.filter(models.InventoryTransaction.item_id == item_id)
    
    if transaction_type:
        query = query.filter(models.InventoryTransaction.transaction_type == transaction_type)
    
    if start_date:
        query = query.filter(models.InventoryTransaction.created_at >= start_date)
    
    if end_date:
        query = query.filter(models.InventoryTransaction.created_at <= end_date)
    
    # Apply pagination
    transactions = query.order_by(models.InventoryTransaction.created_at.desc()).offset(skip).limit(limit).all()
    
    return transactions

@router.get("/items/{item_id}/transactions", response_model=List[schemas.InventoryTransaction])
async def get_item_transactions(
    item_id: int,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get all transactions for a specific item."""
    
    # Verify item exists
    item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == item_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    transactions = db.query(models.InventoryTransaction).filter(
        models.InventoryTransaction.item_id == item_id
    ).order_by(models.InventoryTransaction.created_at.desc()).all()
    
    return transactions

@router.get("/alerts/low-stock")
async def get_low_stock_alerts(
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get items with low stock levels."""
    
    low_stock_items = db.query(models.InventoryItem).filter(
        and_(
            models.InventoryItem.is_active == True,
            models.InventoryItem.current_quantity <= models.InventoryItem.minimum_quantity
        )
    ).all()
    
    return {
        "low_stock_count": len(low_stock_items),
        "items": low_stock_items
    }

@router.get("/alerts/expiring")
async def get_expiring_items_alerts(
    days: int = Query(30, description="Days ahead to check for expiry"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get items expiring within specified days."""
    
    expiry_date = date.today() + timedelta(days=days)
    
    expiring_items = db.query(models.InventoryItem).filter(
        and_(
            models.InventoryItem.is_active == True,
            models.InventoryItem.expiry_date.isnot(None),
            models.InventoryItem.expiry_date <= expiry_date
        )
    ).order_by(models.InventoryItem.expiry_date).all()
    
    return {
        "expiring_count": len(expiring_items),
        "days_ahead": days,
        "items": expiring_items
    }

@router.get("/reports/stock-summary")
async def get_stock_summary(
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get inventory stock summary."""
    
    # Get total items
    total_items = db.query(models.InventoryItem).filter(
        models.InventoryItem.is_active == True
    ).count()
    
    # Get low stock items
    low_stock_items = db.query(models.InventoryItem).filter(
        and_(
            models.InventoryItem.is_active == True,
            models.InventoryItem.current_quantity <= models.InventoryItem.minimum_quantity
        )
    ).count()
    
    # Get out of stock items
    out_of_stock_items = db.query(models.InventoryItem).filter(
        and_(
            models.InventoryItem.is_active == True,
            models.InventoryItem.current_quantity == 0
        )
    ).count()
    
    # Get expiring items (within 30 days)
    expiry_date = date.today() + timedelta(days=30)
    expiring_items = db.query(models.InventoryItem).filter(
        and_(
            models.InventoryItem.is_active == True,
            models.InventoryItem.expiry_date.isnot(None),
            models.InventoryItem.expiry_date <= expiry_date
        )
    ).count()
    
    # Get total inventory value
    total_value = db.query(
        func.sum(models.InventoryItem.current_quantity * models.InventoryItem.unit_price)
    ).filter(models.InventoryItem.is_active == True).scalar() or 0
    
    # Get items by category
    category_counts = db.query(
        models.InventoryItem.category,
        func.count(models.InventoryItem.id).label('count')
    ).filter(models.InventoryItem.is_active == True).group_by(
        models.InventoryItem.category
    ).all()
    
    return {
        "summary": {
            "total_items": total_items,
            "low_stock_items": low_stock_items,
            "out_of_stock_items": out_of_stock_items,
            "expiring_items": expiring_items,
            "total_inventory_value": float(total_value)
        },
        "category_breakdown": [
            {"category": item.category, "count": item.count}
            for item in category_counts
        ]
    }

@router.get("/reports/transaction-summary")
async def get_transaction_summary(
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get inventory transaction summary for the specified period."""
    
    query = db.query(models.InventoryTransaction)
    
    if start_date:
        query = query.filter(models.InventoryTransaction.created_at >= start_date)
    
    if end_date:
        query = query.filter(models.InventoryTransaction.created_at <= end_date)
    
    # Get transaction counts by type
    transaction_counts = db.query(
        models.InventoryTransaction.transaction_type,
        func.count(models.InventoryTransaction.id).label('count')
    ).filter(query.whereclause).group_by(
        models.InventoryTransaction.transaction_type
    ).all()
    
    # Get total transaction value
    total_value = query.with_entities(
        func.sum(models.InventoryTransaction.total_amount)
    ).scalar() or 0
    
    # Get recent transactions
    recent_transactions = query.order_by(
        models.InventoryTransaction.created_at.desc()
    ).limit(10).all()
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_transactions": query.count(),
            "total_value": float(total_value)
        },
        "transaction_breakdown": [
            {"type": item.transaction_type, "count": item.count}
            for item in transaction_counts
        ],
        "recent_transactions": recent_transactions
    }
