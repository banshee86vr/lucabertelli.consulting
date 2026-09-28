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
   - `/it/servizi/consulenza-knowledge-graph/`
   - `/it/insights/kubernetes-consultant/`
   - `/it/insights/light-knowledge-graphs/`
4. Repeat in [Bing Webmaster Tools](https://www.bing.com/webmasters) with the
   same sitemap. Bing's index is what ChatGPT search, Microsoft Copilot,
   DuckDuckGo and Ecosia read, so for AI reachability this step matters as much
   as Google. Bing Webmaster Tools can import the verified Search Console
   property in one click.
5. Run `pnpm run submit:indexnow` from the repository. It pushes every sitemap
   URL to IndexNow (Bing, Yandex, Naver, Seznam); Bing typically recrawls
   within minutes. Run it after every deploy that changes or adds pages.
6. Confirm legacy service slugs **308** (example:
   `/it/servizi/ai-engineering/` → `/it/servizi/consulenza-agenti-ai/`).
7. In the Cloudflare dashboard for the zone, open **Security → AI Crawl
   Control** (formerly *Block AI bots*) and make sure the answer engines and
   training crawlers listed in `public/robots.txt` are **allowed**. The edge
   setting wins over the file: a "block" there silently removes the site from
   ChatGPT, Perplexity and Claude answers regardless of what the repo says.

## 1b. AI assistants

Assistants do not have a submission form; they cite what search engines
return and what they have seen during training. The levers you control:

- **Be indexed on Bing and Google** (steps above). No index entry, no citation.
- **Say the same thing everywhere.** Name, role ("Cloud Native and Platform
  Engineering consultant"), location (Italy, EU) and the list of services
  should match across the site, LinkedIn headline, GitHub bio, Medium bio and
  Credly. Assistants resolve the entity by consistency; a LinkedIn headline
  still saying "DevOps Engineer" competes with the site.
- **Publish where models read.** Medium and GitHub READMEs are heavily
  crawled; each write-up there should link the matching service or insight URL
  once, in the first paragraph, with the plain service name as anchor text.
- **Check monthly.** Ask ChatGPT (search on), Perplexity and Google AI mode
  the queries in `docs/SEO-KPI.md` step 10 and record whether the site is
  cited. When it is not, look at which pages *are* cited and what question
  they answer in their first paragraph.

## 2. LinkedIn profile

Prefer deep links to service pages over the home page alone.

Suggested Featured / Experience links (Italian profile):

| Label | URL |
| --- | --- |
| Consulenza DevOps | https://lucabertelli.consulting/it/servizi/consulenza-devops/ |
| Consulenza Kubernetes | https://lucabertelli.consulting/it/servizi/consulenza-kubernetes/ |
| Platform Engineering | https://lucabertelli.consulting/it/servizi/consulenza-platform-engineering/ |
| Governance agenti AI | https://lucabertelli.consulting/it/servizi/consulenza-agenti-ai/ |
| Consulenza knowledge graph | https://lucabertelli.consulting/it/servizi/consulenza-knowledge-graph/ |
| Conformità Cyber Resilience Act | https://lucabertelli.consulting/it/servizi/consulenza-cyber-resilience-act/ |
| Tutti i servizi | https://lucabertelli.consulting/it/servizi/ |

Headline: use the role as it appears on the site - "Cloud Native and Platform
Engineering Consultant | Kubernetes, CI/CD, Cyber Resilience Act" - so the
profile and the site describe the same person in the same words.

Short About blurb (IT):

> Consulente Cloud Native e Platform Engineering freelance in Italia e in UE.
> Aiuto team Fintech, Insurtech e industriali su Kubernetes, CI/CD sicuro,
> piattaforme interne, governance degli agenti AI e temporal knowledge graph.
> Servizi: https://lucabertelli.consulting/it/servizi/

English About blurb:

> Freelance Cloud Native and Platform Engineering consultant across Italy and the EU.
> I help Fintech, Insurtech and industrial teams with Kubernetes, secure CI/CD,
> internal platforms, AI agent governance and temporal knowledge graphs.
> Services: https://lucabertelli.consulting/en/services/

When you publish a field guide under `/insights/`, share that URL first and
mention the matching service page in the post body. Do not file those guides
under the engineering blog.

## 3. GitHub profile

In the profile README (`banshee86vr/.github` or the profile repo), link services
explicitly - not only the consulting site root.

Example block:

```md
### Consulting
- [DevOps consulting](https://lucabertelli.consulting/en/services/devops-consulting/)
- [Kubernetes consulting](https://lucabertelli.consulting/en/services/kubernetes-consulting/)
- [Platform Engineering](https://lucabertelli.consulting/en/services/platform-engineering-consulting/)
- [AI agent governance](https://lucabertelli.consulting/en/services/ai-agent-governance/)
- [Knowledge graph consulting](https://lucabertelli.consulting/en/services/knowledge-graph-consulting/)
- [Cyber Resilience Act compliance](https://lucabertelli.consulting/en/services/cyber-resilience-act-compliance/)
- [All services](https://lucabertelli.consulting/en/services/)
```

Pin repositories that support the narrative (Omastx, Snorlx, Krabbx, vCluster
experiments) and mention the related article URLs in those README files when
relevant.

## 4. Credly / conference bios

Replace a bare personal site URL with the service that matches the talk:

- Kubernetes / CKA talk → `/…/consulenza-kubernetes/` or `/…/kubernetes-consulting/`
- Vault / supply chain → `/…/consulenza-secdevops-cicd/` or `/…/secdevops-cicd-consulting/`
- SBOM / CRA / product security → `/…/consulenza-cyber-resilience-act/` or `/…/cyber-resilience-act-compliance/`
- Platform / IDP talk → Platform Engineering service URL
- Knowledge graph / MCP / agent-ready platforms → `/…/consulenza-knowledge-graph/` or `/…/knowledge-graph-consulting/`

## 5. Client references

When asking for a public reference, request a link to the **service page that
matches the engagement**, not only the home page. One contextual backlink beats
three generic homepage mentions.

## 6. Cadence

- Re-check Search Console coverage monthly (see `docs/SEO-KPI.md`).
- Publish or substantially update commercial content at least quarterly.
- After renaming a slug, keep the 308 in `LEGACY_SERVICE_SLUGS` and re-inspect
  the old URL until Google shows the redirect as recognised.
