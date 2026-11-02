/**
 * AdminDash Platform - Unified System
 * Complete state management, routing, and global features
 * Handles preview-mode and authenticated-mode seamlessly
 */

// ============ CONFIGURATION & CONSTANTS ============
const CONFIG = {
    STORAGE_KEYS: {
        SESSION: 'dashboard-session',
        DARK_MODE: 'dashboard-dark-mode',
        THEME: 'dashboard-theme',
        SIDEBAR_COLLAPSED: 'dashboard-sidebar-collapsed'
    },
    ROUTES: {
        HOME: '/home',
        PREVIEW: '/preview',
        DASHBOARD: '/dashboard'
    },
    ANIMATION_DURATION: 150,
    DATA_ANIMATION_DURATION: 800
};

function getAuthSessionKey() {
    return window.auth?.SESSION_KEY || CONFIG.STORAGE_KEYS.SESSION;
}

function isAuthSessionActive() {
    return window.auth?.isLoggedIn ? window.auth.isLoggedIn() : false;
}

// ============ GLOBAL STATE MANAGEMENT ============
class GlobalState {
    constructor() {
        this.isAuthenticated = isAuthSessionActive();
        this.mode = this.isAuthenticated ? 'authenticated' : 'preview';
        this.isDarkMode = localStorage.getItem(CONFIG.STORAGE_KEYS.DARK_MODE) === 'true';
        this.sidebarCollapsed = localStorage.getItem(CONFIG.STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
        this.theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        this.listeners = [];
        this.init();
    }

    init() {
        this.applyMode();
        this.setupModeListeners();
    }

    applyMode() {
        const bodyClasses = ['preview-mode', 'authenticated-mode'];
        const activeClass = this.mode === 'authenticated' ? 'authenticated-mode' : 'preview-mode';
        
        bodyClasses.forEach(cls => document.body.classList.remove(cls));
        document.body.classList.add(activeClass);
        document.documentElement.setAttribute('data-mode', this.mode);
        
        // Update header elements visibility based on actual auth state
        this.updateHeaderElements();
    }

    updateHeaderElements() {
        const authButtonsContainer = document.querySelector('.auth-buttons-container');
        const profileSection = document.querySelector('.profile-section');
        
        if (this.mode === 'preview') {
            if (authButtonsContainer) authButtonsContainer.style.display = 'flex';
            if (profileSection) profileSection.style.display = 'none';
        } else {
            if (authButtonsContainer) authButtonsContainer.style.display = 'none';
            if (profileSection) profileSection.style.display = 'flex';
        }
    }

    setAuthenticated(value) {
        this.isAuthenticated = value;
        this.mode = value ? 'authenticated' : 'preview';
        this.applyMode();
        this.notifyListeners();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this));
    }

    setupModeListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === getAuthSessionKey()) {
                this.isAuthenticated = isAuthSessionActive();
                this.mode = this.isAuthenticated ? 'authenticated' : 'preview';
                this.applyMode();
            }
        });

        document.addEventListener('auth:login', () => {
            this.isAuthenticated = true;
            this.mode = 'authenticated';
            this.applyMode();
            this.notifyListeners();
        });

        document.addEventListener('auth:logout', () => {
            this.isAuthenticated = false;
            this.mode = 'preview';
            this.applyMode();
            this.notifyListeners();
        });

        document.addEventListener('dashboard:auth-changed', () => {
            this.isAuthenticated = isAuthSessionActive();
            this.mode = this.isAuthenticated ? 'authenticated' : 'preview';
            this.applyMode();
            this.notifyListeners();
        });
    }
}

// ============ DATA MASKING SYSTEM ============
class DataMasking {
    constructor(state) {
        this.state = state;
    }

    mask(value) {
        return this.state.mode === 'preview' ? 'XXX' : value;
    }

    maskNumber(value) {
        if (this.state.mode === 'preview') return 'XXX';
        return value.toLocaleString('fr-FR');
    }

    maskAmount(value) {
        if (this.state.mode === 'preview') return 'XXX €';
        return `${value.toLocaleString('fr-FR')} €`;
    }

    maskPercent(value) {
        if (this.state.mode === 'preview') return 'XXX%';
        return `${value}%`;
    }

    maskEmail(email) {
        if (this.state.mode === 'preview') return 'xxx@xxx.xxx';
        return email;
    }

    generateMaskedData(template) {
        const result = JSON.parse(JSON.stringify(template));
        return this.maskDataRecursive(result);
    }

    maskDataRecursive(obj) {
        if (this.state.mode === 'authenticated') return obj;
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.maskDataRecursive(item));
        }
        
        if (typeof obj === 'object' && obj !== null) {
            const masked = {};
            for (const key in obj) {
                if (typeof obj[key] === 'number') {
                    masked[key] = 'XXX';
                } else if (typeof obj[key] === 'object') {
                    masked[key] = this.maskDataRecursive(obj[key]);
                } else {
                    masked[key] = obj[key];
                }
            }
            return masked;
        }
        
        return obj;
    }
}

