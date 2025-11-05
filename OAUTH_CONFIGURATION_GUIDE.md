# Instagram Graph API OAuth Configuration Guide

## Deployment Status: SUCCESS

**Production URL**: https://enlyc4da393y.space.minimax.io
**Deployment Date**: 2025-11-04
**Status**: Application deployed, OAuth configuration required

---

## What Has Been Deployed

### Backend Infrastructure (Supabase)
**All edge functions deployed and active:**

1. **instagram-oauth-callback** 
   - URL: https://zkqpimisftlwehwixgev.supabase.co/functions/v1/instagram-oauth-callback
   - Purpose: Handles OAuth redirect, exchanges code for access token
   
2. **instagram-fetch-profile-graph**
   - URL: https://zkqpimisftlwehwixgev.supabase.co/functions/v1/instagram-fetch-profile-graph
   - Purpose: Fetches Instagram Business profile data (24-hour cache)
   
3. **instagram-fetch-media-graph**
   - URL: https://zkqpimisftlwehwixgev.supabase.co/functions/v1/instagram-fetch-media-graph
   - Purpose: Fetches media posts and insights (1-hour cache)
   
4. **instagram-fetch-insights-graph**
   - URL: https://zkqpimisftlwehwixgev.supabase.co/functions/v1/instagram-fetch-insights-graph
   - Purpose: Fetches analytics data (1-hour cache)
   
5. **instagram-token-refresh**
   - URL: https://zkqpimisftlwehwixgev.supabase.co/functions/v1/instagram-token-refresh
   - Purpose: Refreshes Instagram access tokens (60-day cycle)

**Database Schema:**
- `instagram_graph_tokens` - Stores access tokens with expiration tracking
- `instagram_business_accounts` - Stores connected account metadata
- `api_rate_limits` - Tracks API usage and rate limiting
- `instagram_data_cache` - Caches API responses to minimize calls

### Frontend Application
**React application with:**
- OAuth integration via `useInstagramGraphAPI` hook
- `ConnectInstagram` component for initiating OAuth
- `OAuthCallback` page for handling redirects
- `InstagramAccountManager` for account management
- React Router for navigation (/oauth/callback route)
- Facebook App ID configured: **2631315633910412**

---

## CRITICAL: Required Configuration

### Step 1: Configure Facebook App Secret in Supabase

The edge functions require the Facebook App Secret to complete OAuth token exchange. This must be configured in Supabase Dashboard:

**Credentials:**
- Facebook App ID: `2631315633910412` (Already configured in frontend)
- Facebook App Secret: `1f9eb662d8105243438f6a9e0e1c401a` (Needs Supabase configuration)

**Configuration Steps:**

1. Visit Supabase Dashboard: https://supabase.com/dashboard/project/zkqpimisftlwehwixgev
2. Navigate to **Project Settings** → **Edge Functions**
3. Add the following secrets:

   ```
   Name: FACEBOOK_APP_ID
   Value: 2631315633910412
   ```

   ```
   Name: FACEBOOK_APP_SECRET
   Value: 1f9eb662d8105243438f6a9e0e1c401a
   ```

4. Save and verify secrets are active

**Alternative: Using Supabase CLI** (if you have CLI access):
```bash
supabase secrets set FACEBOOK_APP_ID=2631315633910412
supabase secrets set FACEBOOK_APP_SECRET=1f9eb662d8105243438f6a9e0e1c401a
```

### Step 2: Verify Facebook App OAuth Redirect URI

The Facebook App must have the correct OAuth redirect URI configured:

1. Visit Facebook Developer Console: https://developers.facebook.com/apps/2631315633910412
2. Navigate to **Products** → **Facebook Login** → **Settings**
3. Under **Valid OAuth Redirect URIs**, ensure this URL is listed:
   ```
   https://enlyc4da393y.space.minimax.io/oauth/callback
   ```
4. Save changes if modified

### Step 3: Verify Instagram Account Requirements

For testing, the Instagram account must meet these requirements:
- Account type: **Business** or **Creator** (NOT personal)
- Connected to a Facebook Page
- Account status: **Public** (not private)
- Recommended: 100+ followers for full insights access

---

## Testing Guide

### Phase 1: Basic Deployment Verification

1. **Access the application**:
   - Open: https://enlyc4da393y.space.minimax.io
   - Expected: Landing page or login screen loads without errors
   - Check browser console for errors (F12 → Console tab)

2. **User Authentication**:
   - Create a new account (test email/password)
   - Verify successful registration
   - Login with credentials
   - Expected: Redirects to dashboard

3. **Dashboard Access**:
   - Verify all navigation tabs are visible
   - Test switching between tabs
   - Navigate to "Accounts" tab
   - Expected: See account management interface

### Phase 2: OAuth Integration Testing

**Prerequisites**: 
- Facebook App Secret must be configured in Supabase (Step 1 above)
- OAuth redirect URI must be configured in Facebook App (Step 2 above)

1. **Navigate to Instagram Connection**:
   - Login to dashboard
   - Go to "Accounts" tab
   - Locate "Connect Instagram Account" section
   - Expected: See Instagram connection button with requirements

2. **Initiate OAuth Flow**:
   - Click "Connect Instagram Account" button
   - Expected: Redirect to Facebook OAuth page
   - If error: Check browser console and Supabase edge function logs

