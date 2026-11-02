/**
 * Application Initialization
 * Coordinates all startup logic and ensures no conflicts
 * 
 * Execution order:
 * 1. page-protection.js (runs first to check auth)
 * 2. This init.js (coordinates UI setup)
 * 3. Individual page scripts (dashboard.js, etc.)
 */

(function initializeApp() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupApp);
    } else {
        setupApp();
    }

    function setupApp() {
        console.log('🚀 Application Initializing...');

        // 1. Ensure page protection has already run
        // (it runs in head, before this script)

        // 2. Setup global state
        if (typeof window.globalState === 'undefined' && typeof GlobalState !== 'undefined') {
            window.globalState = new GlobalState();
            console.log('✓ Global state initialized:', window.globalState.state);
        }

        // 3. Setup theme
        setupTheme();

        // 4. Setup event listeners for auth changes
        setupAuthEventListeners();

        console.log('✓ App initialization complete');
    }

    /**
     * Setup theme based on preferences
     */
    function setupTheme() {
        const savedTheme = localStorage.getItem('dashboard-theme');
        const darkModeStored = localStorage.getItem('dashboard-dark-mode') === 'true';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const useDark = savedTheme === 'dark' ||
            (savedTheme === 'system' && prefersDark) ||
            (!savedTheme && darkModeStored);

        if (useDark) {
            document.documentElement.setAttribute('data-dark', 'true');
            document.body.classList.add('dark');
        } else {
            document.documentElement.removeAttribute('data-dark');
            document.body.classList.remove('dark');
        }

        // Update theme icons
        updateThemeIcons();
    }

    /**
     * Update theme toggle icons
     */
    function updateThemeIcons() {
        const isDarkMode = localStorage.getItem('dashboard-dark-mode') === 'true';
        const sunIcons = document.querySelectorAll('.theme-icon-sun');
        const moonIcons = document.querySelectorAll('.theme-icon-moon');

        sunIcons.forEach(icon => {
            icon.style.display = isDarkMode ? 'none' : 'block';
        });

        moonIcons.forEach(icon => {
            icon.style.display = isDarkMode ? 'block' : 'none';
        });
    }

    /**
     * Setup event listeners for auth state changes
     */
    function setupAuthEventListeners() {
        // Listen for storage events (auth changes in other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === (window.auth?.SESSION_KEY || 'dashboard-session')) {
                if (!e.newValue) {
                    // Session was cleared, redirect to signin
                    console.log('Auth session cleared, redirecting to signin');
                    // Don't redirect immediately, let page-protection handle it
                } else {
                    console.log('Auth session restored');
                }
            }
        });

        // Listen for auth events
        document.addEventListener('auth:login', () => {
            console.log('Auth:login event received');
        });

        document.addEventListener('auth:logout', () => {
            console.log('Auth:logout event received');
            // Redirect will be handled by page-protection on next interaction
        });
    }
})();
