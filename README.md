# Backend POS System

Multi-outlet POS backend built with Express, TypeScript, Sequelize, and PostgreSQL.

This service supports:

- master menu item management
- outlet management
- outlet-specific menu assignments and price overrides
- per-outlet inventory tracking
- sale creation with stock deduction
- outlet-scoped sequential receipt generation
- reporting for revenue and top-selling items

## What This Project Does

The system models a POS backend where:

- `master_menu_items` define the global catalog
- `outlets` represent store locations
- `outlet_menu_items` decide which catalog items are sellable at a given outlet and at what price
- `inventories` store stock counts per outlet and menu item
- `sales` and `sale_items` capture completed transactions
- `outlet_receipt_sequences` maintain the next receipt number for each outlet

Example receipt format:

```text
DHK-000001
```

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Sequelize
- Joi

## Architecture

The codebase follows a straightforward layered structure:

```text
src/
  config/      runtime configuration
  constant/    error codes and messages
  infra/       database bootstrap and sequelize singleton
  model/       sequelize models and associations
  repo/        data access
  service/     business logic
  web/         controllers, routers, middleware, exceptions
  app.ts       express app wiring
  server.ts    http server bootstrap
```

Request flow:

```text
Router -> Controller -> Service -> Repository -> Sequelize/PostgreSQL
```

For the assessment-ready architecture write-up, including ERD, scaling plan, microservices evolution, and offline POS strategy, see [`docs/ARCHITECTURE.md`](/Users/shahabuddinahmed/GitHub/backend-pos-system/docs/ARCHITECTURE.md).

## Key Business Rules

- Menu items are globally defined, then assigned to outlets.
- Each outlet can override the base menu price per item.
- A sale can only include items assigned to the target outlet.
- Inventory is deducted inside the same transaction that creates the sale.
- Receipt numbers are generated per outlet and increment sequentially.
- Reporting supports `today`, `thisMonth`, and `lifetime`.

## Data Model

Main tables created by Sequelize sync:

- `master_menu_items`
- `outlets`
- `outlet_menu_items`
- `inventories`
- `sales`
- `sale_items`
- `outlet_receipt_sequences`

Important uniqueness constraints:

- `master_menu_items.sku`
- `outlets.code`
- `outlet_menu_items (outletId, masterMenuItemId)`
- `inventories (outletId, masterMenuItemId)`
- `sales (outletId, receiptNumber)`
- `outlet_receipt_sequences.outletId`

## Environment Variables

This project reads environment variables directly from `process.env`. It does **not** load a `.env` file on its own, so export the variables in your shell or inject them from your process manager.

Required runtime variables:

```env
POSTGRES_HOST=127.0.0.1
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pos_system
APPLICATION_SERVER_PORT=3001
APP_FORCE_SHUTDOWN_SECOND=30
```

Notes:

- `POSTGRES_PORT` is currently not used by the Sequelize config in this codebase.
- If a variable is omitted, the app falls back to the defaults defined in [`src/config/config.ts`](/Users/shahabuddinahmed/GitHub/backend-pos-system/src/config/config.ts).

## Requirements

-   Docker & Docker Compose
-   Node.js 22+ and Yarn

## Running the API

### Docker Compose (recommended)

1. Clone from git

```bash
git clone https://github.com/shahabuddin-ahmed/backend-pos-system.git
```

2. Navigate into the project directory

```bash
cd backend-pos-system
```

3. Install all dependencies

```bash
yarn install
```

4. Run the application using Docker Compose

```bash
docker-compose up
```

