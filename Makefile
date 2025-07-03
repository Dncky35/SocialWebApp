IMAGE_NAME = socialwebapp

build:
	docker build -t $(IMAGE_NAME) .

stop:
	docker stop $(IMAGE_NAME) || true
	docker rm $(IMAGE_NAME) || true

run: stop build
	docker run -d --env-file .env -p 8000:8000 --name $(IMAGE_NAME) $(IMAGE_NAME)

logs:
	docker logs -f $(IMAGE_NAME)

clean:
	-docker stop $(IMAGE_NAME)
	-docker rm $(IMAGE_NAME)
	-docker rmi $(IMAGE_NAME)