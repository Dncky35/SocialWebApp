# Social Web App

A modern social media backend API built using FastAPI, MongoDB, and Beanie. This project is designed to showcase account management, secure authentication with JWT and cookies, post creation, and like/unlike features in a scalable, clean codebase suitable for production and learning.

## 🛠 Tech Stack

- **Backend**: FastAPI
- **Database**: MongoDB with Beanie ODM
- **Authentication**: JWT (Access & Refresh tokens), HTTPOnly cookies
- **ORM/ODM**: Beanie
- **Testing**: Pytest, HTTPX, ASGITransport

## 📂 Project Structure

```
app/
├── core/             # Configuration, DB, utils, auth (JWT)
├── models/           # Pydantic and Beanie models (Account, Post)
├── routers/          # FastAPI route handlers (auth, posts)
├── schemas/          # Shared schemas (e.g., token)
├── main.py           # App entrypoint
tests/
├── unit/             # Unit tests
├── integration/      # Integration tests (auth, posts)
├── conftest.py       # Fixtures & setup
.env                  # Environment variables
```

## ✅ Features

### ✅ Authentication

- Signup with validation
- Secure login using OAuth2PasswordRequestForm
- Access/Refresh token management (with cookie storage)
- Logout, token verification, and rotation

### ✅ Posts

- Create a post (text, optional image)
- Retrieve all posts with pagination (`?offset=0&limit=20`)
- Retrieve single post by ID
- Update and delete post (only by author)
- Like/Unlike post

## 🚀 Getting Started

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/SocialWebApp.git
cd SocialWebApp/server
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env.dev` file (or `.env.test`, `.env.prod`) with:

```
MONGODB_USERNAME=youruser
MONGODB_PASSWORD=yourpass
SECRET_KEY=youraccesstokensecret
SECRET_KEY_REFRESH=yourrefreshtokensecret
ALGORITHM=HS256
COOKIE_DOMAIN=localhost
DB_NAME=social_webapp
```

### 3. Run the Server

```bash
uvicorn app.main:app --reload
```

## 🧪 Testing

```bash
# Unit tests
pytest tests/unit --disable-warnings

# Integration tests
ENV_FILE=.env.test pytest tests/integration --import-mode=importlib --disable-warnings
```

> ✅ Authentication tests implemented.  
> ⚠️ Post and like system tests are **pending**.

## 🌐 API Endpoints

Some key routes include:

- `/auth/signup` – Register user
- `/auth/login` – Login and receive cookies
- `/auth/logout` – Clear tokens
- `/auth/create_access_token` – Rotate access token
- `/posts/` – Create new post
- `/posts/{id}` – Get single post
- `/posts/{id}/like` – Like a post
- `/posts/{id}/unlike` – Unlike a post

## 📌 Future Plans

- Implement post & like integration tests
- Add user follow/unfollow system
- Add comments
- Frontend with Next.js

---

Built with ❤️ by Ercan Dinçkaya | [CloudROcean](https://play.google.com/store/search?q=cloudRocean&c=apps)
