'use client';

/**
 * AuthGuard Component
 * Protege rutas que requieren autenticación
 */

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Mientras verifica, no mostrar nada
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
