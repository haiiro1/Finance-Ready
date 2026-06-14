S ?= backend

.DEFAULT_GOAL := help

.PHONY: help \
	check-env \
	build up down restart \
	up-service logs logs-service ps shell \
	backend-lint backend-fix backend-test test-docker \
	frontend-lint frontend-format frontend-format-check frontend-build \
	lint test format validate \
	clean nuke

help:
	@printf "\033[0;36m╔══════════════════════════════════════════════════════════╗\033[0m\n"
	@printf "\033[0;36m║              Finance Ready - Developer CLI              ║\033[0m\n"
	@printf "\033[0;36m╚══════════════════════════════════════════════════════════╝\033[0m\n\n"
	@printf "\033[0;33mEntorno\033[0m\n"
	@printf "  check-env              Verifica que exista el archivo .env en la raiz\n"
	@printf "\n\033[0;33mDocker\033[0m\n"
	@printf "  build                  Build de todas las imagenes\n"
	@printf "  up                     Levanta el entorno completo (falla si algun servicio queda unhealthy)\n"
	@printf "  down                   Detiene y elimina los contenedores\n"
	@printf "  restart                Reinicia todos los servicios\n"
	@printf "  up-service             Levanta un servicio especifico: make up-service S=backend\n"
	@printf "  logs                   Sigue los logs de todos los servicios en tiempo real\n"
	@printf "  logs-service           Logs de un servicio especifico: make logs-service S=backend\n"
	@printf "  ps                     Estado actual de los contenedores\n"
	@printf "  shell                  Shell interactivo en un servicio: make shell S=backend\n"
	@printf "\n\033[0;33mCalidad\033[0m\n"
	@printf "  backend-lint           Ejecuta Ruff en Backend/\n"
	@printf "  backend-fix            Aplica auto-fix de Ruff en Backend/\n"
	@printf "  backend-test           Ejecuta Pytest en Backend/\n"
	@printf "  test-docker            Ejecuta Pytest dentro del contenedor backend\n"
	@printf "  frontend-lint          Ejecuta ESLint en frontend/\n"
	@printf "  frontend-format        Aplica Prettier en frontend/\n"
	@printf "  frontend-format-check  Verifica formato con Prettier en frontend/\n"
	@printf "  frontend-build         Compila el workspace frontend\n"
	@printf "  lint                   Ejecuta lint backend + frontend\n"
	@printf "  test                   Ejecuta tests backend localmente\n"
	@printf "  format                 Aplica formato frontend\n"
	@printf "  validate               Ejecuta lint, tests, formato check y build\n"
	@printf "\n\033[0;33mLimpieza\033[0m\n"
	@printf "  clean                  Elimina contenedores detenidos e imagenes sin tag\n"
	@printf "  nuke                   ⚠️  Elimina TODO (contenedores, imagenes, volumenes). Usar con precaucion.\n"
	@printf "\n\033[0;33mOpciones:\033[0m\n"
	@printf "  S=<servicio>           Nombre del servicio Docker (default: backend). Servicios: postgres backend frontend\n"

# --- Entorno ---

check-env:
	@if [ ! -f .env ]; then \
		printf "\033[0;31mError: falta el archivo .env en la raiz del proyecto.\033[0m\n"; \
		printf "Copialo desde .env.example:\n"; \
		printf "  cp .env.example .env\n"; \
		exit 1; \
	else \
		printf "\033[0;32m.env encontrado.\033[0m\n"; \
	fi

# --- Docker ---

build: check-env
	docker compose build

up: check-env
	docker compose up -d --wait
	docker compose ps

down:
	docker compose down

restart:
	docker compose restart

up-service: check-env
	docker compose up -d $(S)

logs:
	docker compose logs -f

logs-service:
	docker compose logs -f $(S)

ps:
	docker compose ps

shell:
	docker compose exec $(S) sh

# --- Backend ---

backend-lint:
	cd Backend && uv run ruff check .

backend-fix:
	cd Backend && uv run ruff check --fix . && uv run ruff format .

backend-test:
	cd Backend && uv run pytest

test-docker:
	docker compose exec backend uv run pytest

# --- Frontend ---

frontend-lint:
	cd frontend && pnpm.cmd lint

frontend-format:
	cd frontend && pnpm.cmd format

frontend-format-check:
	cd frontend && pnpm.cmd format:check

frontend-build:
	cd frontend && pnpm.cmd build

# --- Compuestos ---

lint: backend-lint frontend-lint

test: backend-test

format: frontend-format

validate: backend-lint backend-test frontend-lint frontend-format-check frontend-build

# --- Limpieza ---

clean:
	docker compose down --remove-orphans
	docker image prune -f

nuke:
	docker compose down -v --remove-orphans
	docker system prune -af --volumes
