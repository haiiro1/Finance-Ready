import type {
  FinancialCategory,
  FinancialCategoryCreateRequest,
  FinancialCategoryListResponse,
  FinancialCategoryUpdateRequest,
} from '@finance-ready/shared-types';
import { appConfig } from '../config';

export type CategoriesApiError = {
  status: number | null;
  code: string;
  message: string;
  field: string | null;
};

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function statusFallbackCode(status: number): string {
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 422) return 'validation_error';
  return 'unexpected_error';
}

function statusFallbackMessage(status: number): string {
  if (status === 403) return 'No tienes permiso para realizar esta acción.';
  if (status === 404) return 'El recurso no fue encontrado.';
  if (status === 409) return 'Conflicto con datos existentes.';
  if (status === 422) return 'Los datos enviados no son válidos.';
  if (status >= 500) return 'Error interno del servidor. Intenta de nuevo.';
  return `Error inesperado (${status}).`;
}

function parseDomainError(status: number, body: unknown): CategoriesApiError {
  if (body !== null && typeof body === 'object' && 'detail' in body) {
    const { detail } = body as { detail: unknown };

    // Domain error object: { code, message, field }
    if (
      detail !== null &&
      typeof detail === 'object' &&
      !Array.isArray(detail) &&
      'code' in detail
    ) {
      const d = detail as { code: string; message?: string; field?: string | null };
      return {
        status,
        code: d.code,
        message: d.message ?? statusFallbackMessage(status),
        field: d.field ?? null,
      };
    }

    // Plain string detail (e.g. auth 403: "Not authenticated")
    if (typeof detail === 'string' && detail.length > 0) {
      return {
        status,
        code: statusFallbackCode(status),
        message: detail,
        field: null,
      };
    }

    // FastAPI 422 validation errors: [{ loc, msg, type }]
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      return {
        status,
        code: 'validation_error',
        message: first.msg ?? statusFallbackMessage(status),
        field: null,
      };
    }
  }

  return {
    status,
    code: statusFallbackCode(status),
    message: statusFallbackMessage(status),
    field: null,
  };
}

const networkError: CategoriesApiError = {
  status: null,
  code: 'network_error',
  message: 'Error de red. Comprueba tu conexión e intenta de nuevo.',
  field: null,
};

export async function listFinancialCategories(
  token: string,
  params?: {
    limit?: number;
    cursor?: string;
    include_deleted?: boolean;
  },
): Promise<FinancialCategoryListResponse> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.include_deleted) qs.set('include_deleted', 'true');
  const search = qs.toString();
  const url = `${appConfig.apiUrl}/transactions/categories${search ? `?${search}` : ''}`;

  let response: Response;
  try {
    response = await fetch(url, { headers: authHeader(token) });
  } catch {
    throw networkError;
  }
  const body = await safeJson(response);
  if (!response.ok) throw parseDomainError(response.status, body);
  return body as FinancialCategoryListResponse;
}

export async function createFinancialCategory(
  token: string,
  data: FinancialCategoryCreateRequest,
): Promise<FinancialCategory> {
  let response: Response;
  try {
    response = await fetch(`${appConfig.apiUrl}/transactions/categories`, {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    throw networkError;
  }
  const body = await safeJson(response);
  if (!response.ok) throw parseDomainError(response.status, body);
  return body as FinancialCategory;
}

export async function updateFinancialCategory(
  token: string,
  id: number,
  data: FinancialCategoryUpdateRequest,
): Promise<FinancialCategory> {
  let response: Response;
  try {
    response = await fetch(`${appConfig.apiUrl}/transactions/categories/${id}`, {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    throw networkError;
  }
  const body = await safeJson(response);
  if (!response.ok) throw parseDomainError(response.status, body);
  return body as FinancialCategory;
}

export async function deleteFinancialCategory(token: string, id: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${appConfig.apiUrl}/transactions/categories/${id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    });
  } catch {
    throw networkError;
  }
  if (response.ok) return;
  const body = await safeJson(response);
  throw parseDomainError(response.status, body);
}

export async function restoreFinancialCategory(
  token: string,
  id: number,
): Promise<FinancialCategory> {
  let response: Response;
  try {
    response = await fetch(`${appConfig.apiUrl}/transactions/categories/${id}/restore`, {
      method: 'POST',
      headers: authHeader(token),
    });
  } catch {
    throw networkError;
  }
  const body = await safeJson(response);
  if (!response.ok) throw parseDomainError(response.status, body);
  return body as FinancialCategory;
}
