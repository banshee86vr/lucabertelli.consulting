# 0008: Publish an ACP discovery document without a checkout store

- Status: Accepted
- Date: 2026-10-26

## Context

Agents look for an Agentic Commerce Protocol discovery document at `/.well-known/acp.json`. The isitagentready scan passes when that document is JSON and includes `protocol.name`, `protocol.version`, `api_base_url`, `transports`, and `capabilities.services`. The discovery RFC also requires `protocol.name` to be `acp`, `protocol.version` to be a `YYYY-MM-DD` date, `supported_versions` to be non-empty, and `transports` to include `rest`. The latest stable checkout spec in the ACP repository is `2026-04-17`. This origin is a public consulting practice. It has no product catalog, no payment handler, and no store for checkout sessions or idempotency keys.

## Decision

The Worker serves the discovery document at `/.well-known/acp.json`, and the same JSON is written into the build. `protocol.name` is `acp`. `protocol.version` and the only `supported_versions` entry are `2026-04-17`. `api_base_url` is `https://lucabertelli.consulting/acp`. `transports` is `rest`. `capabilities.services` is `checkout`. `documentation_url` is `https://lucabertelli.consulting/api/docs.md`. The response is public, unauthenticated, and cached for one hour. `GET /acp` returns the same document. Both paths, plus `/acp/*`, are in `run_worker_first`, so the static document cannot answer `POST`.

`POST /acp/checkout_sessions` returns 400 and does not create a session. The body is size-capped, discarded, and not copied into the reply. There is no idempotency store, because the refusal does not depend on the body. `GET` or `POST` of a session, including complete and cancel, returns 404. `orders`, `carts`, and `delegate_payment` are not listed, and those paths return 404. A local, private, or non-https `Origin` is rejected. The document is not an HTML route and is not in the sitemap.

## Alternatives considered

- A static document and no `/acp` handler. A client that follows `api_base_url` would receive an HTML 404.
- Listing `orders`, `delegate_payment`, and `carts`. Those requests carry payment credentials or order state this origin must not accept.
- Persisting checkout sessions and idempotency keys. The checkout spec asks for 24 hour retention, and this origin has no catalog, no PSP, and no privacy notice for that store.
- Advertising the `mcp` transport. `/mcp` is the public `read_practice` tool, not an ACP binding.

## Consequences

Callers that only need discovery can fetch the well-known document. Callers that post a checkout session get an error and no session id. Changing the API version means changing `API_VERSION` and the refusal together. The isitagentready scan of the live origin stays unchanged until this is deployed.
