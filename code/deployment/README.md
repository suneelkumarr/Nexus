# Deployment Setup

**Version:** 2.0.0  
**Last Updated:** November 2, 2025  
**Purpose:** Comprehensive deployment infrastructure for Instagram Growth Tool v2.0

---

## 📁 Directory Structure

```
code/deployment/
├── environments/               # Environment configuration templates
│   ├── .env.staging.template  # Staging environment variables
│   └── .env.production.template # Production environment variables
├── scripts/                   # Deployment automation scripts
│   ├── deploy-staging.sh      # Staging deployment automation
│   ├── deploy-production.sh   # Production deployment automation
│   ├── setup-staging-db.sql   # Database setup script
│   ├── rollback-procedures.md # Emergency rollback documentation
│   └── deployment-checklist.md # Pre/post-deployment checklist
├── config/                    # Configuration files
│   └── environment-variables.md # Comprehensive env vars documentation
└── monitoring/               # Monitoring and alerting setup
    └── monitoring-config.yaml # Monitoring configuration
```

---

## 🚀 Quick Start

### 1. Environment Setup

#### Staging Environment
```bash
# Copy environment template
cp code/deployment/environments/.env.staging.template .env.staging

# Update with actual values
nano .env.staging

# Run staging deployment
./code/deployment/scripts/deploy-staging.sh
```

#### Production Environment
```bash
# Copy environment template
cp code/deployment/environments/.env.production.template .env.production

# Update with actual values
nano .env.production

# Run production deployment (with confirmation)
./code/deployment/scripts/deploy-production.sh --force
```

### 2. Database Setup

```bash
# Setup staging database
psql $DATABASE_URL -f code/deployment/scripts/setup-staging-db.sql

# Verify setup
psql $DATABASE_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

### 3. Monitoring Setup

```bash
# Deploy monitoring functions
supabase functions deploy admin-monitor
supabase functions deploy api-diagnostic

# Setup cron jobs
supabase cron jobs create "0 */6 * * *" admin-monitor
supabase cron jobs create "0 2 * * *" api-diagnostic
```

---

## 📋 Key Features

### A/B Testing Infrastructure
- ✅ **5 Conversion Components** with A/B testing variants
- ✅ **Feature Comparison Matrix** (3 variants: A, B, C)
- ✅ **Value Proposition** (2 variants: A, B)
- ✅ **Social Proof** (2 variants: A, B)
- ✅ **Conversion Center** with behavioral triggers
- ✅ **Real-time tracking** of conversion events

### Database Schema
- ✅ **Conversion Events Table** for A/B test tracking
- ✅ **User Preferences** for personalization
- ✅ **A/B Test Variants** management
- ✅ **Performance optimized** indexes
- ✅ **RLS Policies** for security

### Monitoring & Alerting
- ✅ **Real-time monitoring** of all components
- ✅ **A/B test performance** tracking
- ✅ **Conversion funnel** analysis
- ✅ **Error rate** monitoring
- ✅ **Performance metrics** tracking

### Deployment Automation
- ✅ **Staging deployment** script
- ✅ **Production deployment** script
- ✅ **Database migration** automation
- ✅ **Rollback procedures** documented
- ✅ **Environment configuration** templates

---

## 🔧 Configuration

### Environment Variables

All environment variables are documented in:
- `config/environment-variables.md` - Comprehensive documentation
- `environments/.env.staging.template` - Staging configuration
- `environments/.env.production.template` - Production configuration

### Required Variables

#### Critical (Must be set)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `OPENAI_API_KEY` - OpenAI API key
- `DATABASE_URL` - Database connection string

#### A/B Testing
- `VITE_AB_TESTING_ENABLED` - Enable A/B testing
- `VITE_CONVERSION_TRACKING_ENABLED` - Enable conversion tracking
- `AB_TEST_SAMPLE_RATE` - Traffic allocation percentage

#### Monitoring
- `SENTRY_DSN` - Error tracking
- `VITE_ANALYTICS_ENABLED` - Analytics tracking

---

## 📊 Monitoring & Alerting

### Monitoring Dashboard
Access monitoring dashboards at your configured URLs:

- **System Health:** Real-time system status
- **A/B Test Performance:** Test results and significance
- **Conversion Metrics:** Funnel analysis and rates
- **Business Metrics:** User engagement and revenue

### Alert Configuration

Critical alerts configured for:
- Error rate > 5%
- Response time > 2 seconds
- Conversion rate drop > 20%
- Database connection failures

Alert channels:
- Email notifications
- Slack integration
- PagerDuty for critical issues

---

## 🚨 Emergency Procedures

### Quick Rollback
```bash
# Frontend rollback
vercel rollback

# Database rollback
psql $DATABASE_URL < /tmp/latest-backup.sql

