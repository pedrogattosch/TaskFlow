import { postJson } from './httpClient';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

type LoginRequest = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export const authService = {
  async login(credentials: LoginCredentials) {
    return postJson<AuthResponse, LoginRequest>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe,
    });
  },

  async register(credentials: RegisterCredentials) {
    return postJson<AuthResponse, RegisterRequest>('/auth/register', {
      name: credentials.name.trim(),
      email: credentials.email.trim(),
      password: credentials.password,
    });
  },
};
