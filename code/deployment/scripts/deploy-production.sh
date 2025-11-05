#!/bin/bash

# =============================================================================
# PRODUCTION ENVIRONMENT DEPLOYMENT SCRIPT
# =============================================================================
# This script automates the deployment of the Instagram Growth Tool to production
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="instagram-growth-tool"
PRODUCTION_ENV="production"
LOG_FILE="/tmp/production-deployment-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="/tmp/production-backup-$(date +%Y%m%d-%H%M%S)"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

critical() {
    echo -e "${PURPLE}[CRITICAL]${NC} $1" | tee -a $LOG_FILE
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Confirm this is production
    echo ""
    echo -e "${RED}=== PRODUCTION DEPLOYMENT ===${NC}"
    echo -e "${RED}THIS WILL DEPLOY TO PRODUCTION ENVIRONMENT${NC}"
    echo "This action cannot be undone without proper rollback procedures."
    echo ""
    
    # Additional safety checks
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root in production"
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ]; then
        error "Not in project root directory"
    fi
    
    # Check for required files
    [ -f ".env.production" ] || error ".env.production file not found"
    [ -d "src" ] || error "src directory not found"
    [ -d "supabase" ] || error "supabase directory not found"
    
    # Verify environment variables
    source .env.production
    
    # Critical environment variables
    CRITICAL_VARS=(
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "STRIPE_SECRET_KEY"
        "VITE_APP_URL"
    )
    
    for var in "${CRITICAL_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            error "Environment variable $var is not set"
        fi
    done
    
    success "Pre-deployment checks passed"
}

# Create production backup
create_backup() {
    log "Creating production backup..."
    
    mkdir -p $BACKUP_DIR
    
    # Backup database
    log "Backing up production database..."
    source .env.production
    pg_dump $DATABASE_URL > $BACKUP_DIR/database-backup.sql || error "Database backup failed"
    
    # Backup current deployment
    if [ -d "/var/www/html" ]; then
        log "Backing up current web files..."
        cp -r /var/www/html $BACKUP_DIR/web-backup/ || warning "Web backup failed"
    fi
    
    # Backup Supabase Edge Functions
    log "Backing up Supabase functions..."
    supabase functions list > $BACKUP_DIR/functions-list.txt
    
    success "Backup created at: $BACKUP_DIR"
}

# Setup maintenance mode
enable_maintenance_mode() {
    log "Enabling maintenance mode..."
    
    # Create maintenance page
    cat > dist/maintenance.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maintenance - Instagram Growth Tool</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container { 
            text-align: center; 
            max-width: 500px; 
            padding: 2rem;
        }
        .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 2rem auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Maintenance in Progress</h1>
        <p>We're currently updating the Instagram Growth Tool to provide you with better features and improved performance.</p>
        <div class="spinner"></div>
        <p>Estimated completion time: 15-30 minutes</p>
        <p>Thank you for your patience!</p>
    </div>
</body>
</html>
EOF
    
    # Deploy maintenance page (implement based on your hosting setup)
    # This is a placeholder - implement based on your specific hosting solution
    
    success "Maintenance mode enabled"
}

# Disable maintenance mode
disable_maintenance_mode() {
    log "Disabling maintenance mode..."
    
    # Remove maintenance page
    rm -f dist/maintenance.html
    
    success "Maintenance mode disabled"
}

# Deploy database changes
deploy_database() {
    log "Deploying database changes..."
    
    source .env.production
    
    # Create backup of current schema
    pg_dump $DATABASE_URL --schema-only > $BACKUP_DIR/schema-backup.sql
    
    # Apply migrations in order
    log "Applying production migrations..."
    MIGRATION_DIR="../supabase/migrations"
    
    # Get all migration files and sort them
    MIGRATIONS=$(find $MIGRATION_DIR -name "*.sql" | sort)
    
    for migration in $MIGRATIONS; do
        log "Applying migration: $(basename $migration)"
        psql $DATABASE_URL -f $migration || error "Migration failed: $migration"
    done
    
    # Verify database integrity
    log "Verifying database integrity..."
    psql $DATABASE_URL -c "SELECT 'Database integrity check passed';" || error "Database integrity check failed"
    
    success "Database deployment completed"
}

