# Instagram APIs in 2025: Capabilities, Authentication, Data, Limits, and Recent Changes

## Executive Summary

As of November 2025, the Instagram developer platform centers on the Instagram API with Instagram Login and the Instagram API with Facebook Login for Business, with messaging available through the Messenger API for Instagram. The Instagram Basic Display API has been deprecated and removed, and the legacy Instagram v1.0 endpoints have completed deprecation, forcing migrations to current Instagram Platform endpoints. The platform has consolidated performance measurement around a new “views” metric for media and user insights while removing legacy counts such as impressions and plays according to a defined schedule. Hashtag Search and Business Discovery remain gated capabilities with distinct constraints and rate limiting models. Business Login for Instagram modernized authentication and simplified onboarding for professional accounts.

The primary changes affecting integrations in 2024–2025 include: the deprecation and removal of the Basic Display API (December 2024), scope value changes for Instagram Login (January 27, 2025), v1.0 endpoint deprecations (moved to May 20, 2025), metric consolidation with the introduction of “views” and removal of impressions/plays, and updates to oEmbed and sender actions for messaging. These changes require prompt migration and code updates to scope values, insights queries, and token handling, alongside redesigning analytics logic to align with new metric semantics. Teams should also adjust rate-limit strategies to accommodate Business Use Case (BUC) limits for Instagram Platform endpoints and distinct platform rate limits for certain discovery endpoints.

Actionably, engineering leaders and product teams must prioritize migration to the Instagram API with Instagram Login where feasible; implement the updated OAuth authorization and token exchange and refresh flows; revise analytics to use “views” and current interaction metrics; align endpoint usage with rate-limit policies; and prepare for App Review and feature gating (e.g., Hashtag Search, Business Discovery). The consequences of inaction include broken integrations, failed requests, and loss of analytics continuity due to metric deprecations and rate-limit throttling.[^1][^2][^3][^4][^5][^6][^7][^9][^10][^11][^12][^13][^16][^17][^18][^22]

## API Landscape in 2025

Instagram’s current developer surface comprises two primary API families designed for professional accounts (Business or Creator), and a messaging API:

- Instagram API with Instagram Login (hosted on graph.instagram.com) enables management of an Instagram professional account without requiring a linked Facebook Page. It supports content publishing, comment moderation, messaging, mentions, and insights for media and users.[^5][^6]
- Instagram API with Facebook Login for Business (hosted on graph.facebook.com) provides discovery features—Hashtag Search and Business Discovery—alongside content and insights for linked professional accounts.[^22][^15]
- Messenger API for Instagram enables messaging capabilities for professional accounts, typically used by partners managing multi-channel customer interactions.[^7]

The Instagram Basic Display API is deprecated and removed; legacy v1.0 endpoints are deprecated and removed according to the v22.0 schedule.[^1][^2]

Hashtag Search and Business Discovery are constrained by specific quotas and are subject to platform rate limits; these are not universally available and typically require App Review approvals.[^22][^1]

To illustrate the distinctions across APIs, the following table summarizes host domains, login flows, feature sets, account linkage requirements, and rate-limit applicability.

### Table 1. Comparison of Instagram API families

| API | Host | Login Flow | Key Features | Account Linkage Requirement | Rate-Limit Model |
|---|---|---|---|---|---|
| Instagram API with Instagram Login | graph.instagram.com | Business Login for Instagram | Content publishing, comment moderation, messaging, mentions, media and user insights | Does not require a Facebook Page | BUC rate limits (Instagram Platform) |
| Instagram API with Facebook Login for Business | graph.facebook.com | Facebook Login for Business | Content, comments, mentions, insights; Hashtag Search; Business Discovery | Requires Instagram professional account linked to a Facebook Page | Platform rate limits for discovery (Hashtag Search, Business Discovery); other endpoints vary |
| Messenger API for Instagram | graph.facebook.com | Facebook Login for Business | Messaging via Conversations/Send/Private Reply APIs | Requires Instagram professional account linked to a Facebook Page | Messaging-specific per-account/per-API quotas |
| Instagram Basic Display API | N/A (deprecated) | N/A | Consumer-oriented read of basic profile/media | N/A | Deprecated/removed |
| Legacy Instagram v1.0 endpoints | graph.facebook.com | Legacy | Older user/media/comment endpoints | Often page-linked | Deprecated/removed |

