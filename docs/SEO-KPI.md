# SEO & AI discoverability - validation checklist and KPIs

Use this after deploy to verify the implementation and track reachability over time.

## What the site exposes

| Surface | URLs | Notes |
|---------|------|-------|
| Home | `/en/`, `/it/` | H1 carries the primary query terms. The response `Link` header (RFC 8288) points at the API catalog, OpenAPI description, API docs, and `llms.txt` |
| Services hub | `/en/services/`, `/it/servizi/` | Lists all nine services |
| Service pages | 9 per language | Localized slugs with commercial intent in the path, e.g. `/it/servizi/consulenza-cyber-resilience-act/` vs `/en/services/cyber-resilience-act-compliance/` |
| Blog index | `/en/blog/`, `/it/blog/` | Engineering notes only |
| Blog articles | 4 per language | Tooling / OSS write-ups |
| Blog tag pages | per distinct tag × language | `/‹lang›/blog/tag/‹tag›/` |
| Insights hub | `/en/insights/`, `/it/insights/` | Commercial field guides (not the blog) |
| Insight pages | 5 per language | Kubernetes consultant, PE vs DevOps, regulated industries, knowledge graphs, Cyber Resilience Act |
| Legal | privacy, cookies | |
| Feeds | `/en/rss.xml`, `/it/rss.xml` | Blog articles and insights of that language |
| Agent summary | `/llms.txt` | Index: identity, pages, FAQ questions per service; generated at build |
| Agent full text | `/llms-full.txt` | Full text of services (with FAQ), insights and articles; generated at build |
| IndexNow key | `/4601f867d99a0cb5aeda2cdbaf7f9321.txt` | Ownership token for `pnpm run submit:indexnow` |
| Security contact | `/.well-known/security.txt` | RFC 9116; `verify:seo` fails when `Expires` is within 30 days, bump it yearly |
| API catalog | `/.well-known/api-catalog` | RFC 9727 linkset. Spec at `/api/openapi.yaml`, docs at `/api/docs.md`, status at `/api/status.json`. `describedby` points at `/auth.md` |
| Agent registration | `/auth.md` | Public read-only. Anonymous access, no credential. Protected resource metadata at `/.well-known/oauth-protected-resource` and, for the English homepage, `/.well-known/oauth-protected-resource/en/`. `authorization_servers` lists `https://lucabertelli.cloudflareaccess.com` and this origin. Authorization server metadata at `/.well-known/oauth-authorization-server` (`issuer` is this origin). `GET` and `POST` `/agent/auth/register`, `/agent/auth/claim`, and `/agent/auth/revoke` describe that and change nothing |
| A2A Agent Card | `/.well-known/agent-card.json` | A2A 1.0 JSON. `supportedInterfaces` is JSON-RPC 1.0 at `/a2a/v1`. Skills match the nine English service pages. `capabilities.extensions` lists the AP2 merchant role at the v0.1 specification URI and the v0.1.0 URI. `required` is false. `SendMessage` refuses `ap2.mandates` data parts and does not take payment. Not an HTML route, so it is not one of the 76 sitemap URLs |
| Agent Skills | `/.well-known/agent-skills/index.json` | Discovery RFC v0.2.0. One skill, `consulting-practice`, type `skill-md`, at `/.well-known/agent-skills/consulting-practice/SKILL.md`. `digest` is the SHA-256 of that file. Not an HTML route, so it is not one of the 76 sitemap URLs |
| MCP Server Card | `/.well-known/mcp/server-card.json` | SEP-1649 JSON. `serverInfo.name` and `serverInfo.version`. Streamable HTTP at `/mcp`. `capabilities.tools` is true. `resources` and `prompts` are false. Not an HTML route, so it is not one of the 76 sitemap URLs |
| Web Bot Auth | `/.well-known/http-message-signatures-directory` | Ed25519 JWKS, media type `application/http-message-signatures-directory+json`. Not an HTML route, so it is not one of the 76 sitemap URLs |
| ACP discovery | `/.well-known/acp.json` | Agentic Commerce Protocol. `protocol.name` is `acp`, `protocol.version` is `2026-04-17`, `api_base_url` is `https://lucabertelli.consulting/acp`, `transports` is `rest`, `capabilities.services` is `checkout`. `POST /acp/checkout_sessions` does not create a session or store the body. Not an HTML route, so it is not one of the 76 sitemap URLs |
| UCP profile | `/.well-known/ucp` | Universal Commerce Protocol `2026-08-25`. `protocol_version`, `services` (`dev.ucp.shopping` REST at `/ucp/v1`), `capabilities` (`dev.ucp.shopping.checkout`), and `endpoints.rest`. `ucp.payment_handlers` is empty. `POST /ucp/v1/checkout-sessions` does not create a session or store the body. Not an HTML route, so it is not one of the 76 sitemap URLs |
| MPP discovery | `/openapi.json` | OpenAPI 3.1. `x-service-info.categories` is `developer-tools`. `POST /api/engagement` carries `x-payment-info` with `intent` `charge`, `method` `card`, `currency` `eur`, and `amount` null. The call returns 402 and does not settle a payment or store the body. Not an HTML route, so it is not one of the 76 sitemap URLs |
| WebMCP | HTML pages | `search_site`, `read_page`, and `navigate` register on page load through `document.modelContext`, or `navigator.modelContext` when that is the browser entry point. Not a separate URL, so the sitemap count stays 76 |
| DNS-AID | `_index._agents`, `_a2a._agents`, `_mcp._agents` | ServiceMode HTTPS and SVCB. Target is the apex. `alpn` is `h2`, port 443. Private-use keys: `key65400` capability URL, `key65402` agent protocol, `key65403` policy on the index, `key65409` well-known path. The zone is DNSSEC-signed. The parent DS is published by Cloudflare Registrar from the CDS record |

