# 🚀 Dashboard Demo App - Quick Start Guide

## Overview
This is now a **100% demo-only app** with NO MySQL required. Everything runs on in-memory data.

---

## Quick Start (2 Steps)

### Step 1: Start Backend
```bash
cd backend
npm start
```

**Expected Output:**
```
Demo data initialized
Server is running on port 5000
Using in-memory demo data (no database required)
```

### Step 2: Open Frontend
```
Browser: http://localhost:5000/front-end/HTML/signin.html
```

---

## Demo Credentials

**Admin Account:**
- Email: `admin@example.com`
- Password: `Demo1234`

**User Accounts:**
- `alice@example.com` / `Demo1234`
- `pierre@example.com` / `Demo1234`
- `claire@example.com` / `Demo1234`
- `lucie@example.com` / `Demo1234`

Or register a new account using the signup page.

---

## Test Flow

### 1️⃣ Login Test
1. Go to signin page
2. Enter: `admin@example.com` / `Demo1234`
3. ✅ Should redirect to dashboard

### 2️⃣ Dashboard Test
1. Dashboard should display stats:
   - Utilisateurs: 5
   - Ventes: 1,194.39€
   - Sessions: 8
   - Support: 2
2. ✅ Stats loaded from backend `/api/stats`

### 3️⃣ Profile Test
1. Click avatar (bottom-right)
2. Click "⚙️ Paramètres"
3. ✅ Profile page loads current user data

### 4️⃣ Logout Test
1. Click avatar (bottom-right)
2. Click "🚪 Déconnexion"
3. ✅ Redirects to signin

### 5️⃣ Register Test
1. Go to signup page
2. Fill form and submit
3. ✅ New user added to memory
4. ✅ Can login immediately with new credentials

### 6️⃣ Dark Mode Test
1. Click theme button (top-right)
2. Toggle to dark mode
3. Refresh page
4. ✅ Dark mode persists in localStorage

---

## API Endpoints (All Working)

### Authentication
```
POST   /api/auth/register      - Create new user
POST   /api/auth/login         - Login
GET    /api/auth/me            - Get current user
POST   /api/auth/reset-password - Reset password
```

### Users
```
GET    /api/users              - List all users
GET    /api/users/profile      - Get current user profile
PUT    /api/users/profile      - Update profile
```

### Transactions
```
GET    /api/transactions       - Get user's transactions
POST   /api/transactions       - Create new transaction
```

### Statistics
```
GET    /api/stats              - Get dashboard stats
```

---

## Demo Data

**Users (5 total):**
- Id: 1-5
- Passwords: All hashed "Demo1234"
- Roles: 1 admin, 4 users

**Transactions (8 total):**
- Various types: Paiement, Refund, Transfert
- Various statuses: completed, pending, failed
- Distributed across users
- Amounts: 14€ to 560€

**Stats (Computed):**
- Total users: 5
- Total transactions: 8
- Total amount: 1,194.39€
- Pending: 2

---

## Important Notes

⚠️ **Data Persistence:**
- Data is stored in Node.js memory
- Data resets when server restarts
- Perfect for demo/testing
- Not suitable for production

✅ **What Works:**
- All auth flows
- All API endpoints
- Session storage
- Dark mode persistence
- User profile management
- Transaction creation
- Dashboard stats

❌ **Not Implemented:**
- Email sending
- Advanced roles/permissions
- Database persistence
- Multi-server support

---

## Troubleshooting

### Port 5000 Already in Use
```bash
# Kill existing Node process
taskkill /F /IM node.exe

# Then restart backend
npm start
```

### Auth Not Working
- Check that backend is running on port 5000
- Check browser console for network errors
- Verify token in localStorage: `dashboard-session`

### Dark Mode Not Persisting
- Check localStorage (DevTools > Application > Storage)
- Clear cache if needed
- Browser might have privacy settings blocking localStorage

### Stats Not Loading
- Check API response: http://localhost:5000/api/stats
- Verify you're logged in (token in Authorization header)
- Check browser console for errors

---

## File Structure

```
backend/
├── app.js              - Express app
├── server.js           - Starts demo data
├── config/devData.js   - In-memory storage
├── models/             - User/Transaction ops
├── controllers/        - Auth/User/Stats logic
└── routes/             - API endpoints

front-end/
├── HTML/               - All pages
│   ├── signin.html     - Login page
│   ├── signup.html     - Register page
│   ├── index.html      - Dashboard
│   ├── parametres.html - Settings
│   ├── transactions.html
│   ├── utilisateurs.html
│   └── statistiques.html
├── SCRIPTS/
│   ├── auth.js         - API helpers
│   └── ...other files
└── CSS/                - Styling
```

---

## Next Steps

1. **For Demo:**
   - Start backend
   - Open browser
   - Login and show dashboard
   - Click through pages
   - Show profile/logout

2. **For Further Development:**
   - Backend in `backend/` folder
   - Frontend in `front-end/` folder
   - Add new features to in-memory data
   - Or integrate real database later

3. **To Add SQL Back (Future):**
   - Files still exist: `config/db.js`, `config/initDb.js`
   - Revert models to use SQL
   - Would be fully backward compatible

---

## Contact & Support

For questions about:
- **Backend**: Check `backend/server.js` and `backend/config/devData.js`
- **Frontend**: Check `front-end/SCRIPTS/auth.js` for API integration
- **Data**: Check `backend/config/devData.js` for demo users/transactions

---

**Perfect for School Project Demo!** 🎓

No database setup needed. Just run 2 commands and you're ready to showcase.