The architectural simplification introduced by Instagram Login reduces onboarding friction for professional accounts and consolidates the developer surface around Instagram Platform endpoints rather than legacy v1.0 APIs.[^5][^6][^1][^22]

### Instagram API with Instagram Login

The Instagram API with Instagram Login allows professional accounts to publish media, moderate comments, send and receive messages, identify @mentions, and retrieve media and user insights without linking a Facebook Page. It is the default choice for pure Instagram workflows and analytics-centric integrations that do not require discovery of non-owned accounts. Business Login for Instagram governs authentication and token lifecycle for this path.[^5][^6]

### Instagram API with Facebook Login for Business

The Facebook Login for Business path retains the requirement that the Instagram professional account be linked to a Facebook Page. In exchange, it unlocks discovery endpoints—Hashtag Search and Business Discovery—for campaigns and market intelligence use cases that require observing public content associated with hashtags or gathering metadata and basic metrics about other businesses and creators.[^22][^15]

### Instagram Messaging API (via Messenger API for Instagram)

The Messenger API for Instagram provides per-account messaging capabilities, including conversations, send, and private reply operations. It is suited to partner stacks managing messages across Instagram and Facebook Page inboxes within a unified platform. Messaging endpoints have specific rate limits and throttling behavior.[^7][^1]

### Basic Display API (Deprecated) and Legacy v1.0 Endpoints

Meta deprecated the Basic Display API in December 2024; all requests now return errors. Legacy v1.0 endpoints were deprecated in v22.0 with a final applied date of May 20, 2025, and apps must migrate to current Instagram Platform endpoints to avoid failures.[^1][^2]

## Authentication and OAuth Flows

Two login paths cover the Instagram Platform:

- Business Login for Instagram, a custom login flow that issues Instagram user access tokens for graph.instagram.com, with standardized authorization parameters, token exchange, and refresh semantics.[^6]
- Facebook Login for Business, which issues Facebook user access tokens for graph.facebook.com and supports discovery features alongside standard Instagram content/insights for linked accounts.[^15]

Meta’s deprecation of legacy scope values concluded on January 27, 2025, and apps must use the new scope values to avoid disruption.[^1][^6][^5]

To help teams implement correctly, the following table maps login flows to endpoints, token types, and lifecycles.

### Table 2. OAuth flow and endpoints mapping

| Login Path | Authorization Endpoint | Token Exchange | Long-Lived Token Exchange | Long-Lived Refresh | Token Type | Host | Notes |
|---|---|---|---|---|---|---|---|
| Business Login for Instagram | /oauth/authorize | /oauth/access_token (API v1) | /access_token (Graph) with grant_type=ig_exchange_token | /refresh_access_token (Graph) with grant_type=ig_refresh_token | Instagram user access token | graph.instagram.com | Authorization code validity ~1 hour; long-lived tokens ~60 days; refresh requires token ≥24 hours old and appropriate permissions |
| Facebook Login for Business | Facebook OAuth authorize | Facebook token exchange | N/A (standard Facebook mechanisms) | N/A (standard Facebook mechanisms) | Facebook user access token | graph.facebook.com | Required for page-linked workflows and discovery features |

Authorization parameters are consistent across flows: client_id, redirect_uri, response_type=code, scope, and state. Business Login adds force_reauth to handle broken login experiences; however, enable_fb_login and force_authentication parameters were deprecated in June 2025.[^6][^1]

Scopes have been modernized; teams must update their code to the new values before January 27, 2025.

