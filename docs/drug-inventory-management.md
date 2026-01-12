# Drug Inventory Management System

## Overview

The Drug Inventory Management System is a comprehensive solution for tracking pharmaceutical inventory in hospital settings. It provides real-time stock monitoring, batch tracking with expiry management, automated alerts, and complete transaction history.

## Features

### 1. Drug Catalog Management
- **Complete CRUD Operations**: Create, read, update, and delete drugs
- **Comprehensive Drug Information**:
  - Drug code (auto-generated unique identifier)
  - Name and generic name
  - Manufacturer details
  - Category (Tablet, Capsule, Syrup, Injection, etc.)
  - Strength/dosage information
  - Unit price and selling price
- **Stock Thresholds**:
  - Minimum stock level
  - Reorder level (triggers low stock alerts)
  - Maximum stock level
- **Storage Requirements**:
  - Storage location
  - Temperature requirements
- **Regulatory Flags**:
  - Prescription required
  - Controlled substance status

### 2. Batch Tracking System
- **Unique Batch Management**: Each batch has a unique batch number
- **Quantity Tracking**:
  - Quantity received
  - Quantity available (real-time)
  - Quantity sold
  - Quantity expired
  - Quantity damaged
- **Date Tracking**:
  - Manufacturing date
  - Expiry date
  - Date received
- **Purchase Information**:
  - Supplier name
  - Purchase order number
  - Unit cost
- **FIFO Ready**: Structure supports First-In-First-Out inventory management

### 3. Stock Management
- **Real-time Stock Summary**: Aggregated view across all batches
- **Stock Status Indicators**:
  - `adequate`: Stock above reorder level
  - `low`: Stock below reorder level but above minimum
  - `critical`: Stock below minimum level
  - `out_of_stock`: Zero quantity
- **Low Stock Detection**: Automatic identification of drugs below reorder level
- **Out of Stock Alerts**: Immediate notification for zero-quantity drugs

### 4. Expiry Management
- **Configurable Expiry Tracking**: Check drugs expiring within N days (default: 30)
- **Urgency Levels**:
  - `critical`: Expiring within 7 days
  - `warning`: Expiring within 30 days
  - `notice`: Expiring within configured period
- **Expired Drug Detection**: Identify drugs past expiry date with available quantity
- **Days Calculation**: Automatic calculation of days to expiry or days expired

### 5. Transaction Tracking
- **Transaction Types**:
  - `PURCHASE`: New stock received
  - `SALE`: Stock sold to patients
  - `RETURN`: Stock returned
  - `ADJUSTMENT`: Manual stock adjustments
  - `EXPIRED`: Stock marked as expired
  - `DAMAGED`: Stock marked as damaged
- **Automatic Quantity Updates**: Batch quantities updated on transaction creation
- **Reference Tracking**:
  - Invoice numbers
  - Prescription references
  - Purchase order numbers
- **Patient Linkage**: Sales can be linked to specific patients
- **Complete Audit Trail**: Full transaction history with timestamps

### 6. Automated Alerts System
- **Low Stock Alerts**: Drugs below reorder level with severity indicators
- **Expiring Soon Alerts**: Drugs expiring within 30 days with urgency levels
- **Expired Alerts**: Drugs past expiry date that still have available quantity
- **Out of Stock Alerts**: Drugs with zero quantity
- **Alert Summary**: Comprehensive dashboard with alert counts by type and severity

## Database Schema

### Tables

#### 1. `drugs`
Main drug catalog table storing drug information and stock thresholds.

**Key Fields**:
- `id`: Primary key
- `drug_code`: Unique drug identifier (auto-generated)
- `name`, `generic_name`: Drug names
- `manufacturer`: Manufacturer name
- `category`: Drug category (ENUM)
- `strength`: Dosage/strength information
- `unit_price`, `selling_price`: Pricing
- `min_stock_level`, `reorder_level`, `max_stock_level`: Stock thresholds
- `storage_location`, `storage_temperature`: Storage requirements
- `prescription_required`, `controlled_substance`: Regulatory flags
- `is_active`: Soft delete flag

#### 2. `drug_batches`
Individual batch tracking with expiry dates and quantities.

**Key Fields**:
- `id`: Primary key
- `drug_id`: Foreign key to drugs table
- `batch_number`: Unique batch identifier
- `quantity_received`, `quantity_available`, `quantity_sold`, `quantity_expired`, `quantity_damaged`: Quantity tracking
- `manufacture_date`, `expiry_date`, `date_received`: Date tracking
- `supplier_name`, `purchase_order_number`, `unit_cost`: Purchase information

