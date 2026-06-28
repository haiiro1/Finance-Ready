// ── Financial categories ──────────────────────────────────────────────────────

export type FinancialCategoryType = 'income' | 'expense';

export type FinancialCategoryColorToken =
  | 'slate'
  | 'sky'
  | 'teal'
  | 'violet'
  | 'fuchsia'
  | 'cyan'
  | 'orange'
  | 'pink'
  | 'emerald'
  | 'amber'
  | 'indigo'
  | 'rose';

export type FinancialCategory = {
  id: number;
  name: string;
  type: FinancialCategoryType;
  color_token: FinancialCategoryColorToken;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type FinancialCategoryCreateRequest = {
  name: string;
  type: FinancialCategoryType;
  color_token: FinancialCategoryColorToken;
};

export type FinancialCategoryUpdateRequest = {
  name?: string;
  color_token?: FinancialCategoryColorToken;
};

export type FinancialCategoryListResponse = {
  items: FinancialCategory[];
  next_cursor: string | null;
  has_more: boolean;
};

export type DomainErrorDetail = {
  code: string;
  message: string;
  field: string | null;
};

// ── Money ────────────────────────────────────────────────────────────────────

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
