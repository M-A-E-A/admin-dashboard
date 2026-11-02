(() => {
  const SIDEBAR_STATE_KEY = 'dashboard-sidebar-collapsed';
  const mobileQuery = window.matchMedia('(max-width: 900px)');

  const pages = [
    { label: 'Tableau de bord', url: '/HTML/index.html' },
    { label: 'Utilisateurs', url: '/HTML/utilisateurs.html' },
    { label: 'Statistiques', url: '/HTML/statistiques.html' },
    { label: 'Transactions', url: '/HTML/transactions.html' },
    { label: 'Parametres', url: '/HTML/parametres.html' },
  ];

  function getInitials(user) {
    const source = user?.name || user?.email || 'AD';
    return source
      .split(/[\s@.]+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function setAvatar() {
    const avatarText = document.getElementById('avatarText');
    if (avatarText) {
      avatarText.textContent = getInitials(window.auth?.getStoredSession?.());
    }
  }

  function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (!sidebar || !toggle || toggle.dataset.layoutBound === 'true') {
      return;
    }

    const syncMode = () => {
      if (mobileQuery.matches) {
        sidebar.classList.remove('collapsed');
      } else {
        sidebar.classList.remove('active');
        sidebar.classList.toggle('collapsed', localStorage.getItem(SIDEBAR_STATE_KEY) === 'true');
      }
    };

    syncMode();
    toggle.dataset.layoutBound = 'true';

    toggle.addEventListener('click', () => {
      if (mobileQuery.matches) {
        sidebar.classList.toggle('active');
        return;
      }

      sidebar.classList.toggle('collapsed');
      localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebar.classList.contains('collapsed')));
    });

    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileQuery.matches) {
          sidebar.classList.remove('active');
        }
      });
    });

    mobileQuery.addEventListener?.('change', syncMode);
  }

  function setupGlobalSearch() {
    const input = document.getElementById('globalSearch');
    const results = document.getElementById('searchResults');
    if (!input || !results || input.dataset.layoutSearchBound === 'true') {
      return;
    }

    input.dataset.layoutSearchBound = 'true';

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        results.hidden = true;
        results.innerHTML = '';
        return;
      }

      const matches = pages.filter(page => page.label.toLowerCase().includes(query));
      results.innerHTML = matches
        .map(page => `<a href="${page.url}" class="search-result-item">${page.label}</a>`)
        .join('');
      results.hidden = matches.length === 0;
    });

    document.addEventListener('click', event => {
      if (!input.closest('.search-container')?.contains(event.target)) {
        results.hidden = true;
      }
    });
  }

  function setupNotifications() {
    const bell = document.getElementById('notificationBell');
    const dropdown = document.getElementById('notificationDropdown');
    const clearButton = document.getElementById('clearNotifications');
    const badge = document.getElementById('notificationBadge');
    const list = document.getElementById('notificationList');

    if (!bell || !dropdown || bell.dataset.layoutBound === 'true') {
      return;
    }

    bell.dataset.layoutBound = 'true';

    bell.addEventListener('click', event => {
      event.stopPropagation();
      dropdown.hidden = !dropdown.hidden;
    });

    dropdown.addEventListener('click', event => event.stopPropagation());

    clearButton?.addEventListener('click', () => {
      if (list) {
        list.innerHTML = '<div class="notification-empty">Aucune notification.</div>';
      }
      if (badge) {
        badge.textContent = '0';
        badge.hidden = true;
      }
    });

    document.addEventListener('click', () => {
      dropdown.hidden = true;
    });
  }

  function setupProfileMenu() {
    const avatar = document.getElementById('profileAvatar');
    const menu = document.getElementById('profileMenu');
    if (!avatar || avatar.dataset.layoutBound === 'true') {
      return;
    }

    avatar.dataset.layoutBound = 'true';

    if (!menu) {
      avatar.addEventListener('click', () => {
        window.location.href = '/HTML/parametres.html';
      });
      return;
    }

    avatar.addEventListener('click', event => {
      event.stopPropagation();
      menu.hidden = !menu.hidden;
    });

    menu.addEventListener('click', event => event.stopPropagation());

    document.addEventListener('click', () => {
      menu.hidden = true;
    });
  }

  function initProtectedLayout() {
    setAvatar();
    setupSidebar();
    setupGlobalSearch();
    setupNotifications();
    setupProfileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProtectedLayout);
  } else {
    initProtectedLayout();
  }

  window.protectedLayout = {
    refreshAvatar: setAvatar,
  };
})();
