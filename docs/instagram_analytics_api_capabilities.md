# Instagram Analytics API Capabilities and Gaps: 2025 Developer Blueprint

## Executive Summary

Instagram’s official interfaces for analytics—spanning the Instagram Platform (Graph API), Business Discovery, and Hashtag Search—provide a robust, privacy-aware foundation for first‑party analytics across owned professional accounts. Teams can retrieve core metrics for accounts, media, and stories; capture real‑time events via webhooks; and有限地 observe public business/creator accounts for competitive context. However, the platform deliberately restricts access to granular public data, advanced audience metrics, and any scraping‑based alternatives. As a result, comprehensive analytics platforms must combine official APIs with careful modeling, caching, and governance to deliver reliable, scalable insights. [^1][^2][^3]

What is available today: account‑level insights (impressions, reach, profile views), rich media insights (e.g., comments, likes, saved, shares, reach, views), story metrics via media insights and a real‑time story_insights webhook, follower demographics at lifetime scope with age, city, country, and gender breakdowns, and limited public competitor observation through Business Discovery. Hashtag Search enables topic discovery and sampling of public media tagged with specific hashtags within strict access and usage limits. [^2][^3][^4][^5][^6][^7][^8][^9]

Where constraints bite: access is limited to Instagram professional accounts; follower demographics require at least 100 followers and return only the top 45 performers per breakdown; metrics can be delayed by up to 48 hours and story insights expire after 24 hours; Business Discovery and Hashtag Search are gated by permissions and quotas; and rate limits for most analytics use cases are governed by Business Use Case (BUC) formulas keyed to impressions rather than fixed per‑endpoint quotas. [^2][^3][^5][^6][^9][^10][^11]

So what for platform builders: design ingestion around the official surface areas and their real‑world constraints. Use webhooks to capture ephemeral story insights and to reduce polling. Model engagement rate and other KPIs in a way that acknowledges metric deprecations and delayed availability. For hashtag and competitor analysis, set expectations appropriately: you can discover topics and sample public media, but you cannot reconstruct full competitive performance or audience distributions. Finally, align permissions and access levels early, and plan for ongoing change management as Meta deprecates metrics and evolves definitions (e.g., the shift from certain play/impression metrics to “views”). [^9][^10][^11][^2][^18]

This report details the current capability set, the operational constraints that matter in production, and a pragmatic architecture to deliver comprehensive analytics without overreaching what the platform permits.

---

## Methodology & Source Reliability

This analysis relies primarily on Meta’s official developer documentation for the Instagram Platform, with particular emphasis on the Insights surfaces (accounts, media, stories), webhooks, rate limiting, Business Discovery, and Hashtag Search. Where helpful, we cross‑reference the Instagram Help Center for user‑facing clarifications on insights availability. We explicitly avoid third‑party claims that contradict Meta’s documentation. [^1][^2][^3][^5][^6][^9][^12]

Two points are worth noting. First, several insights metrics have changed or been deprecated recently; Meta publishes changelogs and versioning guidance, and partner documentation has summarized impact for practitioners. Second, some granular operational details (for example, precise rate headers in all response variants or full webhook payload schemas for every event) may require app‑level testing and may evolve. Where relevant, we flag these as information gaps to be validated during implementation. [^11][^2][^18]

---

## Official API Landscape for Instagram Analytics

Instagram analytics access is provided through two primary API configurations, each with distinct login flows, host domains, and permission sets:

- Instagram API with Instagram Login (Business Login for Instagram): intended for professional accounts that may not be linked to a Facebook Page; uses an Instagram User access token and the graph.instagram.com host.  
- Instagram API with Facebook Login for Business: intended for professional accounts linked to a Facebook Page; uses a Facebook User or Page access token and the graph.facebook.com host; unlocks features such as Hashtag Search, certain webhook fields, and insights on public content edges. [^13][^1][^2]

To make these differences concrete, Table 1 compares the two configurations.

Table 1. API configurations compared: access tokens, host URLs, permissions, and typical analytics features

