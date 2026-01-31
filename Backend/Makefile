.PHONY: start stop restart build logs clean migrate create-migration seed seed-fresh test help

# Docker Compose V1
DOCKER_COMPOSE := docker-compose

# Comando principal para iniciar el entorno de desarrollo
start:
	$(DOCKER_COMPOSE) up -d

# Detener los contenedores
stop:
	$(DOCKER_COMPOSE) down

# Reiniciar los contenedores
restart:
	$(DOCKER_COMPOSE) restart

# Construir las imágenes
build:
	$(DOCKER_COMPOSE) build

# Ver los logs de los contenedores
logs:
	$(DOCKER_COMPOSE) logs -f

# Limpiar contenedores, volúmenes e imágenes
clean:
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans

# Ejecutar migraciones de la base de datos
migrate:
	$(DOCKER_COMPOSE) exec api bash -c "cd /app && uv run alembic -c app/alembic.ini upgrade head"

# Crear una nueva migración
create-migration:
	@read -p "Ingrese el mensaje para la migración: " message; \
	$(DOCKER_COMPOSE) exec api bash -c "cd /app && uv run alembic -c app/alembic.ini revision --autogenerate -m \"$$message\""

# Ejecutar seed de datos
seed:
	$(DOCKER_COMPOSE) exec api bash -c "cd /app && uv run python -m app.db.seed"

# Limpiar y recrear datos de seed
seed-fresh:
	$(DOCKER_COMPOSE) exec api bash -c "cd /app && uv run python -m app.db.seed clear"
	$(DOCKER_COMPOSE) exec api bash -c "cd /app && uv run python -m app.db.seed"

# Ejecutar pruebas unitarias
test:
	$(DOCKER_COMPOSE) exec api bash -c "cd /app && uv run pytest"

# Mostrar ayuda
help:
	@echo "Comandos disponibles:"
	@echo "  make start             - Iniciar el entorno de desarrollo"
	@echo "  make stop              - Detener los contenedores"
	@echo "  make restart           - Reiniciar los contenedores"
	@echo "  make build             - Construir las imágenes"
	@echo "  make logs              - Ver logs de los contenedores"
	@echo "  make clean             - Limpiar contenedores y volúmenes"
	@echo "  make migrate           - Ejecutar migraciones de la base de datos"
	@echo "  make create-migration  - Crear una nueva migración"
	@echo "  make seed              - Ejecutar seed de datos"
	@echo "  make seed-fresh        - Limpiar y recrear datos de seed"
	@echo "  make test              - Ejecutar pruebas unitarias"
	@echo "  make help              - Mostrar esta ayuda"

# Comando por defecto
.DEFAULT_GOAL := help 