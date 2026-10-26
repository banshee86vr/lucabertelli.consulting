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

Read these two documents in order. Both are public.

1. Protected Resource Metadata: [https://lucabertelli.consulting/.well-known/oauth-protected-resource](https://lucabertelli.consulting/.well-known/oauth-protected-resource)
2. Authorization Server metadata: [https://lucabertelli.consulting/.well-known/oauth-authorization-server](https://lucabertelli.consulting/.well-known/oauth-authorization-server)

`issuer` in the authorization server metadata is `https://lucabertelli.consulting`. That string is also the single entry in `authorization_servers`. The `agent_auth` block carries `skill` (this file), `register_uri`, `claim_uri`, `revocation_uri`, and the anonymous method above. `identity_endpoint` and `claim_endpoint` repeat `register_uri` and `claim_uri` for clients that look up those names.

`grant_types_supported` is an empty list. There is no authorization endpoint and no token endpoint.

This origin does not answer 401, so there is no `WWW-Authenticate` challenge to follow. The two links above are how you find this file.

## Public documents

The API catalog and the OpenAPI description list the read API:

- [API catalog](https://lucabertelli.consulting/.well-known/api-catalog)
- [OpenAPI description](https://lucabertelli.consulting/api/openapi.yaml)
- [API docs](https://lucabertelli.consulting/api/docs.md)
- [llms.txt](https://lucabertelli.consulting/llms.txt)
- [llms-full.txt](https://lucabertelli.consulting/llms-full.txt)
- [Security contact](https://lucabertelli.consulting/.well-known/security.txt)

An HTML page also answers `Accept: text/markdown` with that page's main content.
