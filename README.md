# Social Web App

A full-stack social web application backend built with **FastAPI**, **MongoDB**, and ready for full-stack development with Next.js frontend.

---

## 🚀 Tech Stack

- **Backend:** FastAPI (Python)
- **Database:** MongoDB (Atlas)
- **Frontend (Planned):** Next.js (TypeScript)
- **ORM/ODM:** Motor (async MongoDB client)
- **Authentication:** JWT (access & refresh tokens), OAuth2PasswordFlow, Secure HTTP-only Cookies
- **Password Hashing:** Passlib (pbkdf2_sha256)
- **Environment Management:** Pydantic Settings & dotenv

---

## 📂 Project Structure (Backend)

```
backend/
└── app/
    ├── main.py           # FastAPI app entry point
    ├── core/
    │   ├── config.py     # Environment config
    │   ├── database.py   # MongoDB connection
    │   ├── oauth2.py     # JWT token utilities
    │   └── utils.py      # Password hashing utilities
    ├── models/
    │   └── account.py    # Account model schema
    ├── schemas/
    │   └── token.py      # Token schema (Pydantic)
    └── routers/
        └── auth.py       # Authentication routes (signup, login, logout, token rotation)
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

### 4️⃣ Create a `.env` file

Create a `.env` file in the `backend/app/` directory and add:

```
mongodb_username=your_mongodb_username
mongodb_password=your_mongodb_password
secret_key=your_secret_key_for_access_token
secret_key_refresh=your_secret_key_for_refresh_token
algorithm=HS256
cookie_domain=localhost
```

> ⚠️ Make sure to configure your MongoDB Atlas cluster credentials.

### 5️⃣ Run MongoDB locally or Atlas

Your MongoDB URI will be constructed automatically from credentials.

### 6️⃣ Start FastAPI server

```bash
uvicorn app.main:app --reload
```

Visit `http://127.0.0.1:8000` for the API root.  
Swagger UI available at: `http://127.0.0.1:8000/docs`

---

## ✅ Implemented Features

- User Signup (hashed password stored)
- User Login (JWT based)
- OAuth2 flow using FastAPI’s secure system
- Refresh token (long-lived, stored as HTTP-only cookie)
- Access token (short-lived, stored as HTTP-only cookie)
- Token refresh and rotation
- Logout system
- Secure cookie handling (CORS-ready, production & dev modes)
- Request logging middleware

---

## 🔜 Next Steps

- User profiles (view, edit)
- Follow/Unfollow functionality
- Post creation (text/image upload)
- Timeline/feed system
- Notification system
- Full frontend integration with Next.js
- Deployment (Docker + cloud)

---

## 👨‍💻 Author

**Ercan Dinçkaya**

---

Feel free to contribute, open issues, or suggest features!
