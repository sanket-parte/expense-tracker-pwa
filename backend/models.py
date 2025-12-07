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
