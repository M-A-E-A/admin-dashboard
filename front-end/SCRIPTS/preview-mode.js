/**
 * Preview Mode System
 * Handles interactive charts with tooltips, KPI animations, and preview mode logic
 */

class PreviewModeSystem {
    constructor() {
        this.isPreviewMode = document.documentElement.hasAttribute('data-preview-mode');
        this.chartBars = document.querySelectorAll('.chart-bar');
        this.tooltip = document.getElementById('chartTooltip');
        this.chartContainer = document.getElementById('chartContainer');
        this.staticKpiValues = this.captureStaticKpiValues();
        this.hoveredMonthData = null;
        this.init();
    }

    init() {
        if (this.isPreviewMode) {
            this.setupChartInteractivity();
            this.setupKeyboardShortcuts();
            this.setupAuthRedirects();
        }
    }

    /**
     * Capture initial KPI values for restoration
     */
    captureStaticKpiValues() {
        const kpiElements = document.querySelectorAll('[data-value="XXX"]');
        const values = {};
        kpiElements.forEach((el, index) => {
            values[index] = el.textContent;
        });
        return values;
    }

    /**
     * Setup interactive chart with cursor-following tooltip
     */
    setupChartInteractivity() {
        this.chartBars.forEach(bar => {
            bar.addEventListener('mouseenter', (e) => this.onBarHover(e, bar));
            bar.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
            bar.addEventListener('mouseleave', () => this.onBarLeave());
        });

        if (this.chartContainer) {
            this.chartContainer.addEventListener('mouseleave', () => this.onBarLeave());
        }
    }

    /**
     * Handle bar hover - show tooltip and update KPIs
     */
    onBarHover(e, bar) {
        this.hoveredMonthData = {
            month: bar.dataset.month,
            revenue: bar.dataset.revenue,
            orders: bar.dataset.orders,
            growth: bar.dataset.growth
        };

        // Show tooltip
        if (this.tooltip) {
            this.tooltip.style.display = 'block';
            this.populateTooltip(this.hoveredMonthData);
            this.updateTooltipPosition(e);
        }

        // Highlight bar
        bar.style.opacity = '0.8';
        bar.style.filter = 'brightness(1.2)';

        // Update KPI cards
        this.updateKpiWithHoveredData(this.hoveredMonthData);
    }

    /**
     * Update tooltip position to follow cursor
     */
    updateTooltipPosition(e) {
        if (!this.tooltip || !this.hoveredMonthData) return;

        const rect = this.chartContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Position tooltip near cursor
        const offsetX = Math.min(x + 16, rect.width - 200);
        const offsetY = Math.max(y - 100, 10);

        this.tooltip.style.left = offsetX + 'px';
        this.tooltip.style.top = offsetY + 'px';
    }

    /**
     * Handle bar leave - restore original state
     */
    onBarLeave() {
        this.chartBars.forEach(bar => {
            bar.style.opacity = '1';
            bar.style.filter = 'brightness(1)';
        });

        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
        this.restoreKpiValues();
        this.hoveredMonthData = null;
    }

    /**
     * Populate tooltip with data
     */
    populateTooltip(data) {
        const monthEl = document.getElementById('tooltipMonth');
        const revenueEl = document.getElementById('tooltipRevenue');
        const ordersEl = document.getElementById('tooltipOrders');
        const growthEl = document.getElementById('tooltipGrowth');

        if (monthEl) monthEl.textContent = data.month;
        if (revenueEl) revenueEl.textContent = '$' + parseInt(data.revenue).toLocaleString();
        if (ordersEl) ordersEl.textContent = data.orders + ' orders';
        if (growthEl) growthEl.textContent = data.growth + ' growth';
    }

    /**
     * Update KPI values when hovering chart
     */
    updateKpiWithHoveredData(data) {
        const kpiElements = document.querySelectorAll('.stat-card__value[data-value="XXX"]');
        const animatedValues = [
            { value: data.revenue, format: (v) => '$' + parseInt(v).toLocaleString() },
            { value: '1,240', format: (v) => v },
            { value: '2,850', format: (v) => v },
            { value: data.growth, format: (v) => v }
        ];

        kpiElements.forEach((el, index) => {
            if (animatedValues[index]) {
                this.animateKpiValue(el, animatedValues[index].value);
            }
        });
    }

