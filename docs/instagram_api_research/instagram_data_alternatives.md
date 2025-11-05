# Alternative Ways to Access Instagram Data Beyond the Official Graph API (2025): Capabilities, Compliance, and Strategic Options

## Executive Summary

As of November 2025, teams seeking Instagram data have six practical paths, each with distinct capabilities, compliance requirements, and risk profiles:

- Official Meta APIs (Instagram Graph API, Instagram API with Instagram Login, Messaging via the Messenger API for Instagram, Content Publishing, oEmbed Read).
- The former “Creator Studio API” (deprecated), now encompassed by the Instagram Platform under the Instagram API with Instagram Login or Instagram API with Facebook Login for Business.
- Meta Business API (Marketing API) for advertising use cases and IG account linkages.
- Third‑party analytics and management platforms that integrate via Meta’s official APIs (with occasional public web signals for competitive and listening features).
- Web scraping of publicly accessible content, subject to strict legal and Terms of Service (ToS) constraints.
- Official partner solutions and Meta’s badged partner directory, subject to enterprise access and login.

The official APIs remain the most compliant and reliable route for first‑party Instagram data—enabling publishing, comment moderation, messaging, insights, mentions, hashtag search, and business discovery for professional accounts. In 2025, Meta introduced material changes and deprecations: the “views” metric replaces “impressions/plays” for many insights, the Instagram v1.0 API was deprecated on May 20, 2025, and oEmbed Read fields were reduced on November 3, 2025. Migration to the Instagram Platform endpoints is mandatory, with specific timelines and breaking changes that affect analytics and publishing stacks.[^9]

Third‑party analytics platforms (e.g., Sprout Social, Hootsuite, Buffer, Rival IQ, Keyhole, Iconosquare) generally integrate through official APIs and complement them with reporting, competitive analysis, and listening features—often priced per seat or per brand and varying widely by tier and data depth.[^7][^8] 

Web scraping of publicly available data has achieved some legal clarity in U.S. case law (e.g., HiQ v. LinkedIn; Bright Data ruling on public data), but remains contractually risky under Instagram’s ToS, especially for behind‑login data, and poses material privacy and copyright exposure for personal data and media republishing.[^5][^6][^4][^15]

Recommendations for 2025+:
- Prioritize official APIs for owned‑account data, publishing, messaging, and insights; plan migrations for v1.0 deprecations and insights metric changes.[^9][^11]
- Vet third‑party tools for official API integration and data provenance; confirm Business Manager linkage when needed.[^7][^8]
- Limit scraping to public content where legally defensible, avoid personal data, respect robots/ToS, and implement rate and load controls; involve counsel.[^5][^6][^4]
- For ad‑centric needs, align with the Meta Business (Marketing) API, update references to actor/story IDs, and complete migrations by September 9, 2025.[^9][^14]

Information gaps: Meta’s Partner Directory sits behind a login wall; tool‑level data provenance disclosures and pricing tiers vary; rate‑limit specifics are not consolidated in 2025 public docs; long‑term oEmbed “read” implications for content embedding workflows require developer confirmation. Teams should validate current documentation and partner certifications before procurement.[^9]

## Scope, Methodology, and Source Reliability

This report synthesizes official Meta developer documentation and change logs, Instagram ToS, current legal analyses and case law, and reputable third‑party analytics roundups for 2025. The baseline reflects the environment as of November 2, 2025. Emphasis is placed on the Instagram Platform Overview, API migration notices, and the platform changelog for field and metric deprecations.[^3][^9]

Source reliability: Official Meta documentation is treated as primary for technical capabilities and policies; legal analyses and case law summaries are drawn from widely cited industry resources; tool roundups provide market context but are not authoritative on API internals. Where docs are gated (e.g., Partner Directory) or tool integration details are proprietary, we flag those as information gaps.

Limitations: The Partner Directory content is login‑gated; precise numeric rate limits are not consolidated in 2025 public docs; long‑term oEmbed read implications require developer testing; and vendor pricing tiers change frequently.

## Official Instagram Data Access via Meta APIs

Meta’s Instagram Platform provides several complementary APIs designed for professional (Business/Creator) accounts. They cover content publishing, comment moderation, messaging, insights, business discovery, hashtag search, mentions, and content embedding.

To frame the official landscape, Table 1 outlines each API’s purpose, scope, prerequisites, and key limitations.

