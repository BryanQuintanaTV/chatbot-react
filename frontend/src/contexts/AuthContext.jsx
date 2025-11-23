import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, isTokenValid } from '@/services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && isTokenValid(storedToken)) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    } else {
      // Token is invalid or doesn't exist, clear storage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      // Check if user is suspended (backend might allow login but mark as suspended)
      if (response.user && response.user.isSuspended) {
        // Create suspension error instead of logging in
        const error = new Error('ACCOUNT_SUSPENDED');
        error.code = 'ACCOUNT_SUSPENDED';
        error.reason = response.user.suspensionReason || null;
        error.suspendedUntil = response.user.suspendedUntil || null;
        error.isPermanent = !response.user.suspendedUntil;
        throw error;
      }

      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    // Clear user conversations on logout
    localStorage.removeItem('chatbot-conversations');
    localStorage.removeItem('chatbot-active-chat');
  };

  const updateUser = async (updates) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      const updatedUser = await authAPI.updateProfile(token, updates);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      await authAPI.changePassword(token, currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      await authAPI.deleteAccount(token);
      logout();
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    deleteAccount,
    loading,
    isAuthenticated: !!user && !!token && isTokenValid(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
