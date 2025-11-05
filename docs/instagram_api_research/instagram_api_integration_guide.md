# Instagram API Integration in Web Applications: A Practical, Secure, and Resilient Implementation Guide

## Executive Summary

This guide provides a pragmatic, security-first playbook for integrating Instagram data and capabilities into modern web applications built with React and JavaScript. It distills what is feasible with Meta’s Instagram Platform today, how to authenticate and manage tokens, how to architect a reliable backend proxy, and how to operationalize rate limiting, error handling, caching, and monitoring.

The strategic starting point is to correctly choose between the two official API surfaces and to align your use case to the supported capabilities. For professional accounts (Business or Creator), the Instagram Graph API unlocks the functionality most teams expect: content publishing, comment moderation, insights, and messaging. For read-only display of basic profile and media from personal accounts, the Instagram Basic Display API historically served that need, but it was officially deprecated in December 2024; teams should plan to migrate legacy use cases to the Graph API wherever feasible[^1][^8].

Architecturally, successful implementations share three traits: a clear separation of concerns with a backend token vault and proxy, robust token lifecycle handling with rotation and refresh, and resilient client-side experiences that degrade gracefully under rate limits and transient failures. The Graph API itself follows OAuth 2.0 patterns with short-lived tokens (about one hour) that can be exchanged for long-lived tokens (about 60 days), which in turn must be refreshed on a schedule. Understanding and implementing this lifecycle correctly is a prerequisite for reliability[^1].

Resilience requires an explicit strategy for rate limits, which Meta exposes both as formulas (for Instagram platform contexts) and via usage headers (e.g., X-App-Usage, X-Business-Use-Case-Usage). Production-grade clients monitor these headers, implement jittered exponential backoff for 429 and 5xx errors, and apply circuit breakers when sustained throttling occurs[^2][^7]. Caching—server-side for API responses, and client-side for media—reduces load, improves latency, and blunts the impact of rate limits. Webhooks complete the picture by enabling event-driven synchronization that avoids polling altogether[^6].

Security is a first-order concern. Keep secrets on the server, use explicit allowlists for redirect URIs, sanitize logs, and treat CORS and embedding with care. Use official SDKs or well-maintained community libraries judiciously, and avoid private or unofficial API clients that risk policy violations and sudden breakage[^1][^13][^15][^19][^20].

Finally, many failures stem from a handful of predictable root causes: rate limit spikes, token expiry, permission scope mismatches, pagination pitfalls, and webhook configuration errors. A focused troubleshooting playbook paired with structured logging and usage header monitoring shortens time-to-resolution[^2][^9][^7].


## Instagram Platform Overview and Choosing the Right API

Meta’s Instagram Platform exposes two official API families relevant to web apps: the Instagram Graph API and the Instagram Basic Display API. The Graph API is designed for professional accounts and supports the core workflows teams depend on—content publishing, moderation, insights, discovery features like hashtag search for public content, and messaging—subject to App Review and access levels. By contrast, the Basic Display API historically provided read-only access to a user’s basic profile and media. It was deprecated in December 2024, which means ongoing support and new integrations should target the Graph API[^1][^8].

In practical terms, if your application needs to publish content, moderate comments, retrieve insights, or integrate messaging, the Graph API is the only viable option. If you are supporting legacy Basic Display flows, plan a migration to the Graph API, converting accounts as needed and aligning permissions through App Review.

To illustrate the distinctions, Table 1 summarizes capability coverage across both APIs.

Table 1. Capabilities: Graph API vs. Basic Display API (and deprecation note)

| Capability                              | Instagram Graph API | Instagram Basic Display API |
|-----------------------------------------|---------------------|-----------------------------|
| Read profile and media                  | Yes                 | Yes (legacy)                |
| Content publishing                      | Yes                 | No                          |
| Comment moderation                      | Yes                 | No                          |
| Insights (analytics)                    | Yes                 | No                          |
| Hashtag search and business discovery   | Yes (limited, policy-bound) | No                  |
| Messaging integration                   | Yes (via Messenger Platform for Instagram) | No |
| Product tagging, collaborators, ads     | Yes (subject to access level) | No                  |
| Status                                  | Active              | Deprecated (Dec 2024)       |

