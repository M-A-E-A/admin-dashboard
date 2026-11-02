/**
 * Advanced Dashboard Application
 * Modern admin dashboard with comprehensive features
 * Includes search, notifications, keyboard shortcuts, toast notifications, etc.
 */

// ============ CONSTANTS ============
const STORAGE_KEY_DARKMODE = 'dashboard-dark-mode';
const STORAGE_KEY_THEME = 'dashboard-theme';
const NOTIFICATION_STORAGE_KEY = 'dashboard-notifications';
const SEARCH_STORAGE_KEY = 'dashboard-search-history';

function getAuthSessionKey() {
    return window.auth?.SESSION_KEY || 'dashboard-session';
}

function isAuthSessionActive() {
    return window.auth?.isLoggedIn ? window.auth.isLoggedIn() : false;
}

function getCurrentAuthUser() {
    return window.auth?.getCurrentUser ? window.auth.getCurrentUser() : null;
}

// ============ DOM ELEMENTS ============
const app = document.getElementById('app');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const modalOverlay = document.getElementById('modalOverlay');
const editUserForm = document.getElementById('editUserForm');
const confirmDialogOverlay = document.getElementById('confirmDialogOverlay');

// ============ THEME SYSTEM ============
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
        this.isDarkMode = localStorage.getItem(STORAGE_KEY_DARKMODE) === 'true';
        this.init();
    }

    init() {
        this.setupThemeToggle();
        this.apply();
    }

   setupThemeToggle() {
        const themeToggleBtn = document.getElementById('themeToggle');
        const themeMenu = document.getElementById('themeMenu');
        const themeMenuItems = document.querySelectorAll('.theme-menu-item');
        const darkModeToggle = document.getElementById('darkModeToggle');

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (themeMenu) themeMenu.hidden = !themeMenu.hidden;
            });
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                const nextTheme = this.isDarkMode ? 'light' : 'dark';
                this.setTheme(nextTheme);
            });
        }

        themeMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                const theme = item.dataset.theme;
                this.setTheme(theme);
                if (themeMenu) themeMenu.hidden = true;
            });
        });
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem(STORAGE_KEY_THEME, theme);

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setDarkMode(prefersDark);
        } else {
            this.setDarkMode(theme === 'dark');
        }
    }

    setDarkMode(isDark) {
        this.isDarkMode = isDark;
        localStorage.setItem(STORAGE_KEY_DARKMODE, isDark ? 'true' : 'false');
        
        if (isDark) {
            document.body.classList.add('dark');
            document.documentElement.setAttribute('data-dark', 'true');
        } else {
            document.body.classList.remove('dark');
            document.documentElement.removeAttribute('data-dark');
        }
        this.updateThemeIcons();
    }

    updateThemeIcons() {
        const sunIcon = document.querySelector('.theme-icon-sun');
        const moonIcon = document.querySelector('.theme-icon-moon');
        
        if (this.isDarkMode) {
            sunIcon?.style.setProperty('display', 'block');
            moonIcon?.style.setProperty('display', 'none');
        } else {
            sunIcon?.style.setProperty('display', 'none');
            moonIcon?.style.setProperty('display', 'block');
        }
    }

    apply() {
        if (this.currentTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setDarkMode(prefersDark);
        } else {
            this.setDarkMode(this.isDarkMode);
        }
    }
}

// ============ NOTIFICATION SYSTEM ============
class NotificationManager {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY)) || [];
        this.init();
    }

    init() {
        this.setupNotificationUI();
    }

    setupNotificationUI() {
        const notificationBell = document.getElementById('notificationBell');
        const notificationDropdown = document.getElementById('notificationDropdown');
        const clearNotificationsBtn = document.getElementById('clearNotifications');

        if (notificationBell) {
            notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.hidden = !notificationDropdown.hidden;
            });
        }

        if (clearNotificationsBtn) {
            clearNotificationsBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }

        document.addEventListener('click', () => {
            if (notificationDropdown) notificationDropdown.hidden = true;
        });

        this.updateBadge();
    }

    addNotification(title, subtitle, icon = '!') {
        const notification = {
            id: Date.now(),
            title,
            subtitle,
            icon,
            time: new Date().toLocaleTimeString('fr-FR')
        };

        this.notifications.unshift(notification);
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(this.notifications));
        this.updateBadge();
        this.renderNotifications();
    }

    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.notifications.length;
        }
    }

    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        notificationList.innerHTML = '';
        this.notifications.slice(0, 5).forEach(notif => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `
                <div class="notification-icon">${notif.icon}</div>
                <div class="notification-content">
                    <p class="notification-title">${notif.title}</p>
                    <p class="notification-time">${this.getTimeAgo(notif.time)}</p>
                </div>
            `;
            notificationList.appendChild(item);
        });
    }

    clearAll() {
        this.notifications = [];
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(this.notifications));
        this.updateBadge();
        this.renderNotifications();
    }

    getTimeAgo(time) {
        const now = new Date();
        const notifTime = new Date(time);
        const diff = Math.floor((now - notifTime) / 1000);

        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        return `Il y a ${Math.floor(diff / 86400)}j`;
    }
}