| Dimension | Instagram API with Instagram Login (Business Login for Instagram) | Instagram API with Facebook Login for Business |
|---|---|---|
| Primary host | graph.instagram.com | graph.facebook.com |
| Access token | Instagram User access token | Facebook User or Page access token |
| Account linkage | No Facebook Page required | Facebook Page linkage required |
| Core permissions (examples) | instagram_business_basic, instagram_business_manage_insights | instagram_basic, instagram_manage_insights, pages_read_engagement; additional for roles via Business Manager |
| Analytics surfaces | Account insights (impressions, reach, profile views); media insights (lifetime and periodic metrics); webhook events for owned account activity | All capabilities from the left, plus Hashtag Search and related media; story_insights webhook field; additional public content edges |
| Use cases | First‑party analytics for owned professional accounts | First‑party analytics plus public content discovery (hashtags), and broader webhook coverage |

Permissions and access levels. Meta distinguishes Standard Access (apps serving accounts you own/manage and have added to your app) from Advanced Access (apps serving other users’ professional accounts). The latter typically requires App Review and Business Verification. Hashtag Search additionally requires Instagram Public Content Access. [^2][^13][^8][^9]

Table 2 maps common permissions to features.

Table 2. Permission‑to‑feature mapping for analytics use cases

| Feature area | Core permissions | Notes |
|---|---|---|
| Account insights (owned) | instagram_business_manage_insights (IG Login) or instagram_manage_insights + pages_read_engagement (FB Login) | Standard vs Advanced Access applies |
| Media insights (owned) | Same as above | Media object insights (e.g., reach, comments, saves) |
| Story insights via webhook | instagram_manage_insights (FB Login) + page fields | story_insights delivered only within first 24 hours |
| Business Discovery (public) | instagram_basic (+ role/page context when applicable) | Discovery of public business/creator accounts |
| Hashtag Search | instagram_basic + Instagram Public Content Access | Strict query caps and content restrictions |

Rate limiting overview. Most Instagram analytics endpoints follow Business Use Case (BUC) rate limiting, not fixed per‑endpoint quotas. The BUC formula for Instagram Platform is: Calls over a rolling 24 hours = 4,800 × Number of Impressions (where impressions are the times any content from the app user’s professional account entered a person’s screen in the last 24 hours). Messaging endpoints have their own per‑second caps. Two notable exceptions—Business Discovery and Hashtag Search—are subject to Platform Rate Limits instead of the Instagram BUC formula. Real‑time usage is observable via HTTP headers (X‑App‑Usage for Platform limits; X‑Business‑Use‑Case‑Usage for BUC). [^10][^13]

---

## Analytics Capabilities by Surface

Instagram’s analytics surfaces fall into four categories: account‑level, media‑level, stories, and public discovery (Business Discovery and Hashtag Search). Each serves distinct questions and comes with specific constraints.

Table 3 summarizes the principal metrics by surface and their properties.

Table 3. Metrics by surface: account, media, and story

| Surface | Available metrics (examples) | Period | Retention | Notes |
|---|---|---|---|---|
| Account (IG User) | impressions, reach, profile_views | day, week, month (varies) | User metrics stored up to 90 days | Some metrics unavailable for <100 followers; empty data if unavailable |
| Media (IG Media) | engagement, impressions, reach; comments, likes, saved, shares; views (video); average watch time; story navigation; replies | lifetime (most) | Media metrics stored up to 2 years | Story metrics only available for first 24 hours; some metrics in development or deprecated |
| Story insights (webhook) | story_insights payload fields | Real‑time | N/A (event) | Only available via webhook under Facebook Login; 24‑hour window regardless of highlights |

Sources: Meta Insights documentation, media insights reference, and webhooks documentation. [^2][^3][^5]

### Account‑level Insights (Owned Professional Accounts)

Account insights provide a high‑level view of performance and audience interest. The core metrics are impressions, reach, and profile_views. Periods vary by metric (day, week, month). Two constraints matter operationally: user metrics are stored for up to 90 days, and some metrics are not returned for accounts with fewer than 100 followers. When data does not exist or is unavailable, the API returns an empty data set rather than zero. [^2]

Table 4. Account insights: metric definitions and availability windows

| Metric | Definition | Period | Availability window |
|---|---|---|---|
| impressions | Total times the account’s media have been viewed | day, week, month | Up to 90 days of user metrics |
| reach | Unique viewers of the account’s media | day, week, month | Up to 90 days of user metrics |
| profile_views | Users who viewed the profile | day, week, month | Up to 90 days of user metrics |

