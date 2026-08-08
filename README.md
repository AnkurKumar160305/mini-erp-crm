# Mini ERP + CRM Operations Portal

A complete, production-ready full-stack application built for managing customers, products, inventory, and sales challans. 

## Features

- **Authentication & Authorization**: Role-based access control (Admin, Sales, Warehouse, Accounts) using JWT.
- **CRM (Customer Relationship Management)**: Track leads, active customers, distributors, and follow-ups.
- **Product Management**: Create and manage products with AWS S3 image uploads.
- **Inventory System**: Real-time stock tracking with movement history and low-stock alerts.
- **Sales Challans**: Transaction-safe inventory deduction, challan confirmation, cancellation with stock reversal, and automated PDF generation.
- **Dashboard**: Real-time stats and Recharts-based data visualization.
- **Professional UI**: Fully responsive frontend built with React, Tailwind CSS, and Lucide Icons.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS v3, React Query, Zustand, React Hook Form, Zod, Recharts.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **DevOps**: Docker, Docker Compose, GitHub Actions, Nginx.
- **Tools**: PDFKit, AWS S3, Swagger UI, Jest.

## Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### 2. Setup

Clone the repository and navigate to the project directory:

```bash
git clone <repo-url>
cd mini-erp-crm
```

### 3. Run with Docker Compose (Production Mode)

The easiest way to run the entire stack (Database, Backend, Frontend) is via Docker Compose:

```bash
docker-compose up -d --build
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api/v1
- **Swagger Docs**: http://localhost:5000/api/docs

*Note: The backend container will automatically run Prisma migrations and start the server.*

### 4. Local Development

#### Database Setup
Start only the PostgreSQL database using Docker:
```bash
docker-compose up -d db
```

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your local DB credentials if needed

npx prisma generate
npx prisma migrate dev --name init
npm run seed     # Seeds the database with demo users and data
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Demo Credentials

You can use the following credentials to test the application after running the seed command:

- **Admin**: admin@example.com
- **Sales**: sales@example.com
- **Warehouse**: warehouse@example.com
- **Accounts**: accounts@example.com
- **Password (for all)**: Password123!

## API Documentation

Swagger API documentation is available at `/api/docs` when the backend server is running.
A Postman collection is also provided in the root directory: `postman_collection.json`.

## CI/CD

A GitHub Actions workflow is included in `.github/workflows/ci.yml`. It automatically runs tests and builds the frontend and backend on pushes to the `main` branch.

## License

MIT License
