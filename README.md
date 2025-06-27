# Social Web App - Backend API

This is the backend server for a modern social web application. It's built with Python using the FastAPI framework and MongoDB as the database. The API provides functionalities for user authentication, post management, and social interactions like following users and liking posts.

## Features

- **User Authentication**: Secure signup and login using JWT (Access & Refresh Tokens stored in HTTPOnly cookies).
- **Password Management**: Passwords are securely hashed before being stored.
- **Post Management**: Full CRUD (Create, Read, Update, Delete) functionality for user posts.
- **Comment Management**: Full CRUD for comments on posts, including replies (nested comments).
- **Social Graph**: Users can follow and unfollow each other.
- **Engagement**: Users can like and unlike posts and comments.
- **Pagination**: Implemented for feed and list endpoints (followers, following) to handle large datasets efficiently.
- **Data Validation**: Pydantic models are used for robust request data validation.
- **Interactive API Docs**: Automatic, interactive API documentation powered by Swagger UI and ReDoc.

## Technology Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ODM (Object-Document Mapper)**: [Beanie](https://beanie-odm.dev/)
- **Authentication**: JWT with `python-jose`
- **Password Hashing**: `passlib` with `bcrypt`
- **Async Server**: Uvicorn

---

## Project Setup

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

- Python 3.8+
- A running MongoDB instance (local or on a service like MongoDB Atlas).

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd SocailWebApp/server
```

### 3. Set Up a Virtual Environment

It's highly recommended to use a virtual environment to manage project dependencies.

```bash
# For Windows
python -m venv venv
.\venv\Scripts\activate

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies

Create a `requirements.txt` file with the necessary packages and install them.

**`requirements.txt`:**
```
fastapi
uvicorn[standard]
beanie
pydantic
python-jose[cryptography]
passlib[bcrypt]
python-multipart
pydantic-settings
```

**Install command:**
```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file in the `server/` directory. This file will hold your secret keys and database configuration. You can copy the example below.

**`.env.example`:**
```ini
# --- Database Configuration ---
# Replace with your MongoDB connection string
DATABASE_URL=mongodb://localhost:27017/social_app

# --- JWT Authentication ---
SECRET_KEY=a_very_secret_key_that_should_be_long_and_random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# --- Cookie Settings ---
# For local development, 'localhost' is fine. For production, use your domain.
COOKIE_DOMAIN=localhost
COOKIE_SECURE=False
COOKIE_SAMESITE=lax
```

### 6. Run the Application

Once the setup is complete, you can start the development server.

```bash
# The --reload flag automatically restarts the server on code changes
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

---

## API Documentation

FastAPI automatically generates interactive API documentation. Once the server is running, you can access it at:

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## API Endpoints Summary

| Method | Path                         | Description                               |
|--------|------------------------------|-------------------------------------------|
| **Auth** |                              |                                           |
| `POST` | `/auth/signup`               | Create a new user account.                |
| `POST` | `/auth/login`                | Log in to get access/refresh tokens.      |
| `POST` | `/auth/logout`               | Log out and clear session cookies.        |
| `POST` | `/auth/create_access_token`  | Create a new access token.                |
| **Posts** |                              |                                           |
| `POST` | `/posts/`                    | Create a new post.                        |
| `GET`  | `/posts/`                    | Get a paginated list of all posts.        |
| `GET`  | `/posts/{id}`                | Get a single post by its ID.              |
| `PATCH`| `/posts/{id}`                | Update a post you authored.               |
| `DELETE`| `/posts/{id}`               | Delete a post you authored.               |
| `POST` | `/posts/{id}/like`           | Toggle like/unlike on a post.             |
| `POST` | `/posts/{id}/comment`        | Create a new comment on a post.           |
| **Comments** |                           |                                           |
| `GET`  | `/comments/{id}`             | Get a single comment by its ID.           |
| `PATCH`| `/comments/{id}`             | Update a comment you authored.            |
| `DELETE`| `/comments/{id}`            | Delete a comment you authored.            |
| `POST` | `/comments/{id}/like`        | Toggle like/unlike on a comment.          |
| `POST` | `/comments/{id}/comment`     | Reply to another comment.                 |
| **Accounts** |                           |                                           |
| `POST` | `/accounts/follow/{id}`      | Follow another user.                      |
| `POST` | `/accounts/unfollow/{id}`    | Unfollow another user.                    |
| `GET`  | `/accounts/followers`        | Get a list of your followers.             |
| `GET`  | `/accounts/following`        | Get a list of users you are following.    |