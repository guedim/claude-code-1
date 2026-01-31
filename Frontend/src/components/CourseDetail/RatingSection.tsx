/**
 * RatingSection Component
 * Sección interactiva de calificación de cursos
 * Client Component para manejar estado y API calls
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { StarRating } from '@/components/StarRating/StarRating';
import { ratingsApi } from '@/services/ratingsApi';
import { ApiError } from '@/types/rating';
import styles from './RatingSection.module.scss';

interface RatingSectionProps {
  courseId: number;
  initialAverageRating?: number;
  initialTotalRatings?: number;
  userId: number; // Temporal: hardcoded hasta implementar auth
}

/**
 * Helper: Calcula el nuevo promedio de forma optimistic
 */
function calculateOptimisticAverage(
  currentAverage: number,
  currentTotal: number,
  oldRating: number,
  newRating: number,
  isNewRating: boolean
): number {
  if (currentTotal === 0 && isNewRating) {
    return newRating;
  }

  if (isNewRating) {
    const sum = currentAverage * currentTotal + newRating;
    return sum / (currentTotal + 1);
  } else {
    const sum = currentAverage * currentTotal - oldRating + newRating;
    return sum / currentTotal;
  }
}

export const RatingSection = ({
  courseId,
  initialAverageRating = 0,
  initialTotalRatings = 0,
  userId,
}: RatingSectionProps) => {
  // Estados del componente
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [totalRatings, setTotalRatings] = useState(initialTotalRatings);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Effect: Cargar el rating del usuario al montar el componente
   */
  useEffect(() => {
    const loadUserRating = async () => {
      try {
        setIsInitialLoading(true);
        const existingRating = await ratingsApi.getUserRating(courseId, userId);

        if (existingRating) {
          setUserRating(existingRating.rating);
        }
      } catch (err) {
        console.error('Failed to load user rating:', err);
        // No mostrar error al usuario (no crítico)
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadUserRating();
  }, [courseId, userId]);

  /**
   * Handler: Cambio de rating por el usuario
   */
  const handleRatingChange = useCallback(async (newRating: number) => {
    // Guardar estado previo para rollback
    const previousRating = userRating;
    const previousAverage = averageRating;
    const previousTotal = totalRatings;

    try {
      // Optimistic update
      setUserRating(newRating);
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Calcular nuevo promedio localmente
      const isNewRating = previousRating === 0;
      const newTotal = isNewRating ? previousTotal + 1 : previousTotal;
      const newAverage = calculateOptimisticAverage(
        previousAverage,
        previousTotal,
        previousRating,
        newRating,
        isNewRating
      );

      setAverageRating(Math.round(newAverage * 10) / 10); // Redondear a 1 decimal
      setTotalRatings(newTotal);

      // Submit al backend
      if (isNewRating) {
        await ratingsApi.createRating(courseId, {
          user_id: userId,
          rating: newRating,
        });
      } else {
        await ratingsApi.updateRating(courseId, userId, {
          user_id: userId,
          rating: newRating,
        });
      }

      // Success feedback
      setSuccessMessage('Rating guardado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      // Rollback en caso de error
      setUserRating(previousRating);
      setAverageRating(previousAverage);
      setTotalRatings(previousTotal);

      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Error al guardar rating. Por favor intenta de nuevo.';

      setError(errorMessage);
      setTimeout(() => setError(null), 5000);

    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId, userRating, averageRating, totalRatings]);

  return (
    <section className={styles.ratingSection}>
      {/* Sección: Rating del usuario */}
      <div className={styles.userRating}>
        <h3 className={styles.title}>Califica este curso</h3>

        {isInitialLoading ? (
          <div className={styles.loadingPlaceholder}>
            <span className={styles.loadingText}>Cargando...</span>
          </div>
        ) : (
          <StarRating
            rating={userRating}
            onRatingChange={handleRatingChange}
            size="large"
            disabled={isLoading}
          />
        )}

        {/* Feedback states */}
        {isLoading && (
          <p className={styles.loadingText}>Guardando...</p>
        )}

        {error && (
          <p className={styles.errorText} role="alert">
            {error}
          </p>
        )}

        {successMessage && (
          <p className={styles.successText} role="status">
            {successMessage}
          </p>
        )}

        {userRating > 0 && !isLoading && !error && !successMessage && (
          <p className={styles.userRatingText}>
            Tu calificacion: {userRating} {userRating === 1 ? 'estrella' : 'estrellas'}
          </p>
        )}
      </div>

      {/* Sección: Estadísticas generales */}
      <div className={styles.ratingsStats}>
        <h4 className={styles.statsTitle}>Rating general</h4>
        <StarRating
          rating={averageRating}
          readonly={true}
          size="medium"
          showCount={true}
          totalRatings={totalRatings}
        />
        <p className={styles.statsDescription}>
          Basado en {totalRatings} {totalRatings === 1 ? 'valoracion' : 'valoraciones'}
        </p>
      </div>
    </section>
  );
};
