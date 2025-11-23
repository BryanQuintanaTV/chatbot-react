/**
 * API Service Layer
 *
 * This file contains all API calls to the backend.
 * Currently using DUMMY DATA for development.
 *
 * TO CONNECT TO REAL BACKEND:
 * 1. Set USE_DUMMY_DATA = false
 * 2. Update API_BASE_URL to your backend URL
 * 3. Implement the endpoints listed in BACKEND_IMPLEMENTATION_GUIDE.md
 */

// Configuration
const USE_DUMMY_DATA = false;
const API_BASE_URL = 'https://apichat.bryanquintana.com/api';

// Helper function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// ============================================================================
// DUMMY DATA - Remove this section when backend is ready
// ============================================================================

const DUMMY_USERS = [
  {
    id: '1',
    email: 'test@chihuahua2.tecnm.mx',
    password: 'Password123!', // Strong password for testing
    name: 'Usuario Demo',
    semester: '5',
    career: 'ingenieria-sistemas-computacionales',
    avatar: null,
    profileComplete: true,
  },
  {
    id: '2',
    email: 'admin@chihuahua2.tecnm.mx',
    password: 'Admin123!',
    name: 'Administrador',
    semester: null,
    career: null,
    avatar: null,
    profileComplete: false,
  }
];

const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

