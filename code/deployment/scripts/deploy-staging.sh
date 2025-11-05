#!/bin/bash

# =============================================================================
# STAGING ENVIRONMENT DEPLOYMENT SCRIPT
# =============================================================================
# This script automates the deployment of the Instagram Growth Tool to staging
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="instagram-growth-tool"
STAGING_ENV="staging"
LOG_FILE="/tmp/deployment-$(date +%Y%m%d-%H%M%S).log"

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || error "Node.js is not installed"
    command -v pnpm >/dev/null 2>&1 || error "pnpm is not installed"
    command -v git >/dev/null 2>&1 || error "Git is not installed"
    command -v supabase >/dev/null 2>&1 || error "Supabase CLI is not installed"
    
    # Check if environment file exists
    if [ ! -f ".env.staging" ]; then
        warning ".env.staging not found. Copying from template..."
        cp code/deployment/environments/.env.staging.template .env.staging
        warning "Please update .env.staging with actual values before continuing"
        read -p "Press enter to continue after updating .env.staging"
    fi
    
    success "Prerequisites check completed"
}

# Setup staging database
setup_database() {
    log "Setting up staging database..."
    
    # Load environment variables
    source .env.staging
    
    # Apply database setup script
    log "Running database setup script..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f code/deployment/scripts/setup-staging-db.sql || error "Database setup failed"
    
    # Apply migrations in order
    log "Applying migrations..."
    MIGRATION_DIR="../supabase/migrations"
    
    # Get all migration files and sort them
    MIGRATIONS=$(find $MIGRATION_DIR -name "*.sql" | sort)
    
    for migration in $MIGRATIONS; do
        log "Applying migration: $(basename $migration)"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $migration || error "Migration failed: $migration"
    done
    
    success "Database setup completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Clean install
    pnpm clean
    
    # Install dependencies
    pnpm install --prefer-offline || error "Failed to install dependencies"
    
    success "Dependencies installed"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Type checking
    log "Running TypeScript type check..."
    pnpm run type-check || error "TypeScript check failed"
    
    # Linting
    log "Running ESLint..."
    pnpm run lint || error "ESLint failed"
    
    # Unit tests (if available)
    if [ -f "vitest.config.ts" ] || [ -f "jest.config.js" ]; then
        log "Running unit tests..."
        pnpm run test || error "Unit tests failed"
    fi
    
    success "All tests passed"
}

# Build staging version
build_staging() {
    log "Building staging version..."
    
    # Set staging environment
    export NODE_ENV=staging
    export BUILD_MODE=staging
    
    # Build the application
    pnpm run build || error "Build failed"
    
    # Verify build output
    if [ ! -d "dist" ]; then
        error "Build output directory not found"
    fi
    
    # Check bundle size
    BUILD_SIZE=$(du -sh dist | cut -f1)
    log "Build size: $BUILD_SIZE"
    
    success "Build completed"
}

# Deploy to Supabase
deploy_supabase() {
    log "Deploying to Supabase..."
    
    # Login to Supabase (if not already logged in)
    if ! supabase projects list >/dev/null 2>&1; then
        log "Please login to Supabase..."
        supabase login
    fi
    
    # Link to staging project
    log "Linking to staging project..."
    supabase link --project-ref $SUPABASE_PROJECT_REF || error "Failed to link to project"
    
    # Deploy Edge Functions
    log "Deploying Edge Functions..."
    supabase functions deploy || error "Failed to deploy Edge Functions"
    
    # Set secrets
    log "Setting environment secrets..."
    source .env.staging
    
    supabase secrets set OPENAI_API_KEY=$OPENAI_API_KEY
    supabase secrets set STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
    supabase secrets set INSTAGRAM_CLIENT_ID=$INSTAGRAM_CLIENT_ID
    supabase secrets set INSTAGRAM_CLIENT_SECRET=$INSTAGRAM_CLIENT_SECRET
    
    success "Supabase deployment completed"
}

