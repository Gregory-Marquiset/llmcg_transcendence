> This project has been created as part of the 42 curriculum lobriott, lzaengel, mda-cunh, cdutel, gmarquiset.

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

**Overview:** A full-stack web application that turns the 42 cursus into a gamified experience: challenges between students, progression, XP, badges and leaderboards — built with a production-minded DevOps & Security baseline.

**Goal:** Provide a clean, simple and motivating platform where 42 students can create or join challenges, track progress and compete fairly.

**Users:** 42 students (multi-user concurrency supported).

### Key Features

* Authentication (signup/login) + user profiles
* Challenges between students (create, join, validate, history)
* XP, levels, badges, streaks (gamification loop)
* Real-time updates : WebSocket events for live challenge updates, notifications, and online presence
* Basic chat system between two users via WebScket.

> Note: The app must run on **Chrome stable** with **no console errors**.

### Project Management

The team organized the work using clear task distribution and regular coordination. Tasks were managed and tracked through GitHub Projects, allowing everyone to follow progress and responsibilities. Communication was handled primarily via Discord, with weekly video calls to discuss progress, address issues, and plan upcoming work.

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

* PostgreSQL (Chosen for its industry standard status)
* Adminer

## 📊 Database Schema

➡️ [View database schema diagram](docs/database_schema.mmd)

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
* curl + grep

### 1) Configure environment

```bash
cat .denv > .env
```

### 2) Run the full stack (single command)

```bash
make up
```

### 3) Open the app

* Frontend: https://localhost:8001/
* Backend API: http://localhost:5000
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

### 7) Backend API docs

#### API – Auth & Users/Friends Microservices

Base URL : `https://localhost:5000/api/v1`

## Auth Microservice

### Register

**POST** `/auth/register`

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### Login

**POST** `/auth/login`

```json
{
  "email": "string",
  "password": "string"
}
```

**Response**

```json
{
  "access_token": "string"
}
```

* `access_token` → Header `Authorization: Bearer <token>`
* `refresh_token` → Cookie (à refresh toutes les 5 min)

### Login 2FA

**POST** `/auth/login2fa`
⚠️ À revoir

### Me

**GET** `/auth/me`
🔒 Authorization required

```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "avatar_path": "string",
  "twofa_enabled": 0,
  "createdAt": "string"
}
```

### Refresh Token

**POST** `/auth/refresh`

* Renvoie un nouvel `access_token`
* Reset le `refresh_token` (cookie)

### Logout

**DELETE** `/auth/logout`

### 2FA Setup

**POST** `/auth/2fa/setup`
🔒 Authorization required

```json
{
  "secret": "string"
}
```

⚠️ À revoir

### 2FA Verify

**POST** `/auth/2fa/verify`
🔒 Authorization required
⚠️ À revoir

---

## Users / Friends Microservice

### Update My Profile

**PATCH** `/users/user/me`
🔒 Authorization required

```json
{
  "new_username": "string",
  "new_email": "string"
}
```

### Upload Avatar

**POST** `/users/user/me/avatar`
🔒 Authorization required

### Get User Profile

**GET** `/users/user/:targetId/profil`
🔒 Authorization required

```json
{
  "id": 1,
  "username": "string",
  "avatar_path": "string"
}
```

---

### Friends

### Send Friend Request

**POST** `/users/friends/:targetId/request`
🔒 Authorization required

```json
{
  "sender_id": 1,
  "receiver_id": 2,
  "status": "pending"
}
```

### Accept / Refuse Friend Request

**PATCH** `/users/friends/:senderId`
🔒 Authorization required

```json
{
  "action": "accept | refuse"
}
```

### Delete Friend

**DELETE** `/users/friends/:targetId/delete`
🔒 Authorization required

### Block User

**POST** `/users/friends/:targetId/block`
🔒 Authorization required

### Unblock User

**POST** `/users/friends/:targetId/unblock`
🔒 Authorization required

