import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { useNotification } from './NotificationContext';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5001/api/v1');

const DEFAULT_ANONYMOUS: User = {
  id: 'anonymous',
  name: 'Public Visitor',
  email: null,
  role: 'ANONYMOUS',
  dept: 'Public',
  avatar: 'PV'
};

interface AuthContextProps {
  user: User;
  token: string | null;
  login: (roleKey: string | null, username: string | null) => Promise<boolean>;
  logout: () => void;
  apiRequest: (url: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEFAULT_ANONYMOUS);
  const [token, setToken] = useState<string | null>(null);
  const { showToast } = useNotification();

  // Load user session from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('docshield_user');
    const storedToken = localStorage.getItem('docshield_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('docshield_user');
        localStorage.removeItem('docshield_token');
      }
    }
  }, []);

  const login = useCallback(async (roleKey: string | null, username: string | null): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleKey, username })
      });

      if (!response.ok) {
        const err = await response.json();
        showToast(err.error || 'Authentication Failed', 'error');
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);

      localStorage.setItem('docshield_user', JSON.stringify(data.user));
      localStorage.setItem('docshield_token', data.token);

      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return true;
    } catch (error) {
      showToast('Backend Server Connection Refused. Ensure server is active.', 'error');
      return false;
    }
  }, [showToast]);

  const logout = useCallback(() => {
    setUser(DEFAULT_ANONYMOUS);
    setToken(null);
    localStorage.removeItem('docshield_user');
    localStorage.removeItem('docshield_token');
    showToast('Signed out successfully.', 'success');
  }, [showToast]);

  // Unified fetch helper
  const apiRequest = useCallback(async (url: string, options: RequestInit = {}): Promise<any> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const mergedOptions: RequestInit = {
      ...options,
      headers
    };

    const response = await fetch(`${API_BASE}${url}`, mergedOptions);
    
    if (response.status === 401) {
      // Token expired or invalid
      logout();
      window.location.hash = '#login';
      throw new Error('Session Expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    // Handle CSV or downloads vs standard JSON
    const contentType = response.headers.get('Content-Type') || '';
    const contentDisposition = response.headers.get('Content-Disposition') || '';
    if (
      contentType.includes('text/csv') ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('text/plain') ||
      contentType.includes('application/pdf') ||
      contentDisposition.includes('attachment')
    ) {
      return response;
    }

    return response.json();
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, apiRequest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