To illustrate this landscape succinctly, the following table compares the core official APIs frequently used to access Instagram data in 2025.

Table 1: Official Meta Instagram APIs—purpose, capabilities, prerequisites, and limitations

| API | Primary purpose | Core capabilities | Prerequisites | Notable limitations |
|---|---|---|---|---|
| Instagram Graph API (Instagram API with Facebook Login for Business) | Manage presence and data for IG Business/Creator accounts linked to a Facebook Page | Publishing to Feed and Stories (Stories publishing for business accounts), comment moderation, insights, mentions, hashtag search, business discovery (basic metadata/metrics of other professional accounts) | IG Business/Creator account linked to a Facebook Page; tasks mapped to the connected Page; user tokens | No consumer account access; ordering not supported; cursor‑based pagination; time‑based pagination only on User Insights; Stories publishing only for business accounts[^11][^3] |
| Instagram API with Instagram Login | Manage presence for IG Business/Creator accounts without requiring a Facebook Page link | Publish media, manage/reply to comments, media insights, identify @mentions, send/receive messages | IG Business/Creator account; user tokens | Does not include ads; cannot access tagging; scope names updated and old scopes deprecated Jan 27, 2025[^10] |
| Messaging via Messenger API for Instagram | Unified messaging across Instagram and Facebook Page | Send/receive messages; message webhooks; sender actions (typing/seen) | IG Business/Creator linked to Facebook Page (for Page‑backed accounts); appropriate permissions | Messaging scope and configuration required; see changelog for webhook and sender action updates in 2025[^3][^9] |
| Content Publishing API | Schedule/publish to Instagram Feed via developer apps | Publishing to Feed; part of Graph API surface | IG Business/Creator account; appropriate publishing permissions | N/A beyond Graph constraints[^2] |
| oEmbed Read | Embed Instagram content in third‑party properties | Read oEmbed responses for Instagram posts (read‑only embed) | Developer app; adherence to oEmbed read policies | Fields removed/updated Nov 3, 2025 (e.g., author_name, author_url, thumbnail_*); review embedding workflows[^9] |

These APIs enforce common constraints: professional account requirements, pagination behavior (cursor‑based), permission scopes, and, for some features, linkage to a Facebook Page. Developers should also plan for versioning, field renames, and metric changes introduced in 2025 (discussed below).[^11][^9]

### 2025 Changes and Deprecations Affecting Data Access

Meta introduced deprecations and new features that directly affect data models, metric availability, and migration paths:

- Deprecation of Instagram v1.0 API (May 20, 2025): Migrate calls to Instagram Platform endpoints; legacy “Instagram User/Media/Comment/Carousel” objects map to “IG User/IG Media (incl. carousels)/IG Comment.” Field names changed (e.g., follow_count → follows_count; taken_at → timestamp; content_type → media_type). Several legacy fields were removed or hidden.[^9]
- Insights metric changes (April 21, 2025): “views” became the primary consumption metric for media and user insights; “impressions” and “plays” were deprecated (with versioned behavior across v22.0+ and all versions). For media created on or after July 2, 2024, “impressions” requests return errors in later versions.[^9]
- oEmbed Read updates (November 3, 2025): Removal of author_name, author_url, thumbnail_url, thumbnail_width, thumbnail_height; automatic migration of existing apps to the new Meta oEmbed Read feature by this date.[^9]

To clarify impact and timing, Table 2 summarizes the 2025 changes.

Table 2: 2025 Instagram API changes—impact on data fields, metrics, and migration deadlines

| Change | Affected area | Summary of impact | Timeline |
|---|---|---|---|
| v1.0 deprecation | User/Media/Comment objects | Rename/migration to IG objects; field renames and removals; migration aid IDs available until May 20, 2025 | Deprecated May 20, 2025[^9] |
| “views” metric introduction | Media and User Insights | “views” becomes primary consumption metric; replaces deprecated “impressions/plays” in many contexts | Effective April 21, 2025; across versions[^9] |
| “impressions/plays” deprecation | Insights | Deprecated across media/user; errors for media created after July 2, 2024 (in v22.0+) | April 21, 2025 (versioned rollout)[^9] |
| oEmbed Read field removal | Embedding | Removal of author_name, author_url, thumbnail fields; Meta oEmbed Read replacement | November 3, 2025 (auto‑migration)[^9] |

