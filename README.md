This project has been created as part of the 42 curriculum by [lobriott](https://profile.intra.42.fr/users/lobriott), [lzaengel](https://profile.intra.42.fr/users/lzaengel), [cdutel](https://profile.intra.42.fr/users/cdutel), [gmarquis](https://profile.intra.42.fr/users/gmarquis).

# ft_transcendence — 42 Gamification Platform

A full-stack web application that turns the 42 cursus into a gamified experience: challenges between students, progression, XP, badges and leaderboards — built with a production-minded DevOps & Security baseline.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Key Features](#key-features)
* [Quickstart](#quickstart)
* [Environment Variables](#environment-variables)
* [Architecture](#architecture)
* [Database Schema](#database-schema)
* [Tech Stack](#tech-stack)
* [Security](#security)
* [Observability](#observability)
* [CI/CD](#cicd)
* [Project Management](#project-management)
* [Modules & Points](#modules--points)
* [Team & Responsibilities](#team--responsibilities)
* [Individual Contributions](#individual-contributions)
* [Legal](#legal)
* [Resources & AI Usage](#resources--ai-usage)
* [Troubleshooting](#troubleshooting)

---

## Project Overview

**Goal:** provide a clean, simple and motivating platform where 42 students can create or join challenges, track progress and compete fairly.

**Users:** 42 students (multi-user concurrency supported).

**Non-goals (MVP):**

To keep the scope realistic for the evaluation timeline, v1 explicitly does **not** include:

* Payments, subscriptions, or any monetization features
* Public indexing / SEO of user profiles (no “public directory”)
* Third-party integrations beyond authentication providers (OAuth) when enabled
* Mobile native apps (web only)
* Complex moderation workflows (only basic abuse safeguards if needed)
* Production-grade horizontal scaling (single host / Compose deployment)
* Advanced recommendation / ML features (unless claimed as a module)


---

## Key Features

* Authentication (signup/login) + user profiles
* Challenges between students (create, join, validate, history)
* XP, levels, badges, streaks (gamification loop)
* Leaderboards (global + per challenge/category)
* Real-time updates (optional): WebSocket events for live challenge updates, notifications, and online presence
* Admin tools (optional): minimal admin panel for user management, moderation actions, and system health overview


> Note: The app must run on **Chrome stable** with **no console errors**.

---

## Quickstart

### Prerequisites

* Docker + Docker Compose
* GNU Make (recommended)

### 1) Configure environment

```bash
cp .env.example .env
```

### 2) Run the full stack (single command)

```bash
make up
# or: docker compose up --build
```

### 3) Open the app

* Frontend: [http://localhost](http://localhost):<FRONT_PORT>
* Backend API: [http://localhost](http://localhost):<API_PORT>
* API docs (if enabled): [http://localhost](http://localhost):<API_PORT>/docs
* Grafana: [http://localhost](http://localhost):<GRAFANA_PORT>
* Kibana: [http://localhost](http://localhost):<KIBANA_PORT>

### 4) Stop everything

```bash
make down
```

### 5) Reset database (dev only)

```bash
make reset
```

### Test accounts (demo)

The project provides seeded demo users to speed up evaluation.

**User accounts**
* `demo1@ft-transcendence.local` / `<PASSWORD_IN_SEED>`
* `demo2@ft-transcendence.local` / `<PASSWORD_IN_SEED>`
* `demo3@ft-transcendence.local` / `<PASSWORD_IN_SEED>`

**Admin account (if enabled)**
* `admin@ft-transcendence.local` / `<PASSWORD_IN_SEED>`

> Seeds are applied automatically on first run (or via `make seed` / `make reset` depending on the environment).


---

## Environment Variables

All secrets must stay out of git:

* `.env` is **ignored**
* `.env.example` documents required keys

**Minimum required (example):**

* TODO

> Production-grade secrets are managed using **HashiCorp Vault** (see [Security](#security)).

---

## Architecture

High-level components:

* **Frontend** (React): UI + client-side routing + API integration
* **Backend** (Fastify / Node.js): REST API + auth + business logic
* **Database**: SQLite (MVP) — migration path to Postgres is documented (TODO)
* **Reverse proxy / WAF**: Nginx + ModSecurity (hardened rules)
* **Observability**:

  * Prometheus + Grafana (metrics, dashboards, alerts)
  * ELK (centralized logs, dashboards, retention)

**Diagram:**

* TODO: add `docs/architecture.png` (and link it here)

---

## Database Schema

**Current DB:** SQLite (single instance).
**Schema diagram:**

* TODO: add `docs/db_schema.png` (and link it here)

**Core entities (example):**

* TODO
---

## Tech Stack

### Frontend

* React
* UI: TODO (e.g. Tailwind / shadcn / MUI)

### Backend

* Node.js + Fastify
* API documentation: TODO (OpenAPI / Swagger)

### Database

* SQLite (MVP)
* Planned: Postgres (recommended for concurrency, scaling, microservices)

### DevOps

* Docker / Docker Compose
* Prometheus + Grafana
* ELK (Elasticsearch + Logstash + Kibana)

### Security

* ModSecurity (WAF) on reverse proxy
* HashiCorp Vault for secrets

---

## Security

Baseline requirements:

* Passwords are **hashed + salted** (never stored in plain text)
* Input validation on **frontend and backend**
* Secrets are not committed, managed via `.env.example` + Vault
* Backend must enforce **HTTPS**
* WAF layer: **ModSecurity** enabled and hardened

### Vault (secrets management)

* Vault stores: JWT signing keys, database credentials (if Postgres), API keys, etc.
* Access policies are defined per service/environment

**Dev workflow**
* Vault is started via Docker Compose.
* Initialization/unseal is required only for local development.
* A minimal policy is provided per service (backend / observability).

**How services receive secrets**
* Secrets are injected as environment variables at container start (template/env approach).
* No secrets are committed to git; `.env.example` documents required keys only.


### ModSecurity (WAF)

* Reverse proxy includes ModSecurity + OWASP CRS
* Rules are hardened with minimal exceptions for JSON APIs
**Quick WAF test checklist**
* Should be blocked (4xx):
  * obvious SQL injection payloads (`' OR 1=1 --`)
  * basic XSS attempts (`<script>alert(1)</script>`)
  * invalid content-types on JSON routes (e.g. `text/plain`)
* Should be allowed (2xx/expected):
  * valid JSON requests with proper `Content-Type: application/json`
  * authenticated requests with JWT/session cookies
  * normal user-generated content (including emojis) after sanitization/encoding

---

## Observability

### Metrics (Prometheus + Grafana)

* Backend exposes `/metrics` (Prometheus scrape)
* Mandatory dashboards (minimum):

  * API request rate (RPS)
  * Error rate (4xx/5xx)
  * Latency (p95/p99)
  * Container CPU/memory
* TODO: alerting rules:

  * service down
  * high 5xx rate
  * latency above threshold

### Logs (ELK)

* Backend logs are **structured JSON** to stdout
* Required fields:

  * `timestamp`, `level`, `service`, `request_id`, `route`, `status`, `duration_ms`
* Centralization:

  * Logstash pipeline parses & ships logs to Elasticsearch
  * Kibana dashboards provide search + filters + retention
* TODO: add screenshots of Kibana dashboards to `docs/`

---

## CI/CD

### CI (on Pull Requests)

* Lint/format
* Unit tests
* Docker build
* Compose smoke test (`up` + healthcheck)
* Security checks:

  * secret scanning
  * dependency audit
  * container scan (optional but recommended)

### CD (on main)

* TODO: Deployment is optional for this project and depends on the chosen environment.

If enabled, the pipeline:
* builds and tags Docker images
* pushes images to a registry
* deploys to a staging environment
* runs database migrations + seed in a controlled step


---

## Project Management

Workflow:

* Issues describe user stories + acceptance criteria
* PRs are reviewed (at least 1 reviewer)
* CI must pass before merge
* Merge strategy: **squash merge** to keep main readable

Conventions:

* Branch naming:

  * `feat/<topic>`
  * `fix/<topic>`
  * `chore/<topic>`
  * `docs/<topic>`
* Commit messages (Conventional Commits):

  * `feat(auth): add JWT login`
  * `fix(api): validate payload`
  * `ci: add docker build job`
  * `docs(README.md): basic README.md added`

---

## Modules & Points

Target: **>= 19 points** (Majors: 2 pts, Minors: 1 pt)

### Selected modules

| Module                                                         |  Type | Points | Status      | Notes    |                                                   |
| -------------------------------------------------------------- | ----: | -----: | ----------- | -------- | ------------------------------------------------- |
| Module                                                         |  Type | Points | Status      | Owner    | Notes                                             |
| ---                                                            |  ---: |   ---: | ---         | ---      | ---                                               |
| Use a frontend framework (React)                               | Minor |      1 | Planned     | lobriott | React                                   |
| Use a backend framework (Fastify)                              | Minor |      1 | Planned     | cdutel   | Node.js + Fastify                                 |
| Standard user management and authentication                    | Major |      2 | Planned     | cdutel   | Core auth flows + user lifecycle                  |
| Implement a complete 2FA system                                | Minor |      1 | Planned     | cdutel   | TOTP/app-based (details in Wiki)                  |
| Allow users to interact with other users                       | Major |      2 | Planned     | cdutel   | Friends, challenges between users, etc.           |
| Public API (API key + rate limiting + docs + ≥5 endpoints)     | Major |      2 | Planned     | cdutel   | Dedicated API key + docs + throttling             |
| Prometheus + Grafana                                           | Major |      2 | Planned     | gmarquis | Metrics + dashboards + alerting                   |
| ELK                                                            | Major |      2 | Planned     | gmarquis | Centralized logs + retention + dashboards         |
| Cybersecurity (WAF + Vault)                                    | Major |      2 | Planned     | gmarquis | ModSecurity hardened + HashiCorp Vault            |
| Health check + status page + automated backups + DR procedures | Minor |      1 | Planned     | gmarquis | Status endpoint/page + backup/restore runbook     |
| Notification system for CRUD actions                           | Minor |      1 | Planned     | lobriott | In-app notifications (and optional email/webhook) |
| Custom-made design system (≥10 reusable components)            | Minor |      1 | Planned     | lobriott | Palette, typography, icons, components            |
| OAuth 2.0 remote auth (Google/GitHub/42/etc.)                  | Minor |      1 | Planned     | lobriott | OAuth2 login + account linking                    |
| User activity analytics & insights dashboard                   | Minor |      1 | Planned     | lobriott | Basic analytics & insights                        |
| Gamification system to reward users                            | Minor |      1 | Planned     | lobriott | XP/badges UX + reward loops                       |
| Advanced analytics dashboard with data visualization           | Major |      2 | Planned     | lobriott | Charts + aggregates                               |
| GDPR compliance features                                       | Minor |      1 | Planned     | lobriott | Export/delete data, consent, etc.                 |
| Multiple languages (≥3 languages)                              | Minor |      1 | Planned     | lzaengel | i18n + locale switching                           |

**Planned total:** 25 / 14

> We may adjust scope/modules during development, but the goal is to stay **>= 19 points** with solid, demonstrable deliverables.

---

## Team & Responsibilities

> We are a team of 4. Roles are documented and each member can explain their work.

| Member   | Role(s)                         | Responsibilities |
| -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| lobriott | Project Manager + Frontend Lead | Planning/coordination, UI/UX & mockups, React frontend, design system (reusable components), notifications, OAuth2, analytics dashboards, GDPR features, gamification UX |
| lzaengel | Frontend Developer              | i18n (≥3 languages), UI integration, frontend features support, testing & polish |
| cdutel   | Tech Lead Backend               | Backend architecture, Fastify codebase, JWT/session strategy, database design & migrations, user management/auth, public API (API key + rate limiting + docs) |
| gmarquis | Product Owner + DevOps/Security | Backlog priority & acceptance, CI/CD, observability (Prometheus/Grafana + ELK), WAF (ModSecurity), Vault secrets, health/status + backups/DR |


---

## Individual Contributions

Provide a clear breakdown for evaluation.

### lobriott (PM + Frontend Lead)

* Project management: planning, coordination, milestone tracking
* UI/UX:

  * mockups/wireframes and navigation flows
  * design system (palette, typography, icons) + ≥10 reusable components
* Frontend implementation:

  * React app structure, routing, state/data fetching
  * notification system for CRUD actions
  * OAuth2 remote auth (provider(s) TBD)
* Analytics + compliance:

  * activity analytics & insights dashboard
  * advanced analytics dashboard with data visualization
  * GDPR compliance features
* Gamification UX:

  * reward loops, progression feedback, badges/XP presentation

### lzaengel (Frontend Developer)

* Internationalization:

  * multi-language support (≥3 languages)
  * locale switcher + translation workflow
* Frontend support:

  * integration of features/components
  * bug fixes, polishing, and test support

### cdutel (Tech Lead Backend)

* Backend architecture and code ownership (Fastify + Node.js)
* Auth and sessions:

  * JWT issuance/refresh strategy
  * Standard user management (signup/login/password reset/account lifecycle)
  * 2FA (TOTP) end-to-end
* Database:

  * schema design, migrations, seed strategy
  * query layer conventions and performance guardrails
* Public API:

  * secured API key, rate limiting, documentation, and ≥5 endpoints
* User interactions:

  * features enabling users to interact with each other (friends/challenges/etc.)

### gmarquis (PO + DevOps/Security)

* Owns backlog priorities and feature acceptance criteria
* CI/CD: PR checks (lint/test/build/smoke), main branch protections, release workflow
* Observability:

  * Prometheus scrape + `/metrics` conventions
  * Grafana dashboards (RPS, 4xx/5xx, p95/p99, container resources)
  * Alerting rules (service down, high error rate, latency)
* Logs:

  * Structured JSON logging conventions + request correlation (`request_id`)
  * ELK pipeline (Logstash → Elasticsearch) + Kibana dashboards/retention
* Security:

  * HashiCorp Vault integration for secrets
  * Reverse proxy WAF with ModSecurity + hardened rules for JSON APIs
* Resilience:

  * Health checks + status page
  * Automated backups + tested restore procedure + DR checklist

---

## Legal

This project includes:

* **Privacy Policy** (in-app): TODO: route/link (e.g. `/privacy`)
* **Terms of Service** (in-app): TODO: route/link (e.g. `/terms`)

> These pages must contain real content (no placeholder text) and must be accessible from the UI (e.g. footer).

---

## Resources & AI Usage
### Documentation / References

* [Tilt (docs)](https://docs.tilt.dev/)
* [Fastify documentation](https://fastify.io/docs/latest/)
* [React documentation](https://react.dev/learn/)
* [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
* [Docker Compose documentation](https://docs.docker.com/compose/)
* [Prometheus documentation](https://prometheus.io/docs/introduction/overview/)
* [Grafana documentation](https://grafana.com/docs/)
* [Elastic Stack documentation (Elasticsearch / Logstash / Kibana)](https://www.elastic.co/docs/get-started/the-stack)
* [Elasticsearch reference](https://www.elastic.co/docs/reference/elasticsearch)
* [Logstash reference](https://www.elastic.co/docs/reference/logstash)
* [Kibana reference](https://www.elastic.co/docs/reference/kibana)
* [HashiCorp Vault documentation](https://developer.hashicorp.com/vault/docs)
* [ModSecurity documentation](https://github.com/owasp-modsecurity/ModSecurity/wiki)
* [OWASP Core Rule Set (CRS) documentation](https://coreruleset.org/docs/)

### AI usage

We used AI tools to:
* draft documentation structure and checklists
* review configuration files for consistency
* suggest refactoring ideas and edge cases for validation and error handling

We did **not** copy-paste AI-generated code blindly.

---

## Troubleshooting

### Common issues

* TODO

---

## License

This is a 42 school project. No license is provided.
