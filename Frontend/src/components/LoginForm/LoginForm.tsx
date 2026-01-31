'use client';

/**
 * LoginForm Component
 * Formulario de autenticación con validación de userId y email
 */

import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthError } from '@/types/auth';
import styles from './LoginForm.module.scss';

interface FormData {
  userId: string;
  email: string;
}

interface FormErrors {
  userId?: string;
  email?: string;
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    userId: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validar userId: debe ser un número de 2 dígitos (10-99)
  const validateUserId = useCallback((value: string): string | undefined => {
    if (!value.trim()) {
      return 'El ID de usuario es requerido';
    }

    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return 'Debe ser un número';
    }

    if (num < 10 || num > 99) {
      return 'Debe ser un número de 2 dígitos (10-99)';
    }

    return undefined;
  }, []);

  // Validar email con regex estándar
  const validateEmail = useCallback((value: string): string | undefined => {
    if (!value.trim()) {
      return 'El correo electrónico es requerido';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Ingrese un correo electrónico válido';
    }

    return undefined;
  }, []);

  // Verificar si el formulario es válido
  const isFormValid = useCallback((): boolean => {
    const userIdError = validateUserId(formData.userId);
    const emailError = validateEmail(formData.email);
    return !userIdError && !emailError;
  }, [formData, validateUserId, validateEmail]);

  // Manejar cambios en los inputs
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setSubmitError(null);

      // Validar en tiempo real
      if (name === 'userId') {
        setErrors((prev) => ({ ...prev, userId: validateUserId(value) }));
      } else if (name === 'email') {
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
      }
    },
    [validateUserId, validateEmail]
  );

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      // Validar antes de enviar
      const userIdError = validateUserId(formData.userId);
      const emailError = validateEmail(formData.email);

      if (userIdError || emailError) {
        setErrors({ userId: userIdError, email: emailError });
        return;
      }

      setIsSubmitting(true);

      try {
        await login(parseInt(formData.userId, 10), formData.email);
        // Redirigir al dashboard
        router.push('/');
      } catch (error) {
        if (error instanceof AuthError) {
          setSubmitError(error.message);
        } else {
          setSubmitError('Error al iniciar sesión. Intente nuevamente.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateUserId, validateEmail, login, router]
  );

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleRed}>PLATZI</span>
          <span className={styles.titleBlack}>FLIX</span>
        </h1>
        <p className={styles.subtitle}>Inicia sesión para continuar</p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="userId" className={styles.label}>
          ID de Usuario
        </label>
        <input
          type="text"
          id="userId"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          placeholder="Ej: 24"
          className={`${styles.input} ${errors.userId ? styles.inputError : ''}`}
          maxLength={2}
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={isSubmitting}
          aria-describedby={errors.userId ? 'userId-error' : undefined}
        />
        {errors.userId && (
          <span id="userId-error" className={styles.error} role="alert">
            {errors.userId}
          </span>
        )}
        <span className={styles.hint}>Número de 2 dígitos (10-99)</span>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Correo Electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="ejemplo@correo.com"
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          disabled={isSubmitting}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className={styles.error} role="alert">
            {errors.email}
          </span>
        )}
      </div>

      {submitError && (
        <div className={styles.submitError} role="alert">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={!isFormValid() || isSubmitting}
      >
        {isSubmitting ? 'Autenticando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