    /**
     * Animate KPI value change
     */
    animateKpiValue(element, targetValue) {
        const currentValue = element.textContent;
        const isNumeric = !isNaN(parseInt(currentValue.replace(/[^0-9]/g, '')));

        if (isNumeric) {
            const duration = 300;
            const startTime = Date.now();
            const startValue = parseInt(currentValue.replace(/[^0-9]/g, '')) || 0;
            const endValue = parseInt(targetValue.replace(/[^0-9]/g, '')) || 0;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(startValue + (endValue - startValue) * progress);

                if (currentValue.includes('$')) {
                    element.textContent = '$' + current.toLocaleString();
                } else {
                    element.textContent = current.toLocaleString();
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        } else {
            element.textContent = targetValue;
        }
    }

    /**
     * Restore original KPI values
     */
    restoreKpiValues() {
        const kpiElements = document.querySelectorAll('[data-value="XXX"]');
        kpiElements.forEach((el, index) => {
            if (this.staticKpiValues[index]) {
                this.animateKpiValue(el, this.staticKpiValues[index]);
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd+K or Ctrl+K for search focus
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('globalSearch');
                if (searchInput) searchInput.focus();
            }

            // G stays on the public preview dashboard
            if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
                if (document.activeElement.tagName !== 'INPUT') {
                    window.location.href = '/HTML/preview.html';
                }
            }

            // Protected app pages should route through signin from preview mode
            if (e.key === 'u' && !e.ctrlKey && !e.metaKey) {
                if (document.activeElement.tagName !== 'INPUT') {
                    window.location.href = '/HTML/signin.html';
                }
            }

            // Protected app pages should route through signin from preview mode
            if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
                if (document.activeElement.tagName !== 'INPUT') {
                    window.location.href = '/HTML/signin.html';
                }
            }
        });
    }

    /**
     * Handle auth button redirects and protected action prevention
     */
    setupAuthRedirects() {
        // Disable actual functionality for protected actions
        document.querySelectorAll('.btn--action-protected').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isPreviewMode) {
                    e.preventDefault();
                    this.showAuthPrompt(btn.dataset.action || 'Sign in to access this feature');
                }
            });
        });
    }

    /**
     * Show authentication prompt
     */
    showAuthPrompt(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast--info';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast--visible');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('toast--visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

/**
 * Sidebar Collapse Functionality
 */
class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.init();
    }

    init() {
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Store preference
        const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (isCollapsed && this.sidebar) {
            this.sidebar.classList.add('collapsed');
        }
    }

    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('collapsed');
            const isCollapsed = this.sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebar-collapsed', isCollapsed);
        }
    }
}

/**
 * Theme Manager Integration
 */
class ThemeManager {
    constructor() {
        this.darkModeKey = 'dashboard-dark-mode';
        this.themeKey = 'dashboard-theme';
        this.themeToggle = document.getElementById('themeToggle');
        this.themeMenu = document.getElementById('themeMenu');
        this.init();
    }

    init() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.themeMenu) this.themeMenu.hidden = !this.themeMenu.hidden;
            });
        }

        document.querySelectorAll('.theme-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const theme = item.dataset.theme;
                this.setTheme(theme);
            });
        });

        document.addEventListener('click', () => {
            if (this.themeMenu) this.themeMenu.hidden = true;
        });
    }

    setTheme(theme) {
        localStorage.setItem(this.themeKey, theme);

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setDarkMode(prefersDark);
        } else {
            this.setDarkMode(theme === 'dark');
        }
    }

    setDarkMode(isDark) {
        localStorage.setItem(this.darkModeKey, isDark ? 'true' : 'false');

        if (isDark) {
            document.body.classList.add('dark');
            document.documentElement.setAttribute('data-dark', 'true');
        } else {
            document.body.classList.remove('dark');
            document.documentElement.removeAttribute('data-dark');
        }
    }
}

/**
 * Notification System
 */
class NotificationManager {
    constructor() {
        this.storageKey = 'dashboard-notifications';
        this.notificationBell = document.getElementById('notificationBell');
        this.notificationDropdown = document.getElementById('notificationDropdown');
        this.clearBtn = document.getElementById('clearNotifications');
        this.notifications = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.init();
    }

    init() {
        if (this.notificationBell) {
            this.notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.notificationDropdown) this.notificationDropdown.hidden = !this.notificationDropdown.hidden;
            });
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearAll());
        }

        document.addEventListener('click', () => {
            if (this.notificationDropdown) this.notificationDropdown.hidden = true;
        });

        this.updateBadge();
    }

    addNotification(title, subtitle) {
        const notification = {
            id: Date.now(),
            title,
            subtitle,
            time: new Date().toLocaleTimeString()
        };

        this.notifications.unshift(notification);
        localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
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
        const list = document.getElementById('notificationList');
        if (!list) return;

        list.innerHTML = '';
        this.notifications.slice(0, 5).forEach(notif => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `
                <div class="notification-content">
                    <p class="notification-title">${notif.title}</p>
                    <p class="notification-subtitle">${notif.subtitle}</p>
                </div>
            `;
            list.appendChild(item);
        });
    }

    clearAll() {
        this.notifications = [];
        localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
        this.updateBadge();
        this.renderNotifications();
    }
}

// Initialize all systems when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PreviewModeSystem();
    new SidebarManager();
    new ThemeManager();
    new NotificationManager();
});
