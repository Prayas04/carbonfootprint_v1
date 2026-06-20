/* eslint-disable react-refresh/only-export-components */
/**
 * AuthContext — React context for authentication state management.
 * Provides login/logout/register and auto-login on mount.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe, logout as apiLogout } from '../api/auth.js';
import { isAuthenticated } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a valid token and fetch user
  useEffect(() => {
    async function checkAuth() {
      if (isAuthenticated()) {
        try {
          const me = await getMe();
          setUser(me);
        } catch {
          // Token expired or invalid
          apiLogout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    await apiLogin(email, password);
    const me = await getMe();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    await apiRegister(email, password, fullName);
    // Auto-login after registration
    await apiLogin(email, password);
    const me = await getMe();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