As shown above, the Graph API is the path forward for production-grade use cases. The deprecation of Basic Display further consolidates the strategic direction[^1][^8].


## Architecture Patterns for Web Apps (React + Node)

At a high level, the reference architecture is a React client that initiates OAuth via Meta’s authorization window, followed by a secured backend that exchanges codes for tokens, calls the Graph API on behalf of users, and returns only the data needed by the client. The backend also stores and refreshes long-lived tokens, enforces rate limit-aware scheduling, and persists usage metrics from response headers. Webhooks can be introduced to eliminate polling for event-driven features like new media or messages[^1][^2][^6].

This division of responsibilities is not optional: tokens must never be exposed in the browser, and cross-origin concerns mean that direct calls from the React app to Graph endpoints are both fragile and insecure. A backend-for-frontend (BFF) proxy is the right pattern.

Table 2 details a responsibility matrix that clarifies where each concern belongs.

Table 2. Responsibility matrix: frontend vs. backend

| Concern                     | Frontend (React)                                         | Backend (Node/BFF)                                                                                 |
|----------------------------|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| OAuth initiation           | Redirect to authorization; handle redirect with code      | Define and protect redirect URIs; validate state; manage CSRF protection                           |
| Token exchange             | —                                                         | Exchange authorization code for short-lived; immediately exchange for long-lived token              |
| Token storage              | —                                                         | Encrypt at rest; implement rotation and refresh; never log tokens                                   |
| API proxy                  | Call BFF endpoints                                        | Call Graph API with user token; enforce rate limit awareness; paginate                              |
| Rate limiting              | Display loading/degraded states; retry hints              | Monitor X-App-Usage/X-BUC headers; implement jittered backoff, throttling, circuit breakers        |
| Caching                    | Cache media URLs; avoid refetch churn                     | Cache API responses by endpoint and parameters; invalidate on events/webhooks                       |
| Webhooks                   | —                                                         | Verify signatures; process updates; enqueue jobs; reconcile state                                   |
| Logging/monitoring         | Non-sensitive breadcrumbs                                 | Structured logs with redaction; capture headers; metrics/alerting                                   |
| Error mapping              | User-friendly messaging                                   | Map API errors to client-safe messages; trigger token refresh or permission re-consent              |

This separation of concerns creates a secure boundary around tokens and rate limit enforcement while enabling the frontend to remain lean and fast[^1][^2][^6].


## Authentication and Token Management (OAuth 2.0)

There are two supported login pathways, depending on the profile type and desired capabilities:

- Instagram Login for Instagram professionals (Business/Creator without a linked Facebook Page).
- Facebook Login for Business (for Instagram professionals linked to a Facebook Page).

Both use OAuth 2.0 and produce app-scoped tokens. After user authorization, your app receives a one-hour authorization code, which the backend exchanges for a short-lived access token (about one hour), then immediately exchanges for a long-lived token (about 60 days). Long-lived tokens can be refreshed before expiration. Facebook Login for Business typically yields Facebook User or Page tokens; Instagram Login yields Instagram User tokens[^1][^3][^4][^5].

Self-managed tokens are an exception: if your application only accesses your own owned professional accounts, you can provision long-lived tokens directly without the full end-user flow, while still keeping them server-side[^1].

The backend must manage this lifecycle end-to-end and propagate only minimal, non-sensitive context back to the React client.

Table 3 summarizes the token lifecycle.

Table 3. Token lifecycle summary

| Step                               | What happens                                                            | Typical validity          | Location and security notes                             |
|------------------------------------|-------------------------------------------------------------------------|---------------------------|---------------------------------------------------------|
| Authorization code                 | Meta redirects with code after user consent                             | ~1 hour                   | Received via redirect URI; single-use; CSRF-protected   |
| Short-lived access token           | Backend exchanges code                                                  | ~1 hour                   | Store server-side only; use immediately for exchange    |
| Long-lived access token            | Backend exchanges short-lived                                           | ~60 days                  | Encrypt at rest; map to user; monitor usage headers     |
| Refresh long-lived token           | Backend refreshes before expiry                                         | Resets ~60 days           | Schedule refresh proactively; revoke/rotate if needed   |
| Token use in API calls             | Backend attaches Authorization: Bearer                                  | N/A                       | Never expose token to frontend                          |

