import requests
import sys
import time

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing / ...")
    try:
        r = requests.get(f"{BASE_URL}/")
        assert r.status_code == 200
        print("Health check passed!")
    except Exception as e:
        print(f"Health check failed: {e}")
        sys.exit(1)

def test_auth_and_expenses():
    # Register/Login
    email = f"test_{int(time.time())}@example.com"
    password = "password123"
    
    print(f"Registering user {email}...")
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test User"
    })
    
    if r.status_code != 200:
        print(f"Registration failed: {r.text}")
        # Try login if user exists (though email is unique per run usually)
        
    # Login
    print("Logging in...")
    r = requests.post(f"{BASE_URL}/auth/login", data={
        "username": email,
        "password": password
    })
    if r.status_code != 200:
        print(f"Login failed: {r.text}")
        sys.exit(1)
        
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # Create Category (needed for expense)
    # Using legacy or new endpoint? Categories router is legacy shimmed.
    # Assuming it works.
    print("Creating category...")
    r = requests.post(f"{BASE_URL}/categories/", json={
        "name": f"Test Cat {int(time.time())}", 
        "color": "#ffffff"
    }, headers=headers)
    
    if r.status_code not in [200, 201]:
        print(f"Category creation failed: {r.text}")
        # Could be failing if we haven't migrated categories table correctly or imports?
        # But we shimmed models.py, so it should be fine.
        sys.exit(1)
        
    cat_id = r.json()["id"]
    
    # Create Expense
    print("Creating expense...")
    r = requests.post(f"{BASE_URL}/expenses/", json={
        "title": "Test Expense",
        "amount": 100.50,
        "category_id": cat_id,
        "date": "2023-01-01T12:00:00"
    }, headers=headers)
    
    if r.status_code != 200:
        print(f"Create expense failed: {r.text}")
        sys.exit(1)
        
    expense_id = r.json()["id"]
    print(f"Expense {expense_id} created.")
    
    # Get Expenses
    print("Fetching expenses...")
    r = requests.get(f"{BASE_URL}/expenses/", headers=headers)
    if r.status_code != 200:
        print(f"Get expenses failed: {r.text}")
        sys.exit(1)
        
    expenses = r.json()
    assert len(expenses) > 0
    print(f"Fetched {len(expenses)} expenses. Verification passed.")

if __name__ == "__main__":
    # Wait for server to start
    print("Waiting for server...")
    time.sleep(5)
    test_health()
    test_auth_and_expenses()
