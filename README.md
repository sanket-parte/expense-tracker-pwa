# Expense Tracker PWA


## Deployment

This project is configured for automated deployment to a VM via GitHub Actions.

### Prerequisites

1.  **Server**: An SSD Node VM (e.g., DigitalOcean, Linode, AWS EC2) with Docker and Docker Compose installed.
2.  **GitHub Repository**: This code must be pushed to a GitHub repository.

### Setup

1.  **Secrets**: Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions, and add the following Repository secrets:
    *   `HOST`: The IP address of your VM.
    *   `USERNAME`: The SSH username for your VM (e.g., `root` or `ubuntu`).
    *   `SSH_KEY`: The private SSH key to access your VM.
    *   `POSTGRES_PASSWORD`: A strong password for your production database.

2.  **Run**: Push any change to the `main` branch. The "Build and Deploy" workflow will run automatically.

3.  **Access**: Once deployment is complete, access your application at `http://<your-vm-ip>`.

### Troubleshooting

-   Check the "Actions" tab in your GitHub repository for build logs.
-   SSH into your VM and run `docker compose -f ~/expense-tracker/docker-compose.prod.yml logs` to see container logs.