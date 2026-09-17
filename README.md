# Industrial ERP Case Study

This repository contains a practical PERN-stack ERP starter for the workflow:

Customer Enquiry → Quotation → Sales Order → Inventory Reservation → Dispatch

## Tech stack

- PostgreSQL
- Express.js
- React.js
- Node.js
- Sequelize ORM
- JWT authentication
- Backend role-based access control
- Jest + Supertest

## Project structure

```text
backend/        Express API and business logic
frontend/       React application with the required screens
docs/           ER diagram and API documentation
```

## Quick start

1. Copy environment files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

2. Configure PostgreSQL connection values in `backend/.env`.

3. Install dependencies:

```bash
npm install
```

4. Run backend:

```bash
npm run dev:backend
```

5. Run frontend:

```bash
npm run dev:frontend
```

## PostgreSQL setup

Create a database and user, then set:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_case_study
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres
JWT_SECRET=change_this_secret
```

Database schema is modeled around entities such as:

- users
- customers
- products
- inventory
- enquiries
- enquiry_items
- quotations
- quotation_items
- sales_orders
- sales_order_items
- dispatches
- dispatch_items

## Migrations and seed data

The project includes a SQL-first design pattern and seed data examples in the backend. In a real database environment, run:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## Default login credentials

- Admin: `admin@erp.local` / `Admin@123`
- Sales user: `sales@erp.local` / `Sales@123`

## Core business rules implemented

- JWT auth with password hashing
- Backend RBAC (ADMIN vs SALES_USER)
- Quotation totals are calculated server-side
- Draft or rejected quotations cannot create sales orders
- Duplicate order generation is prevented
- Inventory reservation checks available stock
- Reservation and dispatch operations use transactional logic in PostgreSQL
- Simultaneous stock requests are handled by `SELECT ... FOR UPDATE`

## API summary

See `docs/api.md` for endpoint details.

## ER diagram

See `docs/erd.md` for the schema diagram.

## Running tests

```bash
npm test
```

## Demo video

A short demo recording is expected for the final candidate submission. A placeholder script and checklist are included in `docs/demo-video.md`.
