up:
	NODE_ENV=dev docker-compose up --build

down:
	NODE_ENV=dev docker-compose down

build-image:
	docker build -t vsupruniuk/chatify-api:latest .

publish-image:build-image
	docker push vsupruniuk/chatify-api:latest
