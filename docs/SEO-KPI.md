# SEO & AI discoverability — validation checklist and KPIs

Use this after deploy to verify the implementation and track reachability over time.

## Post-deploy validation (manual)

1. **Redirect**: Open `https://lucabertelli.consulting/` — expect **308** (or browser redirect) to `/en/`.
2. **Robots**: `https://lucabertelli.consulting/robots.txt` — must list `Sitemap: https://lucabertelli.consulting/sitemap-index.xml`.
3. **Sitemap**: `https://lucabertelli.consulting/sitemap-index.xml` and linked `sitemap-0.xml` — must include `/en/`, `/it/`, blog, contact, privacy, cookies.
4. **Alternate languages**: View HTML source on `/en/contact/` — expect `<link rel="alternate" hreflang="it" …>` pointing to `/it/contact/` (and reverse on IT pages).
5. **Structured data**: Use Google [Rich Results Test](https://search.google.com/test/rich-results) on home and one blog article — JSON-LD should parse without errors (`Person`, `ProfessionalService`, `Service` on home; `BlogPosting` on articles).
6. **Social previews**: Share Debugger / manual check — OG image must load (`/about/lucabertelli.jpeg`), title and description match the page.
7. **llms.txt**: `https://lucabertelli.consulting/llms.txt` returns this file with key URLs and services.

## Search Console (recommended)

- Submit **sitemap**: `https://lucabertelli.consulting/sitemap-index.xml`.
- Monitor **Coverage / Pages**: indexed count vs important URLs.
- Watch **International targeting**: hreflang issues should stay **0**.
- Track **Queries / Pages** for `/en/` vs `/it/` and top blog URLs.

## KPIs (review monthly)

| Metric | Where | Goal |
|--------|--------|------|
| Indexed core URLs | URL Inspection / Coverage | Home + contact + both blogs + legal pages indexed |
| Click-through rate on branded + service queries | Search Console | Slow upward trend |
| Impressions / clicks by language | Search Console dimension | Balance reflects target markets |
| Rich result errors | Rich Results Test / GSC | Zero critical errors |
| Referrals from AI assistants | Analytics (referrer contains `chat.openai.com`, `perplexity`, etc.) | Directional only; noisy |

## Optional: analytics events

- Outbound clicks: `mailto:info@lucabertelli.consulting`, LinkedIn profile link.
- If a contact API is enabled later: form submit success as primary conversion.

## Local smoke test

```bash
pnpm run build && pnpm run preview
```

Then spot-check `/en/`, `/it/blog/`, and one article for titles, canonical, and JSON-LD in “View Source”.
