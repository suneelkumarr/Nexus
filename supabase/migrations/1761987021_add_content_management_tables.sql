-- Migration: add_content_management_tables
-- Created at: 1761987021

-- Create content_management table
CREATE TABLE IF NOT EXISTS content_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  title TEXT,
  caption TEXT,
  content_type TEXT CHECK (content_type IN ('post', 'story', 'reel', 'carousel')),
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'pending_approval')) DEFAULT 'draft',
  scheduled_date TIMESTAMPTZ,
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content_approval_workflows table
CREATE TABLE IF NOT EXISTS content_approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content_management(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  workflow_stage TEXT CHECK (workflow_stage IN ('draft_review', 'content_review', 'final_approval')),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewer_id UUID,
  reviewer_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Create ai_content_ideas table
CREATE TABLE IF NOT EXISTS ai_content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_type TEXT NOT NULL,
  hashtags TEXT[] NOT NULL,
  best_time TEXT,
  category TEXT CHECK (category IN ('educational', 'entertaining', 'promotional', 'inspirational', 'trending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content_tags table
CREATE TABLE IF NOT EXISTS content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content_management(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bulk_operations table
CREATE TABLE IF NOT EXISTS bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  operation_type TEXT CHECK (operation_type IN ('delete', 'status_change', 'add_tags', 'duplicate', 'archive')),
  items_count INTEGER NOT NULL,
  performed_by UUID,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_management_account_id ON content_management(account_id);
CREATE INDEX IF NOT EXISTS idx_content_management_status ON content_management(status);
CREATE INDEX IF NOT EXISTS idx_content_management_scheduled_date ON content_management(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_approval_workflows_account_id ON content_approval_workflows(account_id);
CREATE INDEX IF NOT EXISTS idx_content_approval_workflows_status ON content_approval_workflows(status);
CREATE INDEX IF NOT EXISTS idx_ai_content_ideas_account_id ON ai_content_ideas(account_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_ideas_category ON ai_content_ideas(category);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_account_id ON bulk_operations(account_id);

-- Enable Row Level Security
ALTER TABLE content_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_management
CREATE POLICY "Users can view their own content" ON content_management
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own content" ON content_management
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own content" ON content_management
  FOR UPDATE USING (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own content" ON content_management
  FOR DELETE USING (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for content_approval_workflows
CREATE POLICY "Users can view their own approvals" ON content_approval_workflows
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own approvals" ON content_approval_workflows
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own approvals" ON content_approval_workflows
  FOR UPDATE USING (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own approvals" ON content_approval_workflows
  FOR DELETE USING (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for ai_content_ideas
CREATE POLICY "Users can view their own AI ideas" ON ai_content_ideas
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own AI ideas" ON ai_content_ideas
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own AI ideas" ON ai_content_ideas
  FOR DELETE USING (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for content_tags
CREATE POLICY "Users can view their own tags" ON content_tags
  FOR SELECT USING (
    content_id IN (
      SELECT id FROM content_management WHERE account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own tags" ON content_tags
  FOR INSERT WITH CHECK (
    content_id IN (
      SELECT id FROM content_management WHERE account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own tags" ON content_tags
  FOR DELETE USING (
    content_id IN (
      SELECT id FROM content_management WHERE account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for bulk_operations
CREATE POLICY "Users can view their own bulk operations" ON bulk_operations
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own bulk operations" ON bulk_operations
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    )
  );;