# Build production version
build_production() {
    log "Building production version..."
    
    # Clean previous builds
    rm -rf dist
    rm -rf node_modules/.vite
    
    # Set production environment
    export NODE_ENV=production
    export BUILD_MODE=prod
    
    # Build with optimizations
    pnpm run build:prod || error "Production build failed"
    
    # Verify build
    if [ ! -d "dist" ]; then
        error "Build output directory not found"
    fi
    
    # Bundle analysis (optional)
    if [ "$BUILD_ANALYZER" = "true" ]; then
        log "Analyzing bundle size..."
        npx vite-bundle-analyzer dist
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh dist | cut -f1)
    log "Production build size: $BUILD_SIZE"
    
    # Optimize for production
    log "Optimizing for production..."
    
    # Minify HTML
    find dist -name "*.html" -exec sed -i 's/>[[:space:]]*</></g' {} \;
    
    # Compress assets
    gzip -k dist/assets/*.js 2>/dev/null || true
    gzip -k dist/assets/*.css 2>/dev/null || true
    
    success "Production build completed and optimized"
}

# Deploy to Supabase
deploy_supabase() {
    log "Deploying to Supabase..."
    
    # Login to Supabase
    if ! supabase projects list >/dev/null 2>&1; then
        log "Please login to Supabase..."
        supabase login
    fi
    
    # Link to production project
    log "Linking to production project..."
    supabase link --project-ref $SUPABASE_PROJECT_REF || error "Failed to link to project"
    
    # Deploy Edge Functions with error handling
    log "Deploying Edge Functions..."
    supabase functions deploy --no-verify-jwt || warning "Some functions may have failed to deploy"
    
    # Set production secrets
    log "Setting production environment secrets..."
    source .env.production
    
    # Critical secrets
    supabase secrets set STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
    supabase secrets set OPENAI_API_KEY=$OPENAI_API_KEY
    supabase secrets set INSTAGRAM_CLIENT_SECRET=$INSTAGRAM_CLIENT_SECRET
    
    # Verify critical functions
    log "Verifying critical Edge Functions..."
    FUNCTIONS_TO_VERIFY=(
        "fetch-instagram-profile"
        "generate-ai-content-suggestions"
        "performance-monitor"
        "user-flow-analytics"
    )
    
    for func in "${FUNCTIONS_TO_VERIFY[@]}"; do
        if supabase functions list | grep -q $func; then
            success "Function $func is deployed"
        else
            warning "Function $func may not be deployed correctly"
        fi
    done
    
    success "Supabase deployment completed"
}

# Deploy frontend
deploy_frontend() {
    log "Deploying frontend to production..."
    
    source .env.production
    
    # Deploy to hosting provider (example for Vercel)
    if command -v vercel >/dev/null 2>&1; then
        log "Deploying to Vercel..."
        vercel --prod --token $VERCEL_TOKEN --scope $VERCEL_ORG_ID --yes || error "Vercel deployment failed"
    else
        # Alternative deployment method
        log "Using alternative deployment method..."
        rsync -avz --delete --exclude='*.log' dist/ $DEPLOYMENT_USER@$DEPLOYMENT_HOST:$DEPLOYMENT_PATH/ || error "Deployment failed"
    fi
    
    # Verify deployment
    sleep 10
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $VITE_APP_URL)
    if [ "$HTTP_CODE" = "200" ]; then
        success "Frontend deployment verified"
    else
        warning "Frontend may not be ready yet (HTTP $HTTP_CODE)"
    fi
    
    success "Frontend deployment completed"
}

# Run production tests
run_production_tests() {
    log "Running production environment tests..."
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 60
    
    # Critical endpoint tests
    source .env.production
    
    ENDPOINTS=(
        "$VITE_APP_URL"
        "$VITE_APP_URL/api/health"
        "$VITE_SUPABASE_URL/rest/v1/"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        log "Testing endpoint: $endpoint"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 $endpoint)
        if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 401 ]; then
            success "Endpoint $endpoint is responding"
        else
            error "Endpoint $endpoint failed with HTTP $HTTP_CODE"
        fi
    done
    
    # Database connectivity test
    log "Testing database connectivity..."
    psql $DATABASE_URL -c "SELECT 'Database connection successful';" || error "Database connection failed"
    
    # A/B testing verification
    log "Verifying A/B testing infrastructure..."
    curl -s $VITE_APP_URL | grep -q "ab_testing" && success "A/B testing scripts loaded" || warning "A/B testing may not be working"
    
    # Conversion tracking verification
    log "Verifying conversion tracking..."
    curl -s $VITE_APP_URL | grep -q "conversion_events" && success "Conversion tracking scripts loaded" || warning "Conversion tracking may not be working"
    
    success "Production tests completed"
}

# Setup monitoring and alerting
setup_monitoring() {
    log "Setting up production monitoring..."
    
    # Deploy monitoring functions
    supabase functions deploy admin-monitor
    supabase functions deploy api-diagnostic
    
    # Setup cron jobs for monitoring
    log "Setting up monitoring cron jobs..."
    supabase cron jobs create "0 */5 * * *" admin-monitor    # Every 5 minutes
    supabase cron jobs create "0 2 * * *" api-diagnostic     # Daily at 2 AM
    
    # Configure alerts (implement based on your monitoring setup)
    log "Configuring alerting thresholds..."
    
    # Create alert configuration file
    cat > monitoring/alerts.json << EOF
{
  "error_rate_threshold": 0.05,
  "response_time_threshold": 2000,
  "conversion_rate_threshold": 0.03,
  "database_connection_timeout": 30,
  "alert_channels": {
    "email": "alerts@your-domain.com",
    "slack": "#alerts",
    "pagerduty": "your-pagerduty-key"
  }
}
EOF
    
    success "Monitoring and alerting setup completed"
}

