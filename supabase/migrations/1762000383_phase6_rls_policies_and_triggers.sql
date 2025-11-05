-- Migration: phase6_rls_policies_and_triggers
-- Created at: 1762000383

-- Phase 6: RLS Policies and Triggers for Platform Enhancement Tables

-- CREATE TRIGGERS FOR UPDATED_AT COLUMNS

-- Updated at trigger function (reuse existing if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE OR REPLACE TRIGGER update_system_performance_metrics_updated_at 
    BEFORE UPDATE ON system_performance_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_global_search_history_updated_at 
    BEFORE UPDATE ON global_search_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_real_time_notifications_updated_at 
    BEFORE UPDATE ON real_time_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_admin_analytics_updated_at 
    BEFORE UPDATE ON admin_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_testing_scenarios_updated_at 
    BEFORE UPDATE ON testing_scenarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE ROW LEVEL SECURITY POLICIES

-- System Performance Metrics RLS Policies
CREATE POLICY "Users can view own performance metrics" ON system_performance_metrics
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own performance metrics" ON system_performance_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own performance metrics" ON system_performance_metrics
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own performance metrics" ON system_performance_metrics
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all performance metrics" ON system_performance_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('enterprise', 'pro')
        )
    );

-- Global Search History RLS Policies
CREATE POLICY "Users can view own search history" ON global_search_history
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search history" ON global_search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own search history" ON global_search_history
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own search history" ON global_search_history
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all search history for analytics" ON global_search_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('enterprise', 'pro')
        )
    );
CREATE POLICY "Team members can view team search history" ON global_search_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            JOIN team_management tman ON tm.team_id = tman.id
            WHERE (tm.user_id = auth.uid() OR tman.owner_id = auth.uid())
            AND tm.status = 'active'
            AND global_search_history.user_id = tm.user_id
        )
    );

-- Real-Time Notifications RLS Policies
CREATE POLICY "Users can view own notifications" ON real_time_notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON real_time_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON real_time_notifications
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON real_time_notifications
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can insert all notifications" ON real_time_notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('enterprise')
        )
    );
CREATE POLICY "Admin can manage all notifications" ON real_time_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('enterprise', 'pro')
        )
    );

-- Admin Analytics RLS Policies
CREATE POLICY "Enterprise admins can view all analytics" ON admin_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );
CREATE POLICY "Enterprise admins can insert analytics" ON admin_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );
CREATE POLICY "Enterprise admins can update analytics" ON admin_analytics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );
CREATE POLICY "Enterprise admins can delete analytics" ON admin_analytics
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );
CREATE POLICY "Pro users can view limited analytics" ON admin_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'pro'
        )
        AND metric_type IN ('feature_usage', 'engagement_rates', 'user_retention')
    );

-- Security Audit Log RLS Policies
CREATE POLICY "Users can view own audit logs" ON security_audit_log
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert audit logs" ON security_audit_log
    FOR INSERT WITH CHECK (
        auth.uid() IS NULL OR  -- Allow system inserts
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );
CREATE POLICY "Enterprise admins can view all audit logs" ON security_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );
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
CREATE POLICY "Enterprise admins can delete old audit logs" ON security_audit_log
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
        AND created_at < NOW() - INTERVAL '2 years'  -- Only allow deletion of logs older than 2 years
    );

-- Testing Scenarios RLS Policies
CREATE POLICY "Authenticated users can view test results" ON testing_scenarios
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert test scenarios" ON testing_scenarios
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update test scenarios" ON testing_scenarios
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR 
            user_id IS NULL  -- Allow system updates
        )
    );
CREATE POLICY "Enterprise admins can manage all test scenarios" ON testing_scenarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );
CREATE POLICY "Pro users can delete old test scenarios" ON testing_scenarios
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('pro', 'enterprise')
        )
        AND created_at < NOW() - INTERVAL '30 days'
    );

-- COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE system_performance_metrics IS 'System performance metrics for monitoring and optimization';
COMMENT ON TABLE global_search_history IS 'Global search queries and results for analytics and optimization';
COMMENT ON TABLE real_time_notifications IS 'Real-time notification queue for WebSocket and push notifications';
COMMENT ON TABLE admin_analytics IS 'Platform-wide analytics for system monitoring and business insights';
COMMENT ON TABLE security_audit_log IS 'Security audit log for tracking events and compliance monitoring';
COMMENT ON TABLE testing_scenarios IS 'Automated testing scenarios and execution results';;