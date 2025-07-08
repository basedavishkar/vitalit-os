# 🏥 VITALIt-OS — System Architecture (2025 MVP)

This document outlines the final modular full-stack architecture for **VITALIt-OS**, a clinic-focused Hospital Management System. Designed for scale, modularity, and clarity.

---

## 📐 Architecture Overview

```mermaid
flowchart LR

  %% ---------- Frontend ----------
  subgraph FE [Frontend – Next.js + Tailwind]
    FE_Home["Public Pages (Home, About, Contact)"]
    FE_Login["Role-based Logins"]
    FE_Dash["Dashboard (Doctor, Nurse, Receptionist, Admin)"]
    FE_PAT["Patients UI"]
    FE_DOC["Doctors UI"]
    FE_APP["Appointments UI"]
    FE_BILL["Billing UI"]
    FE_INV["Inventory UI"]
    FE_REP["Reports UI"]
  end

  %% ---------- Backend API ----------
  subgraph API [Backend – FastAPI]
    API_AUTH["/auth"]
    API_PAT["/patients"]
    API_DOC["/doctors"]
    API_APP["/appointments"]
    API_BILL["/billing"]
    API_INV["/inventory"]
    API_REP["/reports"]
    API_ADMIN["/admin"]
  end

  %% ---------- Database ----------
  subgraph DB [SQLite – hospital.db]
    DB_PAT
    DB_DOC
    DB_APP
    DB_BILL
    DB_INV
    DB_USERS
  end

  %% ---------- Connections ----------
  FE_PAT --> API_PAT --> DB_PAT
  FE_DOC --> API_DOC --> DB_DOC
  FE_APP --> API_APP --> DB_APP
  FE_BILL --> API_BILL --> DB_BILL
  FE_INV --> API_INV --> DB_INV
  FE_REP --> API_REP --> DB_APP & DB_BILL
  FE_Login --> API_AUTH --> DB_USERS
  FE_Dash --> API_ADMIN --> DB_USERS
```

---

## 📂 Modules Breakdown

Each module contains:
- **FastAPI router** in `backend/routers/`
- **Pydantic schema** in `backend/schemas.py`
- **Typed frontend form + list** in `frontend/src/components/`

| Module         | Frontend Components                     | Backend Routes                          | DB Table(s)     |
|----------------|------------------------------------------|------------------------------------------|-----------------|
| **Patients**   | `PatientsForm.tsx`, `PatientsList.tsx`   | `routers/patients.py` → `/patients`     | `patients`      |
| **Doctors**    | `DoctorsForm.tsx`, `DoctorsList.tsx`     | `routers/doctors.py` → `/doctors`       | `doctors`       |
| **Appointments** | `AppointmentsForm.tsx`, `AppointmentsCalendar.tsx` | `routers/appointments.py` → `/appointments` | `appointments` |
| **Billing**    | `BillingForm.tsx`, `Invoice.tsx`         | `routers/billing.py` → `/billing`       | `bills`         |
| **Inventory**  | `InventoryForm.tsx`, `InventoryList.tsx` | `routers/inventory.py` → `/inventory`   | `inventory`     |
| **Auth**       | `LoginForm.tsx` per role                 | `routers/auth.py` → `/auth`             | `users`         |
| **Admin**      | `AdminDashboard.tsx`                     | `routers/admin.py` → `/admin`           | `users`         |
| **Reports**    | `ReportsList.tsx`                        | `routers/reports.py` → `/reports`       | aggregate views |

---

## 🧑‍⚕️ User Roles & Permissions

| Role         | Permissions |
|--------------|-------------|
| Admin        | All access: user management, reports, billing, settings |
| Doctor       | View appointments, write prescriptions, records |
| Nurse        | Update vitals, assist doctor, task checklist |
| Receptionist | Register patients, schedule, billing |
| Patient (Optional) | View personal records and bills (MVP skips portal) |

---

## 🔑 Auth Flow

- Separate login routes for each role
- Sessions handled via cookies or token (to be finalized)
- Role-based layout rendering

---

## 🧾 Reports Included

- Appointments per day/week/month
- Revenue reports
- Most common illnesses
- Doctor-wise visits

---

## 🚀 MVP Scope (Tonight)

✅ Patients  
✅ Appointments  
✅ Billing  
✅ Auth  
✅ Dashboards (Role-based)  
✅ Public Pages (Home, About, Contact, Login)  

---

## 📁 Folder Structure

```
vitalit-os/
├── backend/
│   ├── main.py
│   ├── routers/
│   │   ├── patients.py
│   │   ├── doctors.py
│   │   ├── appointments.py
│   │   ├── billing.py
│   │   ├── inventory.py
│   │   ├── auth.py
│   │   └── reports.py
│   ├── schemas.py
│   └── database.py
├── frontend/
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── dashboard/
│   ├── components/
│   │   ├── PatientsForm.tsx
│   │   ├── PatientsList.tsx
│   │   ├── DoctorsForm.tsx
│   │   ├── AppointmentsForm.tsx
│   │   ├── BillingForm.tsx
│   │   └── Invoice.tsx
│   └── utils/
├── hospital.db
└── README.md
```

---

## 💬 Final Notes

- Fully modular and swappable backend
- MVP will be SQLite, can migrate to Postgres later
- API-first — ready for mobile clients if needed
- Role-based isolation for security

**Built with clarity. Built for real clinics.**