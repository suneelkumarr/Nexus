# Instagram Graph API Integration - Implementation Plan

## Overview
Transform GrowthHub from RapidAPI/mock data to official Instagram Graph API integration with OAuth 2.0 authentication.

## Current Status
- **Platform URL**: https://vlmksbumj556.space.minimax.io
- **Current Implementation**: Using RapidAPI for Instagram data
- **Target**: Replace with Instagram Graph API v19.0

## Key Requirements

### 1. Instagram Graph API Constraints
- **Account Type**: Only Business or Creator accounts (NOT personal accounts)
- **Rate Limit**: 200 requests per hour per user
- **Data Retention**: User metrics stored for 90 days
- **Minimum Followers**: Some metrics require 100+ followers
- **Authentication**: OAuth 2.0 via Facebook Login

### 2. Required Permissions
- `instagram_basic` - Profile data, follower count
- `instagram_manage_insights` - Analytics, engagement metrics, reach, impressions
- `pages_show_list` - Access to Facebook Pages (required for business accounts)
- `pages_read_engagement` - Read engagement data

### 3. API Endpoints Required
- `/me` - User profile data
- `/{user-id}/media` - User media (posts)
- `/{media-id}/insights` - Media insights (likes, comments, reach)
- `/{user-id}/insights` - Account insights (follower demographics, growth)

## Implementation Phases

### Phase 1: Database Schema (Core Infrastructure)
Create tables for:
- `instagram_graph_tokens` - OAuth tokens with refresh mechanism
- `instagram_business_accounts` - Business account metadata
- `api_rate_limits` - Track API usage and enforce limits
- `data_cache` - Cache API responses to reduce API calls

### Phase 2: Backend - OAuth & Edge Functions
- **OAuth Flow Edge Function**: Handle Facebook Login → Instagram authorization
- **Token Refresh Edge Function**: Automatic token renewal (60-day expiry)
- **Data Fetching Edge Functions**:
  - `fetch-instagram-profile-graph` - Profile data via Graph API
  - `fetch-instagram-media-graph` - Posts and media insights
  - `fetch-instagram-insights-graph` - Account analytics
  - `fetch-follower-demographics` - Audience demographics

### Phase 3: Frontend Integration
- Add "Connect Instagram Business Account" button
- OAuth flow implementation
- Update all data-fetching components to use Graph API
- Add loading states, error handling, offline fallbacks
- Display account connection status

### Phase 4: Rate Limiting & Caching
- Implement request queue with rate limit tracking
- Cache strategy:
  - Profile data: 24 hours
  - Analytics data: 1 hour
  - Media insights: 1 hour
- Background sync for frequently accessed data

### Phase 5: Testing & Deployment
- Test OAuth flow with real Instagram Business account
- Validate data accuracy
- Test rate limit handling
- Deploy to production

## Technical Architecture

### Database Schema
```sql
-- OAuth tokens storage
CREATE TABLE instagram_graph_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  instagram_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP NOT NULL,
  refresh_token TEXT,
  scope TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business account metadata
CREATE TABLE instagram_business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  instagram_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  followers_count INTEGER,
  follows_count INTEGER,
  media_count INTEGER,
  biography TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT false,
  account_type TEXT, -- 'BUSINESS' or 'CREATOR'
  connected_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP,
  sync_status TEXT DEFAULT 'active'
);

-- API rate limiting tracker
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP NOT NULL,
  window_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Data caching layer
CREATE TABLE instagram_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  instagram_account_id TEXT NOT NULL,
  cache_key TEXT NOT NULL,
  data_type TEXT NOT NULL, -- 'profile', 'media', 'insights', 'demographics'
  data JSONB NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  UNIQUE(cache_key)
);
```

### Edge Functions Structure

1. **instagram-oauth-callback** - Handle OAuth redirect and token exchange
2. **instagram-token-refresh** - Refresh expired access tokens
3. **instagram-fetch-profile** - Get profile data with caching
4. **instagram-fetch-media** - Get posts with insights
5. **instagram-fetch-insights** - Get account analytics
6. **instagram-sync-data** - Background sync for all data

### Rate Limiting Strategy
- 200 requests/hour = ~3.3 requests/minute
- Implement request queue with priority:
  1. Priority 1: User-initiated requests (immediate)
  2. Priority 2: Dashboard data refresh (scheduled)
  3. Priority 3: Background sync (low priority)
- Cache aggressively to minimize API calls

## Implementation Timeline
- Phase 1 (Database): 30 minutes
- Phase 2 (Backend): 2-3 hours
- Phase 3 (Frontend): 1-2 hours
- Phase 4 (Optimization): 1 hour
- Phase 5 (Testing): 1 hour

**Total Estimated Time**: 5-7 hours

## Success Criteria
- Users can connect Instagram Business accounts via OAuth
- Dashboard displays real Instagram data from Graph API
- Rate limiting prevents API quota exhaustion
- Caching reduces redundant API calls
- Graceful error handling for auth failures
- Seamless transition from current RapidAPI implementation
