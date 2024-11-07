up:
	docker-compose up --build -d

down:
	docker-compose down

build-image:
	docker build -t vsupruniuk/chatify-api:latest .

publish-image:build-image
	docker push vsupruniuk/chatify-api:latest
