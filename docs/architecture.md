# Arquitectura — Finance Ready

La definición funcional y los límites de cada dominio están documentados en
[`docs/product-domains.md`](product-domains.md).
El contrato financiero transversal está documentado en
[`docs/financial-contract.md`](financial-contract.md).
La numeración y alcance de historias de integración están documentados en
[`docs/hu-numbering.md`](hu-numbering.md).
La numeración y alcance de historias de integración están documentados en
[`docs/hu-numbering.md`](hu-numbering.md).

## Terminología vigente

- El backend actual es un **monolito modular** FastAPI. Sus carpetas bajo
  `Backend/app/modules/` son módulos de dominio, no microservicios desplegables.
- El frontend actual es una sola aplicación React en `frontend/apps/shell`.
- Las carpetas `frontend/apps/<dominio>` están preparadas para una separación futura, pero
  todavía no son microfrontends funcionales ni desplegables independientes.
- PostgreSQL es una dependencia compartida del backend actual; no existe una base de datos
  por dominio.

Esta terminología debe conservarse hasta que exista una decisión arquitectónica y una
implementación real de despliegues independientes.

## Stack

| Capa | Tecnologías |
|---|---|
| Backend | Python 3.12, FastAPI, SQLModel, PostgreSQL, Alembic, Pydantic Settings, Ruff, Pytest, uv |
| Frontend | Vite, React, TypeScript, Tailwind CSS, pnpm workspaces |
| Infraestructura | Docker, Docker Compose, PostgreSQL 16 |

---

## Backend

Vive en `Backend/`.

### Rutas importantes

```text
Backend/
├── app/
│   ├── main.py          # Crea la app FastAPI, aplica CORS, registra el router
│   ├── api/
│   │   └── router.py    # Router central bajo /api/v1
│   ├── core/
│   │   └── config.py    # Settings con Pydantic Settings (carga .env.dev en local)
│   ├── database/        # Sesión y configuración de base de datos
│   └── modules/         # Dominios de negocio
├── migrations/          # Migraciones Alembic
├── tests/               # Tests con Pytest
├── Dockerfile
└── pyproject.toml
```

### Dominios registrados

Todos los dominios viven en `Backend/app/modules/` y se registran en `Backend/app/api/router.py`.

| Dominio | Prefijo |
|---|---|
| health | `/api/v1/health` |
| auth | `/api/v1/auth` |
| banks | `/api/v1/banks` |
| cards | `/api/v1/cards` |
| transactions | `/api/v1/transactions` |
| loans | `/api/v1/loans` |
| subscriptions | `/api/v1/subscriptions` |
| reports | `/api/v1/reports` |
| notifications | `/api/v1/notifications` |

### Reglas de backend

- Todos los endpoints viven bajo `/api/v1`.
- La lógica de dominio vive en `Backend/app/modules/<dominio>/`.
- Para cambios de persistencia, usar Alembic (`Backend/migrations/`).
- Usar `Decimal` o tipos numéricos explícitos para valores monetarios. Nunca `float`.

---

## Frontend

Vive en `frontend/` como workspace pnpm.

### Workspace

```text
frontend/
├── apps/
│   ├── shell/              # App Vite funcional actual (punto de entrada)
│   ├── dashboard/          # Carpeta preparada
│   ├── finanzas/           # Carpeta preparada
│   ├── bancos-tarjetas/    # Carpeta preparada
│   ├── prestamos-deudas/   # Carpeta preparada
│   ├── suscripciones/      # Carpeta preparada
│   ├── reportes/           # Carpeta preparada
│   └── configuracion/      # Carpeta preparada
├── packages/
│   ├── shared-types/       # Contratos TypeScript compartidos entre apps
│   └── ui-kit/             # Componentes UI compartidos
├── Dockerfile
├── package.json
└── pnpm-workspace.yaml
```

**Estado actual:** `apps/shell` es la única app Vite funcional. Las páginas de dominio
también viven temporalmente dentro de `apps/shell/src/`. El resto son carpetas base con
scripts placeholder, preparadas para una posible separación futura.

### Reglas de frontend

- Los contratos TypeScript compartidos entre dominios pertenecen a `frontend/packages/shared-types`.
- Los componentes UI reutilizables pertenecen a `frontend/packages/ui-kit`.
- No duplicar definiciones de tipos de API entre apps cuando existe un contrato compartido.
- Los cambios que afectan contratos compartidos requieren actualización coordinada de backend y frontend.

---

## Infraestructura

### Docker Compose

Servicios declarados en `docker-compose.yml`:

| Servicio | Imagen / Contexto | Puerto por defecto |
|---|---|---|
| postgres | `postgres:16-alpine` | `5432` |
| backend | `./Backend` | `8000` |
| frontend | `./frontend` | `5173` |

### Dependencias entre servicios

```text
postgres ──healthcheck──> backend ──healthcheck──> frontend
```

- `backend` solo arranca cuando `postgres` supera su healthcheck.
- `frontend` solo arranca cuando `backend` supera su healthcheck.
- El healthcheck del backend llama a `GET /api/v1/health`.

### Puertos configurables

Los puertos se pueden sobrescribir vía variables de entorno en `.env` (raíz):

```text
POSTGRES_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=5173
```

### URLs locales

```text
Frontend:      http://localhost:5173
Backend docs:  http://localhost:8000/docs
Backend API:   http://localhost:8000/api/v1
Healthcheck:   http://localhost:8000/api/v1/health
PostgreSQL:    localhost:5432
```

---

## Reglas arquitectónicas

- La lógica de dominio no debe cruzar fronteras de módulo sin una razón arquitectónica explícita.
- Los contratos de API deben ser estables y explícitos.
- Los tipos frontend deben reflejar los schemas del backend.
- El dinero se trata como dato crítico: precisión explícita, moneda explícita, sin conversiones implícitas.
- Las fechas de vencimiento, ciclos de facturación y cuotas son datos de negocio críticos.
- Las rutas frontend representan experiencias de usuario y no obligan a crear un servicio
  backend equivalente.
- Dashboard y reportes son consumidores de los dominios fuente; no son propietarios de
  movimientos, obligaciones ni saldos persistidos derivados.