# Full rollback
./scripts/rollback-production.sh /tmp/latest-backup --confirm
```

### Emergency Contacts
- **On-Call Engineer:** [Contact Information]
- **Technical Lead:** [Contact Information]
- **DevOps Engineer:** [Contact Information]

### Rollback Documentation
Detailed rollback procedures available in:
- `scripts/rollback-procedures.md` - Emergency rollback guide

---

## 📈 A/B Testing Setup

### Test Configuration

#### Conversion Center Test
- **Variants:** A, B, C
- **Traffic Split:** 34%, 33%, 33%
- **Duration:** 14 days minimum
- **Sample Size:** 100 users minimum

#### Feature Comparison Test
- **Variants:** A, B, C
- **Traffic Split:** 34%, 33%, 33%
- **Duration:** 21 days minimum
- **Sample Size:** 150 users minimum

#### Social Proof Test
- **Variants:** A, B
- **Traffic Split:** 50%, 50%
- **Duration:** 14 days minimum
- **Sample Size:** 100 users minimum

### Test Monitoring

Track test performance:
```sql
-- Check traffic distribution
SELECT ab_variant, COUNT(*) as user_count
FROM conversion_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY ab_variant;

-- Monitor conversion rates
SELECT 
  ab_variant,
  COUNT(CASE WHEN event_type = 'trial_signup' THEN 1 END) as trials,
  COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
  ROUND(
    COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) * 100.0 / 
    COUNT(CASE WHEN event_type = 'trial_signup' THEN 1 END), 2
  ) as conversion_rate
FROM conversion_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY ab_variant;
```

---

## 🔐 Security Checklist

### Pre-Deployment
- [ ] API keys rotated
- [ ] SSL certificates valid
- [ ] CORS policies configured
- [ ] RLS policies tested
- [ ] Security scan passed

### Production Security
- [ ] HTTPS enforced
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Environment variables secured
- [ ] Access logs enabled

---

## 📝 Documentation

### Available Documentation

1. **Deployment Guide** (`docs/deployment-guide.md`)
   - Complete deployment procedures
   - Step-by-step instructions
   - Troubleshooting guide

2. **Environment Variables** (`config/environment-variables.md`)
   - All variables documented
   - Environment-specific values
   - Security considerations

3. **Rollback Procedures** (`scripts/rollback-procedures.md`)
   - Emergency rollback steps
   - Quick reference commands
   - Contact information

4. **Deployment Checklist** (`scripts/deployment-checklist.md`)
   - Pre/post-deployment verification
   - Sign-off procedures
   - Success criteria

---

## 🧪 Testing

### Staging Testing
```bash
# Deploy to staging
./scripts/deploy-staging.sh

# Run tests
npm run test
npm run test:e2e

# Verify A/B testing
curl -s https://staging.yourdomain.com | grep -o "ab_test_variant"
```

### Production Smoke Tests
```bash
# Verify deployment
curl -I https://app.yourdomain.com

# Test critical endpoints
for endpoint in "/api/health" "/api/user/profile"; do
  curl -s -o /dev/null -w "%{http_code}" https://app.yourdomain.com$endpoint
done
```

---

## 🔄 Continuous Improvement

### Process Reviews
- **Weekly:** Deployment metrics review
- **Monthly:** Process improvement identification
- **Quarterly:** Documentation updates
- **Annually:** Comprehensive audit

### Feedback Loop
- Collect user feedback post-deployment
- Monitor A/B test results
- Track performance metrics
- Update procedures based on learnings

---

## 📞 Support

### Getting Help

1. **Check Documentation:** Review relevant guides
2. **Check Logs:** Review deployment logs
3. **Contact Team:** Use emergency contacts
4. **Create Issue:** Document problem for tracking

### Common Issues

| Issue | Solution |
|-------|----------|
| Deployment fails | Check environment variables |
| A/B tests not working | Verify traffic allocation |
| High error rate | Review logs and rollback |
| Performance issues | Check monitoring dashboard |

---

## 🎯 Success Metrics

### Technical Success
- [ ] Error rate < 1%
- [ ] Response time < 2 seconds
- [ ] Uptime > 99.9%
- [ ] All tests passing

### Business Success
- [ ] A/B tests collecting data
- [ ] Conversion tracking working
- [ ] User experience improved
- [ ] Performance metrics stable

### A/B Testing Success
- [ ] Traffic split correct
- [ ] Event tracking accurate
- [ ] Sample size adequate
- [ ] Statistical significance achieved

---

**Deployment Infrastructure Version:** 2.0.0  
**Last Updated:** November 2, 2025  
**Maintained By:** Engineering Team

For the most up-to-date information, refer to the individual documentation files in each directory.