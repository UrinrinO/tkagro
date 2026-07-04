# T.kays Agrocosmetics — Digital Platform

> Balanced Wellness — Potent African skincare for healthy glowing skin  
> Full-stack e-commerce platform: Online Shop · Training Academy · Balanced Wellness Hub · Admin Dashboard

---

## Project Overview

T.kays Agrocosmetics is a vegan, herbal, organic, and natural (VHON) skincare brand targeting melanin-rich skin. This repository contains the full digital platform comprising:

- **Public Website** — React.js (TypeScript) — shop, skin concern filters, results gallery, wellness hub
- **Backend API** — Node.js + Express (JavaScript) — REST API, business logic, integrations
- **Admin Dashboard** — React.js — orders, inventory, analytics, content management

---

## Repository Structure

```
tkays-agrocosmetics/
├── README.md                  ← You are here
├── frontend/
│   ├── docs/
│   │   ├── ARCHITECTURE.md    ← System architecture & data flow
│   │   ├── API.md             ← Full API reference
│   │   ├── AGENTS.md          ← AI agent roles, routing rules, crewAI config
│   │   ├── CONVENTIONS.md     ← Code style, naming, patterns all agents must follow
│   │   ├── BRAND.md           ← Design tokens, colours, typography
│   │   └── DEPLOYMENT.md      ← Environments, CI/CD, secrets
│   └── src/                   ← React.js website + Admin Dashboard
└── backend/
    ├── docs/
    │   ├── ARCHITECTURE.md
    │   ├── API.md
    │   ├── DATABASE.md        ← Schema, migrations, ERD
    │   ├── AGENTS.md
    │   ├── CONVENTIONS.md
    │   └── DEPLOYMENT.md
    └── src/                   ← Node.js + Express API
```

---

## Brand

**Vision:** To become a trusted global skincare brand known for delivering effective, culturally rooted, and holistic skincare solutions.

**Mission:** To unveil the beauty of Black people through potent VHON-formulated products that improve, maintain, treat, repair, and transform the skin and mental wellbeing.

**Slogan:** Balanced Wellness

**Core Values:** VHON (Vegan, Herbal, Organic, Natural) · DICE (Diversity, Inclusivity, Community, Equality) · Holistic Skincare · Mental Wellness · Product Potency

---

## Tech Stack

| Layer        | Technology                                 |
| ------------ | ------------------------------------------ |
| Web Frontend | React.js (React + TypeScript)              |
| Backend API  | Node.js + Express (JavaScript)             |
| Database     | PostgreSQL                                 |
| Payments     | Stripe                                     |
| Email        | Resend                                     |
| File Storage | Cloudinary                                 |
| Hosting      | Vercel (frontend) + Railway (backend + DB) |

---

## Design System

**Brand Colours**

| Token           | Hex       | Usage                            |
| --------------- | --------- | -------------------------------- |
| `--earth`       | `#7A3B2E` | Primary brand, CTAs              |
| `--earth-light` | `#9E5442` | Hover states                     |
| `--earth-pale`  | `#F5EAE6` | Card backgrounds, chip fills     |
| `--gold`        | `#C9973A` | Accents, highlights, badges      |
| `--gold-pale`   | `#FBF3E0` | Warm background tints            |
| `--green`       | `#3E6B30` | VHON tags, organic/natural badges|
| `--green-pale`  | `#EAF2E5` | Feature section backgrounds      |
| `--dark`        | `#1C0F0A` | Nav, headers, primary text       |
| `--grey`        | `#6B5E58` | Secondary text, labels           |
| `--lgrey`       | `#F8F5F2` | Page backgrounds                 |
| `--cream`       | `#FAF5EC` | Card backgrounds, warm surfaces  |
| `--red`         | `#C0392B` | Errors, alerts                   |

---

## Getting Started

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Start development servers
cd backend && npm run dev        # API on http://localhost:4000
cd frontend && npm run dev       # Website on http://localhost:3000
```

---

## Documentation Index

| Doc                                             | Purpose                                |
| ----------------------------------------------- | -------------------------------------- |
| [frontend/docs/ARCHITECTURE.md](frontend/docs/ARCHITECTURE.md) | How the system fits together |
| [frontend/docs/API.md](frontend/docs/API.md)   | All endpoints, request/response shapes |
| [backend/docs/DATABASE.md](backend/docs/DATABASE.md) | Schema, relationships, migrations |
| [frontend/docs/AGENTS.md](frontend/docs/AGENTS.md) | AI agent orchestration & task routing |
| [frontend/docs/CONVENTIONS.md](frontend/docs/CONVENTIONS.md) | Code rules all agents must follow |
| [frontend/docs/BRAND.md](frontend/docs/BRAND.md) | UI design tokens & component rules   |
| [frontend/docs/DEPLOYMENT.md](frontend/docs/DEPLOYMENT.md) | How to ship to production        |

---
