-- Global Search History Table
-- Store search queries and results for search optimization and analytics

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

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_global_search_history_user_id ON global_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_global_search_history_query ON global_search_history(query);
CREATE INDEX IF NOT EXISTS idx_global_search_history_search_type ON global_search_history(search_type);
CREATE INDEX IF NOT EXISTS idx_global_search_history_timestamp ON global_search_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_global_search_history_created_at ON global_search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_search_history_user_type ON global_search_history(user_id, search_type);
CREATE INDEX IF NOT EXISTS idx_global_search_history_filters ON global_search_history USING GIN(filters);
CREATE INDEX IF NOT EXISTS idx_global_search_history_result_count ON global_search_history(result_count DESC);

-- Full-text search index for query text
CREATE INDEX IF NOT EXISTS idx_global_search_history_query_fts ON global_search_history USING GIN(to_tsvector('english', query));

-- Updated at trigger
CREATE OR REPLACE TRIGGER update_global_search_history_updated_at 
    BEFORE UPDATE ON global_search_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE global_search_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own search history
CREATE POLICY "Users can view own search history" ON global_search_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own search history
CREATE POLICY "Users can insert own search history" ON global_search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own search history
CREATE POLICY "Users can update own search history" ON global_search_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own search history
CREATE POLICY "Users can delete own search history" ON global_search_history
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policy for analytics and monitoring
CREATE POLICY "Admin can view all search history for analytics" ON global_search_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('enterprise', 'pro')
        )
    );

-- Team members can view search history within their team context
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

-- Comments for documentation
COMMENT ON TABLE global_search_history IS 'Global search queries and results for analytics and optimization';
COMMENT ON COLUMN global_search_history.user_id IS 'Reference to the user who performed the search';
COMMENT ON COLUMN global_search_history.query IS 'The search query text';
COMMENT ON COLUMN global_search_history.filters IS 'Applied search filters and parameters';
COMMENT ON COLUMN global_search_history.result_count IS 'Number of results returned';
COMMENT ON COLUMN global_search_history.search_type IS 'Type or category of search performed';
COMMENT ON COLUMN global_search_history.execution_time_ms IS 'Search execution time in milliseconds';
COMMENT ON COLUMN global_search_history.timestamp IS 'When the search was performed';