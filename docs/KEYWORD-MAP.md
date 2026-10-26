# Keyword and prompt map

This file maps observed search demand to the page that should answer it, and lists the prompts used to check whether AI assistants cite the site. It complements [SEO-KPI.md](./SEO-KPI.md) (what to measure) and [OFF-PAGE-SEO.md](./OFF-PAGE-SEO.md) (work outside the repo).

## How to use this map

- One intent cluster maps to one URL. Variants of the same intent (synonyms, "freelance", "Italia", a city name) never get their own page: Google treats that pattern as doorway or scaled content, and `.cursor/rules/seo.mdc` forbids keyword-permutation URLs.
- The primary term of a cluster belongs in the title, the H1 and the slug. Secondary variants belong in H2 headings, FAQ questions and the first paragraph under a heading. A question heading is answered in its first two sentences, because that is the passage search snippets and assistants quote.
- The `keywords` frontmatter field is an internal checklist. Google does not use meta keywords for ranking.
- New guides go in the `insights` collection in both languages, following `.cursor/rules/seo.mdc`.
- Re-run the demand collection quarterly and replace the "Observed queries" cells. Once Search Console has data, its queries and positions take precedence over autocomplete.

## Data status (2026-10-26)

Demand signal: Google Autocomplete (`suggestqueries.google.com`, `client=firefox`) and Bing Autosuggest (`api.bing.com/osjson.aspx`), markets `hl=it&gl=it` / `it-IT` and `hl=en&gl=gb` / `en-GB`, for about 230 seed queries. Autocomplete proves that people type a query; it does not say how often. "No suggestions" means the volume is too low to register. Fill in volumes from Google Keyword Planner or Bing Webmaster Tools keyword research when available.

Search Console and Bing Webmaster Tools: no verification token is visible. The apex has no `google-site-verification` or `msvalidate` TXT record, no verification meta tag is rendered, and `public/` has no verification file. Google re-checks the token periodically and drops ownership when it disappears, so treat both properties as not verified. Until they are, there is no ranking or query data and every priority below is a hypothesis. The first action in the backlog fixes this.

## Findings that change priorities

1. **Italian commercial queries have almost no measurable demand.** "consulente kubernetes", "consulenza devops", "consulenza platform engineering", "consulenza devsecops", "kubernetes in produzione", "sicurezza agenti ai" and "corso kubernetes aziendale" return no suggestions on either engine. Keep them in titles and H1s, because the few people who type them are buyers and assistants match on them, but growth has to come from informational and regulatory queries that lead into the service pages.
2. **Regulatory demand in Italian is large and mostly unanswered by the site.** NIS2, AI Act and DORA each produce full suggestion lists ("nis2 a chi si applica", "ai act cosa devono fare le aziende", "regolamento dora a chi si applica"). NIS2 appears in one SecDevOps FAQ and in passing on the CRA pages, DORA once in passing, and the AI Act nowhere.
3. **The Italian AI page never says "intelligenza artificiale".** Italian demand is phrased as "consulenza AI per aziende", "consulenza AI per PMI", "consulenza AI Act", "intelligenza artificiale per aziende" and "agenti AI per aziende". No page on the site contains "intelligenza artificiale", "per aziende" or "AI Act".
4. **Comparison queries are strong in both languages.** "kubernetes vs openshift", "eks vs aks vs gke", "argo cd vs flux", "gitlab ci vs github actions", "devops vs sre", "backstage alternatives", "knowledge graph vs vector database". The site has one comparison (Platform Engineering vs DevOps), and it does not cover SRE.
5. **The brand query is ambiguous.** "luca bertelli" autocompletes to a clothing brand and to several other people. Bios, anchor text and profiles should always pair the name with the role ("Luca Bertelli, Cloud Native and Platform Engineering consultant") so engines and assistants resolve the right entity.
6. **"DORA" has two meanings.** In Italian it is the EU regulation (2022/2554); in English DevOps queries ("devops maturity model dora") it is the DevOps Research and Assessment metrics. Copy that uses both must disambiguate on first use.

## Map per service

Coverage legend: **T** title or seoTitle, **H** H2/H3 heading, **F** FAQ question, **D** description or tagline, **body** text only, **none** not on the site.

### DevOps

`/it/servizi/consulenza-devops/` and `/en/services/devops-consulting/`

