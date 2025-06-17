# Social Web App

A full-stack social web application built with **FastAPI**, **Next.js**, and **MongoDB**.

---

## 🚀 Tech Stack

- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Frontend:** Next.js (TypeScript)
- **ORM/ODM:** Motor (async MongoDB client), (optional: Beanie)
- **Deployment:** Docker (future)

---

## 📂 Project Structure (Backend)

```
backend/
│
├── app/
│   ├── main.py             # FastAPI app entry point
│   ├── models/             # MongoDB collections
│   ├── routes/             # API routes
│   ├── db/                 # Database connection
│   └── schemas/            # Pydantic schemas for validation
└── requirements.txt        # Python dependencies
```

---

## 🛠 Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/social-web-app.git
cd social-web-app/backend
```

### 2️⃣ Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # (Linux/Mac)
venv\Scripts\activate     # (Windows)
```

### 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Run MongoDB locally

Make sure MongoDB is running on `mongodb://localhost:27017` (default).

### 5️⃣ Start FastAPI server

```bash
uvicorn app.main:app --reload
```

Visit `http://127.0.0.1:8000` to check your API.

---

## ✅ Current Features

- [x] Basic FastAPI backend setup
- [x] MongoDB connection
- [x] Basic user registration

---

## 🔜 Upcoming Features

- [ ] User authentication (JWT)
- [ ] Post creation (text/image)
- [ ] Follow/unfollow system
- [ ] Frontend with Next.js
- [ ] Dockerization
- [ ] Deployment (Render, Vercel, Railway...)

---

## 👨‍💻 Author

**Ercan Dinçkaya**

---

Feel free to contribute, open issues, or suggest features!