### Instagram API with Instagram Login (formerly Creator Studio scope)

The Instagram API with Instagram Login enables professional accounts to publish media, moderate comments, retrieve media insights, identify @mentions, and manage messaging. It does not require linking to a Facebook Page. Scope values were updated and earlier names deprecated as of January 27, 2025; app owners should ensure the current scope set is used to avoid disruption.[^10]

### Instagram API with Facebook Login for Business (Graph API)

This API extends capabilities for page‑backed professional accounts: publishing to Feed and Stories (Stories publishing only for business accounts), comment moderation, insights, mentions, hashtag search, and business discovery (basic metadata/metrics of other professional accounts). The model relies on tasks assigned to the connected Facebook Page and enforces cursor‑based pagination (with time‑based pagination limited to User Insights). Consumer accounts are out of scope.[^11]

### Messaging via Messenger API for Instagram

The Messenger API integration supports messaging across Instagram and the connected Facebook Page, with message webhooks and sender actions (typing and seen indicators) introduced or updated in 2025. Implementations require appropriate permissions, configuration, and user tokens, and should align with the 2025 changelog for webhook and sender action changes.[^3][^9]

### Content Publishing API

Part of the Graph API surface, the Content Publishing API enables scheduling and publishing to Instagram Feed for professional accounts, subject to permissions and account type requirements.[^2]

### oEmbed Read

oEmbed Read provides read‑only embedding of Instagram posts. In 2025, fields were removed and the feature migrated to Meta oEmbed Read; teams must review their embedding logic and ensure compliance with updated field behavior.[^9]

## Instagram Creator Studio API: Status and Capabilities in 2025

The “Creator Studio API” as a separate product has been deprecated. Functionality now resides within the Instagram Platform—primarily via the Instagram API with Instagram Login and the Instagram API with Facebook Login for Business. The former capabilities—media publishing, comment moderation, insights, mentions, and messaging—are supported by these APIs, with scope updates effective January 27, 2025. Migration requires developers to adopt current scope names and endpoints.[^10][^3][^9]

To assist migration planning, Table 3 maps legacy Creator Studio‑aligned features to current endpoints and scopes.

Table 3: Mapping Creator Studio‑era capabilities to current Instagram Platform endpoints

| Legacy capability | Current API | Endpoint surface | Scope/permission notes | Notes |
|---|---|---|---|---|
| Publishing to Feed | Instagram API with Instagram Login; Graph API | Media publish endpoints | instagram_business_content_publish | Page linkage not required for Instagram Login; follow Graph rules for page‑backed publishing[^10][^11] |
| Comment moderation | Instagram API with Instagram Login; Graph API | Comments endpoints | instagram_business_manage_comments | Applies to media the app can access[^10][^11] |
| Media insights | Instagram API with Instagram Login; Graph API | Insights edges | Required insights permissions; metrics updated in 2025 (views) | “impressions/plays” deprecated; adopt “views”[^9] |
| Mentions | Instagram API with Instagram Login; Graph API | Mentions discovery | Standard mention permissions | Identify media where account is @mentioned[^10][^11] |
| Messaging | Messenger API for Instagram | Messaging/webhooks; sender actions | instagram_business_manage_messages | 2025 updates: message_edit webhook; sender actions[^9] |

## Meta Business API (Marketing API) Integration for Instagram

The Meta Business (Marketing) API complements the Instagram Platform by powering advertising use cases and account linkages. In 2025, references changed to align with the new IG object model and insights updates. Notably, “instagram_actor_id” moved to “instagram_user_id,” and “instagram_story_id” moved to “instagram_media_id.” Teams must update object references and complete migrations by September 9, 2025. Pages and IG Account linking requirements remain foundational, including support for Page‑backed IG accounts via the Pages API.[^9][^14]

Table 4 distills the 2025 field and endpoint changes most relevant to Instagram advertising and account management.

Table 4: Marketing API changes impacting Instagram references and deadlines

| Change area | Old reference | New reference | Impacted endpoints | Migration deadline |
|---|---|---|---|---|
| IG user actor ID | instagram_actor_id | instagram_user_id (IG User ID) | Ad creatives, ads, previews, account linkage queries | September 9, 2025[^9] |
| IG story ID | instagram_story_id | instagram_media_id (IG Media ID) | Ad creatives, ads, previews | September 9, 2025[^9] |
| Insights metrics | impressions/plays | views | Media/user insights reporting across products | April 21, 2025 (metrics); broader versioned rollouts[^9] |
| Object naming | Instagram User/Media/Comment | IG User/Media/Comment | Multiple endpoints across Graph and Marketing APIs | May 20, 2025 (v1.0 deprecation)[^9] |

