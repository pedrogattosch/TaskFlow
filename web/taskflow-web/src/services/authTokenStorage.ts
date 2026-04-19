import type { AuthResponse } from '../types/auth';

const AUTH_TOKEN_KEY = 'taskflow.auth.accessToken';
const AUTH_USER_KEY = 'taskflow.auth.user';

type StoredUser = Pick<AuthResponse, 'userId' | 'name' | 'email' | 'expiresAt'>;

export const authTokenStorage = {
  saveSession(auth: AuthResponse) {
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

  getAccessToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  clearSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};
