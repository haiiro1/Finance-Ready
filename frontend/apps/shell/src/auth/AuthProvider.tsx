import { useCallback, useEffect, useState } from 'react';
import type { AuthUser } from '@finance-ready/shared-types';
import { AuthContext } from './authContext';
import { getMe, login as apiLogin, loginWithGoogle as apiLoginWithGoogle } from './authApi';
import { authStorage } from './authStorage';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!authStorage.getToken());

  useEffect(() => {
    const storedToken = authStorage.getToken();
    if (!storedToken) return;

    getMe(storedToken)
      .then((me) => {
        setToken(storedToken);
        setUser(me);
      })
      .catch(() => {
        authStorage.clear();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin({ email, password });
    authStorage.set(response.access_token, response.user);
    setToken(response.access_token);
    setUser(response.user);
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const response = await apiLoginWithGoogle({ credential });
    authStorage.set(response.access_token, response.user);
    setToken(response.access_token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
