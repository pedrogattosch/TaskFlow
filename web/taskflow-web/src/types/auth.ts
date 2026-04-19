export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthResponse = {
  userId: string;
  name: string;
  email: string;
  accessToken: string;
  expiresAt: string;
};
