/**
 * Global State Manager
 * Manages preview-mode and authenticated-mode transitions
 * Controls entire UI state synchronization
 */

function isAuthSessionActive() {
    return window.auth?.isLoggedIn ? window.auth.isLoggedIn() : false;
}

function getAuthSessionKey() {
    return window.auth?.SESSION_KEY || 'dashboard-session';
}

class GlobalStateManager {
    constructor() {
        this.state = {
            mode: this.detectMode(),
            isAuthenticated: this.checkAuth(),
            isDarkMode: this.loadDarkMode(),
            currentPage: this.detectPage(),
            sidebarExpanded: true,
            notifications: [],
            userData: null
        };
        
        this.init();
    }

    init() {
        this.applyState();
        this.setupStateListeners();
        this.setupKeyboardShortcuts();
        console.log('✓ Global State Manager Initialized', this.state);
    }

    /**
     * Detect current mode based on authentication
     */
    detectMode() {
        const isAuthenticated = isAuthSessionActive();
        return isAuthenticated ? 'authenticated-mode' : 'preview-mode';
    }

    /**
     * Check if user is authenticated
     */
    checkAuth() {
        return isAuthSessionActive();
    }

    /**
     * Load dark mode preference
     */
    loadDarkMode() {
        return localStorage.getItem('dashboard-dark-mode') === 'true';
    }

    /**
     * Detect current page
     */
    detectPage() {
        const path = window.location.pathname;
        if (path.includes('dashboard') || path === '/' || path === '/dashboard.html' || path.includes('index.html')) return 'dashboard';
        if (path.includes('users') || path.includes('utilisateurs')) return 'users';
        if (path.includes('statistics') || path.includes('statistiques')) return 'statistics';
        if (path.includes('transactions')) return 'transactions';
        if (path.includes('settings') || path.includes('parametres')) return 'settings';
        if (path.includes('preview')) return 'preview';
        if (path.includes('signin') || path.includes('login')) return 'signin';
        if (path.includes('signup')) return 'signup';
        return 'home';
    }

    /**
     * Apply current state to DOM
     */
    applyState() {
        const html = document.documentElement;
        
        // Apply mode
        html.setAttribute('data-mode', this.state.mode);
        html.setAttribute('data-authenticated', this.state.isAuthenticated);
        
        // Apply dark mode
        if (this.state.isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }

        // Hide/show preview mode elements
        this.updatePreviewElements();
        this.updateAuthenticatedElements();
        
        // Update data display
        if (this.state.isAuthenticated) {
            this.displayRealData();
        } else {
            this.displayMaskedData();
        }
    }

    /**
     * Update elements visible only in preview mode
     */
    updatePreviewElements() {
        const previewElements = document.querySelectorAll('[data-preview-only]');
        previewElements.forEach(el => {
            el.style.display = this.state.isAuthenticated ? 'none' : 'block';
        });
    }

    /**
     * Update elements visible only in authenticated mode
     */
    updateAuthenticatedElements() {
        const authElements = document.querySelectorAll('[data-auth-only]');
        authElements.forEach(el => {
            el.style.display = this.state.isAuthenticated ? 'block' : 'none';
        });
    }

    /**
     * Mask all data with XXX
     */
    displayMaskedData() {
        const maskElements = document.querySelectorAll('[data-maskable]');
        maskElements.forEach(el => {
            el.classList.add('data-masked');
            el.innerHTML = '<span class="mask-blur">XXX</span>';
        });
    }

    /**
     * Display real generated data
     */
    displayRealData() {
        const maskElements = document.querySelectorAll('[data-maskable]');
        maskElements.forEach(el => {
            el.classList.remove('data-masked');
            const dataKey = el.dataset.maskable;
            const realValue = this.generateValue(dataKey);
            
            // Animate number change
            this.animateNumberChange(el, realValue);
        });
    }