#### 3. `inventory_transactions`
Complete transaction history for all inventory movements.

**Key Fields**:
- `id`: Primary key
- `drug_id`: Foreign key to drugs table
- `batch_id`: Foreign key to drug_batches table (optional)
- `transaction_type`: Type of transaction (ENUM)
- `quantity`: Transaction quantity
- `unit_price`: Price per unit
- `total_amount`: Total transaction amount
- `patient_id`: Foreign key to patients table (optional)
- `invoice_number`, `prescription_reference`, `purchase_order_number`: Reference tracking
- `notes`: Additional notes
- `transaction_date`: Timestamp

### Enums

#### `DrugCategoryEnum`
- TABLET
- CAPSULE
- SYRUP
- INJECTION
- OINTMENT
- DROPS
- INHALER
- SUPPOSITORY
- OTHER

#### `TransactionTypeEnum`
- PURCHASE
- SALE
- RETURN
- ADJUSTMENT
- EXPIRED
- DAMAGED

## API Endpoints

All endpoints are prefixed with `/inventory` and require authentication.

### Drug Management

#### Create Drug
```
POST /inventory/drugs
```
Creates a new drug in the catalog. Drug code is auto-generated.

**Request Body**:
```json
{
  "name": "Paracetamol",
  "generic_name": "Acetaminophen",
  "manufacturer": "PharmaCorp",
  "category": "TABLET",
  "strength": "500mg",
  "unit_price": 0.50,
  "selling_price": 1.00,
  "min_stock_level": 100,
  "reorder_level": 500,
  "max_stock_level": 5000,
  "storage_location": "Shelf A1",
  "storage_temperature": "Room Temperature",
  "prescription_required": false,
  "controlled_substance": false
}
```

#### List Drugs
```
GET /inventory/drugs?skip=0&limit=100&search=paracetamol&category=TABLET&active_only=true
```
Lists all drugs with optional filtering and pagination.

**Query Parameters**:
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 100, max: 500)
- `search`: Search by name, generic name, or drug code
- `category`: Filter by drug category
- `active_only`: Show only active drugs (default: true)

#### Get Drug
```
GET /inventory/drugs/{drug_id}
```
Retrieves a specific drug by ID.

#### Update Drug
```
PUT /inventory/drugs/{drug_id}
```
Updates drug information. All fields are optional.

#### Delete Drug
```
DELETE /inventory/drugs/{drug_id}
```
Soft deletes a drug (marks as inactive).

### Batch Management

#### Create Batch
```
POST /inventory/batches
```
Adds a new batch of drugs to inventory.

**Request Body**:
```json
{
  "drug_id": 1,
  "batch_number": "BATCH-2024-001",
  "quantity_received": 1000,
  "manufacture_date": "2024-01-01",
  "expiry_date": "2026-01-01",
  "supplier_name": "MediSupply Inc",
  "purchase_order_number": "PO-2024-001",
  "unit_cost": 0.40
}
```

#### List Batches
```
GET /inventory/batches?drug_id=1&skip=0&limit=100&active_only=true
```
Lists all drug batches with optional filtering.

**Query Parameters**:
- `drug_id`: Filter by specific drug
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 100, max: 500)
- `active_only`: Show only batches with available quantity (default: true)

#### Get Batch
```
GET /inventory/batches/{batch_id}
```
Retrieves a specific batch by ID.

#### Update Batch
```
PUT /inventory/batches/{batch_id}
```
Updates batch information. All fields are optional.

### Stock Management

#### Stock Summary
```
GET /inventory/stock/summary
```
Returns overall stock summary with total available quantities per drug.

**Response**:
```json
[
  {
    "drug_id": 1,
    "drug_code": "DRG12345678",
    "drug_name": "Paracetamol",
    "generic_name": "Acetaminophen",
    "category": "TABLET",
    "total_available": 4500,
    "reorder_level": 500,
    "min_stock_level": 100,
    "status": "adequate"
  }
]
```

#### Low Stock Items
```
GET /inventory/stock/low-stock
```
Returns drugs with stock levels below reorder level.

**Response includes**:
- Drug details
- Current stock level
- Reorder level
- Shortage amount
- Severity (critical/warning)

#### Expiring Items
```
GET /inventory/stock/expiring?days=30
```
Returns drugs expiring within specified days.

**Query Parameters**:
- `days`: Number of days to check (default: 30, range: 1-365)

