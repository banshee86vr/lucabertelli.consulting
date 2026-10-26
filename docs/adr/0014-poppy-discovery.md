# 0014: Publish a website-only Poppy discovery document

- Status: Accepted
- Date: 2026-10-26

## Context

Agents look for a Personal Agent Protocol document at `/.well-known/poppy.json`. The isitagentready scan fetches that URL and reports the manifest missing when the response is an HTML 404. The check asks for `protocol_version` `0.1`, `organization.name`, `organization.domain` equal to the requested host ignoring one leading `www`, and at least one of `agent`, `apis`, or `web`. A website-only document may use `web: {}` and omit `auth`. Declaring an agent, an API, or `web.browser_session_endpoint` requires `auth.issuer`, and that issuer's RFC 8414 metadata must repeat the issuer, list `organization.domain` in `poppy_domains`, and publish token and revocation endpoints.

This origin is a public consulting practice. Authorization server metadata has an empty `grant_types_supported` and no token endpoint (ADR 0001). Cloudflare Access is a separate issuer and does not list this site as a protected resource. The protocol site's current draft is `0.3` and binds domains with `protected_resources` instead of `poppy_domains`. Before 1.0, a personal agent must not use a document whose `major.minor` version it does not support. The check that failed names draft `0.1` and treats only an unsupported major version as unchecked.

## Decision

The Worker serves a website-only document at `/.well-known/poppy.json`, and the same JSON is written into the build. `protocol_version` is `0.1`. `organization.name` is `Luca Bertelli Consulting`. `organization.domain` is `lucabertelli.consulting`. `web` is `{}`. The document has no `auth`, `agent`, `apis`, or `feedback`. `GET` and `HEAD` return 200 as `application/json` and allow any origin. `POST` returns 405 as JSON. The response is public, unauthenticated, and cached for one hour. The path is in `run_worker_first`, so the static file cannot answer `POST` with an HTML page. The document is not an HTML route and is not in the sitemap.

## Alternatives considered

- `protocol_version` `0.3`, matching the current spec page. The failing check and its skill name `0.1`. A checker that requires that literal version would still fail. This origin does not implement sessions, so the document only marks the website as browsable.
- Listing the public MCP server or OpenAPI description under `apis`. Those declarations require an issuer with token and revocation endpoints. This origin does not mint tokens.
- Setting `auth.issuer` to Cloudflare Access. This repository cannot add `poppy_domains` to Access metadata, and Access does not list this origin as a protected resource.
- Adding `token_endpoint` and `poppy_domains` to this origin's authorization server metadata without issuing tokens. ADR 0001 forbids advertising a token endpoint. A personal agent would then try to start a session this origin does not implement.

## Consequences

A personal agent that accepts draft `0.1` can fetch the document and browse the site as a signed-out visitor. Issuer validation is not required, because the document does not name an issuer. Adding an agent, an API, or a browser session later means a real issuer, domain binding, and token and revocation endpoints in the same change. The isitagentready scan of the live origin stays unchanged until this is deployed. When the scanner scores the check, `checks.discovery.personalAgentProtocol` must find the manifest, and `details.issuerValidation` must be `notRequired`.
