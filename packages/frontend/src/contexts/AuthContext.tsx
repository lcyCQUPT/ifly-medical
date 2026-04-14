import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@ifly-medical/shared';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../api/auth';
import { setLogoutCallback } from '../api/http';
import { AuthContext } from './auth-context';

const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'auth_user';

interface AuthProviderProps extends PropsWithChildren {
  queryClient: QueryClient;
}

interface StoredAuthState {
  hasToken: boolean;
  user: AuthUser | null;
}

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function readStoredAuthState(): StoredAuthState {
  return {
    hasToken: !!localStorage.getItem(TOKEN_STORAGE_KEY),
    user: readStoredUser(),
  };
}

export function AuthProvider({ children, queryClient }: AuthProviderProps) {
  const [authState, setAuthState] = useState<StoredAuthState>(readStoredAuthState);
  const navigate = useNavigate();
  const meQuery = useMe(authState.hasToken);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    queryClient.clear();
    setAuthState({ hasToken: false, user: null });
    navigate('/login', { replace: true });
  }, [navigate, queryClient]);

  const login = useCallback((token: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setAuthState({ hasToken: true, user: nextUser });
    navigate('/profile', { replace: true });
  }, [navigate]);

  useEffect(() => {
    setLogoutCallback(logout);
    return () => setLogoutCallback(null);
  }, [logout]);

  useEffect(() => {
    if (meQuery.data) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(meQuery.data));
    }
  }, [meQuery.data]);

  const user = meQuery.data ?? authState.user;
  const isLoading = authState.hasToken && meQuery.isPending;

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
