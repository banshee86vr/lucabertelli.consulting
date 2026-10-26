# lucabertelli.consulting public API

Read-only documents. There is no authentication and no write operation.
Agents: access is anonymous and no credential is issued. The registration document is [auth.md](https://lucabertelli.consulting/auth.md).

The machine-readable description is [openapi.yaml](https://lucabertelli.consulting/api/openapi.yaml). The catalog that points here is [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727) linkset at `/.well-known/api-catalog`.

## Agent text

- `GET /llms.txt` returns the index: identity, pages, and the FAQ questions on each service.
- `GET /llms-full.txt` returns the full text of services, insights, and articles.

## Feeds

- `GET /en/rss.xml` lists the English articles and guides.
- `GET /it/rss.xml` lists the Italian articles and guides.

## Sitemap and security contact

- `GET /sitemap-index.xml` lists the indexable HTML URLs.
- `GET /.well-known/security.txt` is the RFC 9116 vulnerability contact.

## A2A Agent Card

`GET /.well-known/agent-card.json` is the [A2A 1.0](https://a2a-protocol.org/latest/specification/) Agent Card. `supportedInterfaces` lists JSON-RPC 1.0 at `https://lucabertelli.consulting/a2a/v1`.

`POST /a2a/v1` with `Content-Type: application/json` accepts a JSON-RPC `SendMessage` request. The response is a direct message that points at the public documents. The endpoint does not create a task, store the request, or issue a credential. Streaming, push notifications, and the extended agent card are off.

`capabilities.extensions` lists the [AP2](https://ap2-protocol.org/) v0.1 merchant role twice. The specification identifier is `https://github.com/google-agentic-commerce/ap2/tree/v0.1`. The v0.1.0 identifier is `https://github.com/google-agentic-commerce/AP2/tree/v0.1.0`. `required` is false. This card does not take card payment, does not sign a cart mandate or a payment mandate, and does not store payment credentials. A data part whose keys start with `ap2.mandates.` is refused and is not copied into the reply.

## MCP Server Card

`GET /.well-known/mcp/server-card.json` is the MCP server card. `serverInfo` carries `name` and `version`. `transport.endpoint` is `https://lucabertelli.consulting/mcp` (`streamable-http`). `capabilities` lists tools as on, and resources and prompts as off.

`POST /mcp` with `Content-Type: application/json` and `Accept: application/json, text/event-stream` is Streamable HTTP. `server/discover` answers protocol `2026-07-28`. `initialize` answers `2025-11-25`, `2025-06-18`, and `2025-03-26`. The tool `read_practice` returns the public index. The endpoint does not offer resources, prompts, or a session, and it does not store the request or issue a credential.

## ACP discovery

`GET /.well-known/acp.json` is the [Agentic Commerce Protocol](https://agenticcommerce.dev) discovery document. `protocol.name` is `acp`. `protocol.version` is `2026-04-17`. `api_base_url` is `https://lucabertelli.consulting/acp`. `transports` lists `rest`. `capabilities.services` lists `checkout`.

`POST /acp/checkout_sessions` with `Content-Type: application/json`, `API-Version: 2026-04-17`, and `Idempotency-Key` returns an error. This seller does not create a checkout session, does not take payment, and does not store the request. Orders, carts, and delegate payment are not offered.

## UCP profile

`GET /.well-known/ucp` is the [Universal Commerce Protocol](https://ucp.dev/specification/overview/) business profile. `protocol_version` is `2026-08-25`. `ucp.version` is the same date. `services` lists `dev.ucp.shopping` over REST at `https://lucabertelli.consulting/ucp/v1`. `capabilities` lists `dev.ucp.shopping.checkout`. `endpoints.rest` is that REST base. `ucp.payment_handlers` is empty. The spec and schema URLs in the profile are on `ucp.dev` for release `2026-08-25`.

`POST /ucp/v1/checkout-sessions` with `Content-Type: application/json` returns an error. This business does not create a checkout session, does not take payment, and does not store the request. Do not send payment credentials.

## Machine Payment Protocol

`GET /openapi.json` is the [Machine Payment Protocol](https://mpp.dev) discovery document. It is OpenAPI 3.1. `x-service-info.categories` lists `developer-tools`. `x-service-info.docs` points at the English homepage, this page, and `/llms.txt`.

`POST /api/engagement` is the payable operation. `x-payment-info.intent` is `charge`, `x-payment-info.method` is `card`, `x-payment-info.currency` is `eur`, and `x-payment-info.amount` is null because the price is a written proposal. The response is 402. This origin does not settle Tempo, Stripe, Lightning, or card payments and does not store the body. Do not send a card number or a payment token.

## x402

`GET`, `HEAD`, and `POST` [`/api`](https://lucabertelli.consulting/api) are the [x402](https://x402.org) resource. An unpaid call returns 402 with a `PAYMENT-REQUIRED` header. The scheme is `exact`, the network is `eip155:84532` (Base Sepolia), and the price is `$0.001` USDC. `payTo` is `0x2C2E3d99BeD343A0499c5b68CeedeFaE64DE6510`. The asset is Base Sepolia USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e`. The facilitator is [https://x402.org/facilitator](https://x402.org/facilitator). A settled call returns a JSON acknowledgement and does not store the body. Consulting work is still priced in a written proposal. `/api/openapi.yaml`, `/api/docs.md`, `/api/status.json`, and `/api/engagement` are not behind this challenge.

## Web Bot Auth

`GET /.well-known/http-message-signatures-directory` is the key directory. The body is a JWKS with one Ed25519 public key, served as `application/http-message-signatures-directory+json`. Outbound agent requests from this origin carry `Signature-Agent` and `Signature-Input`.

## WebMCP

HTML pages call `document.modelContext.registerTool()` on load, and `navigator.modelContext.registerTool()` when that is the browser entry point. The tools are `search_site` (search `/llms.txt`), `read_page` (the open page), and `navigate` (a same-origin path). An `AbortSignal` unregisters them when the page is discarded. This site has no HTML forms, so it does not declare `toolname` tools.

## DNS for AI Discovery

ServiceMode HTTPS and SVCB records at `_index._agents.lucabertelli.consulting`, `_a2a._agents.lucabertelli.consulting`, and `_mcp._agents.lucabertelli.consulting` point at `lucabertelli.consulting` on port 443 with `alpn` `h2`. `key65402` is the agent protocol (`a2a` or `mcp`). `key65400` is the capability URL. `key65409` is the well-known path. The zone is signed with DNSSEC.

## Agent Skills

`GET /.well-known/agent-skills/index.json` is the [Agent Skills Discovery](https://github.com/cloudflare/agent-skills-discovery-rfc) index, schema `https://schemas.agentskills.io/discovery/0.2.0/schema.json`. It lists `consulting-practice` (`type` `skill-md`). The artifact is [SKILL.md](https://lucabertelli.consulting/.well-known/agent-skills/consulting-practice/SKILL.md). `digest` is the SHA-256 of that file.

## Agent registration

Access is anonymous. Protected resource metadata lists Cloudflare Access (`https://lucabertelli.cloudflareaccess.com`) and this origin. The English homepage identifier is published at `/.well-known/oauth-protected-resource/en/`. Read these in order:

- [auth.md](https://lucabertelli.consulting/auth.md)
- [Protected Resource Metadata](https://lucabertelli.consulting/.well-known/oauth-protected-resource)
- [Authorization Server metadata](https://lucabertelli.consulting/.well-known/oauth-authorization-server)

[Registration](https://lucabertelli.consulting/agent/auth/register), [claim](https://lucabertelli.consulting/agent/auth/claim), and [revocation](https://lucabertelli.consulting/agent/auth/revoke) answer `GET` and `POST` with JSON. They do not create an account, send email, or issue a credential.

## HTML pages as Markdown

Any HTML page also answers `Accept: text/markdown` with that page's main content. Browsers, which do not send that header, still receive HTML.

## Status

`GET /api/status.json` returns `{"status":"ok"}` while this file is being served.
