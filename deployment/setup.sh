#!/bin/bash

# Oracle Cloud VPS Setup Script
# Run this on your fresh Ubuntu/Oracle Linux instance

set -e

echo "Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

echo "Installing Docker..."
# Install Docker prereqs
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "Docker installed successfully."

# Setup directory
echo "Setting up application directory..."
mkdir -p ~/app
cd ~/app

# NOTE: In a real scenario, you would git clone here.
# For now, we assume this script is run where the files are, or files are copied.
# If using git:
# git clone <your-repo-url> .

echo "Setup complete! To run the app:"
echo "1. Go to the deployment directory: cd deployment"
echo "2. Create a .env file with your secrets (POSTGRES_PASSWORD, etc.)"
echo "3. Run: docker compose up -d"
