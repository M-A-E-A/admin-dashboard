# DEV MODE Implementation Guide

## Overview

DEV MODE allows you to test the backend without MySQL while your teammate works on the database. All routes work with in-memory demo data.

## How to Enable DEV MODE

### Option 1: Quick Start for Testing
Edit `.env` and set:
```
DEV_MODE=true
```

Then start the server:
```bash
npm start
```

You should see:
```
Starting server in DEV MODE...
Running in DEV MODE without MySQL
DEV MODE data initialized.
...
Server is running on port 5000
DEV MODE: Using in-memory data (not connected to MySQL)
```

### Option 2: Disable DEV MODE (Return to MySQL)
Edit `.env` and set:
```
DEV_MODE=false
```

The backend will use MySQL as before.

## Files Modified

1. **`.env`** - Added `DEV_MODE=false`
2. **`.env.example`** - Added `DEV_MODE=false` template
3. **`backend/config/devData.js`** - NEW: In-memory data store with demo users and transactions
4. **`backend/models/User.js`** - Updated to check DEV_MODE and use devData when enabled
5. **`backend/models/Transaction.js`** - Updated to check DEV_MODE and use devData when enabled
6. **`backend/config/db.js`** - Updated to skip MySQL connection when DEV_MODE=true
7. **`backend/config/initDb.js`** - Updated to skip database init and load devData instead
8. **`backend/controllers/statsController.js`** - Updated to compute stats from devData in DEV MODE
9. **`backend/server.js`** - Updated to log DEV MODE startup info

## Demo Credentials (DEV MODE)

You can use these credentials to test login in DEV MODE:

### Admin User
- Email: `admin@example.com`
- Password: `Demo1234`

### Regular Users
- Email: `alice@example.com` / Password: `Demo1234`
- Email: `pierre@example.com` / Password: `Demo1234`
- Email: `claire@example.com` / Password: `Demo1234`
- Email: `lucie@example.com` / Password: `Demo1234`

## API Test Examples (DEV MODE)

All endpoints work normally. Here are typical test cases:

### 1. Register a New User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "id": 6,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Demo1234"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Admin Demo",
  "email": "admin@example.com",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User Profile
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer <TOKEN_FROM_LOGIN>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Admin Demo",
  "email": "admin@example.com",
  "role": "admin"
}
```

### 4. Get All Users
```bash
GET http://localhost:5000/api/users
Authorization: Bearer <TOKEN_FROM_LOGIN>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Admin Demo",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  ...
]
```

### 5. Get User Profile
```bash
GET http://localhost:5000/api/users/profile
Authorization: Bearer <TOKEN_FROM_LOGIN>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Admin Demo",
  "email": "admin@example.com",
  "role": "admin",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### 6. Update User Profile
```bash
PUT http://localhost:5000/api/users/profile
Authorization: Bearer <TOKEN_FROM_LOGIN>
Content-Type: application/json

{
  "name": "New Admin Name",
  "email": "newemail@example.com",
  "password": "NewPassword123"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "New Admin Name",
  "email": "newemail@example.com",
  "role": "admin",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### 7. Get User Transactions
```bash
GET http://localhost:5000/api/transactions
Authorization: Bearer <TOKEN_FROM_LOGIN>
```

**Response (200):**
```json
[
  {
    "id": 4,
    "title": "Transfert interne",
    "amount": 560,
    "type": "Transfert",
    "status": "pending",
    "user_id": 1,
    "date": "2024-01-18T00:00:00.000Z",
    "created_at": "2024-01-18T00:00:00.000Z",
    "updated_at": "2024-01-18T00:00:00.000Z"
  },
  ...
]
```

### 8. Create a New Transaction
```bash
POST http://localhost:5000/api/transactions
Authorization: Bearer <TOKEN_FROM_LOGIN>
Content-Type: application/json

{
  "title": "Test Payment",
  "amount": 150.50,
  "type": "Paiement",
  "status": "completed"
}
```

**Response (201):**
```json
{
  "id": 9,
  "title": "Test Payment",
  "amount": 150.50,
  "type": "Paiement",
  "status": "completed",
  "user_id": 1,
  "date": "2024-04-19T14:30:00.000Z",
  "created_at": "2024-04-19T14:30:00.000Z",
  "updated_at": "2024-04-19T14:30:00.000Z"
}
```

### 9. Get Dashboard Stats
```bash
GET http://localhost:5000/api/stats
Authorization: Bearer <TOKEN_FROM_LOGIN>
```

**Response (200):**
```json
{
  "totalUsers": 5,
  "totalTransactions": 8,
  "totalTransactionAmount": 1175.39,
  "pendingTransactions": 2
}
```

### 10. Reset Password
```bash
POST http://localhost:5000/api/auth/reset-password
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "NewPassword123"
}
```

**Response (200):**
```json
{
  "message": "Le mot de passe a été réinitialisé avec succès."
}
```

## Important Notes

### ✅ What Works in DEV MODE
- All auth routes (register, login, reset password, get current user)
- All user routes (get all users, get profile, update profile)
- All transaction routes (get transactions, create transactions)
- All stats routes (get dashboard stats)
- JWT token generation and validation
- Auth middleware protection
- All response shapes match SQL mode
- Password hashing with bcrypt

### ⚠️ DEV MODE Limitations
- Data is stored in memory only (lost on server restart)
- Multiple server instances won't share data
- No real database persistence
- Foreign keys are not enforced (but not needed)

### ✅ What's Safe About DEV MODE
- DEV MODE flag can be toggled easily
- SQL mode code is untouched and fully intact
- No SQL structures removed or modified
- Easy to switch between modes for testing
- Demo data is isolated in `devData.js`
- Future MySQL migration will work normally

## Switching Back to SQL Mode

When your teammate finishes the database setup:

1. Edit `.env` and change:
   ```
   DEV_MODE=false
   ```

2. Restart the server:
   ```bash
   npm start
   ```

3. The backend will connect to MySQL exactly as before
4. All DEV MODE code remains harmless (just unused)

## How DEV MODE Works Internally

1. When `DEV_MODE=true`:
   - `server.js` calls `initializeDatabase()` which loads `devData.js`
   - `config/db.js` skips MySQL connection
   - Models (`User.js`, `Transaction.js`) check `process.env.DEV_MODE` and use `devData.js` instead of `pool`
   - Controllers work unchanged (they call the same model functions)
   - Data is stored in JavaScript arrays/objects in memory

2. When `DEV_MODE=false`:
   - All MySQL code runs normally
   - Models use the MySQL pool
   - DEV MODE code paths are never reached
   - Works exactly like before

## Troubleshooting

### Server won't start in DEV MODE
Check that `.env` contains exactly:
```
DEV_MODE=true
```

Make sure it's not `DEV_MODE = true` (no spaces around `=`).

### Login fails
Verify you're using exact credentials:
- Email: `admin@example.com`
- Password: `Demo1234`

Not: `admin` or `admin@example` (must be exact).

### "No token found" error
Ensure you're sending the Authorization header:
```
Authorization: Bearer <TOKEN>
```

Include the word "Bearer" before the token.

### Stats showing zeros
This is normal if you haven't created any transactions yet. Create a few transactions first.

### Data gone after restart
This is expected - DEV MODE data is in-memory only. Restart clears it.

## Summary

DEV MODE is a temporary testing tool that:
- ✅ Lets you test backend routes without MySQL
- ✅ Uses safe demo data for testing
- ✅ Keeps all SQL code intact
- ✅ Is easy to disable when MySQL is ready
- ✅ Won't interfere with future SQL migration

**Status: SQL mode is FULLY PRESERVED and can be switched back anytime.**
