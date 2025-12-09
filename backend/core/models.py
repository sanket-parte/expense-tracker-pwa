from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

# --- User ---
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Category ---
class CategoryBase(SQLModel):
    name: str = Field(index=True, unique=True)
    color: str = "#64748b" # Default slate-500

# --- Expense ---
class ExpenseBase(SQLModel):
    title: str
    amount: float
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    type: str = "expense"  # income or expense
    date: datetime = Field(default_factory=datetime.utcnow)

# --- Budget ---
class BudgetBase(SQLModel):
    category_id: int = Field(foreign_key="category.id")
    amount: float
    period: str = "monthly"

# --- Recurring Expense ---
class RecurringExpenseBase(SQLModel):
    title: str
    amount: float
    category_id: int = Field(foreign_key="category.id")
    frequency: str = "monthly" # monthly, weekly
    next_due_date: datetime
    is_active: bool = True

