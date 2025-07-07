
# VITALIt‑OS 🏥

**Free, offline‑first hospital system for under‑connected clinics.**

FastAPI · SQLite · Next.js · Tailwind

---

## Vision

Give rural clinics a zero‑cost electronic medical record that runs on a laptop or Raspberry Pi with no vendor lock‑in, no monthly fees, and zero internet dependency.

---

## Quick Start

```bash
# Backend
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload

# Frontend
cd ../frontend
npm install
npm run dev
```

Visit `http://localhost:3000` and start using the dashboard.

---

## Architecture

High‑level overview in [`docs/architecture.md`](docs/architecture.md).  
Stateless FastAPI layer → local SQLite database → optional switch to PostgreSQL when connectivity improves.

---

## Self‑hosting

Runs on bare metal, Docker, or a small cloud VM.  
No external services required.

---

## License & Forking

MIT. Fork, modify, and deploy however you like. Attribution appreciated.

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup and coding standards.  
Pull requests welcome — aiming for 1 000+ stars and real‑world deployments.

---