### Table 3. Scope values mapping

| Old Scope (Deprecated) | New Scope (Current) | Capability Area |
|---|---|---|
| business_basic | instagram_business_basic | Basic data access for professional accounts |
| business_content_publish | instagram_business_content_publish | Content publishing to Instagram |
| business_manage_comments | instagram_business_manage_comments | Comment moderation |
| business_manage_messages | instagram_business_manage_messages | Messaging operations |

Failure to adopt the new scopes results in authorization failures and inability to call Instagram endpoints.[^1][^6][^5]

### Business Login for Instagram (graph.instagram.com)

Business Login requires the authorization window, followed by short-lived token exchange and optional conversion to long-lived tokens. Key points:

- Authorization code lifetime is short; exchange promptly.
- Long-lived tokens last approximately 60 days; refresh is supported when the token is at least 24 hours old and permissions are granted.
- A force_reauth parameter is available to remediate broken login flows; the enable_fb_login and force_authentication parameters have been deprecated and should be removed.[^6][^1]

This path reduces onboarding friction, removing the need for a Facebook Page link and aligning token lifecycles to Instagram-only contexts.[^6]

### Facebook Login for Business (graph.facebook.com)

Facebook Login for Business remains appropriate when discovery features or page-linked workflows are required. Token handling follows standard Facebook user access token patterns and App Review must include relevant Instagram permissions for desired features. Rate-limit models differ, especially for discovery endpoints, which are subject to platform rate limits.[^15][^16]

## Data Types and Analytics

Instagram Platform exposes insights for professional accounts at both media and user levels. The current metric set emphasizes interaction counts, audience breakdowns, and consolidated “views.” Demographics are constrained by minimum engagement thresholds and retention windows.

Media Insights include interaction, reach, saved, shares, likes, replies, total interactions, and a new “views” metric. Legacy metrics such as impressions and plays have been deprecated on a defined schedule. “Views” is intended to unify video display and play counts across surfaces (Feed, Stories, Reels) and should replace legacy video_views and related metrics in analytics logic.[^3][^4][^1]

User Insights cover accounts_engaged, reach, likes, comments, saved, shares, replies, total_interactions, views, follower and demographic metrics, and follows/unfollows. Demographics (follower_demographics, engaged_audience_demographics) provide breakdowns by age, city, country, and gender, with constraints such as top-45 result limits and empty datasets when insufficient engagement is present. Follower_count and online_followers have minimum thresholds, and user metrics are retained for up to 90 days.[^3][^4]

To clarify available metrics, tables below summarize user and media insights.

### Table 4. User insights metrics

| Metric | Description | Period | Breakdown Compatibility | Metric Type | Notes |
|---|---|---|---|---|---|
| accounts_engaged | Unique accounts interacting with content (likes, saves, comments, shares, replies) | day | N/A | total_value | Estimated; excludes ads-driven data in aggregations |
| reach | Unique accounts that saw content | day | media_product_type, follow_type | total_value, time_series | Estimated; distinct from impressions |
| likes | Likes on posts, reels, videos | day | media_product_type | total_value | N/A |
| comments | Comments on posts, reels, videos | day | media_product_type | total_value | N/A |
| saved | Saves of posts, reels, videos | day | media_product_type | total_value | N/A |
| shares | Shares across content types | day | media_product_type | total_value | N/A |
| replies | Story replies (including quick reactions) | day | N/A | total_value | N/A |
| total_interactions | Sum of interactions across content | day | media_product_type | total_value | Includes boosted content |
| views | Times content was played/displayed | day | follower_type, media_product_type | total_value | New metric; semantics unify display/play |
| profile_links_taps | Taps on contact/business buttons | day | contact_button_type | total_value | N/A |
| follower_demographics | Demographics of followers | lifetime (timeframe-driven) | age, city, country, gender | total_value | Requires ≥100 followers; timeframe semantics |
| engaged_audience_demographics | Demographics of engaged audience | lifetime (timeframe-driven) | age, city, country, gender | total_value | Requires ≥100 engagements in timeframe |
| follows_and_unfollows | Follows/unfollows in period | day | follow_type | total_value | Requires ≥100 followers |

