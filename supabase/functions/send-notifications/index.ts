Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Extract parameters from request body
        const requestData = await req.json();
        const { 
            recipients, 
            notificationType, 
            title, 
            message, 
            priority = 'medium',
            actionUrl,
            actionData = {},
            teamId,
            expiresAt 
        } = requestData;

        if (!recipients || !notificationType || !title || !message) {
            throw new Error('Recipients, notification type, title, and message are required');
        }

        // Validate notification type
        const validTypes = [
            'team_invite', 'team_join', 'team_leave', 'permission_granted', 'permission_revoked',
            'export_ready', 'export_failed', 'report_generated', 'account_connected',
            'account_sync_failed', 'dashboard_shared', 'mention', 'comment', 'approval_request',
            'approval_granted', 'approval_denied', 'system_maintenance', 'feature_update'
        ];

        if (!validTypes.includes(notificationType)) {
            throw new Error(`Invalid notification type. Supported: ${validTypes.join(', ')}`);
        }

        // Validate priority
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
            throw new Error(`Invalid priority. Supported: ${validPriorities.join(', ')}`);
        }

        // Get Supabase credentials
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const senderId = userData.id;

        // Validate recipients format (can be array of user IDs or 'team')
        let recipientList = [];
        
        if (recipients === 'team' && teamId) {
            // Get all team members
            const teamMembersResponse = await fetch(
                `${supabaseUrl}/rest/v1/team_members?team_id=eq.${teamId}&status=eq.active&select=user_id`, 
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!teamMembersResponse.ok) {
                throw new Error('Failed to fetch team members');
            }

            const teamMembers = await teamMembersResponse.json();
            recipientList = teamMembers.map((member: any) => member.user_id);
        } else if (Array.isArray(recipients)) {
            recipientList = recipients;
        } else {
            throw new Error('Recipients must be an array of user IDs or "team" with teamId');
        }

        if (recipientList.length === 0) {
            throw new Error('No recipients found');
        }

        // Remove sender from recipients to avoid self-notification
        recipientList = recipientList.filter((userId: string) => userId !== senderId);

        // Prepare notifications data
        const notifications = recipientList.map((userId: string) => ({
            user_id: userId,
            team_id: teamId || null,
            notification_type: notificationType,
            title: title,
            message: message,
            priority: priority,
            status: 'unread',
            action_url: actionUrl || null,
            action_data: actionData,
            expires_at: expiresAt || null,
            sender_id: senderId,
            created_at: new Date().toISOString()
        }));

        // Batch insert notifications
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(notifications)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Failed to create notifications: ${errorText}`);
        }

        const createdNotifications = await insertResponse.json();

        // Generate notification statistics
        const stats = {
            total_sent: createdNotifications.length,
            notification_type: notificationType,
            priority: priority,
            team_notification: !!teamId,
            sender_id: senderId,
            created_at: new Date().toISOString()
        };

        // For high priority notifications, implement real-time push
        if (priority === 'high' || priority === 'urgent') {
            await sendRealTimePush(recipientList, {
                title,
                message,
                priority,
                notificationType,
                actionUrl
            }, supabaseUrl, serviceRoleKey);
        }

        // Return success response
        const result = {
            success: true,
            notifications_sent: createdNotifications.length,
            recipients: recipientList,
            notification_type: notificationType,
            priority: priority,
            statistics: stats,
            notification_ids: createdNotifications.map((n: any) => n.id)
        };

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Notification sending error:', error);

        const errorResponse = {
            error: {
                code: 'NOTIFICATION_SEND_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function for real-time push notifications
async function sendRealTimePush(
    recipientIds: string[], 
    notification: any, 
    supabaseUrl: string, 
    serviceRoleKey: string
): Promise<void> {
    try {
        // For each recipient, send real-time notification via Supabase Realtime
        for (const userId of recipientIds) {
            const realtimePayload = {
                type: 'broadcast',
                event: 'notification',
                payload: {
                    user_id: userId,
                    title: notification.title,
                    message: notification.message,
                    priority: notification.priority,
                    notification_type: notification.notificationType,
                    action_url: notification.actionUrl,
                    timestamp: new Date().toISOString()
                }
            };

            // Send via Supabase Realtime (using REST API to trigger broadcast)
            await fetch(`${supabaseUrl}/rest/v1/rpc/notify_user_realtime`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    notification_data: realtimePayload
                })
            });
        }

        console.log(`Real-time push sent to ${recipientIds.length} recipients`);
    } catch (error) {
        console.error('Real-time push failed:', error);
        // Don't throw error here - notifications were still created successfully
    }
}

// Helper function to validate and sanitize notification content
function sanitizeNotificationContent(content: string): string {
    // Remove HTML tags and limit length
    const cleaned = content.replace(/<[^>]*>/g, '').trim();
    return cleaned.length > 500 ? cleaned.substring(0, 497) + '...' : cleaned;
}

// Helper function to determine notification urgency scoring
function calculateNotificationScore(type: string, priority: string): number {
    const typeScores: { [key: string]: number } = {
        'system_maintenance': 100,
        'approval_request': 90,
        'team_invite': 80,
        'permission_granted': 70,
        'export_ready': 60,
        'account_sync_failed': 85,
        'mention': 75,
        'comment': 50,
        'feature_update': 30
    };

    const priorityMultipliers: { [key: string]: number } = {
        'urgent': 2.0,
        'high': 1.5,
        'medium': 1.0,
        'low': 0.5
    };

    const baseScore = typeScores[type] || 50;
    const multiplier = priorityMultipliers[priority] || 1.0;
    
    return Math.round(baseScore * multiplier);
}