-- Security Audit Log Table
-- Track security events and actions for compliance and monitoring

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

-- Indexes for performance optimization and security monitoring
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

-- Composite indexes for security analysis queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_action ON security_audit_log(user_id, action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_ip_action ON security_audit_log(ip_address, action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_suspicious ON security_audit_log(severity, status, created_at DESC) 
    WHERE severity IN ('high', 'critical') OR status IN ('failure', 'blocked');

-- Partial indexes for common security monitoring queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_failed_logins ON security_audit_log(ip_address, created_at DESC) 
    WHERE action_type = 'login_failure';
CREATE INDEX IF NOT EXISTS idx_security_audit_log_recent_activity ON security_audit_log(user_id, created_at DESC) 
    WHERE created_at >= NOW() - INTERVAL '7 days';

-- Row Level Security (RLS) policies
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON security_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- Only system and enterprise admins can insert audit logs
CREATE POLICY "System can insert audit logs" ON security_audit_log
    FOR INSERT WITH CHECK (
        auth.uid() IS NULL OR  -- Allow system inserts
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );

-- Enterprise admins can view all audit logs
CREATE POLICY "Enterprise admins can view all audit logs" ON security_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );

-- Pro users can view team member audit logs
CREATE POLICY "Pro users can view team audit logs" ON security_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            JOIN team_management tman ON tm.team_id = tman.id
            WHERE (tm.user_id = auth.uid() OR tman.owner_id = auth.uid())
            AND tm.status = 'active'
            AND tman.subscription_tier IN ('pro', 'enterprise')
            AND security_audit_log.user_id = tm.user_id
        )
    );

-- No direct update or delete policies - audit logs should be immutable
-- Only enterprise admins can delete for data retention purposes
CREATE POLICY "Enterprise admins can delete old audit logs" ON security_audit_log
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
        AND created_at < NOW() - INTERVAL '2 years'  -- Only allow deletion of logs older than 2 years
    );

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_action_type VARCHAR,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_severity VARCHAR DEFAULT 'info',
    p_status VARCHAR DEFAULT 'success',
    p_resource_type VARCHAR DEFAULT NULL,
    p_resource_id VARCHAR DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    audit_id BIGINT;
BEGIN
    INSERT INTO security_audit_log (
        user_id, action_type, details, ip_address, user_agent,
        severity, status, resource_type, resource_id
    )
    VALUES (
        p_user_id, p_action_type, p_details, p_ip_address, p_user_agent,
        p_severity, p_status, p_resource_type, p_resource_id
    )
    RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect suspicious patterns
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_time_window INTERVAL DEFAULT '1 hour'
)
RETURNS TABLE(
    pattern_type VARCHAR,
    count BIGINT,
    severity VARCHAR,
    first_occurrence TIMESTAMPTZ,
    last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
    -- Multiple failed login attempts
    RETURN QUERY
    SELECT 
        'failed_login_attempts'::VARCHAR as pattern_type,
        COUNT(*) as count,
        CASE 
            WHEN COUNT(*) >= 10 THEN 'critical'
            WHEN COUNT(*) >= 5 THEN 'high'
            ELSE 'warning'
        END::VARCHAR as severity,
        MIN(created_at) as first_occurrence,
        MAX(created_at) as last_occurrence
    FROM security_audit_log 
    WHERE action_type = 'login_failure'
        AND (p_user_id IS NULL OR user_id = p_user_id)
        AND (p_ip_address IS NULL OR ip_address = p_ip_address)
        AND created_at >= NOW() - p_time_window
    GROUP BY COALESCE(user_id::TEXT, ''), COALESCE(host(ip_address), '')
    HAVING COUNT(*) >= 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE security_audit_log IS 'Security audit log for tracking events and compliance monitoring';
COMMENT ON COLUMN security_audit_log.user_id IS 'Reference to the user performing the action (NULL for system actions)';
COMMENT ON COLUMN security_audit_log.action_type IS 'Type of security action or event';
COMMENT ON COLUMN security_audit_log.details IS 'Additional context and metadata about the event';
COMMENT ON COLUMN security_audit_log.ip_address IS 'IP address from which the action originated';
COMMENT ON COLUMN security_audit_log.user_agent IS 'User agent string of the client';
COMMENT ON COLUMN security_audit_log.severity IS 'Security severity level of the event';
COMMENT ON COLUMN security_audit_log.status IS 'Outcome status of the action';
COMMENT ON COLUMN security_audit_log.resource_type IS 'Type of resource accessed or modified';
COMMENT ON COLUMN security_audit_log.resource_id IS 'Identifier of the specific resource';
COMMENT ON FUNCTION log_security_event IS 'Helper function to insert security audit log entries';
COMMENT ON FUNCTION detect_suspicious_activity IS 'Analyze patterns and detect suspicious activities';