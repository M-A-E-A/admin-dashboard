// Statistics page handler
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!api.isLoggedIn()) {
    window.location.href = '/HTML/signin.html';
    return;
  }

  // Load stats from API
  await loadStats();
});

async function loadStats() {
  try {
    const response = await api.getStats();
    
    if (response?.success) {
      const stats = response.data;
      displayStats(stats);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    api.showError('Failed to load statistics');
  }
}

function displayStats(stats) {
  // Total Users card
  const totalUsersCard = document.querySelector('[data-stat="totalUsers"]');
  if (totalUsersCard) {
    totalUsersCard.innerHTML = `
      <div class="stat-card-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="rgba(102, 126, 234, 0.1)"/>
          <path d="M11 14c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.21 0-6.5 1.109-6.5 3.5V20h13v-1.5c0-2.391-4.29-3.5-6.5-3.5z" fill="#667eea"/>
        </svg>
      </div>
      <div class="stat-card-content">
        <p class="stat-card-label">Total Users</p>
        <h3 class="stat-card-value">${stats.totalUsers || 0}</h3>
        <span class="stat-card-change">Updated now</span>
      </div>
    `;
  }

  // Total Transactions card
  const totalTransactionsCard = document.querySelector('[data-stat="totalTransactions"]');
  if (totalTransactionsCard) {
    totalTransactionsCard.innerHTML = `
      <div class="stat-card-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="rgba(16, 185, 129, 0.1)"/>
          <path d="M8 12h16v8H8z" fill="none" stroke="#10b981" stroke-width="2"/>
          <line x1="10" y1="14" x2="22" y2="14" stroke="#10b981" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="stat-card-content">
        <p class="stat-card-label">Total Transactions</p>
        <h3 class="stat-card-value">${stats.totalTransactions || 0}</h3>
        <span class="stat-card-change">All time</span>
      </div>
    `;
  }

  // Total Amount card
  const totalAmountCard = document.querySelector('[data-stat="totalAmount"]');
  if (totalAmountCard) {
    const amount = stats.totalTransactionAmount ? `$${parseFloat(stats.totalTransactionAmount).toFixed(2)}` : '$0.00';
    totalAmountCard.innerHTML = `
      <div class="stat-card-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="rgba(245, 158, 11, 0.1)"/>
          <text x="16" y="18" text-anchor="middle" fill="#f59e0b" font-size="16" font-weight="bold">$</text>
        </svg>
      </div>
      <div class="stat-card-content">
        <p class="stat-card-label">Total Amount</p>
        <h3 class="stat-card-value">${amount}</h3>
        <span class="stat-card-change">In transactions</span>
      </div>
    `;
  }

  // Pending Transactions card
  const pendingCard = document.querySelector('[data-stat="pending"]');
  if (pendingCard) {
    pendingCard.innerHTML = `
      <div class="stat-card-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="rgba(239, 68, 68, 0.1)"/>
          <circle cx="16" cy="16" r="8" fill="none" stroke="#ef4444" stroke-width="2"/>
          <path d="M16 12v4l3 2" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="stat-card-content">
        <p class="stat-card-label">Pending</p>
        <h3 class="stat-card-value">${stats.pendingTransactions || 0}</h3>
        <span class="stat-card-change">Awaiting</span>
      </div>
    `;
  }
}
