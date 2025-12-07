# Deployment Guide

This guide explains how to deploy the Expense Tracker application for free using modern cloud providers.

## Architecture
- **Frontend**: React (Vite) -> Deployed on **Vercel** or **Netlify**.
- **Backend**: FastAPI -> Deployed on **Render** or **Railway**.
- **Database**: PostgreSQL -> Hosted on **Neon.tech**, **Supabase**, or **Railway**.

> **Note on SQLite**: The local app uses `expenses.db` (SQLite). For deployment, we use PostgreSQL because free backend hosting (like Render) has ephemeral file systems, meaning your SQLite file would be deleted every time the server restarts.

---

## 1. Database Setup (Neon/Postgres)
1. Go to [Neon.tech](https://neon.tech) (or Supabase) and sign up.
2. Create a new project.
3. Copy the **Connection String** (it starts with `postgres://` or `postgresql://`).
4. Keep this safe. You will need it for the Backend configuration.

## 2. Backend Deployment (Render)
1. Push your code to GitHub.
2. Sign up at [Render.com](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Settings:
    - **Root Directory**: `backend`
    - **Runtime**: Python 3
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. **Environment Variables**:
    - Add a variable named `DATABASE_URL`.
    - Value: Paste your Connection String from Step 1.
    - *Note*: If the string starts with `postgres://`, the backend code automatically handles converting it to `postgresql://` for compatibility.
7. Click **Create Web Service**.
8. Wait for deployment. Copy your backend URL (e.g., `https://expense-tracker-backend.onrender.com`).

## 3. Frontend Deployment (Vercel)
1. Sign up at [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Settings:
    - **Framework Preset**: Vite
    - **Root Directory**: `frontend` (Click Edit)
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
5. **Environment Variables**:
    - Add a variable named `VITE_API_URL`.
    - Value: Your Backend URL from Step 2 (e.g., `https://expense-tracker-backend.onrender.com`) **without the trailing slash**.
6. Click **Deploy**.

## 4. Final Configuration
1. Once Frontend is deployed, you will get a Frontend URL (e.g., `https://expense-tracker-pwa.vercel.app`).
2. (Optional) Go back to **Render** -> **Settings** (Backend).
3. Update `CORS_ORIGINS` in your code `backend/main.py` if you want to restrict access to only your Vercel domain (currently it allows `*`).

## 5. Migration (First Run)
When the backend starts on Render with the new `DATABASE_URL`, it will automatically create the empty tables (User, Expense, Category).
- The first time you visit the deployed site, you will need to **Register** a new account.
- You can use the **Settings -> Import CSV** feature to upload your sample data.
