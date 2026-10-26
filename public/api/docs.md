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

## MCP Server Card

`GET /.well-known/mcp/server-card.json` is the MCP server card. `serverInfo` carries `name` and `version`. `transport.endpoint` is `https://lucabertelli.consulting/mcp` (`streamable-http`). `capabilities` lists tools as on, and resources and prompts as off.

`POST /mcp` with `Content-Type: application/json` and `Accept: application/json, text/event-stream` is Streamable HTTP. `server/discover` answers protocol `2026-07-28`. `initialize` answers `2025-11-25`, `2025-06-18`, and `2025-03-26`. The tool `read_practice` returns the public index. The endpoint does not offer resources, prompts, or a session, and it does not store the request or issue a credential.

## Web Bot Auth

`GET /.well-known/http-message-signatures-directory` is the key directory. The body is a JWKS with one Ed25519 public key, served as `application/http-message-signatures-directory+json`. Outbound agent requests from this origin carry `Signature-Agent` and `Signature-Input`.

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