Demographic timeframes changed in 2024 (legacy timeframes deprecated) and now support “this_week” and “this_month” semantics; “online_followers” is constrained to the last 30 days. Data may be delayed up to 48 hours and empty datasets may be returned instead of zero values.[^3]

### Table 5. Media insights metrics

| Metric | Description | Period | Metric Type | Deprecation Status | Replacement |
|---|---|---|---|---|---|
| engagement | Likes + comments on media | lifetime | N/A | Active | N/A |
| reach | Unique accounts that saw media | lifetime | N/A | Active | N/A |
| impressions | Total times media was seen | lifetime | N/A | Deprecated (v22.0+; all versions by Apr 21, 2025; creation date constraints) | views |
| plays | Replay/start counts (Reels) | N/A | N/A | Deprecated (all versions by Apr 21, 2025) | views |
| clips_replays_count | Replays ≥1ms in same session | N/A | N/A | Deprecated (all versions by Apr 21, 2025) | views |
| ig_reels_aggregated_all_plays_count | Play/replay counts across apps | N/A | N/A | Deprecated (all versions by Apr 21, 2025) | views |
| video_views | Video view count | N/A | N/A | Deprecated (Jan 8, 2025) | views |
| views | Total times media was seen/played | day | total_value | Introduced Jan 2025 | N/A |

The deprecation timeline necessitates version-aware query logic, especially for impressions, where media creation dates and API version impact availability.[^4][^1][^2]

### Discovery Data: Hashtag Search and Business Discovery

Hashtag Search allows apps to find public photos and videos tagged with specific hashtags and to retrieve top or recent media for a hashtag, subject to strict query limits and content constraints. Business Discovery provides metadata and basic metrics about other businesses and creators, also gated by App Review.

### Table 6. Hashtag Search limitations and constraints

| Constraint | Description |
|---|---|
| Unique hashtag query cap | Maximum of 30 unique hashtags per rolling 7-day period per account |
| Content types | Photos and videos only; Stories not supported |
| Emoji queries | Not supported |
| Interaction on discovered media | Cannot comment on hashtagged media discovered via API |
| Sensitive/offensive hashtags | Requests return generic errors |
| Approval requirements | Instagram Public Content Access feature and instagram_basic permission via App Review |

Subsequent queries on the same hashtag within the 7-day window do not count against the cap. Discovery endpoints are subject to platform rate limits rather than BUC.[^22][^16]

## Rate Limits and Usage Restrictions

Instagram Platform rate limiting is governed by two core models: Business Use Case (BUC) rate limits for Instagram Platform endpoints (excluding messaging), and platform rate limits for certain discovery endpoints—Business Discovery and Hashtag Search. Messaging endpoints have per-account quotas with granular ceilings for conversations, private replies, and send operations.

### BUC rate limits for Instagram Platform

- BUC rate limits apply per app–user pair over a rolling 24-hour window.
- The formula is Calls within 24 hours = 4800 × Number of Impressions, where impressions reflect content from the app user’s Instagram professional account entering screens in the last 24 hours.
- Messaging endpoints are excluded from BUC and use separate quotas.[^16]

### Platform rate limits

- Discovery endpoints (Hashtag Search, Business Discovery) are subject to platform rate limits.
- Platform rate limits may apply per application or per user token, depending on the token type used.[^16]

### Messaging quotas

Messaging quotas vary by operation and Instagram professional account, enforcing per-second or per-hour ceilings to protect reliability and privacy.

### Table 7. Messaging rate limits summary

