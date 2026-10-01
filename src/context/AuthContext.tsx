import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '../types';
import { api, ApiError } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('medimate_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('medimate_token');
  });

  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('medimate_token');
    localStorage.removeItem('medimate_user');
    setUser(null);
    setToken(null);
  }, []);

  // Check and verify token on initial load
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('medimate_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await api.get<User>('/auth/me');
        setUser(currentUser);
        localStorage.setItem('medimate_user', JSON.stringify(currentUser));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('medimate_token', data.token);
    localStorage.setItem('medimate_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.post<AuthResponse>('/auth/register', { name, email, password });
    localStorage.setItem('medimate_token', data.token);
    localStorage.setItem('medimate_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const loginDemo = async () => {
    const data = await api.post<AuthResponse>('/auth/login', {
      email: 'demo@medimate.ai',
      password: 'DemoUser123!',
      isDemo: true,
    });
    localStorage.setItem('medimate_token', data.token);
    localStorage.setItem('medimate_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('medimate_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginDemo, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
