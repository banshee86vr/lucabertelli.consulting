# lucabertelli.consulting public API

Read-only documents. There is no authentication and no write operation.

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

## HTML pages as Markdown

Any HTML page also answers `Accept: text/markdown` with that page's main content. Browsers, which do not send that header, still receive HTML.

## Status

`GET /api/status.json` returns `{"status":"ok"}` while this file is being served.
