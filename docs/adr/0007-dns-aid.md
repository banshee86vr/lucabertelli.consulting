# 0007: Publish DNS-AID service bindings under _agents

- Status: Accepted
- Date: 2026-10-26

## Context

Agents can already fetch the A2A card, the MCP card, and the skills index over HTTPS. [draft-mozleywilliams-dnsop-dnsaid-02](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/02/) also asks for those endpoints in DNS, under `_agents`, as ServiceMode SVCB or HTTPS records (RFC 9460). The isitagentready scan queries `_index._agents`, `_a2a._agents`, and `_mcp._agents` for both record types and requires a DNSSEC-validated answer. The draft's custom SvcParam names (`cap`, `bap`, `policy`, `well-known`) have no IANA numbers yet. RFC 9460 says unpublished keys are written as `keyNNNNN`.

## Decision

The zone `lucabertelli.consulting` publishes ServiceMode HTTPS and SVCB records, priority 1, TTL 3600, at `_index._agents`, `_a2a._agents`, and `_mcp._agents`. The target is `lucabertelli.consulting`, because that name is on the certificate. `alpn` is `h2` and `port` is 443, and those two registered keys are the only `mandatory` keys. The agent protocol is private-use `key65402` (`a2a,mcp` on the index, `a2a` or `mcp` on the protocol name). `key65400` is the capability URL. `key65409` is the well-known path (`agent-skills/index.json`, `agent-card.json`, or `mcp/server-card.json`). The index also carries `key65403` for `https://lucabertelli.consulting/auth.md`. Those numbers are the dns-aid-core private-use assignments in the RFC 9460 range 65280-65534, not IANA registrations. `cap-sha256` is omitted so a later edit of a document does not make the DNS pin lie. DNSSEC live signing is enabled for the whole zone. Cloudflare Registrar publishes the DS record from the CDS record. That scan is not immediate.

## Alternatives considered

- `alpn=a2a` or `alpn=mcp`. The edge negotiates `h2`. A client that offered only the agent token would fail the TLS handshake.
- Named parameters `bap` and `well-known`. They are not in the SvcParamKeys registry, so a resolver cannot encode them except as `keyNNNNN`.
- One record type only. The scanner queries HTTPS and SVCB separately. A missing type is a miss for that query.
- A hostname such as `agent.lucabertelli.consulting`. It is not on the certificate, and the HTTP paths already live on the apex.
- Signing only the `_agents` names. Cloudflare signs the zone. A label cannot be signed on its own.
- Pinning `key65401` (`cap-sha256`). The pin would go stale on the next content edit, and a consumer that checks it would refuse the document.

## Consequences

Validating resolvers return authenticated data after the parent DS matches this zone's DNSKEY. Until that DS is published, the zone still resolves and the signatures are served, but the AD bit stays unset. Turning DNSSEC off later means removing the DS at the registrar before deleting the DNSKEY. If IANA assigns different numbers, these `keyNNNNN` values have to be replaced. The records are in the Cloudflare zone, not in the site build.
