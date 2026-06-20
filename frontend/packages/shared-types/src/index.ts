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
  full_name?: string;
};
