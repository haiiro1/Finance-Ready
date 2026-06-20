export type CurrencyCode = 'CLP' | 'USD' | 'EUR';

export type Money = {
  amount: number;
  currency: CurrencyCode;
};

export type AuthUser = {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  email_verified: boolean;
};

export type AuthResponse = {
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  password_confirmation: string;
  full_name?: string;
};

export type PasswordRecoveryRequest = {
  email: string;
};

export type PasswordRecoveryResponse = {
  message: string;
  recovery_code?: string;
  email_sent: boolean;
};

export type PasswordResetConfirmRequest = {
  email: string;
  code: string;
  new_password: string;
  new_password_confirmation: string;
};

export type PasswordResetConfirmResponse = {
  message: string;
};

export type RegisterResponse = {
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
  verification_code?: string;
  email_sent: boolean;
};

export type EmailVerificationConfirmRequest = {
  email: string;
  code: string;
};

export type EmailVerificationResendRequest = {
  email: string;
};

export type EmailVerificationResendResponse = {
  message: string;
  verification_code?: string;
  email_sent: boolean;
};