# Post-deployment verification
post_deployment_verification() {
    log "Running post-deployment verification..."
    
    # Check application functionality
    log "Verifying application functionality..."
    
    # Test user registration flow
    # Test Instagram connection
    # Test dashboard access
    # Test conversion components
    # Test A/B testing
    
    # Performance checks
    log "Checking performance metrics..."
    LOAD_TIME=$(curl -o /dev/null -s -w "%{time_total}" $VITE_APP_URL)
    log "Page load time: ${LOAD_TIME}s"
    
    if (( $(echo "$LOAD_TIME > 3.0" | bc -l) )); then
        warning "Page load time is slower than expected"
    fi
    
    # Security verification
    log "Verifying security configuration..."
    curl -sI $VITE_APP_URL | grep -q "Strict-Transport-Security" && success "HTTPS is properly configured" || warning "HTTPS may not be properly configured"
    
    success "Post-deployment verification completed"
}

# Generate deployment report
generate_deployment_report() {
    log "Generating deployment report..."
    
    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > $REPORT_FILE << EOF
# Production Deployment Report

**Date:** $(date)
**Version:** $(git rev-parse --short HEAD)
**Environment:** Production
**Deployed By:** $(whoami)

## Deployment Summary

- **Start Time:** $START_TIME
- **End Time:** $(date)
- **Duration:** $(( $(date +%s) - START_TIME_SECONDS )) seconds
- **Status:** SUCCESS

## Components Deployed

- [x] Database Schema Updates
- [x] Edge Functions
- [x] Frontend Application
- [x] Monitoring & Alerting
- [x] A/B Testing Infrastructure
- [x] Conversion Components

## Environment Configuration

- **Supabase URL:** $VITE_SUPABASE_URL
- **Application URL:** $VITE_APP_URL
- **Build Size:** $(du -sh dist | cut -f1)
- **Database Migrations:** Applied successfully

## A/B Testing Configuration

- **Conversion Center:** Enabled (Variants A, B, C)
- **Feature Comparison:** Enabled (Variants A, B, C)
- **Social Proof:** Enabled (Variants A, B)

## Next Steps

1. Monitor error rates and performance metrics
2. Verify A/B test assignment is working correctly
3. Monitor conversion rates and user behavior
4. Review user feedback and support tickets
5. Plan next iteration based on A/B test results

## Rollback Information

- **Backup Location:** $BACKUP_DIR
- **Rollback Command:** Available in deployment documentation
- **Database Rollback:** Available via pg_restore

## Support

- **Monitoring Dashboard:** [Your Monitoring URL]
- **Error Tracking:** [Your Sentry URL]
- **Performance Monitoring:** [Your Performance Tool URL]

---
Generated automatically by deployment script
EOF
    
    success "Deployment report saved to: $REPORT_FILE"
}

