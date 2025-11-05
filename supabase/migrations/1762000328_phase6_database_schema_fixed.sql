-- Migration: phase6_database_schema_fixed
-- Created at: 1762000328

-- Phase 6: Platform Enhancement & Testing Database Schema (Fixed)
-- Create 6 new tables for enterprise-grade features

-- 1. System Performance Metrics Table
CREATE TABLE IF NOT EXISTS system_performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL CHECK (metric_type IN (
        'response_time', 'memory_usage', 'cpu_usage', 'database_query_time',
        'api_latency', 'page_load_time', 'bundle_size', 'network_requests',
        'cache_hit_ratio', 'error_rate', 'concurrent_users', 'throughput'
    )),
    value DECIMAL(15,6) NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Global Search History Table
CREATE TABLE IF NOT EXISTS global_search_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    result_count INTEGER NOT NULL DEFAULT 0 CHECK (result_count >= 0),
    search_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (search_type IN (
        'general', 'hashtag', 'content', 'influencer', 'competitor',
        'analytics', 'user', 'post', 'account', 'trend'
    )),
    execution_time_ms INTEGER DEFAULT 0 CHECK (execution_time_ms >= 0),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Real-Time Notifications Table
CREATE TABLE IF NOT EXISTS real_time_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL CHECK (notification_type IN (
        'system_alert', 'performance_warning', 'data_update', 'user_action',
        'team_invite', 'export_ready', 'analysis_complete', 'sync_status',
        'security_alert', 'maintenance_notice', 'feature_update', 'milestone_reached'
    )),
    payload JSONB NOT NULL DEFAULT '{}',
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN (
        'pending', 'sent', 'delivered', 'failed', 'expired'
    )),
    channel VARCHAR(50) NOT NULL DEFAULT 'websocket' CHECK (channel IN (
        'websocket', 'push', 'email', 'sms', 'in_app'
    )),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Admin Analytics Table
CREATE TABLE IF NOT EXISTS admin_analytics (
    id BIGSERIAL PRIMARY KEY,
    metric_type VARCHAR(100) NOT NULL CHECK (metric_type IN (
        'total_users', 'active_users', 'new_registrations', 'user_retention',
        'feature_usage', 'api_calls', 'data_storage', 'bandwidth_usage',
        'error_rates', 'performance_scores', 'subscription_metrics', 'revenue_data',
        'geographic_distribution', 'device_analytics', 'browser_analytics', 'engagement_rates'
    )),
    value DECIMAL(15,6) NOT NULL,
    metadata JSONB DEFAULT '{}',
    time_period VARCHAR(50) NOT NULL DEFAULT 'daily' CHECK (time_period IN (
        'hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'real_time'
    )),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    aggregation_level VARCHAR(50) NOT NULL DEFAULT 'platform' CHECK (aggregation_level IN (
        'platform', 'region', 'subscription_tier', 'feature', 'user_segment'
    )),
    region VARCHAR(100),
    subscription_tier VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_period CHECK (period_end >= period_start)
);

-- 5. Security Audit Log Table
CREATE TABLE IF NOT EXISTS security_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL CHECK (action_type IN (
        'login_success', 'login_failure', 'logout', 'password_change', 'password_reset',
        'account_creation', 'account_deletion', 'profile_update', 'email_change',
        'two_factor_enabled', 'two_factor_disabled', 'api_key_created', 'api_key_revoked',
        'permission_granted', 'permission_revoked', 'team_invite', 'team_join', 'team_leave',
        'data_export', 'data_import', 'file_upload', 'file_download', 'file_deletion',
        'suspicious_activity', 'security_violation', 'rate_limit_exceeded', 'ip_blocked',
        'admin_action', 'system_access', 'database_query', 'configuration_change'
    )),
    details JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN (
        'low', 'info', 'warning', 'high', 'critical'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN (
        'success', 'failure', 'blocked', 'pending', 'error'
    )),
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    country_code VARCHAR(3),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Testing Scenarios Table
CREATE TABLE IF NOT EXISTS testing_scenarios (
    id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100) NOT NULL CHECK (test_type IN (
        'unit', 'integration', 'e2e', 'performance', 'security', 'api', 'ui',
        'regression', 'smoke', 'load', 'stress', 'accessibility', 'compatibility'
    )),
    test_suite VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN (
        'pending', 'running', 'passed', 'failed', 'skipped', 'error', 'timeout'
    )),
    results JSONB NOT NULL DEFAULT '{}',
    execution_time INTEGER NOT NULL DEFAULT 0 CHECK (execution_time >= 0),
    environment VARCHAR(100) NOT NULL DEFAULT 'test' CHECK (environment IN (
        'development', 'test', 'staging', 'production', 'local'
    )),
    browser VARCHAR(100),
    device_type VARCHAR(50),
    test_framework VARCHAR(100),
    version VARCHAR(50),
    git_commit VARCHAR(40),
    git_branch VARCHAR(255),
    build_number VARCHAR(100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_execution_time CHECK (
        (completed_at IS NULL AND started_at IS NULL) OR
        (completed_at IS NULL AND started_at IS NOT NULL) OR
        (completed_at >= started_at)
    )
);

