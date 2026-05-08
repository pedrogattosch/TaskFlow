import type { AuthResponse, AuthSession } from '../types/auth';

const AUTH_TOKEN_KEY = 'taskflow.auth.accessToken';
const AUTH_USER_KEY = 'taskflow.auth.user';

type StoredUser = Pick<AuthResponse, 'userId' | 'name' | 'email' | 'expiresAt'>;

const storages = [localStorage, sessionStorage];

export const authTokenStorage = {
  saveSession(auth: AuthSession, rememberSession: boolean) {
    const storage = rememberSession ? localStorage : sessionStorage;
    this.clearSession();

    storage.setItem(AUTH_TOKEN_KEY, auth.accessToken);
    storage.setItem(
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
    const storage = this.getStorageWithSession();

    if (!storage) {
      return null;
    }

    const accessToken = storage.getItem(AUTH_TOKEN_KEY);
    const storedUser = storage.getItem(AUTH_USER_KEY);

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
    return this.getStorageWithSession()?.getItem(AUTH_TOKEN_KEY) ?? null;
  },

  clearSession() {
    storages.forEach((storage) => {
      storage.removeItem(AUTH_TOKEN_KEY);
      storage.removeItem(AUTH_USER_KEY);
    });
  },

  getStorageWithSession() {
    return storages.find(
      (storage) => storage.getItem(AUTH_TOKEN_KEY) && storage.getItem(AUTH_USER_KEY),
    );
  },
};