These metrics support trend analysis and resource allocation (e.g., inferring when spikes in impressions coincide with increases in profile views), but they do not disaggregate traffic sources or attribute outcomes without additional instrumentation. [^2]

### Follower Analytics & Demographics (Owned Accounts)

The follower_demographics metric exposes lifetime audience composition with breakdowns by age, city, country, and gender. The metric returns top 45 performers per breakdown and uses only viewers for whom demographic data is available. As a result, summing breakdowns may yield a value below the total follower count. Access requires at least 100 followers, and data may be delayed up to 48 hours. Timeframes include a set of lifetime windows; older “last_X_days” and “prev_month” options have been deprecated in newer API versions. [^4][^12]

Table 5. Follower demographics: breakdown options and constraints

| Breakdown | Availability | Threshold & limits | Notes |
|---|---|---|---|
| age | Lifetime | ≥100 followers; top 45 only | Data delayed up to 48 hours |
| city | Lifetime | ≥100 followers; top 45 only | Based on accounts reached |
| country | Lifetime | ≥100 followers; top 45 only | Based on accounts reached |
| gender | Lifetime | ≥100 followers; top 45 only | Based on accounts reached |

Implications: demographic insights are useful for directional segmentation and creative localization, but they are not suitable for precise demographic targeting, forecasting, or matching third‑party audience profiles. [^4][^12]

### Media (Post/Reel) Performance Metrics

Media insights are available for individual media objects (FEED, STORY, REELS). For FEED and REELS, the platform reports comments, likes, saved, shares, reach, and views (video) among others; average watch time and total watch time are available for reels (the latter noted as “in development”). Story media supports navigation (e.g., forward/back exits) and replies, with regional exceptions for replies in Europe and Japan. [^3]

Historically, certain metrics (e.g., impressions and plays) have been deprecated or are being replaced by consolidated “views” constructs. Media metrics are calculated with up to a 48‑hour delay and are retained for up to two years. [^3][^11]

Table 6. Media metrics by product and status

| Product | Key metrics | Status/notes | Retention |
|---|---|---|---|
| FEED | engagement, impressions, reach, comments, likes, saved, shares, views (video), profile activity, profile visits | Some metrics vary by media type; impressions deprecated for newer media in v22.0+ per changelog | Up to 2 years |
| REELS | comments, likes, saved, shares, reach, views (video), avg watch time, total watch time (in development) | plays and related aggregates deprecated per 2025 deprecations; “views” becoming primary | Up to 2 years |
| STORY | reach, replies, shares, navigation (e.g., forward/back), profile visits | Replies exclude Europe (from Dec 1, 2020) and Japan (from Apr 14, 2021) | Ephemeral (24 hours) |

To interpret performance consistently, practitioners often derive engagement‑based KPIs in the application layer. For example, engagement rate can be expressed as engagement divided by reach or by impressions; video completion rate and average watch time provide depth for short‑form content. Definitions should be made explicit in the analytics layer to avoid ambiguity across content types and over time. [^3][^14]

### Story Insights

Stories analytics are available in two parts: via media insights (e.g., replies, shares, navigation) and through a dedicated story_insights webhook field that emits event data in near real‑time. The webhook field is only available under Facebook Login and only for the first 24 hours of a story’s life—even if the story is later added to a highlight. Consequently, reliable story analytics require webhook subscription and rapid downstream processing; relying solely on polling will miss ephemeral data. [^3][^5]

Table 7. Story insights: webhook fields and availability

| Source | Field(s) | Availability window | Notes |
|---|---|---|---|
| Webhooks | story_insights | First 24 hours | Requires Facebook Login; delivered in near real‑time |
| Media insights | replies, shares, navigation, reach | Story lifetime; metrics visible while story exists | Regional exclusions for replies; retention limited by story lifespan |

### Account Growth Tracking

There is no explicit follower_count_time_series metric exposed in the platform. Growth must therefore be approximated by periodic sampling of the account’s follower count and inferring deltas. Given potential calculation delays (up to 48 hours for insights), daily snapshots may show noise, and trends should be smoothed over weekly or monthly windows. Where demographic segmentation of growth is required, it must be reconstructed from the limited follower_demographics lifetime snapshots, acknowledging the top‑45 and ≥100 follower constraints. [^2][^4]

### Content Performance Analysis

