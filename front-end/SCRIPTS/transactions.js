(() => {
  let transactions = [];
  let searchQuery = '';

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatCurrency(value) {
    return `€ ${Number(value || 0).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  function getStatusMeta(status) {
    const normalized = String(status || 'pending').toLowerCase();
    if (['completed', 'complete', 'success', 'réussie', 'reussie'].includes(normalized)) {
      return { label: 'Réussie', className: 'status-pill--success' };
    }
    if (['failed', 'échouée', 'echouee', 'error'].includes(normalized)) {
      return { label: 'Échouée', className: 'status-pill--danger' };
    }
    return { label: 'En attente', className: 'status-pill--warning' };
  }

  function updateSummary(list) {
    const completed = list.filter(tx => getStatusMeta(tx.status).className === 'status-pill--success').length;
    const pending = list.filter(tx => getStatusMeta(tx.status).className === 'status-pill--warning').length;
    const total = list.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    setText('totalTransactions', list.length);
    setText('totalAmount', formatCurrency(total));
    setText('completedTransactions', completed);
    setText('pendingTransactions', pending);
  }

  function renderTransactions() {
    const tbody = document.querySelector('[data-transactions-list]');
    if (!tbody) return;

    const query = searchQuery.toLowerCase();
    const filtered = transactions.filter(tx => {
      const haystack = `${tx.id || ''} ${tx.title || ''} ${tx.type || ''} ${tx.status || ''}`.toLowerCase();
      return haystack.includes(query);
    });

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Aucune transaction trouvée.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(tx => {
      const status = getStatusMeta(tx.status);
      return `
        <tr>
          <td>${escapeHtml(tx.id ?? '-')}</td>
          <td>${escapeHtml(tx.title || 'Transaction')}</td>
          <td>${escapeHtml(tx.type || '-')}</td>
          <td>${formatCurrency(tx.amount)}</td>
          <td><span class="status-pill ${status.className}">${status.label}</span></td>
          <td>${formatDate(tx.date || tx.created_at)}</td>
        </tr>
      `;
    }).join('');
  }

  async function loadTransactions() {
    const tbody = document.querySelector('[data-transactions-list]');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Chargement des transactions...</td></tr>';
    }

    try {
      transactions = await window.auth.fetchTransactions();
      if (!Array.isArray(transactions)) transactions = [];
      updateSummary(transactions);
      renderTransactions();
    } catch (error) {
      console.error('Unable to load transactions:', error);
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Erreur lors du chargement des transactions.</td></tr>';
      }
    }
  }

  function setupForm() {
    const form = document.getElementById('transactionForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const formData = new FormData(form);
      const transaction = {
        title: formData.get('title'),
        amount: formData.get('amount'),
        type: formData.get('type'),
        status: formData.get('status') || 'pending',
      };

      try {
        await window.auth.createTransaction(transaction);
        form.reset();
        window.showToast?.('Transaction créée avec succès.', 'success');
        await loadTransactions();
      } catch (error) {
        console.error('Unable to create transaction:', error);
        window.showToast?.(error.message || 'Impossible de créer la transaction.', 'error');
      }
    });
  }

  function setupEvents() {
    document.getElementById('refreshTransactionsBtn')?.addEventListener('click', loadTransactions);
    document.getElementById('transactionSearch')?.addEventListener('input', event => {
      searchQuery = event.target.value.trim();
      renderTransactions();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth?.isLoggedIn?.()) {
      window.location.href = '/HTML/signin.html';
      return;
    }

    setupChrome();
    setupForm();
    setupEvents();
    loadTransactions();
  });
})();
