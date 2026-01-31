'use client';

/**
 * AuthContext
 * Contexto de autenticación que almacena el token JWT en memoria
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { AuthUser, AuthState } from '@/types/auth';
import { authApi } from '@/services/authApi';

interface AuthContextValue extends AuthState {
  login: (userId: number, email: string) => Promise<void>;
  logout: () => void;
  getAuthHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isAuthenticated = token !== null;

  const login = useCallback(async (userId: number, email: string) => {
    const response = await authApi.login({ userId, email });

    // Almacenar token en memoria
    setToken(response.access_token);
    setUser({ userId, email });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const getAuthHeader = useCallback((): Record<string, string> => {
    if (!token) {
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      login,
      logout,
      getAuthHeader,
    }),
    [isAuthenticated, user, token, login, logout, getAuthHeader]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export para acceso al token desde servicios (singleton pattern)
let globalGetAuthHeader: (() => Record<string, string>) | null = null;

export function setGlobalAuthHeader(
  getAuthHeader: () => Record<string, string>
) {
  globalGetAuthHeader = getAuthHeader;
}

export function getGlobalAuthHeader(): Record<string, string> {
  return globalGetAuthHeader ? globalGetAuthHeader() : {};
}