### Friends List

**GET** `/users/friends/list`
🔒 Authorization required

```json
[
  {
    "id": 1,
    "username": "string",
    "avatar_path": "string"
  }
]
```

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
| Use a frontend framework (React)                               | Minor |      1 |   Done  | lobriott / lzaengel | React                                              |
| Use a backend framework (Fastify)                              | Minor |      1 |   Done  | cdutel             | Node.js + Fastify                                  |
| Realtime feature with websocket                                | Major |      2 |   Done  | cdutel / mda_cunh  | Chat and online status                             |
| Allow users to interact with other users                       | Major |      2 |   Done  | lzaengel           | Friends, challenges between users, etc.            |
| Public API (API key + rate limiting + docs + ≥5 endpoints)     | Major |      2 |   Done  | cdutel             | Dedicated API key + docs + throttling              |
| Custom-made design system (≥10 reusable components)            | Minor |      1 |   Done  | lobriott / lzaengel | Palette, typography, icons, components             |
| Advenced searching feature                                     | Minor |      1 |   Done  | lobriott           | Dashboard menu searching                           |
| Multiple languages (≥3 languages)                              | Minor |      1 |   Done  | lzaengel           | i18n + locale switching                            |
| Standard user management and authentication                    | Major |      2 |   Done  | cdutel             | Core auth flows + user lifecycle                   |
| OAuth 2.0 remote auth (Google/GitHub/42/etc.)                  | Minor |      1 |   Done  | mda_cunh           | OAuth2 login + account linking                     |
| User activity analytics & insights dashboard                   | Minor |      1 |   Done  | lobriott           | Basic analytics & insights                         |
| Cybersecurity (WAF + Vault)                                    | Major |      2 |   Done  | mda_cunh           | ModSecurity hardened + HashiCorp Vault             |
| Prometheus + Grafana                                           | Major |      2 |   Done  | gmarquis           | Metrics + dashboards + alerting                    |
| Micro-service                                                  | Major |      2 |   Done  | gmarquis           | All services are managed in there own container    |
| Health check + status page + automated backups + DR procedures | Minor |      1 |   Done  | gmarquis           | Status endpoint/page + backup/restore runbook      |
| GDPR compliance features                                       | Minor |      1 |   Done  | lobriott           | Export/delete data, consent, etc.                  |
| CI/CD + git team workflow                                      | Major |      2 |   Done  | gmarquis           | Continuous integration/deployment + PR strict rules |
| Bash script tester + github action workflow                    | Major |      2 |   Done  | gmarquis           | 100% personalized Bash test + auto launch in PR    | 

> We may adjust scope/modules during development, but the goal is to stay **>= 19 points** with solid, demonstrable deliverables.

---
<a id="contributors-responsabilities"></a>

## 👥 Contributors responsabilities

> We are a team of 5. Roles are documented and each member can explain their work.

| Member   | Role(s)                         | Responsibilities |
| -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| lobriott | Project Manager + Frontend Lead | Planning / Coordination, UI/UX & mockups, React frontend, design system (reusable components), notifications, analytics dashboards, GDPR features, gamification UX |
| lzaengel | Frontend Developer              | i18n (≥3 languages), UI integration, OAuth2, Friends gestion, dashboard data extraction |
| mda_cunh | Security / Debuging             | WAF (ModSecurity), Vault secrets + Mercge conflict specialist |
| cdutel   | Tech Lead Backend               | Backend architecture, Fastify codebase, JWT/session strategy, database design & migrations, user management/auth, public API (API key + rate limiting + docs) |
| gmarquis | Product Owner + DevOps          | Backlog & global project documentation, CI/CD, unit test (Bash script), observability (Prometheus/Grafana), health/status + backups/DR |

### PM + Fullstack Developer

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

### Security + Fullstack Developer

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

> This is a 42 school project. No license is provided.

---