// ============ DATA GENERATOR ============
class DataGenerator {
    static generateUsers(count = 10) {
        const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Anne', 'Marc', 'Claire', 'Thomas', 'Nathalie'];
        const lastNames = ['Martin', 'Bernard', 'Dupont', 'Laurent', 'Simon', 'Michel', 'Garcia', 'David', 'Petit', 'Durand'];
        const roles = ['Admin', 'Modérateur', 'Utilisateur', 'Editeur'];
        const statuses = ['Actif', 'Inactif', 'Suspendu'];

        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
            email: `user${i + 1}@example.com`,
            role: roles[i % roles.length],
            status: statuses[i % statuses.length],
            joinDate: new Date(2024, Math.random() * 4, Math.random() * 28).toLocaleDateString('fr-FR'),
            activity: Math.floor(Math.random() * 100)
        }));
    }

    static generateChartData() {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
        return {
            labels: months,
            datasets: [{
                label: 'Revenus',
                data: [45000, 52000, 48000, 61000, 55000, 67000],
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderColor: '#0d6efd',
                borderWidth: 2
            }]
        };
    }

    static generateStatistics() {
        return {
            totalUsers: Math.floor(Math.random() * 10000) + 1000,
            activeToday: Math.floor(Math.random() * 2000) + 200,
            totalRevenue: Math.floor(Math.random() * 500000) + 50000,
            conversionRate: (Math.random() * 15 + 5).toFixed(1),
            avgSessionDuration: Math.floor(Math.random() * 10 + 3),
            bounceRate: (Math.random() * 40 + 20).toFixed(1)
        };
    }

    static generateTransactions(count = 8) {
        const types = ['Paiement', 'Refund', 'Transfert', 'Dépôt'];
        const statuses = ['Complété', 'En attente', 'Échoué'];

        return Array.from({ length: count }, (_, i) => ({
            id: `TRX-${1000 + i}`,
            type: types[i % types.length],
            amount: Math.floor(Math.random() * 5000) + 100,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
            status: statuses[i % statuses.length],
            user: `User ${i + 1}`
        }));
    }

    static generateActivityFeed(count = 5) {
        const actions = [
            'Nouvel utilisateur créé',
            'Rapport généré',
            'Problème de sécurité détecté',
            'Transaction complétée',
            'Paramètres mis à jour'
        ];
        const icons = ['👤', '📄', '⚠️', '💳', '⚙️'];

        return Array.from({ length: count }, (_, i) => ({
            action: actions[i % actions.length],
            icon: icons[i % icons.length],
            timestamp: new Date(Date.now() - i * 5 * 60 * 1000).toLocaleTimeString('fr-FR'),
            user: `Utilisateur ${i + 1}`
        }));
    }

    static generateKPIs() {
        return {
            users: Math.floor(Math.random() * 50000) + 10000,
            revenue: Math.floor(Math.random() * 500000) + 100000,
            transactions: Math.floor(Math.random() * 10000) + 1000,
            growth: (Math.random() * 50 + 10).toFixed(1)
        };
    }
}

// ============ ANIMATION UTILITIES ============
class AnimationUtils {
    static animateNumber(element, finalValue, duration = CONFIG.DATA_ANIMATION_DURATION) {
        const startValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const increment = (finalValue - startValue) / (duration / 16);
        let currentValue = startValue;

        const interval = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(interval);
            }
            element.textContent = Math.floor(currentValue).toLocaleString('fr-FR');
        }, 16);
    }

    static transitionData(fromData, toData, callback) {
        const startTime = Date.now();
        const duration = CONFIG.DATA_ANIMATION_DURATION;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress === 1) {
                callback(toData);
            } else {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    static smoothReveal(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.offsetHeight; // Trigger reflow
        element.style.transition = `opacity ${CONFIG.ANIMATION_DURATION}ms ease, transform ${CONFIG.ANIMATION_DURATION}ms ease`;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }
}

// ============ SIDEBAR MANAGEMENT ============
class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.init();
    }

    init() {
        this.restoreState();
        this.setupEventListeners();
        this.setupCollapsedTooltips();
    }

    setupEventListeners() {
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (this.sidebarClose) {
            this.sidebarClose.addEventListener('click', () => this.closeMobileSidebar());
        }

        // Close sidebar on link click (mobile)
        if (this.sidebar) {
            this.sidebar.addEventListener('click', (e) => {
                if (e.target.closest('.sidebar__link') && window.innerWidth <= 900) {
                    this.closeMobileSidebar();
                }
            });
        }
    }

    toggleSidebar() {
        if (window.innerWidth <= 900) {
            document.body.classList.toggle('mobile-menu-open');
        } else {
            this.sidebar.classList.toggle('collapsed');
            localStorage.setItem(CONFIG.STORAGE_KEYS.SIDEBAR_COLLAPSED, 
                this.sidebar.classList.contains('collapsed'));
        }
    }

    closeMobileSidebar() {
        document.body.classList.remove('mobile-menu-open');
    }

    restoreState() {
        const isCollapsed = localStorage.getItem(CONFIG.STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
        if (isCollapsed && window.innerWidth > 900) {
            this.sidebar.classList.add('collapsed');
        }
    }

    setupCollapsedTooltips() {
        const links = this.sidebar.querySelectorAll('.sidebar__link');
        links.forEach(link => {
            const label = link.getAttribute('data-label');
            if (label) {
                link.setAttribute('title', label);
            }
        });
    }
}

