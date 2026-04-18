# 🏗️ RapidCare System Architecture

---

## 🔷 Overview

RapidCare follows a **client-server architecture**:

```
Frontend (Vercel) → Backend API (Railway) → Database (SQLite)
```

---

## 🧩 Components Breakdown

### 🖥️ Frontend (Client)

* Static HTML pages
* Hosted on Vercel
* Handles:

  * UI rendering
  * User input
  * API calls

---

### ⚙️ Backend (Server)

* FastAPI application
* Handles:

  * Business logic
  * API endpoints
  * Data processing

---

### 🗄️ Database

* SQLite (lightweight)
* Stores:

  * Hospital data
  * Patient data
  * ICU availability

---

## 🔄 Data Flow

```
User Action
   ↓
Frontend (fetch API)
   ↓
Backend (FastAPI)
   ↓
Database (SQLite)
   ↓
Response (JSON)
   ↓
Frontend UI update
```

---

## 📡 Example Flow

1. User clicks "Find Hospital"
2. Frontend calls:
   GET /hospitals
3. Backend fetches DB data
4. Sends JSON response
5. UI updates dynamically

---

## ⚙️ Deployment Architecture

```
[ User Browser ]
        ↓
[ Vercel Frontend ]
        ↓
[ Railway Backend API ]
        ↓
[ SQLite Database ]
```

---

## 🔐 Security Considerations

* CORS enabled
* Input validation (Pydantic)
* (Future) Authentication & roles

---

## 🚀 Scalability Plan

* Replace SQLite → PostgreSQL
* Add caching (Redis)
* Add load balancing
* WebSockets for real-time updates