    /**
     * Generate realistic values
     */
    generateValue(key) {
        const values = {
            users: Math.floor(Math.random() * 500) + 1000,
            sales: Math.floor(Math.random() * 50000) + 10000,
            sessions: Math.floor(Math.random() * 100000) + 50000,
            revenue: Math.floor(Math.random() * 100000) + 10000,
            orders: Math.floor(Math.random() * 500) + 100,
            support: Math.floor(Math.random() * 50),
            growth: Math.floor(Math.random() * 30) - 10
        };
        
        return values[key] || 'XXX';
    }

    /**
     * Animate number changes
     */
    animateNumberChange(element, targetValue) {
        const startValue = 0;
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(startValue + (targetValue - startValue) * progress);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = targetValue;
            }
        };

        animate();
    }

    /**
     * Setup state listeners
     */
    setupStateListeners() {
        // Listen for auth changes
        window.addEventListener('storage', (e) => {
            if (e.key === getAuthSessionKey()) {
                this.state.isAuthenticated = isAuthSessionActive();
                this.state.mode = this.state.isAuthenticated ? 'authenticated-mode' : 'preview-mode';
                this.applyState();
                this.notifyStateChange();
            }
        });

        // Listen for custom auth events
        document.addEventListener('auth:login', () => {
            this.state.isAuthenticated = true;
            this.state.mode = 'authenticated-mode';
            this.applyState();
            this.notifyStateChange();
        });

        document.addEventListener('auth:logout', () => {
            this.state.isAuthenticated = false;
            this.state.mode = 'preview-mode';
            this.applyState();
            this.notifyStateChange();
        });

        // Also listen to unified auth event
        document.addEventListener('dashboard:auth-changed', () => {
            this.state.isAuthenticated = isAuthSessionActive();
            this.state.mode = this.state.isAuthenticated ? 'authenticated-mode' : 'preview-mode';
            this.applyState();
            this.notifyStateChange();
        });

        // Listen for theme changes
        document.addEventListener('theme:changed', (e) => {
            this.state.isDarkMode = e.detail.isDark;
            localStorage.setItem('dashboard-dark-mode', this.state.isDarkMode);
            this.applyState();
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'g' && e.ctrlKey) {
                e.preventDefault();
                window.location.href = '/HTML/index.html';
            }
            if (e.key === 'u' && e.ctrlKey) {
                e.preventDefault();
                window.location.href = '/HTML/utilisateurs.html';
            }
            if (e.key === 's' && e.ctrlKey) {
                e.preventDefault();
                window.location.href = '/HTML/parametres.html';
            }
        });
    }

    /**
     * Notify state change
     */
    notifyStateChange() {
        document.dispatchEvent(new CustomEvent('stateChanged', {
            detail: this.state
        }));
    }

    /**
     * Transition to authenticated mode
     */
    transitionToAuthenticated(userData) {
        if (window.auth && userData) {
            try {
                window.auth.saveSession(userData);
            } catch (error) {
                console.warn('Ignored invalid auth session data:', error);
            }
        }

        this.state.isAuthenticated = isAuthSessionActive();
        this.state.mode = this.state.isAuthenticated ? 'authenticated-mode' : 'preview-mode';
        this.state.userData = window.auth?.getCurrentUser ? window.auth.getCurrentUser() : null;
        
        document.documentElement.setAttribute('data-authenticated', String(this.state.isAuthenticated));
        document.documentElement.setAttribute('data-mode', this.state.mode);
        
        this.applyState();
        this.notifyStateChange();
    }

    /**
     * Transition to preview mode
     */
    transitionToPreview() {
        this.state.isAuthenticated = false;
        this.state.mode = 'preview-mode';
        this.state.userData = null;
        
        if (window.auth?.clearSession) {
            window.auth.clearSession();
        }
        document.documentElement.setAttribute('data-authenticated', 'false');
        document.documentElement.setAttribute('data-mode', 'preview-mode');
        
        this.applyState();
        this.notifyStateChange();
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        this.state.sidebarExpanded = !this.state.sidebarExpanded;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.stateManager = new GlobalStateManager();
    });
} else {
    window.stateManager = new GlobalStateManager();
}