## Instagram Business Tools and Partner Solutions

Meta’s badged partner directory is the official route to discover vetted partners, but the directory is login‑gated. Within the Instagram Platform, business tooling spans publishing to Feed and Stories, messaging via the Messenger API for Instagram, embedding content, and business discovery for professional accounts.[^12][^3] Integration guidance and examples frequently reference the Graph API’s page‑backed model and tasks, reinforcing the importance of Business Manager setup and Page‑IG account linkages for many features.[^11]

Table 5 summarizes partner program signals and tooling features.

Table 5: Partner program signals and business tooling

| Area | What it covers | Access considerations | Notes |
|---|---|---|---|
| Badged partner directory | Meta‑vetted partners across solution categories | Login‑gated; partner tier and certifications visible to logged‑in users | Use to shortlist vendors for procurement diligence[^12] |
| Business tools in Instagram Platform | Publishing (Feed/Stories), messaging, mentions, insights, embedding, business discovery | Requires IG professional accounts; for page‑backed features, link to Facebook Page; appropriate permissions | Stories publishing limited to business accounts; cursor pagination; time‑based pagination only on User Insights[^11] |

## Third‑Party Instagram Analytics Services: Data Sources and Capabilities

Third‑party platforms vary widely in features and data depth. Most provide multi‑network analytics and reporting, with some adding competitive analysis, influencer campaign tracking, and social listening. While the exact data provenance is not always public, leading tools typically integrate via official APIs for owned‑account metrics and supplement with public signals for discovery and competitive features.

A representative landscape includes:
- Sprout Social: Cross‑channel analytics, deep Instagram performance views, campaign tagging, listening, influencer discovery and ROI, and BI connectivity (Tableau connector).[^7]
- Hootsuite: Broad analytics coverage with custom dashboards, best‑time‑to‑post recommendations, benchmarking, and extensive Instagram metrics support.[^8]
- Buffer, Later: Scheduling‑centric with Instagram performance and story analytics; lighter on advanced reporting.[^8]
- Rival IQ, Iconosquare, Keyhole: Competitor analysis, reporting, influencer tracking, and hashtag analytics; often include downloadable reports and dashboards.[^7][^8]
- Panoramiq Insights: Detailed Instagram‑specific metrics and demographics for multiple accounts.[^8]

The table below contrasts capabilities and integration indicators across selected tools.

Table 6: Representative analytics tools—Instagram capabilities, data sources, and pricing signals

| Tool | Instagram analytics features | Competitive/listening | Typical data sources | Starting price signal |
|---|---|---|---|---|
| Sprout Social | Cross‑channel and IG‑specific analytics; campaign tagging; premium custom reporting; influencer ROI; BI connector | Listening for demographics/sentiment/share of voice; competitor tracking | Primarily official APIs; public signals for listening | Varies by plan; enterprise‑oriented tiers[^7] |
| Hootsuite | >120 social metrics; custom dashboards; best‑time‑to‑post; benchmarking | Competitor comparisons; industry benchmarks | Official APIs; public signals for benchmarking | From ~$99/month (indicative)[^8] |
| Buffer | Post and story analytics; scheduling | Limited listening/competitor features | Official APIs (owned‑account) | From ~$6/month per channel (indicative)[^8] |
| Later | Visual planning; performance tracking; link‑in‑bio analytics | Limited competitive features | Official APIs (owned‑account) | From ~$25/month (indicative)[^8] |
| Rival IQ | On‑demand analytics, alerts, custom reports; head‑to‑head competitor reports | Strong competitor analysis | Official APIs and public data | From ~$239/month (indicative)[^8] |
| Keyhole | Influencer campaign ROI reporting; hashtag and mention tracking | Competitor and influencer discovery | Mix of official APIs and public signals | From ~$89/month (indicative)[^7] |
| Iconosquare | >100 metrics; PDF/XLS reports; scheduled reports | Benchmarking; reputation monitoring | Primarily official APIs | From ~$79/month (indicative)[^8] |

