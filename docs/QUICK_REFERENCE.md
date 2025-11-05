# Instagram Graph API Integration - Quick Reference

## Status: Phase 1 - 90% Complete ✅

### What's Done
- ✅ Database schema (4 tables)
- ✅ 5 Edge functions (OAuth + data fetching)
- ✅ Caching & rate limiting
- ✅ Complete documentation

### What's Needed
- ⏳ Facebook App credentials (App ID & Secret)
- ⏳ Deploy migration & edge functions
- ⏳ Frontend integration
- ⏳ Testing

---

## Quick Start (For You)

### 1. Create Facebook App
**URL**: https://developers.facebook.com/
1. Create App → Business type
2. Add Instagram Graph API product
3. Get App ID and App Secret from Settings → Basic
4. Configure OAuth redirect: `https://vlmksbumj556.space.minimax.io/oauth/callback`

### 2. Provide Credentials
```
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
```

### 3. Verify Instagram Account
- Must be Business or Creator account (NOT personal)
- Must be connected to Facebook Page
- Recommend 100+ followers for full insights

---

## Files Created

### Database
```
/workspace/supabase/migrations/instagram_graph_api_core_schema.sql
```
Creates: instagram_graph_tokens, instagram_business_accounts, api_rate_limits, instagram_data_cache

### Edge Functions
```
/workspace/supabase/functions/
├── instagram-oauth-callback/index.ts          (244 lines)
├── instagram-fetch-profile-graph/index.ts     (269 lines)
├── instagram-fetch-media-graph/index.ts       (229 lines)
├── instagram-fetch-insights-graph/index.ts    (260 lines)
└── instagram-token-refresh/index.ts           (159 lines)
```

### Documentation
```
/workspace/docs/
├── instagram_graph_api_setup_guide.md         (381 lines - FULL GUIDE)
├── instagram_graph_api_implementation_plan.md (166 lines)
└── PHASE1_COMPLETION_SUMMARY.md               (417 lines - THIS SUMMARY)
```

---

## Edge Functions Overview

| Function | Purpose | Cache | Rate Limit |
|----------|---------|-------|------------|
| `instagram-oauth-callback` | OAuth flow, store tokens | N/A | N/A |
| `instagram-fetch-profile-graph` | Profile data | 24h | Tracked |
| `instagram-fetch-media-graph` | Posts + insights | 1h | Tracked |
| `instagram-fetch-insights-graph` | Account analytics | 1h | Tracked |
| `instagram-token-refresh` | Refresh access tokens | N/A | N/A |

---

## Usage Examples

### Connect Instagram (Frontend)
```typescript
const facebookAppId = 'YOUR_APP_ID';
const redirectUri = `${window.location.origin}/oauth/callback`;
const scope = 'instagram_basic,instagram_manage_insights,pages_show_list';

window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?` +
  `client_id=${facebookAppId}&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `scope=${scope}&response_type=code`;
```

### Fetch Profile Data
```typescript
const { data } = await supabase.functions.invoke('instagram-fetch-profile-graph', {
  body: { instagramAccountId: 'YOUR_IG_BUSINESS_ID' }
});
```

### Fetch Media Insights
```typescript
const { data } = await supabase.functions.invoke('instagram-fetch-media-graph', {
  body: { instagramAccountId: 'YOUR_IG_BUSINESS_ID', limit: 25 }
});
```

### Fetch Account Insights
```typescript
const { data } = await supabase.functions.invoke('instagram-fetch-insights-graph', {
  body: { instagramAccountId: 'YOUR_IG_BUSINESS_ID', period: 'day' }
});
```

---

## Key Metrics

### Rate Limits
- **Instagram Graph API**: 200 requests/hour per user
- **Auto-enforced**: Edge functions check before API call
- **429 Error**: Returned when limit exceeded

### Cache Durations
- **Profile**: 24 hours (infrequent changes)
- **Media**: 1 hour (new posts not critical)
- **Insights**: 1 hour (analytics update hourly)

### Token Lifecycle
- **Type**: Long-lived OAuth token
- **Duration**: 60 days
- **Refresh**: Use `instagram-token-refresh` function
- **Auto-refresh**: Recommended via cron job

---

## Requirements Checklist

### Instagram Account ✅
- [ ] Business or Creator account (not personal)
- [ ] Connected to Facebook Page
- [ ] Public (not private)
- [ ] Ideally 100+ followers (for full insights)

### Facebook App ⏳
- [ ] App created at developers.facebook.com
- [ ] Instagram Graph API product added
- [ ] OAuth redirect URI configured
- [ ] App ID and App Secret obtained
- [ ] Test users added (optional for dev)

### Supabase ⏳
- [ ] Environment secrets set (FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
- [ ] Database migration applied
- [ ] 5 edge functions deployed
- [ ] Functions tested

### Frontend ⏳
- [ ] Connect Instagram button implemented
- [ ] OAuth callback handler created
- [ ] Data fetching updated to use Graph API
- [ ] Account management UI added
- [ ] Error handling implemented

---

## Troubleshooting

### "No Instagram Business Account found"
→ Convert to Business/Creator in Instagram app settings

### "Insufficient followers" error
→ Some insights need 100+ followers (audience demographics)
→ Profile and media insights work with any count

### Token expired
→ Use `instagram-token-refresh` function
→ If refresh fails, user must re-authenticate

### Rate limit exceeded (429)
→ Wait for reset (error message shows time)
→ Leverage cache more (set forceRefresh: false)

---

## Next Steps

1. **You**: Create Facebook App, provide credentials (~20 min)
2. **Me**: Deploy migration + edge functions (~30 min)
3. **Me**: Implement frontend integration (~1 hour)
4. **Both**: Test OAuth flow and data fetching (~30 min)
5. **Me**: Deploy to production (~30 min)

**Total**: ~3 hours after you provide credentials

---

## Documentation Links

- **Full Setup Guide**: `/workspace/docs/instagram_graph_api_setup_guide.md`
- **Implementation Plan**: `/workspace/docs/instagram_graph_api_implementation_plan.md`
- **Phase 1 Summary**: `/workspace/docs/PHASE1_COMPLETION_SUMMARY.md`

---

## Contact

**Ready to proceed when you provide Facebook App credentials (App ID & Secret).**

All infrastructure is built and ready for deployment! 🚀
