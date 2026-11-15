# Expense Flow - Expense Tracker PWA

Side project built with AI coding agents.

An expense tracker Progressive Web App (PWA) with a React frontend, a FastAPI backend, and a PostgreSQL database.

## ✨ Features

*   **Smart Dashboard:** Charts and summaries of spending.
*   **Expense Tracking:** Easily log expenses with categories, dates, and notes.
*   **Budget Management:** Set monthly budgets and track your spending against them.
*   **PWA Support:** Installable on mobile devices (web app manifest via vite-plugin-pwa).
*   **Responsive Design:** Responsive layout.
*   **Secure:** JWT-based authentication.
*   **Export Data:** Download your expense reports as CSV.

## 🛠 Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS, Framer Motion
*   **Backend:** FastAPI, Python 3.10+, SQLModel/SQLAlchemy
*   **Database:** PostgreSQL
*   **Infrastructure:** Docker, Docker Compose, Nginx, Github Actions

## 🚀 Getting Started

### Prerequisites

*   Docker and Docker Compose installed on your machine.

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sanket-parte/expense-tracker-pwa.git
    cd expense-tracker-pwa
    ```

2.  **Run with Docker Compose:**
    ```bash
    docker compose up --build
    ```
    This will start the frontend at `http://localhost`, backend at `http://localhost:8000`, and database.

3.  **Access the App:**
    Open your browser and navigate to `http://localhost`.

## 📦 Deployment

This project is configured for automated deployment via GitHub Actions.

1.  **Server Requirements:** A generic VM (DigitalOcean, AWS, etc.) with Docker & Docker Compose.
2.  **Configuration:**
    *   Set up necessary secrets in GitHub Actions (HOST, USERNAME, SSH_KEY, POSTGRES_PASSWORD, etc.).
    *   The `docker-compose.prod.yml` handles SSL via Let's Encrypt automatically.

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.