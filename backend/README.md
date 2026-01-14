# Research Agent Backend

A Node.js/Express backend that serves as an Authentication and API Gateway layer for the Research Agent. It handles user management, enforces daily quotas, and proxies authorized requests to the Python Research Engine.

## Features

- **Authentication**: JWT-based auth (Register, Login, Me).
- **Quota Management**: Daily limits on research requests (3/day) and downloads (2/day).
- **API Gateway**: Proxies requests to the Python Research Engine.
- **API Keys**: Generate API keys for programmatic access.
- **Security**: Helmet, CORS, Password Hashing (bcrypt).

## Prerequisites

- Node.js (v18+)
- MongoDB (Running locally or cloud)
- Research Engine (Running on port 8000)

## Installation

1. Install dependencies:
   ```bash
   cd backend
   pnpm install
   ```

2. Environment Variables:
   Copy default example:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your `JWT_SECRET` and MongoDB URI.

## Usage

### Development
```bash
ppnm dev
```
Server runs on `http://localhost:5001`.

### API Endpoints

#### Auth
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (Protected)
- `POST /api/v1/auth/apikey` - Generate API Key (Protected)
- `GET /api/v1/auth/apikeys` - List API Keys (Protected)

#### Research (Proxied)
- `POST /api/v1/research` - Perform research (Protected, Quota monitored)
- `GET /api/v1/research/download` - Download report (Protected, Quota monitored)

## Authentication

You can authenticate using:
1. **Bearer Token**: `Authorization: Bearer <token>` (Browser/App)
2. **API Key**: `x-api-key: <your-api-key>` (3rd Party/Scripts)
