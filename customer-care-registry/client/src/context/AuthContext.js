import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as loginApi, register as registerApi, getMe } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, rehydrate the session from localStorage + verify token with backend
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('ccr_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await getMe();
        setUser(data.data);
      } catch (err) {
        localStorage.removeItem('ccr_token');
        localStorage.removeItem('ccr_user');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await loginApi(email, password);
    localStorage.setItem('ccr_token', data.data.token);
    localStorage.setItem('ccr_user', JSON.stringify(data.data));
    setUser(data.data);
    return data.data;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const { data } = await registerApi(name, email, password, role);
    localStorage.setItem('ccr_token', data.data.token);
    localStorage.setItem('ccr_user', JSON.stringify(data.data));
    setUser(data.data);
    return data.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ccr_token');
    localStorage.removeItem('ccr_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
