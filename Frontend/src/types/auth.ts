/**
 * Auth Types
 * Tipos para el sistema de autenticación
 */

// Respuesta del endpoint /auth/token
export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

// Datos del usuario autenticado
export interface AuthUser {
  userId: number;
  email: string;
}

// Estado de autenticación
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

// Request de login
export interface LoginRequest {
  userId: number;
  email: string;
}

// Error de autenticación
export class AuthError extends Error {
  constructor(
    message: string,
    public status: number = 0,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
