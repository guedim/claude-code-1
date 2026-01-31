/**
 * RatingSection Component Tests
 * Tests de integracion para el componente de calificacion de cursos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { RatingSection } from '../RatingSection';
import { ratingsApi } from '@/services/ratingsApi';
import { ApiError } from '@/types/rating';

// Mock del servicio de ratings
vi.mock('@/services/ratingsApi', () => ({
  ratingsApi: {
    getUserRating: vi.fn(),
    createRating: vi.fn(),
    updateRating: vi.fn(),
  },
}));

describe('RatingSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: usuario no ha calificado
    vi.mocked(ratingsApi.getUserRating).mockResolvedValue(null);
  });

  describe('Rendering', () => {
    it('renders initial rating stats correctly', async () => {
      render(
        <RatingSection
          courseId={1}
          initialAverageRating={4.2}
          initialTotalRatings={85}
          userId={1}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Basado en 85 valoraciones/)).toBeInTheDocument();
      });
    });

    it('renders section titles', async () => {
      render(
        <RatingSection
          courseId={1}
          initialAverageRating={0}
          initialTotalRatings={0}
          userId={1}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Califica este curso')).toBeInTheDocument();
        expect(screen.getByText('Rating general')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      render(
        <RatingSection courseId={1} userId={1} />
      );

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('shows singular "valoracion" when totalRatings is 1', async () => {
      render(
        <RatingSection
          courseId={1}
          initialAverageRating={4.0}
          initialTotalRatings={1}
          userId={1}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Basado en 1 valoracion/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading User Rating', () => {
    it('loads user rating on mount', async () => {
      vi.mocked(ratingsApi.getUserRating).mockResolvedValue({
        id: 1,
        course_id: 1,
        user_id: 1,
        rating: 4,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      });

      render(<RatingSection courseId={1} userId={1} />);

      await waitFor(() => {
        expect(ratingsApi.getUserRating).toHaveBeenCalledWith(1, 1);
      });

      await waitFor(() => {
        expect(screen.getByText(/Tu calificacion: 4 estrellas/)).toBeInTheDocument();
      });
    });

    it('handles error loading user rating gracefully', async () => {
      vi.mocked(ratingsApi.getUserRating).mockRejectedValue(new Error('Network error'));

      render(<RatingSection courseId={1} userId={1} />);

      await waitFor(() => {
        // No debe mostrar error al usuario (no critico)
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Submitting New Rating', () => {
    it('submits new rating successfully', async () => {
      const mockResponse = {
        id: 1,
        course_id: 1,
        user_id: 1,
        rating: 5,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };

      vi.mocked(ratingsApi.createRating).mockResolvedValue(mockResponse);

      const user = userEvent.setup();
      render(
        <RatingSection courseId={1} userId={1} initialTotalRatings={10} />
      );

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[4]); // Click 5th star

      await waitFor(() => {
        expect(ratingsApi.createRating).toHaveBeenCalledWith(1, {
          user_id: 1,
          rating: 5,
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Rating guardado exitosamente/)).toBeInTheDocument();
      });
    });

    it('updates total ratings count after new rating', async () => {
      vi.mocked(ratingsApi.createRating).mockResolvedValue({
        id: 1,
        course_id: 1,
        user_id: 1,
        rating: 4,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      });

      const user = userEvent.setup();
      render(
        <RatingSection
          courseId={1}
          userId={1}
          initialTotalRatings={10}
          initialAverageRating={4.0}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[3]); // Click 4th star

      await waitFor(() => {
        expect(screen.getByText(/Basado en 11 valoraciones/)).toBeInTheDocument();
      });
    });
  });

  describe('Updating Existing Rating', () => {
    it('updates existing rating successfully', async () => {
      vi.mocked(ratingsApi.getUserRating).mockResolvedValue({
        id: 1,
        course_id: 1,
        user_id: 1,
        rating: 3,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      });

      const mockResponse = {
        id: 1,
        course_id: 1,
        user_id: 1,
        rating: 5,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };

      vi.mocked(ratingsApi.updateRating).mockResolvedValue(mockResponse);

      const user = userEvent.setup();
      render(<RatingSection courseId={1} userId={1} />);

      await waitFor(() => {
        expect(ratingsApi.getUserRating).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/Tu calificacion: 3 estrellas/)).toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[4]); // Cambiar a 5 estrellas

      await waitFor(() => {
        expect(ratingsApi.updateRating).toHaveBeenCalledWith(1, 1, {
          user_id: 1,
          rating: 5,
        });
      });
    });

    it('does not change total ratings when updating', async () => {
      vi.mocked(ratingsApi.getUserRating).mockResolvedValue({
        id: 1,
        course_id: 1,
        user_id: 1,
        rating: 3,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      });

      vi.mocked(ratingsApi.updateRating).mockResolvedValue({
        id: 1,
        course_id: 1,
        user_id: 1,
        rating: 5,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      });

      const user = userEvent.setup();
      render(
        <RatingSection
          courseId={1}
          userId={1}
          initialTotalRatings={10}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Tu calificacion: 3 estrellas/)).toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[4]); // Cambiar a 5 estrellas

      await waitFor(() => {
        // Total debe mantenerse igual (actualizacion, no nuevo rating)
        expect(screen.getByText(/Basado en 10 valoraciones/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on failed submit', async () => {
      vi.mocked(ratingsApi.createRating).mockRejectedValue(
        new ApiError('Network error', 500)
      );

      const user = userEvent.setup();
      render(<RatingSection courseId={1} userId={1} />);

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[3]);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Network error/);
      });
    });

    it('rolls back optimistic update on error', async () => {
      vi.mocked(ratingsApi.createRating).mockRejectedValue(
        new Error('Failed')
      );

      const user = userEvent.setup();
      render(
        <RatingSection
          courseId={1}
          userId={1}
          initialAverageRating={4.0}
          initialTotalRatings={10}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[4]); // Click 5 stars

      // Verificar que el promedio volvio al valor original
      await waitFor(() => {
        expect(screen.getByText(/Basado en 10 valoraciones/)).toBeInTheDocument();
      });
    });

    it('displays generic error message for non-ApiError', async () => {
      vi.mocked(ratingsApi.createRating).mockRejectedValue(
        new Error('Unknown error')
      );

      const user = userEvent.setup();
      render(<RatingSection courseId={1} userId={1} />);

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[2]);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          /Error al guardar rating/
        );
      });
    });
  });

  describe('Loading States', () => {
    it('disables rating during submission', async () => {
      let resolvePromise: (value: unknown) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(ratingsApi.createRating).mockReturnValue(slowPromise as never);

      const user = userEvent.setup();
      render(<RatingSection courseId={1} userId={1} />);

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[3]);

      // Durante el submit, debe mostrar loading
      await waitFor(() => {
        expect(screen.getByText('Guardando...')).toBeInTheDocument();
      });

      // Resolver la promesa
      resolvePromise!({
        id: 1,
        course_id: 1,
        user_id: 1,
        rating: 4,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible rating section', async () => {
      render(
        <RatingSection
          courseId={1}
          initialAverageRating={4.0}
          initialTotalRatings={50}
          userId={1}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      // Verificar que hay dos grupos de estrellas (usuario + estadisticas)
      const groups = screen.getAllByRole('group');
      expect(groups.length).toBeGreaterThanOrEqual(2);
    });

    it('error message has role alert', async () => {
      vi.mocked(ratingsApi.createRating).mockRejectedValue(
        new ApiError('Error', 500)
      );

      const user = userEvent.setup();
      render(<RatingSection courseId={1} userId={1} />);

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[0]);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });
    });

    it('success message has role status', async () => {
      vi.mocked(ratingsApi.createRating).mockResolvedValue({
        id: 1,
        course_id: 1,
        user_id: 1,
        rating: 4,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      });

      const user = userEvent.setup();
      render(<RatingSection courseId={1} userId={1} />);

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });

      const stars = screen.getAllByRole('button', { name: /Rate \d stars?/ });
      await user.click(stars[3]);

      await waitFor(() => {
        const status = screen.getByRole('status');
        expect(status).toBeInTheDocument();
      });
    });
  });
});
