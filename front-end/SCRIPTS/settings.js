(() => {
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
    setText('sessionUser', session?.name || session?.email || '-');
    setText('sessionRole', session?.role || '-');
  }

  function fillProfile(user) {
    const name = document.getElementById('admin-name');
    const email = document.getElementById('admin-email');
    const role = document.getElementById('admin-role');

    if (name) name.value = user?.name || '';
    if (email) email.value = user?.email || '';
    if (role) role.value = user?.role || 'Utilisateur';

    setText('avatarText', getInitials(user));
    setText('sessionUser', user?.name || user?.email || '-');
    setText('sessionRole', user?.role || '-');
  }

  async function loadProfile() {
    const session = window.auth?.getStoredSession?.();
    fillProfile(session);

    try {
      const user = await window.auth.fetchCurrentUser();
      fillProfile(user);
    } catch (error) {
      console.error('Unable to load profile:', error);
    }
  }

  function loadPreferences() {
    const themeSelect = document.getElementById('themePreference');
    const languageSelect = document.getElementById('languagePreference');

    if (themeSelect) themeSelect.value = localStorage.getItem('dashboard-theme') || 'light';
    if (languageSelect) languageSelect.value = localStorage.getItem('dashboard-language') || 'Français';
  }

  async function saveProfile(event) {
    event.preventDefault();

    const name = document.getElementById('admin-name')?.value.trim();
    const email = document.getElementById('admin-email')?.value.trim();
    const password = document.getElementById('new-password')?.value;

    if (!name || !email) {
      window.showToast?.('Le nom et l’email sont requis.', 'warning');
      return;
    }

    const updates = { name, email };
    if (password) {
      if (password.length < 6) {
        window.showToast?.('Le mot de passe doit contenir au moins 6 caractères.', 'warning');
        return;
      }
      updates.password = password;
    }

    try {
      const updated = await window.auth.updateProfile(updates);
      const currentSession = window.auth.getStoredSession() || {};
      window.auth.saveSession({ ...currentSession, ...updated, token: currentSession.token });
      document.getElementById('new-password').value = '';
      fillProfile(updated);
      window.showToast?.('Profil mis à jour.', 'success');
    } catch (error) {
      console.error('Unable to update profile:', error);
      window.showToast?.(error.message || 'Impossible de mettre à jour le profil.', 'error');
    }
  }

  function savePreferences(event) {
    event.preventDefault();

    const theme = document.getElementById('themePreference')?.value || 'light';
    const language = document.getElementById('languagePreference')?.value || 'Français';

    localStorage.setItem('dashboard-language', language);
    window.themeManager?.setTheme(theme);
    window.showToast?.('Préférences mises à jour.', 'success');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth?.isLoggedIn?.()) {
      window.location.href = '/HTML/signin.html';
      return;
    }

    setupChrome();
    loadPreferences();
    loadProfile();

    document.getElementById('profileForm')?.addEventListener('submit', saveProfile);
    document.getElementById('preferencesForm')?.addEventListener('submit', savePreferences);
  });
})();
