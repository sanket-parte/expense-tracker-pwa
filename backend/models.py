from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    full_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryBase(SQLModel):
    name: str = Field(index=True, unique=True)
    color: str = "#64748b" # Default slate-500

class Category(CategoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", nullable=True)
    expenses: List["Expense"] = Relationship(back_populates="category")

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime

class ExpenseBase(SQLModel):
    title: str
    amount: float
    category_id: int = Field(foreign_key="category.id")
    type: str = "expense"  # income or expense
    date: datetime = Field(default_factory=datetime.utcnow)

class Expense(ExpenseBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: Optional[Category] = Relationship(back_populates="expenses")
    created_at: datetime = Field(default_factory=datetime.utcnow)

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

class BudgetBase(SQLModel):
    category_id: int = Field(foreign_key="category.id")
    amount: float
    period: str = "monthly"

class Budget(BudgetBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: Optional[Category] = Relationship()
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BudgetCreate(BudgetBase):
    pass

class BudgetRead(BudgetBase):
    id: int
    category: Optional[CategoryRead] = None
    created_at: datetime
    spent: Optional[float] = 0.0 # Computed field for response

class RecurringExpenseBase(SQLModel):
    title: str
    amount: float
    category_id: int = Field(foreign_key="category.id")
    frequency: str = "monthly" # monthly, weekly
    next_due_date: datetime
    is_active: bool = True

class RecurringExpense(RecurringExpenseBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: Optional[Category] = Relationship()
    last_generated: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RecurringExpenseCreate(RecurringExpenseBase):
    pass


class RecurringExpenseRead(RecurringExpenseBase):
    id: int
    category: Optional[CategoryRead] = None
    created_at: datetime
    last_generated: Optional[datetime] = None

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
