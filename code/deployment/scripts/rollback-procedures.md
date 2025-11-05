# Emergency Rollback Procedures

**Document Version:** 1.0  
**Last Updated:** November 2, 2025  
**Purpose:** Quick reference for emergency rollback situations

---

## 🚨 Emergency Rollback Scenarios

### Immediate Rollback Triggers
- **Error Rate > 10%** for more than 5 minutes
- **Database Corruption** detected
- **Security Breach** or data leak
- **Complete Service Outage** > 15 minutes
- **Critical Bug** affecting core functionality
- **A/B Test Results** showing >50% conversion drop

---

## ⏱️ Quick Rollback Commands

### Frontend Rollback (Vercel)
```bash
# Rollback to previous deployment
vercel rollback <deployment-url>

# Rollback to specific timestamp
vercel rollback --target=2025-11-02T13:00:00Z

# Via dashboard: 
# 1. Go to Vercel Dashboard → Deployments
# 2. Find previous working deployment
# 3. Click "Rollback" button
```

### Database Rollback
```bash
# Restore from latest backup
psql $DATABASE_URL < /tmp/production-backup-YYYYMMDD-HHMMSS/database-backup.sql

# Rollback specific migration
psql $DATABASE_URL -c "DROP TABLE IF EXISTS new_table CASCADE;"
psql $DATABASE_URL -c "ALTER TABLE table_name DROP COLUMN IF EXISTS new_column;"
```

### Edge Functions Rollback
```bash
# Rollback to previous function version
supabase functions deploy --previous-version

# Rollback specific function
supabase functions deploy function-name --previous-version
```

---

## 🔄 Complete Rollback Procedure

### Phase 1: Immediate Actions (0-5 minutes)

#### 1. Activate Emergency Team
```bash
# Send alert to emergency team
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-type: application/json' \
  --data '{
    "text": "🚨 EMERGENCY: Production rollback initiated at '"$(date)"'",
    "channel": "#emergency",
    "username": "DeployBot"
  }'
```

#### 2. Enable Maintenance Mode
```bash
# Enable maintenance page
echo "Maintenance mode activated" > /var/www/html/maintenance.html

# Or via load balancer configuration
# Update load balancer to show maintenance page
```

#### 3. Stop New Deployments
```bash
# Cancel any running deployments
pkill -f "vercel\|deploy\|build"

# Lock deployment pipeline (implement based on CI/CD setup)
```

### Phase 2: Assessment (5-10 minutes)

#### 1. Identify Problem Scope
```bash
# Check error rates
curl -s $MONITORING_API_URL/error-rates | jq '.current_rate'

# Check database integrity
psql $DATABASE_URL -c "SELECT * FROM pg_stat_database WHERE datname = 'postgres';"

# Check API response times
curl -s $MONITORING_API_URL/response-times | jq '.avg_response_time'
```

#### 2. Determine Rollback Type
- **Partial Rollback:** Frontend only
- **Partial Rollback:** Database only  
- **Partial Rollback:** Edge Functions only
- **Full Rollback:** Everything

### Phase 3: Execute Rollback (10-20 minutes)

#### Option A: Frontend Rollback
```bash
# Quick rollback
vercel rollback <previous-deployment-url>

# Verify rollback
curl -I $APP_URL
# Should return 200 and show previous version

# Test critical functionality
curl -s $APP_URL/api/health | jq '.status'
```

#### Option B: Database Rollback
```bash
# Restore from backup
pg_restore \
  --host=$DB_HOST \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  /tmp/production-backup-YYYYMMDD-HHMMSS/database-backup.sql

# Verify database integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM profiles;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM instagram_accounts;"
```

#### Option C: Edge Functions Rollback
```bash
# List current function versions
supabase functions list

# Deploy previous versions
supabase functions deploy --previous-version

# Verify functions
curl -X POST $FUNCTION_URL \
  -H 'Authorization: Bearer $ANON_KEY' \
  -d '{}'
```

#### Option D: Full Rollback
```bash
# Complete rollback script
./code/deployment/scripts/rollback-production.sh \
  --backup-dir=/tmp/production-backup-YYYYMMDD-HHMMSS \
  --confirm
```

### Phase 4: Verification (20-30 minutes)

#### 1. System Health Check
```bash
# Database connectivity
psql $DATABASE_URL -c "SELECT 'Database OK' as status;"

# API endpoints
for endpoint in "/api/health" "/api/user/profile" "/api/analytics"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL$endpoint)
  echo "$endpoint: HTTP $status"
done

# Critical functionality
curl -s $APP_URL | grep -q "Instagram Growth Tool" && echo "Frontend: OK" || echo "Frontend: FAIL"
```

#### 2. Business Logic Check
```bash
# Test user registration
curl -X POST $APP_URL/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"test123"}'

# Test Instagram connection
curl -X POST $APP_URL/api/instagram/connect \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"username":"test"}'

# Test conversion tracking
curl -X POST $APP_URL/api/conversion/track \
  -H 'Content-Type: application/json' \
  -d '{"event_type":"test","user_id":"test"}'
```

### Phase 5: Post-Rollback Actions (30+ minutes)

#### 1. Enable Services
```bash
# Disable maintenance mode
rm -f /var/www/html/maintenance.html

# Resume normal traffic
# Update load balancer configuration if needed
```

#### 2. Monitoring Verification
```bash
# Check error rates (should be back to normal)
curl -s $MONITORING_API_URL/error-rates

# Check response times
curl -s $MONITORING_API_URL/response-times

# Check user activity
curl -s $MONITORING_API_URL/active-users
```