Permissions and access levels determine which features unlock for your users. Standard Access suits development and apps serving only owned accounts; Advanced Access is required to act on behalf of non-owned professional accounts and must pass App Review. Expect to document every requested permission and how it is used. The review can take days to weeks[^1].

Table 4 provides a concise view of access levels and common permissions.

Table 4. Access levels and permissions (illustrative)

| Access level        | What it enables                                                                   | Common permissions (examples)                         | Review implications                    |
|---------------------|------------------------------------------------------------------------------------|-------------------------------------------------------|----------------------------------------|
| Standard Access     | Development, testing, and apps serving owned accounts                              | instagram_basic; instagram_manage_comments (dev-mode) | Minimal review in dev; limited scope   |
| Advanced Access     | Serving non-owned professional accounts; full functionality                        | instagram_basic; instagram_content_publish;           | Full App Review and business verification |
|                     |                                                                                    | instagram_manage_insights; pages_show_list;           | required                               |
|                     |                                                                                    | instagram_manage_messages (messaging scenarios)       |                                        |

Because invalid or expired tokens are a common source of failures, implement proactive token health checks and refresh routines in the backend. Errors such as 190 or 401 should trigger silent re-authentication flows and clearly mapped client messages[^7][^9].


### Choosing a Login Flow (Instagram Login vs Facebook Login for Business)

Selecting the right login flow dictates your capabilities. Instagram Login applies to Instagram-only professional accounts and yields Instagram User tokens. Facebook Login for Business requires a Facebook Page linked to the Instagram professional account and typically yields Facebook User or Page tokens, unlocking features like Insights, Hashtag Search, Collaborators, and Product Tagging[^1][^4][^5].

Table 5 below consolidates the decision points.

Table 5. Login flow decision table

| Condition                                            | Recommended flow                         | Resulting token type             | Capabilities unlocked (examples)                    |
|------------------------------------------------------|------------------------------------------|----------------------------------|------------------------------------------------------|
| Instagram-only professional account                   | Instagram Login for Instagram            | Instagram User                   | Content publishing, comments, mentions               |
| Instagram pro linked to a Facebook Page               | Facebook Login for Business              | Facebook User or Page            | Insights, Hashtag Search, Collaborators, Product Tagging |
| Need to act on non-owned professional accounts        | Facebook Login for Business (Advanced Access) | Facebook User/Page (per app)  | Full feature set, subject to App Review              |


### Token Lifecycle and Rotation

Implement a token service that:

- Immediately exchanges short-lived for long-lived tokens after authorization.
- Persists long-lived tokens securely and schedules refresh well before the 60-day window elapses.
- Tracks token health using API calls and usage headers; on 401/190 or repeated authorization failures, forces renewal and presents a re-consent UX in the frontend.
- Applies strict redaction in logs and never writes raw tokens to disk in plaintext[^1][^7].


## React/JavaScript Implementation Patterns

A reliable React client depends on a clearly defined contract with the backend. The client triggers login, handles redirects, and renders views that request data via BFF endpoints. Direct calls to Graph API endpoints from the browser should be avoided due to token security and cross-origin policy considerations. Instead, the client retrieves minimal data through the BFF, uses local state and caching to minimize refetching, and surfaces errors in a user-friendly way.

Real-world repositories illustrate these patterns. For example, a React + Hapi integration demonstrates a split between a frontend and a backend that manages API token configuration and exposes the needed endpoints to the React client. Although each project differs in detail, the common thread is a backend that owns secrets and orchestrates calls to the Graph API[^10][^11][^12].

To make these responsibilities concrete, Table 6 outlines the interaction model between React and the backend.

Table 6. React–backend interaction model

