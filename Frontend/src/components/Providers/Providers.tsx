'use client';

/**
 * Providers Component
 * Envuelve la aplicación con los contextos necesarios
 */

import { ReactNode, useEffect } from 'react';
import { AuthProvider, useAuth, setGlobalAuthHeader } from '@/contexts/AuthContext';

interface ProvidersProps {
  children: ReactNode;
}

// Componente interno para sincronizar el auth header global
function AuthSync({ children }: { children: ReactNode }) {
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    setGlobalAuthHeader(getAuthHeader);
  }, [getAuthHeader]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AuthSync>{children}</AuthSync>
    </AuthProvider>
  );
}