Interpretation: For owned‑account reporting, third‑party tools largely mirror official API capabilities. The added value lies in cross‑channel consolidation, customizable reporting, and ready‑made dashboards. Competitive and listening features may rely on public web signals and should be scrutinized for ToS and privacy compliance.[^7][^8]

### Data Provenance and Compliance Considerations for Third‑Party Tools

To reduce risk, procurement should explicitly verify:
- Use of official APIs (Instagram Platform) for owned account data; absence of password sharing or behind‑login scraping; adherence to Meta developer policies.[^3][^4]
- Explicit handling of public data for competitor analysis and listening; ToS compliance; avoidance of personal data scraping.[^4][^5][^6]
- Transparency about rate‑limit strategies, caching, and historical backfills; clarity on metrics definitions post‑2025 changes (e.g., shift to “views”).[^9]

## Web Scraping Considerations and Legal Implications

Web scraping sits outside official channels and is governed by a complex mix of contract (ToS), copyright, privacy law, and computer misuse statutes. Instagram’s ToS expressly prohibits automated access without permission, circumventing controls, and trading in obtained data—regardless of login state.[^4] Legal precedents distinguish public vs. behind‑login data, but ToS exposure persists.

What the case law allows vs. forbids:
- Public data scraping: U.S. rulings have generally held that scraping publicly available data does not violate the Computer Fraud and Abuse Act (CFAA). However, courts also recognize that ToS can be enforceable, particularly when users accept terms or bypass controls.[^5][^6][^15]
- Behind‑login scraping: Accessing authenticated areas and ignoring ToS creates breach of contract and potential anti‑circumvention exposure.[^4][^5]
- Personal data: Collecting PII without lawful basis violates privacy regimes (e.g., GDPR, CCPA), triggering significant penalties.[^5]
- Copyright and database rights: Republishing images, videos, and structured content can trigger infringement claims; even where facts are not copyrightable, expression and selection/arrangement may be protected.[^6]

Table 7 synthesizes the legal landscape, key cases, and compliance controls.

Table 7: Legal landscape summary—cases, rulings, and practical controls

| Case/principle | Jurisdiction | Key ruling/insight | Compliance takeaway |
|---|---|---|---|
| HiQ Labs v. LinkedIn | U.S. | Scraping public profiles did not violate CFAA; later restrictions on fake accounts and privacy controls | Public data scraping may be permissible under CFAA, but ToS and anti‑circumvention risks remain; avoid bypass and fake accounts[^5][^6] |
| Meta v. Bright Data | U.S. | Court ruled scraping public Facebook/Instagram data did not violate ToS where no behind‑login access occurred | Public data scraping can avoid CFAA violation; ToS still poses contractual risk; avoid personal data[^15] |
| Ryanair v. PR Aviation (context) | EU (Dutch court) | Website cannot automatically bind visitors to browsewrap terms | Browsewrap enforceability is uncertain; logged‑in acceptance makes ToS stronger; seek counsel for any scraping plan[^5] |
| Meta enforcement program | U.S./Global | Aggressive legal action against data scraping; injunctions obtained | Expect platform enforcement; avoid high‑volume scraping and personal data extraction[^16] |

### Compliance Controls and Best Practices for Scraping

- Restrict to publicly accessible pages without login; avoid personal data and copyrighted media republishing; respect robots.txt and ToS where feasible.[^5][^6]
- Implement technical guardrails: rate limiting, polite spacing, user‑agent transparency, and IP rotation within reasonable bounds; avoid overwhelming servers and triggering anti‑bot defenses.[^5]
- Maintain legal review: for any PII, behind‑login areas, or commercial reuse of media, secure explicit permission or rely on official APIs.[^5][^6]

## Instagram Terms of Service: Data Usage Prohibitions and Enforcement

Instagram’s ToS expressly forbids:
- Creating accounts or accessing/collecting information in an automated way without Instagram’s express permission.
- Circumventing or overriding technological measures that control access to the Service or data.
- Selling, licensing, or purchasing any account or data obtained from Instagram, regardless of whether the user is logged in.[^4]

API usage is subject to the Meta Platform Terms and Developer Policies. Enforcement may include account restrictions, legal actions, and platform measures. Teams must align any data acquisition approach with these terms and privilege official channels for first‑party data needs.[^4]

## Comparative Analysis: Pros and Cons of Each Approach

