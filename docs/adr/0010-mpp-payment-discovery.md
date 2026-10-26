# 0010: Publish MPP discovery without settling a charge

- Status: Accepted
- Date: 2026-10-26

## Context

Agents look for Machine Payment Protocol discovery at `GET /openapi.json`. The document is OpenAPI 3.1. A payable operation carries `x-payment-info` with `intent`, `method`, and `amount`, and declares a `402` response. The isitagentready scan passes when that document is served and a payable operation has the extension. `amount` may be null when the price is not fixed. This origin is a public consulting practice. Service pages say the price is a written proposal. There is no Tempo recipient, Stripe account, Lightning node, or card processor, and no store for payment credentials.

## Decision

The Worker serves `GET /openapi.json`, and the same JSON is written into the build. `x-service-info.categories` is `developer-tools`. `x-service-info.docs` points at the English homepage, `/api/docs.md`, and `/llms.txt`. The only payable operation is `POST /api/engagement`. `x-payment-info` uses the single-offer shorthand: `intent` is `charge`, `method` is `card`, `currency` is `eur`, and `amount` is null. The description says this origin does not settle the charge. The response is 402 with `payment_not_settled`. The body is size-capped, discarded, and not copied into the reply. There is no `WWW-Authenticate: Payment` challenge, because this origin has no recipient to name. Both paths are in `run_worker_first`. The document is not an HTML route and is not in the sitemap. `Cache-Control` on the document is `public, max-age=300`.

## Alternatives considered

- A fixed integer amount. Registries would list a price this practice does not charge. The service pages say the number is in a written proposal.
- `method` `tempo`, `stripe`, or `lightning`. Those name a settlement rail this origin does not operate. `card` is the fiat method the discovery check allows, and the 402 still refuses settlement.
- An `offers` array beside the shorthand fields. The discovery JSON Schema rejects that combination. The shorthand is the form that puts `intent`, `method`, and `amount` on `x-payment-info` itself.
- A real `WWW-Authenticate: Payment` challenge. That asks the client to pay a recipient. There is no recipient.
- Leaving commerce checks neutral by publishing no document. The scan then cannot report `checks.commerce.mpp.status` as `pass`.

## Consequences

Callers that only need discovery can fetch `/openapi.json`. Callers that post an engagement get 402 and no echo of the body. A client that treats discovery as a price list sees a null amount and must follow the 402, which does not accept payment. Changing the offer means changing `paymentInfo()` and the public file together. The isitagentready scan of the live origin stays unchanged until this is deployed. When the scanner scores MPP, `checks.commerce.mpp.status` must be `pass`.
