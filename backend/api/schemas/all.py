from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel
from backend.core.models import CategoryBase, ExpenseBase, BudgetBase, RecurringExpenseBase, UserBase

# --- Category Schemas ---
class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime

# --- Expense Schemas ---
class ExpenseCreate(ExpenseBase):
    pass

class ExpenseRead(ExpenseBase):
    id: int
    created_at: datetime
    category: Optional[CategoryRead] = None

class ExpenseUpdate(SQLModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category_id: Optional[int] = None
    type: Optional[str] = None
    date: Optional[datetime] = None

# --- Budget Schemas ---
class BudgetCreate(BudgetBase):
    pass

class BudgetRead(BudgetBase):
    id: int
    category: Optional[CategoryRead] = None
    created_at: datetime
    spent: Optional[float] = 0.0

# --- Recurring Expense Schemas ---
class RecurringExpenseCreate(RecurringExpenseBase):
    pass

class RecurringExpenseRead(RecurringExpenseBase):
    id: int
    category: Optional[CategoryRead] = None
    created_at: datetime
    last_generated: Optional[datetime] = None

# --- User Schemas ---
# Note: UserBase doesn't include password. 
class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class Token(SQLModel):
    access_token: str
    token_type: str
