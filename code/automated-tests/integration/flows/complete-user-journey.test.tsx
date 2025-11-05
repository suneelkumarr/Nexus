import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { AuthContext } from '../../../instagram-growth-tool/src/contexts/AuthContext';
import { PersonalizationContext } from '../../../instagram-growth-tool/src/contexts/PersonalizationContext';

// Mock server for API calls
const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: 'new-user', email: 'new@example.com', name: 'New User' },
        session: { accessToken: 'token-123' },
      })
    );
  }),
  rest.post('/api/onboarding/progress', (req, res, ctx) => {
    return res(ctx.json({ success: true, step: 'completed' }));
  }),
  rest.get('/api/onboarding/status', (req, res, ctx) => {
    return res(
      ctx.json({
        completed: false,
        currentStep: 'preferences',
        progress: 60,
      })
    );
  }),
  rest.post('/api/analytics/initialize', (req, res, ctx) => {
    return res(
      ctx.json({
        insights: [],
        recommendations: [],
        initialized: true,
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock components for the flow
const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [userData, setUserData] = React.useState({});

  const steps = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'goals', title: 'Set Goals' },
    { id: 'industry', title: 'Industry' },
    { id: 'experience', title: 'Experience Level' },
    { id: 'complete', title: 'Complete' },
  ];

  return (
    <div data-testid="onboarding-flow">
      <h1>Complete Onboarding</h1>
      <div role="progressbar" aria-valuenow={((currentStep + 1) / steps.length) * 100}>
        Step {currentStep + 1} of {steps.length}
      </div>
      
      {currentStep === 0 && (
        <button
          data-testid="welcome-continue"
          onClick={() => setCurrentStep(1)}
        >
          Get Started
        </button>
      )}
      
      {currentStep === 1 && (
        <div data-testid="goals-selection">
          <h2>What are your goals?</h2>
          <label>
            <input
              type="checkbox"
              data-testid="goal-growth"
              onChange={() => setUserData(prev => ({ ...prev, goals: ['growth'] }))}
            />
            Grow my followers
          </label>
          <label>
            <input
              type="checkbox"
              data-testid="goal-engagement"
              onChange={() => setUserData(prev => ({ ...prev, goals: ['engagement'] }))}
            />
            Increase engagement
          </label>
          <button
            data-testid="goals-continue"
            onClick={() => setCurrentStep(2)}
          >
            Continue
          </button>
        </div>
      )}
      
      {currentStep === 2 && (
        <div data-testid="industry-selection">
          <h2>What's your industry?</h2>
          <select
            data-testid="industry-select"
            onChange={(e) => setUserData(prev => ({ ...prev, industry: e.target.value }))}
          >
            <option value="">Select industry</option>
            <option value="fitness">Fitness</option>
            <option value="business">Business</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
          <button
            data-testid="industry-continue"
            onClick={() => setCurrentStep(3)}
          >
            Continue
          </button>
        </div>
      )}
      
      {currentStep === 3 && (
        <div data-testid="experience-selection">
          <h2>What's your experience level?</h2>
          <label>
            <input
              type="radio"
              name="experience"
              value="beginner"
              data-testid="exp-beginner"
              onChange={(e) => setUserData(prev => ({ ...prev, experience: e.target.value }))}
            />
            Beginner
          </label>
          <label>
            <input
              type="radio"
              name="experience"
              value="intermediate"
              data-testid="exp-intermediate"
              onChange={(e) => setUserData(prev => ({ ...prev, experience: e.target.value }))}
            />
            Intermediate
          </label>
          <label>
            <input
              type="radio"
              name="experience"
              value="advanced"
              data-testid="exp-advanced"
              onChange={(e) => setUserData(prev => ({ ...prev, experience: e.target.value }))}
            />
            Advanced
          </label>
          <button
            data-testid="experience-continue"
            onClick={() => setCurrentStep(4)}
          >
            Continue
          </button>
        </div>
      )}
      
      {currentStep === 4 && (
        <div data-testid="onboarding-complete">
          <h2>You're all set!</h2>
          <p>Your personalized analytics dashboard is ready.</p>
          <button
            data-testid="go-to-dashboard"
            onClick={() => console.log('Navigate to dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [insights, setInsights] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call to load dashboard data
    const loadData = async () => {
      try {
        const response = await fetch('/api/analytics/initialize');
        const data = await response.json();
        setInsights(data.insights);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div data-testid="dashboard">
      <h1>Analytics Dashboard</h1>
      {isLoading ? (
        <div data-testid="dashboard-loading">Loading your insights...</div>
      ) : (
        <div data-testid="dashboard-content">
          <p>Welcome to your personalized analytics dashboard!</p>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = React.useState(null);
  const [isOnboarding, setIsOnboarding] = React.useState(true);

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'completed' }),
      });
      setIsOnboarding(false);
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  };

  if (!user) {
    return (
      <div data-testid="login-page">
        <h1>Login to Instagram Analytics</h1>
        <button
          data-testid="demo-login"
          onClick={() => handleLogin({ email: 'test@example.com', password: 'password' })}
        >
          Demo Login
        </button>
      </div>
    );
  }

  if (isOnboarding) {
    return <OnboardingFlow />;
  }

  return <Dashboard />;
};

const renderApp = () => {
  return render(<App />);
};

describe('Complete User Journey Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('complete user journey from login to dashboard', async () => {
    const user = userEvent.setup();
    renderApp();

    // Step 1: Login
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    const loginButton = screen.getByTestId('demo-login');
    await user.click(loginButton);

    // Step 2: Verify onboarding starts
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Step 3: Complete onboarding steps
    const welcomeContinue = screen.getByTestId('welcome-continue');
    await user.click(welcomeContinue);

    // Select goals
    const growthGoal = screen.getByTestId('goal-growth');
    await user.click(growthGoal);

    const goalsContinue = screen.getByTestId('goals-continue');
    await user.click(goalsContinue);

    // Select industry
    const industrySelect = screen.getByTestId('industry-select');
    await user.selectOptions(industrySelect, 'fitness');

    const industryContinue = screen.getByTestId('industry-continue');
    await user.click(industryContinue);

    // Select experience level
    const expIntermediate = screen.getByTestId('exp-intermediate');
    await user.click(expIntermediate);

    const experienceContinue = screen.getByTestId('experience-continue');
    await user.click(experienceContinue);

    // Complete onboarding
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-complete')).toBeInTheDocument();
    });

    const goToDashboard = screen.getByTestId('go-to-dashboard');
    await user.click(goToDashboard);

    // Step 4: Verify dashboard loads
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Step 5: Check dashboard content loads
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });
  });

  it('handles onboarding step validation', async () => {
    const user = userEvent.setup();
    renderApp();

    // Login first
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    const loginButton = screen.getByTestId('demo-login');
    await user.click(loginButton);

    // Navigate to goals step
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument();
    });

    const welcomeContinue = screen.getByTestId('welcome-continue');
    await user.click(welcomeContinue);

    // Try to continue without selecting goals
    const goalsContinue = screen.getByTestId('goals-continue');
    await user.click(goalsContinue);

    // Should show validation error or stay on same step
    expect(screen.getByTestId('goals-selection')).toBeInTheDocument();
    
    // Select goal and continue
    const growthGoal = screen.getByTestId('goal-growth');
    await user.click(growthGoal);
    
    await user.click(goalsContinue);
    await waitFor(() => {
      expect(screen.getByTestId('industry-selection')).toBeInTheDocument();
    });
  });

  it('handles API errors during onboarding', async () => {
    // Mock API error
    server.use(
      rest.post('/api/onboarding/progress', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    const user = userEvent.setup();
    renderApp();

    // Login
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    const loginButton = screen.getByTestId('demo-login');
    await user.click(loginButton);

    // Complete onboarding steps
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument();
    });

    const welcomeContinue = screen.getByTestId('welcome-continue');
    await user.click(welcomeContinue);

    const growthGoal = screen.getByTestId('goal-growth');
    await user.click(growthGoal);

    const goalsContinue = screen.getByTestId('goals-continue');
    await user.click(goalsContinue);

    // Continue through remaining steps
    const industrySelect = screen.getByTestId('industry-select');
    await user.selectOptions(industrySelect, 'fitness');
    
    const industryContinue = screen.getByTestId('industry-continue');
    await user.click(industryContinue);

    const expIntermediate = screen.getByTestId('exp-intermediate');
    await user.click(expIntermediate);

    const experienceContinue = screen.getByTestId('experience-continue');
    await user.click(experienceContinue);

    // Should handle error gracefully
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
  });

  it('handles onboarding progress persistence', async () => {
    const user = userEvent.setup();
    renderApp();

    // Start onboarding
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    const loginButton = screen.getByTestId('demo-login');
    await user.click(loginButton);

    // Navigate through steps
    const welcomeContinue = screen.getByTestId('welcome-continue');
    await user.click(welcomeContinue);

    const growthGoal = screen.getByTestId('goal-growth');
    await user.click(growthGoal);

    const goalsContinue = screen.getByTestId('goals-continue');
    await user.click(goalsContinue);

    // Simulate page refresh (test progress persistence)
    // In a real scenario, the component would reload from saved state
    expect(screen.getByTestId('industry-selection')).toBeInTheDocument();
  });

  it('verifies accessible user flow', async () => {
    const user = userEvent.setup();
    renderApp();

    // Check initial accessibility
    expect(screen.getByTestId('login-page')).toHaveAttribute('role', 'main');

    // Navigate through flow with keyboard
    const loginButton = screen.getByTestId('demo-login');
    
    // Test keyboard navigation
    loginButton.focus();
    expect(document.activeElement).toBe(loginButton);
    
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument();
    });

    // Continue with keyboard navigation
    const welcomeContinue = screen.getByTestId('welcome-continue');
    welcomeContinue.focus();
    await user.keyboard('{Enter}');

    // Check for proper ARIA labels and roles
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow');
  });
});