3. **Facebook OAuth Authorization**:
   - Login to Facebook (if not already logged in)
   - Select Instagram Business account from list
   - Grant permissions:
     - instagram_basic
     - instagram_manage_insights
     - pages_show_list
     - pages_read_engagement
   - Click "Continue" or "Authorize"
   - Expected: Redirect back to application

4. **OAuth Callback Handling**:
   - Expected redirect to: https://enlyc4da393y.space.minimax.io/oauth/callback?code=...
   - The page should show loading indicator
   - Token exchange happens automatically
   - Expected: Redirect to dashboard with success message
   - If error: Check browser console and Supabase logs

5. **Verify Account Connection**:
   - Return to "Accounts" tab
   - Expected: See connected Instagram account listed
   - Verify account details display:
     - Username
     - Profile picture
     - Account type
     - Connection timestamp
     - Token expiration date

6. **Test Account Management**:
   - Test "Refresh Token" button
   - Test "Disconnect Account" button
   - Verify actions complete successfully

### Phase 3: Data Fetching Verification

1. **Fetch Profile Data**:
   - With connected account, trigger profile data fetch
   - Expected: Instagram profile data loads and displays
   - Check for: followers count, media count, biography

2. **Fetch Media Data**:
   - Trigger media fetch for connected account
   - Expected: Recent posts load with images and captions
   - Verify insights data (likes, comments, reach) displays

3. **Fetch Insights Data**:
   - Trigger insights fetch for connected account
   - Expected: Analytics data loads (impressions, reach, engagement)
   - Verify data visualizations render correctly

### Phase 4: Error Handling Testing

1. **Test without Supabase secrets**:
   - If secrets not configured, should show clear error
   - Expected: "Missing Facebook App credentials" or similar

2. **Test with expired token**:
   - Wait for token to approach expiration
   - Test automatic refresh mechanism
   - Expected: Token refreshes automatically or prompts reconnection

3. **Test rate limiting**:
   - Make multiple API calls rapidly
   - Expected: Rate limiting activates, cached data serves requests

4. **Test network errors**:
   - Disconnect internet briefly during operations
   - Expected: User-friendly error messages, retry options

---

## Troubleshooting

### Issue: "Missing Facebook App credentials" error

**Cause**: Facebook App Secret not configured in Supabase
**Solution**: Follow Step 1 above to configure secrets

### Issue: OAuth redirect fails or shows "Redirect URI mismatch"

**Cause**: Redirect URI not configured in Facebook App
**Solution**: Follow Step 2 above to configure redirect URI

### Issue: "Account not found" or database errors

**Cause**: Database schema not applied
**Solution**: Verify database migration was applied successfully

### Issue: Token exchange fails with 400/401 errors

**Cause**: Invalid App ID/Secret or expired authorization code
**Solution**: 
1. Verify App ID matches in frontend and Supabase
2. Verify App Secret is correct in Supabase
3. Re-initiate OAuth flow (authorization codes expire quickly)

### Issue: API calls return empty data or errors

**Cause**: Instagram account not meeting requirements
**Solution**: 
1. Verify account is Business/Creator type
2. Ensure account is public, not private
3. Check account is connected to Facebook Page

---

## Success Criteria

The OAuth integration is working correctly when:

- User can click "Connect Instagram" and be redirected to Facebook
- User can authorize and be redirected back to application
- Access token is successfully stored in database
- Connected account appears in account manager with correct details
- Profile data fetches successfully from Instagram Graph API
- Media data fetches with insights
- Analytics data loads and displays correctly
- Token refresh mechanism works automatically
- Rate limiting and caching work as expected
- Error messages are user-friendly and actionable

---

## Next Steps After Configuration

Once Supabase secrets are configured and OAuth is working:

1. **Production Testing**: Complete full OAuth flow with real Instagram Business account
2. **Data Validation**: Verify all fetched data displays correctly in dashboard
3. **Performance Testing**: Monitor API rate limits and caching effectiveness
4. **User Documentation**: Create end-user guide for connecting accounts
5. **Monitoring Setup**: Configure alerts for token expirations and API errors

---

## Technical Details

### OAuth Flow Sequence

1. User clicks "Connect Instagram" → Frontend generates OAuth URL
2. Redirect to Facebook with App ID, scopes, and redirect URI
3. User authorizes → Facebook redirects to `/oauth/callback?code=...`
4. Frontend sends code to `instagram-oauth-callback` edge function
5. Edge function exchanges code for access token using App Secret
6. Edge function stores token and account metadata in database
7. Frontend receives success response and updates UI
8. User can now fetch Instagram data via Graph API

### API Rate Limits

Instagram Graph API limits:
- 200 requests per hour per user
- Platform implements caching to minimize calls:
  - Profile data: 24-hour cache
  - Media data: 1-hour cache
  - Insights data: 1-hour cache

### Token Management

- Access tokens valid for 60 days
- Automatic refresh before expiration
- `instagram-token-refresh` edge function handles renewal
- Users notified if manual reconnection needed

---

## Support Resources

- Facebook Developer Docs: https://developers.facebook.com/docs/instagram-basic-display-api
- Instagram Graph API Reference: https://developers.facebook.com/docs/instagram-api
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- React OAuth Best Practices: https://react.dev/learn/sharing-data-between-components

---

**Last Updated**: 2025-11-04
**Application Version**: 1.0.0
**Supabase Project**: zkqpimisftlwehwixgev