Current inventory: **76 indexable HTML pages**. Re-confirm with
`pnpm run verify:seo` after a fresh build whenever content or routes change.

## How people and assistants reach the site

Both audiences enter through the same door, so the work is shared:

- **Humans** type intent queries (`consulente devops`, `consulenza kubernetes`,
  `platform engineering consultant`, `cyber resilience act consulenza`) and
  question queries (`cosa fa un consulente devops`, `how much does a devops
  consultant cost`, `devops consultant vs engineer`). The service pages carry
  the intent term in H1, title and slug; the FAQ blocks carry the questions.
- **AI assistants** (ChatGPT search, Perplexity, Claude, Google AI Overviews,
  Copilot) retrieve from ordinary search indexes - Bing's for ChatGPT and
  Copilot, Google's for AI Overviews - then quote passages. That makes Bing
  indexing (IndexNow, Bing Webmaster Tools) as important as Google, and makes
  direct answers under question headings the unit of content that gets cited.
- `robots.txt` allows every answer engine and training crawler explicitly, and
  each user-agent group carries
  `Content-Signal: ai-train=yes, search=yes, ai-input=yes`; the robots meta
  lifts snippet limits (`max-snippet:-1`) so engines may quote a full passage;
  JSON-LD names the person, the practice and the topics with the same words
  used in the copy; `/llms.txt` and `/llms-full.txt` give an agent the whole
  site in one fetch.
- HTML pages negotiate Markdown. A request with `Accept: text/markdown` receives
  that URL as `text/markdown` (main content, frontmatter, and JSON-LD). Browsers
  still receive HTML.
- `/.well-known/api-catalog` is an RFC 9727 linkset for the public read-only
  documents (`/llms.txt`, the feeds, the sitemap, and `security.txt`).
  The catalog's `describedby` link points at `/auth.md`.
- The homepage response (`/`, `/en/`, `/it/`) sends an RFC 8288 `Link` header
  with `api-catalog`, `service-desc`, `service-doc`, and `describedby`.
  That header's `describedby` target is `/llms.txt`.
