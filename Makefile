all:
	mkdir -p /home/$(USER)/volumes
	mkdir -p /home/$(USER)/volumes/db_data
	mkdir -p /home/$(USER)/volumes/vite_cache
	mkdir -p /home/$(USER)/volumes/avatars
	mkdir -p /home/$(USER)/volumes/certs
	cd nodejs && npm install
	cd angular && npm install
	docker compose up --build

down:
	docker compose down

status:
	@echo '====	Docker Compose Status ===='
	@docker compose ps
	@docker network ls | grep transcendence || echo 'ERROR WITH NETWORK'
	@docker volume ls | grep transcendence || echo 'ERROR WITH VOLUMES'

fclean:
	docker compose down --rmi all --volumes --remove-orphans
	rm -rf nodejs/node_modules angular/node_modules
	docker run --rm -v /home/$(USER):/data alpine sh -c "rm -rf /data/volumes"
	docker rmi alpine 2>/dev/null || true

re: fclean all

.PHONY: all down re status fclean