// ============ GLOBAL SEARCH SYSTEM ============
class SearchManager {
    constructor() {
        this.searchHistory = JSON.parse(localStorage.getItem(SEARCH_STORAGE_KEY)) || [];
        this.init();
    }

    init() {
        this.setupSearchInput();
        this.setupKeyboardShortcuts();
    }

    setupSearchInput() {
        const searchInput = document.getElementById('globalSearch');
        const searchResults = document.getElementById('searchResults');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                
                if (query.length > 0) {
                    this.performSearch(query);
                    if (searchResults) searchResults.hidden = false;
                } else {
                    if (searchResults) searchResults.hidden = true;
                }
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.blur();
                    searchResults.hidden = true;
                }
                if (e.key === 'Enter') {
                    const query = searchInput.value.toLowerCase().trim();
                    if (query) {
                        this.addToHistory(query);
                        showToast(`Recherche: "${query}"`, 'info');
                    }
                }
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Focus search with "/"
            if (e.key === '/' && e.target !== document.getElementById('globalSearch')) {
                e.preventDefault();
                document.getElementById('globalSearch')?.focus();
            }

            // Keyboard shortcuts for navigation
            if (e.ctrlKey || e.metaKey) {
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

    performSearch(query) {
        const searchResults = document.getElementById('searchResults');
        const results = this.getSearchResults(query);

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">Aucun résultat trouvé</div>';
            return;
        }

        searchResults.innerHTML = results.map(result => `
            <a href="${result.url}" class="search-result-item">
                <span class="search-result-icon">${result.icon}</span>
                <div class="search-result-content">
                    <p class="search-result-title">${result.title}</p>
                    <p class="search-result-desc">${result.desc}</p>
                </div>
            </a>
        `).join('');
    }

    getSearchResults(query) {
        const pages = [
            { title: 'Tableau de bord', url: '/HTML/index.html', icon: '📊', desc: 'Vue d\'ensemble des statistiques' },
            { title: 'Utilisateurs', url: '/HTML/utilisateurs.html', icon: '👥', desc: 'Gestion des utilisateurs' },
            { title: 'Statistiques', url: '/HTML/statistiques.html', icon: '📈', desc: 'Graphiques et analyses' },
            { title: 'Transactions', url: '/HTML/transactions.html', icon: '💳', desc: 'Historique des transactions' },
            { title: 'Paramètres', url: '/HTML/parametres.html', icon: '⚙️', desc: 'Configuration du compte' }
        ];

        return pages.filter(page =>
            page.title.toLowerCase().includes(query) ||
            page.desc.toLowerCase().includes(query)
        );
    }

    addToHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10);
            localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(this.searchHistory));
        }
    }
}

// ============ TOAST NOTIFICATION SYSTEM ============
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast--visible');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('toast--visible');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============ SIDEBAR MANAGEMENT ============
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('.main');
    const topbar = document.querySelector('.topbar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                // Mobile: dim page and add shadow to topbar instead of showing sidebar
                const isOpen = document.body.classList.contains('mobile-menu-open');
                if (isOpen) {
                    document.body.classList.remove('mobile-menu-open');
                    main.style.opacity = '';
                    topbar.classList.remove('mobile-shadow');
                } else {
                    document.body.classList.add('mobile-menu-open');
                    main.style.opacity = '0.5';
                    topbar.classList.add('mobile-shadow');
                }
            } else {
                sidebar.classList.toggle('collapsed');
                localStorage.setItem('dashboard-sidebar-collapsed', sidebar.classList.contains('collapsed'));
            }
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                document.body.classList.remove('mobile-menu-open');
                main.style.opacity = '';
                topbar.classList.remove('mobile-shadow');
            }
        });
    }

    // Restore collapsed state
    const isSidebarCollapsed = localStorage.getItem('dashboard-sidebar-collapsed') === 'true';
    if (isSidebarCollapsed && window.innerWidth > 900) {
        sidebar.classList.add('collapsed');
    }
}

