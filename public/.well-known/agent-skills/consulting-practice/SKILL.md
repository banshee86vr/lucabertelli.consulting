---
name: consulting-practice
description: "Read the public site of Luca Bertelli Consulting, a freelance Cloud Native and Platform Engineering practice in Italy and the EU. Use when an agent needs the services, articles, or machine-readable index. Access is anonymous and the site does not create tasks or issue credentials."
---

# Consulting practice

Use this skill to read https://lucabertelli.consulting. The site is a public practice site. Anonymous clients read every document. This origin does not create tasks, store agent messages, or issue credentials.

## Start here

1. Read https://lucabertelli.consulting/llms.txt for the index: identity, pages, and the FAQ questions on each service.
2. Read https://lucabertelli.consulting/llms-full.txt when you need the full text of a service, guide, or article.
3. English pages start at https://lucabertelli.consulting/en/. Italian pages start at https://lucabertelli.consulting/it/.

https://lucabertelli.consulting/ answers 308 to https://lucabertelli.consulting/en/. Machine-readable discovery is in English. Service slugs differ by language.

Quote a page only for a claim that page makes. Do not invent prices, availability, or engagement terms.

An HTML page also answers `Accept: text/markdown` with that page's main content.

## Access

Read https://lucabertelli.consulting/auth.md. Access is anonymous. No account and no credential are required.

`GET` and `POST` https://lucabertelli.consulting/agent/auth/register, https://lucabertelli.consulting/agent/auth/claim, and https://lucabertelli.consulting/agent/auth/revoke describe that and change nothing. Do not send an identity assertion.

## Agent card

`GET` https://lucabertelli.consulting/.well-known/agent-card.json is the A2A 1.0 card. `POST` https://lucabertelli.consulting/a2a/v1 with `Content-Type: application/json` accepts JSON-RPC `SendMessage` and returns a public message. It does not create a task.

## Contact

Write to info@lucabertelli.consulting. Do not send secrets.
