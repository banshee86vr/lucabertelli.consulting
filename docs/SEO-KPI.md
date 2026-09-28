# SEO & AI discoverability - validation checklist and KPIs

Use this after deploy to verify the implementation and track reachability over time.

## What the site exposes

| Surface | URLs | Notes |
|---------|------|-------|
| Home | `/en/`, `/it/` | H1 carries the primary query terms |
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
- `robots.txt` allows every answer engine and training crawler explicitly; the
  robots meta lifts snippet limits (`max-snippet:-1`) so engines may quote a
  full passage; JSON-LD names the person, the practice and the topics with the
  same words used in the copy; `/llms.txt` and `/llms-full.txt` give an agent
  the whole site in one fetch.
- `lastmod` in the sitemap is derived from content dates (frontmatter
  `date`/`updated`, otherwise the last commit touching the source), not from
  the build time, so engines can trust it when deciding what to recrawl.

## Post-deploy validation (manual)

1. **Redirect**: Open `https://lucabertelli.consulting/` - expect **308** (or browser redirect) to `/en/`.
2. **Robots**: `/robots.txt` - lists the sitemap and explicitly allows search, answer-engine and training crawlers (Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot, GPTBot, ClaudeBot, Google-Extended and others). Check that Cloudflare's *AI Crawl Control* / *Block AI bots* setting is **off** or in *allow* mode for this zone, or the file is overridden at the edge.
3. **Sitemap**: `/sitemap-index.xml` and the linked `sitemap-0.xml` - every indexable HTML URL with `lastmod`, `changefreq` and `priority`. `lastmod` must differ between pages: articles keep their publication or `updated` date, service pages the date of their last commit.
3b. **IndexNow**: `pnpm run submit:indexnow` once the deploy is live. It checks the key file, reads the live sitemap and pushes every URL; expect `200` or `202`.
4. **Alternate languages**: view source on `/it/servizi/consulenza-devops/` - the `en` alternate must point to `/en/services/devops-consulting/`, and the reverse must hold. Localized slugs are resolved through `src/i18n/routes.ts`; a new service added without a slug entry there will break this pairing.
5. **Structured data**: run the [Rich Results Test](https://search.google.com/test/rich-results) on the home page, one service page and one article. Expect `Person`, `ProfessionalService` and `WebSite` everywhere, plus `Service` + `FAQPage` + `BreadcrumbList` on services, `BlogPosting` + `BreadcrumbList` on articles, and `CollectionPage` on the hub and tag pages.
6. **FAQ rich results**: service pages are the candidates. Confirm the questions are parsed and free of errors.
7. **Social previews**: Share Debugger - the OG image must load and title/description must match the page.
8. **Feeds**: `/it/rss.xml` and `/en/rss.xml` must validate and list the articles of that language only.
9. **llms.txt**: `/llms.txt` must list the current services (with their FAQ questions), guides, articles and certifications, and `/llms-full.txt` must carry their full text. Both are generated at build, so a stale entry means a content collection was not updated.
10. **Assistant check**: ask ChatGPT (with search), Perplexity and Google AI mode `who is Luca Bertelli consultant` and `consulente cyber resilience act italia`; note whether the site is cited and which page. Repeat monthly; this is the only direct signal of AI reachability.

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
| Citations by AI assistants for the queries above | Manual monthly check (see step 10) | Site cited on at least the branded and CRA queries |
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
