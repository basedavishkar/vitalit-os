# 🏥 VITALIt

![Demo](demo.gif)

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) ![Stars](https://img.shields.io/github/stars/basedavishkar/vitalit-os?style=social) ![Issues](https://img.shields.io/github/issues/basedavishkar/vitalit-os) ![PRs](https://img.shields.io/github/issues-pr/basedavishkar/vitalit-os)

Open source hospital management system.
Built to replace 💰 expensive, outdated enterprise software.
Free forever, fully self-hostable, no vendor lock-in.

---

## ✨ Why VITALIt

Hospitals and clinics often pay 5 figures a year for slow, clunky software.
VITALIt is built to give them a modern, reliable alternative without the cost.
It has all the core modules you need to run a hospital.

---

## 🛠 Features

* 🧑‍⚕️ Full patient, doctor, appointment, billing, inventory, and admin modules
* 🔐 Role-based access control and secure authentication
* 📊 Real-time dashboards and activity tracking
* 📱 Works on desktop, tablet, and mobile
* 💾 100% self-hostable, you own your data

---

## 💻 Tech Stack

**Frontend**: Next.js 14, Tailwind CSS, TypeScript
**Backend**: FastAPI, PostgreSQL, SQLAlchemy
**Auth**: JWT, RBAC
**Other**: Framer Motion, Pydantic, bcrypt

---

## 🚀 Quick Start

**Requirements**: Node.js 18+, Python 3.10+, Git

```bash
# Clone the repo
git clone https://github.com/basedavishkar/vitalit-os.git
cd vitalit-os

# Backend setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

```

**Run the app**

```bash
# Backend
cd backend
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
```

Access:
Frontend → [http://localhost:3000](http://localhost:3000)
Backend API → [http://localhost:8000](http://localhost:8000)
API Docs → [http://localhost:8000/docs](http://localhost:8000/docs)

Demo login:

* Username: `admin`
* Password: `admin123`

---

## 📜 License

MIT License — free to use, modify, and share.

---

## ❤️ Support

If you believe in open healthcare software, share it with others.
Every clinic that uses VITALIt instead of a closed, overpriced system is a win.