| Frontend state                        | Backend endpoint (BFF)                          | Purpose and contract                                                          |
|--------------------------------------|--------------------------------------------------|--------------------------------------------------------------------------------|
| Redirect handling after OAuth        | /auth/callback                                   | Exchange code for tokens server-side; set secure session; return minimal profile context |
| Loading media feed                   | /ig/media                                        | Return a page of media with minimal fields; backend paginates and caches       |
| Fetching insights                    | /ig/insights                                     | Return aggregated metrics for a time range; backend throttles and batches      |
| Publishing content                   | /ig/publish                                      | Accept media metadata; upload via Graph; handle long-running job and callbacks |
| Webhook event consumption            | Webhooks receiver                                | Verify and process events (e.g., new media, messages); update cache/DB         |

This pattern ensures the frontend never sees tokens, CORS is a non-issue for Graph endpoints, and rate-limit-aware scheduling happens in one place[^10][^11][^12].


### Handling OAuth in a React App

In a SPA, initiating login is as simple as redirecting the user to the authorization endpoint with the required parameters. After consent, Meta redirects to your registered redirect URI with an authorization code and state parameter. The backend should verify state, exchange the code for tokens, and establish a server-side session. The React client then fetches a minimal user context to render the authenticated experience[^3][^10].

This design decouples the browser from sensitive token exchanges while keeping the user flow smooth and predictable.


## Error Handling and Rate Limit Management

Meta enforces multiple layers of rate limiting, and the semantics differ by surface. For non-messaging Instagram Graph API scenarios, a business-use-case formula applies: calls within 24 hours equal 4,800 multiplied by the number of impressions for the account in that period. Messaging has distinct per-second and per-hour ceilings. Platform-wide headers expose usage and throttling in near-real time. Clients must treat these signals as first-class inputs to their scheduling and retry logic[^2].

Two usage headers matter most:

- X-App-Usage: indicates your app’s call_count, total_time, and total_cputime as percentages of allotted resources in a rolling one-hour window. Throttling occurs at 100%[^2].
- X-Business-Use-Case-Usage (X-BUC): reports per business object and limit type, including call_count, total_time, total_cputime, and estimated_time_to_regain_access in minutes when throttled[^2].

Clients should read and log these headers, implement exponential backoff with jitter for 429 and 5xx, and apply a circuit breaker when repeated failures indicate systemic pressure. Non-retryable errors—such as invalid scope or malformed requests—should fail fast and drive user-visible remediation (e.g., re-consent prompts)[^7].

Table 7 summarizes key rate limits.

Table 7. Instagram Graph API rate limit summary

| Surface                                  | Limit                                                                              | Window     | Notes                                                                                   |
|------------------------------------------|------------------------------------------------------------------------------------|------------|-----------------------------------------------------------------------------------------|
| Non-messaging (Graph, Instagram)         | Calls = 4,800 × impressions                                                        | 24 hours   | Per app–user pair; impressions measured for the account’s content entering screens      |
| Platform rate limits (headers)           | X-App-Usage: call_count, total_time, total_cputime                                 | Rolling 1h | Throttle at 100%; spread queries; reduce payload                                       |
| Business-use-case headers (X-BUC)        | X-BUC usage per business object and type                                           | Varies     | Includes estimated_time_to_regain_access                                               |
| Messaging – Conversations API            | 2 calls/second per professional account                                            | Per second |                                                                                         |
| Messaging – Private Replies (Live)       | 100 calls/second per professional account                                          | Per second |                                                                                         |
| Messaging – Private Replies (Posts/Reels)| 750 calls/hour per professional account                                            | Per hour   |                                                                                         |
| Messaging – Send API (text/links/etc.)   | 100 calls/second per professional account                                          | Per second |                                                                                         |
| Messaging – Send API (audio/video)       | 10 calls/second per professional account                                           | Per second |                                                                                         |

Operationalizing this requires a decision matrix that classifies errors and routes to the right remediation. Table 8 provides a concise guide.

Table 8. Error handling decision matrix

