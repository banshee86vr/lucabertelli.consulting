# 0002: Publish an A2A agent card without a task store

- Status: Accepted
- Date: 2026-10-26

## Context

Other agents discover this origin by fetching `/.well-known/agent-card.json`. The A2A 1.0 card has to name a real interface URL and a transport. The practice site is public and read-only: it does not store agent messages, mint credentials, or run an autonomous task loop. The apex already redirects `/` to `/en/`, so an interface URL of the origin would send a JSON-RPC client to an HTML page.

## Decision

The Worker serves an A2A 1.0 Agent Card at `/.well-known/agent-card.json`, and the same JSON is written into the build. Both that path and `/a2a/v1` are in `run_worker_first`, so the static card cannot answer `POST`. The one interface is JSON-RPC 1.0 at `https://lucabertelli.consulting/a2a/v1`. `SendMessage` returns a direct message that points at the public documents and the English service pages. `streaming`, `pushNotifications`, and `extendedAgentCard` are false. Task, streaming, and push methods return the matching A2A error. The request body is size-capped and is not stored or copied into the reply. Skills are the nine services, and the discovery check fails if a skill name or description drifts from the English service page. The card is not an HTML route and is not in the sitemap.

## Alternatives considered

- A static card whose interface URL is the site origin. A client that posts JSON-RPC to `/` follows the 308 to `/en/` and receives HTML.
- A full task lifecycle. Nothing on this origin stores agent state, and the privacy notice does not describe that store.
- A Cloudflare Agents SDK Durable Object. That would persist messages this site does not keep.
- A second HTTP+JSON binding. A second binding has to behave the same way, and one JSON-RPC endpoint already answers the card.

## Consequences

Callers that only need discovery can fetch the well-known card. Callers that send a message get the public index and no task id. Adding or renaming a service requires a matching skill, or the discovery check fails. The isitagentready scan of the live origin stays unchanged until this is deployed.