| Cluster | Observed queries | Coverage | Action |
| --- | --- | --- | --- |
| Commercial | IT: consulente devops, consulenza devops, devops freelance. EN: devops consultant, devops consulting services, devops freelancer, hire devops freelancer | T, D, F | Keep |
| Price | IT: quanto costa un devops. EN: devops consultant hourly rate, devops hourly rate | F | Decide whether to publish a day-rate band; assistants quote numbers when a page gives them |
| Role | IT: devops engineer cosa fa, cosa fa un devops, devops cos'è. EN: devops consultant vs devops engineer | F (role); none (definition) | Add a short "Che cos'è DevOps, in pratica" FAQ in IT, answered in two sentences |
| Assessment | EN: devops maturity assessment, devops maturity model, devops assessment framework, devops assessment questionnaire | body ("assessment"); none ("maturity") | H2 or FAQ on the assessment phase using "DevOps maturity assessment" and the four DORA (DevOps Research and Assessment) metrics, in both languages |
| Comparison | IT: devops vs sre, devops vs platform engineering, gitops vs devops. EN: platform engineering vs devops vs sre | Insight (no SRE) | Extend the Platform Engineering vs DevOps insight with SRE (see backlog) |

### Cloud migration

`/it/servizi/consulenza-cloud-migrazione/` and `/en/services/cloud-migration-consulting/`

| Cluster | Observed queries | Coverage | Action |
| --- | --- | --- | --- |
| Commercial | IT: consulente cloud, consulenza cloud (almost no suggestions). EN: cloud migration consultant, cloud migration consulting services | T | Keep |
| Strategy | IT: strategie di migrazione al cloud, piano di migrazione al cloud. EN: cloud migration strategy 6 Rs, lift and shift, replatform | body (wave plan) | Name the 6 Rs (rehost, replatform, refactor, repurchase, retire, retain) in an H2 or FAQ |
| Cost | IT: finops cos'è. EN: finops consultant, cloud cost optimization strategies, cloud cost optimization audit | none ("FinOps") | Use "FinOps" in the cost-governance H2 and FAQ; the deliverable already is FinOps |
| Sovereignty | IT: cloud sovrano italia, cloud sovrano europeo. EN: sovereign cloud europe, cloud repatriation trends, cloud repatriation case study | none on this page | Extend "Conviene sempre migrare tutto in cloud?" to cover sovereign cloud and repatriation |
| Public sector | IT: migrazione cloud pa, migrazione al cloud pnrr, misura 1.2 migrazione al cloud | none | Decision: only worth a guide if public-sector work is a target |

### Platform Engineering

`/it/servizi/consulenza-platform-engineering/` and `/en/services/platform-engineering-consulting/`

| Cluster | Observed queries | Coverage | Action |
| --- | --- | --- | --- |
| Commercial | IT: consulenza platform engineering (no suggestions). EN: platform engineering consulting (weak) | T | Keep |
| Definition | internal developer platform, internal developer platform examples, open source, tools, architecture | T, F, D | Add examples and open-source tools to the IDP FAQ answer |
| Portal choice | backstage alternatives, backstage alternatives open source, backstage vs port, backstage vs cortex | F ("Usate Backstage?") | Name the alternatives in that FAQ; candidate guide "Backstage or not" |
| Comparison | platform engineering vs devops vs sre, platform engineer vs devops engineer, platform team vs devops team, platform team team topologies | Insight (no SRE, no Team Topologies) | Same SRE extension as DevOps; mention Team Topologies where the insight describes platform teams |
| Ambiguous term | golden path (autocomplete is Dune, Far Cry, Chemical Brothers) | D, H in insight | Never use "golden path" alone as a target; always pair it with platform engineering |

### Kubernetes

`/it/servizi/consulenza-kubernetes/` and `/en/services/kubernetes-consulting/`

| Cluster | Observed queries | Coverage | Action |
| --- | --- | --- | --- |
| Commercial | IT: consulente/consulenza kubernetes (no suggestions). EN: kubernetes consulting services, kubernetes consulting companies, best kubernetes consulting companies, kubernetes security consulting, hire kubernetes experts | T | Keep; "best ... companies" is won through directories and lists (OFF-PAGE-SEO.md), not on-page |
| Definition | IT: kubernetes cos'è, kubernetes a cosa serve, cluster kubernetes cos è | none | Candidate IT-first guide "Kubernetes: a cosa serve e quando non conviene", linking to the service and the "Quando serve un consulente Kubernetes" insight |
| Managed platforms | EN: eks vs aks vs gke, eks vs aks pricing, eks auto mode vs gke autopilot, managed vs self managed kubernetes | F (managed vs self-managed) | Comparison guide EKS vs AKS vs GKE |
| Distributions | kubernetes vs openshift, openshift vs kubernetes which is better, differences, security | none | Comparison guide OpenShift vs Kubernetes |
| GitOps | argo cd vs flux, argo cd vs fluxcd | none ("Flux") | Comparison guide Argo CD vs Flux |
| Day 2 | kubernetes upgrade strategy, upgrade without downtime, kubernetes multi tenancy (capsule, namespaces, isolation), kubernetes cost optimization tools, kubernetes security audit tools | D, H (multi-tenancy); body (upgrade, cost); none ("audit") | FAQ on upgrade strategy; use "security audit" next to "hardening"; link the Omastx article on fleet drift |

