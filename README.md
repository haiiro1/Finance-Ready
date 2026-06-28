# Finance Ready

Finance Ready es una plataforma de finanzas personales orientada a obligaciones reales:
deudas, cuotas, tarjetas, préstamos entre personas, suscripciones compartidas,
costos financieros y proyección futura.

No es un tracker de gastos genérico. El objetivo es ayudar al usuario a entender
qué debe, cuándo, a quién y cómo los compromisos futuros afectan su capacidad de pago.

## Documentación

- [Arquitectura](docs/architecture.md) — stack, dominios, infraestructura y reglas arquitectónicas.
- [Setup local](docs/local-setup.md) — guía paso a paso para Docker, backend local y frontend local.

## Estado actual

El proyecto tiene una base funcional con:

- Frontend dedicado en `frontend/`.
- Backend dedicado en `Backend/`.
- Docker Compose para levantar frontend, backend y PostgreSQL juntos.
- Backend FastAPI modular con healthcheck.
- Frontend Vite React TypeScript en `apps/shell`.
- Carpetas preparadas para microfrontends por dominio.

## Estructura

```text
Finance-Ready/
├── Backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── main.py
│   │   └── modules/
│   │       ├── auth/
│   │       ├── banks/
│   │       ├── cards/
│   │       ├── health/
│   │       ├── loans/
│   │       ├── notifications/
│   │       ├── reports/
│   │       ├── subscriptions/
│   │       └── transactions/
│   ├── migrations/
│   ├── tests/
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── .env.example
├── frontend/
│   ├── apps/
│   │   ├── shell/              # App Vite funcional actual
│   │   ├── dashboard/          # Carpeta preparada
│   │   ├── finanzas/           # Carpeta preparada
│   │   ├── bancos-tarjetas/    # Carpeta preparada
│   │   ├── prestamos-deudas/   # Carpeta preparada
│   │   ├── suscripciones/      # Carpeta preparada
│   │   ├── reportes/           # Carpeta preparada
│   │   └── configuracion/      # Carpeta preparada
│   ├── packages/
│   │   ├── shared-types/
│   │   └── ui-kit/
│   ├── Dockerfile
│   ├── package.json
│   └── pnpm-workspace.yaml
├── docs/
│   ├── architecture.md
│   └── local-setup.md
└── docker-compose.yml
```

## Stack

**Backend:** Python 3.12, FastAPI, SQLModel, PostgreSQL, Alembic, Pydantic Settings, Ruff, Pytest, uv

**Frontend:** Vite, React, TypeScript, Tailwind CSS, pnpm workspaces

**Infraestructura:** Docker, Docker Compose, PostgreSQL 16

## Setup rápido con Docker

```powershell
cd F:\Code\Finance-Ready
copy .env.example .env
docker compose up -d --build
docker compose ps
```

URLs locales:

```text
Frontend:      http://localhost:5173
Backend docs:  http://localhost:8000/docs
Backend API:   http://localhost:8000/api/v1
Healthcheck:   http://localhost:8000/api/v1/health
PostgreSQL:    localhost:5432
```

Para setup backend local o frontend local, ver [docs/local-setup.md](docs/local-setup.md).

## Comandos Make

```powershell
make help                    # Lista todos los comandos disponibles

# Docker
make build                   # Build de todas las imágenes
make up                      # Levanta el entorno completo
make down                    # Detiene y elimina contenedores
make restart                 # Reinicia todos los servicios
make ps                      # Estado de los contenedores
make logs                    # Logs de todos los servicios
make up-service S=backend    # Levanta un servicio específico
make logs-service S=backend  # Logs de un servicio específico
make shell S=backend         # Shell interactivo en un servicio

# Calidad
make backend-lint            # Ruff en Backend/
make backend-fix             # Auto-fix con Ruff en Backend/
make backend-test            # Pytest en Backend/
make test-docker             # Pytest dentro del contenedor backend
make frontend-lint           # ESLint en frontend/
make frontend-format         # Prettier en frontend/
make frontend-format-check   # Verifica formato con Prettier
make frontend-build          # Compila el workspace frontend
make lint                    # lint backend + frontend
make test                    # tests backend
make validate                # lint + tests + format check + build

# Limpieza
make clean                   # Elimina contenedores detenidos e imágenes sin tag
make check-env               # Verifica que exista .env en la raíz
```

> `make nuke` elimina **todo** (contenedores, imágenes y volúmenes). Usar con precaución.

## Comandos directos

```powershell
# Docker
docker compose up -d --build
docker compose down
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

```powershell
# Backend
cd F:\Code\Finance-Ready\Backend
uv run uvicorn app.main:app --reload
uv run ruff check .
uv run pytest
```

```powershell
# Frontend
cd F:\Code\Finance-Ready\frontend
pnpm.cmd dev:shell
pnpm.cmd lint
pnpm.cmd format:check
pnpm.cmd build
```

## Roadmap funcional

Prioridad MVP:

1. Auth: login, registro y recuperación de contraseña.
2. Bancos y productos financieros.
3. Tarjetas, cupos por moneda y ciclos de facturación.
4. Ingresos y gastos personales.
5. Dashboard inicial.
6. Préstamos, deudas y relaciones financieras entre personas.
7. Suscripciones compartidas.
8. Reportes y resúmenes.

Fases posteriores:

- Cuotas futuras y timeline financiero.
- Costos financieros reales: intereses, CAE, comisiones.
- Multi moneda.
- Cobros automáticos y notificaciones.
- IA para clasificación, insights y riesgo financiero.
- Importación de cartolas, OCR y automatización.
