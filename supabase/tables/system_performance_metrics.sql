-- System Performance Metrics Table
-- Tracks system performance metrics for monitoring and optimization

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

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_user_id ON system_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_metric_type ON system_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_timestamp ON system_performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_user_metric ON system_performance_metrics(user_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_created_at ON system_performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_metadata ON system_performance_metrics USING GIN(metadata);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_system_performance_metrics_updated_at 
    BEFORE UPDATE ON system_performance_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE system_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Users can view their own performance metrics
CREATE POLICY "Users can view own performance metrics" ON system_performance_metrics
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own performance metrics
CREATE POLICY "Users can insert own performance metrics" ON system_performance_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own performance metrics
CREATE POLICY "Users can update own performance metrics" ON system_performance_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own performance metrics
CREATE POLICY "Users can delete own performance metrics" ON system_performance_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policy for all operations (users with admin role in team_management)
CREATE POLICY "Admin can manage all performance metrics" ON system_performance_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('enterprise', 'pro')
        )
    );

-- Comments for documentation
COMMENT ON TABLE system_performance_metrics IS 'System performance metrics for monitoring and optimization';
COMMENT ON COLUMN system_performance_metrics.user_id IS 'Reference to the user who owns this metric';
COMMENT ON COLUMN system_performance_metrics.metric_type IS 'Type of performance metric being tracked';
COMMENT ON COLUMN system_performance_metrics.value IS 'Numeric value of the performance metric';
COMMENT ON COLUMN system_performance_metrics.metadata IS 'Additional metadata and context for the metric';
COMMENT ON COLUMN system_performance_metrics.timestamp IS 'When the metric was recorded';