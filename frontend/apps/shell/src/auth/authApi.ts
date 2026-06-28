import type {
  AuthResponse,
  AuthUser,
  EmailVerificationConfirmRequest,
  EmailVerificationResendRequest,
  EmailVerificationResendResponse,
  GoogleLoginRequest,
  LoginRequest,
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
  RegisterRequest,
  RegisterResponse,
} from '@finance-ready/shared-types';
import { appConfig } from '../config';

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${appConfig.apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Credenciales invalidas');
    if (response.status === 403) throw new Error('Debes verificar tu email antes de iniciar sesion');
    throw new Error('Error al iniciar sesion');
  }
  return response.json() as Promise<AuthResponse>;
}

export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${appConfig.apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    if (response.status === 409) throw new Error('El email ya está registrado');
    if (response.status === 422) throw new Error('La contraseña debe tener al menos 8 caracteres, una letra y un número');
    throw new Error('Error al registrar');
  }
  return response.json() as Promise<RegisterResponse>;
}

export async function getMe(token: string): Promise<AuthUser> {
  const response = await fetch(`${appConfig.apiUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Sesion invalida');
  }
  return response.json() as Promise<AuthUser>;
}

export async function requestPasswordRecovery(
  request: PasswordRecoveryRequest,
): Promise<PasswordRecoveryResponse> {
  const response = await fetch(`${appConfig.apiUrl}/auth/password-recovery/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Error al procesar la solicitud');
  return response.json() as Promise<PasswordRecoveryResponse>;
}

export async function confirmPasswordReset(
  request: PasswordResetConfirmRequest,
): Promise<PasswordResetConfirmResponse> {
  const response = await fetch(`${appConfig.apiUrl}/auth/password-recovery/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    if (response.status === 400) throw new Error('Codigo invalido, expirado o ya utilizado');
    if (response.status === 422) throw new Error('La contrasena no cumple los requisitos minimos');
    throw new Error('Error al restablecer la contrasena');
  }
  return response.json() as Promise<PasswordResetConfirmResponse>;
}

export async function confirmEmailVerification(
  request: EmailVerificationConfirmRequest,
): Promise<{ message: string }> {
  const response = await fetch(`${appConfig.apiUrl}/auth/email-verification/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    if (response.status === 400) throw new Error('Codigo invalido, expirado o ya utilizado');
    throw new Error('Error al verificar el email');
  }
  return response.json() as Promise<{ message: string }>;
}

export async function loginWithGoogle(request: GoogleLoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${appConfig.apiUrl}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: { code?: string; message?: string };
    } | null;
    const code = body?.detail?.code;
    const message = body?.detail?.message;
    if (code === 'google_link_required') {
      const err = new Error(
        message ?? 'Ya existe una cuenta con este email. Inicia sesion con tu contrasena.',
      );
      (err as Error & { code: string }).code = 'google_link_required';
      throw err;
    }
    if (code === 'inactive_user') throw new Error(message ?? 'La cuenta esta desactivada.');
    if (code === 'google_auth_unavailable')
      throw new Error(message ?? 'Autenticacion con Google no disponible.');
    throw new Error(message ?? 'Error al iniciar sesion con Google.');
  }
  return response.json() as Promise<AuthResponse>;
}

export async function resendEmailVerification(
  request: EmailVerificationResendRequest,
): Promise<EmailVerificationResendResponse> {
  const response = await fetch(`${appConfig.apiUrl}/auth/email-verification/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Error al reenviar el codigo');
  return response.json() as Promise<EmailVerificationResendResponse>;
}
