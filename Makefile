
build-registery:
	sudo docker-compose up --build registery

up:
	sudo docker-compose up -d

down:
	sudo docker-compose down -d

build-front-end:
	sudo docker-compose up --build front-end

delete-all-docker-image:
	sudo docker image prune -a

delete-all-docker-container:
	sudo docker stop $(docker ps -aq)
	sudo docker rm $(docker ps -aq)