**Response includes**:
- Drug and batch details
- Expiry date
- Days to expiry
- Available quantity
- Urgency level (critical/warning/notice)

#### Expired Items
```
GET /inventory/stock/expired
```
Returns expired drugs that still have available quantity.

**Response includes**:
- Drug and batch details
- Expiry date
- Days expired
- Available quantity

### Transaction Management

#### Create Transaction
```
POST /inventory/transactions
```
Creates a new inventory transaction.

**Request Body**:
```json
{
  "drug_id": 1,
  "batch_id": 1,
  "transaction_type": "SALE",
  "quantity": 50,
  "unit_price": 1.00,
  "patient_id": 123,
  "invoice_number": "INV-2024-001",
  "notes": "Sold to patient"
}
```

**Note**: Batch quantities are automatically updated based on transaction type.

#### List Transactions
```
GET /inventory/transactions?drug_id=1&transaction_type=SALE&skip=0&limit=100
```
Lists all inventory transactions with optional filtering.

**Query Parameters**:
- `drug_id`: Filter by specific drug
- `transaction_type`: Filter by transaction type
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 100, max: 500)

#### Get Transaction
```
GET /inventory/transactions/{transaction_id}
```
Retrieves a specific transaction by ID.

### Alerts

#### Get All Alerts
```
GET /inventory/alerts
```
Returns comprehensive alerts summary including low stock, expiring, and expired items.

**Response**:
```json
{
  "low_stock": [...],
  "expiring_soon": [...],
  "expired": [...],
  "out_of_stock": [...],
  "summary": {
    "total_alerts": 15,
    "low_stock_count": 5,
    "expiring_soon_count": 7,
    "expired_count": 2,
    "out_of_stock_count": 1,
    "critical_alerts": 3,
    "warning_alerts": 12
  }
}
```

## Usage Examples

### Adding a New Drug and Batch

1. **Create the drug**:
```bash
curl -X POST http://localhost:8000/inventory/drugs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amoxicillin",
    "generic_name": "Amoxicillin",
    "manufacturer": "AntibioPharm",
    "category": "CAPSULE",
    "strength": "500mg",
    "unit_price": 0.75,
    "selling_price": 1.50,
    "reorder_level": 200,
    "prescription_required": true
  }'
```

2. **Add a batch**:
```bash
curl -X POST http://localhost:8000/inventory/batches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "drug_id": 1,
    "batch_number": "AMX-2024-001",
    "quantity_received": 500,
    "manufacture_date": "2024-01-15",
    "expiry_date": "2026-01-15",
    "supplier_name": "MediSupply",
    "unit_cost": 0.60
  }'
```

### Recording a Sale

```bash
curl -X POST http://localhost:8000/inventory/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "drug_id": 1,
    "batch_id": 1,
    "transaction_type": "SALE",
    "quantity": 30,
    "unit_price": 1.50,
    "patient_id": 456,
    "invoice_number": "INV-2024-100"
  }'
```

### Checking Alerts

```bash
curl -X GET http://localhost:8000/inventory/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Migration

The Drug Inventory Management System was added using Alembic migrations.

**Migration File**: `alembic/versions/fe5ab91cbda6_add_drug_inventory_tables.py`

To apply the migration:
```bash
alembic upgrade head
```

To rollback:
```bash
alembic downgrade -1
```

## Future Enhancements

Potential improvements for future versions:

1. **Barcode/QR Code Integration**: Scan drugs and batches for quick lookup
2. **Automated Reordering**: Automatic purchase order generation when stock is low
3. **Supplier Management**: Track supplier performance and pricing history
4. **Drug Interactions**: Check for drug interactions and contraindications
5. **Prescription Integration**: Link directly to patient prescriptions
6. **Reporting**: Advanced analytics and reports (stock turnover, expiry trends, etc.)
7. **Multi-location Support**: Track inventory across multiple pharmacy locations
8. **Mobile App**: Mobile interface for quick stock checks and updates
9. **Email/SMS Alerts**: Automated notifications for low stock and expiring items
10. **Batch Recall Management**: Handle drug recalls efficiently

## Security Considerations

- All endpoints require authentication via JWT tokens
- Role-based access control (RBAC) can be implemented to restrict access
- Audit logging tracks all inventory changes
- Soft deletes preserve data integrity
- Transaction history provides complete audit trail

## Support

For issues or questions about the Drug Inventory Management System, please refer to:
- API Documentation: http://localhost:8000/docs
- Main README: [README.md](../README.md)
- Architecture Documentation: [architecture.md](./architecture.md)

