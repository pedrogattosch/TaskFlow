import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { authTokenStorage } from '../services/authTokenStorage';
import type { AuthSession, LoginCredentials } from '../types/auth';

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => authTokenStorage.getSession());

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      async login(credentials) {
        const auth = await authService.login(credentials);
        authTokenStorage.saveSession(auth);
        setSession(auth);
      },
      logout() {
        authTokenStorage.clearSession();
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
