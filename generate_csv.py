import csv
import random
from datetime import datetime, timedelta

def generate_data():
    categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Housing', 'Income']
    
    # (title, min_amt, max_amt, category, type)
    regular_expenses = [
        ('Swiggy Order', 250, 800, 'Food', 'expense'),
        ('Zomato Order', 300, 1200, 'Food', 'expense'),
        ('Groceries (Blinkit)', 400, 2000, 'Food', 'expense'),
        ('Vegetables Market', 200, 600, 'Food', 'expense'),
        ('Tea/Coffee/Snacks', 50, 200, 'Food', 'expense'),
        ('Restaurant Dinner', 1500, 5000, 'Food', 'expense'),
        
        ('Uber Ride', 150, 600, 'Transport', 'expense'),
        ('Ola Ride', 120, 500, 'Transport', 'expense'),
        ('Metro Card Recharge', 200, 1000, 'Transport', 'expense'),
        ('Petrol/Fuel', 500, 2500, 'Transport', 'expense'),
        ('Car Maintenance', 2000, 8000, 'Transport', 'expense'),

        ('Electricity Bill', 1200, 4000, 'Utilities', 'expense'),
        ('Broadband Bill', 600, 1500, 'Utilities', 'expense'),
        ('Mobile Recharge', 299, 999, 'Utilities', 'expense'),
        ('Gas Cylinder', 900, 1200, 'Utilities', 'expense'),
        ('Maid Salary', 3000, 5000, 'Utilities', 'expense'),

        ('Movie Tickets', 300, 1000, 'Entertainment', 'expense'),
        ('Netflix Subscription', 199, 649, 'Entertainment', 'expense'),
        ('Spotify Premium', 119, 119, 'Entertainment', 'expense'),
        ('Weekend Outing', 2000, 6000, 'Entertainment', 'expense'),
        ('Concert/Event', 1500, 5000, 'Entertainment', 'expense'),

        ('Medicine/Pharmacy', 200, 2000, 'Health', 'expense'),
        ('Doctor Consultation', 500, 1500, 'Health', 'expense'),
        ('Gym Membership', 1500, 3000, 'Health', 'expense'),
        
        ('Amazon Shopping', 500, 5000, 'Shopping', 'expense'),
        ('Myntra Order', 800, 3000, 'Shopping', 'expense'),
        ('Mall Shopping', 2000, 10000, 'Shopping', 'expense'),
        ('Gift for Friend', 500, 2000, 'Shopping', 'expense'),
    ]

    start_date = datetime(2025, 1, 1) # Keep it 2025 as requested or maybe dynamic? Let's use 2024-2025 for "last year" relevance
    # Actually user asked for "last one year data" for AI. 
    # Let's generate data for 2024 and 2025.
    start_date = datetime.now() - timedelta(days=365)
    end_date = datetime.now()

    data = []
    
    current_date = start_date
    while current_date <= end_date:
        # Monthly fixed expenses (1st to 5th)
        if current_date.day == 1:
             data.append(['Salary Credited', 85000.00, 'Income', 'income', current_date.strftime('%Y-%m-%d')])
             data.append(['House Rent', 25000.00, 'Housing', 'expense', current_date.strftime('%Y-%m-%d')])
        
        if current_date.day == 5:
             data.append(['SIP Investment', 10000.00, 'Housing', 'expense', current_date.strftime('%Y-%m-%d')]) # Categorizing inv as housing/saving for now or create new if needed. Let's stick to categories list.

        # Daily variable expenses
        # Weekends have more spending
        if current_date.weekday() >= 5: # Sat, Sun
             num_expenses = random.randint(1, 4)
        else:
             num_expenses = random.randint(0, 2)

        for _ in range(num_expenses):
            item, min_amt, max_amt, cat, type_ = random.choice(regular_expenses)
            amount = round(random.uniform(min_amt, max_amt), 2)
            data.append([item, amount, cat, type_, current_date.strftime('%Y-%m-%d')])
        
        current_date += timedelta(days=1)
    
    # Sort by date
    data.sort(key=lambda x: x[4])

    # Write to CSV
    with open('docs/sample_expenses.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['title', 'amount', 'category', 'type', 'date'])
        writer.writerows(data)

    print(f"Generated {len(data)} records.")

if __name__ == "__main__":
    generate_data()
