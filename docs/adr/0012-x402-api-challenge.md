# 0012: Serve an x402 challenge on /api

- Status: Accepted
- Date: 2026-10-26

## Context

The isitagentready scan requests `GET /api` and passes `checks.commerce.x402` when that response is HTTP 402 and the `PAYMENT-REQUIRED` header decodes to an x402 v2 `PaymentRequired` object. `GET /api/v1` and the homepage may stay 200. This origin is a Cloudflare Worker, not an Express or Next server. The public facilitator at `https://x402.org/facilitator` settles Base Sepolia (`eip155:84532`) and does not need an API key. It does not settle Base mainnet. Consulting work is priced in a written proposal. `POST /api/engagement` stays the Machine Payment Protocol declaration, with a null amount and no card settlement. `/api/openapi.yaml`, `/api/docs.md`, and `/api/status.json` are public documents.

## Decision

`@x402/hono` `paymentMiddleware` is mounted inside the Worker for `GET`, `HEAD`, and `POST /api`. The Hono app is created on the first protected request, because constructing the middleware at import time calls the facilitator from module scope, which the Workers runtime rejects. The facilitator URL is `https://x402.org/facilitator`. The scheme is `exact`, the network is `eip155:84532`, and the price is `$0.001` USDC. `payTo` is `0x2C2E3d99BeD343A0499c5b68CeedeFaE64DE6510`. The private key for that address is not stored. Testnet USDC sent there cannot be withdrawn from this repository. A valid `PAYMENT-SIGNATURE` is verified and settled by the facilitator, and the route then returns a JSON acknowledgement. The request body is size-capped, discarded, and not copied into the reply. `/api` is listed in `run_worker_first`. `nodejs_compat` is enabled because `@x402/evm` depends on viem. `compatibility_date` stays `2024-09-23`.

## Alternatives considered

- A hand-built 402 header. The scan would see the same status, and the route would not verify or settle a payment. The implementation uses the Hono middleware the protocol publishes for this job.
- `@x402/express` or `@x402/next`. This origin does not run those servers. Hono's `fetch` handler is the one that runs inside the Worker.
- Base mainnet through the Coinbase facilitator. That settles real USDC and needs an API key this origin does not have.
- Protecting every path under `/api`. That would put the catalog, the docs, the status file, and the MPP engagement route behind the same challenge.
- Storing a hot-wallet key in a Worker secret. Nothing in this route withdraws funds, and a key on the Worker would be a new secret to protect.

## Consequences

Unpaid calls to `/api` return 402 with the middleware's `PAYMENT-REQUIRED` header. An agent that pays 0.001 USDC on Base Sepolia receives the acknowledgement, and those funds are not recoverable here. Card, Tempo, Stripe, Lightning, ACP, and UCP behavior is unchanged. The discovery check calls the public facilitator, so a build needs network access to that host. The live scan stays on the previous result until this Worker is deployed. After deploy, `checks.commerce.x402.status` must be `pass`.
