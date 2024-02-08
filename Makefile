up:
	docker-compose -p app up
down:
	docker-compose down
docker-app-exec:
	docker-compose exec app bash
docker-app-run:
	docker-compose run --rm app bash
lint-fix:
	docker-compose run --rm app bash -c "npm run lint:fix"