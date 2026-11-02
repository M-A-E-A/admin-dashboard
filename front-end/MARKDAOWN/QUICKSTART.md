# Quick Start Guide - AdminDash Authentication System

## 🚀 Getting Started (30 seconds)

### 1. Open the Landing Page
- Navigate to: `HTML/landing.html`
- You'll see the home page with Sign In and Sign Up buttons

### 2. Test with Demo Account
**Quick Login:**
- Email: `admin@example.com`
- Password: `admin123`
- Click "Se connecter"

### 3. You're In! 🎉
- Greeted with the dashboard
- Full access to all pages
- Logout button in top right

## 📋 Navigation Map

```
Landing Page (landing.html)
├── Sign In Button → signin.html
│   ├── Valid credentials → Dashboard (index.html)
│   ├── No account? → Sign Up link
│   └── Forgot password? → forgot-password.html
│
└── Sign Up Button → signup.html
    ├── New account → Dashboard (index.html)
    └── Already registered? → Sign In link

Dashboard (index.html)
├── Protected - Requires login
├── Navigation Sidebar
│   ├── Tableau de bord (index.html)
│   ├── Utilisateurs (utilisateurs.html)
│   ├── Statistiques (statistiques.html)
│   ├── Transactions (transactions.html)
│   └── Paramètres (parametres.html)
├── Top Bar
│   ├── Dark mode toggle
│   ├── User avatar
│   └── Logout button
└── All other pages (utilisateurs.html, etc.)
    └── Also protected, include logout
```

## 🎯 Test Cases

### ✅ Test 1: Demo Login
1. Open `landing.html`
2. Click "Se connecter"
3. Enter: admin@example.com / admin123
4. Click "Se connecter" button
5. ✓ Should redirect to dashboard

### ✅ Test 2: Create New Account
1. Open `landing.html`
2. Click "S'inscrire"
3. Fill in:
   - Nom: Jean Dupont
   - Email: jean@test.com
   - Mot de passe: Test123
   - Confirmer: Test123
4. Click "S'inscrire"
5. ✓ Should create account and redirect to dashboard

### ✅ Test 3: Remember Me
1. Go to sign in page
2. Enter credentials
3. Check "Se souvenir de moi"
4. Sign in
5. Logout
6. Go back to sign in
7. ✓ Email should be pre-filled

### ✅ Test 4: Password Visibility
1. Go to sign in page
2. Click the eye icon next to password field
3. ✓ Password should be visible
4. Click again
5. ✓ Password should be hidden

### ✅ Test 5: Protected Routes
1. Without signing in, try to access: `index.html`
2. ✓ Should redirect to sign in page
3. Same for: utilisateurs.html, statistiques.html, transactions.html, parametres.html

### ✅ Test 6: Logout
1. Sign in to dashboard
2. Click "Déconnexion" button
3. Click OK on confirmation
4. ✓ Should redirect to sign in page
5. Try accessing dashboard
6. ✓ Should redirect to sign in again

### ✅ Test 7: Dark Mode
1. Click moon icon in top bar
2. ✓ Page should switch to dark theme
3. Navigate to other pages
4. ✓ Dark mode should persist
5. Sign out and back in
6. ✓ Dark mode preference should be remembered

### ✅ Test 8: Error Messages
1. Go to sign in
2. Leave fields empty and click "Se connecter"
3. ✓ Error messages should appear
4. Go to sign up
5. Enter non-matching passwords
6. ✓ Should show "Les mots de passe ne correspondent pas"

## 📁 File Descriptions

### Authentication Pages
- **landing.html** - Welcome page with demo info
  - Sign In button
  - Sign Up button
  - Dark mode toggle
  - Feature cards
  - Demo credentials display

- **signin.html** - Login page
  - Email field (required)
  - Password field with visibility toggle
  - Remember me checkbox
  - Sign up link
  - Forgot password link
  - Form validation

- **signup.html** - Registration page
  - Full name field
  - Email field
  - Password field with visibility toggle
  - Confirm password field
  - Password matching validation
  - Sign in link

