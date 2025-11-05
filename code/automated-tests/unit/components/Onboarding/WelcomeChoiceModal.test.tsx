import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WelcomeChoiceModal } from '../../../../../instagram-growth-tool/src/components/Onboarding/WelcomeChoiceModal';
import { AuthContext } from '../../../../../instagram-growth-tool/src/contexts/AuthContext';
import { PersonalizationContext } from '../../../../../instagram-growth-tool/src/contexts/PersonalizationContext';

const mockAuthContext = {
  user: { id: 'test-user', email: 'test@example.com' },
  signOut: vi.fn(),
  loading: false,
};

const mockPersonalizationContext = {
  preferences: { industry: 'fitness', goals: ['growth'] },
  updatePreferences: vi.fn(),
  isLoading: false,
};

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext as any}>
      <PersonalizationContext.Provider value={mockPersonalizationContext as any}>
        {component}
      </PersonalizationContext.Provider>
    </AuthContext.Provider>
  );
};

describe('WelcomeChoiceModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onComplete: vi.fn(),
  };

  it('renders correctly when open', () => {
    renderWithContext(<WelcomeChoiceModal {...defaultProps} />);
    
    expect(screen.getByText(/Welcome to Instagram Analytics/)).toBeInTheDocument();
    expect(screen.getByText(/Choose your primary goal/)).toBeInTheDocument();
  });

  it('displays all goal options', () => {
    renderWithContext(<WelcomeChoiceModal {...defaultProps} />);
    
    expect(screen.getByText(/Growth/)).toBeInTheDocument();
    expect(screen.getByText(/Engagement/)).toBeInTheDocument();
    expect(screen.getByText(/Analytics/)).toBeInTheDocument();
    expect(screen.getByText(/Content Strategy/)).toBeInTheDocument();
  });

  it('allows goal selection', async () => {
    renderWithContext(<WelcomeChoiceModal {...defaultProps} />);
    
    const growthOption = screen.getByText(/Growth/);
    fireEvent.click(growthOption);
    
    await waitFor(() => {
      expect(growthOption.closest('[data-selected]')).toBeTruthy();
    });
  });

  it('shows industry selection step after goal selection', async () => {
    renderWithContext(<WelcomeChoiceModal {...defaultProps} />);
    
    // Select a goal first
    const growthOption = screen.getByText(/Growth/);
    fireEvent.click(growthOption);
    
    // Wait and check if industry options appear
    await waitFor(() => {
      expect(screen.getByText(/What's your industry/)).toBeInTheDocument();
    });
  });

  it('calls onComplete when all steps are completed', async () => {
    renderWithContext(<WelcomeChoiceModal {...defaultProps} />);
    
    // Select goal
    const growthOption = screen.getByText(/Growth/);
    fireEvent.click(growthOption);
    
    // Select industry (assuming it appears)
    await waitFor(() => {
      const industryOption = screen.getByText(/Fitness/);
      if (industryOption) {
        fireEvent.click(industryOption);
      }
    });
    
    // Continue through modal
    const continueButton = screen.getByRole('button', { name: /Continue|Get Started/ });
    if (continueButton) {
      fireEvent.click(continueButton);
    }
    
    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('calls onClose when close button is clicked', () => {
    renderWithContext(<WelcomeChoiceModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /×|Close/ });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    renderWithContext(<WelcomeChoiceModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText(/Welcome to Instagram Analytics/)).not.toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    renderWithContext(<WelcomeChoiceModal {...defaultProps} />);
    
    // Test ESC key
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows loading state when submitting', async () => {
    renderWithContext(<WelcomeChoiceModal {...defaultProps} />);
    
    // Select options
    const growthOption = screen.getByText(/Growth/);
    fireEvent.click(growthOption);
    
    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /Continue|Get Started/ });
      if (continueButton) {
        fireEvent.click(continueButton);
        
        // Check for loading state
        expect(screen.getByText(/Loading...|Please wait.../)).toBeInTheDocument();
      }
    });
  });
});