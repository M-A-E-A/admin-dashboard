# Global State Management Quick Reference
## Preview Mode & Authenticated Mode System

---

## ⚡ Quick Start

### Check Current State
```javascript
const isPreview = document.documentElement.getAttribute('data-preview-mode') === 'true';
const isAuth = document.documentElement.getAttribute('data-authenticated') === 'true';

console.log('Preview Mode:', isPreview);
console.log('Authenticated:', isAuth);
```

### Trigger State Change
```javascript
// Sign in user
localStorage.setItem('dashboard-session', 'user@example.com');
document.dispatchEvent(new Event('dashboard:auth-changed'));

// Sign out user
localStorage.removeItem('dashboard-session');
document.dispatchEvent(new Event('dashboard:auth-changed'));
```

---

## 🎨 CSS Attribute Selectors

### Preview Mode Styling
```css
/* Show only in preview mode */
html[data-preview-mode="true"] .auth-buttons-container {
    display: flex;
}

/* Hide in preview mode */
html[data-preview-mode="true"] .profile-avatar {
    display: none;
}

/* Make interactive but dimmed in preview */
html[data-preview-mode="true"] [data-requires-auth] {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
}

/* Blur sensitive data in preview */
html[data-preview-mode="true"] .preview-blur {
    filter: blur(4px);
    user-select: none;
}
```

### Authenticated Mode Styling
```css
/* Hide in authenticated mode */
html[data-authenticated="true"] .auth-buttons-container {
    display: none;
}

/* Show only in authenticated mode */
html[data-authenticated="true"] .profile-avatar {
    display: flex;
}

/* Enable interactivity in authenticated mode */
html[data-authenticated="true"] [data-requires-auth] {
    opacity: 1;
    pointer-events: auto;
    cursor: pointer;
}

/* Remove blur in authenticated mode */
html[data-authenticated="true"] .preview-blur {
    filter: none;
    user-select: auto;
    pointer-events: auto;
}
```

---

## 📝 Data Attributes

### Apply to Elements

```html
<!-- Only show in authenticated mode -->
<div data-auth-only>Real Data Here</div>

<!-- Only show in preview mode -->
<div data-preview-only>Preview Message</div>

<!-- Require authentication -->
<button data-requires-auth>Delete User</button>

<!-- Modifies data (will be disabled in preview) -->
<button data-modifies-data>Save Changes</button>

<!-- Sensitive data - will be blurred in preview -->
<p class="preview-blur">€ 24,500</p>
```

---

## 🔄 State Synchronization Flow

```
User Action (Sign In/Out)
    ↓
localStorage changes
    ↓
dispatch 'dashboard:auth-changed' event
    ↓
GlobalStateManager.setupStateListeners() catches event
    ↓
Call syncGlobalState()
    ↓
Set data-preview-mode OR data-authenticated attribute
    ↓
CSS attribute selectors trigger
    ↓
UI updates (150ms transitions)
    ↓
No page reload required ✨
```

---

## 🛠️ GlobalStateManager API

### Constructor
```javascript
const stateManager = new GlobalStateManager();
```

### Properties
```javascript
stateManager.isPreviewMode    // boolean
stateManager.isAuthenticated  // boolean
```

### Methods

#### syncGlobalState()
Synchronizes entire UI to current state
```javascript
stateManager.syncGlobalState();
```

#### syncPreviewMode()
Applies preview mode specific changes
```javascript
stateManager.syncPreviewMode();
```

#### syncAuthenticatedMode()
Applies authenticated mode specific changes
```javascript
stateManager.syncAuthenticatedMode();
```

#### setupStateListeners()
Listens for state changes from other tabs
```javascript
stateManager.setupStateListeners();
```

#### setupQuickActionsSidebar()
Injects quick action buttons into sidebar
```javascript
stateManager.setupQuickActionsSidebar();
```

---

## 🎯 Common Use Cases

### 1. Add Preview-Only Element

```html
<!-- In HTML -->
<div data-preview-only>
    <p>Welcome! Sign in to see real data.</p>
</div>
```

```css
/* In CSS (optional - element hidden by default) */
html[data-preview-mode="false"] [data-preview-only] {
    display: none;
}
```

### 2. Add Auth-Only Element

```html
<!-- In HTML -->
<div data-auth-only>
    <button>Export Report</button>
</div>
```

```css
/* In CSS (optional - element shown by default) */
html[data-authenticated="false"] [data-auth-only] {
    display: none;
}
```

### 3. Disable Destructive Actions in Preview

```html
<!-- In HTML -->
<button class="btn btn--danger" data-requires-auth>
    Delete User
</button>
```

```css
/* In CSS */
html[data-preview-mode="true"] [data-requires-auth] {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
}

html[data-preview-mode="true"] [data-requires-auth]::after {
    content: "Sign in required";
    position: absolute;
    font-size: 0.75rem;
    background: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
}
```

### 4. Blur Sensitive Numbers

```html
<!-- In HTML -->
<div class="preview-blur">
    <strong>€ 47,250</strong> Revenue
</div>
```

```css
/* In CSS */
.preview-blur {
    transition: filter 150ms ease-out;
}

html[data-preview-mode="true"] .preview-blur {
    filter: blur(4px);
    user-select: none;
}

html[data-authenticated="true"] .preview-blur {
    filter: none;
}
```

### 5. Respond to State Changes

```javascript
// Listen for state changes
document.addEventListener('dashboard:auth-changed', () => {
    const isAuth = !!localStorage.getItem('dashboard-session');
    console.log('Auth state changed. Authenticated:', isAuth);
    
    // Custom logic here
    if (isAuth) {
        loadUserData();
    } else {
        clearSensitiveData();
    }
});
```