#### 3. Communication
```bash
# Notify team of rollback completion
curl -X POST $SLACK_WEBPOOK_URL \
  -H 'Content-type: application/json' \
  --data '{
    "text": "✅ Rollback completed successfully at '"$(date)"'",
    "channel": "#updates",
    "username": "DeployBot"
  }'
```

---

## 🛠️ Rollback Tools & Scripts

### Automated Rollback Script
```bash
#!/bin/bash
# File: code/deployment/scripts/rollback-production.sh

BACKUP_DIR=${1:-}
CONFIRM=${2:-}

if [ -z "$BACKUP_DIR" ] || [ "$CONFIRM" != "--confirm" ]; then
  echo "Usage: $0 <backup-dir> --confirm"
  echo "Example: $0 /tmp/production-backup-20251102-130000 --confirm"
  exit 1
fi

echo "🚨 INITIATING EMERGENCY ROLLBACK"
echo "Backup Directory: $BACKUP_DIR"
echo "Timestamp: $(date)"
echo ""

# Database rollback
echo "Rolling back database..."
psql $DATABASE_URL < $BACKUP_DIR/database-backup.sql

# Frontend rollback
echo "Rolling back frontend..."
vercel rollback --target=previous

# Functions rollback  
echo "Rolling back Edge Functions..."
supabase functions deploy --previous-version

echo "✅ Rollback completed"
```

### Quick Rollback Commands
```bash
# Frontend only
vercel rollback

# Database only
psql $DATABASE_URL < /tmp/latest-backup.sql

# Functions only
supabase functions deploy --previous-version

# Everything
./rollback-production.sh /tmp/production-backup-$(date +%Y%m%d-%H%M%S) --confirm
```

---

## 📋 Rollback Checklist

### Pre-Rollback Verification
- [ ] Emergency team notified
- [ ] Maintenance mode enabled
- [ ] Current state documented
- [ ] Backup locations identified
- [ ] Rollback plan confirmed

### During Rollback
- [ ] Database backup restored
- [ ] Frontend reverted
- [ ] Edge Functions reverted
- [ ] Configuration restored
- [ ] Monitoring re-enabled

### Post-Rollback Verification
- [ ] System health check passed
- [ ] Critical functionality working
- [ ] Error rates normal
- [ ] Response times acceptable
- [ ] User functionality verified
- [ ] Business metrics stable
- [ ] Team notified of completion

### Follow-up Actions
- [ ] Root cause analysis scheduled
- [ ] Incident report created
- [ ] Lessons learned documented
- [ ] Process improvements identified
- [ ] Prevention measures planned

---

## 🔍 Common Rollback Scenarios

### Scenario 1: High Error Rate
**Symptoms:** Error rate >10%  
**Action:** Frontend rollback  
**Timeline:** 5 minutes

```bash
vercel rollback
# Check error rates
curl -s $MONITORING_API_URL/error-rates
```

### Scenario 2: Database Issues
**Symptoms:** Connection failures, data corruption  
**Action:** Database rollback  
**Timeline:** 15 minutes

```bash
psql $DATABASE_URL < /tmp/latest-database-backup.sql
# Verify integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM profiles;"
```

### Scenario 3: A/B Test Problems
**Symptoms:** Conversion rate drop >50%  
**Action:** Disable A/B testing  
**Timeline:** 2 minutes

```bash
# Disable A/B testing
curl -X POST $APP_URL/api/admin/ab-testing/disable
# Or frontend configuration change
```

### Scenario 4: Edge Function Failures
**Symptoms:** API timeouts, function errors  
**Action:** Function rollback  
**Timeline:** 3 minutes

```bash
supabase functions deploy --previous-version
# Test specific function
curl -X POST $FUNCTION_URL -d '{}'
```

### Scenario 5: Complete Outage
**Symptoms:** No response from any service  
**Action:** Full rollback  
**Timeline:** 20 minutes

```bash
./rollback-production.sh /tmp/latest-backup --confirm
```

---

## 📞 Emergency Contacts

### Primary On-Call
- **Name:** [Primary Contact]
- **Phone:** [Phone Number]
- **Email:** [Email]

### Secondary On-Call
- **Name:** [Secondary Contact]
- **Phone:** [Phone Number]
- **Email:** [Email]

### Escalation Path
1. **On-Call Engineer** (0-5 minutes)
2. **Senior Engineer** (5-15 minutes)
3. **Engineering Manager** (15-30 minutes)
4. **CTO** (30+ minutes)

### External Support
- **Supabase Support:** [Support URL]
- **Vercel Support:** [Support URL]
- **Database Provider:** [Support URL]

---

## 📚 Additional Resources

### Backup Locations
- **Database Backups:** `/tmp/production-backup-*/`
- **Frontend Backups:** Vercel deployment history
- **Function Backups:** Supabase version control

### Monitoring Dashboards
- **Error Tracking:** [Sentry Dashboard]
- **Performance Monitoring:** [DataDog Dashboard]
- **Business Metrics:** [Custom Dashboard]

### Documentation
- **Deployment Guide:** `docs/deployment-guide.md`
- **Architecture Diagram:** `docs/architecture.md`
- **Runbooks:** `docs/runbooks/`

---

## ⚠️ Important Notes

1. **Always backup before deploying** to ensure rollback is possible
2. **Test rollback procedures** in staging environment regularly
3. **Document any manual steps** taken during rollback
4. **Communicate with stakeholders** throughout the process
5. **Conduct post-mortem** after any emergency rollback

Remember: **Speed is important, but accuracy is more important.** Take the time to verify each step of the rollback process.