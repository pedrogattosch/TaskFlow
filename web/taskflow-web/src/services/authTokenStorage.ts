import type { AuthResponse, AuthSession } from '../types/auth';

const AUTH_TOKEN_KEY = 'taskflow.auth.accessToken';
const AUTH_USER_KEY = 'taskflow.auth.user';

type StoredUser = Pick<AuthResponse, 'userId' | 'name' | 'email' | 'expiresAt'>;

export const authTokenStorage = {
  saveSession(auth: AuthSession) {
    localStorage.setItem(AUTH_TOKEN_KEY, auth.accessToken);
    localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify({
        userId: auth.userId,
        name: auth.name,
        email: auth.email,
        expiresAt: auth.expiresAt,
      } satisfies StoredUser),
    );
  },

  getSession(): AuthSession | null {
    const accessToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (!accessToken || !storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser) as StoredUser;
      const session = { ...user, accessToken };

      if (Number.isNaN(Date.parse(session.expiresAt)) || new Date(session.expiresAt) <= new Date()) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      this.clearSession();
      return null;
    }
  },

  getAccessToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  clearSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};
