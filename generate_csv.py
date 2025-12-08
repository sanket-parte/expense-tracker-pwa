import csv
import random
from datetime import datetime, timedelta

def generate_data():
    categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Other']
    expenses = [
        ('Grocery Shopping', 50, 150, 'Food'),
        ('Lunch', 10, 30, 'Food'),
        ('Dinner', 30, 80, 'Food'),
        ('Uber', 15, 40, 'Transport'),
        ('Gas', 40, 60, 'Transport'),
        ('Train Ticket', 5, 15, 'Transport'),
        ('Electricity', 60, 120, 'Utilities'),
        ('Water', 20, 50, 'Utilities'),
        ('Internet', 50, 70, 'Utilities'),
        ('Movie', 15, 25, 'Entertainment'),
        ('Netflix', 15, 16, 'Entertainment'),
        ('Concert', 50, 150, 'Entertainment'),
        ('Pharmacy', 10, 50, 'Health'),
        ('Gym', 40, 60, 'Health'),
        ('Doctor Visit', 50, 200, 'Health'),
        ('Shopping', 50, 200, 'Other'),
        ('Gift', 20, 100, 'Other'),
    ]

    start_date = datetime(2025, 1, 1)
    end_date = datetime(2025, 12, 31)
    delta = end_date - start_date

    data = []
    
    # Generate daily expenses
    current_date = start_date
    while current_date <= end_date:
        # 0 to 3 expenses per day
        num_expenses = random.randint(0, 3)
        for _ in range(num_expenses):
            item, min_amt, max_amt, cat = random.choice(expenses)
            amount = round(random.uniform(min_amt, max_amt), 2)
            data.append([item, amount, cat, 'expense', current_date.strftime('%Y-%m-%d')])
        
        current_date += timedelta(days=1)

    # Generate monthly salary
    current_date = start_date
    while current_date <= end_date:
        if current_date.day == 1:
            data.append(['Salary', 5000.00, 'Other', 'income', current_date.strftime('%Y-%m-%d')])
        elif current_date.day == 15:
             # Maybe a freelance gig
            if random.random() > 0.5:
                data.append(['Freelance Project', round(random.uniform(300, 800), 2), 'Other', 'income', current_date.strftime('%Y-%m-%d')])
        
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
