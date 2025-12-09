import csv
import io
from typing import Dict, Any, List
from datetime import datetime
from sqlmodel import Session, select, delete, or_
from backend.adapters.database.models import Expense, User, Category, Budget, RecurringExpense, AISuggestion, UserSettings

class ImportService:
    def __init__(self, session: Session):
        self.session = session

    def process_import(self, content: bytes, user_id: int) -> Dict[str, Any]:
        try:
            decoded = content.decode('utf-8')
        except UnicodeDecodeError:
            decoded = content.decode('latin-1')
            
        csv_reader = csv.DictReader(io.StringIO(decoded))
        rows = list(csv_reader)
        
        # 1. Identify unique categories in import
        import_categories = {row.get('category', 'Uncategorized').strip() for row in rows}
        if '' in import_categories:
            import_categories.remove('')
        if 'Uncategorized' not in import_categories:
            import_categories.add('Uncategorized')

        # 2. Get existing categories for this user
        existing_cats_query = select(Category).where(
             or_(Category.user_id == None, Category.user_id == user_id)
        )
        existing_categories = self.session.exec(existing_cats_query).all()
        
        # Map name -> id
        category_map = {cat.name.lower(): cat.id for cat in existing_categories}
        
        # 3. Create missing categories
        new_categories_count = 0
        for cat_name in import_categories:
            clean_name = cat_name.strip()
            if clean_name.lower() not in category_map:
                new_cat = Category(
                    name=clean_name, 
                    user_id=user_id, 
                    color="#64748b" 
                )
                self.session.add(new_cat)
                self.session.flush() 
                self.session.refresh(new_cat)
                category_map[clean_name.lower()] = new_cat.id
                new_categories_count += 1
        
        try:
            self.session.commit()
        except Exception as e:
            print(f"Error creating categories: {e}")
            self.session.rollback()

        # 4. Create Expenses
        count = 0
        for row in rows:
            try:
                date_str = row.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
                
                amount_str = row.get('amount', '0').replace(',', '')
                try:
                     amount = float(amount_str)
                except ValueError:
                     amount = 0.0

                cat_name = row.get('category', 'Uncategorized').strip()
                cat_id = category_map.get(cat_name.lower())
                
                if not cat_id:
                     cat_id = list(category_map.values())[0] if category_map else None

                if not cat_id:
                    print("No category ID found, skipping row")
                    continue

                expense = Expense(
                    title=row.get('title', 'Untitled'),
                    amount=amount,
                    category_id=cat_id,
                    type=row.get('type', 'expense'),
                    date=datetime.strptime(date_str, '%Y-%m-%d'),
                    user_id=user_id
                )
                self.session.add(expense)
                count += 1
            except Exception as e:
                print(f"Skipping row due to error: {e}")
                continue
                
        self.session.commit()
        return {"message": f"Successfully imported {count} expenses and created {new_categories_count} new categories."}

    def get_all_expenses(self, user_id: int) -> List[Expense]:
        return self.session.exec(
            select(Expense)
            .where(Expense.user_id == user_id)
            .order_by(Expense.date.desc())
        ).all()

    def clear_user_data(self, user_id: int) -> bool:
        print(f"Clearing data for user {user_id}")
        try:
            # Delete dependent data first
            self.session.exec(delete(Expense).where(Expense.user_id == user_id))
            self.session.exec(delete(Budget).where(Budget.user_id == user_id))
            self.session.exec(delete(RecurringExpense).where(RecurringExpense.user_id == user_id))
            self.session.exec(delete(AISuggestion).where(AISuggestion.user_id == user_id))
            self.session.exec(delete(UserSettings).where(UserSettings.user_id == user_id))
            
            # Delete custom categories
            self.session.exec(delete(Category).where(Category.user_id == user_id))
            
            self.session.commit()
            print("Data cleared successfully")
            return True
        except Exception as e:
            print(f"Error clearing data: {e}")
            self.session.rollback()
            raise e
