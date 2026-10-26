# 0013: Publish one ARD catalog at both well-known paths

- Status: Accepted
- Date: 2026-10-26

## Context

Agents look for a capability manifest before they call MCP, A2A, or an HTTP API. The isitagentready scan fetches `/.well-known/ai-catalog.json` and passes `checks.discovery.ard` when that document is JSON, names a host, and lists entries. ARD v0.91 tells a consumer to fetch `/.well-known/ard.json` and to treat the older path as optional. This origin already publishes the MCP server card, the A2A agent card, one Agent Skill, and two OpenAPI documents. It does not run a search registry, and it does not publish a `did:web` document.

## Decision

The Worker serves one catalog at `/.well-known/ai-catalog.json` and `/.well-known/ard.json`. The bytes match. `specVersion` is `1.0`, the AI Catalog data model. `host.displayName` is `Luca Bertelli Consulting`. `host.identifier` is `https://lucabertelli.consulting`. Five entries use `url` and do not inline `data`: the MCP server card (`application/mcp-server-card+json`), the A2A agent card (`application/a2a-agent-card+json`), the consulting-practice skill (`application/agent-skills+md`), `/api/openapi.yaml` (`application/vnd.oai.openapi+yaml`), and `/openapi.json` (`application/vnd.oai.openapi+json`). Each identifier is `urn:air:lucabertelli.consulting:<namespace>:<name>`. Each entry has three `representativeQueries`. `GET` and `HEAD` return 200 as `application/json` and allow any origin. `POST` returns 405. Both paths are in `run_worker_first`, and `_headers` sets the same type and CORS for the asset path. HTML pages link `rel="ai-catalog"` and `rel="ard"`. `robots.txt` publishes `Agentmap` for both URLs. The catalog is not an HTML route and is not in the sitemap.

## Alternatives considered

- Serving only `/.well-known/ai-catalog.json`. A consumer that follows ARD v0.91 and fetches only `/.well-known/ard.json` would miss the catalog.
- Serving only `/.well-known/ard.json`. The scan that reported this gap fetches the older path.
- `did:web:lucabertelli.consulting` as the host identifier. This origin does not serve `/.well-known/did.json`, so that identifier would not resolve.
- Inlining each artifact in `data`. The documents already have stable URLs, and a copy in the catalog would drift.
- Entries for ACP and UCP. Those documents have no media type in the ARD set, and the skill and `llms.txt` already name them.
- A `_search._agents` SRV record. This origin does not run an ARD search API. A `_catalog._agents` TXT record would be a DNS write outside this repository.

## Consequences

A client can fetch either well-known path and then the artifact URL on each entry. Adding a capability means adding an entry in the same change, with two to five queries. The two files must stay byte-identical; the discovery check fails if they diverge. The isitagentready scan of the live origin stays unchanged until this is deployed. DNS still does not advertise the catalog.
