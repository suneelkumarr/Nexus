-- Admin Analytics Table
-- Platform-wide analytics for system monitoring and insights

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

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_admin_analytics_metric_type ON admin_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_time_period ON admin_analytics(time_period);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_period_start ON admin_analytics(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_period_end ON admin_analytics(period_end DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_aggregation_level ON admin_analytics(aggregation_level);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_created_at ON admin_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_region ON admin_analytics(region);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_subscription_tier ON admin_analytics(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_metadata ON admin_analytics USING GIN(metadata);

-- Composite indexes for common analytical queries
CREATE INDEX IF NOT EXISTS idx_admin_analytics_metric_period ON admin_analytics(metric_type, time_period, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_tier_metric ON admin_analytics(subscription_tier, metric_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_region_metric ON admin_analytics(region, metric_type, period_start DESC);

-- Unique constraint to prevent duplicate metrics for the same period
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_analytics_unique_metric ON admin_analytics(
    metric_type, time_period, period_start, aggregation_level, 
    COALESCE(region, ''), COALESCE(subscription_tier, '')
);

-- Updated at trigger
CREATE OR REPLACE TRIGGER update_admin_analytics_updated_at 
    BEFORE UPDATE ON admin_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE admin_analytics ENABLE ROW LEVEL SECURITY;

-- Only enterprise-tier admin users can view analytics
CREATE POLICY "Enterprise admins can view all analytics" ON admin_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );

-- Only enterprise-tier admin users can insert analytics
CREATE POLICY "Enterprise admins can insert analytics" ON admin_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );

-- Only enterprise-tier admin users can update analytics
CREATE POLICY "Enterprise admins can update analytics" ON admin_analytics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );

-- Only enterprise-tier admin users can delete analytics
CREATE POLICY "Enterprise admins can delete analytics" ON admin_analytics
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );

-- Pro-tier users can view limited analytics
CREATE POLICY "Pro users can view limited analytics" ON admin_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'pro'
        )
        AND metric_type IN ('feature_usage', 'engagement_rates', 'user_retention')
    );

-- Function to calculate analytics aggregations
CREATE OR REPLACE FUNCTION calculate_admin_analytics(
    p_metric_type VARCHAR,
    p_time_period VARCHAR,
    p_aggregation_level VARCHAR DEFAULT 'platform',
    p_region VARCHAR DEFAULT NULL,
    p_subscription_tier VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    metric_value DECIMAL(15,6),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ
) AS $$
BEGIN
    -- This is a placeholder function that would contain the actual
    -- analytics calculation logic based on the specific metric type
    -- Implementation would vary based on the data sources and requirements
    
    RETURN QUERY SELECT 
        0.0::DECIMAL(15,6) as metric_value,
        NOW() - INTERVAL '1 day' as period_start,
        NOW() as period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE admin_analytics IS 'Platform-wide analytics for system monitoring and business insights';
COMMENT ON COLUMN admin_analytics.metric_type IS 'Type of analytics metric being tracked';
COMMENT ON COLUMN admin_analytics.value IS 'Numeric value of the analytics metric';
COMMENT ON COLUMN admin_analytics.metadata IS 'Additional context and breakdown data';
COMMENT ON COLUMN admin_analytics.time_period IS 'Time period aggregation level';
COMMENT ON COLUMN admin_analytics.period_start IS 'Start of the measurement period';
COMMENT ON COLUMN admin_analytics.period_end IS 'End of the measurement period';
COMMENT ON COLUMN admin_analytics.aggregation_level IS 'Level of data aggregation';
COMMENT ON COLUMN admin_analytics.region IS 'Geographic region for regional analytics';
COMMENT ON COLUMN admin_analytics.subscription_tier IS 'Subscription tier for tier-based analytics';