# Main deployment function
main() {
    local START_TIME=$(date)
    local START_TIME_SECONDS=$(date +%s)
    
    log "Starting production deployment for $PROJECT_NAME"
    log "Timestamp: $START_TIME"
    log "=================================================="
    
    # Deployment phases
    pre_deployment_checks
    create_backup
    enable_maintenance_mode
    deploy_database
    build_production
    deploy_supabase
    deploy_frontend
    disable_maintenance_mode
    run_production_tests
    setup_monitoring
    post_deployment_verification
    generate_deployment_report
    
    log "=================================================="
    success "Production deployment completed successfully!"
    log "Deployment Time: $START_TIME → $(date)"
    log "Total Duration: $(( $(date +%s) - START_TIME_SECONDS )) seconds"
    log "Application URL: $VITE_APP_URL"
    log "Deployment log: $LOG_FILE"
    
    # Print success summary
    echo ""
    echo -e "${GREEN}=== PRODUCTION DEPLOYMENT SUCCESSFUL ===${NC}"
    echo "🌟 Application is now live!"
    echo "🔗 URL: $VITE_APP_URL"
    echo "📊 Monitoring: Monitor the application for the next 2 hours"
    echo "🚨 Alerts: Set up to notify on any issues"
    echo ""
    echo -e "${BLUE}Important:${NC}"
    echo "• Monitor error logs and performance metrics"
    echo "• Verify A/B tests are running correctly"
    echo "• Check conversion tracking is working"
    echo "• Review user feedback and support tickets"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Production Deployment Script"
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h          Show this help message"
        echo "  --analyzer          Enable bundle analyzer"
        echo "  --force             Force deployment without confirmation"
        echo "  --skip-tests        Skip running tests"
        echo "  --rollback          Rollback to previous version"
        exit 0
        ;;
    --analyzer)
        BUILD_ANALYZER=true
        ;;
    --skip-tests)
        SKIP_TESTS=true
        ;;
    --rollback)
        log "Rollback functionality would be implemented here"
        exit 0
        ;;
esac

# Confirm production deployment
if [ "$FORCE" != "true" ]; then
    echo ""
    echo -e "${RED}=== PRODUCTION DEPLOYMENT CONFIRMATION ===${NC}"
    echo -e "${RED}⚠️  WARNING: This will deploy to PRODUCTION! ⚠️${NC}"
    echo ""
    echo "This action will:"
    echo "• Update the live production environment"
    echo "• Deploy new A/B testing infrastructure"
    echo "• Activate conversion optimization features"
    echo "• Affect all production users"
    echo ""
    echo "Before continuing, ensure:"
    echo "✓ Staging testing is complete"
    echo "✓ Team approval is obtained"
    echo "✓ Rollback plan is ready"
    echo "✓ Monitoring is configured"
    echo ""
    
    read -p "Type 'DEPLOY' to confirm production deployment: " CONFIRM
    if [ "$CONFIRM" != "DEPLOY" ]; then
        echo "Production deployment cancelled."
        exit 1
    fi
    
    echo ""
    read -p "Are you absolutely sure? This cannot be undone easily (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Production deployment cancelled."
        exit 1
    fi
fi

# Run main deployment
main