// ============ MODAL MANAGEMENT ============
function initModals() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const confirmDialogOverlay = document.getElementById('confirmDialogOverlay');
    const confirmClose = document.getElementById('confirmClose');
    const confirmCancel = document.getElementById('confirmCancel');

    if (modalClose) {
        modalClose.addEventListener('click', () => closeEditModal());
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', () => closeEditModal());
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeEditModal();
        });
    }

    if (confirmClose) {
        confirmClose.addEventListener('click', () => confirmDialogOverlay.hidden = true);
    }

    if (confirmCancel) {
        confirmCancel.addEventListener('click', () => confirmDialogOverlay.hidden = true);
    }

    if (confirmDialogOverlay) {
        confirmDialogOverlay.addEventListener('click', (e) => {
            if (e.target === confirmDialogOverlay) confirmDialogOverlay.hidden = true;
        });
    }

    // Setup handlers for all universal close buttons
    setupUniversalModalClosers();

    function closeEditModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        modalOverlay.hidden = true;
        document.body.style.overflow = '';
    }
}

// ============ QUICK ACTION MODALS ============
function initQuickActionModals() {
    const quickActionButtons = document.querySelectorAll('[data-modal]');
    
    quickActionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Check if user is authenticated
            if (!isAuthSessionActive()) {
                showToast('Veuillez vous connecter pour utiliser cette fonction', 'warning');
                return;
            }
            
            const modalId = button.dataset.modal;
            const overlay = document.getElementById(modalId + 'Overlay');
            
            if (overlay) {
                overlay.hidden = false;
            }
        });
    });
}

// ============ UNIVERSAL MODAL CLOSERS ============
function setupUniversalModalClosers() {
    const closeButtons = document.querySelectorAll('.modal-close-btn');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Find parent modal overlay
            const overlay = btn.closest('.modal__overlay');
            if (overlay) {
                overlay.hidden = true;
            }
        });
    });

    // Close modals when clicking outside (on the overlay)
    const overlays = document.querySelectorAll('.modal__overlay[hidden]');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.hidden = true;
            }
        });
    });

    // Also setup for non-hidden overlays
    const allOverlays = document.querySelectorAll('.modal__overlay');
    allOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.hidden = true;
            }
        });
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openOverlays = Array.from(document.querySelectorAll('.modal__overlay')).filter(o => !o.hidden);
            openOverlays.forEach(overlay => {
                overlay.hidden = true;
            });
        }
    });
}

// ============ QUICK ACTION MODALS - FORM HANDLERS ============
function initQuickActionFormHandlers() {
    // Add User Form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addUserForm);
            const name = formData.get('newUserName');
            showToast(`Utilisateur "${name}" ajouté avec succès`, 'success');
            addUserForm.reset();
            document.getElementById('addUserModalOverlay').hidden = true;
        });
    }

    // Create Report Form
    const createReportForm = document.getElementById('createReportForm');
    if (createReportForm) {
        createReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(createReportForm);
            const title = formData.get('reportTitle');
            showToast(`Rapport "${title}" généré avec succès`, 'success');
            createReportForm.reset();
            document.getElementById('createReportModalOverlay').hidden = true;
        });
    }

    // New Transaction Form
    const newTransactionForm = document.getElementById('newTransactionForm');
    if (newTransactionForm) {
        newTransactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(newTransactionForm);
            const description = formData.get('transactionDescription');
            const amount = formData.get('transactionAmount');
            showToast(`Transaction "${description}" (${amount}€) créée avec succès`, 'success');
            newTransactionForm.reset();
            document.getElementById('newTransactionModalOverlay').hidden = true;
        });
    }
}

// ============ TABLE BULK ACTIONS ============
function initBulkActions() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const bulkActionsBar = document.getElementById('bulkActions');
    const bulkActionCount = document.getElementById('bulkActionCount');
    const cancelBulkActionsBtn = document.getElementById('cancelBulkActions');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
            updateBulkActionsBar();
        });
    }

    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateBulkActionsBar();
            const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
            if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
        });
    });

    if (cancelBulkActionsBtn) {
        cancelBulkActionsBtn.addEventListener('click', () => {
            selectAllCheckbox.checked = false;
            rowCheckboxes.forEach(cb => cb.checked = false);
            updateBulkActionsBar();
        });
    }

    function updateBulkActionsBar() {
        const checkedCount = Array.from(rowCheckboxes).filter(cb => cb.checked).length;
        if (checkedCount > 0) {
            bulkActionsBar.hidden = false;
            bulkActionCount.textContent = `${checkedCount} sélectionné(s)`;
        } else {
            bulkActionsBar.hidden = true;
        }
    }
}

