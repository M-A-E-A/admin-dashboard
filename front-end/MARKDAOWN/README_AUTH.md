# AdminDash - Authentication System

## Overview
AdminDash includes a complete modern authentication system with Sign In, Sign Up, and Password Recovery pages.

## Demo Accounts

You can test the application with these pre-configured accounts:

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### Regular User Account
- **Email:** jean@example.com
- **Password:** password123

## File Structure

```
HTML/
├── landing.html           # Home page with demo info
├── signin.html           # Sign In page
├── signup.html           # Sign Up page
├── forgot-password.html  # Password recovery page
├── index.html            # Dashboard (requires authentication)
├── utilisateurs.html     # Users management (requires authentication)
├── statistiques.html     # Statistics (requires authentication)
├── transactions.html     # Transactions (requires authentication)
└── parametres.html       # Settings (requires authentication)

CSS/
├── style.css             # Main styles and layout
├── components.css        # Reusable components
└── auth.css              # Authentication pages styling

SCRIPTS/
├── app.js               # Dashboard functionality and logout
└── auth.js              # Authentication utilities
```

## Feature Highlights

### 1. Sign In Page (`signin.html`)
- Email validation
- Password visibility toggle
- Remember me checkbox
- Forgot password link
- Inline error messages
- Smooth animations

### 2. Sign Up Page (`signup.html`)
- Full name input
- Email with duplicate check
- Password strength requirement (min 6 chars)
- Password confirmation matching
- Real-time validation
- Auto-redirect on success

### 3. Password Recovery (`forgot-password.html`)
- Email verification
- Security message for unregistered emails
- Success confirmation screen

### 4. Dashboard Pages
All dashboard pages now include:
- Authentication check (redirect to signin if not logged in)
- Logout button in top bar
- Session-based access control

## Authentication Flow

### Sign Up Flow
1. User visits landing page
2. Clicks "S'inscrire" (Sign Up)
3. Fills in full name, email, password, confirm password
4. Form validates all fields
5. New user stored in localStorage
6. Session created automatically
7. Redirects to dashboard

### Sign In Flow
1. User visits landing page
2. Clicks "Se connecter" (Sign In)
3. Enters email and password
4. Optional: Check "Remember me"
5. Credentials validated against stored users
6. Session created on successful login
7. Remember me preference saved
8. Redirects to dashboard

### Protected Routes
When users try to access dashboard pages without authentication:
- Automatic redirect to signin.html
- Dark mode preference preserved
- Session check before page loads

## localStorage Implementation

The system uses localStorage for data persistence:

### Session Storage
```javascript
// Created on successful login
localStorage.setItem('dashboard-session', JSON.stringify({
    userId: 'user_1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    loginTime: '2026-04-04T12:00:00Z'
}));
```

### Users Database
```javascript
// Array of user objects
localStorage.setItem('dashboard-users', JSON.stringify([
    {
        id: 'user_1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // Note: Never store plain text in production!
        role: 'admin',
        createdAt: '2026-04-04T00:00:00Z'
    }
]));
```

### Preferences
```javascript
// Dark mode preference
localStorage.setItem('dashboard-dark-mode', 'true' | 'false');

// Remember email
localStorage.setItem('dashboard-remember-email', 'user@email.com');
```

## Validation Rules

### Email
- Required field
- Must match email format (user@domain.com)

### Password (Sign In)
- Required field
- Minimum 6 characters

### Password (Sign Up)
- Required field
- Minimum 6 characters
- Must match confirmation field

### Full Name (Sign Up)
- Required field
- Minimum 3 characters

## Styling
- Uses shared CSS variables from style.css
- Modern gradient backgrounds
- Responsive design (mobile-first)
- Dark mode support
- Smooth animations and transitions
- Accessible form elements

## Security Notes

⚠️ **Warning:** This is a demonstration implementation using localStorage. 

For production use:
1. **Never store plain text passwords** - use bcrypt or similar
2. **Move authentication to backend** - use proper OAuth or JWT
3. **Use HTTPS** - encrypt all data in transit
4. **Implement proper session management** - use secure, httpOnly cookies
5. **Add CSRF protection** - implement token-based security
6. **Validate on backend** - client-side validation is not enough
7. **Rate limiting** - prevent brute force attacks
8. **Password requirements** - enforce stronger passwords

## Usage

### Starting the Application
1. Open `landing.html` in your browser
2. Use the demo accounts to test Sign In
3. Or create a new account via Sign Up
4. Access the dashboard
5. Use the Logout button to sign out

### Creating a Custom User
```javascript
// Programmatically add a new user
const users = JSON.parse(localStorage.getItem('dashboard-users') || '[]');
users.push({
    id: 'user_' + Date.now(),
    name: 'New User',
    email: 'new@example.com',
    password: 'password123',
    role: 'user',
    createdAt: new Date().toISOString()
});
localStorage.setItem('dashboard-users', JSON.stringify(users));
```

### Checking Authentication Status
```javascript
// Check if user is logged in
const session = localStorage.getItem('dashboard-session');
if (session) {
    const user = JSON.parse(session);
    console.log('Logged in as:', user.name);
}
```

### Logging Out Programmatically
```javascript
// Clear session and redirect
localStorage.removeItem('dashboard-session');
window.location.href = 'signin.html';
```

## Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Customization

### Change Demo Credentials
Edit `SCRIPTS/auth.js` - `initializeDemoUsers()` function

### Modify Validation Rules
Edit validation sections in signin.html and signup.html form handlers

### Update Color Scheme
Edit CSS variables in CSS/style.css and CSS/auth.css

### Add Additional Fields
Extend the user object schema in auth form submissions

## Support

For issues or improvements, check:
1. Browser console for error messages
2. localStorage contents (DevTools > Application > Local Storage)
3. Form validation messages on auth pages

## License

Part of AdminDash Admin Dashboard System
