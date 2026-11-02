<div align="center">

# AdminDash — Modern Admin Dashboard

A full-stack admin dashboard with authentication, user management, transactions, statistics and a dark/light theme.
Built with **Node.js / Express** and a **vanilla HTML · CSS · JavaScript** frontend.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-optional-4479A1?logo=mysql&logoColor=white)
![Auth](https://img.shields.io/badge/Auth-JWT-orange)
![Status](https://img.shields.io/badge/status-demo-blue)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

AdminDash simulates a real-world back-office application. It ships with a REST API, JWT-based authentication, protected pages and a responsive UI, and can run in two modes:

| Mode | Storage | Use case |
|------|---------|----------|
| **Demo** (`DEV_MODE=true`) | In-memory, resets on restart | Quick try-out, no setup required |
| **Standard** (default) | MySQL, tables and seed data created automatically | Persistent data |

## Features

- **Authentication**: sign up, sign in, password reset, JWT-protected routes and pages
- **User management**: list, create, view and update users
- **Transactions**: create and browse transactions with status tracking (completed / pending / failed)
- **Statistics**: dashboard KPIs (users, sales, sessions, support) and charts
- **Settings**: profile management
- **Theming**: dark / light mode, persisted across sessions
- **Responsive**: usable on desktop and mobile
- **Preview mode**: browse the UI without signing in (`preview.html`)

## Tech Stack

**Backend:** Node.js, Express, JSON Web Tokens, bcryptjs, mysql2, dotenv, cors
**Frontend:** HTML5, CSS3, vanilla JavaScript (no build step)
**Tooling:** nodemon

## Project Structure

```text
.
├── backend/
│   ├── config/            # DB pool, schema init, demo/seed data
│   ├── controllers/       # auth, users, transactions, stats logic
│   ├── middleware/        # JWT protection, error handling
│   ├── models/            # User and Transaction data access
│   ├── routes/            # API route definitions
│   ├── utils/             # token generation
│   ├── app.js             # Express app setup
│   ├── server.js          # Entry point
│   └── .env.example
├── front-end/
│   ├── HTML/              # landing, signin, signup, dashboard, users, ...
│   ├── CSS/               # global, layout, components, auth styles
│   ├── SCRIPTS/           # api client, auth, state, charts, theme, pages
│   └── MARKDAOWN/         # additional frontend documentation
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm
- MySQL 8+ *(only for Standard mode)*

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>/backend
npm install
```

### 2. Configure the environment

```bash
cp .env.example .env
```

For the quickest start, set `DEV_MODE=true` in `.env` (no database needed).
For Standard mode, fill in your MySQL credentials instead. See [Configuration](#configuration).

### 3. Start the API

```bash
npm start          # production
npm run dev        # auto-reload with nodemon
```

The API listens on **http://localhost:5000**.

### 4. Serve the frontend

The frontend is static and is not served by the backend. From the project root, run any static server on an allowed origin (`3000` or `8000`):

```bash
npx serve front-end -l 3000
# or
python -m http.server 3000 --directory front-end
```

Then open **http://localhost:3000/HTML/signin.html** and sign in with a [demo account](#demo-accounts).

> The frontend calls the API at `http://localhost:5000/api` (see `front-end/SCRIPTS/api.js`). Allowed CORS origins are configured in `backend/app.js`.

## Configuration

All settings live in `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | API port |
| `DEV_MODE` | `false` | `true` = in-memory demo data, no MySQL |
| `DB_HOST` | `127.0.0.1` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `dashboard_db` | Database name (created automatically) |
| `JWT_SECRET` | none | **Required.** Secret used to sign tokens. Use a long random value |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `Demo1234` |
| User | `alice@example.com` | `Demo1234` |
| User | `pierre@example.com` | `Demo1234` |

> These accounts are for local demonstration only. Remove or change them before any real deployment.

## API Reference

Base URL: `http://localhost:5000/api`. Protected routes require the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/auth/register` | – | Create an account |
| POST | `/auth/login` | – | Sign in, returns a JWT |
| POST | `/auth/reset-password` | – | Reset a password |
| GET | `/auth/me` | ✔ | Current user |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/users` | ✔ | List users |
| POST | `/users` | ✔ | Create a user |
| GET | `/users/profile/me` | ✔ | Current user profile |
| GET | `/users/:id` | ✔ | Get a user |
| PUT | `/users/:id` | ✔ | Update a user |

### Transactions

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/transactions` | ✔ | List transactions |
| POST | `/transactions` | ✔ | Create a transaction |

### Statistics

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/stats` | ✔ | Dashboard KPIs |

### Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Demo1234"}'
```

## Architecture

```text
Browser (HTML/CSS/JS)
      │  fetch + JWT
      ▼
Express routes ──► auth middleware ──► controllers ──► models
                                                         │
                                  ┌──────────────────────┴───────────────┐
                                  ▼                                      ▼
                        In-memory store (DEV_MODE)                 MySQL (default)
```

In demo mode, edit `backend/config/devData.js` to change the sample users and transactions.

## Security Notes

This project is a **demo**. Before using it in production:

- Set a strong, unique `JWT_SECRET` and never commit your `.env`
- Remove the seeded demo accounts and default passwords
- Shorten the JWT lifetime (currently 30 days) and consider refresh tokens
- Add rate limiting, input validation and HTTPS
- Restrict CORS origins to your real domains
- Add role-based authorization checks on admin-only endpoints

## Roadmap

- [ ] Pagination, search and filters on lists
- [ ] Role-based access control
- [ ] Automated tests (Jest / Supertest)
- [ ] Docker setup
- [ ] Export to CSV / PDF
- [ ] API documentation (OpenAPI / Swagger)

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

## License

Add a `LICENSE` file to specify the terms (for example [MIT](https://choosealicense.com/licenses/mit/)).