// ============ USER EDITING ============
function initUserEditing() {
    const userNameBtns = document.querySelectorAll('.user-name-btn');
    const editUserBtns = document.querySelectorAll('.edit-user-btn');
    const deleteBtns = document.querySelectorAll('.delete-user-btn');
    const modalOverlay = document.getElementById('modalOverlay');
    const confirmDialogOverlay = document.getElementById('confirmDialogOverlay');

    userNameBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            openEditModal(btn.dataset);
        });
    });

    editUserBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const nameBtn = row.querySelector('.user-name-btn');
            if (nameBtn) {
                openEditModal(nameBtn.dataset);
            }
        });
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const nameBtn = row.querySelector('.user-name-btn');
            const userName = nameBtn?.textContent || 'Cet utilisateur';
            
            confirmDialogOverlay.hidden = false;
            document.getElementById('confirmTitle').textContent = 'Confirmer la suppression';
            document.getElementById('confirmMessage').textContent = 
                `Êtes-vous sûr de vouloir supprimer ${userName}? Cette action est irréversible.`;
            
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.textContent = 'Supprimer';
            confirmBtn.onclick = () => {
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    showToast(`${userName} a été supprimé`, 'success');
                    confirmDialogOverlay.hidden = true;
                }, 300);
            };
        });
    });

    function openEditModal(data) {
        const modalOverlay = document.getElementById('modalOverlay');
        const form = document.getElementById('editUserForm');
        
        if (form) {
            form.elements['userName'].value = data.name || '';
            form.elements['userEmail'].value = data.email || '';
            form.elements['userRole'].value = data.role || 'Utilisateur';
            form.elements['userStatus'].value = data.status || 'Actif';
        }
        
        modalOverlay.hidden = false;
        modalOverlay.classList.add('active');
    }
}

// ============ FORM SUBMISSION ============
function initFormHandlers() {
    const editUserForm = document.getElementById('editUserForm');
    
    if (editUserForm) {
        editUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(editUserForm);
            const data = Object.fromEntries(formData);
            
            showToast('Utilisateur mis à jour avec succès', 'success');
            const modalOverlay = document.getElementById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                modalOverlay.hidden = true;
            }
            editUserForm.reset();
        });
    }
}

// ============ QUICK ACTIONS ============
function initQuickActions() {
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    
    quickActionBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const action = ['Ajouter Utilisateur', 'Créer un Rapport', 'Nouvelle Transaction'][index];
            showToast(`${action} en cours...`, 'info');
        });
    });
}

// ============ REPORT DOWNLOAD ============
class ReportGenerator {
    constructor() {
        this.init();
    }

    init() {
        this.setupDownloadButton();
    }

