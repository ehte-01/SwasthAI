# SwasthAI — AI-Powered Rural Healthcare Platform

> Bridging the healthcare gap for 900 million rural Indians through multilingual AI, real-time diagnostics, and connected health infrastructure.

---

## Overview

SwasthAI is a full-stack healthcare platform designed for rural India, where access to quality medical care is limited by geography, language, and infrastructure. The platform enables users to get AI-powered medical guidance in their native language, manage family health records securely, discover nearby doctors and hospitals, and integrate with IoT wearables — all from a single application.

Built as a production-grade monorepo with a Next.js frontend, Node.js and Flask backends, deployed across AWS and OCI.

---

## Architecture
```
SwasthAI/
├── frontend/            # Next.js 14 (App Router) — TypeScript
├── backend-node/        # Node.js + Express REST API
├── backend/             # Python Flask ML API
├── ml-backend/          # Jupyter notebooks, model training
├── database/            # Schema, migrations, seed data
├── docs/                # Deployment guides and documentation
└── docker-compose.yml
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Node Backend | Node.js, Express, JWT Auth |
| ML Backend | Python, Flask, Tesseract OCR |
| Database | MongoDB Atlas, Supabase (PostgreSQL) |
| AI/ML | OpenAI GPT-4, Google Gemini |
| Deployment | AWS, Oracle Cloud (OCI) |
| Containers | Docker, Docker Compose |

---

## Getting Started
```bash
git clone https://github.com/ehte-01/SwasthAI.git
cd SwasthAI
```

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```

**Flask ML Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && python app.py
```

**Run everything with Docker:**
```bash
docker compose up --build
```

---

## Author

**Mohammad Ehtesham**
B.Tech CSAIML · GL Bajaj Institute of Technology · AKTU · Greater Noida

- GitHub: [@ehte-01](https://github.com/ehte-01)
- LinkedIn: [mohammad-ehtesham-7475a532a](https://www.linkedin.com/in/mohammad-ehtesham-7475a532a)
- Email: infoehtesham7886@gmail.com

---

> *Because everyone deserves good health — anytime, anywhere.*