### SecDevOps and CI/CD

`/it/servizi/consulenza-secdevops-cicd/` and `/en/services/secdevops-cicd-consulting/`

| Cluster | Observed queries | Coverage | Action |
| --- | --- | --- | --- |
| Commercial | IT: consulenza devsecops (no suggestions). EN: devsecops consulting services, devsecops consultant | T | Keep |
| Definition | devsecops cos'è, devsecops vs secdevops, secdevops meaning | F | Keep |
| Pipeline security | ci/cd security checklist, ci/cd security gates, ci/cd security best practices, ci/cd pipeline security | D; none ("checklist") | Add a "CI/CD security checklist" H2 with a short list; checklists are quoted by assistants |
| Supply chain | software supply chain security best practices, slsa framework, slsa provenance, sbom cyclonedx, sast vs dast | H, D; none ("SLSA") | Name SLSA levels and provenance in the deliverables |
| Secrets | secrets management best practices, secrets management in kubernetes, hashicorp vault alternatives | H, F, D | Mention Kubernetes secrets and alternatives in the secrets FAQ |
| Tool choice | gitlab ci vs github actions, gitlab vs github differenza, convert gitlab ci to github actions | none | Comparison guide GitLab CI vs GitHub Actions (GitLab certifications plus the Snorlx article make this credible) |

### Cyber Resilience Act

`/it/servizi/consulenza-cyber-resilience-act/` and `/en/services/cyber-resilience-act-compliance/`, plus the CRA insight

| Cluster | Observed queries | Coverage | Action |
| --- | --- | --- | --- |
| Scope | cyber resilience act a chi si applica, cyber resilience act software as a service, open source software | F (scope); body (SaaS, open source) | Promote SaaS and open source to their own FAQ questions |
| Dates | cyber resilience act quando entra in vigore, 11 settembre 2026, deadline 2026, timeline, 2027 | H in insight | Keep the insight current; bump `updated` on each revision |
| SBOM | cra sbom requirements, cra sbom format, cyber resilience act sbom format | F, D | Keep |
| Checklist | cyber resilience act compliance checklist, requirements list, requirements standards mapping enisa | none ("checklist") | Add a compliance checklist H2 to the insight in both languages |
| Penalties | cyber resilience act non compliance penalties | F | Keep |
| Official text | cyber resilience act italiano pdf, testo, eur lex | none (no EUR-Lex link on the site) | Link EUR-Lex where the regulation is first named |

### Training

`/it/servizi/formazione-devops-cloud-native/` and `/en/services/devops-cloud-native-training/`

| Cluster | Observed queries | Coverage | Action |
| --- | --- | --- | --- |
| Courses IT | corso kubernetes italiano, corso docker e kubernetes, corso devops italiano | body | H2 or FAQ that says "corso Kubernetes in italiano per team aziendali" explicitly; "italiano" is the observed modifier |
| Corporate IT | formazione kubernetes, formazione devops, corso kubernetes aziendale, formazione finanziata informatica | no suggestions | Keep current titles; no extra effort |
| Courses EN | kubernetes training, cka training, terraform training, kubernetes workshop, platform engineering training, devsecops training | T, D (training); none ("workshop") | Use "workshop" and "CKA training" in FAQ answers |
| AI Act literacy | IT: ai act formazione obbligatoria, ai act obbligo formazione, ai act corso formazione, corso intelligenza artificiale per aziende | none | Decision: only if AI literacy training for technical teams becomes part of the offer |

### AI agent governance

`/it/servizi/consulenza-agenti-ai/` and `/en/services/ai-agent-governance/`