    setupDownloadButton() {
        const downloadBtn = document.getElementById('downloadReportBtn');
        if (!downloadBtn) return;

        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.generateAndDownload();
        });
    }

    generateAndDownload() {
        // Get form values
        const title = document.getElementById('reportTitle')?.value || 'Report';
        const type = document.getElementById('reportType')?.value || 'General';
        const period = document.getElementById('reportPeriod')?.value || 'Aujourd\'hui';
        const format = document.getElementById('reportFormat')?.value || 'PDF';

        if (!title.trim()) {
            showToast('Veuillez entrer un titre pour le rapport', 'warning');
            return;
        }

        // Generate report data
        const reportData = this.generateReportContent(title, type, period);

        // Download based on format
        switch (format) {
            case 'PDF':
                this.downloadPDF(reportData, title);
                break;
            case 'Excel':
                this.downloadExcel(reportData, title);
                break;
            case 'CSV':
                this.downloadCSV(reportData, title);
                break;
            default:
                showToast('Format non supporté', 'error');
        }

        showToast(`✓ Rapport téléchargé en ${format}`, 'success');
    }

    generateReportContent(title, type, period) {
        const now = new Date().toLocaleString('fr-FR');
        return {
            title,
            type,
            period,
            generatedAt: now,
            content: [
                { label: 'Type de rapport', value: type },
                { label: 'Période', value: period },
                { label: 'Date de génération', value: now },
                { label: 'Utilisateurs actifs', value: '1248' },
                { label: 'Transactions', value: '3542' },
                { label: 'Ventes totales', value: '€ 37540' },
                { label: 'Sessions', value: '82330' }
            ]
        };
    }

    downloadPDF(data, filename) {
        // Create simple PDF-like content (basic text file)
        let content = `RAPPORT: ${data.title}\n`;
        content += `${'='.repeat(50)}\n\n`;
        content += `Type: ${data.type}\n`;
        content += `Période: ${data.period}\n`;
        content += `Généré: ${data.generatedAt}\n\n`;
        content += `CONTENU:\n${'-'.repeat(50)}\n`;
        
        data.content.forEach(item => {
            content += `${item.label}: ${item.value}\n`;
        });

        // For a real PDF, you'd use a library like pdfkit or jsPDF
        // This creates a text file as a demo
        this.downloadFile(content, `${filename}.pdf`, 'application/pdf');
    }

    downloadExcel(data, filename) {
        // Create CSV-like content that can be opened in Excel
        let content = `Titre: ${data.title}\n`;
        content += `Type: ${data.type}\n`;
        content += `Période: ${data.period}\n`;
        content += `Généré: ${data.generatedAt}\n\n`;
        content += `Paramètre,Valeur\n`;
        
        data.content.forEach(item => {
            content += `"${item.label}","${item.value}"\n`;
        });

        this.downloadFile(content, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    downloadCSV(data, filename) {
        // Create proper CSV format
        let content = `Rapport,${data.title}\n`;
        content += `Type,${data.type}\n`;
        content += `Période,${data.period}\n`;
        content += `Généré,${data.generatedAt}\n\n`;
        content += `Paramètre,Valeur\n`;
        
        data.content.forEach(item => {
            content += `"${item.label}","${item.value}"\n`;
        });

        this.downloadFile(content, `${filename}.csv`, 'text/csv;charset=utf-8;');
    }

    downloadFile(content, filename, mimeType) {
        // Create a blob from the content
        const blob = new Blob([content], { type: mimeType });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(link.href);
    }
}

// Initialize ReportGenerator when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ReportGenerator();
    });
} else {
    new ReportGenerator();
}

function initProfileAvatar() {
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileAvatar) {
        profileAvatar.addEventListener('click', () => {
            window.location.href = '/HTML/parametres.html';
        });
    }
}