const dummyAuth = {
  async login(email, password) {
    await simulateDelay();

    // Check if account exists
    const userExists = DUMMY_USERS.find(u => u.email === email);
    if (!userExists) {
      const error = new Error('auth.accountNotFound');
      error.code = 'ACCOUNT_NOT_FOUND';
      throw error;
    }

    // Check password
    if (userExists.password !== password) {
      const error = new Error('auth.invalidCredentials');
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    const { password: _, ...userWithoutPassword } = userExists;
    return {
      user: userWithoutPassword,
      token: 'dummy-jwt-token-' + userExists.id,
    };
  },

  async register(userData) {
    await simulateDelay();

    // Check if user already exists
    if (DUMMY_USERS.find(u => u.email === userData.email)) {
      const error = new Error('auth.emailAlreadyExists');
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    // Validate password strength (basic check for dummy)
    const hasUpperCase = /[A-Z]/.test(userData.password);
    const hasLowerCase = /[a-z]/.test(userData.password);
    const hasNumber = /[0-9]/.test(userData.password);
    const hasSymbol = /[^A-Za-z0-9]/.test(userData.password);
    const isLongEnough = userData.password.length >= 8;

    if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSymbol) {
      const error = new Error('auth.passwordTooWeak');
      error.code = 'WEAK_PASSWORD';
      throw error;
    }

    const newUser = {
      id: String(DUMMY_USERS.length + 1),
      ...userData,
      profileComplete: false,
      avatar: null,
    };
    DUMMY_USERS.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      token: 'dummy-jwt-token-' + newUser.id,
    };
  },

  async me(token) {
    await simulateDelay(300);
    // Extract user ID from dummy token
    const userId = token.replace('dummy-jwt-token-', '');
    const user = DUMMY_USERS.find(u => u.id === userId);
    if (!user) {
      throw new Error('Invalid token');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async updateProfile(token, updates) {
    await simulateDelay();
    const userId = token.replace('dummy-jwt-token-', '');
    const userIndex = DUMMY_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user data
    DUMMY_USERS[userIndex] = {
      ...DUMMY_USERS[userIndex],
      ...updates,
      profileComplete: !!(updates.semester && updates.career),
    };

    const { password: _, ...userWithoutPassword } = DUMMY_USERS[userIndex];
    return userWithoutPassword;
  },

  async changePassword(token, currentPassword, newPassword) {
    await simulateDelay();
    const userId = token.replace('dummy-jwt-token-', '');
    const user = DUMMY_USERS.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
    return { success: true };
  },

  async deleteAccount(token) {
    await simulateDelay();
    const userId = token.replace('dummy-jwt-token-', '');
    const userIndex = DUMMY_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    DUMMY_USERS.splice(userIndex, 1);
    return { success: true };
  },
};

// ============================================================================
// REAL API FUNCTIONS - These will call the actual backend
// ============================================================================

const realAuth = {
  async login(email, password) {
    const csrfToken = getCsrfToken();
    const headers = { 'Content-Type': 'application/json' };

    const fetchOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    };

    // Only include credentials if we have a CSRF token (backend supports it)
    // This prevents CORS errors when backend is not configured for credentials
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, fetchOptions);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    return await response.json();
  },

  async register(userData) {
    const csrfToken = getCsrfToken();
    const headers = { 'Content-Type': 'application/json' };

    const fetchOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(userData),
    };

    // Only include credentials if we have a CSRF token
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, fetchOptions);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return await response.json();
  },

  async me(token) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      // Don't use credentials for GET requests with Bearer token
    });
    if (!response.ok) {
      // Try to parse error response for suspension info
      try {
        const errorData = await response.json();

        // Check if this is an account suspension error
        if (response.status === 403 && (
          errorData.code === 'ACCOUNT_SUSPENDED' ||
          errorData.detail?.includes('suspended') ||
          errorData.detail?.includes('auth.accountSuspended')
        )) {
          // Create a special error with suspension info
          const error = new Error('ACCOUNT_SUSPENDED');
          error.code = 'ACCOUNT_SUSPENDED';
          error.reason = errorData.reason || errorData.suspensionReason || null;
          error.suspendedUntil = errorData.suspendedUntil || null;
          error.isPermanent = !errorData.suspendedUntil;
          throw error;
        }

        // Other errors
        throw new Error(errorData.detail || 'Invalid token');
      } catch (e) {
        // If we already threw a structured error, re-throw it
        if (e.code === 'ACCOUNT_SUSPENDED') {
          throw e;
        }
        // Otherwise, it's a parsing error or generic error
        throw new Error('Invalid token');
      }
    }
    return await response.json();
  },

  async updateProfile(token, updates) {
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const fetchOptions = {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    };

    // Only include credentials if we have a CSRF token
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, fetchOptions);
    if (!response.ok) {
      // Try to parse error as JSON, but handle HTML responses
      let errorMessage = 'Update failed';
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch (e) {
        // Response is not JSON (probably HTML error page)
        errorMessage = `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  async changePassword(token, currentPassword, newPassword) {
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const fetchOptions = {
      method: 'PUT',
      headers,
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    };

    // Only include credentials if we have a CSRF token
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/auth/password`, fetchOptions);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Password change failed');
    }
    return await response.json();
  },

  async deleteAccount(token) {
    const csrfToken = getCsrfToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    const fetchOptions = {
      method: 'DELETE',
      headers,
    };

    // Only include credentials if we have a CSRF token
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/auth/account`, fetchOptions);
    if (!response.ok) {
      throw new Error('Delete account failed');
    }
    return await response.json();
  },
};

// ============================================================================
// EXPORTED API - Automatically uses dummy or real based on configuration
// ============================================================================

export const authAPI = USE_DUMMY_DATA ? dummyAuth : realAuth;

// Helper to check if token is valid
export const isTokenValid = (token) => {
  if (!token) return false;

  if (USE_DUMMY_DATA) {
    // For dummy mode, just check if token exists
    return token.startsWith('dummy-jwt-token-');
  }

  // For real mode, check JWT expiration
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// ============================================================================
// CONVERSATION API - For managing chat history
// ============================================================================

const dummyConversations = {
  async getAll(token) {
    await simulateDelay(500);
    // Return empty for dummy mode - frontend uses localStorage
    return [];
  },

  async create(token, data) {
    await simulateDelay();
    return {
      id: Date.now().toString(),
      ...data,
      pinned: false,
      archived: false,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async getById(token, conversationId) {
    await simulateDelay();
    throw new Error('Conversation not found');
  },

  async update(token, conversationId, updates) {
    await simulateDelay();
    return {
      id: conversationId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  },

  async delete(token, conversationId) {
    await simulateDelay();
    return { success: true };
  },

  async clearMessages(token, conversationId) {
    await simulateDelay();
    return { success: true };
  },

  async addMessage(token, conversationId, messageData) {
    await simulateDelay();
    return {
      id: Date.now().toString(),
      conversationId,
      ...messageData,
      createdAt: new Date().toISOString(),
    };
  },
};

const realConversations = {
  async getAll(token) {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      // Don't use credentials for GET requests with Bearer token
    });
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    return await response.json();
  },

  async create(token, data) {
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const fetchOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    };

    // Only include credentials if we have a CSRF token
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/conversations`, fetchOptions);
    if (!response.ok) {
      // Try to parse error as JSON, but handle HTML responses
      let errorMessage = 'Failed to create conversation';
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch (e) {
        // Response is not JSON (probably HTML error page)
        errorMessage = `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  async getById(token, conversationId) {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      // Don't use credentials for GET requests
    });
    if (!response.ok) {
      throw new Error('Conversation not found');
    }
    return await response.json();
  },

  async update(token, conversationId, updates) {
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const fetchOptions = {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    };

    // Only include credentials if we have a CSRF token
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, fetchOptions);
    if (!response.ok) {
      // Try to parse error as JSON, but handle HTML responses
      let errorMessage = 'Failed to update conversation';
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch (e) {
        // Response is not JSON (probably HTML error page)
        errorMessage = `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  async delete(token, conversationId) {
    const csrfToken = getCsrfToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    const fetchOptions = {
      method: 'DELETE',
      headers,
    };

    // Only include credentials if we have a CSRF token
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, fetchOptions);
    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
    return await response.json();
  },

  async clearMessages(token, conversationId) {
    const csrfToken = getCsrfToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    const fetchOptions = {
      method: 'DELETE',
      headers,
    };

    // Only include credentials if we have a CSRF token
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, fetchOptions);
    if (!response.ok) {
      throw new Error('Failed to clear messages');
    }
    return await response.json();
  },

  async addMessage(token, conversationId, messageData) {
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const fetchOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(messageData),
    };

    // Only include credentials if we have a CSRF token
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      fetchOptions.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, fetchOptions);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add message');
    }
    return await response.json();
  },
};

export const conversationsAPI = USE_DUMMY_DATA ? dummyConversations : realConversations;