- `/auth.md` tells agents that access is anonymous. OAuth protected resource metadata and authorization server metadata are published for that discovery chain. The English homepage resource identifier is `/.well-known/oauth-protected-resource/en/`. `authorization_servers` lists Cloudflare Access and this origin. No credential is issued.
- `/.well-known/agent-card.json` is the A2A 1.0 Agent Card. `supportedInterfaces` lists JSON-RPC 1.0 at `/a2a/v1`. `SendMessage` returns a public message and does not create a task. `capabilities.extensions` lists the AP2 merchant role at `https://github.com/google-agentic-commerce/ap2/tree/v0.1` and `https://github.com/google-agentic-commerce/AP2/tree/v0.1.0`. `required` is false. This practice does not take payment.
- `/.well-known/agent-skills/index.json` is the Agent Skills discovery index. It lists `consulting-practice`. The artifact is `/.well-known/agent-skills/consulting-practice/SKILL.md`, and `digest` is the SHA-256 of that file.
- `/.well-known/mcp/server-card.json` is the MCP server card. `POST /mcp` is Streamable HTTP. `read_practice` returns the public index. Resources, prompts, and sessions are off.
- `/.well-known/http-message-signatures-directory` is the Web Bot Auth key directory. Outbound agent requests carry `Signature-Agent` and `Signature-Input` when the signing key is configured.
- `/.well-known/acp.json` is the ACP discovery document. `protocol.name` is `acp` and `protocol.version` is `2026-04-17`. `api_base_url` is `https://lucabertelli.consulting/acp`. `transports` is `rest`. `capabilities.services` is `checkout`. `POST /acp/checkout_sessions` does not create a session, does not take payment, and does not store the body.
- `/.well-known/ucp` is the UCP business profile. `protocol_version` is `2026-08-25`. `services` is `dev.ucp.shopping` over REST at `/ucp/v1`. `capabilities` is `dev.ucp.shopping.checkout`. `endpoints.rest` is that base. `ucp.payment_handlers` is empty. `POST /ucp/v1/checkout-sessions` does not create a session, does not take payment, and does not store the body.
- `/openapi.json` is the Machine Payment Protocol discovery document. `POST /api/engagement` is the payable operation. `x-payment-info.intent` is `charge`, `x-payment-info.method` is `card`, `x-payment-info.currency` is `eur`, and `x-payment-info.amount` is null. The call returns 402 and does not settle a charge or store the body.
- HTML pages register WebMCP tools on load: `search_site` reads `/llms.txt`, `read_page` returns the open page, and `navigate` opens a path on this origin. The entry point is `document.modelContext`, or `navigator.modelContext` when that is what the browser exposes.
- DNS-AID publishes ServiceMode HTTPS and SVCB at `_index._agents.lucabertelli.consulting`, `_a2a._agents.lucabertelli.consulting`, and `_mcp._agents.lucabertelli.consulting`. The target is the apex, `alpn` is `h2`, and the port is 443. `key65402` is the agent protocol. The zone is signed with DNSSEC.
- `lastmod` in the sitemap is derived from content dates (frontmatter
  `date`/`updated`, otherwise the last commit touching the source), not from
  the build time, so engines can trust it when deciding what to recrawl.

## Post-deploy validation (manual)

