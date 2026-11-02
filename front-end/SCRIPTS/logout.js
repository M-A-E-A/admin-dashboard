// Logout helper
function setupLogout() {
  const logoutButtons = document.querySelectorAll('[data-action="logout"]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.auth?.logout) {
        window.auth.logout('/HTML/signin.html');
      } else {
        window.location.href = '/HTML/signin.html';
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLogout);
} else {
  setupLogout();
}
