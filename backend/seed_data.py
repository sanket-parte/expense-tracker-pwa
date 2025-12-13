import random
from datetime import datetime, timedelta
from sqlmodel import Session, select
from backend.adapters.database.session import engine
from backend.adapters.database.models import User, Category, Expense
from backend.core.security import get_password_hash

def seed_data():
    with Session(engine) as session:
        # 1. Create Test User
        user_email = "test@example.com"
        print(f"Checking for user {user_email}...")
        user = session.exec(select(User).where(User.email == user_email)).first()
        if not user:
            print(f"Creating user {user_email}...")
            user = User(
                email=user_email,
                full_name="Test User",
                password_hash=get_password_hash("password123")
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"User created with ID: {user.id}")
        else:
            print(f"User {user_email} already exists (ID: {user.id}).")

        # 2. Assign categories
        print("Checking for categories...")
        # Expanded category list
        category_config = [
            ("Salary", "#10b981", "income"),
            ("Housing", "#3b82f6", "expense"), # Rent
            ("Groceries", "#ef4444", "expense"),
            ("Dining Out", "#f59e0b", "expense"),
            ("Utilities", "#eab308", "expense"),
            ("Transportation", "#64748b", "expense"),
            ("Entertainment", "#8b5cf6", "expense"),
            ("Shopping", "#ec4899", "expense"),
            ("Health", "#22c55e", "expense")
        ]
        
        user_categories = {} # Map name to object
        
        for name, color, _ in category_config:
            existing_cat = session.exec(select(Category).where(Category.name == name)).first()
            if existing_cat:
                user_categories[name] = existing_cat
            else:
                print(f"Creating category '{name}'...")
                new_cat = Category(name=name, color=color, user_id=user.id)
                session.add(new_cat)
                user_categories[name] = new_cat
        
        session.commit()
        for cat in user_categories.values():
            session.refresh(cat)
        
        # 3. Create Dummy Expenses
        print("Checking for existing expenses...")
        # Clear existing expenses
        existing_expenses = session.exec(select(Expense).where(Expense.user_id == user.id)).all()
        if existing_expenses:
            print(f"Deleting {len(existing_expenses)} existing expenses...")
            for exp in existing_expenses:
                session.delete(exp)
            session.commit()
        
        print("Creating 1 year of REALISTIC dummy expenses...")
        expenses = []
        
        start_date = datetime.now() - timedelta(days=365)
        end_date = datetime.now()

        # Helper to add expense
        def add_exp(date, title, amount, cat_name, type="expense"):
            if cat_name not in user_categories: return
            expenses.append(Expense(
                title=title,
                amount=amount,
                category_id=user_categories[cat_name].id,
                type=type,
                date=date,
                user_id=user.id
            ))

        # --- Generation Logic ---
        
        current_date = start_date
        while current_date <= end_date:
            day = current_date.day
            weekday = current_date.weekday() # 0=Mon, 6=Sun
            
            # 1. MONTHLY RECURRING (Salary, Rent, Utilities)
            if day == 1:
                add_exp(current_date.replace(hour=10), "Monthly Rent", 1800.0, "Housing")
                add_exp(current_date.replace(hour=9), "Monthly Salary", 5500.0, "Salary", "income")
            
            if day == 5:
                 add_exp(current_date.replace(hour=14), "Electric Bill", round(random.uniform(80, 150), 2), "Utilities")
            if day == 15:
                 add_exp(current_date.replace(hour=14), "Internet Bill", 65.0, "Utilities")
                 add_exp(current_date.replace(hour=9), "Freelance Income", round(random.uniform(500, 1500), 2), "Salary", "income") # Side gig
            if day == 20: 
                 add_exp(current_date.replace(hour=10), "Netflix Subscription", 15.99, "Entertainment")
                 add_exp(current_date.replace(hour=10), "Spotify", 9.99, "Entertainment")

            # 2. WEEKLY HABITS (Groceries)
            # Shop on Saturdays or Sundays
            if weekday == 5: # Saturday
                 if random.random() > 0.1: # 90% chance
                     store = random.choice(["Whole Foods", "Trader Joe's", "Safeway", "Costco"])
                     amount = round(random.uniform(100.0, 250.0), 2)
                     add_exp(current_date.replace(hour=random.randint(10, 16)), f"{store} Run", amount, "Groceries")

            # 3. DAILY HABITS (Coffee/Lunch)
            if weekday < 5: # Weekdays
                if random.random() > 0.3: # 70% chance of coffee
                    cafe = random.choice(["Starbucks", "Peet's Coffee", "Local Cafe", "Dunkin'"])
                    add_exp(current_date.replace(hour=8, minute=random.randint(0,59)), cafe, round(random.uniform(4.50, 7.50), 2), "Dining Out")
                
                if random.random() > 0.5: # 50% chance of buying lunch
                    lunch_spot = random.choice(["Chipotle", "Sweetgreen", "Subway", "Burger King", "Local Deli"])
                    add_exp(current_date.replace(hour=12, minute=random.randint(0,59)), lunch_spot, round(random.uniform(12.0, 20.0), 2), "Dining Out")

            # 4. WEEKEND/LEISURE (Dining Out, Shopping, Entertainment)
            if weekday >= 5: # Fri, Sat, Sun (Fri is 4, but treating >=5 as Sat/Sun. Let's add Fri night)
                pass 
            
            if weekday == 4: # Friday Night
                if random.random() > 0.2:
                    rest = random.choice(["Italian Restaurant", "Sushi Place", "Burger Joint", "Pizza & Beer", "Thai Food"])
                    add_exp(current_date.replace(hour=19), f"Dinner at {rest}", round(random.uniform(40.0, 120.0), 2), "Dining Out")
            
            if weekday == 6: # Sunday Uber/Transport
                 if random.random() > 0.6:
                     add_exp(current_date.replace(hour=random.randint(10, 20)), "Uber Ride", round(random.uniform(15.0, 45.0), 2), "Transportation")

            # 5. RANDOM SHOPPING / HEALTH
            if random.random() < 0.05: # 5% chance any day
                item = random.choice(["Amazon Order", "Target", "CVS Pharmacy", "Clothes Shopping", "Gadget Store"])
                cat = "Shopping"
                if "Pharmacy" in item: cat = "Health"
                amount = round(random.uniform(20.0, 150.0), 2)
                add_exp(current_date.replace(hour=15), item, amount, cat)
            
            if random.random() < 0.02: # Occasional Gas/Transport
                 add_exp(current_date.replace(hour=17), "Shell Gas Station", round(random.uniform(40.0, 70.0), 2), "Transportation")

            current_date += timedelta(days=1)

        session.add_all(expenses)
        session.commit()
        print(f"Added {len(expenses)} realistic transactions covering 1 year.")

if __name__ == "__main__":
    seed_data()
