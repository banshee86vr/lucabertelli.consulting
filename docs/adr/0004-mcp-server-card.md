# 0004: Publish an MCP server card and a stateless Streamable HTTP endpoint

- Status: Accepted
- Date: 2026-10-26

## Context

Agents look for an MCP server card at `/.well-known/mcp/server-card.json`. The isitagentready scan passes when that document is JSON and includes `serverInfo.name`. A card that names a transport also has to name an endpoint that speaks that transport. The practice site is public and read-only: it does not store MCP sessions, mint credentials, or keep a tool-call log. Protocol 2026-07-28 dropped sessions and the standalone GET stream. Older Streamable HTTP clients still open with `initialize`.

## Decision

The Worker serves the card at `/.well-known/mcp/server-card.json`, and the same JSON is written into the build. `serverInfo.name` is `Luca Bertelli Consulting` and `serverInfo.version` is `1.0.0`. `transport.type` is `streamable-http`. `transport.endpoint` and `url` are `https://lucabertelli.consulting/mcp`. `capabilities` is tools on, resources off, prompts off. Both paths are in `run_worker_first`, so the static card cannot answer `POST`.

`POST /mcp` is stateless JSON-RPC. Protocol `2026-07-28` requires `server/discover`, `MCP-Protocol-Version`, and `Mcp-Method`, and `Mcp-Name` on `tools/call`. The header values must match the body. Protocols `2025-11-25`, `2025-06-18`, and `2025-03-26` use `initialize` and do not mint `Mcp-Session-Id`. A missing protocol header is treated as `2025-03-26`. `GET` and `DELETE` return 405. The only tool is `read_practice`, which returns the public index and the English service URLs. `resources/list` and `prompts/list` are method not found. The body is capped at 64 KiB and is not stored or copied into the reply. An `Origin` that is local, private, or not https is rejected. The card is not an HTML route and is not in the sitemap.

## Alternatives considered

- A static card and no `/mcp` handler. A client that posts to the advertised endpoint would get a 404, or HTML if the URL were the site origin.
- A Cloudflare Agents SDK Durable Object. That persists a session this site does not keep, and the current Streamable HTTP revision has no session.
- Advertising resources and prompts. The card would then disagree with `initialize` and `server/discover`.
- Serving only protocol `2026-07-28`. Clients that still send `initialize` would have no fallback on this endpoint.
- The newer `/server-card` suffix without the well-known path. The scan and SEP-1649 fetch `/.well-known/mcp/server-card.json`.

## Consequences

Callers that only need discovery can fetch the card. Callers that connect can list one read-only tool and cannot open a session. Changing the tool set means changing `serverInfo.version` in the same change. The isitagentready scan of the live origin stays unchanged until this is deployed.
