import { rest } from 'msw';

export const handlers = [
  // Mock analytics endpoints
  rest.get('/api/analytics/overview', (req, res, ctx) => {
    return res(
      ctx.json({
        followerCount: 15420,
        engagementRate: 4.2,
        averageLikes: 245,
        averageComments: 18,
        postCount: 156,
        growthRate: 12.5,
      })
    );
  }),

  rest.get('/api/analytics/insights', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          type: 'growth',
          title: 'Peak Posting Times',
          description: 'Your audience is most active between 2-4 PM',
          impact: 'high',
          action: 'Schedule posts for this time',
        },
        {
          id: '2',
          type: 'engagement',
          title: 'Content Performance',
          description: 'Video posts get 3x more engagement than images',
          impact: 'medium',
          action: 'Create more video content',
        },
      ])
    );
  }),

  // Mock onboarding endpoints
  rest.post('/api/onboarding/progress', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),

  rest.get('/api/onboarding/status', (req, res, ctx) => {
    return res(
      ctx.json({
        completed: true,
        currentStep: 'complete',
        progress: 100,
      })
    );
  }),

  // Mock A/B testing endpoints
  rest.post('/api/ab-test/variant-assign', (req, res, ctx) => {
    return res(
      ctx.json({
        variant: 'B',
        testId: 'onboarding-flow',
        timestamp: new Date().toISOString(),
      })
    );
  }),

  rest.get('/api/ab-test/events', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          event: 'page_view',
          variant: 'A',
          timestamp: new Date().toISOString(),
          userId: 'test-user',
        },
      ])
    );
  }),

  // Mock conversion endpoints
  rest.post('/api/conversion/track', (req, res, ctx) => {
    return res(ctx.json({ success: true, eventId: 'conv-123' }));
  }),

  rest.get('/api/conversion/funnel', (req, res, ctx) => {
    return res(
      ctx.json({
        steps: [
          { step: 'visit', count: 1000, rate: 100 },
          { step: 'signup', count: 250, rate: 25 },
          { step: 'complete_onboarding', count: 180, rate: 18 },
          { step: 'first_analytics', count: 120, rate: 12 },
          { step: 'upgrade', count: 45, rate: 4.5 },
        ],
      })
    );
  }),

  // Mock authentication endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
        },
        session: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token',
        },
      })
    );
  }),

  // Mock error responses for testing
  rest.get('/api/error/500', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Server error' }));
  }),

  rest.get('/api/error/404', (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ error: 'Not found' }));
  }),
];