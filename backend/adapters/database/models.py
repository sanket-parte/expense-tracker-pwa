from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import UniqueConstraint

from backend.core.models import UserBase, CategoryBase, ExpenseBase, BudgetBase, RecurringExpenseBase

# Forward references
class Expense(ExpenseBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: Optional["Category"] = Relationship(back_populates="expenses")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Category(CategoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", nullable=True)
    expenses: List["Expense"] = Relationship(back_populates="category")

    __table_args__ = (UniqueConstraint("user_id", "name", name="unique_user_category_name"),)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    
    # Relationships could be added here if needed, but keeping it simple for now
    # expenses: List[Expense] = Relationship(...) 

class Budget(BudgetBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: Optional[Category] = Relationship()
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RecurringExpense(RecurringExpenseBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: Optional[Category] = Relationship()
    last_generated: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    openai_api_key: Optional[str] = None
    ai_provider: str = Field(default="openai")

class AISuggestion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Challenge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    description: str
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    target_amount: float
    current_amount: float = 0.0
    start_date: datetime
    end_date: datetime
    status: str = "pending" # pending, active, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MonthlyReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    month: str # YYYY-MM
    total_spent: float
    total_income: float
    savings_rate: float
    analysis: str # JSON string storing complex AI insights
    created_at: datetime = Field(default_factory=datetime.utcnow)
