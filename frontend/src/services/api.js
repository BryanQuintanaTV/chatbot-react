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
const USE_DUMMY_DATA = true;
const API_BASE_URL = 'http://localhost:8000/api';

// ============================================================================
// DUMMY DATA - Remove this section when backend is ready
// ============================================================================

const DUMMY_USERS = [
  {
    id: '1',
    email: 'test@chihuahua2.tecnm.mx',
    password: 'password123', // In real backend, this would be hashed
    name: 'Usuario Demo',
    semester: '5',
    career: 'ingenieria-sistemas-computacionales',
    avatar: null,
    profileComplete: true,
  }
];

const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

const dummyAuth = {
  async login(email, password) {
    await simulateDelay();
    const user = DUMMY_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: 'dummy-jwt-token-' + user.id,
    };
  },

  async register(userData) {
    await simulateDelay();
    // Check if user already exists
    if (DUMMY_USERS.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    return await response.json();
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
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
    });
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    return await response.json();
  },

  async updateProfile(token, updates) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Update failed');
    }
    return await response.json();
  },

  async changePassword(token, currentPassword, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Password change failed');
    }
    return await response.json();
  },

  async deleteAccount(token) {
    const response = await fetch(`${API_BASE_URL}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
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
