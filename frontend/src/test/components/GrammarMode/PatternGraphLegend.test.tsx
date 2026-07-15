import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LegendPanel } from '../../../components/GrammarMode/PatternGraphLegend';

describe('LegendPanel', () => {
  describe('Connection Type Legend', () => {
    it('should render connection type section', () => {
      render(<LegendPanel loadingConnections={false} />);
      expect(screen.getByText('🔴 Connection Type')).toBeInTheDocument();
    });

    it('should render all four connection types', () => {
      render(<LegendPanel loadingConnections={false} />);
      expect(screen.getByText('Opposite')).toBeInTheDocument();
      expect(screen.getByText('Similar')).toBeInTheDocument();
      expect(screen.getByText('Related')).toBeInTheDocument();
      // Confused appears in both connection types AND mastery status
      expect(screen.getAllByText('Confused').length).toBe(2);
    });

    it('should render connection legend lines with correct colors', () => {
      const { container } = render(<LegendPanel loadingConnections={false} />);
      const lines = container.querySelectorAll('.legend-line');
      expect(lines.length).toBe(4);

      // Verify colors are applied via inline styles
      expect(lines[0]).toHaveStyle({ backgroundColor: '#ff4757' }); // opposite
      expect(lines[1]).toHaveStyle({ backgroundColor: '#ffa502' }); // similar
      expect(lines[2]).toHaveStyle({ backgroundColor: '#3742fa' }); // related
      expect(lines[3]).toHaveStyle({ backgroundColor: '#ff00ff' }); // confused
    });
  });

  describe('Mastery Status Legend', () => {
    it('should render mastery status section', () => {
      render(<LegendPanel loadingConnections={false} />);
      expect(screen.getByText('🟢 Mastery Status')).toBeInTheDocument();
    });

    it('should render all four mastery statuses', () => {
      render(<LegendPanel loadingConnections={false} />);
      expect(screen.getByText('Mastered')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
      // Confused appears in both connection types AND mastery status
      expect(screen.getAllByText('Confused').length).toBe(2);
      expect(screen.getByText('Not Practiced')).toBeInTheDocument();
    });

    it('should render mastery dots with correct colors', () => {
      const { container } = render(<LegendPanel loadingConnections={false} />);
      const dots = container.querySelectorAll('.legend-dot');
      expect(dots.length).toBe(4);

      expect(dots[0]).toHaveStyle({ backgroundColor: '#2ed573' }); // mastered
      expect(dots[1]).toHaveStyle({ backgroundColor: '#ffa502' }); // learning
      expect(dots[2]).toHaveStyle({ backgroundColor: '#ff4757' }); // confused
      expect(dots[3]).toHaveStyle({ backgroundColor: '#747d8c' }); // unknown
    });
  });

  describe('Loading State', () => {
    it('should show loading section when loadingConnections is true', () => {
      render(<LegendPanel loadingConnections={true} />);
      expect(screen.getByText('⏳ Loading...')).toBeInTheDocument();
      expect(screen.getByText('Fetching pattern relationships...')).toBeInTheDocument();
    });

    it('should not show loading section when loadingConnections is false', () => {
      render(<LegendPanel loadingConnections={false} />);
      expect(screen.queryByText('⏳ Loading...')).not.toBeInTheDocument();
      expect(screen.queryByText('Fetching pattern relationships...')).not.toBeInTheDocument();
    });
  });

  describe('Tips Section', () => {
    it('should render tips section', () => {
      render(<LegendPanel loadingConnections={false} />);
      expect(screen.getByText('💡 Tips')).toBeInTheDocument();
    });

    it('should render all tip items', () => {
      render(<LegendPanel loadingConnections={false} />);
      expect(screen.getByText('Click node to practice pattern')).toBeInTheDocument();
      expect(screen.getByText('Click connection to compare')).toBeInTheDocument();
      expect(screen.getByText('Drag to pan the view')).toBeInTheDocument();
      expect(screen.getByText('Use scroll to zoom in/out')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have the correct outer class', () => {
      const { container } = render(<LegendPanel loadingConnections={false} />);
      expect(container.querySelector('.pattern-graph-sidebar')).toBeInTheDocument();
    });

    it('should render legend sections with correct panel class', () => {
      const { container } = render(<LegendPanel loadingConnections={false} />);
      const panels = container.querySelectorAll('.legend-section-panel');
      // Connection types + Mastery status = 2 legend panels
      expect(panels.length).toBe(2);
    });

    it('should render legend items in lists', () => {
      const { container } = render(<LegendPanel loadingConnections={false} />);
      const items = container.querySelectorAll('.legend-item');
      expect(items.length).toBe(8); // 4 connections + 4 mastery statuses
    });
  });
});
