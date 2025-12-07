from sqlalchemy import create_engine, text, inspect
from database import database_url
import os

print(f"Detected DATABASE_URL: {database_url}")

if "sqlite" in database_url:
    # If sqlite, print absolute path
    if "///" in database_url:
        path = database_url.split("///")[1]
        print(f"SQLite file path: {os.path.abspath(path)}")
        print(f"File exists: {os.path.exists(path)}")

try:
    engine = create_engine(database_url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    
    if 'expense' in tables:
        with engine.connect() as conn:
            columns = inspector.get_columns('expense')
            col_names = [c['name'] for c in columns]
            print(f"Expense columns: {col_names}")
            
            # Check for category_id
            if 'category_id' in col_names:
                print("SUCCESS: category_id column exists.")
            else:
                print("FAILURE: category_id column MISSING.")
                
    else:
        print("FAILURE: Table 'expense' not found.")

except Exception as e:
    print(f"Error connecting/inspecting: {e}")