This section compares the six approaches across legality, reliability, scope, scalability, and cost/complexity. The matrix in Table 8 summarizes the trade‑offs.

Table 8: Approach comparison matrix

| Approach | Data scope | Reliability | Legal/ToS risk | Scalability | Cost/complexity | Typical use cases |
|---|---|---|---|---|---|---|
| Official Meta APIs | Owned‑account publishing, messaging, comments, insights, mentions, hashtag search, business discovery; embedding via oEmbed | High | Low when compliant | High (pagination/versioned) | Medium (setup, permissions, migrations) | First‑party analytics, publishing, customer messaging[^3][^11][^9] |
| Creator Studio API (deprecated; migrate) | Covered by Instagram Platform (publishing, comments, insights, mentions, messaging) | High (post‑migration) | Low | High | Medium | Same as official APIs, migrating to current scopes/endpoints[^10][^9] |
| Meta Business API | Advertising and account linkages; updates to IG object references | High | Low | High | Medium/High (ad ops complexity) | Paid media analytics and operations; account linking[^9][^14] |
| Third‑party tools | Owned‑account analytics; reporting; some competitor/listening | High for owned; variable for public features | Medium (depends on provenance) | High | Medium (vendor cost) | Consolidated reporting, competitor benchmarking, listening[^7][^8] |
| Web scraping | Public data only; no personal data | Variable | High (ToS, privacy, copyright) | Variable (anti‑bot challenges) | Low/Medium | Limited public research; avoid PII; use cautiously[^4][^5][^6][^15] |
| Partner solutions | Vetted vendors across solutions | High (when badged) | Low | High | Medium/High (procurement) | End‑to‑end social operations, managed services[^12][^3] |

Interpretation: Official APIs remain the default for compliance and reliability. Third‑party tools add operational convenience and cross‑channel views but introduce vendor dependency. Scraping offers the broadest theoretical reach, but with significant ToS, privacy, and copyright risks; teams should avoid it for sensitive or personal data and reserve it for narrow public research, if at all.

## Recommendations and Implementation Roadmap

1) Prioritize official APIs for owned‑account data and operations. Choose the Instagram API with Instagram Login for account‑level features without Page linkage, and the Instagram API with Facebook Login for business discovery, hashtag search, and page‑backed tasks. Publish via Content Publishing, manage comments, and use the Messenger API for Instagram for unified messaging. Adopt the 2025 “views” metric and plan migrations for v1.0 deprecations.[^10][^11][^9]

2) Vet third‑party platforms for official API integration and data provenance. Confirm their use of Instagram Platform endpoints, absence of password sharing, and compliance with Meta developer policies. For competitive and listening features, verify that only public data is used and that personal data is excluded.[^7][^8][^3]

3) Avoid scraping personal data and behind‑login content; if scraping public pages for research, implement strong compliance controls and seek legal review. Respect robots.txt and ToS, limit request rates, and avoid republishing copyrighted media.[^5][^6][^4]

4) For ad‑centric use cases, align with the Meta Business (Marketing) API. Update code to use instagram_user_id and instagram_media_id; complete migrations by September 9, 2025. Confirm Pages and IG account linkages and validate reporting against the new insights model.[^9][^14]

5) Build resilience against policy changes. Track the changelog, version upgrades, and field deprecations; subscribe to updates and test in staging. Maintain a dependency matrix for scopes, endpoints, and metric definitions.[^9]

To operationalize migration, Table 9 outlines a practical checklist.

Table 9: Migration checklist—actions, owners, and deadlines

| Action | Owner | Dependencies | Deadline |
|---|---|---|---|
| Map v1.0 endpoints to Instagram Platform endpoints; rename fields per 2025 changes | Engineering | App tokens; IG account type; pagination rules | May 20, 2025 (complete migration)[^9] |
| Replace “impressions/plays” with “views” in analytics; handle versioned deprecations | Data/Analytics | Metric definitions; historical backfill logic | April 21, 2025 (metrics change)[^9] |
| Review and test oEmbed Read behavior; remove deprecated fields | Engineering | Embedding components; CMS | November 3, 2025 (field removal)[^9] |
| Update Marketing API references to instagram_user_id and instagram_media_id | Engineering/Ad Ops | Ad account linkage; IG object IDs | September 9, 2025 (deadline)[^9] |
| Audit third‑party tools for official API use and metrics alignment | Procurement/Engineering | Vendor documentation; security review | Rolling; complete before renewal[^7][^8] |
| Legal review of any scraping plans; implement robots/ToS‑respecting controls | Legal/Security | Public data scope; PII handling | Before any scraping activity[^5][^6][^4] |

