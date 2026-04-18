# 🚑 RapidCare — Emergency ICU Bed Allocation System

RapidCare is a full-stack web application designed to optimize emergency healthcare response by connecting patients with hospitals in real-time and managing ICU bed availability efficiently.

---

## 🌐 Live Demo

* **Frontend (Vercel):** https://your-vercel-link.vercel.app
* **Backend (Railway API):** https://rapidcare-production.up.railway.app

---

## 🚀 Features

### 👤 User Side

* Find nearest hospitals based on input
* View ICU bed availability
* Submit patient details
* Generate consent PDF
* Smart hospital matching

### 🏥 Admin Side

* View all hospitals
* Monitor patients
* Update ICU bed count
* Real-time-like dashboard

---

## 🧱 Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | HTML, CSS, JavaScript                |
| Backend    | FastAPI (Python)                     |
| Database   | SQLite                               |
| Deployment | Vercel (Frontend), Railway (Backend) |

---

## 📁 Project Structure

```bash
RapidCare/
│
├── backend/                # Python backend (FastAPI)
│   ├── main.py             # API entry point
│   ├── database.py         # DB connection
│   ├── models.py           # DB models
│   └── schemas.py          # Request/response schemas
│
├── frontend/               # Static frontend (served by Vercel)
│   ├── index.html          # Main user dashboard
│   ├── 2.html              # Admin dashboard
│   └── 3.html              # Login page
│
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/RapidCare.git
cd RapidCare
```

### 2️⃣ Run Backend

```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload
```

### 3️⃣ Run Frontend

```bash
cd frontend
open index.html
```

---

## 🔗 API Endpoints

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| GET    | /hospitals       | Fetch hospital list |
| POST   | /add-patient     | Add patient         |
| PUT    | /update-bed/{id} | Update bed count    |
| GET    | /patients        | View patients       |

---

## ⚠️ Notes

* SQLite resets on redeploy (Railway free tier)
* Backend may take time to wake up (cold start)

---

## 🚀 Future Improvements

* Authentication system (JWT)
* Real-time updates (WebSockets)
* AI-based hospital recommendation
* Map integration (Google Maps)

