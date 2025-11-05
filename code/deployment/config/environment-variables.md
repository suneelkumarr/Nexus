# Environment Variables Documentation

**Version:** 2.0  
**Last Updated:** November 2, 2025  
**Environment:** All (Development, Staging, Production)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Backend Environment Variables](#backend-environment-variables)
4. [Database Environment Variables](#database-environment-variables)
5. [External Service Variables](#external-service-variables)
6. [Feature Flags](#feature-flags)
7. [Security Variables](#security-variables)
8. [Monitoring Variables](#monitoring-variables)
9. [Environment-Specific Values](#environment-specific-values)
10. [Variable Naming Conventions](#variable-naming-conventions)

---

## Overview

This document provides comprehensive documentation for all environment variables used in the Instagram Growth Tool deployment. Variables are organized by category and include descriptions, default values, and environment-specific configurations.

### Environment Variable Priority

1. **Production:** Highest priority, strict validation
2. **Staging:** Testing environment with production-like data
3. **Development:** Local development with test data

---

## Frontend Environment Variables

### Application Configuration

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_APP_URL` | Base URL of the application | `http://localhost:5173` | Yes | All |
| `NODE_ENV` | Node.js environment mode | `development` | Yes | All |
| `BUILD_MODE` | Build optimization level | `development` | Yes | All |

### Supabase Configuration

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL | - | Yes | All |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | - | Yes | All |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin only) | - | Backend Only | All |

**Example:**
```env
# Development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key

# Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
```

### Stripe Payment Integration

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | - | Yes | All |
| `VITE_STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - | Backend Only | All |

**Example:**
```env
# Development (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Production (Live Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Instagram API Configuration

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_INSTAGRAM_CLIENT_ID` | Instagram Basic Display API client ID | - | Yes | All |
| `VITE_INSTAGRAM_REDIRECT_URI` | OAuth redirect URI | `{APP_URL}/auth/callback` | Yes | All |

**Example:**
```env
VITE_INSTAGRAM_CLIENT_ID=your-instagram-client-id
VITE_INSTAGRAM_REDIRECT_URI=https://app.yourdomain.com/auth/callback
```

### A/B Testing Configuration

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_AB_TESTING_ENABLED` | Enable A/B testing infrastructure | `false` | No | All |
| `VITE_CONVERSION_TRACKING_ENABLED` | Enable conversion event tracking | `false` | No | All |
| `AB_TEST_SAMPLE_RATE` | Percentage of users in A/B tests | `100` | No | All |
| `AB_TEST_DURATION_DAYS` | Default A/B test duration | `14` | No | All |

**Example:**
```env
# Staging
VITE_AB_TESTING_ENABLED=true
VITE_CONVERSION_TRACKING_ENABLED=true
AB_TEST_SAMPLE_RATE=100
AB_TEST_DURATION_DAYS=14

# Production
VITE_AB_TESTING_ENABLED=true
VITE_CONVERSION_TRACKING_ENABLED=true
AB_TEST_SAMPLE_RATE=100
AB_TEST_DURATION_DAYS=14
```

---

## Backend Environment Variables

### Supabase Edge Functions

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `SUPABASE_URL` | Supabase project URL | - | Yes | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | - | Yes | All |
| `SUPABASE_ANON_KEY` | Anonymous key for public operations | - | Yes | All |
| `SUPABASE_JWT_SECRET` | JWT secret for token validation | - | Yes | All |

### Stripe Backend Configuration

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side) | - | Yes | All |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret | - | Yes | All |
| `STRIPE_PRICE_ID_BASIC` | Stripe price ID for basic plan | - | No | All |
| `STRIPE_PRICE_ID_PRO` | Stripe price ID for pro plan | - | No | All |
| `STRIPE_PRICE_ID_ENTERPRISE` | Stripe price ID for enterprise plan | - | No | All |

### External API Keys

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | - | Yes | All |
| `INSTAGRAM_CLIENT_SECRET` | Instagram API client secret | - | Yes | All |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram long-lived access token | - | Yes | All |

---

## Database Environment Variables

### PostgreSQL Configuration

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `DATABASE_URL` | Complete database connection string | - | Yes | All |
| `DB_HOST` | Database server hostname | - | Yes | All |
| `DB_PORT` | Database server port | `5432` | No | All |
| `DB_NAME` | Database name | `postgres` | No | All |
| `DB_USER` | Database username | `postgres` | No | All |
| `DB_PASSWORD` | Database password | - | Yes | All |

**Example:**
```env
# Standard format
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Supabase format
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

### Database Performance

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `DB_POOL_SIZE` | Maximum connection pool size | `20` | No | All |
| `DB_TIMEOUT` | Query timeout in milliseconds | `30000` | No | All |
| `DB_SSL_MODE` | SSL connection mode | `prefer` | No | Production |

---

## External Service Variables

### Email Service (SendGrid)

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key for email sending | - | Yes | All |
| `SENDGRID_FROM_EMAIL` | Default sender email address | - | Yes | All |
| `SENDGRID_TEMPLATE_ID` | Email template ID for notifications | - | No | All |

### Cloud Storage (AWS S3)

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key ID | - | Yes | All |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | - | Yes | All |
| `AWS_REGION` | AWS region for S3 | `us-east-1` | No | All |
| `AWS_S3_BUCKET` | S3 bucket name for file storage | - | Yes | All |

### CDN Configuration

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `CDN_URL` | CDN base URL for static assets | `{APP_URL}` | No | Production |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID | - | No | Production |

---

## Feature Flags

### Core Features

| Variable | Description | Default | Environment |
|----------|-------------|---------|-------------|
| `VITE_FEATURE_CONVERSION_CENTER` | Enable conversion center component | `false` | All |
| `VITE_FEATURE_AB_TESTING` | Enable A/B testing features | `false` | All |
| `VITE_FEATURE_MOBILE_OPTIMIZATION` | Enable mobile optimization | `true` | All |
| `VITE_FEATURE_AI_INSIGHTS` | Enable AI-powered insights | `false` | All |
| `VITE_FEATURE_SOCIAL_PROOF` | Enable social proof components | `false` | All |

### Advanced Features

| Variable | Description | Default | Environment |
|----------|-------------|---------|-------------|
| `VITE_FEATURE_COMPETITOR_ANALYSIS` | Enable competitor analysis | `true` | Staging/Prod |
| `VITE_FEATURE_HASHTAG_OPTIMIZATION` | Enable hashtag optimization | `true` | Staging/Prod |
| `VITE_FEATURE_GROWTH_RECOMMENDATIONS` | Enable AI growth recommendations | `false` | All |
| `VITE_FEATURE_CONTENT_DISCOVERY` | Enable content discovery | `true` | All |
| `VITE_FEATURE_EXPORT_REPORTS` | Enable exportable reports | `true` | All |

**Usage Example:**
```typescript
// Check feature flags in components
const ConversionCenter = () => {
  const enableConversionCenter = import.meta.env.VITE_FEATURE_CONVERSION_CENTER === 'true';
  
  if (!enableConversionCenter) {
    return null;
  }
  
  return <div>Conversion Center Content</div>;
};
```

---

## Security Variables

### Authentication & Authorization

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `JWT_SECRET` | Secret key for JWT token signing | - | Yes | All |
| `BCRYPT_ROUNDS` | Bcrypt password hashing rounds | `12` | No | All |
| `SESSION_SECRET` | Secret for session encryption | - | Yes | All |

### Security Headers & CORS

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `*` | No | All |
| `VITE_SECURITY_HEADERS_ENABLED` | Enable security headers | `false` | No | Production |
| `VITE_HTTPS_ONLY` | Force HTTPS in production | `false` | No | Production |
| `VITE_RATE_LIMITING_ENABLED` | Enable API rate limiting | `false` | No | Production |

### API Security

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `API_RATE_LIMIT` | Default API rate limit per minute | `1000` | No | All |
| `AUTH_RATE_LIMIT` | Authentication endpoint rate limit | `100` | No | All |
| `CONVERSION_RATE_LIMIT` | Conversion tracking rate limit | `100` | No | All |

---

## Monitoring Variables

### Error Tracking (Sentry)

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `SENTRY_DSN` | Sentry DSN for error tracking | - | Yes | All |
| `SENTRY_ENVIRONMENT` | Environment name for Sentry | `development` | No | All |
| `SENTRY_RELEASE` | Release version for Sentry | - | No | All |
| `SENTRY_SAMPLE_RATE` | Error sampling rate (0-1) | `0.1` | No | All |

### Analytics & Monitoring

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_ANALYTICS_ENABLED` | Enable analytics tracking | `false` | No | All |
| `MIXPANEL_TOKEN` | Mixpanel project token | - | No | All |
| `GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | - | No | Production |
| `VITE_HOTJAR_ID` | Hotjar site ID for user recordings | - | No | Production |

### Application Performance

| Variable | Description | Default | Required | Environment |
|----------|-------------|---------|----------|-------------|
| `VITE_API_TIMEOUT` | API request timeout in milliseconds | `10000` | No | All |
| `VITE_CACHE_TTL` | Cache time-to-live in milliseconds | `300000` | No | All |
| `VITE_BUNDLE_ANALYZER` | Enable bundle analyzer in dev | `false` | No | Development |

---

## Environment-Specific Values

### Development Environment

```env
# Core Configuration
NODE_ENV=development
BUILD_MODE=development
VITE_APP_URL=http://localhost:5173

# Database (Local)
DATABASE_URL=postgresql://postgres:password@localhost:5432/instagram_growth_dev

# Debugging
VITE_DEBUG_MODE=true
SENTRY_DSN=https://dev-sentry-dsn@sentry.io/project
VITE_BUNDLE_ANALYZER=true

# Feature Flags (All enabled for development)
VITE_FEATURE_CONVERSION_CENTER=true
VITE_FEATURE_AB_TESTING=true
VITE_FEATURE_AI_INSIGHTS=true
VITE_CONVERSION_TRACKING_ENABLED=true
```

### Staging Environment

```env
# Core Configuration
NODE_ENV=staging
BUILD_MODE=staging
VITE_APP_URL=https://staging.yourdomain.com

# Database (Supabase Staging)
DATABASE_URL=postgresql://postgres:password@db.staging.supabase.co:5432/postgres
VITE_SUPABASE_URL=https://staging-project.supabase.co

# Payment (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Monitoring
SENTRY_DSN=https://staging-sentry-dsn@sentry.io/project
MIXPANEL_TOKEN=staging-mixpanel-token

# Feature Flags (Production-like)
VITE_FEATURE_CONVERSION_CENTER=true
VITE_FEATURE_AB_TESTING=true
VITE_FEATURE_MOBILE_OPTIMIZATION=true
```

### Production Environment

```env
# Core Configuration
NODE_ENV=production
BUILD_MODE=prod
VITE_APP_URL=https://app.yourdomain.com

# Database (Supabase Production)
DATABASE_URL=postgresql://postgres:password@db.production.supabase.co:5432/postgres
VITE_SUPABASE_URL=https://production-project.supabase.co

# Payment (Live Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Security
VITE_SECURITY_HEADERS_ENABLED=true
VITE_HTTPS_ONLY=true
VITE_CORS_ORIGINS=https://app.yourdomain.com

# Monitoring
SENTRY_DSN=https://production-sentry-dsn@sentry.io/project
GOOGLE_ANALYTICS_ID=GA-XXXXXXXX-X
VITE_HOTJAR_ID=your-hotjar-id

# CDN
CDN_URL=https://cdn.yourdomain.com
VITE_ASSET_CDN_URL=https://cdn.yourdomain.com

# Feature Flags (Optimized for performance)
VITE_FEATURE_CONVERSION_CENTER=true
VITE_FEATURE_AB_TESTING=true
VITE_BUNDLE_ANALYZER=false
```

---

## Variable Naming Conventions

### Prefix Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `VITE_` | Frontend build-time variables | `VITE_SUPABASE_URL` |
| `DB_` | Database configuration | `DB_HOST` |
| `STRIPE_` | Stripe payment integration | `STRIPE_SECRET_KEY` |
| `AWS_` | AWS service configuration | `AWS_ACCESS_KEY_ID` |
| `AB_` | A/B testing configuration | `AB_TEST_SAMPLE_RATE` |
| `VITE_FEATURE_` | Feature flags | `VITE_FEATURE_CONVERSION_CENTER` |

### Boolean Variables

- Use `true`/`false` string values (not `1`/`0`)
- Prefix with `ENABLE_` or `DISABLE_` for clarity
- Default to `false` for security-sensitive features

### Numeric Variables

- Use milliseconds for timeouts and delays
- Use percentages for sample rates (0-100)
- Use days for duration values

### JSON Variables

- Use escaped JSON strings for complex configuration
- Validate at application startup
- Provide sensible defaults

---

## Validation & Security

### Required Variable Validation

```typescript
// validate-env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  // ... other validations
});

const env = EnvSchema.parse(process.env);
```

### Security Best Practices

1. **Never commit secrets** to version control
2. **Use different keys** for each environment
3. **Rotate keys regularly** (quarterly minimum)
4. **Monitor for exposed secrets** using git hooks or scanners
5. **Use secret management** services in production
6. **Validate all inputs** at application startup
7. **Log missing variables** for debugging

### Environment Variable Sources

1. **Local development:** `.env.local` files
2. **Staging:** CI/CD environment variables
3. **Production:** Secret management service (AWS Secrets Manager, etc.)

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `VITE_SUPABASE_URL is not defined` | Add to `.env.local` or CI/CD variables |
| Build fails with missing env vars | Check `vite.config.ts` for env variable mapping |
| Runtime errors with undefined vars | Validate environment variables at startup |
| Feature flags not working | Check boolean string values (`true` vs `true`) |

### Debug Commands

```bash
# List all environment variables
printenv | grep VITE_

# Check specific variable
echo $VITE_SUPABASE_URL

# Validate .env file syntax
env -0 | sort

# Check build-time variables
npx vite info
```

---

## Maintenance Schedule

### Monthly Reviews
- [ ] Review and update default values
- [ ] Audit security variables for rotation needs
- [ ] Update documentation for new variables
- [ ] Validate environment-specific configurations

### Quarterly Reviews
- [ ] Comprehensive security audit
- [ ] Performance impact assessment
- [ ] Feature flag optimization
- [ ] Documentation updates

### Annual Reviews
- [ ] Complete variable inventory
- [ ] Technology stack updates
- [ ] Security posture assessment
- [ ] Process improvements

---

This documentation should be kept up-to-date with any changes to environment variables or deployment configurations.