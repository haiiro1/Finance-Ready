# Finance Ready

Finance Ready es una plataforma de finanzas personales orientada a obligaciones reales:
deuda, cuotas, tarjetas, prestamos entre personas, suscripciones compartidas,
costos financieros y proyeccion futura.

El objetivo no es crear una app simple de gastos, sino un sistema modular para gestionar
obligaciones financieras personales.

## Estado Actual

El proyecto ya tiene una base funcional con:

- Frontend dedicado en `frontend/`.
- Backend dedicado en `Backend/`.
- Docker Compose para levantar frontend, backend y PostgreSQL juntos.
- Backend FastAPI modular con healthcheck.
- Frontend Vite React TypeScript en `apps/shell`.
- Estructura preparada para microfrontends por dominio.

## Contextos IA

Los contextos/personality para trabajar con IA en este proyecto estan en carpetas dedicadas
en la raiz:

- `finance-ready-ai-context/`: contexto para desarrollo de la app.
- `review-context/`: contexto para revisiones, debugging y analisis de riesgo.
- `codex-personality.md`: prompt base para configurar Codex en este proyecto.
- `gemini-personality.md`: prompt base para configurar Gemini como agente de desarrollo.

## Estructura

```txt
Finance-Ready/
|-- Backend/
|   |-- app/
|   |   |-- api/
|   |   |-- core/
|   |   |-- database/
|   |   |-- main.py
|   |   `-- modules/
|   |       |-- auth/
|   |       |-- banks/
|   |       |-- cards/
|   |       |-- health/
|   |       |-- loans/
|   |       |-- notifications/
|   |       |-- reports/
|   |       |-- subscriptions/
|   |       `-- transactions/
|   |-- migrations/
|   |-- tests/
|   |-- Dockerfile
|   |-- pyproject.toml
|   `-- .env.example
|-- frontend/
|   |-- apps/
|   |   |-- shell/
|   |   |-- dashboard/
|   |   |-- finanzas/
|   |   |-- bancos-tarjetas/
|   |   |-- prestamos-deudas/
|   |   |-- suscripciones/
|   |   |-- reportes/
|   |   `-- configuracion/
|   |-- packages/
|   |   |-- shared-types/
|   |   `-- ui-kit/
|   |-- Dockerfile
|   |-- package.json
|   `-- pnpm-workspace.yaml
`-- docker-compose.yml
```

## Stack

Frontend:

- Vite
- React
- TypeScript
- Tailwind CSS
- pnpm workspaces
- Arquitectura preparada para microfrontends

Backend:

- Python 3.12
- FastAPI
- SQLModel
- PostgreSQL
- Alembic
- Pydantic Settings
- Ruff
- Pytest
- uv para entorno y dependencias

Infraestructura:

- Docker
- Docker Compose
- PostgreSQL 16

## Configuración de Entorno (.env)

El proyecto utiliza archivos `.env` para gestionar variables de configuración, permitiendo separar la configuración del código fuente. Esto es crucial para la seguridad y para tener diferentes configuraciones por entorno (desarrollo local, Docker, producción).

**Nunca se deben subir archivos `.env` al repositorio de Git.**

### 1. Docker Compose (Raíz)

Para configurar los servicios que se levantan con Docker Compose, se utiliza un archivo `.env` en la raíz del proyecto.

```powershell
# En la raíz del proyecto
copy .env.example .env
```

Este archivo es leído automáticamente por `docker-compose` y permite configurar puertos, credenciales de la base de datos y URLs de los servicios.

### 2. Backend (Local)

Para el desarrollo local del backend sin Docker, la configuración se gestiona en su propia carpeta. Al ejecutar `uv run`, Pydantic cargará las variables desde este archivo.

```powershell
cd F:\Code\Finance-Ready\Backend
copy .env.example .env
```

### 3. Frontend (Local)

Para el desarrollo local del frontend (la `shell`), la URL de la API se configura de manera similar. Vite cargará automáticamente este archivo.

```powershell
cd F:\Code\Finance-Ready\frontend\apps\shell
copy .env.example .env
```

## Levantar Todo con Docker

Desde la raiz del proyecto:

```powershell
cd F:\Code\Finance-Ready
docker compose up -d --build
```

Servicios:

```txt
Frontend:      http://localhost:5173
Backend docs:  http://localhost:8000/docs
Backend API:   http://localhost:8000/api/v1
Healthcheck:   http://localhost:8000/api/v1/health
PostgreSQL:    localhost:5432
```

Puertos host configurables si ya existe otro stack local usando los defaults:

```powershell
$env:POSTGRES_PORT="55432"
$env:BACKEND_PORT="18000"
$env:FRONTEND_PORT="15173"
docker compose up -d --build
```

Ver estado:

```powershell
docker compose ps
```

Ver logs:

```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

