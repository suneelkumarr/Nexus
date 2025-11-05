-- Migration: add_content_management_tables
-- Created at: 1761984014

-- Create content_management table for storing all content items
CREATE TABLE IF NOT EXISTS content_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Content details
    content_type TEXT NOT NULL, -- 'post', 'story', 'reel'
    caption TEXT,
    hashtags TEXT[], -- Array of hashtags
    media_url TEXT,
    media_type TEXT, -- 'image', 'video', 'carousel'
    thumbnail_url TEXT,
    
    -- Scheduling
    scheduled_time TIMESTAMPTZ,
    timezone TEXT DEFAULT 'UTC',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', etc.
    
    -- Status and workflow
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_review', 'approved', 'scheduled', 'published', 'failed'
    approval_stage TEXT DEFAULT 'draft', -- 'draft', 'review', 'approved', 'rejected'
    
    -- Performance data (after publishing)
    published_at TIMESTAMPTZ,
    instagram_post_id TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Organization
    tags TEXT[],
    category TEXT,
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- AI assistance
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_suggestions JSONB, -- Store AI-generated suggestions
    
    -- Version control
    version INTEGER DEFAULT 1,
    previous_version_id UUID
);

-- Create content_approval_workflows table
CREATE TABLE IF NOT EXISTS content_approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content_management(id) ON DELETE CASCADE,
    
    -- Approval details
    approver_id UUID NOT NULL,
    approver_email TEXT,
    approval_status TEXT NOT NULL, -- 'pending', 'approved', 'rejected', 'changes_requested'
    
    -- Comments and feedback
    comments TEXT,
    feedback JSONB, -- Structured feedback data
    
    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    
    -- Metadata
    approval_level INTEGER DEFAULT 1, -- For multi-level approvals
    is_final_approval BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_content_ideas table
CREATE TABLE IF NOT EXISTS ai_content_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Idea details
    idea_category TEXT NOT NULL, -- 'educational', 'entertainment', 'promotional', 'behind_the_scenes', etc.
    generated_idea TEXT NOT NULL,
    caption TEXT,
    hashtags TEXT[],
    
    -- Content suggestions
    visual_concept TEXT,
    post_type TEXT, -- 'post', 'story', 'reel'
    media_suggestions JSONB, -- Suggestions for images/videos
    
    -- Performance prediction
    predicted_engagement_rate DECIMAL(5,2),
    performance_score INTEGER, -- 1-100 score
    target_audience TEXT,
    
    -- Trend data
    trending_topic TEXT,
    trend_score INTEGER, -- How trending this topic is
    
    -- Usage tracking
    used BOOLEAN DEFAULT FALSE,
    used_in_content_id UUID REFERENCES content_management(id),
    used_at TIMESTAMPTZ,
    
    -- Metadata
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- AI metadata
    ai_model TEXT,
    generation_parameters JSONB
);

-- Create bulk_operations table for tracking bulk actions
CREATE TABLE IF NOT EXISTS bulk_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Operation details
    operation_type TEXT NOT NULL, -- 'bulk_edit', 'bulk_delete', 'bulk_schedule', etc.
    affected_content_ids UUID[],
    operation_parameters JSONB,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'undone'
    progress INTEGER DEFAULT 0, -- 0-100 percentage
    
    -- Results
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    error_messages JSONB,
    
    -- Undo capability
    can_undo BOOLEAN DEFAULT TRUE,
    undo_data JSONB, -- Data needed to undo operation
    undone_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_management_account_id ON content_management(account_id);
CREATE INDEX IF NOT EXISTS idx_content_management_user_id ON content_management(user_id);
CREATE INDEX IF NOT EXISTS idx_content_management_status ON content_management(status);
CREATE INDEX IF NOT EXISTS idx_content_management_scheduled_time ON content_management(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_content_management_created_at ON content_management(created_at);

CREATE INDEX IF NOT EXISTS idx_content_approval_content_id ON content_approval_workflows(content_id);
CREATE INDEX IF NOT EXISTS idx_content_approval_approver_id ON content_approval_workflows(approver_id);
CREATE INDEX IF NOT EXISTS idx_content_approval_status ON content_approval_workflows(approval_status);

CREATE INDEX IF NOT EXISTS idx_ai_content_ideas_account_id ON ai_content_ideas(account_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_ideas_user_id ON ai_content_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_ideas_used ON ai_content_ideas(used);
CREATE INDEX IF NOT EXISTS idx_ai_content_ideas_category ON ai_content_ideas(idea_category);

CREATE INDEX IF NOT EXISTS idx_bulk_operations_user_id ON bulk_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_status ON bulk_operations(status);

-- Enable Row Level Security
ALTER TABLE content_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_management
CREATE POLICY "Users can view content from their accounts"
    ON content_management FOR SELECT
    USING (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ) OR user_id = auth.uid());

CREATE POLICY "Users can insert their own content"
    ON content_management FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own content"
    ON content_management FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own content"
    ON content_management FOR DELETE
    USING (user_id = auth.uid());

-- Create RLS policies for content_approval_workflows
CREATE POLICY "Users can view approvals for their content"
    ON content_approval_workflows FOR SELECT
    USING (content_id IN (
        SELECT id FROM content_management WHERE user_id = auth.uid()
    ) OR approver_id = auth.uid());

CREATE POLICY "Approvers can insert approval responses"
    ON content_approval_workflows FOR INSERT
    WITH CHECK (approver_id = auth.uid());

CREATE POLICY "Approvers can update their approvals"
    ON content_approval_workflows FOR UPDATE
    USING (approver_id = auth.uid());

-- Create RLS policies for ai_content_ideas
CREATE POLICY "Users can view their AI content ideas"
    ON ai_content_ideas FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their AI content ideas"
    ON ai_content_ideas FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their AI content ideas"
    ON ai_content_ideas FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their AI content ideas"
    ON ai_content_ideas FOR DELETE
    USING (user_id = auth.uid());

-- Create RLS policies for bulk_operations
CREATE POLICY "Users can view their bulk operations"
    ON bulk_operations FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their bulk operations"
    ON bulk_operations FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their bulk operations"
    ON bulk_operations FOR UPDATE
    USING (user_id = auth.uid());;