| Cluster | Observed queries | Coverage | Action |
| --- | --- | --- | --- |
| Commercial IT | consulenza ai per aziende, consulenza ai per pmi, consulenza ai act, consulenza intelligenza artificiale pmi, società di consulenza intelligenza artificiale | body ("consulenza AI"); none ("intelligenza artificiale", "per aziende") | Rework seoTitle, description and tagline to carry "consulenza AI", "aziende" and "agenti AI"; use "intelligenza artificiale" in the first paragraph |
| Definition IT | agenti ai cosa sono e come funzionano, agenti ia cosa sono, agenti ai per aziende | T, F, D ("agenti AI") | Add a two-sentence "Che cosa sono gli agenti AI" answer near the top |
| Regulation | IT: ai act obblighi aziende, ai act obblighi deployer, ai act obblighi di trasparenza, governance ai act. EN: ai act compliance checklist | none | FAQ on what the AI Act asks of a company deploying agents (engineering side: logging, human oversight, transparency); full guide in the backlog |
| Commercial EN | ai agent governance framework, ai governance consulting services, ai agent consulting services, agentic ai governance framework | T, D | Add "AI agent governance framework" as an H2 |
| Security | ai agent security risks, ai agent security best practices, mcp server security best practices, mcp server security risks, owasp | F (risks); none ("MCP security") | FAQ "How do you secure an MCP server?" in both languages |
| Cost | llm cost optimization, llm cost tracking, llm cost per token | F, D | Keep |

### Knowledge graphs

`/it/servizi/consulenza-knowledge-graph/` and `/en/services/knowledge-graph-consulting/`

| Cluster | Observed queries | Coverage | Action |
| --- | --- | --- | --- |
| Commercial | knowledge graph consulting (weak, autocomplete suggests "knowledge graph companies"); IT: knowledge graph aziendale (no suggestions) | T | Keep |
| Definition | knowledge graph cos'è, knowledge graph ai, knowledge graph llm | F | Keep |
| RAG | knowledge graph vs vector database, knowledge graph vs vector database for rag, graphrag vs rag, graphrag vs knowledge graph, knowledge graph rag | body in insight only; none ("vector") | FAQ "Knowledge graph or vector database?" naming GraphRAG, in both languages |
| Agent memory | ai agent memory architecture, ai agent memory graph, knowledge graph for ai agents, zep temporal knowledge graph | F, D ("memoria"); body ("agent memory") | H2 "Memory architecture for AI agents" on the EN page; mirror in IT |
| Temporal | temporal knowledge graph (mostly academic: completion, forecasting, reasoning) | T, F, D | Keep; the commercial angle is the agent-memory cluster above |

## New guides suggested by the data

Each is an insight in both languages, explaining the engineering side and stating that it is not legal advice, the way the CRA pages already do.

| Guide | Observed queries (IT / EN) | relatedServices |
| --- | --- | --- |
| NIS2 technical measures | nis2 cos'è, nis2 a chi si applica, nis2 requisiti tecnici, nis2 requisiti minimi, nis2 soggetti importanti, acn nis2 / nis2 compliance checklist, nis2 compliance requirements | secdevops, cyber-resilience-act, devops, kubernetes |
| DORA for engineering teams | regolamento dora a chi si applica, regolamento dora ivass, dora banca d'italia, dora fornitori ict / dora ict risk management framework, dora third party risk management, dora resilience testing, dora vs nis2 | secdevops, devops, cloud, kubernetes |
| AI Act for teams deploying agents | ai act cosa devono fare le aziende, ai act obblighi aziende, ai act obblighi deployer / ai act compliance checklist, ai act compliance assessment | ai-engineering, training, knowledge-graphs |
| Comparisons | kubernetes vs openshift, eks vs aks vs gke, argo cd vs flux, gitlab ci vs github actions | kubernetes, platform-engineering, secdevops |

## Prompt set for AI assistants

Run monthly on ChatGPT with search, Perplexity, Google AI Mode, Microsoft Copilot and Claude with web search. Record whether the site is cited and which URL. When it is not, note which pages are cited instead and what their first paragraph answers. Prompts marked "(planned)" target a guide that does not exist yet; they measure the baseline before publication.

