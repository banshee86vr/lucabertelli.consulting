# 0005: Publish a Web Bot Auth directory and sign outbound agent requests

- Status: Accepted
- Date: 2026-10-26

## Context

Web Bot Auth lets a site prove that an automated request came from it. Verifiers fetch a JWKS from `/.well-known/http-message-signatures-directory` and check HTTP message signatures on the request. Cloudflare's verifier accepts Ed25519 and the legacy `Signature-Agent` string. It rejects the dictionary form from the later IETF draft. The isitagentready check passes when that directory is a JWKS with at least one key. This origin's only outbound agent call is the IndexNow submission. The signing key cannot live in the public repository.

## Decision

The Worker and a static file both serve one Ed25519 public JWK at `/.well-known/http-message-signatures-directory`, with media type `application/http-message-signatures-directory+json`. `kid` is the JWK thumbprint. The private key is the Worker secret `WEB_BOT_AUTH_PRIVATE_JWK` (JSON, or base64url of that JSON). `.dev.vars` holds it locally and is gitignored.

Request signatures use `web-bot-auth` and cover `@authority` and `signature-agent`, with tag `web-bot-auth`. `Signature-Agent` is `"https://lucabertelli.consulting"`. The signature expires after 60 seconds. Directory responses are signed with `http-message-sig` over `@authority;req` and `content-digest` (RFC 9530 SHA-256 of the JWKS body), with tag `http-message-signatures-directory`, when the secret matches the published key. IndexNow POSTs are signed when that secret is available. A missing secret still serves the public JWKS and leaves IndexNow unsigned. A secret that is set but does not match the published key, including a whitespace-only value, returns 500 on the directory and does not serve an unsigned JWKS. `HEAD` on that response has the same headers and no body. A signing failure returns the same kind of 500.

## Alternatives considered

- A static JWKS and no signatures. The readiness check would pass, and a receiving site could not verify a request.
- The dictionary `Signature-Agent` from the current IETF draft. Cloudflare's deployed verifier rejects that form.
- Committing the private key. The repository is public, so anyone could sign as this origin.
- A hand-rolled RFC 9421 implementation. The signature base and the `req` parameter are easy to get wrong. Cloudflare's library is the one their verifier is built from.

## Consequences

The public directory is enough for the readiness check. Request signatures and signed directory responses start when the Worker secret is set to the key that matches the published `x`. The directory signature binds the response body through `Content-Digest`, so a substituted JWKS does not verify. Rotating the key means replacing that public JWK, the committed directory file, and the secret in the same change. `check-auth-discovery` fails when `public/` has drifted from the discovery source. Registering the key in the Cloudflare bot submission form is a separate dashboard step. The live scan stays unchanged until this is deployed.
