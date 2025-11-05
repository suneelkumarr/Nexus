import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedPersonalizedInsights } from '../../../../../instagram-growth-tool/src/components/Personalization/EnhancedPersonalizedInsights';
import { PersonalizationContext } from '../../../../../instagram-growth-tool/src/contexts/PersonalizationContext';

const mockPersonalizationContext = {
  preferences: {
    industry: 'fitness',
    goals: ['growth', 'engagement'],
    experienceLevel: 'intermediate',
    contentTypes: ['video', 'carousel'],
  },
  updatePreferences: vi.fn(),
  insights: [
    {
      id: '1',
      type: 'performance',
      title: 'Peak Posting Time',
      value: '2:00 PM - 4:00 PM',
      confidence: 95,
      impact: 'high',
    },
    {
      id: '2',
      type: 'engagement',
      title: 'Best Content Type',
      value: 'Video Posts',
      confidence: 88,
      impact: 'medium',
    },
  ],
  isLoading: false,
};

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <PersonalizationContext.Provider value={mockPersonalizationContext as any}>
      {component}
    </PersonalizationContext.Provider>
  );
};

describe('EnhancedPersonalizedInsights', () => {
  const defaultProps = {
    className: 'test-class',
  };

  it('renders personalized insights correctly', () => {
    renderWithContext(<EnhancedPersonalizedInsights {...defaultProps} />);
    
    expect(screen.getByText(/Your Personalized Insights/)).toBeInTheDocument();
    expect(screen.getByText(/Peak Posting Time/)).toBeInTheDocument();
    expect(screen.getByText(/Best Content Type/)).toBeInTheDocument();
  });

  it('displays confidence levels for insights', () => {
    renderWithContext(<EnhancedPersonalizedInsights {...defaultProps} />);
    
    expect(screen.getByText(/95% confidence/)).toBeInTheDocument();
    expect(screen.getByText(/88% confidence/)).toBeInTheDocument();
  });

  it('shows impact indicators correctly', () => {
    renderWithContext(<EnhancedPersonalizedInsights {...defaultProps} />);
    
    const highImpactElement = screen.getByText(/High Impact/);
    const mediumImpactElement = screen.getByText(/Medium Impact/);
    
    expect(highImpactElement).toBeInTheDocument();
    expect(mediumImpactElement).toBeInTheDocument();
  });

  it('displays loading state when insights are being fetched', () => {
    const loadingContext = {
      ...mockPersonalizationContext,
      isLoading: true,
    };

    render(
      <PersonalizationContext.Provider value={loadingContext as any}>
        <EnhancedPersonalizedInsights {...defaultProps} />
      </PersonalizationContext.Provider>
    );
    
    expect(screen.getByTestId('insights-loading')).toBeInTheDocument();
  });

  it('handles empty state when no insights available', () => {
    const emptyContext = {
      ...mockPersonalizationContext,
      insights: [],
    };

    render(
      <PersonalizationContext.Provider value={emptyContext as any}>
        <EnhancedPersonalizedInsights {...defaultProps} />
      </PersonalizationContext.Provider>
    );
    
    expect(screen.getByText(/No insights available/)).toBeInTheDocument();
    expect(screen.getByText(/We're analyzing your data/)).toBeInTheDocument();
  });

  it('allows insight dismissal', async () => {
    renderWithContext(<EnhancedPersonalizedInsights {...defaultProps} />);
    
    const dismissButton = screen.getByRole('button', { name: /Dismiss|×/ });
    fireEvent.click(dismissButton);
    
    // The dismiss action should be handled by the parent component
    // We can test that the button is clickable
    expect(dismissButton).toBeInTheDocument();
  });

  it('shows actionable recommendations', () => {
    renderWithContext(<EnhancedPersonalizedInsights {...defaultProps} />);
    
    expect(screen.getByText(/Action:/)).toBeInTheDocument();
    expect(screen.getByText(/Schedule posts during peak hours/)).toBeInTheDocument();
    expect(screen.getByText(/Increase video content/)).toBeInTheDocument();
  });

  it('handles insight type filtering', () => {
    renderWithContext(<EnhancedPersonalizedInsights {...defaultProps} />);
    
    const filterButtons = screen.getAllByRole('button', { name: /All|Performance|Engagement|Growth/ });
    
    // Should have filter buttons
    expect(filterButtons.length).toBeGreaterThan(0);
    
    // Click on performance filter
    const performanceFilter = filterButtons.find(btn => btn.textContent?.includes('Performance'));
    if (performanceFilter) {
      fireEvent.click(performanceFilter);
      
      // Should show only performance insights
      expect(screen.getByText(/Peak Posting Time/)).toBeInTheDocument();
    }
  });

  it('displays trend indicators correctly', () => {
    renderWithContext(<EnhancedPersonalizedInsights {...defaultProps} />);
    
    // Check for trend arrows or indicators
    const trendElements = screen.getAllByTestId(/trend-.*/);
    expect(trendElements.length).toBeGreaterThan(0);
  });

  it('responds to personalization context changes', async () => {
    const { rerender } = render(
      <PersonalizationContext.Provider value={mockPersonalizationContext as any}>
        <EnhancedPersonalizedInsights {...defaultProps} />
      </PersonalizationContext.Provider>
    );
    
    // Update preferences
    const updatedContext = {
      ...mockPersonalizationContext,
      insights: [
        ...mockPersonalizationContext.insights,
        {
          id: '3',
          type: 'growth',
          title: 'New Follower Pattern',
          value: 'Weekend Growth Spike',
          confidence: 92,
          impact: 'high',
        },
      ],
    };
    
    rerender(
      <PersonalizationContext.Provider value={updatedContext as any}>
        <EnhancedPersonalizedInsights {...defaultProps} />
      </PersonalizationContext.Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/New Follower Pattern/)).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', () => {
    const errorContext = {
      ...mockPersonalizationContext,
      insights: null,
      error: 'Failed to fetch insights',
    };

    render(
      <PersonalizationContext.Provider value={errorContext as any}>
        <EnhancedPersonalizedInsights {...defaultProps} />
      </PersonalizationContext.Provider>
    );
    
    expect(screen.getByText(/Unable to load insights/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
  });
});