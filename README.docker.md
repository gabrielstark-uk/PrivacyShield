# PrivacyShield Docker Deployment Guide

This guide explains how to deploy the PrivacyShield application using Docker.

## Prerequisites

- Docker (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)

## Quick Start

The easiest way to deploy PrivacyShield is to use the provided deployment script:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The script will:
1. Check for Docker and Docker Compose
2. Create a `.env` file if it doesn't exist
3. Build the Docker containers
4. Run database migrations
5. Start the application

## Manual Deployment

If you prefer to deploy manually, follow these steps:

### 1. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file to set your configuration values, especially:
- `SESSION_SECRET`: A secure random string for session encryption
- `STRIPE_SECRET_KEY`: Your Stripe secret key (if using Stripe)
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (if using Stripe)
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret (if using Stripe)

### 2. Build and Start the Containers

```bash
# Build the containers
docker-compose build

# Start the containers in detached mode
docker-compose up -d
```

### 3. Run Database Migrations

```bash
docker-compose run --rm app sh -c "npx drizzle-kit push"
```

### 4. Access the Application

The application should now be running at http://localhost:3000

## Docker Compose Commands

- View logs: `docker-compose logs -f`
- Stop application: `docker-compose down`
- Restart application: `docker-compose restart`
- Stop and remove volumes: `docker-compose down -v` (warning: this will delete all data)

## Container Structure

The Docker setup includes the following containers:

- **app**: The PrivacyShield application (Node.js)
- **db**: PostgreSQL database

## Data Persistence

Database data is stored in a Docker volume named `postgres-data`. This ensures your data persists even when containers are removed.

## Production Deployment

For production deployment, consider the following additional steps:

1. Use a reverse proxy like Nginx for SSL termination
2. Set up proper database backups
3. Configure a more secure database password
4. Use Docker Swarm or Kubernetes for container orchestration
5. Set up monitoring and alerting

## Troubleshooting

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Ensure all environment variables are correctly set
3. Verify the database connection is working
4. Check if the ports are not already in use by other applications