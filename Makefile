all:
	mkdir -p /home/$(USER)/data
	mkdir -p /home/$(USER)/data/db_data
	mkdir -p /home/$(USER)/data/vite_cache
	cd nodejs && npm install
	cd angular && npm install
	docker compose up

down:
	docker compose down

status:
	@echo '====	Docker Compose Status ===='
	@docker compose ps
	@docker network ls | grep transdance || echo 'ERROR WITH NETWORK'
	@docker volume ls | grep transdance || echo 'ERROR WITH VOLUMES'

fclean:
	docker compose down --rmi all --volumes --remove-orphans
	rm -rf nodejs/node_modules angular/node_modules
	rm -rf /home/$(USER)/data/db_data/* /home/$(USER)/data/vite_cache/*

re: fclean all

.PHONY: all down re status fclean