Media insights provide the raw inputs for performance analysis at the post/reel level. Teams typically aggregate engagement (likes, comments, saves, shares), compute reach‑based or impressions‑based engagement rates, and track view‑based KPIs for video. Given metric deprecations and evolving definitions (e.g., “views” replacing impression‑ or play‑based counts for newer media), backward compatibility requires careful version pinning and metric normalization in the analytics layer. [^3][^11]

Table 8. Content KPIs and their derivation

| KPI | Derivation | Caveats |
|---|---|---|
| Engagement rate (by reach) | (likes + comments + saves + shares) ÷ reach | Reach can be an estimate; handle zero‑reach edge cases |
| Engagement rate (by impressions) | (likes + comments + saves + shares) ÷ impressions | Impressions may be deprecated for newer media; normalize to views when appropriate |
| Video completion rate | Completions ÷ video views | Definition of “completion” must be aligned with product behavior |
| Save rate | saves ÷ reach | Useful proxy for content utility/recency |
| Share rate | shares ÷ reach | Especially informative for Reels and Stories |
| Average watch time | total_watch_time ÷ plays or views | For reels; total watch time noted as “in development” |

### Hashtag Research

Hashtag Search allows eligible apps to query hashtag IDs and retrieve top or recent media tagged with those hashtags. Access is gated by App Review and the Instagram Public Content Access feature, with strict usage caps. The API supports retrieving IDs, the recent_media and top_media edges for those IDs, and a “recently searched hashtags” listing per user. Sensitive or offensive hashtags return generic errors; emojis are not supported; and stories are not included. [^6][^7]

Table 9. Hashtag Search: endpoints, caps, and access

| Capability | Endpoint(s) | Caps & restrictions | Access requirements |
|---|---|---|---|
| Find hashtag ID | GET /ig_hashtag_search | Max 30 unique hashtags per 7‑day rolling window (per user) | instagram_basic + Instagram Public Content Access |
| Hashtag metadata | GET /{hashtag_id} | N/A | Same as above |
| Top/recent media for hashtag | GET /{hashtag_id}/top_media, /recent_media | Only photos/videos; no stories; emojis not supported | Same as above |
| Recently searched hashtags | GET /{ig_user_id}/recently_searched_hashtags | Lists unique hashtags searched this week | Same as above |

Analytically, these capabilities enable topic discovery and sampling, but not comprehensive performance reporting for a hashtag (e.g., aggregate reach or engagement across all posts). Media objects returned are IDs; detailed insights are available only for owned media. [^6][^7]

### Competitor Analysis Possibilities

Business Discovery permits limited observation of public business/creator accounts—fetching fields such as id, username, bio, and recent media metadata/captions. It does not provide competitor insights metrics (reach, impressions, audience demographics) for those accounts. The feature is intended for influence research and partnership scouting rather than full competitive benchmarking. Competitor performance analytics must therefore rely on public proxies and internal modeling, not on official insights for non‑owned accounts. [^8]

Table 10. Business Discovery: fields vs analytics needs

| Field category | Examples | Available via BD? | Notes |
|---|---|---|---|
| Profile basics | id, username, bio | Yes | Public business/creator accounts only |
| Content metadata | recent media count, captions (recent) | Partially (recent) | Not a full historical corpus |
| Insights metrics | reach, impressions, engagement rate | No | Not exposed for non‑owned accounts |
| Audience analytics | demographics, follower growth | No | Not exposed for non‑owned accounts |

---

## Technical Implementation Constraints

Three classes of constraints shape production architectures: rate limits and quotas, data freshness and retention, and metric lifecycle/deprecation.

Rate limits and quotas. For Instagram Platform analytics (excluding messaging), the BUC formula governs: calls within a rolling 24 hours = 4,800 × number of impressions. Messaging endpoints have per‑second/per‑hour caps; Business Discovery and Hashtag Search follow Platform Rate Limits. Apps can monitor usage via HTTP headers (X‑App‑Usage and X‑Business‑Use‑Case‑Usage), and Meta recommends spreading queries, simplifying ranges, and stopping immediately on throttling to recover faster. [^10][^13]

Table 11. Rate limiting summary and mitigation tactics