| Error code / signal                    | Example                                                | Client action                                                            | Retry policy                         |
|----------------------------------------|--------------------------------------------------------|---------------------------------------------------------------------------|--------------------------------------|
| 400 Bad Request                        | Invalid parameter                                       | Show validation error; fix inputs; do not retry                           | No retry                             |
| 401 Unauthorized / 190 Token error     | Expired or invalid token                                | Trigger token refresh or re-login                                         | Retry after refresh once             |
| 403 Forbidden                          | Insufficient scope                                      | Prompt to re-consent with required permissions                            | No retry                             |
| 429 Too Many Requests                  | Rate limit exceeded                                     | Pause requests; exponential backoff with jitter; monitor headers          | Retry with backoff                   |
| 5xx Server errors                      | Transient failure                                       | Backoff with jitter; consider circuit breaker after threshold             | Limited retries                      |
| X-App-Usage or X-BUC at high percentile| Approaching throttling                                  | Slow down proactively; queue non-critical work                            | Preventative throttling              |

These patterns keep failure modes contained and predictable while avoiding the common anti-pattern of aggressive retry storms that exacerbate throttling[^2][^7][^9].


### Detecting and Responding to Throttling

Implement a lightweight rate-limit client that:

- Reads X-App-Usage and X-BUC on every response.
- Tracks a moving baseline of call_count, total_time, and total_cputime.
- Smooths load by deferring non-critical work and reducing payload sizes when approaching thresholds.
- Uses estimated_time_to_regain_access to schedule deferred retries.
- Opens a short-lived circuit breaker when repeated 429s or 5xxs occur, and provides a clear status UI to users[^2].


## Data Caching Strategies (Client and Server)

Caching is the most cost-effective performance and reliability tool in your stack. The backend should cache API responses for media lists, insights, and other relatively static data, keyed by endpoint and parameters, with TTLs tuned to user behavior and content velocity. The frontend should cache media URLs and render with placeholders to avoid layout shifts. A CDN in front of your assets further reduces latency. When webhooks signal changes, invalidate relevant cache entries so the next request pulls fresh data without a poll-heavy pattern[^6].

Table 9 provides a template for cache planning.

Table 9. Cache plan template

| Data type               | Suggested location     | Recommended TTL           | Invalidation triggers                                  |
|-------------------------|------------------------|---------------------------|--------------------------------------------------------|
| Media feed (list)       | Server-side cache      | 5–15 minutes              | Webhook: media update; publish event                   |
| Media details           | Server-side cache + client memory | 30–60 minutes     | Webhook: caption change, media update                  |
| Insights aggregates     | Server-side cache      | 24 hours (or longer)      | New day boundary; webhook indicating insights refresh  |
| Profile info            | Server-side cache      | 24 hours                  | Explicit profile update event                          |
| Media assets (images/videos) | CDN + client cache | Hours–days (asset hashing) | Asset version change                                   |

This balanced approach minimizes redundant Graph calls, respects rate limits, and keeps the user experience responsive. Event-driven invalidation via webhooks is the cleanest way to ensure freshness without constant polling[^6].


## Security Considerations for Production

Security is a cross-cutting concern that touches every layer:

- Store all secrets—app secrets, long-lived tokens—on the server. Encrypt at rest, restrict access via IAM, and enforce strict rotation schedules. Never embed secrets in the frontend bundle or log tokens, even in internal logs[^1].
- Adopt least-privilege permissioning. Request only the permissions you need and justify them during App Review. Prompt users for re-consent if scopes change[^1].
- Harden CORS and embedding. Prefer server-side proxying for API calls. If you embed public content, use official mechanisms such as the Embed Button and oEmbed endpoints as intended, and configure allowed origins explicitly[^13][^14].
- Sanitize logs. Redact tokens and PII, and avoid writing raw response bodies to logs. Mask or hash identifiers where possible.
- Align with platform policies. Do not scrape or use private/unofficial APIs; they violate policies and are unstable. Use the official Graph API and follow Meta’s Developer Policies[^15][^1].

Table 10 offers a concise security checklist.

Table 10. Security checklist

