import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversionCenter } from '../../../../../instagram-growth-tool/src/components/Conversion/ConversionCenter';
import { AuthContext } from '../../../../../instagram-growth-tool/src/contexts/AuthContext';

const mockAuthContext = {
  user: { id: 'test-user', email: 'test@example.com', subscriptionTier: 'free' },
  signOut: vi.fn(),
  loading: false,
};

const mockConversionData = {
  conversionRate: 4.2,
  totalUsers: 12450,
  convertedUsers: 523,
  funnelSteps: [
    { step: 'visit', count: 1000, rate: 100 },
    { step: 'signup', count: 250, rate: 25 },
    { step: 'complete_onboarding', count: 180, rate: 18 },
    { step: 'upgrade', count: 45, rate: 4.5 },
  ],
  goals: [
    {
      id: '1',
      title: 'Increase Signups',
      current: 25,
      target: 30,
      impact: 'high',
      action: 'Optimize landing page CTA',
    },
    {
      id: '2',
      title: 'Improve Onboarding',
      current: 72,
      target: 85,
      impact: 'medium',
      action: 'Reduce form fields',
    },
  ],
};

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext as any}>
      {component}
    </AuthContext.Provider>
  );
};

describe('ConversionCenter', () => {
  const defaultProps = {
    className: 'test-class',
  };

  it('renders conversion metrics correctly', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    expect(screen.getByText(/Conversion Rate/)).toBeInTheDocument();
    expect(screen.getByText(/4.2%/)).toBeInTheDocument();
    expect(screen.getByText(/Total Users/)).toBeInTheDocument();
    expect(screen.getByText(/12,450/)).toBeInTheDocument();
    expect(screen.getByText(/Converted/)).toBeInTheDocument();
    expect(screen.getByText(/523/)).toBeInTheDocument();
  });

  it('displays conversion funnel correctly', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    expect(screen.getByText(/Conversion Funnel/)).toBeInTheDocument();
    expect(screen.getByText(/Visit/)).toBeInTheDocument();
    expect(screen.getByText(/Signup/)).toBeInTheDocument();
    expect(screen.getByText(/Complete Onboarding/)).toBeInTheDocument();
    expect(screen.getByText(/Upgrade/)).toBeInTheDocument();
  });

  it('shows funnel step percentages', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    expect(screen.getByText(/100%/)).toBeInTheDocument(); // Visit step
    expect(screen.getByText(/25%/)).toBeInTheDocument();  // Signup step
    expect(screen.getByText(/18%/)).toBeInTheDocument();  // Onboarding step
    expect(screen.getByText(/4.5%/)).toBeInTheDocument(); // Upgrade step
  });

  it('displays conversion goals', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    expect(screen.getByText(/Increase Signups/)).toBeInTheDocument();
    expect(screen.getByText(/Improve Onboarding/)).toBeInTheDocument();
    expect(screen.getByText(/High Impact/)).toBeInTheDocument();
    expect(screen.getByText(/Medium Impact/)).toBeInTheDocument();
  });

  it('shows progress bars for goals', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
    
    // Check for specific progress values
    expect(screen.getByText(/25% → 30%/)).toBeInTheDocument();
  });

  it('displays actionable recommendations', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    expect(screen.getByText(/Optimize landing page CTA/)).toBeInTheDocument();
    expect(screen.getByText(/Reduce form fields/)).toBeInTheDocument();
  });

  it('handles time period selection', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    const timePeriodSelect = screen.getByDisplayValue(/Last 30 days/);
    expect(timePeriodSelect).toBeInTheDocument();
    
    fireEvent.change(timePeriodSelect, { target: { value: '7d' } });
    
    expect(timePeriodSelect.value).toBe('7d');
  });

  it('allows goal filtering by impact', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    const impactFilter = screen.getByText(/High Impact/);
    fireEvent.click(impactFilter);
    
    // Should only show high impact goals
    expect(screen.getByText(/Increase Signups/)).toBeInTheDocument();
    expect(screen.queryByText(/Improve Onboarding/)).not.toBeInTheDocument();
  });

  it('shows loading state when data is being fetched', () => {
    const loadingProps = {
      ...defaultProps,
      data: null,
      isLoading: true,
    };

    renderWithContext(<ConversionCenter {...loadingProps} />);
    
    expect(screen.getByTestId('conversion-loading')).toBeInTheDocument();
  });

  it('handles error state gracefully', () => {
    const errorProps = {
      ...defaultProps,
      data: null,
      error: 'Failed to load conversion data',
    };

    renderWithContext(<ConversionCenter {...errorProps} />);
    
    expect(screen.getByText(/Unable to load conversion data/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
  });

  it('displays A/B test results', () => {
    const abTestData = {
      ...mockConversionData,
      abTests: [
        {
          id: 'cta-button-test',
          name: 'CTA Button Color',
          variantA: { conversion: 3.2, traffic: 500 },
          variantB: { conversion: 4.8, traffic: 500 },
          winner: 'B',
          confidence: 95,
        },
      ],
    };

    renderWithContext(<ConversionCenter {...defaultProps} data={abTestData} />);
    
    expect(screen.getByText(/A\/B Test Results/)).toBeInTheDocument();
    expect(screen.getByText(/CTA Button Color/)).toBeInTheDocument();
    expect(screen.getByText(/Variant B wins!/)).toBeInTheDocument();
    expect(screen.getByText(/95% confidence/)).toBeInTheDocument();
  });

  it('shows conversion rate trend', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    expect(screen.getByText(/Conversion Trend/)).toBeInTheDocument();
    
    // Check for trend indicators
    const trendChart = screen.getByTestId('conversion-trend-chart');
    expect(trendChart).toBeInTheDocument();
  });

  it('handles export functionality', () => {
    renderWithContext(<ConversionCenter {...defaultProps} data={mockConversionData} />);
    
    const exportButton = screen.getByRole('button', { name: /Export|Download/ });
    fireEvent.click(exportButton);
    
    expect(screen.getByText(/Choose export format/)).toBeInTheDocument();
  });

  it('responds to real-time data updates', async () => {
    const { rerender } = renderWithContext(
      <ConversionCenter {...defaultProps} data={mockConversionData} />
    );
    
    // Simulate data update
    const updatedData = {
      ...mockConversionData,
      conversionRate: 4.5,
      convertedUsers: 550,
    };
    
    rerender(<ConversionCenter {...defaultProps} data={updatedData} />);
    
    await waitFor(() => {
      expect(screen.getByText(/4.5%/)).toBeInTheDocument();
      expect(screen.getByText(/550/)).toBeInTheDocument();
    });
  });
});