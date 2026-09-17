# API Documentation

## Authentication

### POST /api/auth/login

Request body:

```json
{
  "email": "admin@erp.local",
  "password": "Admin@123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "admin@erp.local",
    "role": "ADMIN"
  }
}
```

## Enquiries

### POST /api/enquiries

Creates a new enquiry for a sales user.

### GET /api/enquiries

Returns all enquiries.

## Quotations

### POST /api/quotations

Creates a quotation from an enquiry, with server-side total calculation.

### PATCH /api/quotations/:id/status

Updates quotation status: DRAFT, SENT, ACCEPTED, REJECTED.

### POST /api/quotations/:id/convert

Converts an accepted quotation into a sales order.

## Orders

### GET /api/sales-orders

Returns all sales orders.

### POST /api/sales-orders/:id/confirm

Admin confirms order and reserves stock using a database transaction.

### POST /api/sales-orders/:id/dispatch

Admin dispatches a confirmed order and decrements physical + reserved quantities.

## Products

### GET /api/products

Returns product catalog and available inventory.

## Authorization

- ADMIN can view all records, manage inventory, confirm orders, dispatch stock
- SALES_USER can create enquiries, quotations, and convert accepted quotations to orders

All restricted routes require a valid JWT token and role checks in the backend.
