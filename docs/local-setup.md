# Setup Local — Finance Ready

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para el entorno completo)
- [uv](https://docs.astral.sh/uv/) (para backend local sin Docker)
- [Node.js](https://nodejs.org/) + [pnpm](https://pnpm.io/) (para frontend local sin Docker)
- PowerShell (Windows)

---

## Opción 1: Entorno completo con Make (recomendado)

`make` centraliza los comandos más comunes y verifica el `.env` antes de levantar servicios.

### Paso 1 — Configurar variables de entorno

```powershell
cd F:\Code\Finance-Ready
copy .env.example .env
```

### Paso 2 — Levantar el entorno

```powershell
make up
```

`make up` ejecuta `docker compose up -d --wait`, que espera a que los healthchecks de PostgreSQL, backend y frontend pasen antes de retornar. Si algún servicio queda unhealthy, el comando falla con error.

### Comandos Make útiles

```powershell
make ps                      # Estado de los contenedores
make logs                    # Logs de todos los servicios en tiempo real
make logs-service S=backend  # Logs de un servicio específico (backend | frontend | postgres)
make shell S=backend         # Shell interactivo dentro de un contenedor
make down                    # Detiene y elimina los contenedores
make restart                 # Reinicia todos los servicios
make check-env               # Verifica que exista .env en la raíz
```

### Calidad con Make

```powershell
make backend-lint            # Ruff en Backend/
make backend-test            # Pytest en Backend/
make frontend-lint           # ESLint en frontend/
make frontend-format-check   # Verifica formato con Prettier
make frontend-build          # Compila el workspace frontend
make validate                # Ejecuta todo lo anterior en secuencia
```

---

## Opción 2: Entorno completo con Docker Compose (comandos directos)

Alternativa sin Make. Útil si Make no está disponible en el entorno.

### Paso 1 — Configurar variables de entorno

```powershell
cd F:\Code\Finance-Ready
copy .env.example .env
```

Variables disponibles en `.env.example`:

```text
POSTGRES_USER=finance
POSTGRES_PASSWORD=finance
POSTGRES_DB=finance_ready
POSTGRES_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=5173
```

No versionar el archivo `.env`.

### Paso 2 — Levantar servicios

```powershell
docker compose up -d --build
docker compose ps
```

### URLs esperadas

```text
Frontend:      http://localhost:5173
Backend docs:  http://localhost:8000/docs
Backend API:   http://localhost:8000/api/v1
Healthcheck:   http://localhost:8000/api/v1/health
PostgreSQL:    localhost:5432
```

### Puertos alternativos

Si los puertos por defecto están ocupados, definirlos antes de levantar:

```powershell
$env:POSTGRES_PORT="55432"
$env:BACKEND_PORT="18000"
$env:FRONTEND_PORT="15173"
docker compose up -d --build
```

### Comandos útiles

```powershell
# Ver estado de contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Detener contenedores
docker compose down

# Detener y eliminar volumen de PostgreSQL
docker compose down -v
```

---

## Opción 3: Backend local

Usar cuando se quiere desarrollar el backend sin Docker.

### Prerequisitos

- PostgreSQL corriendo localmente en `localhost:5432`
- Base de datos `finance_ready` creada con usuario `finance`

### Paso 1 — Variables de entorno

```powershell
cd F:\Code\Finance-Ready\Backend
copy .env.example .env.dev
```

Contenido de `.env.example`:

```text
APP_NAME="Finance Ready API"
APP_ENV="local"
CORS_ORIGINS="http://localhost:5173"
DATABASE_URL="postgresql+psycopg://finance:finance@localhost:5432/finance_ready"
API_PREFIX="/api/v1"
```

`config.py` carga `.env.dev` automáticamente al ejecutar con `uv run`.

### Paso 2 — Instalar dependencias

```powershell
cd F:\Code\Finance-Ready\Backend
uv sync --dev
```

### Paso 3 — Levantar servidor

```powershell
uv run uvicorn app.main:app --reload
```

### Validaciones

```powershell
cd F:\Code\Finance-Ready\Backend
uv run ruff check .
uv run pytest
```

---

## Opción 4: Frontend local

Usar cuando se quiere desarrollar el frontend sin Docker.

### Prerequisito

El backend debe estar corriendo (local o Docker) para que las llamadas a la API funcionen.

### Paso 1 — Variables de entorno del shell

```powershell
cd F:\Code\Finance-Ready\frontend\apps\shell
copy .env.example .env
```

Contenido de `.env.example`:

```text
VITE_API_URL=http://localhost:8000/api/v1
```

Ajustar el puerto si el backend corre en uno distinto.

### Paso 2 — Instalar dependencias y levantar

```powershell
cd F:\Code\Finance-Ready\frontend
pnpm.cmd install
pnpm.cmd dev:shell
```

### Validaciones

```powershell
cd F:\Code\Finance-Ready\frontend
pnpm.cmd lint
pnpm.cmd format:check
pnpm.cmd build
```

---

## Base de datos

Docker Compose levanta PostgreSQL con estas credenciales por defecto:

```text
POSTGRES_USER=finance
POSTGRES_PASSWORD=finance
POSTGRES_DB=finance_ready
```

URL para conexión desde Docker (interna):

```text
postgresql+psycopg://finance:finance@postgres:5432/finance_ready
```

URL para conexión desde local:

```text
postgresql+psycopg://finance:finance@localhost:5432/finance_ready
```

---

## Archivos `.env` y versionado

| Archivo | Uso | Se versiona |
|---|---|---|
| `.env.example` (raíz) | Plantilla para Docker Compose | Sí |
| `.env` (raíz) | Variables reales de Docker Compose | No |
| `Backend/.env.example` | Plantilla para backend local | Sí |
| `Backend/.env.dev` | Variables reales de backend local | No |
| `frontend/apps/shell/.env.example` | Plantilla para frontend local | Sí |
| `frontend/apps/shell/.env` | Variables reales de frontend local | No |
