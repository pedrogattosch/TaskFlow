export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  userId: string;
  name: string;
  email: string;
  accessToken: string;
  expiresAt: string;
};
