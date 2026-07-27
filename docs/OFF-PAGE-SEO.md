# Off-page SEO checklist (manual)

On-page work in the repo makes URLs eligible to rank. These steps happen outside
GitHub and usually matter more for competitive consulting queries than another
thin landing page.

## 1. Search engines

After each production deploy that adds or renames URLs:

1. Open [Google Search Console](https://search.google.com/search-console) for
   `lucabertelli.consulting`.
2. Submit (or re-submit) the sitemap:
   `https://lucabertelli.consulting/sitemap-index.xml`
3. Use **URL Inspection** on at least:
   - `/it/servizi/consulenza-devops/`
   - `/it/servizi/consulenza-kubernetes/`
   - `/it/servizi/consulenza-agenti-ai/`
   - `/it/approfondimenti/kubernetes-consultant/`
4. Repeat in [Bing Webmaster Tools](https://www.bing.com/webmasters) with the
   same sitemap.
5. Confirm legacy service slugs **308** (example:
   `/it/servizi/ai-engineering/` → `/it/servizi/consulenza-agenti-ai/`).

## 2. LinkedIn profile

Prefer deep links to service pages over the home page alone.

Suggested Featured / Experience links (Italian profile):

| Label | URL |
| --- | --- |
| Consulenza DevOps | https://lucabertelli.consulting/it/servizi/consulenza-devops/ |
| Consulenza Kubernetes | https://lucabertelli.consulting/it/servizi/consulenza-kubernetes/ |
| Platform Engineering | https://lucabertelli.consulting/it/servizi/consulenza-platform-engineering/ |
| Governance agenti AI | https://lucabertelli.consulting/it/servizi/consulenza-agenti-ai/ |
| Tutti i servizi | https://lucabertelli.consulting/it/servizi/ |

Short About blurb (IT):

> Consulente DevOps e Platform Engineering freelance in Italia e in UE.
> Aiuto team Fintech, Insurtech e industriali su Kubernetes, CI/CD sicuro,
> piattaforme interne e governance degli agenti AI.
> Servizi: https://lucabertelli.consulting/it/servizi/

English About blurb:

> Freelance DevOps and Platform Engineering consultant across Italy and the EU.
> I help Fintech, Insurtech and industrial teams with Kubernetes, secure CI/CD,
> internal platforms and AI agent governance.
> Services: https://lucabertelli.consulting/en/services/

When you publish a field guide under `/approfondimenti/` (EN: `/insights/`),
share that URL first and mention the matching service page in the post body.
Do not file those guides under the engineering blog.

## 3. GitHub profile

In the profile README (`banshee86vr/.github` or the profile repo), link services
explicitly — not only the consulting site root.

Example block:

```md
### Consulting
- [DevOps consulting](https://lucabertelli.consulting/en/services/devops-consulting/)
- [Kubernetes consulting](https://lucabertelli.consulting/en/services/kubernetes-consulting/)
- [Platform Engineering](https://lucabertelli.consulting/en/services/platform-engineering-consulting/)
- [AI agent governance](https://lucabertelli.consulting/en/services/ai-agent-governance/)
- [All services](https://lucabertelli.consulting/en/services/)
```

Pin repositories that support the narrative (Omastx, Snorlx, Krabbx, vCluster
experiments) and mention the related article URLs in those README files when
relevant.

## 4. Credly / conference bios

Replace a bare personal site URL with the service that matches the talk:

- Kubernetes / CKA talk → `/…/consulenza-kubernetes/` or `/…/kubernetes-consulting/`
- Vault / supply chain → `/…/consulenza-secdevops-cicd/` or `/…/secdevops-cicd-consulting/`
- Platform / IDP talk → Platform Engineering service URL

## 5. Client references

When asking for a public reference, request a link to the **service page that
matches the engagement**, not only the home page. One contextual backlink beats
three generic homepage mentions.

## 6. Cadence

- Re-check Search Console coverage monthly (see `docs/SEO-KPI.md`).
- Publish or substantially update commercial content at least quarterly.
- After renaming a slug, keep the 308 in `LEGACY_SERVICE_SLUGS` and re-inspect
  the old URL until Google shows the redirect as recognised.
