# auth.md

Luca Bertelli Consulting publishes this file for agents that need to know how to access https://lucabertelli.consulting. The site is a public, read-only practice site. Anonymous clients read every document. No account and no credential are required.

## Audience

Automated agents, and the people who operate them, use the same public pages, feeds, and discovery files as a browser. The practice answers in English and Italian. Machine-readable discovery is in English.

## Registration

The supported method is anonymous access. Calling the registration endpoint creates nothing.

The registration endpoint is [https://lucabertelli.consulting/agent/auth/register](https://lucabertelli.consulting/agent/auth/register). `GET` and `POST` return a JSON document describing anonymous access. `POST` does not store the body: no account is created, no email is sent, and no credential is issued. [https://lucabertelli.consulting/agent/auth](https://lucabertelli.consulting/agent/auth) returns the same document.

A passive client can stop after this file and the two metadata documents below. `POST` is safe, and it is not required to learn the access rules.

## Supported methods

Anonymous access is the only method.

- `identity_types_supported` is `["anonymous"]`.
- `anonymous.credential_types_supported` is `["none"]`.
- The claim URL is [https://lucabertelli.consulting/agent/auth/claim](https://lucabertelli.consulting/agent/auth/claim).

An identity assertion is outside this method. The metadata does not list `urn:ietf:params:oauth:token-type:id-jag` or `verified_email`.

## Credentials

Fetch every document with no `Authorization` header. The scope name `read` is the public read access anonymous clients already have. Protected resource metadata lists `bearer_methods_supported` as `["header"]` so a client that has a bearer token knows the header it would use. This issuer does not mint bearer tokens. A request that sends one receives the same public document; the header is not checked.

## Claim

There is no account to claim. [https://lucabertelli.consulting/agent/auth/claim](https://lucabertelli.consulting/agent/auth/claim) answers `GET` and `POST` with that fact. It does not start a confirmation ceremony and it does not send email.

## Revocation

This origin stores no agent credential. [https://lucabertelli.consulting/agent/auth/revoke](https://lucabertelli.consulting/agent/auth/revoke) answers `GET` and `POST` with that fact. To ask for deletion of email you sent to the practice, write to info@lucabertelli.consulting. The privacy notice is published in [English](https://lucabertelli.consulting/en/privacy) and [Italian](https://lucabertelli.consulting/it/privacy).

## Discovery

Read these documents. All of them are public.

1. Protected Resource Metadata for this origin: [https://lucabertelli.consulting/.well-known/oauth-protected-resource](https://lucabertelli.consulting/.well-known/oauth-protected-resource)
2. Protected Resource Metadata for the English homepage: [https://lucabertelli.consulting/.well-known/oauth-protected-resource/en/](https://lucabertelli.consulting/.well-known/oauth-protected-resource/en/)
3. Authorization Server metadata for anonymous access: [https://lucabertelli.consulting/.well-known/oauth-authorization-server](https://lucabertelli.consulting/.well-known/oauth-authorization-server)
4. Cloudflare Access authorization server metadata: [https://lucabertelli.cloudflareaccess.com/.well-known/oauth-authorization-server](https://lucabertelli.cloudflareaccess.com/.well-known/oauth-authorization-server)

`authorization_servers` lists Cloudflare Access first (`https://lucabertelli.cloudflareaccess.com`) and this origin second. Access is the OAuth authorization server. This origin does not mint tokens. Its authorization server metadata describes anonymous access, and its `issuer` is `https://lucabertelli.consulting`, the second entry in `authorization_servers`. The `agent_auth` block carries `skill` (this file), `register_uri`, `claim_uri`, `revocation_uri`, and the anonymous method above. `identity_endpoint` and `claim_endpoint` repeat `register_uri` and `claim_uri` for clients that look up those names.

`grant_types_supported` on this origin is an empty list. There is no authorization endpoint and no token endpoint here. Access publishes those endpoints on its own issuer.

The apex redirects to the English homepage, so clients that start at [https://lucabertelli.consulting](https://lucabertelli.consulting) use [https://lucabertelli.consulting/en/](https://lucabertelli.consulting/en/) as the resource identifier. That identifier's metadata is the second link above, and its `resource` value is the identifier itself. The same insertion applies to any other path on this host.

A 401 response carries a `WWW-Authenticate` challenge whose `resource_metadata` parameter is the metadata URL for the resource that was requested. Public pages answer 200 and do not send that challenge.

## Public documents

The API catalog and the OpenAPI description list the read API:

- [API catalog](https://lucabertelli.consulting/.well-known/api-catalog)
- [ARD catalog](https://lucabertelli.consulting/.well-known/ai-catalog.json) (same document at https://lucabertelli.consulting/.well-known/ard.json)
- [OpenAPI description](https://lucabertelli.consulting/api/openapi.yaml)
- [API docs](https://lucabertelli.consulting/api/docs.md)
- [llms.txt](https://lucabertelli.consulting/llms.txt)
- [llms-full.txt](https://lucabertelli.consulting/llms-full.txt)
- [Security contact](https://lucabertelli.consulting/.well-known/security.txt)
- [A2A Agent Card](https://lucabertelli.consulting/.well-known/agent-card.json)
- [A2A JSON-RPC](https://lucabertelli.consulting/a2a/v1)
- [Agent Skills index](https://lucabertelli.consulting/.well-known/agent-skills/index.json)
- [MCP Server Card](https://lucabertelli.consulting/.well-known/mcp/server-card.json)
- [MCP endpoint](https://lucabertelli.consulting/mcp)
- [ACP discovery](https://lucabertelli.consulting/.well-known/acp.json)
- [UCP profile](https://lucabertelli.consulting/.well-known/ucp)
- [MPP discovery](https://lucabertelli.consulting/openapi.json)
- [x402 resource](https://lucabertelli.consulting/api)

The Agent Card is A2A 1.0. [https://lucabertelli.consulting/a2a/v1](https://lucabertelli.consulting/a2a/v1) accepts `POST` JSON-RPC `SendMessage` and answers with a message that points at these documents. It does not create a task, store the request, or issue a credential. `capabilities.extensions` lists the AP2 merchant role at `https://github.com/google-agentic-commerce/ap2/tree/v0.1` and `https://github.com/google-agentic-commerce/AP2/tree/v0.1.0`. `required` is false. This card does not take card payment, does not sign a mandate, and does not store payment credentials. A data part whose keys start with `ap2.mandates.` is refused.

The MCP server card names a Streamable HTTP endpoint. [https://lucabertelli.consulting/mcp](https://lucabertelli.consulting/mcp) accepts `POST` JSON-RPC. The tool `read_practice` returns the public index. Resources, prompts, and sessions are off. The call is not stored and no credential is issued.

ACP discovery is [https://lucabertelli.consulting/.well-known/acp.json](https://lucabertelli.consulting/.well-known/acp.json). `protocol.name` is `acp`. `protocol.version` is `2026-04-17`. The REST base is [https://lucabertelli.consulting/acp](https://lucabertelli.consulting/acp). `transports` lists `rest`. `capabilities.services` lists `checkout`. [https://lucabertelli.consulting/acp/checkout_sessions](https://lucabertelli.consulting/acp/checkout_sessions) answers `POST` with an error. This seller does not create a checkout session, does not take payment, and does not store the request.

Universal Commerce Protocol discovery is [https://lucabertelli.consulting/.well-known/ucp](https://lucabertelli.consulting/.well-known/ucp). `protocol_version` is `2026-08-25`. `ucp.version` is the same date. `services` lists `dev.ucp.shopping` over REST at [https://lucabertelli.consulting/ucp/v1](https://lucabertelli.consulting/ucp/v1). `capabilities` lists `dev.ucp.shopping.checkout`. `endpoints.rest` is that REST base. `ucp.payment_handlers` is empty. [https://lucabertelli.consulting/ucp/v1/checkout-sessions](https://lucabertelli.consulting/ucp/v1/checkout-sessions) answers `POST` with an error. This business does not create a checkout session, does not take payment, and does not store the request.

Machine Payment Protocol discovery is [https://lucabertelli.consulting/openapi.json](https://lucabertelli.consulting/openapi.json). It is OpenAPI 3.1. `x-service-info.categories` lists `developer-tools`. [https://lucabertelli.consulting/api/engagement](https://lucabertelli.consulting/api/engagement) is the payable operation. `x-payment-info.intent` is `charge`, `x-payment-info.method` is `card`, `x-payment-info.currency` is `eur`, and `x-payment-info.amount` is null because the price is a written proposal. The response is 402. This origin does not settle Tempo, Stripe, Lightning, or card payments and does not store payment credentials. Do not send a card number or a payment token.

x402 is [https://lucabertelli.consulting/api](https://lucabertelli.consulting/api). `GET`, `HEAD`, and `POST` return 402 with a `PAYMENT-REQUIRED` header until a payment settles. The scheme is `exact`, the network is `eip155:84532` (Base Sepolia), and the price is `$0.001` USDC. `payTo` is `0x2C2E3d99BeD343A0499c5b68CeedeFaE64DE6510`. The facilitator is https://x402.org/facilitator. A settled call returns a JSON acknowledgement and does not store the body. Consulting work is still priced in a written proposal.

HTML pages register WebMCP tools on load: `search_site` reads the public index, `read_page` returns the open page, and `navigate` opens a path on this origin. The call is `document.modelContext.registerTool`, or `navigator.modelContext.registerTool` when that is the browser entry point. An AbortSignal unregisters the tools when the page is discarded.

The Agent Skills index lists `consulting-practice`. The artifact is [https://lucabertelli.consulting/.well-known/agent-skills/consulting-practice/SKILL.md](https://lucabertelli.consulting/.well-known/agent-skills/consulting-practice/SKILL.md). Its digest is the SHA-256 of that file.

DNS for AI Discovery publishes ServiceMode HTTPS and SVCB records at `_index._agents.lucabertelli.consulting`, `_a2a._agents.lucabertelli.consulting`, and `_mcp._agents.lucabertelli.consulting`. The target is lucabertelli.consulting, TLS is `h2` on port 443, and the agent protocol is the private-use SvcParam `key65402`. `key65400` is the capability URL. `key65409` is the well-known path.

Requests this origin sends as an agent are signed with HTTP message signatures. The public Ed25519 key is [https://lucabertelli.consulting/.well-known/http-message-signatures-directory](https://lucabertelli.consulting/.well-known/http-message-signatures-directory). A verifier fetches that directory and checks the `Signature-Agent` and `Signature-Input` headers. The directory media type is `application/http-message-signatures-directory+json`.

An HTML page also answers `Accept: text/markdown` with that page's main content.
