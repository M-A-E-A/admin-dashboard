(() => {
  const auth = window.auth;

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
      return;
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
  }

  window.showToast = window.showToast || showToast;

  function getInitials(user) {
    const source = user?.name || user?.email || 'AD';
    return source
      .split(/[\s@.]+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  function setAvatar(user) {
    const avatarText = document.getElementById('avatarText');
    if (avatarText) {
      avatarText.textContent = getInitials(user);
    }
  }

  function formatCurrency(value) {
    return `€ ${Number(value || 0).toLocaleString('fr-FR')}`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getStatusBadgeClass(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('inactif') || normalized.includes('inactive') || normalized.includes('failed')) {
      return 'badge--danger';
    }
    if (normalized.includes('attente') || normalized.includes('pending')) {
      return 'badge--warning';
    }
    return 'badge--success';
  }

  function normalizeTransactionStatus(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('compl') || normalized.includes('success') || normalized.includes('reuss')) {
      return 'completed';
    }
    if (normalized.includes('echou') || normalized.includes('fail') || normalized.includes('error')) {
      return 'failed';
    }
    return 'pending';
  }

  function setCardValue(title, value) {
    const cards = document.querySelectorAll('.stats .card');
    cards.forEach(card => {
      const cardTitle = card.querySelector('.card__title')?.textContent?.trim();
      const valueElement = card.querySelector('.card__value');
      if (cardTitle === title && valueElement) {
        valueElement.textContent = value;
        valueElement.dataset.value = String(value).replace(/[^\d.-]/g, '') || '0';
      }
    });
  }

  async function loadCurrentUser() {
    if (!auth?.isLoggedIn?.()) {
      return;
    }

    const session = auth.getStoredSession?.();
    setAvatar(session);

    try {
      const user = await auth.fetchCurrentUser();
      setAvatar(user);
    } catch (error) {
      console.error('Unable to load current user:', error);
    }
  }

  async function loadDashboardStats() {
    if (!auth?.isLoggedIn?.()) {
      return;
    }

    try {
      const stats = await auth.fetchDashboardStats();
      setCardValue('Utilisateurs', stats.totalUsers ?? 0);
      setCardValue('Ventes', formatCurrency(stats.totalTransactionAmount));
      setCardValue('Sessions', stats.totalTransactions ?? 0);
      setCardValue('Support', stats.pendingTransactions ?? 0);
    } catch (error) {
      console.error('Unable to load dashboard stats:', error);
      showToast('Impossible de charger les statistiques.', 'error');
    }
  }

  function setupProfileMenu() {
    const avatar = document.getElementById('profileAvatar');
    const menu = document.getElementById('profileMenu');
    if (!avatar || !menu) {
      return;
    }

    if (avatar.dataset.layoutBound === 'true') {
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

  function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (!sidebar || !toggle) {
      return;
    }

    if (toggle.dataset.layoutBound === 'true') {
      return;
    }

    if (localStorage.getItem('dashboard-sidebar-collapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('dashboard-sidebar-collapsed', String(sidebar.classList.contains('collapsed')));
    });
  }

  function setupNotifications() {
    const bell = document.getElementById('notificationBell');
    const dropdown = document.getElementById('notificationDropdown');
    if (!bell || !dropdown) {
      return;
    }

    if (bell.dataset.layoutBound === 'true') {
      return;
    }

    bell.addEventListener('click', event => {
      event.stopPropagation();
      dropdown.hidden = !dropdown.hidden;
    });

    dropdown.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('click', () => {
      dropdown.hidden = true;
    });
  }

  function setupSearch() {
    const input = document.getElementById('globalSearch');
    const results = document.getElementById('searchResults');
    if (!input || !results) {
      return;
    }

    if (input.dataset.layoutSearchBound === 'true') {
      return;
    }

    const pages = [
      { label: 'Tableau de bord', url: '/HTML/index.html' },
      { label: 'Utilisateurs', url: '/HTML/utilisateurs.html' },
      { label: 'Statistiques', url: '/HTML/statistiques.html' },
      { label: 'Transactions', url: '/HTML/transactions.html' },
      { label: 'Parametres', url: '/HTML/parametres.html' },
    ];

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
  }

  function closeModal(overlay) {
    if (overlay) {
      overlay.hidden = true;
      overlay.classList.remove('active');
    }
  }

  function openModal(modalId) {
    const overlay = document.getElementById(`${modalId}Overlay`);
    if (overlay) {
      overlay.hidden = false;
      overlay.classList.add('active');
    }
  }

  function setupModals() {
    document.querySelectorAll('[data-modal]').forEach(button => {
      button.addEventListener('click', () => openModal(button.dataset.modal));
    });

    document.querySelectorAll('.modal-close-btn, #modalClose, #modalCancel, #confirmClose, #confirmCancel').forEach(button => {
      button.addEventListener('click', () => closeModal(button.closest('.modal__overlay')));
    });

    document.querySelectorAll('.modal__overlay').forEach(overlay => {
      overlay.addEventListener('click', event => {
        if (event.target === overlay) {
          closeModal(overlay);
        }
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.modal__overlay').forEach(closeModal);
      }
    });
  }

  function prependActivity(title, subtitle) {
    const list = document.querySelector('.activity-list');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <div class="activity-dot"></div>
      <div class="activity-content">
        <p class="activity-title">${escapeHtml(title)}</p>
        <p class="activity-subtitle">${escapeHtml(subtitle)}</p>
        <p class="activity-time">A l'instant</p>
      </div>
    `;
    list.prepend(item);
  }

  function prependNotification(title, time = 'A l\'instant') {
    const list = document.getElementById('notificationList');
    const badge = document.getElementById('notificationBadge');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'notification-item';
    item.innerHTML = `
      <div class="notification-icon">!</div>
      <div class="notification-content">
        <p class="notification-title">${escapeHtml(title)}</p>
        <p class="notification-time">${escapeHtml(time)}</p>
      </div>
    `;
    list.prepend(item);

    if (badge) {
      const current = Number.parseInt(badge.textContent, 10) || 0;
      badge.textContent = String(current + 1);
      badge.hidden = false;
    }
  }

  function prependDashboardUser(user) {
    const tbody = document.querySelector('.table-section table tbody');
    if (!tbody) return;

    const status = user.status || 'Actif';
    const row = document.createElement('tr');
    row.className = 'table-row';
    row.innerHTML = `
      <td><input type="checkbox" class="table-checkbox row-checkbox"/></td>
      <td><button class="user-name-btn" data-name="${escapeHtml(user.name)}" data-email="${escapeHtml(user.email)}" data-role="${escapeHtml(user.role)}" data-status="${escapeHtml(status)}">${escapeHtml(user.name)}</button></td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.role || 'Utilisateur')}</td>
      <td><span class="badge ${getStatusBadgeClass(status)}">${escapeHtml(status)}</span></td>
      <td>A l'instant</td>
      <td>
        <button class="btn btn--sm btn--ghost edit-user-btn" type="button">Editer</button>
        <button class="btn btn--sm btn--ghost delete-user-btn" type="button">Supprimer</button>
      </td>
    `;
    tbody.prepend(row);
  }

  function getReportStatsText(stats) {
    return [
      `Utilisateurs: ${stats.totalUsers ?? 0}`,
      `Transactions: ${stats.totalTransactions ?? 0}`,
      `Montant total: ${Number(stats.totalTransactionAmount || 0).toLocaleString('fr-FR')}`,
      `Transactions en attente: ${stats.pendingTransactions ?? 0}`,
    ].join('\n');
  }

  function getReportCsv(report) {
    const stats = report.stats || {};
    return [
      'champ,valeur',
      `titre,"${String(report.title).replace(/"/g, '""')}"`,
      `type,"${String(report.type).replace(/"/g, '""')}"`,
      `periode,"${String(report.period).replace(/"/g, '""')}"`,
      `cree_le,"${report.createdAt}"`,
      `utilisateurs,"${stats.totalUsers ?? 0}"`,
      `transactions,"${stats.totalTransactions ?? 0}"`,
      `montant_total,"${stats.totalTransactionAmount ?? 0}"`,
      `transactions_en_attente,"${stats.pendingTransactions ?? 0}"`,
    ].join('\n');
  }

  function getReportText(report) {
    return [
      `Rapport demo: ${report.title}`,
      `Type: ${report.type}`,
      `Periode: ${report.period}`,
      `Format demande: ${report.format}`,
      `Genere le: ${new Date(report.createdAt).toLocaleString('fr-FR')}`,
      '',
      'Resume',
      getReportStatsText(report.stats || {}),
      '',
      'Note: fichier genere localement pour la demonstration du projet.',
    ].join('\n');
  }

  function getReportFileName(report, useCsv) {
    const safeTitle = String(report.title || 'rapport')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'rapport';
    return `${safeTitle}-${report.id}.${useCsv ? 'csv' : 'txt'}`;
  }

  function saveReport(report) {
    const key = 'dashboard-demo-reports';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const reports = [report, ...existing].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(reports));
    return report;
  }

  async function buildReportFromForm() {
    let stats = {};
    try {
      stats = await auth.fetchDashboardStats();
    } catch (error) {
      console.error('Unable to include live stats in report:', error);
    }

    return {
      id: Date.now(),
      title: document.getElementById('reportTitle')?.value.trim() || 'Rapport demo',
      type: document.getElementById('reportType')?.value || 'Performance',
      period: document.getElementById('reportPeriod')?.value || 'Ce mois',
      format: document.getElementById('reportFormat')?.value || 'PDF',
      createdAt: new Date().toISOString(),
      stats,
    };
  }

  function downloadReport(report) {
    const requestedFormat = String(report.format || '').toLowerCase();
    const useCsv = requestedFormat === 'csv' || requestedFormat === 'excel';
    const content = useCsv ? getReportCsv(report) : getReportText(report);
    const blob = new Blob([content], {
      type: useCsv ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getReportFileName(report, useCsv);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  let lastGeneratedReport = null;

  function setupActionForms() {
    document.getElementById('addUserForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.target;
      const submitButton = event.submitter;
      submitButton?.setAttribute('disabled', 'disabled');

      const user = {
        name: document.getElementById('newUserName')?.value.trim(),
        email: document.getElementById('newUserEmail')?.value.trim(),
        role: document.getElementById('newUserRole')?.value || 'Utilisateur',
        status: document.getElementById('newUserStatus')?.value || 'Actif',
        password: 'Demo1234',
      };

      try {
        const createdUser = await auth.createUser(user);
        form.reset();
        closeModal(form.closest('.modal__overlay'));
        prependDashboardUser(createdUser || user);
        prependActivity('Utilisateur ajoute', `${user.name} a ete ajoute au backend demo.`);
        prependNotification('Nouvel utilisateur ajoute');
        showToast('Utilisateur ajoute avec succes. Mot de passe demo: Demo1234.', 'success');
        await loadDashboardStats();
      } catch (error) {
        console.error('Unable to create user:', error);
        showToast(error.message || 'Impossible de creer l\'utilisateur.', 'error');
      } finally {
        submitButton?.removeAttribute('disabled');
      }
    });

    document.getElementById('createReportForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.target;
      const submitButton = event.submitter;
      submitButton?.setAttribute('disabled', 'disabled');

      try {
        lastGeneratedReport = saveReport(await buildReportFromForm());
        form.reset();
        closeModal(form.closest('.modal__overlay'));
        prependActivity('Rapport genere', `${lastGeneratedReport.type} - ${lastGeneratedReport.period}`);
        prependNotification('Rapport demo genere');
        showToast('Rapport demo genere avec succes.', 'success');
      } catch (error) {
        console.error('Unable to generate report:', error);
        showToast('Impossible de generer le rapport.', 'error');
      } finally {
        submitButton?.removeAttribute('disabled');
      }
    });

    document.getElementById('downloadReportBtn')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      button.setAttribute('disabled', 'disabled');

      try {
        lastGeneratedReport = saveReport(await buildReportFromForm());
        downloadReport(lastGeneratedReport);
        document.getElementById('createReportForm')?.reset();
        closeModal(button.closest('.modal__overlay'));
        prependActivity('Rapport telecharge', `${lastGeneratedReport.title} est disponible en fichier demo.`);
        prependNotification('Rapport demo telecharge');
        showToast('Rapport telecharge.', 'success');
      } catch (error) {
        console.error('Unable to download report:', error);
        showToast('Impossible de telecharger le rapport.', 'error');
      } finally {
        button.removeAttribute('disabled');
      }
    });

    document.getElementById('newTransactionForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.target;
      const submitButton = event.submitter;
      submitButton?.setAttribute('disabled', 'disabled');
      const transaction = {
        title: document.getElementById('transactionDescription')?.value || 'Nouvelle transaction',
        amount: document.getElementById('transactionAmount')?.value || 0,
        type: document.getElementById('transactionType')?.value || 'Paiement',
        status: normalizeTransactionStatus(document.getElementById('transactionStatus')?.value),
      };

      try {
        await auth.createTransaction(transaction);
        form.reset();
        closeModal(form.closest('.modal__overlay'));
        prependActivity('Transaction creee', `${transaction.title} - ${formatCurrency(transaction.amount)}`);
        prependNotification('Nouvelle transaction creee');
        showToast('Transaction creee avec succes.', 'success');
        await loadDashboardStats();
      } catch (error) {
        console.error('Unable to create transaction:', error);
        showToast(error.message || 'Impossible de creer la transaction.', 'error');
      } finally {
        submitButton?.removeAttribute('disabled');
      }
    });
  }

  function initDashboard() {
    setupProfileMenu();
    setupSidebar();
    setupNotifications();
    setupSearch();
    setupModals();
    setupActionForms();
    loadCurrentUser();
    loadDashboardStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
})();