1. **Redirect**: Open `https://lucabertelli.consulting/` - expect **308** (or browser redirect) to `/en/`.
2. **Robots**: `/robots.txt` - lists the sitemap and explicitly allows search, answer-engine and training crawlers (Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot, GPTBot, ClaudeBot, Google-Extended and others). Every user-agent group declares `Content-Signal: ai-train=yes, search=yes, ai-input=yes`. Check that Cloudflare's *AI Crawl Control* / *Block AI bots* setting is **off** or in *allow* mode for this zone, or the file is overridden at the edge.
3. **Sitemap**: `/sitemap-index.xml` and the linked `sitemap-0.xml` - every indexable HTML URL with `lastmod`, `changefreq` and `priority`. `lastmod` must differ between pages: articles keep their publication or `updated` date, service pages the date of their last commit.
3b. **IndexNow**: `pnpm run submit:indexnow` once the deploy is live. It checks the key file, reads the live sitemap and pushes every URL; expect `200` or `202`.
4. **Alternate languages**: view source on `/it/servizi/consulenza-devops/` - the `en` alternate must point to `/en/services/devops-consulting/`, and the reverse must hold. Localized slugs are resolved through `src/i18n/routes.ts`; a new service added without a slug entry there will break this pairing.
5. **Structured data**: run the [Rich Results Test](https://search.google.com/test/rich-results) on the home page, one service page and one article. Expect `Person`, `ProfessionalService` and `WebSite` everywhere, plus `Service` + `FAQPage` + `BreadcrumbList` on services, `BlogPosting` + `BreadcrumbList` on articles, and `CollectionPage` on the hub and tag pages.
6. **FAQ rich results**: service pages are the candidates. Confirm the questions are parsed and free of errors.
7. **Social previews**: Share Debugger - the OG image must load and title/description must match the page.
8. **Feeds**: `/it/rss.xml` and `/en/rss.xml` must validate and list the articles of that language only.
9. **llms.txt**: `/llms.txt` must list the current services (with their FAQ questions), guides, articles and certifications, and `/llms-full.txt` must carry their full text. Both are generated at build, so a stale entry means a content collection was not updated.
10. **security.txt**: `/.well-known/security.txt` must return 200 as `text/plain` with a future `Expires`. Check it at [securitytxt.org](https://securitytxt.org/) after deploy. For a site selling CRA vulnerability-handling work, its absence would be noticed.
10b. **API catalog**: `/.well-known/api-catalog` must return 200 as `application/linkset+json`. The `service-desc`, `service-doc`, and `status` links must themselves return 200. The catalog's `describedby` link must return `/auth.md`.
10c. **Homepage Link header**: `curl -sI https://lucabertelli.consulting/en/` (and the `/` redirect, and `/it/`) includes `rel="api-catalog"`, `rel="service-desc"`, `rel="service-doc"`, and `rel="describedby"`. That header's `describedby` target is `/llms.txt`.
10d. **auth.md**: `/auth.md` must return 200 as `text/markdown` and the H1 must contain `auth.md`. `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` must return 200 as `application/json`. `/.well-known/oauth-protected-resource/en/` must return 200 with `resource` `https://lucabertelli.consulting/en/`. `authorization_servers` lists `https://lucabertelli.cloudflareaccess.com` first and this origin second. The authorization server `issuer` is `https://lucabertelli.consulting`. `agent_auth` describes anonymous access. `GET` and `POST` `/agent/auth/register` return the same JSON and do not create an account. A 401 includes `WWW-Authenticate` with `resource_metadata`. Public pages stay 200.
10e. **A2A Agent Card**: `/.well-known/agent-card.json` must return 200 as `application/json` with `name`, `description`, `version`, `supportedInterfaces` (JSON-RPC 1.0 at `https://lucabertelli.consulting/a2a/v1`), `capabilities`, and one skill per service (`id`, `name`, `description`, `tags`). `capabilities.extensions` lists `https://github.com/google-agentic-commerce/ap2/tree/v0.1` and `https://github.com/google-agentic-commerce/AP2/tree/v0.1.0`, each with `params.roles` `merchant` and `required` false. `POST /a2a/v1` `SendMessage` returns a message and does not create a task. A data part whose keys start with `ap2.mandates.` returns an unsupported-operation error and the body is not stored. After deploy, `POST https://isitagentready.com/api/scan` with `{"url":"https://lucabertelli.consulting"}` must report `checks.discovery.a2aAgentCard.status` of `pass`. Commerce checks stay neutral while `isCommerce` is false. When the scanner scores AP2, `checks.commerce.ap2.status` must be `pass`.
10f. **Agent Skills**: `/.well-known/agent-skills/index.json` must return 200 as `application/json` with `$schema` `https://schemas.agentskills.io/discovery/0.2.0/schema.json` and a `skills` entry for `consulting-practice` (`type` `skill-md`, `description`, `url`, `digest`). `GET` the skill URL must return that `SKILL.md` as `text/markdown`, and the SHA-256 of those bytes must equal `digest`. After deploy, the same scan must report `checks.discovery.agentSkills.status` of `pass`.
10g. **MCP Server Card**: `/.well-known/mcp/server-card.json` must return 200 as `application/json` with `serverInfo.name`, `serverInfo.version`, `transport.endpoint` `https://lucabertelli.consulting/mcp`, and `capabilities` (`tools` true, `resources` false, `prompts` false). `POST /mcp` `tools/call` `read_practice` returns the public index and does not store the body. After deploy, the same scan must report `checks.discovery.mcpServerCard.status` of `pass`.
10h. **WebMCP**: Open `/en/` in a browser that exposes `document.modelContext` or `navigator.modelContext`. The page registers `search_site`, `read_page`, and `navigate` on load. After deploy, `POST https://isitagentready.com/api/scan` with `{"url":"https://lucabertelli.consulting"}` must report `checks.discovery.webMcp.status` of `pass`.
10i. **DNS-AID**: `dig SVCB _index._agents.lucabertelli.consulting` and the matching HTTPS query return ServiceMode priority 1, target `lucabertelli.consulting`, `alpn=h2`, and `port=443`. The same shape is at `_a2a._agents` and `_mcp._agents`. A DNS-over-HTTPS answer from `https://cloudflare-dns.com/dns-query` has `AD` true once the parent DS is published. `POST https://isitagentready.com/api/scan` with `{"url":"https://lucabertelli.consulting"}` must report `checks.discoverability.dnsAid.status` of `pass`.
10j. **ACP discovery**: `/.well-known/acp.json` must return 200 as `application/json` with `protocol.name` `acp`, `protocol.version` `2026-04-17`, `api_base_url` `https://lucabertelli.consulting/acp`, `transports` including `rest`, and `capabilities.services` including `checkout`. `POST /acp/checkout_sessions` returns 400 and does not create a session or store the body. After deploy, `GET` that URL on the live origin must return the same document. Commerce checks on `POST https://isitagentready.com/api/scan` stay neutral while `isCommerce` is false. When the scanner scores ACP, `checks.commerce.acp.status` must be `pass`.
10k. **MPP discovery**: `GET /openapi.json` must return 200 as `application/json` with OpenAPI 3.1, `x-service-info.categories` including `developer-tools`, and `POST /api/engagement` carrying `x-payment-info.intent` `charge`, `x-payment-info.method` `card`, `x-payment-info.currency` `eur`, and `x-payment-info.amount` null, plus a `402` response. `POST /api/engagement` returns 402 and does not store the body. After deploy, `POST https://isitagentready.com/api/scan` with `{"url":"https://lucabertelli.consulting"}` must report `checks.commerce.mpp.status` of `pass` when the scanner scores MPP.
10l. **UCP profile**: `GET /.well-known/ucp` must return 200 as `application/json` with `protocol_version` `2026-08-25`, `services` `dev.ucp.shopping`, `capabilities` `dev.ucp.shopping.checkout`, `endpoints.rest` `https://lucabertelli.consulting/ucp/v1`, and `ucp.payment_handlers` empty. The spec and schema URLs in that document must return 200. `POST /ucp/v1/checkout-sessions` returns 400 and does not store the body. After deploy, `POST https://isitagentready.com/api/scan` with `{"url":"https://lucabertelli.consulting"}` must report `checks.commerce.ucp.status` of `pass` when the scanner scores UCP. Commerce checks stay neutral while `isCommerce` is false.
11. **Assistant check**: ask ChatGPT (with search), Perplexity and Google AI mode `who is Luca Bertelli consultant` and `consulente cyber resilience act italia`; note whether the site is cited and which page. Repeat monthly; this is the only direct signal of AI reachability.

## Search Console (recommended)

- Submit the **sitemap**: `https://lucabertelli.consulting/sitemap-index.xml`.
- Monitor **Coverage / Pages**: indexed count against the 76 URLs above.
- Watch **International targeting**: hreflang issues should stay **0**. The localized service slugs are the most likely source of a regression here.
- Track **Queries / Pages** for the service URLs specifically, not only the home page.

## KPIs (review monthly)

| Metric | Where | Goal |
|--------|--------|------|
| Indexed core URLs | URL Inspection / Coverage | All service pages, insights hub/pages and both blog indexes indexed |
| Position for "consulente devops", "consulenza kubernetes", "consulenza platform engineering", "consulenza cyber resilience act", "governance agenti AI", "consulenza knowledge graph" | Search Console queries | Entering the first pages, then improving |
| Bing indexed URLs and Bing impressions | Bing Webmaster Tools | All 76 URLs indexed; impressions on service URLs |
| Citations by AI assistants for the queries above | Manual monthly check (see step 11) | Site cited on at least the branded and CRA queries |
| Impressions on service pages | Search Console, filtered by page | Upward trend; they start from zero |
| Click-through rate on branded + service queries | Search Console | Slow upward trend |
| Rich result errors | Rich Results Test / GSC | Zero critical errors |
| Referrals from AI assistants | Analytics (referrer contains `chat.openai.com`, `perplexity`, etc.) | Directional only; noisy |

## Off-page work, which the code cannot do

On-page optimisation makes the site eligible to rank for these queries. Ranking
also depends on signals established outside the repository. Follow the
copy-paste checklist in [OFF-PAGE-SEO.md](./OFF-PAGE-SEO.md):

- Submit the sitemap to **Google Search Console** and **Bing Webmaster Tools**.
- Link service pages (not only the home page) from **LinkedIn**, **GitHub** and
  conference bios.
- Ask past clients for references that point at the matching service URL.
- Keep publishing commercial-intent articles that link back into `/servizi/` /
  `/services/`.

## Local checks

```bash
pnpm run build
pnpm run verify:seo
```

`verify:seo` ([scripts/verify-seo.mjs](../scripts/verify-seo.mjs)) inspects the build for broken internal links, JSON-LD that does not parse, non-reciprocal hreflang, missing canonicals, missing or duplicated `<h1>`, duplicate titles, and pages that drifted out of the sitemap. It exits non-zero on any finding.

For a visual pass:

```bash
python3 -m http.server 4321 --directory dist/client
```

Then spot-check `/it/`, `/it/servizi/`, one service page, `/it/blog/` and one tag page.
