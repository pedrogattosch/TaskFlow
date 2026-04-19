import { authTokenStorage } from './authTokenStorage';
import { postJson } from './httpClient';
import type { AuthResponse, LoginCredentials } from '../types/auth';

type LoginRequest = {
  email: string;
  password: string;
};

export const authService = {
  async login(credentials: LoginCredentials) {
    const auth = await postJson<AuthResponse, LoginRequest>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    authTokenStorage.saveSession(auth);
    return auth;
  },
};
