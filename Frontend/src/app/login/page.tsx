'use client';

/**
 * Login Page
 * Página de autenticación
 */

import { LoginForm } from '@/components/LoginForm';
import styles from './page.module.scss';

export default function LoginPage() {
  return (
    <div className={styles.page}>
      {/* Fondo de cuadrícula */}
      <div className={styles.gridBg}></div>

      <main className={styles.main}>
        <LoginForm />
      </main>
    </div>
  );
}
