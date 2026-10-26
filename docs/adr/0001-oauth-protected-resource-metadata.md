# 0001: Publish path-specific OAuth protected resource metadata

- Status: Accepted
- Date: 2026-10-26

## Context

The apex returns 308 to `/en/`. RFC 9728 clients treat the URL after that redirect as the resource identifier and request `/.well-known/oauth-protected-resource/en/`. A document that exists only at `/.well-known/oauth-protected-resource` does not answer that request. The `resource` value must be identical to the identifier, including the trailing slash.

This account's Cloudflare Access team is an OAuth issuer at `https://lucabertelli.cloudflareaccess.com`. The practice site stays public. Auth.md still describes anonymous access and this origin still publishes authorization server metadata with no token endpoint.

## Decision

The Worker serves protected resource metadata for `/.well-known/oauth-protected-resource` and for any path suffix of that prefix. `resource` is the identifier reconstructed from the request path and query. `authorization_servers` lists the Access issuer first and `https://lucabertelli.consulting` second. A 401 response adds `WWW-Authenticate` with `resource_metadata` set to the metadata URL for the requested resource. Public pages stay 200.

## Alternatives considered

- Serving only the origin well-known URL. Clients that follow the homepage redirect never request it.
- Removing the apex redirect so the origin is the only resource identifier. That would change the canonical homepage.
- Listing Access alone. The anonymous issuer published for Auth.md would no longer be one of `authorization_servers`.
- Putting the hostname behind Access. The practice site is public.

## Consequences

Agents that start at `https://lucabertelli.consulting` can read metadata for `https://lucabertelli.consulting/en/`. Access does not list this site in its own `protected_resources`, and reading a public page does not require an Access token. The origin authorization server metadata still has an empty `grant_types_supported`.