// ============ STATISTICS PAGE GRAPH INTERACTIVITY ============
function initStatisticsGraphs() {
    const chartBars = document.querySelectorAll('.chart-bar');
    const tooltip = document.getElementById('chartTooltip');
    const chartContainer = document.getElementById('chartContainer');
    
    if (!chartBars.length || !tooltip || !chartContainer) return;

    let hoveredMonthData = null;
    const staticKpiValues = new Map();

    // Capture initial KPI values
    const kpiElements = document.querySelectorAll('.card__value[data-value="XXX"]');
    kpiElements.forEach((el, idx) => {
        staticKpiValues.set(idx, el.textContent);
    });

    chartBars.forEach(bar => {
        bar.addEventListener('mouseenter', (e) => onBarHover(e, bar));
        bar.addEventListener('mousemove', (e) => updateTooltipPosition(e));
        bar.addEventListener('mouseleave', () => onBarLeave());
    });

    chartContainer.addEventListener('mouseleave', () => onBarLeave());

    function onBarHover(e, bar) {
        hoveredMonthData = {
            month: bar.dataset.month,
            revenue: bar.dataset.revenue,
            orders: bar.dataset.orders,
            growth: bar.dataset.growth
        };

        tooltip.style.display = 'block';
        populateTooltip(hoveredMonthData);
        updateTooltipPosition(e);

        bar.style.opacity = '0.8';
        bar.style.filter = 'brightness(1.2)';

        updateKpiWithHoveredData(hoveredMonthData);
    }

    function updateTooltipPosition(e) {
        if (!hoveredMonthData) return;

        const rect = chartContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const offsetX = Math.min(x + 16, rect.width - 200);
        const offsetY = Math.max(y - 100, 10);

        tooltip.style.left = offsetX + 'px';
        tooltip.style.top = offsetY + 'px';
    }

    function onBarLeave() {
        chartBars.forEach(bar => {
            bar.style.opacity = '1';
            bar.style.filter = 'brightness(1)';
        });

        tooltip.style.display = 'none';
        restoreKpiValues();
        hoveredMonthData = null;
    }

    function populateTooltip(data) {
        const monthEl = document.getElementById('tooltipMonth');
        const revenueEl = document.getElementById('tooltipRevenue');
        const ordersEl = document.getElementById('tooltipOrders');
        const growthEl = document.getElementById('tooltipGrowth');

        if (monthEl) monthEl.textContent = data.month;
        if (revenueEl) revenueEl.textContent = '€ ' + parseInt(data.revenue).toLocaleString('fr-FR');
        if (ordersEl) ordersEl.textContent = data.orders + ' commandes';
        if (growthEl) growthEl.textContent = data.growth + ' croissance';
    }

    function updateKpiWithHoveredData(data) {
        kpiElements.forEach((el, idx) => {
            let value;
            if (idx === 0) {
                value = data.revenue;
            } else if (idx === 1) {
                value = data.orders;
            } else if (idx === 2) {
                value = data.growth;
            } else {
                value = Math.round(parseInt(data.revenue) / 15);
            }
            animateKpiValue(el, value, idx === 0 || idx === 3);
        });
    }

    function animateKpiValue(element, targetValue, isCurrency = false) {
        const currentValue = element.textContent;
        const isNumeric = !isNaN(parseInt(currentValue.replace(/[^0-9]/g, '')));

        if (isNumeric) {
            const duration = 300;
            const startTime = Date.now();
            const startValue = parseInt(currentValue.replace(/[^0-9]/g, '')) || 0;
            const endValue = parseInt(targetValue.toString().replace(/[^0-9]/g, '')) || 0;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(startValue + (endValue - startValue) * progress);

                if (isCurrency) {
                    element.textContent = '€ ' + current.toLocaleString('fr-FR');
                } else {
                    element.textContent = current.toLocaleString('fr-FR') + (element.textContent.includes('%') ? '%' : '');
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        } else {
            element.textContent = isCurrency ? '€ ' + targetValue : targetValue;
        }
    }

    function restoreKpiValues() {
        kpiElements.forEach((el, idx) => {
            const originalValue = staticKpiValues.get(idx);
            if (originalValue) {
                element.textContent = originalValue;
            }
        });
    }
}

// ============ AUTHENTICATION REDIRECTS ============
function setupAuthRedirects() {
    // Profile avatar redirects to settings
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar && typeof profileAvatar.addEventListener === 'function') {
        profileAvatar.addEventListener('click', () => {
            window.location.href = '/HTML/parametres.html';
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.auth?.logout) {
                window.auth.logout('/HTML/signin.html');
            } else {
                window.location.href = '/HTML/signin.html';
            }
        });
    }
}

// ============ GLOBAL STATE MANAGER ============
class GlobalStateManager {
    constructor() {
        this.isAuthenticated = isAuthSessionActive();
        this.isPreviewMode = !this.isAuthenticated;
        this.init();
    }

    init() {
        this.syncGlobalState();
        this.setupStateListeners();
        this.setupQuickActionsSidebar();
        this.initHamburgerClose();
    }

    syncGlobalState() {
        if (this.isPreviewMode) {
            document.documentElement.setAttribute('data-preview-mode', 'true');
            document.documentElement.removeAttribute('data-authenticated');
            document.body.classList.add('preview-mode');
            this.syncPreviewMode();
        } else {
            document.documentElement.removeAttribute('data-preview-mode');
            document.documentElement.setAttribute('data-authenticated', 'true');
            document.body.classList.remove('preview-mode');
            this.syncAuthenticatedMode();
        }

        this.syncStats();
        this.updateSettingsProfileFields(this.getCurrentUser());
    }

    syncPreviewMode() {
        // Hide authenticated-only elements
        document.querySelectorAll('[data-auth-only]').forEach(el => {
            el.style.opacity = '0.5';
            el.style.pointerEvents = 'none';
        });

        // Show preview elements
        document.querySelectorAll('[data-preview-only]').forEach(el => {
            el.style.display = '';
        });

        // Blur preview data
        document.querySelectorAll('.preview-blur').forEach(el => {
            el.classList.add('preview-blur');
        });

        // Update header state
        this.updateHeaderState();

        // Disable data-modifying buttons
        this.disableDataModifyingButtons();
    }

    syncAuthenticatedMode() {
        // Show authenticated elements
        document.querySelectorAll('[data-auth-only]').forEach(el => {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        });

        // Hide preview-only elements
        document.querySelectorAll('[data-preview-only]').forEach(el => {
            el.style.display = 'none';
        });

        // Remove blur from data
        document.querySelectorAll('.preview-blur').forEach(el => {
            el.classList.remove('preview-blur');
        });

        // Update header state
        this.updateHeaderState();

        // Enable all buttons
        this.enableAllButtons();
    }

