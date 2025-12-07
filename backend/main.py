from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routes import expenses, analytics, data, categories, auth, budgets, recurring
from init_db import init_categories

@asynccontextmanager
async def lifespan(app: FastAPI):
    # create_db_and_tables() # Managed by Alembic now
    init_categories()
    yield

app = FastAPI(lifespan=lifespan)

# CORS setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://expense-tracker-pwa-phi.vercel.app", # Example Vercel URL
    "*", # Allow all for now to ease deployment debugging, restrictive list recommended for prod
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

@app.get("/")
def read_root():
    return {"message": "Expense Tracker API is running"}
