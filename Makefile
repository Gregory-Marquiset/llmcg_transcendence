# =========
# Makefile  (racine du projet)
# =========

COMPOSE := docker compose --env-file .env -f docker-compose.yml
SERVICE ?= project_health

.DEFAULT_GOAL := help
.PHONY: help build up up-nc down restart re show show-config health logs logs-tail logs-all test test-nc clean nuke test-ci logs-ci info

## <----------------- Helper ----------------->

help:
	@echo ""
	@echo "Commandes disponibles :"
	@echo "  make help                  - Affiche cette aide"
	@echo ""
	@echo "Build / Run :"
	@echo "  make build                 - Build les images"
	@echo "  make up                    - Build puis démarre les services (detach)"
	@echo "  make up-nc                 - Rebuild et recrée un service (no-cache)"
	@echo "  make down                  - Stoppe et supprime les conteneurs"
	@echo "  make restart               - Redémarre proprement (down puis up)"
	@echo "  make re                    - Redémarre en nettoyant tout (nuke puis up-nc)"
	@echo ""
	@echo "Inspection :"
	@echo "  make info					- Donne les adresse utiliser par le projet"
	@echo "  make show                  - Liste l’état des services, images, volumes, networks"
	@echo "  make show-config           - Affiche la config compose résolue"
	@echo "  make health                - Affiche l’état + healthcheck de chaque conteneur"
	@echo ""
	@echo "Logs :"
	@echo "  make logs                  - Suit les logs du service (SERVICE=..., défaut: project_health)"
	@echo "  make logs-tail             - Suit les logs du service (SERVICE=..., 200 dernières lignes)"
	@echo "  make logs-all              - Suit les logs de tous les services"
	@echo "  make logs-dump             - Dump logs (utils CI)"
	@echo ""
	@echo "Tests :"
	@echo "  make test                  - down puis lance tests/run_all.sh"
	@echo "  make test-light            - lance tests/run_light.sh (test sans re build)"
	@echo "  make test-nc               - nuke puis lance tests/run_all.sh"
	@echo ""
	@echo "Nettoyage :"
	@echo "  make clean                 - Down"
	@echo "  make nuke                  - Purge complete du projet"
	@echo "  make total-nuke            - ⚠️  Stop nginx + purge Docker globale (prune images/cache/réseaux + volumes non utilisés)"
	@echo ""
	@echo "Utils dev :"
	@echo "  make dev                   - Build puis démarre les services avec le vite en dev serveur"
	@echo "  make dev-logs              - Donne les logs du front en mode dev"
	@echo ""
	@echo "Utils CI :"
	@echo "  make logs-ci               - Dump logs (utils CI)"
	@echo "  make test-ci               - Lance tests/run_all.sh (utils CI)"
	@echo "Variables :"
	@echo "  SERVICE=<name>             - Cible pour logs (ex: make logs SERVICE=gateway)"
	@echo ""

## <----------------- Build / Run ----------------->

build:
	$(COMPOSE) build

up: build
	$(COMPOSE) up -d
	@$(MAKE) --no-print-directory info

up-nc:
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d --force-recreate
	@$(MAKE) --no-print-directory info

down:
	$(COMPOSE) down

restart:
	@$(MAKE) --no-print-directory down
	@$(MAKE) --no-print-directory up

re:
	@$(MAKE) --no-print-directory nuke
	@$(MAKE) --no-print-directory up-nc

## <----------------- Inspection ----------------->

info:
	@echo ""
	@echo "Frontend:	http://localhost:5173"
	@echo "Fastify docs:	http://localhost:5000/docs"
	@echo "Adminer:	http://localhost:8080"
	@echo "Prometheus:	http://localhost:9090"
	@echo "Grafana:	http://localhost:3000"
	@echo ""

show:
	@echo ""
	- $(COMPOSE) ls
	@echo ""
	- $(COMPOSE) ls -a
	@echo ""
	- $(COMPOSE) ps
	@echo ""
	- $(COMPOSE) images
	@echo ""
	- $(COMPOSE) volumes
	@echo ""
	- docker network ls
	@echo ""

show-config:
	@echo ""
	- $(COMPOSE) config --environment
	@echo ""
	- $(COMPOSE) config --profiles
	@echo ""
	- $(COMPOSE) config --services
	@echo ""
	- $(COMPOSE) config --variables
	@echo ""
	- $(COMPOSE) config --images
	@echo ""
	- $(COMPOSE) config --volumes
	@echo ""
	- $(COMPOSE) config --networks
	@echo ""

health:
	@$(COMPOSE) ps --format "table {{.Name}}\t{{.State}}\t{{.Health}}"

## <----------------- Logs ----------------->

logs:
	$(COMPOSE) logs -f $(SERVICE)

logs-all:
	@$(COMPOSE) logs -f

logs-tail:
	@$(COMPOSE) logs --tail=200 -f $(SERVICE)

## <----------------- Tests ----------------->

test: down
	clear
	@sh tests/run_all.sh
	@$(MAKE) --no-print-directory info

test-light:
	clear
	@sh tests/run_light.sh

test-nc:
	@$(MAKE) --no-print-directory nuke
	clear
	@sh tests/run_all.sh
	@$(MAKE) --no-print-directory info

## <----------------- Nettoyage ----------------->

clean:
	$(COMPOSE) --profile dev down --remove-orphans
	@if [ -L services/frontend/node_modules ]; then rm -f services/frontend/node_modules; fi

nuke:
	@$(COMPOSE) --profile dev down -v --remove-orphans --rmi local
	@if [ -L services/frontend/node_modules ]; then rm -f services/frontend/node_modules; fi

total-nuke: nuke
	@set -e; \
	echo "Stopping nginx…"; \
	sudo systemctl stop nginx; \
	echo "Pruning docker…"; \
	docker image prune -af; \
	docker system prune -af; \
	docker network prune -f; \
	docker volume prune -f

## <----------------- Utils dev --------------->

dev: clean up
	@echo "→ Remove frontend (prod) pour éviter le conflit de port 5173…"
	- $(COMPOSE) stop frontend
	- $(COMPOSE) rm -f frontend
	@echo "→ Lancement frontend-dev (Vite + HMR)…"
	$(COMPOSE) --profile dev up -d --build frontend-dev
	@$(MAKE) --no-print-directory info

logs-dev:
	- $(COMPOSE) --profile dev logs -f frontend-dev

## <----------------- Utils CI ----------------->

logs-ci:
	$(COMPOSE) logs --no-color

test-ci:
	@sh tests/run_all.sh