| ID | Prompt | Expected page |
| --- | --- | --- |
| P01 | Chi è Luca Bertelli, consulente cloud native? | `/it/` |
| P02 | Consulente DevOps freelance in Italia: chi posso contattare? | DevOps IT |
| P03 | Quanto costa un consulente DevOps freelance in Italia? | DevOps IT, price FAQ |
| P04 | Cerco un consulente Kubernetes certificato CKA in Italia per mettere in sicurezza i nostri cluster | Kubernetes IT |
| P05 | Meglio Kubernetes gestito (EKS, AKS, GKE) o self-managed per un'azienda italiana? | Kubernetes IT FAQ |
| P06 | Platform engineering e DevOps: che differenza c'è e quale serve alla mia azienda? | Platform vs DevOps insight IT |
| P07 | Serve una internal developer platform con Backstage a un'azienda con 50 sviluppatori? | Platform Engineering IT |
| P08 | Il Cyber Resilience Act si applica al nostro software SaaS? Cosa dobbiamo fare? | CRA IT |
| P09 | Che formato deve avere la SBOM per il Cyber Resilience Act? | CRA IT FAQ |
| P10 | Consulenza per adeguarsi al Cyber Resilience Act in Italia, lato tecnico | CRA IT |
| P11 | Quali misure tecniche richiede la NIS2 per lo sviluppo software e le pipeline CI/CD? | SecDevOps IT FAQ, NIS2 guide (planned) |
| P12 | Sono il CTO di una fintech: cosa cambia con DORA per pipeline, change management e fornitori cloud? | DORA guide (planned), regulated-industries insight |
| P13 | Consulenza AI per aziende: come introdurre agenti AI in modo sicuro? | AI IT |
| P14 | Cosa richiede l'AI Act a un'azienda che usa agenti AI? | AI IT FAQ, AI Act guide (planned) |
| P15 | Come si mette in sicurezza un server MCP aziendale? | AI IT FAQ |
| P16 | Corso Kubernetes in italiano per un team aziendale, sui nostri strumenti | Training IT |
| P17 | Migrazione al cloud: da dove si comincia e quanto dura? | Cloud IT FAQ |
| P18 | Knowledge graph o database vettoriale per dare memoria agli agenti AI? | Knowledge graphs IT |
| P19 | Consulente DevSecOps in Italia per la gestione dei segreti con HashiCorp Vault | SecDevOps IT |
| P20 | Consulenza DevOps per fintech e insurtech in Italia | Regulated-industries insight IT |
| P21 | Freelance DevOps consultant in the EU with fintech experience | DevOps EN |
| P22 | DevOps consultant hourly rate in Europe | DevOps EN, price FAQ |
| P23 | Best Kubernetes consulting firms in Italy | Kubernetes EN |
| P24 | EKS vs AKS vs GKE for a regulated company | Comparison guide (planned) |
| P25 | Argo CD vs Flux for GitOps | Comparison guide (planned) |
| P26 | Platform engineering vs DevOps vs SRE | Platform vs DevOps insight EN |
| P27 | Backstage alternatives for an internal developer platform | Platform Engineering EN |
| P28 | Cyber Resilience Act compliance checklist for software vendors | CRA insight EN |
| P29 | Does the Cyber Resilience Act apply to open source and SaaS? | CRA EN |
| P30 | NIS2 technical requirements for CI/CD pipelines | SecDevOps EN, NIS2 guide (planned) |
| P31 | DORA ICT risk management framework: what engineering teams must implement | DORA guide (planned) |
| P32 | AI agent governance framework for enterprises | AI EN |
| P33 | MCP server security best practices | AI EN FAQ |
| P34 | Temporal knowledge graph for AI agent memory | Knowledge graphs EN |
| P35 | Knowledge graph vs vector database for RAG | Knowledge graphs EN FAQ |
| P36 | Who is Luca Bertelli, Kubernetes and platform engineering consultant? | `/en/` |

Tracking row format, one per prompt and engine:

| Date | Engine | ID | Cited | Cited URL | Other sources cited |
| --- | --- | --- | --- | --- | --- |
| 2026-11-01 | Perplexity | P10 | no | | |

## Backlog derived from this map

1. Verify a Search Console Domain property with a DNS TXT record in Cloudflare, submit the sitemap, and import the property into Bing Webmaster Tools. After four to six weeks, export queries and positions and re-rank this backlog.
2. Copy changes on existing pages, no new URLs: the AI page (Italian query terms, AI Act and MCP security FAQs), Cloud (FinOps, sovereign cloud, 6 Rs), Kubernetes (upgrade strategy, security audit), SecDevOps (CI/CD security checklist, SLSA), Knowledge graphs (vector database and GraphRAG FAQ), DevOps (maturity assessment), CRA (SaaS and open source FAQs, checklist), Training ("in italiano", workshop, CKA). Titles stay unique and under about 60 characters, descriptions between 120 and 160.
3. Guides on NIS2, DORA and the AI Act, engineering side, both languages.
4. SRE and Team Topologies in the Platform Engineering vs DevOps insight, with a bumped `updated` date.
5. Comparison guides: EKS vs AKS vs GKE, Argo CD vs Flux, GitLab CI vs GitHub Actions, OpenShift vs Kubernetes.
6. Open decisions: public-sector cloud migration content (PNRR), AI Act literacy training, a published day-rate band.