-   Spins up the API, MySQL 8, and phpMyAdmin.
-   Compose uses `Dockerfile.dev` (live reload). For a production image, build with `Dockerfile` instead: `docker build -f Dockerfile -t backend-pos-system:prod .`
-   API: [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
-   pgAdmin: [http://localhost:80](http://localhost:80) or [http://0.0.0.0/login](http://0.0.0.0/login) (user `postgres`, password `postgres`)
-   MySQL credentials match `docker-compose.yml` (`postgres`/`postgres`, db `pos_system`).

### Local (host Node, optional)

```bash
yarn install
yarn dev
```

Defaults for ports/DB live in `src/config/config.ts`; override via env vars when needed.

## Database Initialization

On startup, Sequelize authenticates and then calls `sync()`

- tables are created automatically if they do not exist
- this project does not use migrations
- schema changes are tied to the current model definitions

For an assessment project this is fine. For production, migrations would be safer.

## API Base URL

```text
/api/v1
```

## Response Format

Successful responses follow this envelope:

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "response": {},
  "errors": []
}
```

Validation and business-rule failures return:

```json
{
  "code": "E_INVALID_DATA",
  "message": "Please provide valid data",
  "response": null,
  "errors": [
    "\"name\" is required"
  ]
}
```

## API Endpoints

### Health

- `GET /health`

### Menu Items

- `POST /menu-items`
- `GET /menu-items`
- `GET /menu-items/:id`
- `PATCH /menu-items/:id`

Create example:

```bash
curl -X POST http://localhost:3001/api/v1/menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Burger",
    "sku": "BG-001",
    "basePrice": 250
  }'
```

### Outlets

- `POST /outlets`
- `GET /outlets`
- `GET /outlets/:id`
- `PATCH /outlets/:id`

Create example:

```bash
curl -X POST http://localhost:3001/api/v1/outlets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dhanmondi Outlet",
    "code": "DHK",
    "location": "Dhanmondi, Dhaka"
  }'
```

### Outlet Menu Assignment

- `POST /outlet-menu-items`
- `GET /outlet-menu-items/:outletId`

Assignment example:

```bash
curl -X POST http://localhost:3001/api/v1/outlet-menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "outletId": 1,
    "masterMenuItemId": 1,
    "overridePrice": 260,
    "isAvailable": true
  }'
```

### Inventory

- `POST /inventories`
- `GET /inventories/:outletId`

Set stock example:

```bash
curl -X POST http://localhost:3001/api/v1/inventories \
  -H "Content-Type: application/json" \
  -d '{
    "outletId": 1,
    "masterMenuItemId": 1,
    "currentStock": 50
  }'
```

### Sales

- `POST /sales`

Create sale example:

```bash
curl -X POST http://localhost:3001/api/v1/sales \
  -H "Content-Type: application/json" \
  -d '{
    "outletId": 1,
    "items": [
      { "masterMenuItemId": 1, "quantity": 2 },
      { "masterMenuItemId": 2, "quantity": 1 }
    ]
  }'
```

Behavior:

- validates outlet existence
- validates item assignment to outlet
- locks inventory rows during deduction
- rejects insufficient stock
- generates an outlet-specific receipt number
- stores the sale and sale items in one transaction

### Reports

- `GET /reports/summary?period=lifetime`
- `GET /reports/revenue-by-outlet?period=lifetime`
- `GET /reports/top-items/:outletId?period=lifetime`

Accepted `period` values:

- `today`
- `thisMonth`
- `lifetime`

Examples:

```bash
curl "http://localhost:3001/api/v1/reports/revenue-by-outlet?period=today"
```

```bash
curl "http://localhost:3001/api/v1/reports/top-items/1?period=thisMonth"
```

```bash
curl "http://localhost:3001/api/v1/reports/summary?period=lifetime&outletId=1"
```

## Suggested Demo Flow

If you are reviewing the project manually, this sequence exercises the main use cases:

1. Create a few master menu items.
2. Create one or more outlets.
3. Assign menu items to an outlet with optional override pricing.
4. Seed inventory for that outlet.
5. Create a sale.
6. Fetch inventory again to verify stock deduction.
7. Fetch revenue and top-item reports.

## Validation Summary

Some important request rules enforced by Joi:

- IDs must be positive integers.
- `basePrice` and `overridePrice` must be positive numbers.
- `currentStock` must be `0` or greater.
- `items` in a sale must contain at least one line.
- each sale item quantity must be a positive integer.

## Known Limitations

- No migration system; schema is synced from models.
- No authentication or authorization layer.
- No pagination or filtering on list endpoints.
- No automated seed script is included.
- No dedicated test files are present even though test scripts exist in `package.json`.
- `POSTGRES_PORT` is defined in the old README pattern but is not wired into the current Sequelize config.

## Verification

Build verified locally with:

```bash
yarn build
```

## License

MIT
