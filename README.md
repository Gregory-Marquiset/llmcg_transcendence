> This project has been created as part of the 42 curriculum by lobriot, lzaengel, mdacunh, cdutel, gmarquis.

---

## Table of Contents

* [Description](#description)
* [Instructions](#instructions)
* [CI/CD & Project management](#cicd--project-management)
* [Modules points](#modules-points)
* [Contributors responsibilities](#contributors-responsabilities)
* [Resources](#resources)

---
<a id="description"></a>

## 🌐 Description 

### llmcg_transcendence — 42 Gamification Platform

**Goal:** provide a clean, simple and motivating platform where 42 students can create or join challenges, track progress and compete fairly.

**Overview:**
A full-stack web application that turns the 42 cursus into a gamified experience: challenges between students, progression, XP, badges and leaderboards — built with a production-minded DevOps & Security baseline.

**Users:** 42 students (multi-user concurrency supported).

### Key Features

* Authentication (signup/login) + user profiles
* Challenges between students (create, join, validate, history)
* XP, levels, badges, streaks (gamification loop)
* Leaderboards (global + per challenge/category)
* Real-time updates : WebSocket events for live challenge updates, notifications, and online presence
* Basic chat system between two users via WebScket.

> Note: The app must run on **Chrome stable** with **no console errors**.

### Architecture

High-level components:

* **Frontend** vite + nginx / (React): UI + client-side routing + API integration
* **Backend** (Fastify / Node.js): REST API + auth + business logic
* **Database**: Postgres + adminer
* **Reverse proxy / WAF**: Nginx + ModSecurity (hardened rules)
* **Security**: HashiCorp Vault
* **Observability**: Prometheus + Grafana (metrics, dashboards, alerts)

### Tech Stack

### Frontend

* React
* Tailwind

### Backend

* Node.js + Fastify
* Swagger

### Database

* PostgreSQL
* Adminer

### DevOps

* Docker / Docker Compose
* Prometheus + Grafana
* Bash unit test
* Github workflow

### Security

* ModSecurity (WAF) on reverse proxy
* HashiCorp Vault for secrets

---
<a id="instructions"></a>

## 🚀 Instructions

### Prerequisites

* Docker + Docker Compose
* GNU Make

### 1) Configure environment

```bash
cat .denv > .env
```

### 2) Run the full stack (single command)

```bash
make up
```

### 3) Open the app

* Frontend: http://localhost:5173
* Backend API: http://localhost:5000
* Fastify docs: http://localhost:5000/docs
* Adminer: http://localhost:8080
* Prometheus: http://localhost:9090
* Grafana: http://localhost:3000

### 4) Stop everything

```bash
make down
```

### 5) Restart from scratch (clean db)

```bash
make re
```

### 6) Test and demo accounts

The project provides comprehensive unit tests covering the basics for this project. It also up the project for speed up evaluation and testing.

```bash
make test
# build + up to E2E user story
```
- If the project already run:
```bash
make test-light
# Do not rebuild only backend to E2E user story
```
- For a from scratch complete tests
```bash
make test-nc
# Clean evrything from prvious project run and start tests from scratch
```

> After test completion the project is up and completely usable

---
<a id="cicd--project-management"></a>

## ⚙ CI/CD & Project management

### Workflow (Branching & PR)
- All changes are made in a branch created from `main`.
- Direct pushes to `main` are forbidden.
- Merges require:
  - CI checks to pass
  - 2 approving reviews

### CI
CI runs on every pull request and includes:

- **Build & sanity**
  - Docker build + up
  - Service-to-service integration tests

- **Backend**
  - Unit tests
  - Integration tests (DB)

- **Frontend**
  - Unit tests / build

- **End-to-end**
  - Acceptance tests (light user stories)

Versioning work conventions:

* Branch naming:
  * `feat/<topic>`
  * `fix/<topic>`
  * `chore/<topic>`
  * `docs/<topic>`

* Commit messages (Conventional Commits):
  * `feat(auth): add JWT login`
  * `update(search bar): add slide option to seach bar`
  * `fix(api): validate payload`
  * `ci: add docker build job`
  * `docs(README.md): basic README.md added`

---
<a id="modules-points"></a>

## 🧩 Modules points

Target: **>= 19 points** (Majors: 2 pts, Minors: 1 pt)

### Selected modules

| Module                                                         |  Type | Points | Status  | Owner              | Notes                                             |
| -------------------------------------------------------------- | ----: | -----: | ------- | ------------------ | ------------------------------------------------- |
| Use a frontend framework (React)                               | Minor |      1 | Planned | lobriott / lzaengel | React                                              |
| Use a backend framework (Fastify)                              | Minor |      1 | Planned | cdutel             | Node.js + Fastify                                  |
| Standard user management and authentication                    | Major |      2 | Planned | cdutel             | Core auth flows + user lifecycle                   |
| Implement a complete 2FA system                                | Minor |      1 | Planned | cdutel             | TOTP/app-based (details in Wiki)                   |
| Allow users to interact with other users                       | Major |      2 | Planned | lzaengel           | Friends, challenges between users, etc.            |
| Public API (API key + rate limiting + docs + ≥5 endpoints)     | Major |      2 | Planned | cdutel             | Dedicated API key + docs + throttling              |
| Prometheus + Grafana                                           | Major |      2 | Planned | gmarquis           | Metrics + dashboards + alerting                    |
| Cybersecurity (WAF + Vault)                                    | Major |      2 | Planned | mda_cunh           | ModSecurity hardened + HashiCorp Vault             |
| Health check + status page + automated backups + DR procedures | Minor |      1 | Planned | gmarquis           | Status endpoint/page + backup/restore runbook      |
| Notification system for CRUD actions                           | Minor |      1 | Planned | lobriott           | In-app notifications (and optional email/webhook)  |
| Custom-made design system (≥10 reusable components)            | Minor |      1 | Planned | lobriott           | Palette, typography, icons, components             |
| OAuth 2.0 remote auth (Google/GitHub/42/etc.)                  | Minor |      1 | Planned | lzaengel           | OAuth2 login + account linking                     |
| User activity analytics & insights dashboard                   | Minor |      1 | Planned | lobriott           | Basic analytics & insights                         |
| Gamification system to reward users                            | Minor |      1 | Planned | lobriott           | XP/badges UX + reward loops                        |
| Advanced analytics dashboard with data visualization           | Major |      2 | Planned | lobriott           | Charts + aggregates                                |
| GDPR compliance features                                       | Minor |      1 | Planned | lobriott           | Export/delete data, consent, etc.                  |
| Data export & import functionality                             | Minor |      1 | Planned | lzaengel           | Export JSON/CSV/XML; import validation; bulk ops   |
| Multiple languages (≥3 languages)                              | Minor |      1 | Planned | lzaengel           | i18n + locale switching                            |

> We may adjust scope/modules during development, but the goal is to stay **>= 19 points** with solid, demonstrable deliverables.

---
<a id="contributors-responsabilities"></a>

## 👥 Contributors responsabilities

> We are a team of 5. Roles are documented and each member can explain their work.

| Member   | Role(s)                         | Responsibilities |
| -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| lobriott | Project Manager + Frontend Lead | Planning / Coordination, UI/UX & mockups, React frontend, design system (reusable components), notifications, analytics dashboards, GDPR features, gamification UX |
| lzaengel | Frontend Developer              | i18n (≥3 languages), UI integration, OAuth2, Friends gestion, dashboard data extraction |
| mda_cunh | Security                        | WAF (ModSecurity), Vault secrets |
| cdutel   | Tech Lead Backend               | Backend architecture, Fastify codebase, JWT/session strategy, database design & migrations, user management/auth, public API (API key + rate limiting + docs) |
| gmarquis | Product Owner + DevOps          | Backlog & global project documentation, CI/CD, unit test (Bash script), observability (Prometheus/Grafana), health/status + backups/DR |

### PM + Frontend Lead

<a href="https://profile.intra.42.fr/users/lobriott">
  <img alt="Lou's 42 stats" src="https://badge.mediaplus.ma/darkblue/lobriott?1337Badge=off&UM6P=off" />
</a>

* Project management: Backlogs, planning, coordination, milestone tracking

* UI/UX:
  * mockups/wireframes and navigation flows
  * design system (palette, typography, icons) + ≥10 reusable components

* Frontend implementation:
  * React app structure, routing, state/data fetching
  * notification system for CRUD actions

* Backend implementation:
  * GDPR-compliant feature with temporary tokens and an RGPD-compliant process
  * User statistics management for gamification features

* Analytics + compliance:
  * activity analytics & insights dashboard
  * advanced analytics dashboard with data visualization
  * GDPR compliance features

* Gamification UX:
  * reward loops, progression feedback, badges/XP presentation

### Frontend Developer

<a href="https://profile.intra.42.fr/users/lazaengel">
  <img alt="Liam's 42 stats" src="https://badge.mediaplus.ma/darkblue/lzaengel?1337Badge=off&UM6P=off" />
</a>

* Internationalization:
  * multi-language support (≥3 languages)
  * locale switcher + translation workflow

* Frontend developer:
  * integration of features/components
  * Friend gestion
  * Dashboard data extraction

### Security

<a href="https://profile.intra.42.fr/users/mda-cunh">
  <img alt="Mda-cunh's 42 stats" src="https://badge.mediaplus.ma/darkblue/mda-cunh?1337Badge=off&UM6P=off" />
</a>

* Security:
  * HashiCorp Vault integration for secrets
  * Reverse proxy WAF with ModSecurity + hardened rules for JSON APIs

* Backend implementation:
  * OAuth2 remote auth (provider(s) TBD)


### Tech Lead Backend

<a href="https://profile.intra.42.fr/users/cdutel">
  <img alt="Charles's 42 stats" src="https://badge.mediaplus.ma/darkblue/cdutel?1337Badge=off&UM6P=off" />
</a>

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

### PO + DevOps

<a href="https://profile.intra.42.fr/users/gmarquis">
  <img alt="Gregory's 42 stats" src="https://badge.mediaplus.ma/darkblue/gmarquis?1337Badge=off&UM6P=off" />
</a>

* Feature acceptance criteria and global documentaion of the project

* Unit test system in bash script

* CI/CD
  * Main branch protections
  * Release workflow

* Observability:
  * Prometheus scraps
  * Grafana dashboards

* Resilience:
  * Health checks + status page
  * Automated backups + tested restore procedure + DR checklist

> And a special thanks to the cats, soon we will all be transcended by the power of [the flower of knowledge](https://www.youtube.com/watch?v=uwmeH6Rnj2E)

---
<a id="resources"></a>

## 📑 Resources

### Documentation / References

* [Fastify documentation](https://fastify.io/docs/latest/)
* [React documentation](https://react.dev/learn/)
* [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
* [Docker Compose documentation](https://docs.docker.com/compose/)
* [Prometheus documentation](https://prometheus.io/docs/introduction/overview/)
* [Grafana documentation](https://grafana.com/docs/)
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

> This is a 42 school project. No license is provided.

---