| Scope | Policy | Window | Monitoring headers | Mitigations |
|---|---|---|---|---|
| Instagram Platform (non‑messaging) | 4,800 × Impressions (per app‑user) | Rolling 24 hours | X‑Business‑Use‑Case‑Usage | Even load spreading; reduce metric/breadth; stop on throttle; batch where possible |
| Business Discovery | Platform Rate Limits | Rolling 1 hour (typical) | X‑App‑Usage | Keep queries selective; cache discovery results |
| Hashtag Search | Platform Rate Limits | Rolling 1 hour (typical) | X‑App‑Usage | Stay under 30 unique hashtags per 7 days; cache IDs and media |
| Messaging endpoints | Per‑second and per‑hour caps | Real‑time | X‑Business‑Use‑Case‑Usage | Respect caps; queue and backoff |

Data freshness and retention. Media metrics can be delayed by up to 48 hours and are retained for up to two years; account‑level user metrics are stored for up to 90 days; stories are ephemeral—media‑level story metrics exist only while the story exists, and webhook story_insights are available only for the first 24 hours. These realities necessitate sliding windows for backfill, periodic reconciliation, and webhook‑first ingestion for stories. [^3][^2][^5]

Table 12. Data freshness and retention by surface

| Surface | Freshness | Retention | Operational implication |
|---|---|---|---|
| Account insights | Delay up to 48 hours | Up to 90 days | Use sliding windows; reconcile with late‑arriving data |
| Media insights | Delay up to 48 hours | Up to 2 years | Batch processing acceptable; version awareness required |
| Stories | Near real‑time via webhook; media insights while story exists | 24 hours | Webhook subscription mandatory; no late replay |

Metric lifecycle and deprecations. Meta has deprecated several media metrics (e.g., certain plays/impressions constructs) and introduced “views” as a unifying construct for video consumption. Teams should pin API versions for historical integrity and implement metric normalization so that longitudinal comparisons remain meaningful. Changelog monitoring and feature flags reduce breakage risk. [^11][^3]

---

## Gap Analysis: Available vs Needed for a Comprehensive Analytics Platform

Official capabilities enable a high‑quality first‑party analytics stack for professional accounts: trend tracking, content‑level optimization, audience segmentation from lifetime demographics, limited hashtag topic discovery, and minimal competitor discovery. However, advanced competitive intelligence, comprehensive hashtag performance analytics, granular follower time series, and cross‑channel attribution require data that the platform does not expose. [^2][^3][^4][^6][^8][^14]

Table 13. Gap matrix: requirement vs official availability vs workaround

| Requirement | Official availability | Workarounds | Compliance notes |
|---|---|---|---|
| Competitor reach/impressions | Not available | Public proxies (posting cadence, content tags); infer from public media count | Business Discovery does not expose insights for non‑owned accounts |
| Competitor audience demographics | Not available | None that are compliant | Respect platform policies; avoid scraping |
| Follower count time series | Not available | Periodic sampling and smoothing; model weekly/monthly | Account for delayed calculation and noise |
| Hashtag‑level aggregate performance (beyond sample) | Not available | Sample via Hashtag Search; tag own posts with UTM-like conventions | 30‑unique‑hashtag/7‑day cap; no stories or emojis |
| Story insights after 24 hours | Not available | None | Highlights do not extend webhook data window |
| Granular traffic source breakdown | Not available | Infer from content labels; use web traffic analytics | No official source breakdowns for organic/paid |
| Cross‑channel attribution to revenue | Limited via platform | Integrate web analytics and commerce data | Outside Instagram API scope; permissible with first‑party tools |

Two facts drive most gaps. First, privacy and consent boundaries prevent the API from exposing insights for non‑owned accounts. Second, the platform narrows fields to what is necessary for first‑party measurement, leaving aggregation and forecasting to the application layer. Compliant third‑party tooling may present broader dashboards, but they rely on public proxies and user‑consented data, not on competitor insights via API. [^8][^6][^14]

---

## Implementation Recommendations & Architecture Patterns

A robust Instagram analytics integration adheres to platform constraints while delivering decision‑ready insights.

Design a webhook‑first ingestion for stories and an account/media polling loop for broader metrics. Subscribe to the story_insights field under Facebook Login and persist event data immediately—these metrics do not replay after 24 hours. For account and media insights, schedule periodic pulls aligned with rate limits and expected data delay windows. [^5][^2][^3]