Detener contenedores:

```powershell
docker compose down
```

Detener y borrar volumen de PostgreSQL:

```powershell
docker compose down -v
```

## Backend Local

Recomendado usar `uv`.

```powershell
cd F:\Code\Finance-Ready\Backend
uv sync --dev
uv run uvicorn app.main:app --reload
```

Validaciones:

```powershell
uv run ruff check .
uv run pytest
```

Variables de entorno:

```powershell
copy .env.example .env
```

Endpoints iniciales:

```txt
GET /api/v1/health
GET /api/v1/auth/status
GET /api/v1/banks
GET /api/v1/cards
GET /api/v1/transactions
GET /api/v1/loans
GET /api/v1/subscriptions
GET /api/v1/reports
GET /api/v1/notifications
```

## Frontend Local

Desde la carpeta dedicada del frontend:

```powershell
cd F:\Code\Finance-Ready\frontend
pnpm.cmd install
pnpm.cmd dev:shell
```

Validaciones del shell:

```powershell
cd F:\Code\Finance-Ready\frontend\apps\shell
pnpm.cmd lint
pnpm.cmd build
```

Microfrontends definidos:

- `shell`
- `dashboard`
- `finanzas`
- `bancos-tarjetas`
- `prestamos-deudas`
- `suscripciones`
- `reportes`
- `configuracion`

Por ahora `shell` es la app Vite funcional. Los demas dominios estan registrados como
carpetas base para implementar los microfrontends.

## Base de Datos

Docker Compose levanta PostgreSQL con:

```txt
POSTGRES_USER=finance
POSTGRES_PASSWORD=finance
POSTGRES_DB=finance_ready
```

URL interna para Docker:

```txt
postgresql+psycopg://finance:finance@postgres:5432/finance_ready
```

URL local:

```txt
postgresql+psycopg://finance:finance@localhost:5432/finance_ready
```

## Roadmap Funcional

Prioridad MVP:

1. Auth: login, registro y recuperacion de contrasena.
2. Bancos y productos financieros.
3. Tarjetas, cupos por moneda y ciclos.
4. Ingresos y gastos personales.
5. Dashboard inicial.
6. Prestamos, deudas y relaciones financieras entre personas.
7. Suscripciones compartidas.
8. Reportes y resumenes.

Fases posteriores:

- Cuotas futuras y timeline financiero.
- Costos financieros reales: intereses, CAE, comisiones.
- Multi moneda.
- Cobros automaticos y notificaciones.
- IA para clasificacion, insights y riesgo financiero.
- Importacion de cartolas, OCR y automatizacion.

## Comandos Rapidos

```powershell
# levantar todo
docker compose up -d --build

# apagar todo
docker compose down

# backend local
cd Backend
uv run uvicorn app.main:app --reload

# frontend local
cd frontend
pnpm.cmd dev:shell

# tests backend
cd Backend
uv run pytest

# lint backend
cd Backend
uv run ruff check .
```
