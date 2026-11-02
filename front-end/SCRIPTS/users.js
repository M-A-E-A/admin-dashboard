(() => {
  let users = [];
  let searchQuery = '';

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR');
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

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

  function setupChrome() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebar && sidebarToggle && sidebarToggle.dataset.layoutBound !== 'true') {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    const session = window.auth?.getStoredSession?.();
    setText('avatarText', getInitials(session));

    const profileAvatar = document.getElementById('profileAvatar');
    const profileMenu = document.getElementById('profileMenu');
    if (profileAvatar && !profileMenu && profileAvatar.dataset.layoutBound !== 'true') {
      profileAvatar.addEventListener('click', () => {
        window.location.href = '/HTML/parametres.html';
      });
    }
  }

  function getStatusMeta(user) {
    const role = user.role || 'user';
    const normalizedRole = String(role).toLowerCase();
    const normalizedStatus = String(user.status || '').toLowerCase();

    if (normalizedStatus.includes('inactif') || normalizedStatus.includes('inactive')) {
      return { label: user.status, className: 'status-pill--danger' };
    }
    if (normalizedStatus.includes('attente') || normalizedStatus.includes('pending')) {
      return { label: user.status, className: 'status-pill--warning' };
    }
    if (normalizedStatus.includes('actif') || normalizedStatus.includes('active')) {
      return { label: user.status, className: 'status-pill--success' };
    }
    if (normalizedRole.includes('admin')) {
      return { label: 'Gestion', className: 'status-pill--success' };
    }
    return { label: 'Standard', className: 'status-pill--warning' };
  }

  function updateSummary(list) {
    const adminCount = list.filter(user => String(user.role || '').toLowerCase().includes('admin')).length;
    const latest = [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];

    setText('totalUsers', list.length);
    setText('adminUsers', adminCount);
    setText('memberUsers', Math.max(list.length - adminCount, 0));
    setText('latestUser', latest ? formatDate(latest.created_at) : '-');
  }

  function renderUsers() {
    const tbody = document.querySelector('[data-users-list]');
    if (!tbody) return;

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => {
      const haystack = `${user.name || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase();
      return haystack.includes(query);
    });

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Aucun utilisateur trouvé.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(user => {
      const role = user.role || 'user';
      const status = getStatusMeta(user);

      return `
        <tr>
          <td>${escapeHtml(user.id ?? '-')}</td>
          <td>${escapeHtml(user.name || 'Utilisateur')}</td>
          <td>${escapeHtml(user.email || '-')}</td>
          <td>${escapeHtml(role)}</td>
          <td>${formatDate(user.created_at)}</td>
          <td><span class="status-pill ${status.className}">${escapeHtml(status.label)}</span></td>
        </tr>
      `;
    }).join('');
  }

  async function loadUsers() {
    const tbody = document.querySelector('[data-users-list]');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Chargement des utilisateurs...</td></tr>';
    }

    try {
      users = await window.auth.fetchUsers();
      if (!Array.isArray(users)) users = [];
      updateSummary(users);
      renderUsers();
    } catch (error) {
      console.error('Unable to load users:', error);
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Erreur lors du chargement des utilisateurs.</td></tr>';
      }
    }
  }

  function setupEvents() {
    document.getElementById('refreshUsersBtn')?.addEventListener('click', loadUsers);
    document.getElementById('userSearch')?.addEventListener('input', event => {
      searchQuery = event.target.value.trim();
      renderUsers();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth?.isLoggedIn?.()) {
      window.location.href = '/HTML/signin.html';
      return;
    }

    setupChrome();
    setupEvents();
    loadUsers();
  });
})();
