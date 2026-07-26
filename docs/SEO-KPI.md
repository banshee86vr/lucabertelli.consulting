# SEO & AI discoverability - validation checklist and KPIs

Use this after deploy to verify the implementation and track reachability over time.

## What the site exposes

| Surface | URLs | Notes |
|---------|------|-------|
| Home | `/en/`, `/it/` | H1 carries the primary query terms |
| Services hub | `/en/services/`, `/it/servizi/` | Lists all seven services |
| Service pages | 7 per language | Localized slugs, e.g. `/it/servizi/consulenza-devops/` vs `/en/services/devops-consulting/` |
| Blog index | `/en/blog/`, `/it/blog/` | Links every tag page |
| Blog articles | 4 per language | |
| Blog tag pages | 14 per language | `/‹lang›/blog/tag/‹tag›/` |
| Legal | privacy, cookies | |
| Feeds | `/en/rss.xml`, `/it/rss.xml` | |
| Agent summary | `/llms.txt` | Generated at build from the content collections |

That is **60 indexable HTML pages**, all present in the sitemap.

## Post-deploy validation (manual)

1. **Redirect**: Open `https://lucabertelli.consulting/` - expect **308** (or browser redirect) to `/en/`.
2. **Robots**: `/robots.txt` - lists the sitemap and explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others).
3. **Sitemap**: `/sitemap-index.xml` and the linked `sitemap-0.xml` - 60 URLs with `lastmod`, `changefreq` and `priority`.
4. **Alternate languages**: view source on `/it/servizi/consulenza-devops/` - the `en` alternate must point to `/en/services/devops-consulting/`, and the reverse must hold. Localized slugs are resolved through `src/i18n/routes.ts`; a new service added without a slug entry there will break this pairing.
5. **Structured data**: run the [Rich Results Test](https://search.google.com/test/rich-results) on the home page, one service page and one article. Expect `Person`, `ProfessionalService` and `WebSite` everywhere, plus `Service` + `FAQPage` + `BreadcrumbList` on services, `BlogPosting` + `BreadcrumbList` on articles, and `CollectionPage` on the hub and tag pages.
6. **FAQ rich results**: service pages are the candidates. Confirm the questions are parsed and free of errors.
7. **Social previews**: Share Debugger - the OG image must load and title/description must match the page.
8. **Feeds**: `/it/rss.xml` and `/en/rss.xml` must validate and list the articles of that language only.
9. **llms.txt**: `/llms.txt` must list the current services, articles and certifications. It is generated at build, so a stale entry means a content collection was not updated.

## Search Console (recommended)

- Submit the **sitemap**: `https://lucabertelli.consulting/sitemap-index.xml`.
- Monitor **Coverage / Pages**: indexed count against the 60 URLs above.
- Watch **International targeting**: hreflang issues should stay **0**. The localized service slugs are the most likely source of a regression here.
- Track **Queries / Pages** for the service URLs specifically, not only the home page.

## KPIs (review monthly)

| Metric | Where | Goal |
|--------|--------|------|
| Indexed core URLs | URL Inspection / Coverage | All service pages plus both blog indexes indexed |
| Position for "consulente devops", "consulenza kubernetes", "platform engineering" | Search Console queries | Entering the first pages, then improving |
| Impressions on service pages | Search Console, filtered by page | Upward trend; they start from zero |
| Click-through rate on branded + service queries | Search Console | Slow upward trend |
| Rich result errors | Rich Results Test / GSC | Zero critical errors |
| Referrals from AI assistants | Analytics (referrer contains `chat.openai.com`, `perplexity`, etc.) | Directional only; noisy |

## Off-page work, which the code cannot do

On-page optimisation makes the site eligible to rank for these queries, where previously there was no URL to rank at all. Ranking also depends on signals that have to be established outside the repository:

- Submit the sitemap to **Google Search Console** and **Bing Webmaster Tools**.
- Link the service pages from the **LinkedIn** profile, the **GitHub** profile and any conference or meetup bio.
- Ask past clients for references that link to the relevant service page rather than the home page.
- Keep publishing: four articles per language is thin for the competitiveness of these queries.

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