Implement metrics normalization to manage deprecations and evolving definitions. Pin API versions for historical consistency, and map deprecated metrics (e.g., plays, some impressions variants) to new equivalents (e.g., views) in your semantic layer. Provide configurable derivations for engagement rate and video KPIs to reflect product shifts. [^11][^3]

Model KPIs in the application layer. Derive engagement rate (by reach and by impressions), save rate, share rate, average watch time, and video completion rate from available media insights. Maintain clear definitions and unit tests to avoid ambiguity across content types. [^3][^14]

Optimize rate‑limit budgeting. The Instagram BUC formula means your call capacity scales with the account’s recent impressions; use X‑Business‑Use‑Case‑Usage headers to pace ingestion, batch media queries where possible, and throttle when throttled. Keep Business Discovery and Hashtag Search calls lightweight and cache results to avoid re‑querying within short intervals. [^10][^6][^8]

Respect compliance boundaries. Obtain App Review and Business Verification where needed; request only the permissions necessary for your features; and avoid scraping or other prohibited methods. For Hashtag Search, ensure the Instagram Public Content Access feature is approved. [^2][^6][^8]

Plan for observability. Use the Insights API to verify successful data retrieval for small subsets of media, and establish reconciliation jobs to detect gaps due to delayed metrics. Add alerts for webhook delivery failures or backlogs. [^2][^5]

Table 14. Recommended ingestion pipeline and SLA expectations

| Surface | Trigger | Frequency | SLA expectation | Notes |
|---|---|---|---|---|
| Account insights | Scheduled | Daily | Data available with up to 48‑hour delay | Backfill previous day; 90‑day retention |
| Media insights | Scheduled | Daily for last 7–30 days | Delay up to 48 hours | Use paging and metric batching |
| Story insights | Webhook | Real‑time | 24‑hour window | Persist immediately; replay not available |
| Hashtag Search | On demand | As needed | 30 unique hashtags/7 days | Cache IDs and media |
| Business Discovery | On demand | As needed | Platform Rate Limits | Cache profile/media basics |

---

## Appendices

### Appendix A. Endpoint cheat sheet by use case

Table 15. Key endpoints and permissions

| Use case | Endpoint | Method | Required permissions |
|---|---|---|---|
| Account insights | /{ig_user_id}/insights?metric=impressions,reach,profile_views | GET | instagram_business_manage_insights or instagram_manage_insights + pages_read_engagement |
| Media insights | /{ig_media_id}/insights | GET | Same as account insights |
| Story insights webhook | Subscribe to field “story_insights” | Webhook | instagram_manage_insights + page fields (FB Login) |
| Follower demographics | /{ig_user_id}/insights?metric=follower_demographics | GET | Same as account insights |
| Hashtag Search | /ig_hashtag_search; /{hashtag_id}/top_media; /{hashtag_id}/recent_media; /{ig_user_id}/recently_searched_hashtags | GET | instagram_basic + Instagram Public Content Access |
| Business Discovery | /{ig_user_id}?fields=business_discovery.username({username}){...} | GET | instagram_basic (and role/page context if applicable) |

[^2][^3][^5][^6][^7][^8][^13]

### Appendix B. Metrics dictionary (selected)

Table 16. Metric definitions and notes

| Metric | Definition | Product | Notes |
|---|---|---|---|
| impressions | Total times a media object/account content was viewed | Account, Media | Media‑level impressions deprecated for newer media; see “views” |
| reach | Unique accounts that saw content | Account, Media, Story | Estimated metric |
| profile_views | Users who viewed the profile | Account | Account‑level |
| engagement | Likes + comments (media) | Media | For reels, total_interactions may include saves/shares |
| comments | Number of comments | Media | N/A |
| likes | Number of likes | Media | N/A |
| saved | Number of saves | Media | Proxy for content utility |
| shares | Number of shares | Media, Story | N/A |
| views | Total times video was seen | Media (video) | Replacing certain impression/play metrics |
| avg watch time | Average time spent playing a reel | Reels | N/A |
| total watch time | Total reel play time (incl. replays) | Reels | In development |
| navigation | Story forward/back/exits | Story | Breakdown by action type available |
| replies | Story replies (comments) | Story | Regional exclusions for EU and JP |

[^3][^11]

### Appendix C. Deprecations tracker (selected)

Table 17. Notable metric changes and timeline

