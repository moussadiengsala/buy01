# ===== Configuration =====
SERVICES := registery gateways users products media
DEPENDENCIES := mongodb kafka registery

# Docker compose files
DEPS_COMPOSE = docker-compose.dep.yml
SERVICES_COMPOSE = docker-compose.services.yml

# ===== Docker Operations =====
up-deps:
	@echo "Starting dependencies..."
	docker-compose -f $(DEPS_COMPOSE) up -d

down-deps:
	@echo "Stopping dependencies..."
	docker-compose -f $(DEPS_COMPOSE) down

up-services:
	@echo "Building and starting services..."
	docker-compose -f $(SERVICES_COMPOSE) up -d --build

down-services:
	@echo "Stopping services..."
	docker-compose -f $(SERVICES_COMPOSE) down

up: up-deps up-services
down: down-services down-deps

# ===== Utility Targets =====
logs:
	docker-compose -f $(DEPS_COMPOSE) -f $(SERVICES_COMPOSE) logs -f

clean:
	@echo "Cleaning Docker resources..."
	docker-compose -f $(DEPS_COMPOSE) -f $(SERVICES_COMPOSE) down -v
	docker system prune -f

# ===== Individual Service Control =====
restart-%:
	docker-compose -f $(SERVICES_COMPOSE) restart $*

logs-%:
	docker-compose -f $(SERVICES_COMPOSE) logs -f $*

rebuild-%:
	docker-compose -f $(SERVICES_COMPOSE) up -d --build $*