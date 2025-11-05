# Instagram Graph API Integration - Setup Guide

## Overview
This guide explains how to integrate Instagram Graph API with OAuth 2.0 authentication into GrowthHub Analytics Platform.

## Prerequisites
1. Instagram Business or Creator account (NOT personal account)
2. Facebook Page connected to your Instagram account
3. Meta Developer Account
4. Supabase project with admin access

## Part 1: Meta Developer Setup (Required Before Deployment)

### Step 1: Create Facebook App
1. Go to [Meta Developers Console](https://developers.facebook.com/)
2. Click "Create App"
3. Select "Business" as app type
4. Fill in app details:
   - App Name: "GrowthHub Instagram Analytics" (or your choice)
   - Contact Email: Your email
5. Click "Create App"

### Step 2: Add Instagram Graph API Product
1. In your app dashboard, click "Add Product"
2. Find "Instagram Graph API" and click "Set Up"
3. Complete the setup wizard

### Step 3: Configure OAuth Settings
1. Go to app Settings → Basic
2. Copy your **App ID** and **App Secret** (you'll need these later)
3. Go to Settings → Advanced → Security
4. Add to **Valid OAuth Redirect URIs**:
   ```
   https://your-domain.com/oauth/callback
   https://localhost:3000/oauth/callback
   ```
5. Save changes

### Step 4: Request Permissions (App Review)
For production use, you need to request these permissions through App Review:
- `instagram_basic` - Read profile data
- `instagram_manage_insights` - Read insights and analytics
- `pages_show_list` - Access Facebook Pages
- `pages_read_engagement` - Read engagement data

**Note**: For development/testing, you can use these permissions without review on test accounts.

### Step 5: Connect Instagram Business Account
1. Go to Instagram Settings → Add Test Users
2. Add your Instagram Business account as a test user
3. Verify the Instagram account is:
   - A Business or Creator account (not personal)
   - Connected to a Facebook Page

## Part 2: Supabase Configuration

### Step 1: Set Environment Variables
Add these to your Supabase Edge Function secrets:

```bash
# Facebook App Credentials (from Meta Developer Console)
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Supabase credentials (already configured)
SUPABASE_URL=https://zkqpimisftlwehwixgev.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**How to add secrets to Supabase:**
```bash
# Using Supabase CLI
supabase secrets set FACEBOOK_APP_ID=your_app_id
supabase secrets set FACEBOOK_APP_SECRET=your_app_secret

# Or via Supabase Dashboard:
# Project Settings → Edge Functions → Secrets
```

### Step 2: Apply Database Migration
Run the migration file to create required tables:

```sql
-- File: /workspace/supabase/migrations/instagram_graph_api_core_schema.sql
-- Apply via Supabase Dashboard: Database → SQL Editor
-- Or via CLI: supabase db push
```

Creates 4 tables:
- `instagram_graph_tokens` - OAuth access tokens
- `instagram_business_accounts` - Account metadata
- `api_rate_limits` - Rate limiting tracker
- `instagram_data_cache` - API response cache

### Step 3: Deploy Edge Functions
Deploy all 5 edge functions:

```bash
# 1. OAuth callback handler
supabase functions deploy instagram-oauth-callback

# 2. Profile data fetcher
supabase functions deploy instagram-fetch-profile-graph

# 3. Media insights fetcher
supabase functions deploy instagram-fetch-media-graph

# 4. Account insights fetcher
supabase functions deploy instagram-fetch-insights-graph

# 5. Token refresh handler
supabase functions deploy instagram-token-refresh
```

**Edge Functions Created:**
1. **instagram-oauth-callback** - Handles OAuth flow and stores access tokens
2. **instagram-fetch-profile-graph** - Fetches profile data (cached 24h)
3. **instagram-fetch-media-graph** - Fetches posts with insights (cached 1h)
4. **instagram-fetch-insights-graph** - Fetches account analytics (cached 1h)
5. **instagram-token-refresh** - Refreshes access tokens (60-day cycle)

## Part 3: Frontend Integration

### Step 1: Create OAuth Initiation Component
Add a "Connect Instagram" button to trigger OAuth flow:

```typescript
// components/ConnectInstagram.tsx
import { supabase } from '@/lib/supabase';

const ConnectInstagram = () => {
  const handleConnect = () => {
    const facebookAppId = 'YOUR_FACEBOOK_APP_ID'; // From environment
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const scope = 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement';
    
    // Redirect to Facebook OAuth
    const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${facebookAppId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scope}&` +
      `response_type=code`;
    
    window.location.href = oauthUrl;
  };

  return (
    <button onClick={handleConnect} className="btn-primary">
      Connect Instagram Business Account
    </button>
  );
};
```

### Step 2: Create OAuth Callback Handler
Handle the OAuth redirect and exchange code for token:

```typescript
// pages/oauth/callback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/dashboard?error=oauth_failed');
        return;
      }

      if (!code) {
        navigate('/dashboard?error=no_code');
        return;
      }

      try {
        // Call edge function to exchange code for token
        const { data, error: functionError } = await supabase.functions.invoke(
          'instagram-oauth-callback',
          {
            body: {
              code,
              redirectUri: `${window.location.origin}/oauth/callback`
            }
          }
        );

        if (functionError) {
          throw functionError;
        }

        console.log('Instagram account connected:', data.account);
        navigate('/dashboard?success=instagram_connected');
      } catch (err) {
        console.error('Failed to connect Instagram:', err);
        navigate('/dashboard?error=connection_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return <div>Connecting Instagram account...</div>;
};
```

### Step 3: Fetch Instagram Data
Replace existing API calls with Graph API functions:

```typescript
// hooks/useInstagramData.ts
import { supabase } from '@/lib/supabase';

export const useInstagramData = (instagramAccountId: string) => {
  const fetchProfile = async () => {
    const { data, error } = await supabase.functions.invoke(
      'instagram-fetch-profile-graph',
      {
        body: { instagramAccountId }
      }
    );

    if (error) throw error;
    return data;
  };

  const fetchMedia = async (limit = 25) => {
    const { data, error } = await supabase.functions.invoke(
      'instagram-fetch-media-graph',
      {
        body: { instagramAccountId, limit }
      }
    );

    if (error) throw error;
    return data;
  };

  const fetchInsights = async (period = 'day') => {
    const { data, error } = await supabase.functions.invoke(
      'instagram-fetch-insights-graph',
      {
        body: { instagramAccountId, period }
      }
    );

    if (error) throw error;
    return data;
  };

  return { fetchProfile, fetchMedia, fetchInsights };
};
```

## Part 4: Testing

### Test OAuth Flow
1. Navigate to dashboard
2. Click "Connect Instagram Business Account"
3. Login to Facebook
4. Select your Facebook Page
5. Grant permissions
6. Verify redirect to `/oauth/callback`
7. Check dashboard for connected account

### Test Data Fetching
```typescript
// Test in browser console
const { data: profile } = await supabase.functions.invoke(
  'instagram-fetch-profile-graph',
  { body: { instagramAccountId: 'YOUR_IG_USER_ID' } }
);
console.log(profile);
```

### Verify Database
Check tables in Supabase Dashboard:
- `instagram_graph_tokens` - Should have 1 row with access token
- `instagram_business_accounts` - Should have account data
- `instagram_data_cache` - Should populate after first API call

## Part 5: Rate Limiting & Caching

### Rate Limits
- Instagram Graph API: 200 requests/hour per user
- Automatically tracked in `api_rate_limits` table
- Returns 429 error when limit exceeded

### Cache Strategy
- **Profile data**: 24 hours
- **Media insights**: 1 hour
- **Account insights**: 1 hour
- Use `forceRefresh: true` to bypass cache

### Token Refresh
- Tokens expire after 60 days
- Use `instagram-token-refresh` function
- Consider setting up a cron job to auto-refresh:

```sql
-- Create cron job (pg_cron extension required)
SELECT cron.schedule(
  'refresh-instagram-tokens',
  '0 0 * * *', -- Daily at midnight
  $$ 
  SELECT net.http_post(
    url:='https://your-supabase-url.functions.supabase.co/instagram-token-refresh',
    headers:='{"Content-Type": "application/json"}'::jsonb
  )
  $$
);
```

## Troubleshooting

### "No Instagram Business Account found"
- Verify Instagram account is Business or Creator (not personal)
- Verify Instagram is connected to a Facebook Page
- In Instagram app: Settings → Account → Switch to Professional Account

### "Insufficient followers" error
- Some insights require minimum 100 followers
- Profile data and media insights work with any follower count
- Audience demographics require 100+ followers

### Token expired
- Tokens last 60 days
- Use `instagram-token-refresh` to get new token
- User must re-authenticate if token cannot be refreshed

### Rate limit exceeded
- Wait for rate limit window to reset (shown in error message)
- Reduce API calls by leveraging cache
- Use `cached: true` responses when available

## Security Best Practices

1. **Never expose App Secret** - Keep in Supabase secrets only
2. **Validate OAuth state** - Prevent CSRF attacks
3. **Use HTTPS** - Required for OAuth redirect URIs
4. **Encrypt tokens** - Already handled by Supabase
5. **Implement token rotation** - Use refresh function regularly

## Production Checklist

- [ ] Meta App approved for production use
- [ ] All required permissions granted via App Review
- [ ] Environment variables set in Supabase
- [ ] Database migration applied
- [ ] All 5 edge functions deployed and tested
- [ ] Frontend OAuth flow implemented
- [ ] Error handling added for all edge cases
- [ ] Rate limiting monitored
- [ ] Token refresh automation configured
- [ ] User documentation created

## Next Steps

After completing this setup:
1. Test with a real Instagram Business account
2. Monitor API usage and rate limits
3. Set up token refresh automation
4. Update frontend UI to show connected accounts
5. Replace all RapidAPI calls with Graph API functions
6. Add error handling for edge cases
7. Deploy to production

## Resources

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api/)
- [Meta Developer Console](https://developers.facebook.com/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OAuth 2.0 Specification](https://oauth.net/2/)