# Deploy frontend to staging
deploy_frontend() {
    log "Deploying frontend to staging..."
    
    source .env.staging
    
    # Deploy to Vercel (example)
    if command -v vercel >/dev/null 2>&1; then
        log "Deploying to Vercel..."
        vercel --prod --token $VERCEL_TOKEN --scope $VERCEL_ORG_ID || error "Vercel deployment failed"
    else
        # Alternative: copy to web server
        log "Copying build to web server..."
        rsync -avz --delete dist/ $DEPLOYMENT_USER@$DEPLOYMENT_HOST:$DEPLOYMENT_PATH/
    fi
    
    success "Frontend deployment completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Deploy monitoring functions
    if [ -d "supabase/functions/admin-monitor" ]; then
        supabase functions deploy admin-monitor
    fi
    
    # Setup cron jobs for monitoring
    supabase cron jobs create "0 */6 * * *" admin-monitor
    
    success "Monitoring setup completed"
}

# Run post-deployment tests
run_post_deployment_tests() {
    log "Running post-deployment tests..."
    
    # Wait for deployment to be ready
    log "Waiting for deployment to be ready..."
    sleep 30
    
    # Test API endpoints
    source .env.staging
    
    ENDPOINTS=(
        "$VITE_APP_URL/api/health"
        "$VITE_APP_URL/api/user/profile"
        "$VITE_APP_URL/api/analytics/summary"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        log "Testing endpoint: $endpoint"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $endpoint)
        if [ "$HTTP_CODE" -eq 200 ]; then
            success "Endpoint $endpoint is working"
        else
            warning "Endpoint $endpoint returned HTTP $HTTP_CODE"
        fi
    done
    
    # Test database connectivity
    log "Testing database connectivity..."
    source .env.staging
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;" || error "Database connection failed"
    
    success "Post-deployment tests completed"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove temporary files
    rm -f .env.staging.backup
    
    # Clear npm cache
    pnpm store prune
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting staging deployment for $PROJECT_NAME"
    log "Timestamp: $(date)"
    log "=================================================="
    
    # Deployment phases
    check_prerequisites
    install_dependencies
    run_tests
    setup_database
    build_staging
    deploy_supabase
    deploy_frontend
    setup_monitoring
    run_post_deployment_tests
    cleanup
    
    log "=================================================="
    success "Staging deployment completed successfully!"
    log "Deployment log saved to: $LOG_FILE"
    log "Staging URL: $VITE_APP_URL"
    
    # Print important information
    echo ""
    echo -e "${GREEN}=== DEPLOYMENT SUMMARY ===${NC}"
    echo "Project: $PROJECT_NAME"
    echo "Environment: $STAGING_ENV"
    echo "Staging URL: $VITE_APP_URL"
    echo "Deployment Time: $(date)"
    echo "Log File: $LOG_FILE"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Verify staging environment manually"
    echo "2. Run user acceptance testing"
    echo "3. Monitor error logs and performance"
    echo "4. Plan production deployment if all checks pass"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h          Show this help message"
        echo "  --skip-tests        Skip running tests"
        echo "  --force             Force deployment without confirmation"
        echo "  --db-only           Setup database only"
        echo "  --frontend-only     Deploy frontend only"
        echo "  --backend-only      Deploy backend only"
        exit 0
        ;;
    --skip-tests)
        SKIP_TESTS=true
        ;;
    --force)
        FORCE=true
        ;;
    --db-only)
        check_prerequisites
        setup_database
        success "Database setup completed"
        exit 0
        ;;
    --frontend-only)
        check_prerequisites
        install_dependencies
        build_staging
        deploy_frontend
        success "Frontend deployment completed"
        exit 0
        ;;
    --backend-only)
        check_prerequisites
        setup_database
        deploy_supabase
        success "Backend deployment completed"
        exit 0
        ;;
esacs

# Confirm deployment if not forced
if [ "$FORCE" != "true" ]; then
    echo ""
    echo -e "${YELLOW}=== DEPLOYMENT CONFIRMATION ===${NC}"
    echo "This will deploy $PROJECT_NAME to staging environment."
    echo "This action may affect existing staging data."
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Run main deployment
main