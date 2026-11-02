const AUTH_SESSION_KEY = 'dashboard-session';
const AUTH_DASHBOARD_PAGE = '/HTML/index.html';
const AUTH_API_BASE_URL = getApiBaseUrl();

function getApiBaseUrl() {
    if (window.API_BASE_URL && typeof window.API_BASE_URL === 'string') {
        return window.API_BASE_URL;
    }

    return 'http://localhost:5000';
}

function normalizeSession(session) {
    const payload = session?.data ?? session ?? {};
    const user = payload.user ?? payload;
    const token = payload.token ?? payload.accessToken ?? user.token ?? user.accessToken ?? null;

    if (!token) {
        return null;
    }

    return {
        id: user.id ?? user._id ?? payload.id ?? null,
        name: user.name ?? user.fullName ?? payload.name ?? '',
        email: user.email ?? payload.email ?? '',
        role: user.role ?? payload.role ?? 'Utilisateur',
        token: String(token),
    };
}

function getStoredSession() {
    try {
        const rawSession = localStorage.getItem(AUTH_SESSION_KEY);
        if (!rawSession) {
            return null;
        }

        const session = normalizeSession(JSON.parse(rawSession));
        if (!session) {
            localStorage.removeItem(AUTH_SESSION_KEY);
            return null;
        }

        return session;
    } catch {
        localStorage.removeItem(AUTH_SESSION_KEY);
        return null;
    }
}

function getToken() {
    const session = getStoredSession();
    return typeof session?.token === 'string' && session.token.trim() ? session.token : null;
}

function getAuthToken() {
    return getToken();
}

function getCurrentUser() {
    const session = getStoredSession();
    if (!session) {
        return null;
    }

    return {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
    };
}

function saveSession(session) {
    // Accept either the backend response object ({ success, data })
    // or the raw session object ({ id, name, email, token }).
    const userSession = normalizeSession(session);
    if (!userSession) {
        throw new Error('Authentication response did not include an auth token.');
    }
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userSession));
    // Emit both the modern event and legacy events for compatibility
    document.dispatchEvent(new Event('dashboard:auth-changed'));
    document.dispatchEvent(new Event('auth:login'));
    return userSession;
}

function clearSession() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    document.dispatchEvent(new Event('dashboard:auth-changed'));
    document.dispatchEvent(new Event('auth:logout'));
}

function isLoggedIn() {
    return !!getAuthToken();
}

function logout(redirectTo = '/HTML/signin.html') {
    clearSession();
    window.location.href = redirectTo;
}

function getDashboardPage() {
    return AUTH_DASHBOARD_PAGE;
}

function redirectToDashboard() {
    window.location.href = getDashboardPage();
}

async function apiRequest(path, options = {}) {
    const { method = 'GET', body, authenticated = false } = options;
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    if (authenticated) {
        const token = getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.message || 'Une erreur est survenue.');
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
}

async function authLogin(email, password) {
    return apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
    });
}

async function authRegister(name, email, password) {
    return apiRequest('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
    });
}

async function authResetPassword(email, password) {
    return apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: { email, password },
    });
}

async function fetchCurrentUser() {
    const res = await apiRequest('/api/auth/me', { authenticated: true });
    return res?.data ?? res;
}

async function updateProfile(updates) {
    const session = getStoredSession();
    const userId = session?.id;
    if (!userId) {
        throw new Error('User ID not found in session');
    }
    const res = await apiRequest(`/api/users/${userId}`, {
        method: 'PUT',
        authenticated: true,
        body: updates,
    });
    return res?.data ?? res;
}

async function fetchUsers() {
    const res = await apiRequest('/api/users', { authenticated: true });
    return res?.data ?? res;
}

async function createUser(user) {
    let res;
    try {
        res = await apiRequest('/api/users', {
            method: 'POST',
            authenticated: true,
            body: user,
        });
    } catch (error) {
        if (error.status !== 404 && !String(error.message || '').includes('/api/users')) {
            throw error;
        }

        // Compatibility fallback for older demo backend builds that only expose register.
        res = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: {
                name: user.name,
                email: user.email,
                password: user.password || 'Demo1234',
            },
        });
    }
    return res?.data ?? res;
}

async function fetchDashboardStats() {
    const res = await apiRequest('/api/stats', { authenticated: true });
    return res?.data ?? res;
}

async function fetchTransactions() {
    const res = await apiRequest('/api/transactions', { authenticated: true });
    return res?.data ?? res;
}

async function createTransaction(transaction) {
    return apiRequest('/api/transactions', {
        method: 'POST',
        authenticated: true,
        body: transaction,
    });
}

window.auth = {
    SESSION_KEY: AUTH_SESSION_KEY,
    DASHBOARD_PAGE: AUTH_DASHBOARD_PAGE,
    getApiBaseUrl,
    getStoredSession,
    getToken,
    getAuthToken,
    getCurrentUser,
    isLoggedIn,
    saveSession,
    clearSession,
    logout,
    getDashboardPage,
    redirectToDashboard,
    authLogin,
    authRegister,
    authResetPassword,
    fetchCurrentUser,
    updateProfile,
    fetchUsers,
    createUser,
    fetchDashboardStats,
    fetchTransactions,
    createTransaction,
};
