# Social Web App - Full Stack

This is a full-stack social web application built with a modern technology stack.

- The **backend** is a robust API built with Python, FastAPI, and MongoDB, providing all the core functionalities for a social media platform.
- The **frontend** is a responsive and interactive web client built with Next.js, React, and Tailwind CSS.

## Features

- **User Authentication**: Secure signup and login using JWT (Access & Refresh Tokens stored in HTTPOnly cookies). Includes token verification and rotation.
- **Password Management**: Passwords are securely hashed before being stored.
- **User Profile Management**: Users can view and update their own profiles, and view public profiles of other users.
- **Post Management**: Full CRUD (Create, Read, Update, Delete) functionality for user posts.
- **Comment Management**: Full CRUD for comments on posts, including replies (nested comments).
- **Social Graph**: Users can follow and unfollow each other.
- **Engagement**: Users can like and unlike posts and comments.
- **Personalized Feed**: Get a feed of posts from followed users.
- **User Search**: Search for other users by their username.
- **Pagination**: Implemented for feed and list endpoints (followers, following, posts, comments) to handle large datasets efficiently.
- **Data Validation**: Pydantic models are used for robust request data validation.
- **Interactive API Docs**: Automatic, interactive API documentation powered by Swagger UI and ReDoc.

## Technology Stack

### Backend (Server)

- **Framework**: FastAPI
- **Database**: MongoDB
- **ODM (Object-Document Mapper)**: Beanie
- **Authentication**: JWT with `python-jose`
- **Password Hashing**: `passlib` with `bcrypt`
- **Async Server**: Uvicorn

### Frontend (Client)

- **Framework**: Next.js
- **Library**: React
- **Styling**: Tailwind CSS
- **Language**: TypeScript

---

## Project Setup

### Backend (Server) Setup

Follow these steps to get the backend server running on your local machine.

#### 1. Prerequisites

- Python 3.8+
- A running MongoDB instance (local or on a service like MongoDB Atlas).

#### 2. Navigate to Server Directory

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

### Frontend (Client) Setup

Follow these steps to get the frontend client running.

#### 1. Prerequisites

- Node.js (v18 or newer)
- npm or yarn

#### 2. Navigate to Client Directory

```bash
# From the root of the project (e.g., SocailWebApp/)
cd client
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Configure Environment Variables

Create a `.env.local` file in the `client/` directory. This file tells the Next.js app where to find the backend API. For the variable to be exposed to the browser, it must be prefixed with `NEXT_PUBLIC_`.

**`.env.local`:**
```
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

#### 5. Run the Application

```bash
npm run dev
```

The client application will be available at `http://localhost:3000`.

---

## Running with Docker (Backend Only)

If you have Docker installed, you can build and run the backend server in a container using the provided PowerShell script (`docker.ps1`).

1.  **Navigate to the project root.**
2.  **Ensure you have a `.env` file inside the `server/` directory as described in the backend setup.**
3.  **Use the script with one of the following commands:**

    ```powershell
    # Build and run the container in detached mode
    .\docker.ps1 -Command run

    # View the container logs
    .\docker.ps1 -Command logs

    # Stop and remove the container
    .\docker.ps1 -Command stop
    ```

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
| `POST` | `/auth/create_access_token`  | Create a new access token using a refresh token. |
| `POST` | `/auth/rotate_refresh_token` | Rotate the refresh token.                 |
| `GET`  | `/auth/verify_access_token`  | Verify the current access token.          |
| `GET`  | `/auth/verify_refresh_token` | Verify the current refresh token.         |
| **Accounts** |                           |                                           |
| `GET`  | `/accounts/me/profile`       | Get the current user's profile.           |
| `PATCH`| `/accounts/me/profile`       | Update the current user's profile.        |
| `GET`  | `/accounts/{id}/profile`     | Get a user's public profile by ID.        |
| `GET`  | `/accounts/search`           | Search for accounts by username.          |
| `POST` | `/accounts/follow/{id}`      | Follow another user.                      |
| `POST` | `/accounts/unfollow/{id}`    | Unfollow another user.                    |
| `GET`  | `/accounts/followers`        | Get a list of your followers.             |
| `GET`  | `/accounts/following`        | Get a list of users you are following.    |
| `GET`  | `/accounts/feed/following`   | Get a personalized feed from followed users. |
| **Posts** |                              |                                           |
| `POST` | `/posts/`                    | Create a new post.                        |
| `GET`  | `/posts/`                    | Get a paginated list of all posts.        |
| `GET`  | `/posts/{id}`                | Get a single post by its ID.              |
| `PATCH`| `/posts/{id}`                | Update a post you authored.               |
| `DELETE`| `/posts/{id}`               | Delete a post you authored.               |
| `POST` | `/posts/{id}/like`           | Toggle like/unlike on a post.             |
| `POST` | `/posts/{id}/comment`        | Create a new comment on a post.           |
| `GET`  | `/posts/{id}/comment`        | Get all comments for a post.              |
| **Comments** |                           |                                           |
| `GET`  | `/comments/{id}`             | Get a single comment by its ID.           |
| `PATCH`| `/comments/{id}`             | Update a comment you authored.            |
| `DELETE`| `/comments/{id}`            | Delete a comment you authored.            |
| `POST` | `/comments/{id}/like`        | Toggle like/unlike on a comment.          |
| `POST` | `/comments/{id}/comment`     | Reply to another comment.                 |
| `GET`  | `/comments/{id}/replies`     | Get replies for a specific comment.       |