# Contributing to VITALIt-OS

VITALIt-OS is a fast, open-source hospital management system built with FastAPI + Next.js + Tailwind CSS.

---

## 🚀 Quick Setup

Clone the repo:

```bash
git clone https://github.com/YOUR_USERNAME/vitalit-os.git
cd vitalit-os
```

### ⬅️ Backend (FastAPI)

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### ➡️ Frontend (Next.js + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Structure

```
backend/     ← FastAPI code (routers, models, schemas)
frontend/    ← Next.js + Tailwind UI
requirements.txt
```

---

## ✅ Working Modules

- Patients
- Doctors
- Appointments

---

## 📦 In Progress

- Billing
- Inventory
- Medical Records

---

## 🔧 Conventions

- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  - `feat:` new features
  - `fix:` bug fixes
  - `chore:` tooling/setup
- No emojis in commits

---

## 🧠 Notes

- Keep code modular: separate API, components, and logic
- Keep UI clean and minimal — no overengineering

---

## 🤝 How to Contribute

1. Fork this repo
2. Create a new branch: `git checkout -b feat/module-name`
3. Commit with context
4. Open a PR with a short description

---

Star the repo, open an issue, or DM if you're interested in helping local hospitals.