export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  /** Returned by /users endpoints, not by /auth/login. Optional. */
  profilePicture?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = AuthTokens & {
  user: AuthUser;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerifyCodeRequest = {
  email: string;
  code: string;
};

export type ResetPasswordRequest = {
  resetToken: string;
  password: string;
};
