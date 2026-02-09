# =========
# Makefile  (racine du projet)
# =========

COMPOSE := docker compose --env-file .env -f docker-compose.yml

ifneq (,$(wildcard .env))
	include .env
	export
endif

SERVICE ?= frontend

WATCHDOG_SCRIPT := tests/watchdog.sh
WATCHDOG_LOG    := tests_logs/logs_watchdog.log
WATCHDOG_PID    := tests_logs/watchdog.pid
WATCHDOG_LOCK   := tests_logs/watchdog.lock

.DEFAULT_GOAL := help
.PHONY: help build up up-nc down restart re show show-config health logs logs-tail logs-all test test-nc clean nuke test-ci logs-ci info watchdog-start watchdog-stop watchdog-status watchdog-logs watchdog-clean backup restore backups-ls

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
	@echo "  make dev                   - Build puis démarre les services en mode dev avec hot reload"
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
	@$(MAKE) --no-print-directory watchdog-start

up-nc:
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d --force-recreate
	@$(MAKE) --no-print-directory info
	@$(MAKE) --no-print-directory watchdog-start

down:
	@$(MAKE) --no-print-directory watchdog-stop
	$(COMPOSE) down

restart:
	@$(MAKE) --no-print-directory down
	@$(MAKE) --no-print-directory up

re:
	@$(MAKE) --no-print-directory nuke
	@$(MAKE) --no-print-directory up-nc

backup:
	$(COMPOSE) run --rm backup /app/backup.sh

backups-ls:
	$(COMPOSE) run --rm backup sh -lc 'ls -lah /backups || true'

restore:
	@if [ -n "$(FILE)" ]; then \
		$(COMPOSE) run --rm backup /app/restore.sh "$(FILE)"; \
	else \
		$(COMPOSE) run --rm backup /app/restore.sh latest; \
	fi

## <----------------- Watchdog ----------------->

watchdog-start:
	@sleep 15
	@mkdir -p tests_logs
	@if [ -f "$(WATCHDOG_PID)" ] && kill -0 $$(cat "$(WATCHDOG_PID)") 2>/dev/null; then \
		echo "watchdog: already running (pid=$$(cat "$(WATCHDOG_PID)"))"; \
	else \
		rm -f "$(WATCHDOG_PID)" "$(WATCHDOG_LOCK)"; \
		echo "watchdog: starting…"; \
		COMPOSE_FILE=docker-compose.yml ENV_FILE=.env \
		INTERVAL_SEC=15 \
		WAIT_AFTER_RESTART_SEC=45 WAIT_STEP_SEC=2 \
		LOG_FILE="$(WATCHDOG_LOG)" LOCK_FILE="$(WATCHDOG_LOCK)" \
		sh "$(WATCHDOG_SCRIPT)" >/dev/null 2>&1 & \
		echo $$! > "$(WATCHDOG_PID)"; \
		echo "watchdog: started (pid=$$(cat "$(WATCHDOG_PID)"))"; \
	fi


watchdog-status:
	@if [ -f "$(WATCHDOG_PID)" ] && kill -0 $$(cat "$(WATCHDOG_PID)") 2>/dev/null; then \
		echo "watchdog: running (pid=$$(cat "$(WATCHDOG_PID)"))"; \
	else \
		echo "watchdog: not running"; \
	fi

watchdog-logs:
	@touch "$(WATCHDOG_LOG)"
	@tail -f "$(WATCHDOG_LOG)"

watchdog-stop:
	@if [ -f "$(WATCHDOG_PID)" ]; then \
		pid=$$(cat "$(WATCHDOG_PID)" 2>/dev/null || true); \
		if [ -n "$$pid" ] && kill -0 "$$pid" 2>/dev/null; then \
			echo "watchdog: stopping (pid=$$pid)…"; \
			kill "$$pid" 2>/dev/null || true; \
		fi; \
		rm -f "$(WATCHDOG_PID)" "$(WATCHDOG_LOCK)"; \
		echo "watchdog: stopped"; \
	else \
		rm -f "$(WATCHDOG_LOCK)"; \
		echo "watchdog: not running"; \
	fi

watchdog-clean: watchdog-stop
	@rm -f "$(WATCHDOG_LOG)"
	@echo "watchdog: log removed"

## <----------------- Inspection ----------------->

info:
	@echo ""
	@echo "Frontend:	https://$(FORTY_TWO_REDIRECT_URI):8001"
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
	@$(MAKE) --no-print-directory watchdog-stop
	$(COMPOSE) --profile dev down --remove-orphans
	@if [ -L services/frontend/node_modules ]; then rm -f services/frontend/node_modules; fi

nuke:
	@$(MAKE) --no-print-directory watchdog-clean
	@$(COMPOSE) --profile dev down -v --remove-orphans --rmi local
	rm -rf ./services/vault/data
	rm -f ./services/vault/config/init-keys.json
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
	@$(MAKE) --no-print-directory watchdog-stop
	@echo "→ Switch en mode dev (hot reload)…"
	@echo "→ Remove services prod pour éviter le conflit de port"
	- $(COMPOSE) stop frontend gateway auth-service users-service
	- $(COMPOSE) rm -f frontend gateway auth-service users-service
	@echo "→ Lancement dev (Vite + HMR)…"
	$(COMPOSE) --profile dev up -d --build --no-deps frontend-dev gateway-dev auth-service-dev users-service-dev
	@$(MAKE) --no-print-directory info
	@$(MAKE) --no-print-directory watchdog-start

## <----------------- Utils CI ----------------->

logs-ci:
	$(COMPOSE) logs --no-color

test-ci:
	@sh tests/run_all.sh
