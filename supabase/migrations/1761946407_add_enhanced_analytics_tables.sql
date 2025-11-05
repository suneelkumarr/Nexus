-- Migration: add_enhanced_analytics_tables
-- Created at: 1761946407


-- Enhanced Metrics Table for calculated analytics
CREATE TABLE IF NOT EXISTS enhanced_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(10, 2),
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Predictions Table
CREATE TABLE IF NOT EXISTS performance_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  prediction_type VARCHAR(50) NOT NULL,
  predicted_value DECIMAL(10, 2),
  confidence_score DECIMAL(5, 2),
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automated Reports Table
CREATE TABLE IF NOT EXISTS automated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  report_type VARCHAR(20) NOT NULL,
  generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  report_data JSONB NOT NULL,
  delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_metrics_account ON enhanced_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_metrics_type ON enhanced_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_enhanced_metrics_date ON enhanced_metrics(calculation_date);

CREATE INDEX IF NOT EXISTS idx_performance_predictions_account ON performance_predictions(account_id);
CREATE INDEX IF NOT EXISTS idx_performance_predictions_type ON performance_predictions(prediction_type);

CREATE INDEX IF NOT EXISTS idx_automated_reports_account ON automated_reports(account_id);
CREATE INDEX IF NOT EXISTS idx_automated_reports_type ON automated_reports(report_type);

-- Enable RLS
ALTER TABLE enhanced_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enhanced_metrics
CREATE POLICY "Users can view their own enhanced metrics"
  ON enhanced_metrics FOR SELECT
  USING (account_id IN (SELECT id FROM instagram_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert enhanced metrics"
  ON enhanced_metrics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for performance_predictions
CREATE POLICY "Users can view their own predictions"
  ON performance_predictions FOR SELECT
  USING (account_id IN (SELECT id FROM instagram_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert predictions"
  ON performance_predictions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for automated_reports
CREATE POLICY "Users can view their own reports"
  ON automated_reports FOR SELECT
  USING (account_id IN (SELECT id FROM instagram_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert reports"
  ON automated_reports FOR INSERT
  WITH CHECK (true);
;