## Appendices

### Appendix A: Deprecated vs. New Insights Metrics (2025)

Table 10: Deprecated vs. new metrics—replacement guidance

| Deprecated metric | Object | Replacement | Notes |
|---|---|---|---|
| impressions | Media/User | views | “views” is primary consumption metric; impressions deprecated with versioned behavior; errors for media created after July 2, 2024 (v22.0+)[^9] |
| plays | Media | views | Deprecated for media insights; adopt “views” across versions[^9] |
| clips_replays_count | Media | views | Deprecated; align on “views” for consumption[^9] |
| ig_reels_aggregated_all_plays_count | Media | views | Deprecated; use “views” for Reels insights[^9] |

### Appendix B: Quick Reference—Key Endpoints and Capabilities

Table 11: Endpoint‑to‑capability map

| Capability | Primary endpoints/objects | Notes |
|---|---|---|
| Publishing to Feed/Stories | Media publish edges (Graph; Instagram Login) | Stories publishing only for business accounts; permissions required[^11][^10] |
| Comment moderation | Comments edges | Manage/reply to comments on accessible media[^10][^11] |
| Insights | Media and User Insights edges | “views” metric; pagination differences (User Insights supports time‑based pagination)[^11][^9] |
| Mentions | Mentions discovery | Identify media where account is @mentioned[^10][^11] |
| Hashtag search | Hashtag discovery | Business discovery context; Facebook Login for Business[^11] |
| Messaging | Messenger API for Instagram | Webhooks; sender actions (typing/seen); 2025 updates[^9][^3] |
| Embedding | oEmbed Read | Fields removed/updated Nov 3, 2025; Meta oEmbed Read[^9] |

### Appendix C: Glossary

- IG User: The current object for Instagram user entities in the Instagram Platform, replacing “Instagram User” from v1.0.[^9]  
- IG Media: The current object for Instagram media, including carousels; replaces “Instagram Media/Carousel.”[^9]  
- IG Comment: The current object for comments; replaces “Instagram Comment.”[^9]  
- Business Discovery: API feature enabling basic metadata/metrics for other Instagram Business/Creator accounts under certain conditions.[^11]  
- oEmbed Read: Read‑only embedding of Instagram content in third‑party sites; updated by Meta in 2025 with field removals.[^9]

## References

[^1]: Instagram APIs | Facebook for Developers. https://developers.facebook.com/products/instagram/apis/  
[^2]: Instagram Platform – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/  
[^3]: Instagram Platform Overview – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/overview/  
[^4]: Terms of Use – Instagram Help Center. https://help.instagram.com/581066165581870/  
[^5]: Is Web Scraping Legal? The Complete Guide for 2025 – ScraperAPI. https://www.scraperapi.com/web-scraping/is-web-scraping-legal/  
[^6]: The legality of web scraping: what you need to know in 2025 – Thordata. https://www.thordata.com/blog/api/web-scraping-legal  
[^7]: 12 of the best social media analytics tools for your brand in 2025 – Sprout Social. https://sproutsocial.com/insights/social-media-analytics-tools/  
[^8]: 21 social media analytics tools to boost your strategy in 2025 – Hootsuite. https://blog.hootsuite.com/social-media-analytics-tools/  
[^9]: Changelog – Instagram Platform – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/changelog/  
[^10]: Instagram API with Instagram Login – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/  
[^11]: Instagram API with Facebook Login for Business – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/  
[^12]: Meta’s Business Partner Directory – Facebook. https://www.facebook.com/business/partner-directory  
[^13]: Instagram Media Insights – Meta for Developers. https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights/  
[^14]: Pages and IG Account Linking Guide – Meta for Developers. https://developers.facebook.com/docs/instagram/ads-api/guides/pages-ig-account#pbia  
[^15]: California court rules Meta’s terms do not prohibit scraping of public data – Zyte Blog. https://zyte.com/blog/california-court-meta-ruling/  
[^16]: Taking Legal Action Against Data Scraping – About Meta. https://about.fb.com/news/2020/10/taking-legal-action-against-data-scraping/