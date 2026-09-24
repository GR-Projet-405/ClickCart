# ClickCart

AI-Powered Local Services Marketplace

**Current status: FOUNDATION READY**

ClickCart is maintained as one repository containing a React frontend and Spring Boot backend. The base currently provides shared UI primitives, responsive layouts, route namespaces, environment configuration, and a minimal health endpoint. Marketplace business features are intentionally not implemented in the foundation.

## Technology

- Frontend: React + Vite + JavaScript
- Backend: Spring Boot + Java 17 + Maven
- Database: MongoDB
- API: REST
- UI areas: Customer, Service Provider, and Platform Admin

## Project structure

```text
ClickCart/
├── frontend/   React application, shared UI, layouts, and routes
├── backend/    Spring Boot REST API foundation
├── docs/       Team conventions and layout documentation
├── .editorconfig
├── .gitignore
└── README.md
```

## Local setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The default development URL is `http://localhost:5173`.

### Backend

macOS or Linux:

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend defaults to `http://localhost:8080`. Its foundation health endpoint is `http://localhost:8080/api/health`.

For local MongoDB-backed marketplace data, create `backend/.env` from `backend/.env.example`. Spring Boot loads this file when the backend is started from the `backend` directory. Set `CLICKCART_SEED_DATA=false` when the database already contains provider and service records and startup seeding is not wanted.

## Environment variables

Copy the relevant `.env.example` file for local documentation, but do not commit real `.env` files or secrets.

Frontend:

- `VITE_API_BASE_URL` — API prefix, default `http://localhost:8080/api`

Backend:

- `MONGODB_URI` — MongoDB connection URI, default `mongodb://localhost:27017/clickcart`
- `SERVER_PORT` — backend HTTP port, default `8080`

Spring Boot does not automatically load `backend/.env`; define backend variables in the shell or runtime environment.

## Useful routes

- `/` — Customer base layout
- `/provider` — Service Provider base layout
- `/admin` — Platform Admin base layout
- `/dev/ui-foundation` — shared component showcase

Marketplace API routes:

- `GET /api/providers/cleanpro-services` — provider profile data
- `GET /api/services/house-cleaning` — service detail data

Temporary configured navigation paths render neutral workspace placeholders. Assigned developers add actual pages as children of the correct layout.

## Documentation

- [Documentation index](docs/README.md)
- [Routing guide](docs/routing-guide.md)
- [Frontend guidelines](docs/frontend-guidelines.md)
- [Backend guidelines](docs/backend-guidelines.md)
- [REST API conventions](docs/api-conventions.md)
- [MongoDB guidelines](docs/mongodb-guidelines.md)
- [Development workflow](docs/development-workflow.md)

> This repository currently contains the shared project foundation only. Individual marketplace features must be implemented by their assigned developers.
