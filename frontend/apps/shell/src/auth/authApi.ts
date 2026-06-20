import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@finance-ready/shared-types';
import { appConfig } from '../config';

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${appConfig.apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Credenciales invalidas');
    throw new Error('Error al iniciar sesion');
  }
  return response.json() as Promise<AuthResponse>;
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
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
  return response.json() as Promise<AuthResponse>;
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
