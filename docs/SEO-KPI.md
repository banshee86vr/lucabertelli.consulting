# SEO & AI discoverability - validation checklist and KPIs

Use this after deploy to verify the implementation and track reachability over time.

## What the site exposes

| Surface | URLs | Notes |
|---------|------|-------|
| Home | `/en/`, `/it/` | H1 carries the primary query terms |
| Services hub | `/en/services/`, `/it/servizi/` | Lists all eight services |
| Service pages | 8 per language | Localized slugs with commercial intent in the path, e.g. `/it/servizi/consulenza-agenti-ai/` vs `/en/services/ai-agent-governance/` |
| Blog index | `/en/blog/`, `/it/blog/` | Engineering notes only |
| Blog articles | 4 per language | Tooling / OSS write-ups |
| Blog tag pages | per distinct tag × language | `/‹lang›/blog/tag/‹tag›/` |
| Insights hub | `/en/insights/`, `/it/insights/` | Commercial field guides (not the blog) |
| Insight pages | 4 per language | Kubernetes consultant, PE vs DevOps, regulated industries, knowledge graphs |
| Legal | privacy, cookies | |
| Feeds | `/en/rss.xml`, `/it/rss.xml` | Blog only |
| Agent summary | `/llms.txt` | Generated at build from the content collections |

Current inventory: **72 indexable HTML pages**. Re-confirm with
`pnpm run verify:seo` after a fresh build whenever content or routes change.

## Post-deploy validation (manual)

1. **Redirect**: Open `https://lucabertelli.consulting/` - expect **308** (or browser redirect) to `/en/`.
2. **Robots**: `/robots.txt` - lists the sitemap and explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others).
3. **Sitemap**: `/sitemap-index.xml` and the linked `sitemap-0.xml` - every indexable HTML URL with `lastmod`, `changefreq` and `priority`.
4. **Alternate languages**: view source on `/it/servizi/consulenza-devops/` - the `en` alternate must point to `/en/services/devops-consulting/`, and the reverse must hold. Localized slugs are resolved through `src/i18n/routes.ts`; a new service added without a slug entry there will break this pairing.
5. **Structured data**: run the [Rich Results Test](https://search.google.com/test/rich-results) on the home page, one service page and one article. Expect `Person`, `ProfessionalService` and `WebSite` everywhere, plus `Service` + `FAQPage` + `BreadcrumbList` on services, `BlogPosting` + `BreadcrumbList` on articles, and `CollectionPage` on the hub and tag pages.
6. **FAQ rich results**: service pages are the candidates. Confirm the questions are parsed and free of errors.
7. **Social previews**: Share Debugger - the OG image must load and title/description must match the page.
8. **Feeds**: `/it/rss.xml` and `/en/rss.xml` must validate and list the articles of that language only.
9. **llms.txt**: `/llms.txt` must list the current services, articles and certifications. It is generated at build, so a stale entry means a content collection was not updated.

## Search Console (recommended)

- Submit the **sitemap**: `https://lucabertelli.consulting/sitemap-index.xml`.
- Monitor **Coverage / Pages**: indexed count against the 72 URLs above.
- Watch **International targeting**: hreflang issues should stay **0**. The localized service slugs are the most likely source of a regression here.
- Track **Queries / Pages** for the service URLs specifically, not only the home page.

## KPIs (review monthly)

| Metric | Where | Goal |
|--------|--------|------|
| Indexed core URLs | URL Inspection / Coverage | All service pages, insights hub/pages and both blog indexes indexed |
| Position for "consulente devops", "consulenza kubernetes", "consulenza platform engineering", "governance agenti AI", "consulenza knowledge graph" | Search Console queries | Entering the first pages, then improving |
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
