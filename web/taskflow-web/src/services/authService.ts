import { authTokenStorage } from './authTokenStorage';
import { postJson } from './httpClient';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  name: string;
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

  async register(credentials: RegisterCredentials) {
    return postJson<AuthResponse, RegisterRequest>('/auth/register', {
      name: credentials.name.trim(),
      email: credentials.email.trim(),
      password: credentials.password,
    });
  },
};
