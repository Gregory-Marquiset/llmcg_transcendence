
# =========
# Makefile  (racine du projet)
# =========

# Utilitaires
SHELL := /bin/sh
PROJECT := cg_transcendence

# Chemin du compose (pas besoin de cd)
COMPOSE := docker compose --env-file .env -f docker-compose.yml

# Par défaut, on cible "gateway" pour les logs/exec ; tu peux surcharger: make logs SERVICES=game
SERVICES ?= gateway

# Cible par défaut
.DEFAULT_GOAL := help

.PHONY: help up up-fg build down restart logs ps exec sh clean nuke prune check pull

## Affiche l’aide
help:
	@echo ""
	@echo "Commandes disponibles :"
	@echo "  make up         - Build & démarre les services en arrière-plan"
	@echo "  make up-fg      - Démarre en attach (pratique en dev)"
	@echo "  make build      - (Re)build les images"
	@echo "  make down       - Stoppe et supprime les conteneurs"
	@echo "  make restart    - Redémarre proprement (down puis up)"
	@echo "  make logs       - Affiche les logs (SERVICES=...)"
	@echo "  make ps         - Liste l’état des services"
	@echo "  make sh         - Shell dans un service (SERVICES=...)"
	@echo "  make exec CMD=… - Exécute une commande dans un service (SERVICES=...)"
	@echo "  make clean      - Down + supprime les volumes du compose"
	@echo "  make prune      - Nettoyage Docker (dangereux si d’autres projets tournent)"
	@echo "  make check      - Vérifie que la gateway répond (http://localhost:8080)"
	@echo "  make pull       - Récupère les images depuis le registre (si applicable)"
	@echo ""

## Build & démarre en détaché
up:
	$(COMPOSE) up -d --build

## Démarre en mode attach (utile pour voir les logs en direct)
up-fg:
	$(COMPOSE) up --build

## (Re)build les images
build:
	$(COMPOSE) build

## Stoppe & supprime les conteneurs
down:
	$(COMPOSE) down

## Redémarre proprement
restart: down up

## Affiche les logs (par défaut: gateway). Exemple: make logs SERVICES=gateway
logs:
	$(COMPOSE) logs -f $(SERVICES)

## Affiche l’état des services
ps:
	$(COMPOSE) ps

## Ouvre un shell dans un service (par défaut: gateway). Exemple: make sh SERVICES=gateway
sh:
	$(COMPOSE) exec $(SERVICES) sh

## Exécute une commande dans un service : make exec SERVICES=gateway CMD="nginx -t"
exec:
	@if [ -z "$(CMD)" ]; then echo "Usage: make exec SERVICES=svc CMD=\"...\""; exit 2; fi
	$(COMPOSE) exec $(SERVICES) sh -lc '$(CMD)'

## Down + supprime les volumes du compose (attention aux données locales)
clean:
	$(COMPOSE) down -v

## Nettoyage Docker global (dangereux si tu utilises Docker pour autre chose)
prune:
	@echo "⚠️  Attention: ceci supprime images/volumes réseaux non utilisés."
	docker system prune -af
	docker network prune -f || true

## Vérifie que la gateway répond (port rootless: 8080 -> 80)
check:
	@echo "→ Test http://localhost:8080"
	@wget -qO- http://localhost:8080 | head -n 5 || (echo "❌ Gateway ne répond pas"; exit 1)
	@echo "\n✅ OK"

## Récupère les images depuis le registre (si tu pushes ailleurs)
pull:
	$(COMPOSE) pull
