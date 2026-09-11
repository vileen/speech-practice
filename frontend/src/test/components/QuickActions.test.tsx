import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActions } from '../../components/ProgressDashboard/QuickActions';

describe('QuickActions', () => {
  const renderQuickActions = () => {
    const onNavigate = vi.fn();
    render(<QuickActions onNavigate={onNavigate} />);
    return { onNavigate };
  };

  describe('rendering', () => {
    it('should render the section heading', () => {
      renderQuickActions();
      expect(screen.getByRole('heading', { name: /quick actions/i })).toBeInTheDocument();
    });

    it('should render all four action buttons', () => {
      renderQuickActions();
      expect(screen.getByRole('button', { name: /grammar drills/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /kanji practice/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /lessons/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /counters/i })).toBeInTheDocument();
    });

    it('should render icons for each action', () => {
      renderQuickActions();
      expect(screen.getByText('📖')).toBeInTheDocument();
      expect(screen.getByText('🈁')).toBeInTheDocument();
      expect(screen.getByText('📚')).toBeInTheDocument();
      expect(screen.getByText('🔢')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should call onNavigate with /grammar when Grammar Drills is clicked', () => {
      const { onNavigate } = renderQuickActions();
      fireEvent.click(screen.getByRole('button', { name: /grammar drills/i }));
      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('/grammar');
    });

    it('should call onNavigate with /kanji when Kanji Practice is clicked', () => {
      const { onNavigate } = renderQuickActions();
      fireEvent.click(screen.getByRole('button', { name: /kanji practice/i }));
      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('/kanji');
    });

    it('should call onNavigate with /lessons when Lessons is clicked', () => {
      const { onNavigate } = renderQuickActions();
      fireEvent.click(screen.getByRole('button', { name: /lessons/i }));
      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('/lessons');
    });

    it('should call onNavigate with /counters when Counters is clicked', () => {
      const { onNavigate } = renderQuickActions();
      fireEvent.click(screen.getByRole('button', { name: /counters/i }));
      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('/counters');
    });

    it('should not call onNavigate on render', () => {
      const { onNavigate } = renderQuickActions();
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('should call onNavigate independently for each click', () => {
      const { onNavigate } = renderQuickActions();
      fireEvent.click(screen.getByRole('button', { name: /lessons/i }));
      fireEvent.click(screen.getByRole('button', { name: /counters/i }));
      expect(onNavigate).toHaveBeenCalledTimes(2);
      expect(onNavigate).toHaveBeenNthCalledWith(1, '/lessons');
      expect(onNavigate).toHaveBeenNthCalledWith(2, '/counters');
    });
  });
});
