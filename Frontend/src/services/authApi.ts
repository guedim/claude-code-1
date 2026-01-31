/**
 * Auth API Service
 * Maneja la autenticación con el backend
 */

import type { AuthTokenResponse, LoginRequest } from '@/types/auth';
import { AuthError } from '@/types/auth';

// Base URL del backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * POST /auth/token
 * Obtiene un token JWT de autenticación
 */
async function login(request: LoginRequest): Promise<AuthTokenResponse> {
  const url = `${API_BASE_URL}/auth/token?user_id=${request.userId}&email=${encodeURIComponent(request.email)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || errorData.message || `Error ${response.status}`;
      throw new AuthError(message, response.status, errorData.code);
    }

    const data = await response.json();
    return data as AuthTokenResponse;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new AuthError(`Network error: ${error.message}`, 0, 'NETWORK_ERROR');
    }
    throw new AuthError('Unknown error occurred', 0, 'UNKNOWN');
  }
}

// Export del servicio
export const authApi = {
  login,
} as const;

export { AuthError };