- **forgot-password.html** - Password recovery
  - Email input
  - Secure recovery flow
  - Success confirmation

### Dashboard Pages (All Protected)
- **index.html** - Main dashboard
  - Statistics cards
  - User activity table
  - Modal for editing users

- **utilisateurs.html** - User management
  - User list table
  - ID, name, email, role, status, actions
  - Add/edit functionality

- **statistiques.html** - Analytics and statistics
  - Various stats cards
  - Statistical overview

- **transactions.html** - Transaction tracking
  - Transaction data
  - History and records

- **parametres.html** - Settings page
  - User preferences
  - System settings

## 🔐 User Roles

Currently defined roles:
- `admin` - Full dashboard access
- `user` - Standard user access

Default demo accounts:
- **admin**: admin@example.com (admin role)
- **jean**: jean@example.com (user role)

## 💾 Data Storage

All data stored in browser's localStorage:
- **dashboard-session** - Current user session
- **dashboard-users** - User database
- **dashboard-dark-mode** - Theme preference
- **dashboard-remember-email** - Email for remember-me

⚠️ **Note:** This clears when browser data is cleared

## 🎨 Customization Quick Tips

### Change Demo Email
1. Open `SCRIPTS/auth.js`
2. Find `initializeDemoUsers()` function
3. Edit email and password fields

### Change Colors
1. Open `CSS/style.css`
2. Modify CSS variables at top:
   ```css
   --primary: #0d6efd;
   --success: #10b981;
   etc.
   ```

### Change Page Titles
1. Open any HTML page
2. Edit `<title>` tag in `<head>`

### Add New Dashboard Page
1. Create new HTML file in `/HTML`
2. Copy structure from existing page (e.g., utilisateurs.html)
3. Keep the auth check script
4. Add link to sidebar in all pages
5. Update active link styling

## 🐛 Troubleshooting

### Sign in not working
- ✓ Check email/password are exact (case-sensitive)
- ✓ Clear localStorage with DevTools
- ✓ Use demo account: admin@example.com / admin123

### Dark mode not saving
- ✓ Check localStorage is enabled
- ✓ Sign out doesn't clear dark mode preference

### Redirect loop on dashboard
- ✓ Check session exists in localStorage
- ✓ Try signing out and back in
- ✓ Clear browser cache

### Styles not loading
- ✓ Check file paths are correct
- ✓ Verify CSS files exist in `/CSS` folder
- ✓ Open DevTools console for 404 errors

## 📞 Key JavaScript Functions

```javascript
// Check if logged in
localStorage.getItem('dashboard-session')

// Get current user
JSON.parse(localStorage.getItem('dashboard-session'))

// Logout
localStorage.removeItem('dashboard-session')
window.location.href = 'signin.html'

// Check dark mode
localStorage.getItem('dashboard-dark-mode') === 'true'

// Add new user
const users = JSON.parse(localStorage.getItem('dashboard-users') || '[]')
users.push(newUserObject)
localStorage.setItem('dashboard-users', JSON.stringify(users))
```

## 🎓 Learning Resources

### HTML/Elements
- Form elements and validation
- Semantic HTML
- Accessibility attributes

### CSS
- CSS variables for theming
- Flexbox layouts
- Dark mode with CSS filters
- Responsive design
- Animations and transitions

### JavaScript
- localStorage API
- Form handling and validation
- Event listeners
- Password strength validation
- Session management

## ✨ Features Summary

✅ Complete authentication system
✅ Sign up with validation
✅ Sign in with remember-me
✅ Password recovery page
✅ Protected dashboard routes
✅ Session management
✅ Dark mode with persistence
✅ Responsive design
✅ Modern UI/UX
✅ Error handling
✅ Form validation
✅ Demo accounts
✅ Logout functionality

## 🚀 Next Steps

1. Test all demo flows above
2. Try creating your own account
3. Explore dashboard pages
4. Test dark mode
5. Check responsive design (mobile)
6. Read the authentication code in signin.html and signup.html
7. Customize colors and text as needed
8. Add more features (2FA, profile page, etc.)

Enjoy your modern admin dashboard! 🎉
