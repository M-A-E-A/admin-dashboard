// Theme manager for persistent dark mode across all pages
if (!window.showToast) {
  window.showToast = function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast--visible'));
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };
}

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'dashboard-theme';
    this.DARK_MODE_KEY = 'dashboard-dark-mode';
    this.currentTheme = localStorage.getItem(this.STORAGE_KEY) || 'light';
    this.isDarkMode = localStorage.getItem(this.DARK_MODE_KEY) === 'true';
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    // Apply saved theme on page load
    this.applyTheme();
    
    // Setup theme toggle listeners
    this.setupThemeToggle();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentTheme === 'system') {
        this.setDarkMode(e.matches);
      }
    });
    
    // Listen for auth changes to reload theme
    document.addEventListener('dashboard:auth-changed', () => {
      this.applyTheme();
    });
  }

  setupThemeToggle() {
    // Dark mode toggle button
    const darkModeToggle = document.getElementById('darkModeToggle');
    const hasThemeMenu = !!document.getElementById('themeMenu');
    if (darkModeToggle && !hasThemeMenu) {
      darkModeToggle.addEventListener('click', () => {
        this.setDarkMode(!this.isDarkMode);
      });
    }

    // Theme menu items
    const themeToggleBtn = document.getElementById('themeToggle') || document.getElementById('darkModeToggle');
    const themeMenu = document.getElementById('themeMenu');
    
    if (themeToggleBtn && themeToggleBtn.id === 'themeToggle') {
      themeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (themeMenu) {
          themeMenu.hidden = !themeMenu.hidden;
        }
      });
    }

    const themeMenuItems = document.querySelectorAll('.theme-menu-item');
    themeMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        const theme = item.dataset.theme;
        this.setTheme(theme);
        if (themeMenu) themeMenu.hidden = true;
      });
    });

    // Close theme menu on outside click
    document.addEventListener('click', (e) => {
      const themeContainer = themeMenu?.closest('.theme-switch-container');
      const clickedInsideTheme = themeContainer?.contains(e.target) || themeToggleBtn?.contains(e.target);
      if (themeMenu && !themeMenu.hidden && !clickedInsideTheme) {
        themeMenu.hidden = true;
      }
    });
  }

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem(this.STORAGE_KEY, theme);

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    } else {
      this.setDarkMode(theme === 'dark');
    }
  }

  setDarkMode(isDark) {
    this.isDarkMode = isDark;
    localStorage.setItem(this.DARK_MODE_KEY, isDark ? 'true' : 'false');
    this.applyTheme();
  }

  applyTheme() {
    const html = document.documentElement;
    const body = document.body;

    if (this.isDarkMode) {
      html.setAttribute('data-dark', 'true');
      html.style.colorScheme = 'dark';
      body?.classList.add('dark');
      body?.classList.remove('light');
    } else {
      html.removeAttribute('data-dark');
      html.style.colorScheme = 'light';
      body?.classList.remove('dark');
      body?.classList.add('light');
    }

    // Update theme toggle button appearance
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.textContent = this.isDarkMode ? '☀️' : '🌙';
      darkModeToggle.title = this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
    }

    document.querySelectorAll('.theme-icon-sun').forEach(icon => {
      icon.style.display = this.isDarkMode ? 'none' : 'block';
    });

    document.querySelectorAll('.theme-icon-moon').forEach(icon => {
      icon.style.display = this.isDarkMode ? 'block' : 'none';
    });
  }

  isDark() {
    return this.isDarkMode;
  }

  toggleDarkMode() {
    this.setDarkMode(!this.isDarkMode);
  }
}

// Initialize theme on page load
const themeManager = new ThemeManager();

// Make available globally
window.themeManager = themeManager;

