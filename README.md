# Expense Flow - Expense Tracker PWA

A modern, production-ready Expense Tracker designed to help you manage your finances with ease. Built with performance and user experience in mind, this Progressive Web App (PWA) offers seamless tracking, insightful analytics, and a beautiful interface.

**Live Demo:** [https://expense-flow.duckdns.org](https://expense-flow.duckdns.org)

## ✨ Features

*   **Smart Dashboard:** Get a quick overview of your financial health with intuitive charts and summaries.
*   **Expense Tracking:** Easily log expenses with categories, dates, and notes.
*   **Budget Management:** Set monthly budgets and track your spending against them.
*   **PWA Support:** Install on your mobile device for a native-like experience.
*   **Responsive Design:** Works perfectly on desktop, tablet, and mobile.
*   **Secure:** JWT-based authentication to keep your data safe.
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

## 📄 License

This project is open source and available under the [MIT License](LICENSE).