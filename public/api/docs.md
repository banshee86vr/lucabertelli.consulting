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
