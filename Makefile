all:
	mkdir -p /home/$(USER)/data
	mkdir -p /home/$(USER)/data/db_data
	mkdir -p /home/$(USER)/data/web_data
	cd srcs/ && docker compose up

down:
	cd srcs/ && docker compose down

status:
	@echo '====	Docker Compose Status ===='
	@cd srcs/ && docker compose ps
	@docker network ls | grep srcs || echo 'ERROR WITH NETWORK'
	@docker volume ls | grep srcs || echo 'ERROR WITH VOLUMES'

re: down all

.PHONY: all down re status