| Metric | Status | Version/timeline | Alternative |
|---|---|---|---|
| plays (Reels) | Deprecated | v22.0; all versions by Apr 21, 2025 | views |
| clips_replays_count | Deprecated | v22.0; all versions by Apr 21, 2025 | views/aggregated plays replacement |
| ig_reels_aggregated_all_plays_count | Deprecated | v22.0; all versions by Apr 21, 2025 | views |
| impressions (newer media) | Deprecated | v22.0+ (media created after Jul 2, 2024) | views |

[^11][^3]

### Appendix D. Rate limit headers and error codes (quick reference)

Table 18. Rate monitoring and throttle indicators

| Header | What it shows | Common throttle codes |
|---|---|---|
| X‑App‑Usage | call_count, total_cputime, total_time (Platform limits) | 4 (app), 17 (user), 613 (custom) |
| X‑Business‑Use‑Case‑Usage | call_count, total_cputime, total_time, type, estimated_time_to_regain_access | 80002 (Instagram BUC), 80006 (Messenger), etc. |

Stop calls immediately upon throttling, spread queries more evenly, and simplify requests (fewer metrics/time ranges) to recover faster. [^10]

---

## Information gaps and validation items

- Official rate quotas for Business Discovery and Hashtag Search are governed by Platform Rate Limits, but exact per‑endpoint quotas are not comprehensively enumerated here; confirm in implementation and monitor headers. [^10]  
- Historical backfill windows beyond published delays/retention (e.g., precise depth for media older than two years) should be validated during production roll‑out. [^3][^2]  
- Engagement rate and similar KPIs are not standardized by the API; derive and document consistent formulas in the analytics layer. [^14]  
- The full webhook payload schema for every event field (including all nested structures) should be verified against live webhook samples; treat exact field lists as an implementation detail. [^5]  
- Demographic breakdowns beyond age, city, country, and gender (e.g., language) are not evidenced in the referenced documentation; confirm against current API versions before committing to designs. [^4]  
- Business Discovery field coverage continues to evolve; validate what profile/media fields are available for public business/creator accounts in your target versions. [^8]  
- Hashtag Search media insights are limited to IDs; any enhanced analytics require owned media, subject to permissions and retention policies. [^6][^7]

---

## References

[^1]: Instagram Platform — Meta for Developers. https://developers.facebook.com/docs/instagram-platform/  
[^2]: Insights — Instagram Platform — Meta for Developers. https://developers.facebook.com/docs/instagram-platform/insights/  
[^3]: Instagram Media Insights — Meta for Developers. https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights/  
[^4]: Instagram User Insights (Follower Demographics) — Meta for Developers. https://developers.facebook.com/docs/instagram-platform/api-reference/instagram-user/insights/  
[^5]: Webhooks — Instagram Platform — Meta for Developers. https://developers.facebook.com/docs/instagram-platform/webhooks/  
[^6]: Hashtag Search — Instagram API with Facebook Login — Meta for Developers. https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/hashtag-search/  
[^7]: IG Hashtag Search (Root Edge) — Instagram Graph API — Meta for Developers. https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-hashtag-search/  
[^8]: Business Discovery Guide — Instagram Graph API — Meta for Developers. https://developers.facebook.com/docs/instagram-api/guides/business-discovery  
[^9]: Rate Limits — Graph API — Meta for Developers. https://developers.facebook.com/docs/graph-api/overview/rate-limiting/  
[^10]: Instagram Platform Rate Limiting (Graph API Overview section). https://developers.facebook.com/docs/graph-api/overview/rate-limiting#instagram-graph-api  
[^11]: Instagram Insights Metrics Deprecation (April 2025) — Emplifi Docs. https://docs.emplifi.io/platform/latest/home/instagram-insights-metrics-deprecation-april-2025  
[^12]: About Instagram Insights — Instagram Help Center. https://help.instagram.com/788388387972460?helpref=faq_content  
[^13]: Overview — Instagram Platform — Meta for Developers. https://developers.facebook.com/docs/instagram-platform/overview/  
[^14]: The social media metrics to track in 2025 (and why) — Sprout Social. https://sproutsocial.com/insights/social-media-metrics/  
[^15]: Instagram APIs — Meta for Developers. https://developers.facebook.com/products/instagram/apis/