| Operation | Quota | Scope |
|---|---|---|
| Conversations API | 2 calls per second | Per Instagram professional account |
| Private Replies (live comments) | 100 calls per second | Per Instagram professional account |
| Private Replies (posts/reels comments) | 750 calls per hour | Per Instagram professional account |
| Send API (text/links/reactions/stickers) | 100 calls per second | Per Instagram professional account |
| Send API (audio/video content) | 10 calls per second | Per Instagram professional account |

These quotas apply in addition to any platform-level throttling; apps should implement backoff, queuing, and idempotent operations to respect the limits.[^16]

### Table 8. Rate limit model comparison

| Model | Scope | Window | Formula | Applies To |
|---|---|---|---|---|
| Platform Rate Limits | App or user token (varies) | Rolling hour | Application: 200 × number of users; user-level counts undisclosed | Graph API general; discovery endpoints |
| BUC Rate Limits (Instagram Platform) | Per app–user pair | Rolling 24 hours | 4800 × impressions (content entering screens in last 24h) | Instagram Platform endpoints (excluding messaging) |
| Messaging Quotas | Per Instagram professional account | Per second/hour | Operation-specific | Messaging endpoints |

Platform headers expose real-time usage statistics after sufficient calls, and dashboards provide aggregate visibility. Apps must anticipate throttling and handle failure gracefully with retries, backoff, and request consolidation.[^16]

## Business Account and App Review Requirements

Access is restricted to Instagram professional accounts (Business or Creator). The Instagram API with Instagram Login does not require a Facebook Page link; the Facebook Login for Business path does require linking. Discovery features, including Hashtag Search and Business Discovery, require App Review and specific permissions, often including instagram_basic and the Instagram Public Content Access feature. Many advanced access scenarios depend on App Review outcomes and access-level tiers.[^15][^22]

The following table maps permissions to features across login paths.

### Table 9. Permissions-to-features mapping

| Feature Area | Required Permissions | Login Path | Notes |
|---|---|---|---|
| Basic account data | instagram_business_basic | Instagram Login | Does not require Facebook Page |
| Content publishing | instagram_business_content_publish | Instagram Login | Publish to Feed |
| Comment moderation | instagram_business_manage_comments | Instagram Login | Manage/reply to comments |
| Messaging | instagram_business_manage_messages | Instagram Login | Send/receive messages |
| Insights (user/media) | instagram_business_manage_insights | Instagram Login | Access user and media insights |
| Hashtag Search | instagram_basic; Public Content Access | Facebook Login for Business | Strict query cap; discovery-only |
| Business Discovery | instagram_basic (and others per feature) | Facebook Login for Business | Basic metadata/metrics on other accounts |

Discovery gating and the distinction between platform and BUC rate limits make planning for access level and feature approval a critical path for any analytics or social listening use case.[^22][^15][^16]

## Recent Changes and Deprecations (2024–2025)

The platform executed multiple migrations and removals that directly affect analytics, onboarding, authentication, and discovery:

- Basic Display API deprecation (December 2024): Requests return errors; migration required to Instagram Platform APIs.[^1]
- Scope value deprecation (January 27, 2025): New scope values required; legacy scopes no longer work.[^1]
- Insights metrics consolidation: “views” metric introduced; impressions and plays removed per schedule; “video_views” removed earlier; user time series metric removals also applied.[^1][^2][^4][^3]
- v1.0 endpoint deprecation: Final applied date moved to May 20, 2025; migrate to current Instagram Platform endpoints.[^1][^2]
- Graph API v22.0 changes: Instagram Platform insights availability; deprecations across Marketing API (instagram_actor_id replaced by instagram_user_id, effective September 9, 2025); updates to creative fields and targeting controls.[^2]
- oEmbed changes (April 8, 2025; deprecation November 3, 2025): Fields removed from oEmbed responses; Meta oEmbed Read feature replaces legacy.[^1]
- Business Login updates (June 14, 2025): force_reauth introduced; enable_fb_login and force_authentication deprecated.[^1]
- Sender actions and webhook updates (September 2025): Typing and mark_seen indicators; message_edit webhook subscription for Instagram.[^1]
- Hashtag Search: Limit of 30 unique hashtags per rolling 7 days remains a critical constraint for discovery workloads.[^22]

