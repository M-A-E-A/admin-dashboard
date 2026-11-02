// Centralized API configuration and wrapper
const API_BASE_URL = 'http://localhost:5000/api';

function requireAuth() {
  if (!window.auth) {
    throw new Error('Auth helper is not loaded.');
  }
  return window.auth;
}

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getSession() {
    return window.auth?.getStoredSession?.() || null;
  }

  getToken() {
    return window.auth?.getToken?.() || null;
  }

  isLoggedIn() {
    return window.auth?.isLoggedIn?.() === true;
  }

  redirectToLogin() {
    if (window.auth?.logout) {
      window.auth.logout('/HTML/signin.html');
    } else {
      window.location.href = '/HTML/signin.html';
    }
  }

  // Make API request
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      authenticated = false,
      showLoading = true,
    } = options;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Add authentication token if required
    if (authenticated) {
      const token = this.getToken();
      if (!token) {
        this.redirectToLogin();
        return null;
      }
      headers.Authorization = `Bearer ${token}`;
    }

    // Show loading state
    if (showLoading) {
      this.showLoadingState(true);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        // If JSON parse fails, create error object
        data = { success: false, message: 'Invalid server response' };
      }

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          this.redirectToLogin();
          return null;
        }

        // Handle other HTTP errors
        const message = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError) {
        const message = 'Network error: Unable to connect to server. Check your connection.';
        console.error(`API Error [${method} ${endpoint}]:`, message);
        this.showError(message);
        throw new Error(message);
      }
      
      console.error(`API Error [${method} ${endpoint}]:`, error);
      const displayMessage = error.message || 'An error occurred. Please try again.';
      this.showError(displayMessage);
      throw error;
    } finally {
      if (showLoading) {
        this.showLoadingState(false);
      }
    }
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (response?.data?.token) {
      requireAuth().saveSession(response);
    }
    return response;
  }

  async register(name, email, password) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    if (response?.data?.token) {
      requireAuth().saveSession(response);
    }
    return response;
  }

  async resetPassword(email, password) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: { email, password },
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me', {
      authenticated: true,
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/users', {
      authenticated: true,
    });
  }

  async createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: data,
      authenticated: true,
    });
  }

  async getUser(id) {
    return this.request(`/users/${id}`, {
      authenticated: true,
    });
  }

  async getUserProfile() {
    return this.request('/auth/me', {
      authenticated: true,
    });
  }

  async updateUserProfile(updates) {
    const userId = this.getSession()?.id;
    if (!userId) {
      throw new Error('User ID not found in session');
    }
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: updates,
      authenticated: true,
    });
  }

  // Transaction endpoints
  async getTransactions() {
    return this.request('/transactions', {
      authenticated: true,
    });
  }

  async createTransaction(data) {
    return this.request('/transactions', {
      method: 'POST',
      body: data,
      authenticated: true,
    });
  }

  // Stats endpoints
  async getStats() {
    return this.request('/stats', {
      authenticated: true,
    });
  }

  // UI Helper: Show/hide loading state
  showLoadingState(show) {
    // Create a global loading indicator if it doesn't exist
    let loader = document.getElementById('global-loader');
    if (!loader && show) {
      loader = document.createElement('div');
      loader.id = 'global-loader';
      loader.className = 'global-loader';
      loader.innerHTML = '<div class="loader-spinner"></div>';
      document.body.appendChild(loader);
    }
    if (loader) {
      loader.style.display = show ? 'flex' : 'none';
    }
  }

  // UI Helper: Show error message
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'global-notification error';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // UI Helper: Show success message
  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'global-notification success';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
  }

  logout() {
    requireAuth().logout('/HTML/signin.html');
  }
}

// Export singleton instance
const api = new ApiClient();