| Control area                 | Key practices                                                                 |
|-----------------------------|--------------------------------------------------------------------------------|
| Secret storage              | Server-only; encrypted at rest; KMS/secret manager; never in client bundle     |
| Token lifecycle             | Immediate exchange; scheduled refresh; rotation; revoke on anomaly             |
| Logging                     | Structured logs with redaction; no tokens; mask identifiers                    |
| CORS                        | Explicit allowlist; restrict methods/headers; preflight handling               |
| Embedding                   | Use official Embed and oEmbed; avoid scraping                                  |
| Permissions                 | Least privilege; App Review readiness; user re-consent for scope changes       |
| Compliance                  | Adhere to Developer Policies; avoid private APIs and scraping                  |


## Popular Libraries and SDKs for Instagram Integration

While the official interfaces are HTTP-based, several libraries and components can accelerate development:

- Official: The Facebook SDK for JavaScript is the canonical choice for certain web integrations and complements server-side Graph API usage[^13].
- Community: Wrappers such as instagram-graph-api, node-instagram, and client projects like instagram-api-js-client can help, but vet them carefully for maintenance quality and policy alignment[^18][^16][^17].
- Embeds: If you only need to display public Instagram posts, prefer UI components such as react-social-media-embed; these typically work without tokens by embedding public URLs, but they are not a substitute for data access APIs[^19].
- Gatsby: Plugins like gatsby-source-instagram exist for static site builds; review maintenance status before adopting[^20].

Table 11 summarizes selection criteria.

Table 11. Library selection criteria

| Library/component                    | Type            | Primary use case                         | Maturity and notes                                        |
|-------------------------------------|-----------------|------------------------------------------|-----------------------------------------------------------|
| Facebook SDK for JavaScript         | Official SDK    | Web integrations complementing Graph     | Maintained by Meta; good for auth辅助 flows                |
| instagram-graph-api (community)     | Community lib   | Graph API requests helper                | Check maintenance, TypeScript support, issue activity     |
| node-instagram                      | Community lib   | Node client for Instagram API            | Verify compatibility and policy compliance                |
| instagram-api-js-client             | Community client| Basic Display scenarios (legacy)         | Evaluate for maintenance; Basic Display is deprecated     |
| react-social-media-embed            | UI component    | Embed public Instagram posts by URL      | No token needed; for display only                         |
| gatsby-source-instagram             | Gatsby plugin   | Source Instagram posts in static builds  | Review maintenance status and current constraints         |


## Common Pitfalls and Solutions

Teams repeatedly encounter the same failure modes. The fastest path to stability is to anticipate and mitigate them up front.

Table 12 presents a concise pitfall-to-solution playbook.

Table 12. Pitfalls and solutions

| Symptom                                            | Likely root cause                                         | Recommended fix                                                                                   |
|----------------------------------------------------|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| Frequent 429s; throttling messages                 | Traffic spikes; no backoff; overlapping queries           | Implement jittered backoff; smooth traffic; monitor X-App-Usage/X-BUC; use webhooks to reduce polling |
| 401/190 on calls; users logged out unexpectedly    | Expired or invalid token; missed refresh                  | Proactive refresh scheduler; token health checks; silent re-auth; clear user messaging             |
| 403 on publish or insights                         | Insufficient permissions or scope                         | Validate scopes; prompt re-consent; align App Review to requested permissions                      |
| Empty media lists or missing posts                 | Pagination misuse; unsupported media types                | Use cursor-based pagination; filter fields; note unsupported types; batch requests appropriately    |
| Webhooks not firing or failing verification        | Misconfigured callback URLs; signature verification errors| Double-check app config; verify signatures; use sample clients; instrument logs and retries         |

Building robust retry logic with exponential backoff and jitter, differentiating retryable from non-retryable errors, and implementing circuit breakers during sustained failures will prevent many of these issues from escalating[^2][^9][^7].


## Implementation Checklist and Go-Live Readiness

Operational readiness is more than code working in dev mode. It is a set of practices and controls that ensure reliability at scale.

Table 13 provides a go-live checklist.

Table 13. Go-live checklist

