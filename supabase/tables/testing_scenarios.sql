-- Testing Scenarios Table
-- Store automated testing results and test execution data

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

-- Indexes for performance optimization
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

-- Composite indexes for common testing queries
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_suite_status ON testing_scenarios(test_suite, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_type_status ON testing_scenarios(test_type, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_env_status ON testing_scenarios(environment, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_branch_status ON testing_scenarios(git_branch, status, created_at DESC);

-- Partial indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_failed ON testing_scenarios(test_name, created_at DESC) 
    WHERE status = 'failed';
CREATE INDEX IF NOT EXISTS idx_testing_scenarios_recent ON testing_scenarios(test_suite, test_name, created_at DESC) 
    WHERE created_at >= NOW() - INTERVAL '30 days';

-- Updated at trigger
CREATE OR REPLACE TRIGGER update_testing_scenarios_updated_at 
    BEFORE UPDATE ON testing_scenarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set completed_at when status changes to final state
CREATE OR REPLACE FUNCTION set_test_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('passed', 'failed', 'error', 'timeout', 'skipped') 
       AND OLD.status NOT IN ('passed', 'failed', 'error', 'timeout', 'skipped') THEN
        NEW.completed_at = NOW();
        -- Calculate execution time if not already set
        IF NEW.execution_time = 0 AND NEW.started_at IS NOT NULL THEN
            NEW.execution_time = EXTRACT(EPOCH FROM (NOW() - NEW.started_at)) * 1000;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER set_testing_scenarios_completed_at 
    BEFORE UPDATE ON testing_scenarios 
    FOR EACH ROW EXECUTE FUNCTION set_test_completed_at();

-- Trigger to set started_at when status changes to running
CREATE OR REPLACE FUNCTION set_test_started_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'running' AND OLD.status != 'running' AND NEW.started_at IS NULL THEN
        NEW.started_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER set_testing_scenarios_started_at 
    BEFORE UPDATE ON testing_scenarios 
    FOR EACH ROW EXECUTE FUNCTION set_test_started_at();

-- Row Level Security (RLS) policies
ALTER TABLE testing_scenarios ENABLE ROW LEVEL SECURITY;

-- Developers and testers can view all test results
CREATE POLICY "Authenticated users can view test results" ON testing_scenarios
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert new test scenarios
CREATE POLICY "Authenticated users can insert test scenarios" ON testing_scenarios
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update test scenarios they created or system-wide updates
CREATE POLICY "Users can update test scenarios" ON testing_scenarios
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR 
            user_id IS NULL  -- Allow system updates
        )
    );

-- Enterprise admins can manage all test scenarios
CREATE POLICY "Enterprise admins can manage all test scenarios" ON testing_scenarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier = 'enterprise'
        )
    );

-- Pro users can delete test scenarios older than 30 days
CREATE POLICY "Pro users can delete old test scenarios" ON testing_scenarios
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('pro', 'enterprise')
        )
        AND created_at < NOW() - INTERVAL '30 days'
    );

-- Function to create a new test scenario
CREATE OR REPLACE FUNCTION create_test_scenario(
    p_test_name VARCHAR,
    p_test_type VARCHAR,
    p_test_suite VARCHAR DEFAULT NULL,
    p_environment VARCHAR DEFAULT 'test',
    p_user_id UUID DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    scenario_id BIGINT;
BEGIN
    INSERT INTO testing_scenarios (
        test_name, test_type, test_suite, environment, user_id, status
    )
    VALUES (
        p_test_name, p_test_type, p_test_suite, p_environment, COALESCE(p_user_id, auth.uid()), 'pending'
    )
    RETURNING id INTO scenario_id;
    
    RETURN scenario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update test scenario status and results
CREATE OR REPLACE FUNCTION update_test_scenario_result(
    p_scenario_id BIGINT,
    p_status VARCHAR,
    p_results JSONB DEFAULT '{}',
    p_execution_time INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    UPDATE testing_scenarios 
    SET 
        status = p_status,
        results = COALESCE(p_results, results),
        execution_time = COALESCE(p_execution_time, execution_time),
        updated_at = NOW()
    WHERE id = p_scenario_id;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get test suite summary
CREATE OR REPLACE FUNCTION get_test_suite_summary(
    p_test_suite VARCHAR,
    p_environment VARCHAR DEFAULT NULL,
    p_time_range INTERVAL DEFAULT '24 hours'
)
RETURNS TABLE(
    total_tests BIGINT,
    passed_tests BIGINT,
    failed_tests BIGINT,
    error_tests BIGINT,
    skipped_tests BIGINT,
    success_rate DECIMAL(5,2),
    avg_execution_time DECIMAL(10,2),
    total_execution_time BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_tests,
        COUNT(*) FILTER (WHERE status = 'passed') as passed_tests,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_tests,
        COUNT(*) FILTER (WHERE status = 'error') as error_tests,
        COUNT(*) FILTER (WHERE status = 'skipped') as skipped_tests,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'passed')::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0
        END as success_rate,
        ROUND(AVG(execution_time)::DECIMAL, 2) as avg_execution_time,
        SUM(execution_time) as total_execution_time
    FROM testing_scenarios 
    WHERE test_suite = p_test_suite
        AND (p_environment IS NULL OR environment = p_environment)
        AND created_at >= NOW() - p_time_range;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE testing_scenarios IS 'Automated testing scenarios and execution results';
COMMENT ON COLUMN testing_scenarios.test_name IS 'Name or identifier of the test';
COMMENT ON COLUMN testing_scenarios.test_type IS 'Type of test being executed';
COMMENT ON COLUMN testing_scenarios.test_suite IS 'Test suite or group this test belongs to';
COMMENT ON COLUMN testing_scenarios.status IS 'Current execution status of the test';
COMMENT ON COLUMN testing_scenarios.results IS 'Detailed test results and assertions';
COMMENT ON COLUMN testing_scenarios.execution_time IS 'Test execution time in milliseconds';
COMMENT ON COLUMN testing_scenarios.environment IS 'Environment where the test was executed';
COMMENT ON COLUMN testing_scenarios.git_commit IS 'Git commit hash for version tracking';
COMMENT ON COLUMN testing_scenarios.git_branch IS 'Git branch where the test was executed';
COMMENT ON FUNCTION create_test_scenario IS 'Create a new test scenario entry';
COMMENT ON FUNCTION update_test_scenario_result IS 'Update test scenario with results and status';
COMMENT ON FUNCTION get_test_suite_summary IS 'Get summary statistics for a test suite';