# Variables for paths
REGISTRY_PATH = api/registery
GATEWAYS_PATH = api/gateways
USERS_PATH = api/users
PRODUCTS_PATH = api/products
MEDIA_PATH = api/media

# Build registry service
build-registery:
	@echo "Building registry..."
	(cd $(REGISTRY_PATH) && mvn clean install)

# Launch dependencies using Docker Compose
launch-dependencies: build-registery
	@echo "Launching dependencies..."
	sudo docker-compose -f docker-compose.dep.yml up -d

down-dependencies:
	@echo "Stoping dependencies..."
	sudo docker-compose -f docker-compose.dep.yml down

# Build individual services
build-gateways:
	@echo "Building gateways..."
	(cd $(GATEWAYS_PATH) && mvn clean install)

build-users:
	@echo "Building users..."
	(cd $(USERS_PATH) && mvn clean install)

build-products:
	@echo "Building products..."
	(cd $(PRODUCTS_PATH) && mvn clean install)

build-media:
	@echo "Building media..."
	(cd $(MEDIA_PATH) && mvn clean install)

# Build all services
build-services: build-gateways build-users build-products build-media
	@echo "All services built successfully."

# Launch services using Docker Compose
launch-services: build-services
	@echo "Launching services..."
	sudo docker-compose -f docker-compose.services.yml up -d

down-services:
	@echo "Stoping services..."
	sudo docker-compose -f docker-compose.services.yml down