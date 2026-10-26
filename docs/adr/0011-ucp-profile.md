# 0011: Publish a UCP profile without a checkout store

- Status: Accepted
- Date: 2026-10-26

## Context

Agents look for a Universal Commerce Protocol business profile at `/.well-known/ucp`. The isitagentready scan passes when that document is JSON and includes `protocol_version` and `services`. The check's remediation also names `capabilities` and `endpoints`, and it fetches the spec and schema URLs those fields reference. The current protocol release is `2026-08-25`. A business profile must also carry `ucp.version`, `ucp.services`, and `ucp.payment_handlers`. `ucp.capabilities` is optional. This origin is a public consulting practice. It has no product catalog, no payment handler, and no store for checkout sessions.

## Decision

The Worker serves the profile at `/.well-known/ucp`, and the same JSON is written into the build. `protocol_version` and `ucp.version` are `2026-08-25`. `services` and `ucp.services` list `dev.ucp.shopping` once, transport `rest`, endpoint `https://lucabertelli.consulting/ucp/v1`, with the release overview spec and the shopping REST OpenAPI schema. `capabilities` and `ucp.capabilities` list `dev.ucp.shopping.checkout` with the checkout spec and schema. `endpoints.rest` is the same REST base. `ucp.payment_handlers` is empty. `$schema` is the release profile schema. The response is public, unauthenticated, and cached for one hour. `GET /ucp/v1` returns the same document. Both paths, plus `/ucp/v1/*`, are in `run_worker_first`, so the static profile cannot answer `POST`.

`POST /ucp/v1/checkout-sessions` returns 400 and does not create a session. Catalog, cart, order, complete, and cancel routes under `/ucp/v1` also refuse. The body is size-capped, discarded, and not copied into the reply. There is no session store, because the refusal does not depend on the body or on `UCP-Agent`. A local, private, or non-https `Origin` is rejected. The profile is not an HTML route and is not in the sitemap.

## Alternatives considered

- A profile that only has the nested `ucp` object. The scan's pass line looks for `protocol_version`, and the remediation also names `capabilities` and `endpoints`. Those names are top-level as well as mirrored under `ucp`, which the profile schema allows.
- A payment handler. This origin has no PSP, no card merchant, and no privacy notice for payment credentials. `payment_handlers` stays empty.
- Persisting checkout sessions. The checkout spec expects a session until `expires_at`, and this origin has no catalog and no store.
- Advertising cart, order, fulfillment, or discount as separate capabilities. The shopping service binding is the REST surface the checkout capability uses. Those other capabilities are not offered.

## Consequences

Callers that only need discovery can fetch the well-known profile. Callers that post a checkout session get an error and no session id. Changing the protocol date means changing `UCP_VERSION` and the spec and schema URLs together. The isitagentready scan of the live origin stays unchanged until this is deployed. When the scanner scores UCP, `checks.commerce.ucp.status` must be `pass`.
