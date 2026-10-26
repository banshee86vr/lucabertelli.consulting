# 0006: Register WebMCP tools on HTML pages

- Status: Accepted
- Date: 2026-10-26

## Context

The isitagentready scan loads an HTML page in a browser and passes `checks.discovery.webMcp` when that page has registered WebMCP tools. The WebMCP spec and current Chrome expose `document.modelContext.registerTool`. Older Chrome builds expose `navigator.modelContext.registerTool`. A tool needs a name, a description, a JSON Schema `inputSchema`, and an `execute` callback. An `AbortSignal` passed in the registration options unregisters the tool when aborted. This site is public and read-only. It has no HTML forms, no accounts, and no write API. The public index is already `/llms.txt`.

## Decision

Every HTML page, through `Common.astro`, calls `startWebMcp()` as the document loads. Registration prefers `document.modelContext` and also registers on `navigator.modelContext` when that object is present and is not the same object. The three tools are `search_site`, `read_page`, and `navigate`. `search_site` fetches `/llms.txt` with credentials omitted and returns matching lines. `read_page` returns the open page's URL, language, title, meta description, h1, and main text. `navigate` assigns a path or absolute URL on the page's origin. One `AbortController` covers every registration. Its signal aborts on `pagehide` when the document is discarded, and stays quiet when the page is only entering the back-forward cache. `search_site` and `read_page` are marked read-only. `navigate` is not, because it changes the open document. None of the tools set `exposedTo`, so other origins cannot list them. Titles follow the page language. Descriptions stay English, matching the rest of the agent-facing index.

## Alternatives considered

- Register only on `navigator.modelContext`. Chrome 150 moved the API to `document.modelContext`. A browser that only has the spec entry point would show no tools.
- Register only on `document.modelContext`. Older Chrome builds and some scanners only expose `navigator.modelContext`.
- Declarative `toolname` forms. This site has no HTML forms.
- A new HTTP search endpoint. `/llms.txt` is already the public index, and `search_site` reads that file.
- Bridge `POST /mcp` into the page. That endpoint returns one index dump. It does not read the open page or navigate.

## Consequences

An agent in a WebMCP browser can search the public index, read the open page, and open another URL on this origin. A URL on another origin is left unopened. The consulting-practice skill names the tools, so its digest changes in the same build. The live isitagentready scan stays on the previous deployment until this is deployed.
