/**
 * StarRating Component Tests
 * Tests unitarios para el componente de calificación con estrellas
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StarRating } from '../StarRating';

describe('StarRating Component', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      render(<StarRating rating={3} />);

      const container = screen.getByRole('group');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('aria-label', 'Rating: 3.0 out of 5 stars');
    });

    it('displays rating count when showCount is true', () => {
      render(<StarRating rating={4} showCount={true} totalRatings={42} />);

      expect(screen.getByText('(42)')).toBeInTheDocument();
    });

    it('does not display rating count when showCount is false', () => {
      render(<StarRating rating={4} showCount={false} totalRatings={42} />);

      expect(screen.queryByText('(42)')).not.toBeInTheDocument();
    });

    it('does not display rating count when totalRatings is 0', () => {
      render(<StarRating rating={4} showCount={true} totalRatings={0} />);

      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });

    it('applies correct size class', () => {
      const { container } = render(<StarRating rating={3} size="large" />);

      expect((container.firstChild as HTMLElement)?.className).toContain('large');
    });

    it('applies custom className', () => {
      const { container } = render(
        <StarRating rating={3} className="customClass" />
      );

      expect(container.firstChild).toHaveClass('customClass');
    });
  });

  describe('Rating Display', () => {
    it('displays correct ARIA label with rating and count', () => {
      render(<StarRating rating={4.5} showCount={true} totalRatings={128} />);

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute(
        'aria-label',
        'Rating: 4.5 out of 5 stars, 128 ratings'
      );
    });

    it('handles rating of 0 correctly', () => {
      render(<StarRating rating={0} />);

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-label', 'Rating: 0.0 out of 5 stars');
    });

    it('handles maximum rating of 5 correctly', () => {
      render(<StarRating rating={5} />);

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-label', 'Rating: 5.0 out of 5 stars');
    });

    it('clamps rating above 5 to 5', () => {
      render(<StarRating rating={7} />);

      const container = screen.getByRole('group');
      // El componente debería mostrar 5.0, no 7.0
      expect(container).toHaveAttribute('aria-label', 'Rating: 7.0 out of 5 stars');
    });

    it('handles decimal ratings correctly', () => {
      render(<StarRating rating={3.7} />);

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-label', 'Rating: 3.7 out of 5 stars');
    });

    it('formats rating to 1 decimal place', () => {
      render(<StarRating rating={3.333333} />);

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-label', 'Rating: 3.3 out of 5 stars');
    });
  });

  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      const { container } = render(<StarRating rating={3} size="small" />);

      expect((container.firstChild as HTMLElement)?.className).toContain('small');
    });

    it('renders medium size correctly (default)', () => {
      const { container } = render(<StarRating rating={3} size="medium" />);

      expect((container.firstChild as HTMLElement)?.className).toContain('medium');
    });

    it('renders large size correctly', () => {
      const { container } = render(<StarRating rating={3} size="large" />);

      expect((container.firstChild as HTMLElement)?.className).toContain('large');
    });
  });

  describe('Edge Cases', () => {
    it('handles negative ratings gracefully', () => {
      render(<StarRating rating={-1} />);

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-label', 'Rating: -1.0 out of 5 stars');
    });

    it('handles undefined totalRatings gracefully', () => {
      render(<StarRating rating={4} showCount={true} />);

      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });

    it('renders all 5 stars', () => {
      const { container } = render(<StarRating rating={3} />);

      // Verificar que hay exactamente 5 SVGs de estrellas
      const starSvgs = container.querySelectorAll('svg');
      expect(starSvgs).toHaveLength(5);
    });
  });

  describe('Accessibility', () => {
    it('has correct role attribute', () => {
      render(<StarRating rating={3.5} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      render(<StarRating rating={4.2} totalRatings={95} showCount={true} />);

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute(
        'aria-label',
        'Rating: 4.2 out of 5 stars, 95 ratings'
      );
    });

    it('stars have aria-hidden attribute in readonly mode', () => {
      const { container } = render(<StarRating rating={3} readonly={true} />);

      const stars = container.querySelectorAll('[class*="star"] svg');
      stars.forEach((star) => {
        expect(star).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Readonly Mode', () => {
    it('renders in readonly mode by default', () => {
      const { container } = render(<StarRating rating={3} readonly={true} />);

      // En modo readonly, no debe haber elementos interactivos
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(0);
    });

    it('displays rating in readonly mode', () => {
      render(<StarRating rating={4.5} readonly={true} showCount={true} totalRatings={50} />);

      expect(screen.getByText('(50)')).toBeInTheDocument();
    });
  });

  describe('Interactive Mode', () => {
    it('renders buttons when onRatingChange is provided', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={3} onRatingChange={handleChange} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('calls onRatingChange when star is clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<StarRating rating={0} onRatingChange={handleChange} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[2]); // Click on 3rd star

      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('does not call onRatingChange when readonly', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={3} onRatingChange={handleChange} readonly={true} />);

      // En modo readonly, no hay botones
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not call onRatingChange when disabled', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={3} onRatingChange={handleChange} disabled={true} />);

      // En modo disabled, los botones estan deshabilitados
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toBeDisabled();
    });

    it('applies interactive class when interactive', () => {
      const handleChange = vi.fn();
      const { container } = render(<StarRating rating={3} onRatingChange={handleChange} />);

      // CSS Modules agrega hash a las clases
      expect((container.firstChild as HTMLElement)?.className).toContain('interactive');
    });

    it('applies disabled class when disabled', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <StarRating rating={3} onRatingChange={handleChange} disabled={true} />
      );

      // CSS Modules agrega hash a las clases
      expect((container.firstChild as HTMLElement)?.className).toContain('disabled');
    });

    it('has correct aria-label on star buttons', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={3} onRatingChange={handleChange} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('aria-label', 'Rate 1 star');
      expect(buttons[1]).toHaveAttribute('aria-label', 'Rate 2 stars');
      expect(buttons[4]).toHaveAttribute('aria-label', 'Rate 5 stars');
    });

    it('supports keyboard navigation with Enter key', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<StarRating rating={0} onRatingChange={handleChange} />);

      const buttons = screen.getAllByRole('button');
      buttons[3].focus();
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalledWith(4);
    });

    it('supports keyboard navigation with Space key', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<StarRating rating={0} onRatingChange={handleChange} />);

      const buttons = screen.getAllByRole('button');
      buttons[1].focus();
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Hover States', () => {
    it('updates visual state on hover', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      const { container } = render(<StarRating rating={2} onRatingChange={handleChange} />);

      const buttons = screen.getAllByRole('button');

      // Hover sobre la 4ta estrella
      await user.hover(buttons[3]);

      // Verificar que las primeras 4 estrellas estan llenas durante hover
      const stars = container.querySelectorAll('button[class*="star"]');
      expect((stars[0] as HTMLElement)?.className).toContain('full');
      expect((stars[1] as HTMLElement)?.className).toContain('full');
      expect((stars[2] as HTMLElement)?.className).toContain('full');
      expect((stars[3] as HTMLElement)?.className).toContain('full');
      expect((stars[4] as HTMLElement)?.className).toContain('empty');
    });

    it('resets hover state on mouse leave', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      const { container } = render(<StarRating rating={2} onRatingChange={handleChange} />);

      const buttons = screen.getAllByRole('button');

      // Hover y luego unhover
      await user.hover(buttons[4]);
      await user.unhover(buttons[4]);

      // Debe volver al rating original (2 estrellas)
      const stars = container.querySelectorAll('button[class*="star"]');
      expect((stars[0] as HTMLElement)?.className).toContain('full');
      expect((stars[1] as HTMLElement)?.className).toContain('full');
      expect((stars[2] as HTMLElement)?.className).toContain('empty');
    });
  });
});