The timeline below captures major milestones for planning.

### Table 10. Deprecation and migration timeline

| Date | Change | Affected Area | Required Action | Reference |
|---|---|---|---|---|
| Dec 4, 2024 | Basic Display API deprecated | Basic Display | Migrate to Instagram Platform APIs | [^1] |
| Jan 8, 2025 | video_views and user time series metrics removed | Insights (media/user) | Update queries to supported metrics | [^1][^3] |
| Jan 27, 2025 | Legacy scopes deprecated | Instagram Login | Update code to new scopes | [^1][^6][^5] |
| Apr 21, 2025 | Impressions/plays removed (v22.0+; all versions by this date) | Insights (media/user) | Replace impressions with views; adjust analytics logic | [^1][^2][^4] |
| May 20, 2025 | v1.0 endpoints deprecated (final applied date) | Legacy endpoints | Migrate to Instagram Platform endpoints | [^1][^2] |
| Sep 9, 2025 | instagram_actor_id field deprecated (Marketing API) | Marketing API | Use instagram_user_id in ad creatives | [^2] |
| Jun 14, 2025 | force_reauth introduced; other params deprecated | Business Login | Update login flows accordingly | [^1][^6] |
| Apr 8–Nov 3, 2025 | oEmbed response updates; Meta oEmbed Read transition | Embedding | Remove reliance on removed fields | [^1] |
| Rolling 7 days | Hashtag Search cap: 30 unique hashtags | Discovery | Design queries to respect cap | [^22] |

These changes collectively reshape authentication, metric semantics, endpoint availability, and discovery capabilities. Teams should treat them as migration workstream triggers and update dependency graphs in their analytics pipelines.[^1][^2][^4]

## Implementation Guidance and Migration Checklist

The migration and upgrade path should be systematic and measurable. Priorities include adopting the current login flows, updating scope usage, consolidating insights queries around “views” and supported metrics, and implementing robust rate-limit handling.

- Migrate from Basic Display and legacy v1.0: Move all calls to Instagram Platform endpoints. Replace deprecated endpoints with their current counterparts (IG User, IG Media, IG Media Children, IG Comment, IG Comment Replies). Ensure version-aware behavior for insights metrics based on media creation date and API version.[^2][^1]
- Update scopes: Replace legacy scopes with instagram_business_basic, instagram_business_content_publish, instagram_business_manage_comments, instagram_business_manage_messages.[^1][^5][^6]
- Adopt Business Login for Instagram: Implement the authorization window, token exchange, long-lived token handling (≈60 days), and refresh (requires token ≥24 hours old and appropriate permissions). Remove deprecated parameters (enable_fb_login, force_authentication); use force_reauth judiciously to fix broken flows.[^6][^1]
- Analytics updates: Replace impressions/plays/video_views with “views.” Adjust dashboards, storage schemas, and downstream models to the new semantics. Factor in constraints such as 48-hour delays, empty datasets, minimum follower thresholds for certain metrics, and demographic top-45 limits.[^4][^3][^1]
- Discovery planning: Hashtag Search requires App Review and adherence to the 30 unique hashtags per rolling 7 days limit; Business Discovery requires appropriate permissions. Because discovery endpoints are subject to platform rate limits, design usage patterns and caching strategies accordingly.[^22][^16]
- Rate-limit readiness: Implement caching, batching, and backoff. Monitor platform headers and App Dashboard usage to adjust throughput. Structure messaging integrations to respect per-account quotas and per-operation ceilings.[^16]

To provide operational clarity, the following two tables map endpoint migrations and scope updates.

### Table 11. Endpoint migration map