    updateHeaderState() {
        const authButtonsContainer = document.querySelector('.auth-buttons-container');
        const profileAvatar = document.querySelector('.profile-avatar');
        const topbarRight = document.querySelector('.topbar__right');
        const previewModeAlert = document.getElementById('previewModeAlert');
        const avatarText = document.getElementById('avatarText');
        const user = this.getCurrentUser();

        if (this.isPreviewMode) {
            if (authButtonsContainer) authButtonsContainer.style.display = 'flex';
            if (profileAvatar) profileAvatar.style.display = 'none';
            if (topbarRight) topbarRight.classList.add('preview-mode-active');
            if (previewModeAlert) previewModeAlert.hidden = false;
        } else {
            if (authButtonsContainer) authButtonsContainer.style.display = 'none';
            if (profileAvatar) profileAvatar.style.display = 'flex';
            if (topbarRight) topbarRight.classList.remove('preview-mode-active');
            if (previewModeAlert) previewModeAlert.hidden = true;

            if (profileAvatar) {
                profileAvatar.title = `${user?.name || 'Utilisateur'}\n${user?.email || ''}`;
            }
            if (avatarText) {
                avatarText.textContent = this.getUserInitials(user?.name || 'Utilisateur');
            }
        }
    }

    disableDataModifyingButtons() {
        document.querySelectorAll('.btn--danger, .btn--warning, [data-modifies-data]').forEach(btn => {
            if (!btn.hasAttribute('data-already-disabled')) {
                const originalClickHandler = btn.onclick;
                btn.setAttribute('data-already-disabled', 'true');
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showToast('Cette action nécessite une authentification', 'warning');
                    window.location.href = '/HTML/signin.html';
                });
                btn.style.opacity = '0.6';
            }
        });
    }

    enableAllButtons() {
        document.querySelectorAll('[data-modifies-data]').forEach(btn => {
            btn.removeAttribute('data-already-disabled');
            btn.style.opacity = '';
            btn.onclick = null;
        });
    }

    getCurrentUser() {
        return getCurrentAuthUser();
    }

    getUserInitials(name) {
        if (!name) return 'AD';
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 0) return 'AD';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    syncStats() {
        if (this.isAuthenticated) {
            this.displayRealData();
        } else {
            this.displayMaskedData();
        }
    }

    displayRealData() {
        document.querySelectorAll('[data-stat-key]').forEach((el, index) => {
            const statKey = el.dataset.statKey;
            const format = el.dataset.format;
            const rawValue = this.getStatValue(statKey, index);
            const value = this.formatStatValue(rawValue, format);
            el.textContent = value;
            el.classList.remove('preview-blur');
        });
    }

    displayMaskedData() {
        document.querySelectorAll('[data-stat-key]').forEach(el => {
            const format = el.dataset.format;
            el.textContent = format === 'currency' ? '€ XXX' : format === 'percent' ? 'XXX%' : 'XXX';
            el.classList.add('preview-blur');
        });
    }

    getStatValue(key, index = 0) {
        const values = {
            totalUsers: '12 490',
            revenue: '42 500',
            newCustomers: '235',
            sessions: '8 740',
            activeUsers: '9 120',
            inactiveUsers: '128',
            orders: '1 240',
            conversionRate: '7.8',
            avgCart: '128',
            totalTransactions: '624',
            totalAmount: '37 200',
            pendingTransactions: '22',
            successRate: '96.2',
            growth: '12.4',
            users: '11 980',
            sales: '53 700',
            todayMetric: '48',
            yesterdayMetric: '41',
            lastWeekMetric: '72'
        };

        if (key && values[key] !== undefined) {
            return values[key];
        }

        return 'XXX';
    }

    formatStatValue(value, format) {
        if (!value) return 'XXX';
        if (format === 'currency') {
            return value.toString().startsWith('€') ? value : `€ ${value}`;
        }
        if (format === 'percent') {
            return value.toString().endsWith('%') ? value : `${value}%`;
        }
        return value;
    }

    updateSettingsProfileFields(user) {
        if (!user) return;
        const nameInput = document.getElementById('admin-name');
        const emailInput = document.getElementById('admin-email');
        const roleInput = document.getElementById('admin-role');
        const usernameInput = document.getElementById('admin-username');

        if (nameInput && !nameInput.classList.contains('filled-from-session')) {
            nameInput.value = user.name || '';
            nameInput.classList.add('filled-from-session');
        }
        if (emailInput && !emailInput.classList.contains('filled-from-session')) {
            emailInput.value = user.email || '';
            emailInput.classList.add('filled-from-session');
        }
        if (roleInput && !roleInput.classList.contains('filled-from-session')) {
            roleInput.value = user.role || 'Utilisateur';
            roleInput.classList.add('filled-from-session');
        }
        if (usernameInput && !usernameInput.classList.contains('filled-from-session')) {
            usernameInput.value = user.username || user.name || '';
            usernameInput.classList.add('filled-from-session');
        }
    }

    setupStateListeners() {
        // Listen for storage changes (from other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === getAuthSessionKey()) {
                this.isAuthenticated = isAuthSessionActive();
                this.isPreviewMode = !this.isAuthenticated;
                this.syncGlobalState();
            }
        });

        // Listen for sign in/out
        document.addEventListener('dashboard:auth-changed', () => {
            this.isAuthenticated = isAuthSessionActive();
            this.isPreviewMode = !this.isAuthenticated;
            this.syncGlobalState();
        });
    }

    setupQuickActionsSidebar() {
        const sidebar = document.querySelector('.sidebar__nav');
        if (!sidebar) return;

        const quickActionsContainer = document.createElement('div');
        quickActionsContainer.className = 'quick-actions--sidebar';
        quickActionsContainer.innerHTML = `
            <button class="quick-action-btn" data-action="add-user" aria-label="Ajouter un utilisateur">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.5 1.5H9.5C5.36 1.5 2 4.86 2 9v4.5m7-12h1c4.14 0 7.5 3.36 7.5 7.5v4.5M10 10a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                <span>Ajouter Utilisateur</span>
            </button>
            <button class="quick-action-btn" data-action="create-report" aria-label="Créer un rapport">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a1 1 0 011 1v1.323l3.953 1.582 1.582-.79a1 1 0 01.894 1.789l-1.884.944 1.261 6.422a1 1 0 01-.98 1.187H5.178a1 1 0 01-.98-1.186l1.261-6.422-1.884-.944a1 1 0 01.894-1.789l1.582.79L9 4.323V3a1 1 0 011-1h0z"/>
                </svg>
                <span>Créer Rapport</span>
            </button>
            <button class="quick-action-btn" data-action="new-transaction" aria-label="Nouvelle transaction">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
                </svg>
                <span>Transaction</span>
            </button>
        `;

        sidebar.parentElement.appendChild(quickActionsContainer);

        quickActionsContainer.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isPreviewMode) {
                    e.preventDefault();
                    showToast('Connectez-vous pour utiliser cette fonctionnalité', 'warning');
                    return;
                }

                const action = btn.dataset.action;
                const messages = {
                    'add-user': 'Ajout d\'utilisateur en cours...',
                    'create-report': 'Création de rapport en cours...',
                    'new-transaction': 'Nouvelle transaction en cours...'
                };
                showToast(messages[action] || 'Action en cours...', 'info');
            });
        });
    }

    initHamburgerClose() {
        // Close sidebar when clicking a sidebar link on mobile
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 900) {
                    const sidebar = document.querySelector('.sidebar');
                    sidebar?.classList.remove('active');
                    document.body.classList.remove('mobile-menu-open');
                }
            });
        });
    }
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Initialize state manager first (affects all other systems)
    const stateManager = new GlobalStateManager();

    // Initialize all systems
    new ThemeManager();
    new NotificationManager();
    new SearchManager();
    
    // Initialize UI components
    initSidebar();
    // NOTE: Modal initialization is now handled by modal-system.js
    // Do NOT call initModals() to avoid conflicts
    // Quick action modal opening is handled by modal-system.js.
    initQuickActionFormHandlers();
    initBulkActions();
    initUserEditing();
    initFormHandlers();
    initQuickActions();
    initProfileAvatar();
    initStatisticsGraphs();
    setupAuthRedirects();

    // Apply stored preferences
    const savedDarkMode = localStorage.getItem(STORAGE_KEY_DARKMODE) === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark');
    }

    // Show welcome toast
    const isFirstVisit = !localStorage.getItem('dashboard-visited');
    if (isFirstVisit) {
        localStorage.setItem('dashboard-visited', 'true');
        const message = stateManager.isPreviewMode 
            ? 'Explorez notre dashboard en mode prévisualisation! Connectez-vous pour accéder à vos données.'
            : 'Bienvenue dans votre dashboard!';
        showToast(message, 'success');
    }
});
