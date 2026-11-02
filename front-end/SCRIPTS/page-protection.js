(function initializePageProtection() {
    const DASHBOARD_PAGE = window.auth?.DASHBOARD_PAGE || '/HTML/index.html';
    const SIGNIN_PAGE = '/HTML/signin.html';
    const SIGNIN_FILENAME = 'signin.html';
    const SIGNUP_FILENAME = 'signup.html';

    const PUBLIC_PAGES = [
        'signin.html',
        'signup.html',
        'preview.html'
    ];

    const PROTECTED_PAGES = [
        'index.html',
        'parametres.html',
        'transactions.html',
        'utilisateurs.html',
        'statistiques.html'
    ];

    const LEGACY_DASHBOARD_PAGE = 'dashboard.html';

    function getCurrentPage() {
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop() || 'index.html';
        return filename;
    }

    function isAuthenticated() {
        return window.auth?.isLoggedIn?.() === true;
    }

    function clearInvalidSession() {
        window.auth?.clearSession?.();
    }

    function redirectToDashboard() {
        if (window.auth && typeof window.auth.redirectToDashboard === 'function') {
            window.auth.redirectToDashboard();
        } else {
            window.location.replace(DASHBOARD_PAGE);
        }
    }

    function redirectToSignIn() {
        window.location.replace(SIGNIN_PAGE);
    }

    function checkPageAccess() {
        const currentPage = getCurrentPage();
        const authenticated = isAuthenticated();

        if (currentPage === LEGACY_DASHBOARD_PAGE) {
            if (!authenticated) {
                clearInvalidSession();
                redirectToSignIn();
                return;
            }

            redirectToDashboard();
            return;
        }

        if (PROTECTED_PAGES.includes(currentPage) && !authenticated) {
            clearInvalidSession();
            redirectToSignIn();
            return;
        }

        if ((currentPage === SIGNIN_FILENAME || currentPage === SIGNUP_FILENAME) && authenticated) {
            redirectToDashboard();
            return;
        }

        if (PUBLIC_PAGES.includes(currentPage)) {
            return;
        }
    }

    checkPageAccess();

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkPageAccess();
        }
    });
})();