| Legacy Endpoint | Current Endpoint | Notes |
|---|---|---|
| GET /{instagram-user-id} | IG User endpoints (Instagram Platform) | Migrate to current user resource |
| GET /{instagram-media-id} | IG Media (Instagram Platform) | Align fields with media insights |
| GET /{instagram-media-id}/comments | IG Comment (Instagram Platform) | Moderation via platform endpoints |
| POST /{instagram-media-id}/comments | IG Comment (Instagram Platform) | Use current comment create flows |
| GET /{instagram-comment-id} | IG Comment (Instagram Platform) | Retrieve single comment |
| POST /{instagram-comment-id}/replies | IG Comment Replies (Instagram Platform) | Reply operations |
| DELETE /{instagram-comment-id} | IG Comment (Instagram Platform) | Delete via platform |
| Page-backed IG account reads | IG User/Page-linked flows (Facebook Login) | For page-linked use cases |
| Business Discovery | Business Discovery (Facebook Login) | Requires App Review |

This map is representative; teams should confirm endpoint-level details in the current reference for their specific use cases.[^2][^1]

### Table 12. Scope migration checklist

| Old Scope | New Scope | Used In | Status | Deadline |
|---|---|---|---|---|
| business_basic | instagram_business_basic | Basic data access | Update required | Jan 27, 2025 |
| business_content_publish | instagram_business_content_publish | Publishing | Update required | Jan 27, 2025 |
| business_manage_comments | instagram_business_manage_comments | Comment moderation | Update required | Jan 27, 2025 |
| business_manage_messages | instagram_business_manage_messages | Messaging | Update required | Jan 27, 2025 |

Post-migration, teams should run integration tests for each feature area—publishing, comments, messaging, insights—and instrument dashboards and logs for usage and error reporting to detect residual deprecation impacts.[^1][^6][^5]

## Appendix: Quick Reference

Key endpoints and quotas summarized for rapid lookup.

### Table 13. Key endpoints cheat sheet

| Endpoint | Purpose | Token Type | Host |
|---|---|---|---|
| /oauth/authorize | Start Business Login authorization | N/A | graph.instagram.com |
| /oauth/access_token (API v1) | Exchange code for short-lived token | Instagram user | api.instagram.com |
| /access_token (Graph) | Exchange for long-lived token | Instagram user | graph.instagram.com |
| /refresh_access_token | Refresh long-lived token | Instagram user | graph.instagram.com |
| /{ig-user-id}/insights | Retrieve user insights | Instagram or Facebook user | graph.instagram.com or graph.facebook.com |
| /{ig-media-id}/insights | Retrieve media insights | Instagram or Facebook user | graph.instagram.com or graph.facebook.com |
| /ig_hashtag_search | Find hashtag IDs | Facebook user | graph.facebook.com |
| /{ig-hashtag-id}/top_media | Fetch top media for hashtag | Facebook user | graph.facebook.com |
| /{ig-hashtag-id}/recent_media | Fetch recent media for hashtag | Facebook user | graph.facebook.com |
| /{ig-user-id}/recently_searched_hashtags | List recently searched hashtags | Facebook user | graph.facebook.com |

### Table 14. Messaging quota summary

| Operation | Quota | Notes |
|---|---|---|
| Conversations API | 2 calls/sec/account | Real-time messaging threads |
| Private Replies (live) | 100 calls/sec/account | Replies to live comments |
| Private Replies (posts/reels) | 750 calls/hour/account | Comments on posts/reels |
| Send API (text/links/reactions/stickers) | 100 calls/sec/account | Outbound content |
| Send API (audio/video) | 10 calls/sec/account | Media attachments |

### Table 15. Hashtag Search constraints summary

| Constraint | Value |
|---|---|
| Unique hashtags per rolling 7 days | 30 |
| Content types | Photos and videos only |
| Emoji support | Not supported |
| Interactions on discovered media | Not allowed |
| Sensitive/offensive hashtags | Generic errors returned |

## Acknowledgment of Information Gaps