---

## 🔍 Debugging

### Check Current State
```javascript
// Check what mode we're in
const preview = document.documentElement.getAttribute('data-preview-mode');
const auth = document.documentElement.getAttribute('data-authenticated');

console.log({ preview, auth });
```

### Check Storage
```javascript
// View all stored data
console.log('Session:', localStorage.getItem('dashboard-session'));
console.log('Dark Mode:', localStorage.getItem('dashboard-dark-mode'));
console.log('Theme:', localStorage.getItem('dashboard-theme'));
```

### Simulate State Changes
```javascript
// Simulate preview mode
document.documentElement.setAttribute('data-preview-mode', 'true');
document.documentElement.removeAttribute('data-authenticated');

// Simulate authenticated mode  
document.documentElement.removeAttribute('data-preview-mode');
document.documentElement.setAttribute('data-authenticated', 'true');
```

### Monitor State Manager
```javascript
// Access global instance (created on DOMContentLoaded)
window.stateManager = new GlobalStateManager();

// Check state
console.log(window.stateManager.isPreviewMode);
console.log(window.stateManager.isAuthenticated);
```

---

## ⚙️ Configuration

### Modify Transition Speed

```css
/* In style.css */
:root {
    --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    /* Change 150ms to any value for faster/slower transitions */
}
```

### Customize Blur Amount

```css
html[data-preview-mode="true"] .preview-blur {
    filter: blur(4px);  /* Change 4px to any value */
}
```

### Adjust Opacity for Disabled Elements

```css
html[data-preview-mode="true"] [data-requires-auth] {
    opacity: 0.6;  /* Change 0.6 to any value 0-1 */
}
```

---

## 📋 Implementation Checklist

### For New Components

- [ ] Add `data-auth-only` if component requires authentication
- [ ] Add `data-preview-only` if component only shows in preview
- [ ] Add `data-requires-auth` if action requires authentication
- [ ] Add `.preview-blur` if data should be hidden in preview
- [ ] Add `data-modifies-data` if action modifies database
- [ ] Add CSS transitions for 150ms smooth changes
- [ ] Test in both preview and authenticated modes
- [ ] Test mobile responsive behavior
- [ ] Test theme switching (light/dark)
- [ ] Test keyboard navigation

### For Styling

- [ ] Use CSS attribute selectors, not JavaScript classes
- [ ] Prefer `display` for visibility (saves layout reflow)
- [ ] Use `filter: blur()` for sensitive data
- [ ] Use `opacity` for disabled elements
- [ ] All transitions should be 150ms
- [ ] Dark mode support via CSS variables
- [ ] Test all color combinations

---

## 🐛 Troubleshooting

### UI Not Updating After Sign In

**Problem:** Page still shows preview mode UI after authentication

**Solution:**
```javascript
// Force state sync
const event = new Event('dashboard:auth-changed');
document.dispatchEvent(event);

// OR manual update
document.documentElement.setAttribute('data-authenticated', 'true');
document.documentElement.removeAttribute('data-preview-mode');
```

### Elements Not Responding to State

**Problem:** Elements with data-* attributes not showing/hiding

**Solution:**
1. Check CSS attribute selector syntax:
   ```css
   html[data-preview-mode="true"] .element { /* correct */ }
   div[data-preview-mode] .element { /* wrong - checking wrong element */ }
   ```

2. Verify attribute is present:
   ```javascript
   console.log(document.documentElement.getAttribute('data-preview-mode'));
   ```

3. Check CSS specificity isn't being overridden:
   ```css
   /* Increase specificity if needed */
   html[data-preview-mode="true"] .element.custom { /* more specific */ }
   ```

### Cross-Tab State Not Syncing

**Problem:** Sign out in one tab doesn't update other tabs

**Solution:**
```javascript
// Error: might not be listening properly
// Check that setupStateListeners() was called

// Force manual check every 2 seconds as fallback
setInterval(() => {
    const hasSession = !!localStorage.getItem('dashboard-session');
    const isPreview = document.documentElement.getAttribute('data-preview-mode') === 'true';
    
    // Update if mismatch
    if (hasSession !== !isPreview) {
        document.dispatchEvent(new Event('dashboard:auth-changed'));
    }
}, 2000);
```

---

## 📚 Related Files

### Updated Files
- `CSS/style.css` - Global state management CSS
- `SCRIPTS/app.js` - GlobalStateManager class
- All HTML pages - Header/sidebar structure

### Reference Documentation  
- `COMPLETE_INTERFACE_UPDATE.md` - Full implementation guide
- `QUICK_START.md` - Getting started guide
- `UPGRADE_GUIDE.md` - Detailed feature documentation

---

## 🚀 Performance Tips

1. **Use CSS attribute selectors** instead of JavaScript classes
   - Faster: CSS engine processes selectors natively
   - Cleaner: Separates styling from state

2. **Minimize reflows** using `display: none` for visibility
   - Avoid `visibility: hidden` (still takes up space)
   - Avoid `height: 0` (causes layout thrashing)

3. **Use `transform`** for animations if possible
   - GPU-accelerated
   - No reflow/repaint
   - Smooth 60fps performance

4. **Batch DOM updates** in JavaScript
   - Collect all changes first
   - Apply in single operation
   - Use `requestAnimationFrame` for timing

---

**Document Version:** 1.0  
**Last Updated:** April 5, 2025  
**Quick Reference For:** Developers maintaining the AdminDash interface