-- CREATE INDEXES FOR PERFORMANCE OPTIMIZATION

-- System Performance Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_user_id ON system_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_metric_type ON system_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_timestamp ON system_performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_user_metric ON system_performance_metrics(user_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_created_at ON system_performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_metadata ON system_performance_metrics USING GIN(metadata);

-- Global Search History Indexes
CREATE INDEX IF NOT EXISTS idx_global_search_history_user_id ON global_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_global_search_history_query ON global_search_history(query);
CREATE INDEX IF NOT EXISTS idx_global_search_history_search_type ON global_search_history(search_type);
CREATE INDEX IF NOT EXISTS idx_global_search_history_timestamp ON global_search_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_global_search_history_created_at ON global_search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_search_history_user_type ON global_search_history(user_id, search_type);
CREATE INDEX IF NOT EXISTS idx_global_search_history_filters ON global_search_history USING GIN(filters);
CREATE INDEX IF NOT EXISTS idx_global_search_history_result_count ON global_search_history(result_count DESC);
CREATE INDEX IF NOT EXISTS idx_global_search_history_query_fts ON global_search_history USING GIN(to_tsvector('english', query));

-- Real-Time Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_user_id ON real_time_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_type ON real_time_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_read_status ON real_time_notifications(read_status);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_priority ON real_time_notifications(priority DESC);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_delivery_status ON real_time_notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_channel ON real_time_notifications(channel);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_created_at ON real_time_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_expires_at ON real_time_notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_user_unread ON real_time_notifications(user_id, read_status) WHERE read_status = FALSE;
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_payload ON real_time_notifications USING GIN(payload);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_user_priority ON real_time_notifications(user_id, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_pending ON real_time_notifications(delivery_status, priority DESC) WHERE delivery_status = 'pending';

-- Admin Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_admin_analytics_metric_type ON admin_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_time_period ON admin_analytics(time_period);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_period_start ON admin_analytics(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_period_end ON admin_analytics(period_end DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_aggregation_level ON admin_analytics(aggregation_level);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_created_at ON admin_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_region ON admin_analytics(region);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_subscription_tier ON admin_analytics(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_metadata ON admin_analytics USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_metric_period ON admin_analytics(metric_type, time_period, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_tier_metric ON admin_analytics(subscription_tier, metric_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_region_metric ON admin_analytics(region, metric_type, period_start DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_analytics_unique_metric ON admin_analytics(
    metric_type, time_period, period_start, aggregation_level, 
    COALESCE(region, ''), COALESCE(subscription_tier, '')
);

-- Security Audit Log Indexes
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action_type ON security_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_ip_address ON security_audit_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON security_audit_log(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_status ON security_audit_log(status);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_session_id ON security_audit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_request_id ON security_audit_log(request_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_resource ON security_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_details ON security_audit_log USING GIN(details);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_action ON security_audit_log(user_id, action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_ip_action ON security_audit_log(ip_address, action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_suspicious ON security_audit_log(severity, status, created_at DESC) 
    WHERE severity IN ('high', 'critical') OR status IN ('failure', 'blocked');
CREATE INDEX IF NOT EXISTS idx_security_audit_log_failed_logins ON security_audit_log(ip_address, created_at DESC) 
    WHERE action_type = 'login_failure';

-- Testing Scenarios Indexes
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_test_name ON testing_scenarios(test_name);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_test_type ON testing_scenarios(test_type);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_test_suite ON testing_scenarios(test_suite);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_status ON testing_scenarios(status);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_environment ON testing_scenarios(environment);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_created_at ON testing_scenarios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_execution_time ON testing_scenarios(execution_time DESC);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_user_id ON testing_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_git_commit ON testing_scenarios(git_commit);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_git_branch ON testing_scenarios(git_branch);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_results ON testing_scenarios USING GIN(results);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_suite_status ON testing_scenarios(test_suite, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_type_status ON testing_scenarios(test_type, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_env_status ON testing_scenarios(environment, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_branch_status ON testing_scenarios(git_branch, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_failed ON testing_scenarios(test_name, created_at DESC) 
    WHERE status = 'failed';

-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE system_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE testing_scenarios ENABLE ROW LEVEL SECURITY;;