| Area                 | Items                                                                                                      |
|----------------------|-------------------------------------------------------------------------------------------------------------|
| App setup            | Meta developer registration; app created; products added (Instagram API, Facebook Login as applicable)     |
| Redirect URIs        | All OAuth redirect URIs registered and locked down; CSRF state validated                                    |
| Permissions          | Scopes mapped to features; Standard vs Advanced Access plan; App Review package prepared                    |
| Auth and tokens      | Backend token vault; immediate exchange for long-lived; refresh scheduler; rotation and revocation policy  |
| Rate limits          | Read and log X-App-Usage and X-BUC; backoff and circuit breaker implemented; throttled queues              |
| Caching              | Server-side caches with TTLs; webhook invalidation; CDN for media; client caching strategy                  |
| Webhooks             | Callback URL and verification configured; signature validation; idempotent handlers; retry policies         |
| Monitoring           | Structured logging; metrics on usage headers, latency, error rates; alerting thresholds                     |
| Frontend resilience  | Degraded states for rate limits and network errors; pagination UX; retry affordances                        |
| Security             | Secret management; log redaction; CORS hardening; no tokens in browser; policy compliance verification     |

The single best predictor of smooth operations is disciplined token and rate-limit management with proactive monitoring of usage headers, combined with event-driven synchronization via webhooks where supported[^1][^2][^6].


## A note on information gaps and validation

- The React Basic Display + React example repository content could not be fully inspected here. If you rely on it, review the code directly to validate OAuth handling, token storage, and security controls[^12].
- Community SDK maintenance levels change frequently. Re-verify versions, TypeScript support, and issue activity before adopting any library in production[^16][^17][^18].
- CORS policies evolve. Confirm current browser restrictions and allowed origins with the latest Meta guidance before relying on direct client-side calls.
- Messaging rate limits for new surfaces change over time. Validate current limits in Meta docs during implementation[^2].
- The long-term replacement guidance for Basic Display migration focuses on Graph API for professional accounts; confirm the latest pathways before planning legacy transitions[^8].


## References

[^1]: Overview – Instagram Platform – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/overview/

[^2]: Rate Limits – Graph API – Meta for Developers. https://developers.facebook.com/docs/graph-api/overview/rate-limiting/

[^3]: OAuth Authorize – Instagram Platform – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/reference/oauth-authorize/

[^4]: Instagram API with Instagram Login – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login

[^5]: Instagram API with Facebook Login – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login

[^6]: Webhooks – Instagram Platform – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/webhooks

[^7]: API Error Handling: Instagram Development Guide 2025 – GWAA. https://gwaa.net/api-error-handling-instagram-development-best-practices

[^8]: How to Use Instagram Basic Display API: A Comprehensive Guide – Phyllo. https://www.getphyllo.com/post/how-to-use-instagram-basic-display-api

[^9]: Mastering Instagram API: Troubleshooting Common Issues and Fixes – Phyllo. https://www.getphyllo.com/post/troubleshooting-common-issues-with-instagram-api

[^10]: react-hapi-instagram – Instagram API integration using ReactJS – GitHub. https://github.com/a8hok/react-hapi-instagram

[^11]: Instagram Content Publishing with the Graph API – React App – GitHub. https://github.com/pixochi/instagram-content-publishing-react-app

[^12]: Instagram feeds with Instagram API: Part 2 – Basic Display API with React – Medium. https://cming0721.medium.com/instagram-feeds-with-instagram-api-part-2-basic-display-api-with-react-f0c6dfcc576c

[^13]: Facebook SDK for JavaScript – Meta for Developers. https://developers.facebook.com/docs/javascript

[^14]: Instagram Embed Button – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/embed-button

[^15]: Meta Developer Policies. https://developers.facebook.com/devpolicy

[^16]: node-instagram – npm. https://www.npmjs.com/package/node-instagram

[^17]: instagram-api-js-client – jsDelivr CDN. https://www.jsdelivr.com/package/npm/instagram-api-js-client

[^18]: instagram-graph-api – GitHub Topic. https://github.com/topics/instagram-graph-api

[^19]: react-social-media-embed – npm. https://www.npmjs.com/package/react-social-media-embed

[^20]: gatsby-source-instagram – npm. https://www.npmjs.com/package/gatsby-source-instagram