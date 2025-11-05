# Instagram Growth Tool - Deployment Guide

**Version:** 2.0.0  
**Last Updated:** November 2, 2025  
**Author:** MiniMax Agent  
**Environment:** Production & Staging

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Migration](#database-migration)
5. [Frontend Deployment](#frontend-deployment)
6. [Backend Deployment](#backend-deployment)
7. [A/B Testing Infrastructure](#ab-testing-infrastructure)
8. [Conversion Components Deployment](#conversion-components-deployment)
9. [Monitoring & Alerting](#monitoring--alerting)
10. [Rollback Procedures](#rollback-procedures)
11. [Post-Deployment Verification](#post-deployment-verification)

---

## Overview

This guide covers the deployment of the Instagram Growth Tool v2.0, which includes significant enhancements to A/B testing infrastructure, conversion optimization components, and mobile optimization features.

### Key Components

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase Edge Functions
- **Database:** PostgreSQL (via Supabase)
- **A/B Testing:** Built-in conversion tracking system
- **Mobile Optimization:** Responsive design with mobile-first approach

### Deployment Scope

- ✅ A/B Testing Infrastructure (Phase 5)
- ✅ Conversion Components (5 new components)
- ✅ Enhanced Dashboard with Conversion Center
- ✅ Mobile Optimization (Phase 6)
- ✅ Database Schema Updates (Multiple migrations)
- ✅ Authentication & Subscription Management

---

## Prerequisites

### Required Tools

- **Node.js:** v18.0.0 or higher
- **pnpm:** v8.0.0 or higher
- **Git:** Latest version
- **Supabase CLI:** v1.0.0 or higher

### Required Access

- Supabase Project Admin Access
- Vercel/Netlify Deployment Account (if using)
- Stripe Dashboard Access (for subscription testing)
- Instagram Basic Display API credentials

### Environment Variables Checklist

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `INSTAGRAM_CLIENT_ID`
- [ ] `INSTAGRAM_CLIENT_SECRET`

---

## Environment Setup

### 1. Local Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd instagram-growth-tool

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Update environment variables
nano .env.local
```

### 2. Environment Variables Configuration

#### Frontend (.env.local)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key

# Instagram API Configuration
VITE_INSTAGRAM_CLIENT_ID=your-instagram-client-id
VITE_APP_URL=http://localhost:5173

# A/B Testing Configuration
VITE_AB_TESTING_ENABLED=true
VITE_CONVERSION_TRACKING_ENABLED=true
```

#### Backend (Supabase Edge Functions)

```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Instagram API Configuration
INSTAGRAM_CLIENT_ID=your-client-id
INSTAGRAM_CLIENT_SECRET=your-client-secret
INSTAGRAM_ACCESS_TOKEN=your-access-token

# External Services
OPENAI_API_KEY=your-openai-key
```

---

## Database Migration

### Migration Strategy

Deploy migrations in chronological order to ensure data integrity.

### 1. Pre-Migration Checklist

- [ ] Backup production database
- [ ] Verify migration scripts compatibility
- [ ] Test migrations on staging environment
- [ ] Confirm RLS policies are correct
- [ ] Check for any blocking queries

### 2. Migration Execution

```bash
# 1. Enable maintenance mode
supabase functions deploy maintenance-mode --set-maintenance

# 2. Apply migrations in order
supabase db push --db-url $DATABASE_URL

# 3. Or apply individual migrations
supabase migration up 1761941349_enable_rls_and_policies
supabase migration up 1761946407_add_enhanced_analytics_tables
supabase migration up 1761982082_add_advanced_analytics_tables
supabase migration up 1761994088_phase5_database_optimization
supabase migration up 1762007222_subscription_and_profile_management
supabase migration up 1762012439_add_personalization_tables
```

### 3. Critical Migration Scripts

#### Phase 5 Database Optimization (Migration 1761994088)

**Purpose:** Enhanced performance for conversion tracking

```sql
-- Add conversion tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversion_events_user_id 
ON conversion_events(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversion_events_account_id 
ON conversion_events(account_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversion_events_created_at 
ON conversion_events(created_at);

-- Add A/B test tracking columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ab_test_variant JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS conversion_events_tracked INTEGER DEFAULT 0;
```

#### Personalization Tables (Migration 1762012439)

**Purpose:** User personalization and A/B testing support

```sql
-- Create user preferences for personalization
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user context for A/B testing
CREATE TABLE user_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 4. Post-Migration Verification

```sql
-- Verify table creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_preferences', 'user_context', 'user_personalization_state');

-- Verify RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_preferences', 'user_context', 'user_personalization_state');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE indexname LIKE '%conversion%' OR indexname LIKE '%user_%';
```

---

## Frontend Deployment

### 1. Build Configuration

```bash
# Development build
pnpm build

# Production build with optimizations
pnpm build:prod

# Analyze bundle size
pnpm build:prod && npx vite-bundle-analyzer dist
```

### 2. Deployment Platforms

#### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Environment variables (via Vercel dashboard)
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_STRIPE_PUBLISHABLE_KEY
```

#### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
netlify build --dir=dist
netlify deploy --prod --dir=dist

# Environment variables (via Netlify dashboard)
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
```

### 3. Build Optimizations

#### Production Build (vite.config.ts)

```typescript
export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: process.env.NODE_ENV !== 'production',
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### 4. Mobile Optimization Deployment

- **PWA Configuration:** Service worker and manifest
- **Responsive Images:** WebP format with fallbacks
- **Bundle Splitting:** Optimized for mobile networks
- **Core Web Vitals:** LCP, FID, CLS optimization

---

## Backend Deployment

### 1. Supabase Edge Functions Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy fetch-instagram-profile
supabase functions deploy generate-ai-content-suggestions
supabase functions deploy performance-monitor

# Set environment variables for functions
supabase secrets set OPENAI_API_KEY=your-key
supabase secrets set STRIPE_SECRET_KEY=your-key
```

### 2. Critical Edge Functions

#### Performance Monitor (user-flow-analytics)

**Purpose:** Real-time monitoring of conversion flows

```typescript
// Key features implemented
- User session tracking
- Conversion funnel analysis
- A/B test performance monitoring
- Error detection and reporting
- Real-time dashboard updates
```

#### Conversion Tracking

**Purpose:** Track all conversion-related events

```typescript
// Events tracked
- Conversion widget views
- Conversion center opens
- Feature comparison interactions
- CTA button clicks
- Trial sign-ups
- Payment completions
```

### 3. Cron Jobs Setup

```bash
# Create scheduled functions
supabase functions deploy cron-competitor-metrics
supabase functions deploy cron-market-insights

# Set up cron jobs
supabase cron jobs create "0 */6 * * *" cron-competitor-metrics
supabase cron jobs create "0 2 * * *" cron-market-insights
```

### 4. Database Backup & Recovery

```bash
# Create backup
supabase db dump --data-only > backup-$(date +%Y%m%d).sql

# Restore backup
supabase db reset --linked
psql -h db.your-project.supabase.co -U postgres -d postgres -f backup-20251102.sql
```

---

## A/B Testing Infrastructure

### 1. A/B Testing Components Deployment

#### Feature Comparison Matrix
- **Location:** `src/components/Conversion/FeatureComparisonMatrix.tsx`
- **Purpose:** Compare Free vs Pro features
- **A/B Test Variants:** 3 variants (A, B, C)

#### Value Proposition Component
- **Location:** `src/components/Conversion/ValueProposition.tsx`
- **Purpose:** ROI calculations and success stories
- **A/B Test Variants:** 2 variants (A, B)

#### Social Proof Component
- **Location:** `src/components/Conversion/SocialProof.tsx`
- **Purpose:** User testimonials and trust indicators
- **A/B Test Variants:** 2 variants (A, B)

### 2. A/B Testing Configuration

```typescript
// ab-testing.config.ts
export const AB_TEST_CONFIG = {
  conversion_center: {
    enabled: true,
    variants: ['A', 'B', 'C'],
    traffic_split: { A: 33, B: 33, C: 34 },
    duration_days: 14,
    min_sample_size: 100
  },
  feature_comparison: {
    enabled: true,
    variants: ['A', 'B', 'C'],
    traffic_split: { A: 34, B: 33, C: 33 },
    duration_days: 21,
    min_sample_size: 150
  }
};
```

### 3. Conversion Tracking Setup

```sql
-- Create conversion events table
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  account_id UUID REFERENCES instagram_accounts(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  ab_variant VARCHAR(10),
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_conversion_events_user_type ON conversion_events(user_id, event_type);
CREATE INDEX idx_conversion_events_ab_variant ON conversion_events(ab_variant);
CREATE INDEX idx_conversion_events_created_at ON conversion_events(created_at);
```

### 4. A/B Test Analysis

```typescript
// Real-time A/B test monitoring
const analyzeABTest = async (testId: string) => {
  const { data } = await supabase
    .from('conversion_events')
    .select('ab_variant, event_type, count(*)')
    .eq('ab_variant', testId)
    .group('ab_variant, event_type');
  
  return calculateConversionRate(data);
};
```

---

## Conversion Components Deployment

### 1. Conversion Center Integration

#### Component Structure
```
src/components/Conversion/
├── ConversionCenter.tsx       # Main hub component
├── FeatureComparisonMatrix.tsx # Plan comparison
├── ValueProposition.tsx       # ROI calculator
├── UpgradeCTA.tsx            # Call-to-actions
├── SocialProof.tsx           # Testimonials
└── LimitationMessage.tsx     # Usage limits
```

#### State Management Integration
```typescript
// Conversion context for state management
export const useConversion = () => {
  const [showConversionCenter, setShowConversionCenter] = useState(false);
  const [conversionVariant, setConversionVariant] = useState('A');
  
  // A/B test assignment logic
  useEffect(() => {
    const variant = assignABTestVariant();
    setConversionVariant(variant);
  }, []);
  
  return {
    showConversionCenter,
    setShowConversionCenter,
    conversionVariant
  };
};
```

### 2. Behavioral Triggers

#### Usage-Based Triggers
- **70% Usage:** Subtle conversion widget (30% chance)
- **90% Usage:** Full conversion center modal
- **95% Usage:** Urgent upgrade prompt

#### Engagement-Based Triggers
- **High Engagement Users:** Conversion center (20% chance)
- **Milestone Achievements:** Upgrade celebration + CTA
- **Feature Requests:** Contextual upgrade prompts

### 3. Conversion Funnel Tracking

```typescript
// Track conversion funnel steps
export const trackConversionFunnel = (step: string, data?: any) => {
  const event = {
    step,
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
    user_agent: navigator.userAgent,
    ...data
  };
  
  // Send to analytics
  supabase.from('conversion_events').insert({
    event_type: 'conversion_funnel',
    event_data: event
  });
};
```

---

## Monitoring & Alerting

### 1. Real-Time Monitoring Dashboard

#### Admin Monitoring Function
```typescript
// supabase/functions/admin-monitor/index.ts
const monitorSystemHealth = async () => {
  const metrics = {
    active_users: await getActiveUserCount(),
    conversion_rate: await calculateConversionRate(),
    api_response_time: await getAverageApiResponseTime(),
    error_rate: await getErrorRate(),
    ab_test_performance: await getABTestResults()
  };
  
  // Check thresholds and send alerts
  if (metrics.error_rate > 0.05) {
    await sendAlert('high_error_rate', metrics);
  }
  
  return metrics;
};
```

#### Key Metrics to Monitor

- **User Engagement:** Session duration, page views, feature usage
- **Conversion Metrics:** Trial sign-ups, conversion rates, A/B test performance
- **System Health:** API response times, error rates, database performance
- **Business Metrics:** Revenue, churn rate, user growth

### 2. Alert Configuration

#### Critical Alerts
- **Error Rate > 5%** (immediate)
- **Conversion Rate Drop > 20%** (1 hour)
- **API Response Time > 2s** (30 minutes)
- **Database Connection Failures** (immediate)

#### Warning Alerts
- **User Registration Drop > 15%** (4 hours)
- **A/B Test Significance** (24 hours)
- **High Memory Usage** (2 hours)

### 3. Monitoring Tools Setup

#### Supabase Dashboard Monitoring
- **Real-time Metrics:** Active connections, query performance
- **Function Logs:** Edge function execution times and errors
- **Database Performance:** Query analysis and optimization suggestions

#### External Monitoring (Recommended)
- **New Relic or DataDog:** Application performance monitoring
- **Sentry:** Error tracking and performance monitoring
- **LogRocket or FullStory:** User session recording

---

## Rollback Procedures

### 1. Emergency Rollback Plan

#### Frontend Rollback (Vercel)

```bash
# Rollback to previous deployment
vercel rollback <deployment-url>

# Or via dashboard
# 1. Go to Vercel dashboard
# 2. Select project
# 3. Click "Rollback" on previous deployment
```

#### Backend Rollback (Supabase)

```bash
# Rollback Edge Functions
supabase functions deploy --previous-version

# Rollback database migration
supabase migration down <migration_timestamp>

# Or restore from backup
psql -h db.your-project.supabase.co -U postgres -d postgres -f backup-rollback.sql
```

### 2. Database Rollback Strategy

#### Critical Tables Protection
- **user_data:** Never rollback without full backup
- **analytics_data:** Can be regenerated if needed
- **conversion_events:** Critical for A/B testing - backup before rollback

#### Rollback Scripts

```sql
-- Emergency rollback script template
BEGIN;

-- Remove new columns added in latest migration
ALTER TABLE profiles DROP COLUMN IF EXISTS ab_test_variant;
ALTER TABLE profiles DROP COLUMN IF EXISTS conversion_events_tracked;

-- Drop new tables if created
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_context CASCADE;
DROP TABLE IF EXISTS user_personalization_state CASCADE;

-- Restore previous indexes
DROP INDEX IF EXISTS idx_conversion_events_user_id;
DROP INDEX IF EXISTS idx_conversion_events_account_id;

COMMIT;
```

### 3. Partial Rollback Options

#### Disable A/B Testing
```typescript
// Quick disable A/B testing
export const disableABTesting = () => {
  localStorage.setItem('ab_testing_disabled', 'true');
  // All users see variant 'A'
};
```

#### Disable Conversion Components
```typescript
// Hide conversion components
export const hideConversionComponents = () => {
  document.body.classList.add('conversion-disabled');
  // CSS will hide all conversion elements
};
```

---

## Post-Deployment Verification

### 1. Functional Testing Checklist

#### Frontend Testing
- [ ] Homepage loads correctly
- [ ] User authentication works
- [ ] Instagram account connection
- [ ] Dashboard analytics display
- [ ] Conversion center opens and functions
- [ ] A/B test variants display correctly
- [ ] Mobile responsiveness verified
- [ ] PWA functionality works

#### Backend Testing
- [ ] All Edge Functions respond correctly
- [ ] Database connections stable
- [ ] API endpoints return expected data
- [ ] Cron jobs executing on schedule
- [ ] Error handling works properly
- [ ] Performance within acceptable limits

#### A/B Testing Verification
- [ ] Users correctly assigned to variants
- [ ] Conversion events tracking properly
- [ ] Data collection functioning
- [ ] Statistical significance calculation working

### 2. Performance Testing

#### Load Testing
```bash
# Test API endpoints
npx artillery run load-test.yml

# Test database performance
psql -h db.your-project.supabase.co -c "EXPLAIN ANALYZE SELECT * FROM analytics_snapshots;"
```

#### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### 3. Security Verification

#### Security Checklist
- [ ] RLS policies active and tested
- [ ] API keys properly secured
- [ ] HTTPS enforced on all endpoints
- [ ] CORS configuration correct
- [ ] Environment variables secured
- [ ] User data encryption verified

---

## Deployment Timeline

### Phase 1: Pre-Deployment (Day -1)
- [ ] Complete backup of production
- [ ] Deploy to staging environment
- [ ] Run full test suite
- [ ] Performance testing
- [ ] Security audit
- [ ] Team sign-off

### Phase 2: Deployment (Day 0)

#### Morning (UTC)
- [ ] 08:00 - Maintenance mode enabled
- [ ] 08:15 - Database backup created
- [ ] 08:30 - Database migrations applied
- [ ] 09:00 - Edge functions deployed
- [ ] 09:30 - Frontend deployed
- [ ] 10:00 - Post-deployment testing
- [ ] 10:30 - Maintenance mode disabled

#### Afternoon (UTC)
- [ ] 14:00 - Monitor system performance
- [ ] 16:00 - A/B testing verification
- [ ] 18:00 - User acceptance testing
- [ ] 20:00 - Performance optimization

### Phase 3: Post-Deployment (Day +1 to +7)
- [ ] Daily monitoring reports
- [ ] A/B test results analysis
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Bug fixes if needed
- [ ] Documentation updates

---

## Contact & Support

### Emergency Contacts
- **Lead Developer:** [Contact Information]
- **DevOps Engineer:** [Contact Information]
- **Product Manager:** [Contact Information]

### Support Channels
- **Slack:** #deployment-support
- **Email:** dev-team@company.com
- **On-call:** [PagerDuty/Incident Response]

### Documentation Updates
This deployment guide should be updated after each deployment with:
- Lessons learned
- Process improvements
- New environment variables
- Updated rollback procedures

---

## Conclusion

This deployment guide provides comprehensive instructions for safely deploying the Instagram Growth Tool v2.0 with its enhanced A/B testing infrastructure and conversion optimization components. Following this guide will ensure a smooth deployment process with minimal risk and maximum business impact.

**Key Success Factors:**
1. Thorough pre-deployment testing
2. Proper backup procedures
3. Clear rollback plans
4. Continuous monitoring
5. Team communication

For questions or issues during deployment, refer to the troubleshooting section or contact the development team immediately.