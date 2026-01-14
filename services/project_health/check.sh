#!/bin/sh
set -e

pg_isready -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null

curl -fsS http://gateway:5000/health >/dev/null
curl -fsS http://auth-service:5000/health >/dev/null
curl -fsS http://users-service:5000/health >/dev/null

curl -fsS http://frontend/ >/dev/null

curl -fsS http://adminer:8080/ >/dev/null
