-- Real-Time Notifications Table
-- Real-time notification queue for WebSocket and push notifications

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

-- Indexes for performance optimization
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

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_user_priority ON real_time_notifications(user_id, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_pending ON real_time_notifications(delivery_status, priority DESC) WHERE delivery_status = 'pending';

-- Updated at trigger
CREATE OR REPLACE TRIGGER update_real_time_notifications_updated_at 
    BEFORE UPDATE ON real_time_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set read_at timestamp when read_status changes to true
CREATE OR REPLACE FUNCTION set_read_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read_status = TRUE AND OLD.read_status = FALSE THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER set_real_time_notifications_read_at 
    BEFORE UPDATE ON real_time_notifications 
    FOR EACH ROW EXECUTE FUNCTION set_read_at_timestamp();

-- Trigger to set delivered_at timestamp when delivery_status changes to delivered
CREATE OR REPLACE FUNCTION set_delivered_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.delivery_status = 'delivered' AND OLD.delivery_status != 'delivered' THEN
        NEW.delivered_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER set_real_time_notifications_delivered_at 
    BEFORE UPDATE ON real_time_notifications 
    FOR EACH ROW EXECUTE FUNCTION set_delivered_at_timestamp();

-- Row Level Security (RLS) policies
ALTER TABLE real_time_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON real_time_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notifications
CREATE POLICY "Users can insert own notifications" ON real_time_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications (mainly for read status)
CREATE POLICY "Users can update own notifications" ON real_time_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON real_time_notifications
    FOR DELETE USING (auth.uid() = user_id);

-- System can insert notifications for any user (for system-generated notifications)
CREATE POLICY "System can insert all notifications" ON real_time_notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('enterprise')
        )
    );

-- Admin policy for notification management
CREATE POLICY "Admin can manage all notifications" ON real_time_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_management 
            WHERE owner_id = auth.uid() 
            AND subscription_tier IN ('enterprise', 'pro')
        )
    );

-- Comments for documentation
COMMENT ON TABLE real_time_notifications IS 'Real-time notification queue for WebSocket and push notifications';
COMMENT ON COLUMN real_time_notifications.user_id IS 'Reference to the user receiving the notification';
COMMENT ON COLUMN real_time_notifications.notification_type IS 'Type of notification being sent';
COMMENT ON COLUMN real_time_notifications.payload IS 'Notification content and metadata';
COMMENT ON COLUMN real_time_notifications.read_status IS 'Whether the notification has been read';
COMMENT ON COLUMN real_time_notifications.priority IS 'Notification priority (1=highest, 5=lowest)';
COMMENT ON COLUMN real_time_notifications.delivery_status IS 'Current delivery status of the notification';
COMMENT ON COLUMN real_time_notifications.channel IS 'Delivery channel for the notification';
COMMENT ON COLUMN real_time_notifications.expires_at IS 'When the notification expires and should be removed';