# =========
# Makefile  (racine du projet)
# =========

# Utilitaires
SHELL := /bin/sh
PROJECT := llcg_transcendence

# Chemin du compose (pas besoin de cd)
COMPOSE := docker compose -f compose/docker-compose.yml

# Par défaut, on cible "gateway" pour les logs/exec ; tu peux surcharger: make logs SERVICE=game
SERVICE ?= gateway

# Cible par défaut
.DEFAULT_GOAL := help

.PHONY: help show show-config health build pull up up-fg down restart logs logs-all logs-tail sh exec check clean no-cache no-cache-service prune nuke

## Affiche l’aide
help:
	@echo ""
	@echo "Commandes disponibles :"
	@echo "  make help            - Affiche cette aide"
	@echo ""
	@echo "  make show            - Liste l’état des services"
	@echo "  make show-config     - Liste l’état de la config compose"
	@echo "  make health          - Affiche l’état + healthcheck de chaque conteneur"
	@echo ""
	@echo "  make build           - (Re)build les images"
	@echo "  make pull            - Récupère les images depuis le registre (si applicable)"
	@echo ""
	@echo "  make up              - Build & démarre les services en arrière-plan"
	@echo "  make up-fg           - Démarre en attach (pratique en dev)"
	@echo "  make down            - Stoppe et supprime les conteneurs"
	@echo "  make restart         - Redémarre proprement (down puis up)"
	@echo ""
	@echo "  make logs            - Affiche les logs du service (SERVICE=..., défaut: gateway)"
	@echo "  make logs-all        - Suit les logs de tous les services"
	@echo "  make logs-tail       - Suit les logs du service (SERVICE=..., 200 dernières lignes)"
	@echo ""
	@echo "  make sh              - Shell dans un service (SERVICE=...)"
	@echo "  make exec CMD=...    - Exécute une commande dans un service (SERVICE=...)"
	@echo ""
	@echo "  make check           - Vérifie que la gateway répond (http://localhost:8080)"
	@echo ""
	@echo "  make clean           - Down + supprime les volumes du compose"
	@echo "  make no-cache        - Rebuild tout sans cache puis recrée/redémarre les conteneurs"
	@echo "  make no-cache-service- Rebuild sans cache du service (SERVICE=...) puis recrée/redémarre sans deps"
	@echo ""
	@echo "  make prune           - Nettoyage Docker global (dangereux si d’autres projets tournent)"
	@echo "  make nuke            - Stoppe tout + supprime volumes/orphelins + purge images inutilisées (global)"
	@echo ""

## Affiche l’état actuel des services
show:
	- $(COMPOSE) ls
	- $(COMPOSE) ls -a
	- $(COMPOSE) ps
	- $(COMPOSE) images
	- $(COMPOSE) volumes
	- docker network ls

## Affiche l’état attendu des services
show-config:
	- $(COMPOSE) config --environment
	- $(COMPOSE) config --profiles
	- $(COMPOSE) config --services
	- $(COMPOSE) config --variables
	- $(COMPOSE) config --images
	- $(COMPOSE) config --volumes
	- $(COMPOSE) config --networks

## Affiche l’état + healthcheck de chaque conteneur
health:
	@$(COMPOSE) ps --format "table {{.Name}}\t{{.State}}\t{{.Health}}"

## (Re)build les images
build:
	$(COMPOSE) build

## Récupère les images depuis le registre (si tu pushes ailleurs)
pull:
	$(COMPOSE) pull

## Build & démarre en détaché
up:
	$(COMPOSE) up -d --build

## Démarre en mode attach (utile pour voir les logs en direct)
up-fg:
	$(COMPOSE) up --build

## Stoppe & supprime les conteneurs
down:
	$(COMPOSE) down

## Redémarre proprement
restart: down up

## Affiche les logs (par défaut: gateway). Exemple: make logs SERVICE=gateway
logs:
	$(COMPOSE) logs -f $(SERVICE)

## Suit les logs de tous les services
logs-all:
	@$(COMPOSE) logs -f

## Suit les logs du service $(SERVICE) (200 dernières lignes au départ)
logs-tail:
	@$(COMPOSE) logs --tail=200 -f $(SERVICE)

## Ouvre un shell dans un service (par défaut: gateway). Exemple: make sh SERVICE=gateway
sh:
	$(COMPOSE) exec $(SERVICE) sh

## Exécute une commande dans un service : make exec SERVICE=gateway CMD="nginx -t"
exec:
	@if [ -z "$(CMD)" ]; then echo "Usage: make exec SERVICE=svc CMD=\"...\""; exit 2; fi
	$(COMPOSE) exec $(SERVICE) sh -lc '$(CMD)'

## Vérifie que la gateway répond (port rootless: 8080 -> 80)
check:
	@echo "→ Test http://localhost:8080"
	@wget -qO- http://localhost:8080 | head -n 5 || (echo "❌ Gateway ne répond pas"; exit 1)
	@echo "\n✅ OK"

## Down + supprime les volumes du compose (attention aux données locales)
clean:
	$(COMPOSE) down -v

## Rebuild tout sans cache puis recrée/redémarre les conteneurs
no-cache:
	@$(COMPOSE) build --no-cache
	@$(COMPOSE) up -d --force-recreate

## Rebuild sans cache uniquement $(SERVICE) puis le recrée/redémarre sans ses dépendances
no-cache-service:
	@$(COMPOSE) build --no-cache $(SERVICE)
	@$(COMPOSE) up -d --no-deps --force-recreate $(SERVICE)

## Nettoyage Docker global (dangereux si tu utilises Docker pour autre chose)
prune:
	@echo "⚠️  Attention: ceci supprime images/volumes réseaux non utilisés."
	docker system prune -af
	docker network prune -f || true

## Stoppe tout + supprime volumes/orphelins puis purge les images Docker inutilisées (global)
nuke:
	@$(COMPOSE) down -v --remove-orphans
	@docker image prune -af
