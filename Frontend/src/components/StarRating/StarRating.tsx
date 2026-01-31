/**
 * StarRating Component
 * Componente de calificación con estrellas - soporta modo readonly e interactivo
 */

'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import styles from './StarRating.module.scss';

interface StarRatingProps {
  rating: number; // 0-5, puede ser decimal
  onRatingChange?: (rating: number) => void; // Callback para cambios (modo interactivo)
  totalRatings?: number; // Número total de ratings
  showCount?: boolean; // Mostrar contador de ratings
  size?: 'small' | 'medium' | 'large'; // Tamaño visual
  readonly?: boolean; // Modo solo lectura
  disabled?: boolean; // Deshabilitar interacción
  className?: string; // Clase CSS adicional
}

/**
 * Sub-componente: Icono de estrella con diferentes estados de relleno
 */
interface StarIconProps {
  fillState: 'empty' | 'half' | 'full';
}

const StarIcon = ({ fillState }: StarIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Gradient para media estrella */}
        <linearGradient id="halfStarGradient">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={
          fillState === 'full'
            ? 'currentColor'
            : fillState === 'half'
            ? 'url(#halfStarGradient)'
            : 'none'
        }
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Componente principal: StarRating
 */
export const StarRating = ({
  rating,
  onRatingChange,
  totalRatings = 0,
  showCount = false,
  size = 'medium',
  readonly = false,
  disabled = false,
  className = '',
}: StarRatingProps) => {
  // Estado para el rating durante hover (solo en modo interactivo)
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Determinar si debe mostrar botones (tiene handler y no es readonly)
  const showButtons = !readonly && !!onRatingChange;

  // Determinar si la interacción está habilitada
  const isInteractive = showButtons && !disabled;

  /**
   * Determina el estado de relleno de cada estrella
   */
  const getStarFillState = (starIndex: number): 'empty' | 'half' | 'full' => {
    // En modo interactivo, usar hoverRating si existe
    const currentRating = isInteractive && hoverRating > 0
      ? hoverRating
      : Math.max(0, Math.min(5, rating)); // Clamp 0-5

    if (currentRating >= starIndex) return 'full';
    if (currentRating >= starIndex - 0.5) return 'half';
    return 'empty';
  };

  /**
   * Handler: Mouse enter en estrella
   */
  const handleMouseEnter = useCallback((star: number) => {
    if (!isInteractive) return;
    setHoverRating(star);
  }, [isInteractive]);

  /**
   * Handler: Mouse leave del contenedor
   */
  const handleMouseLeave = useCallback(() => {
    if (!isInteractive) return;
    setHoverRating(0);
  }, [isInteractive]);

  /**
   * Handler: Click en estrella
   */
  const handleClick = useCallback((star: number) => {
    if (!isInteractive || !onRatingChange) return;
    onRatingChange(star);
  }, [isInteractive, onRatingChange]);

  /**
   * Handler: Navegación por teclado
   */
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, star: number) => {
    if (!isInteractive || !onRatingChange) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onRatingChange(star);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        if (star < 5) {
          const nextStar = event.currentTarget.nextElementSibling as HTMLButtonElement;
          nextStar?.focus();
        }
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        if (star > 1) {
          const prevStar = event.currentTarget.previousElementSibling as HTMLButtonElement;
          prevStar?.focus();
        }
        break;
      case 'Escape':
        event.preventDefault();
        setHoverRating(0);
        break;
    }
  }, [isInteractive, onRatingChange]);

  // Formatear el rating para mostrar (1 decimal)
  const formattedRating = rating.toFixed(1);

  // Determinar clases del contenedor
  const containerClasses = [
    styles.starRating,
    styles[size],
    showButtons ? styles.interactive : '',
    disabled ? styles.disabled : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      role="group"
      aria-label={`Rating: ${formattedRating} out of 5 stars${
        showCount && totalRatings > 0 ? `, ${totalRatings} ratings` : ''
      }`}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          showButtons ? (
            <button
              key={star}
              type="button"
              className={`${styles.star} ${styles[getStarFillState(star)]}`}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              disabled={disabled}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              aria-pressed={rating === star}
              tabIndex={disabled ? -1 : 0}
            >
              <StarIcon fillState={getStarFillState(star)} />
            </button>
          ) : (
            <span
              key={star}
              className={`${styles.star} ${styles[getStarFillState(star)]}`}
              aria-hidden="true"
            >
              <StarIcon fillState={getStarFillState(star)} />
            </span>
          )
        ))}
      </div>

      {/* Contador de ratings (opcional) */}
      {showCount && totalRatings > 0 && (
        <span className={styles.count} aria-label={`${totalRatings} ratings`}>
          ({totalRatings})
        </span>
      )}
    </div>
  );
};