Two areas require ongoing confirmation during implementation:

- App Review workflows and business verification requirements for discovery features can change over time; teams should validate current criteria directly in the App Dashboard and with Meta’s latest documentation.
- Exact long-lived token lifetimes and refresh windows may be updated; confirm in the Business Login documentation at the time of deployment and test refresh behavior in staging.

These gaps do not alter the core migration imperatives but may affect the timing and sequencing of feature approvals and token lifecycle management.[^6][^15][^22]

## References

[^1]: Changelog - Instagram Platform - Meta for Developers. https://developers.facebook.com/docs/instagram-platform/changelog/
[^2]: v22.0 - Graph API - Meta for Developers. https://developers.facebook.com/docs/graph-api/changelog/version22.0/
[^3]: Insights - Instagram Platform - Meta for Developers. https://developers.facebook.com/docs/instagram-platform/insights/
[^4]: Instagram Media Insights - Meta for Developers. https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights/
[^5]: Instagram API with Instagram Login - Meta for Developers. https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/
[^6]: Business Login for Instagram - Meta for Developers. https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/
[^7]: Messenger API for Instagram - Meta for Developers. https://developers.facebook.com/docs/messenger-platform/instagram
[^9]: Making it easier to build integrations across the Instagram API and Marketing API - Meta for Developers. https://developers.facebook.com/blog/post/2025/01/21/making-it-easier-to-build-integrations-across-the-instagram-api-and-marketing-api/
[^10]: Introducing Instagram API with Instagram login - Meta for Developers. https://developers.facebook.com/blog/post/2024/07/30/instagram-api-with-instagram-login/
[^11]: User and Media Insights on Instagram API with Instagram Login - Meta for Developers. https://developers.facebook.com/blog/post/2025/03/24/user-and-media-insights-on-instagram-api-with-instagram-login/
[^12]: Instagram Insights Metrics Deprecation (April 21, 2025) - Emplifi. https://docs.emplifi.io/platform/latest/home/instagram-insights-metrics-deprecation-april-2025
[^13]: Instagram Marketing API Deprecations, May 2025 - Sprout Social. https://support.sproutsocial.com/hc/en-us/articles/35294582855565-Instagram-Marketing-API-Deprecations-May-2025-March-2025
[^14]: Changes to Instagram metrics - April 17, 2025 - Hootsuite. https://help.hootsuite.com/hc/en-us/articles/27893658620571-Changes-to-Instagram-metrics-April-17-2025
[^15]: Overview - Instagram Platform - Meta for Developers. https://developers.facebook.com/docs/instagram-platform/overview/
[^16]: Rate Limits - Graph API - Meta for Developers. https://developers.facebook.com/docs/graph-api/overview/rate-limiting/
[^17]: Instagram Media and Profile Insights Metrics Deprecation - Emplifi. https://docs.emplifi.io/platform/latest/home/instagram-media-and-profile-insights-metrics-depre
[^18]: Deprecation of Impressions, Plays, and Video Views - Brandwatch. https://social-media-management-help.brandwatch.com/hc/en-us/articles/25600175183773-Deprecation-of-Instagram-Impressions-Plays-and-Video-Views
[^19]: Deprecation of Impressions and Reel Plays Metrics - Sprinklr. https://www.sprinklr.com/help/articles/instagram-reporting-changelog/impressions-and-reel-plays-deprecation-and-introduction-of-views-metric/68072c6acbfca249dfba78e1
[^20]: Instagram is Shutting Down Basic Display API - SmashBalloon. https://smashballoon.com/instagram-is-shutting-down-basic-display-api-continue-displaying-instagram-feeds-on-your-site/
[^21]: Instagram Basic Display API Deprecation - WPZOOM. https://www.wpzoom.com/documentation/instagram-widget/basic-display-api-deprecation/
[^22]: Hashtag Search - Instagram Platform - Meta for Developers. https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/hashtag-search/