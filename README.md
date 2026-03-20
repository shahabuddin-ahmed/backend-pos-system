# backend-pos-system

Multi-outlet POS backend built with Express, TypeScript, PostgreSQL, and Sequelize.

## Features
- Master menu item management
- Outlet management
- Outlet menu assignment with price override
- Inventory management per outlet
- Sales with multiple items
- Sequential receipt number per outlet
- Revenue by outlet report
- Top 5 selling items per outlet report

## Tech Stack
- Node.js
- Express
- TypeScript
- PostgreSQL
- Sequelize

## Project Structure
```text
src/
  config/
  constant/
  infra/
  model/
  repo/
  service/
  utils/
  web/
  app.ts
  server.ts
```

## Environment Variables
Create a `.env` file in the project root:

```env
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=pos_system
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
APPLICATION_SERVER_PORT=3000
APP_FORCE_SHUTDOWN_SECOND=30000
```

## Installation
```bash
yarn install
```

## Run in Development
```bash
yarn dev
```

## Build
```bash
yarn build
```

## Start Production Build
```bash
yarn prod
```

## API Base URL
```text
/api/v1
```

## Main Endpoints
- `POST /master-menu-items`
- `GET /master-menu-items`
- `POST /outlets`
- `GET /outlets`
- `POST /outlet-menu-items`
- `GET /outlet-menu-items/:outletId`
- `POST /inventories`
- `GET /inventories/:outletId`
- `POST /sales`
- `GET /reports/revenue-by-outlet`
- `GET /reports/top-items/:outletId`

## Notes
- PostgreSQL returns `DECIMAL/NUMERIC` values as strings in Sequelize by default.
- Receipt number generation should stay inside a database transaction.
- Inventory deduction should also happen inside the same sale transaction.
