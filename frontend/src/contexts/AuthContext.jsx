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

/**
 * Default restriction set — all actions allowed.
 * The backend may return a partial or full restrictions object;
 * missing keys default to `true` (unrestricted).
 */
const DEFAULT_RESTRICTIONS = {
  canCreateChats: true,
  canChangeAvatar: true,
  canChangeName: true,
  canChangeEmail: true,
  canChangeSemester: true,
  canChangeCareer: true,
  canChangeModel: true,
  canEditChatOptions: true,
  canChangePassword: true,
};

function mergeRestrictions(userRestrictions) {
  if (!userRestrictions) return DEFAULT_RESTRICTIONS;
  return { ...DEFAULT_RESTRICTIONS, ...userRestrictions };
}

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

      // Always authenticate the user, even if suspended
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);

      // Notify SystemConfigContext to switch to SSE
      window.dispatchEvent(new Event('auth:login'));

      // Check if user is suspended (backend might allow login but mark as suspended)
      if (response.user && response.user.isSuspended) {
        // Create suspension error so Login.jsx knows to navigate to /suspended
        const error = new Error('ACCOUNT_SUSPENDED');
        error.code = 'ACCOUNT_SUSPENDED';
        error.reason = response.user.suspensionReason || null;
        error.suspendedUntil = response.user.suspendedUntil || null;
        error.isPermanent = !response.user.suspendedUntil;
        throw error;
      }

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

      // Notify SystemConfigContext to switch to SSE
      window.dispatchEvent(new Event('auth:login'));

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

    // Notify SystemConfigContext to switch back to polling
    window.dispatchEvent(new Event('auth:logout'));
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

  const uploadAvatar = async (file) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      const updatedUser = await authAPI.uploadAvatar(token, file);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Upload avatar error:', error);
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

  // Merge restrictions from DB (via user object) with defaults.
  // The backend sends `restrictions` as a nested object on the user.
  const restrictions = mergeRestrictions(user?.restrictions);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    uploadAvatar,
    changePassword,
    deleteAccount,
    loading,
    isAuthenticated: !!user && !!token && isTokenValid(token),
    // Admin-defined per-user restrictions (all default to true = unrestricted)
    restrictions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