// ============ PROTECTED ACTIONS ============
class ProtectedActionManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupProtectedActions();
    }

    setupProtectedActions() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-protected]')) {
                if (!isAuthSessionActive()) {
                    e.preventDefault();
                    if (typeof showToast === 'function') {
                        showToast('Veuillez vous connecter pour utiliser cette fonction', 'warning');
                    }
                    window.location.href = '/HTML/signin.html';
                }
            }
        });
    }
}

// ============ TOAST NOTIFICATION SYSTEM ============
window.showToast = function(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.style.cssText = `
        background: ${getToastColor(type)};
        color: white;
        padding: 1rem 1.2rem;
        border-radius: 0.875rem;
        box-shadow: 0 10px 24px rgba(0,0,0,0.15);
        animation: slideInRight 300ms ease-out;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 300ms ease-in';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

function getToastColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#0d6efd'
    };
    return colors[type] || colors.info;
}

// ============ SEARCH SYSTEM ============
class SearchManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupSearchInput();
        this.setupKeyboardShortcuts();
    }

    setupSearchInput() {
        const searchInput = document.getElementById('globalSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 0) {
                this.performSearch(query);
            }
        });

        // Focus search with "/"
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && e.target !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    performSearch(query) {
        const pages = [
            { title: 'Tableau de bord', url: '/HTML/index.html', icon: '📊' },
            { title: 'Utilisateurs', url: '/HTML/utilisateurs.html', icon: '👥' },
            { title: 'Statistiques', url: '/HTML/statistiques.html', icon: '📈' },
            { title: 'Transactions', url: '/HTML/transactions.html', icon: '💳' },
            { title: 'Paramètres', url: '/HTML/parametres.html', icon: '⚙️' }
        ];

        const results = pages.filter(p => p.title.toLowerCase().includes(query));
        // Results will be displayed by the search UI
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                if (e.key === 'g') {
                    e.preventDefault();
                    window.location.href = '/HTML/index.html';
                }
                if (e.key === 'u') {
                    e.preventDefault();
                    window.location.href = '/HTML/utilisateurs.html';
                }
                if (e.key === 's') {
                    e.preventDefault();
                    window.location.href = '/HTML/parametres.html';
                }
            }
        });
    }
}

// ============ THEME MANAGER ============
class ThemeManager {
    constructor(state) {
        this.state = state;
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupThemeToggle();
    }

    applyTheme() {
        if (this.state.isDarkMode) {
            document.body.classList.add('dark');
            document.documentElement.setAttribute('data-dark', 'true');
        } else {
            document.body.classList.remove('dark');
            document.documentElement.removeAttribute('data-dark');
        }
    }

    toggleTheme() {
        this.state.isDarkMode = !this.state.isDarkMode;
        localStorage.setItem(CONFIG.STORAGE_KEYS.DARK_MODE, this.state.isDarkMode);
        this.applyTheme();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// ============ MODAL MANAGEMENT ============
// NOTE: Modal management is now handled by modal-system.js
// Do NOT initialize modal handling here - it will conflict
class ModalManager {
    static closeAll() {
        // Delegate to modal-system.js if available
        if (window.modalManager && typeof window.modalManager.closeAll === 'function') {
            window.modalManager.closeAll();
            return;
        }
        document.querySelectorAll('.modal__overlay:not([hidden])').forEach(overlay => {
            overlay.hidden = true;
        });
    }

    static setup() {
        // Modal setup is now handled by modal-system.js
        // This is deprecated
        console.log('ModalManager.setup() is deprecated - modal handling is in modal-system.js');
    }
}

// ============ INITIALIZATION ============
function initializeApp() {
    // Create global state
    window.globalState = new GlobalState();
    window.dataMasking = new DataMasking(window.globalState);

    // Initialize managers
    new SidebarManager();
    new ProtectedActionManager();
    new SearchManager();
    new ThemeManager(window.globalState);
    // NOTE: Modal management is now handled by modal-system.js
    // Do NOT call ModalManager.setup() here to avoid conflicts

    // Add CSS animations
    addAnimationStyles();
}

function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for use in other modules
window.GlobalState = GlobalState;
window.DataMasking = DataMasking;
window.DataGenerator = DataGenerator;
window.AnimationUtils = AnimationUtils;
window.ProtectedActionManager = ProtectedActionManager;
window.SidebarManager = SidebarManager;
window.SearchManager = SearchManager;
window.ThemeManager = ThemeManager;
window.ModalManager = ModalManager;
