import argparse
import sys
import os

# Ensure the backend module is in the python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(parent_dir)

from sqlmodel import select, Session
from backend.adapters.database.session import engine
from backend.adapters.database.models import User
from backend.core.security import get_password_hash

def change_password(email: str, new_password: str):
    with Session(engine) as session:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()

        if not user:
            print(f"Error: User with email '{email}' not found.")
            sys.exit(1)

        print(f"User found: {user.email} (ID: {user.id})")
        
        user.password_hash = get_password_hash(new_password)
        session.add(user)
        session.commit()
        session.refresh(user)
        
        print("Password successfully updated.")

def main():
    parser = argparse.ArgumentParser(description="Change password for a user.")
    parser.add_argument("--email", required=True, help="Email of the user")
    parser.add_argument("--password", required=True, help="New password")

    args = parser.parse_args()

    change_password(args.email, args.password)

if __name__ == "__main__":
    main()
