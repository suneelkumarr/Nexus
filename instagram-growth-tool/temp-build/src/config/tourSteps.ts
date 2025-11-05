// Tour steps configuration for the tooltip-based guided tour
export const dashboardTourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to GrowthHub!',
    description: 'Let\'s take a quick tour of your new Instagram analytics dashboard. Click Next to continue or Skip to explore on your own.',
    targetSelector: '[data-tour="sidebar"]',
    position: 'right' as const
  },
  {
    id: 'overview',
    title: 'Overview Dashboard',
    description: 'Your home base with key metrics, follower growth, and engagement trends at a glance.',
    targetSelector: '[data-tour="overview"]',
    position: 'right' as const
  },
  {
    id: 'accounts',
    title: 'Account Management',
    description: 'Manage all your Instagram accounts here. Add, edit, or remove accounts to track.',
    targetSelector: '[data-tour="accounts"]',
    position: 'right' as const,
    action: () => {
      // Optionally switch to accounts tab
      const accountsTab = document.querySelector('[data-tour="accounts"]') as HTMLElement;
      if (accountsTab) accountsTab.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },
  {
    id: 'advanced',
    title: 'Advanced Analytics',
    description: 'Deep dive into detailed analytics with custom filters, date ranges, and comprehensive insights.',
    targetSelector: '[data-tour="advanced"]',
    position: 'right' as const
  },
  {
    id: 'content',
    title: 'Content Management',
    description: 'Plan, schedule, and optimize your Instagram content strategy with powerful tools.',
    targetSelector: '[data-tour="content"]',
    position: 'right' as const
  },
  {
    id: 'research',
    title: 'Market Research',
    description: 'Analyze competitors, discover trending content, and find growth opportunities.',
    targetSelector: '[data-tour="research"]',
    position: 'right' as const
  },
  {
    id: 'ai-insights',
    title: 'AI-Powered Insights',
    description: 'Get intelligent recommendations, content suggestions, and performance predictions powered by AI.',
    targetSelector: '[data-tour="ai-insights"]',
    position: 'right' as const
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Work with your team, share insights, and manage permissions across your organization.',
    targetSelector: '[data-tour="collaboration"]',
    position: 'right' as const
  },
  {
    id: 'profile',
    title: 'Profile & Settings',
    description: 'Manage your profile, subscription, and application preferences here.',
    targetSelector: '[data-tour="profile"]',
    position: 'right' as const
  }
];

// Quick start actions for new users
export const quickStartActions = [
  {
    id: 'add-account',
    title: 'Connect Instagram Account',
    description: 'Link your first Instagram account to start tracking analytics',
    icon: 'instagram',
    action: 'go-to-accounts'
  },
  {
    id: 'view-analytics',
    title: 'View Your Analytics',
    description: 'Explore your Instagram performance metrics and trends',
    icon: 'chart',
    action: 'go-to-overview'
  },
  {
    id: 'choose-plan',
    title: 'Choose a Plan',
    description: 'Select a subscription plan that fits your needs',
    icon: 'crown',
    action: 'go-to-profile'
  }
];
