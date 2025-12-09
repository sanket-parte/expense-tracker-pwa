from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import new routers
from backend.api.routers import expenses, auth, analytics, data, categories, budgets, recurring, ai, challenges, reports
from backend.init_db import init_categories
from backend.core.config import settings
from backend.adapters.database.session import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables() 
    init_categories()
    yield

app = FastAPI(lifespan=lifespan)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(analytics.router)
app.include_router(data.router)
app.include_router(categories.router)
app.include_router(budgets.router)
app.include_router(recurring.router)
app.include_router(ai.router)
app.include_router(challenges.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "Expense Tracker API is running (Clean Architecture)"}
