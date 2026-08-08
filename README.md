# Mini ERP + CRM Operations Portal

A complete, production-ready full-stack application built for managing customers, products, inventory, and sales challans.

---

## 📋 Submission Details

### 1. Links & Resources
- **GitHub Repository**: [https://github.com/AnkurKumar160305/mini-erp-crm](https://github.com/AnkurKumar160305/mini-erp-crm)
- **Live Frontend URL**: [https://mini-erp-crm-pink.vercel.app](https://mini-erp-crm-pink.vercel.app)
- **Live Backend API URL**: [https://mini-erp-crm-ln2j.onrender.com/api/v1](https://mini-erp-crm-ln2j.onrender.com/api/v1)
- **API Documentation (Swagger)**: [https://mini-erp-crm-ln2j.onrender.com/api/docs](https://mini-erp-crm-ln2j.onrender.com/api/docs)
- **Postman Collection**: A `postman_collection.json` file is available in the root of the repository for local API testing.

### 2. Test Login Credentials
You can use the following seeded credentials to test role-based access control:
- **Admin**: `admin@example.com`
- **Sales**: `sales@example.com`
- **Warehouse**: `warehouse@example.com`
- **Accounts**: `accounts@example.com`
- **Password (for all accounts)**: `Password123!`

### 3. Architecture Overview
The application follows a standard **Client-Server Architecture**:
- **Frontend (Client)**: Built with React (Vite) and TypeScript. It uses React Query for asynchronous state management and caching, and Zustand for global synchronous state (e.g., authentication). Routing is handled by React Router. The UI is built with Tailwind CSS, Framer Motion for animations, and a custom design system based on glassmorphism.
- **Backend (Server)**: A RESTful API built with Node.js and Express. It uses Prisma ORM to interact with the database. The architecture is heavily modularized into standard layers: `Routes` -> `Controllers` -> `Services` -> `Database`.
- **Database**: PostgreSQL hosted on Neon DB. It uses connection pooling to handle serverless connections efficiently.
- **File Storage**: AWS S3 is used for storing product images securely.
- **Security**: JWT for stateless authentication, bcrypt for password hashing, helmet for HTTP headers, and rate limiting to prevent brute-force attacks.

### 4. Known Limitations & Assumptions
- **Assumptions**: 
  - Assumed AWS S3 buckets are publicly readable for displaying product images (or signed URLs are generated if private).
  - Assumed Neon DB connection string is provided with `pgbouncer=true` to handle Prisma connection pooling.
- **Limitations**:
  - Image uploads currently do not enforce strict image compression before upload, which could lead to large S3 bucket usage over time.
  - Role permissions are hardcoded in the frontend routes and backend middleware. A dynamic permission table in the database is not implemented in this version.
  - The "Follow-ups" system for customers currently does not support email/SMS reminders or calendar integration.

---

## 🚀 Setup & Deployment

### Environment Variables Management
Environment variables are managed using `.env` files. There are `.env.example` files provided in both the `frontend` and `backend` directories. 
- **Backend variables** are loaded and validated using a custom configuration file (`src/config/env.ts`) to ensure the server crashes fast if a required variable (like `DATABASE_URL` or `JWT_SECRET`) is missing.
- **Frontend variables** use Vite's `VITE_` prefix to expose them to the browser (e.g., `VITE_API_URL`).

### How to Run Locally

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Make sure to update .env with your local PostgreSQL credentials

npx prisma generate
npx prisma migrate dev --name init
npm run seed     # Seeds the database with demo users
npm run dev      # Starts server on http://localhost:5000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev      # Starts frontend on http://localhost:5173
```

### How to Deploy the Project

#### 1. Backend Deployment (Render)
1. Connect your GitHub repository to Render and create a new **Web Service**.
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Environment Variables**: Add all variables from your `.env` file (e.g., `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`).
5. Set `CLIENT_URL` to your frontend's deployed URL to allow CORS (e.g., `https://mini-erp-crm-pink.vercel.app`).

#### 2. Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel and create a new project.
2. Select the `frontend` directory as the Root Directory.
3. Vercel will automatically detect Vite. The build command will be `npm run build` and output directory `dist`.
4. **Environment Variables**: Add `VITE_API_URL` pointing to your deployed Render backend (e.g., `https://mini-erp-crm-ln2j.onrender.com/api/v1`).
5. Click **Deploy**.

---

## 🛠️ Features

- **Authentication & Authorization**: Role-based access control (Admin, Sales, Warehouse, Accounts) using JWT.
- **CRM (Customer Relationship Management)**: Track leads, active customers, distributors, and follow-ups.
- **Product Management**: Create and manage products with AWS S3 image uploads.
- **Inventory System**: Real-time stock tracking with movement history and low-stock alerts.
- **Sales Challans**: Transaction-safe inventory deduction, challan confirmation, cancellation with stock reversal, and automated PDF generation.
- **Dashboard**: Real-time stats and Recharts-based data visualization.
- **Professional UI**: Fully responsive frontend built with React, Tailwind CSS, Framer Motion, and Lucide Icons.

## 💻 Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, React Query, Zustand, Framer Motion.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon).
- **Tools**: AWS S3, Swagger UI, Jest, PDFKit.

## License
MIT License
