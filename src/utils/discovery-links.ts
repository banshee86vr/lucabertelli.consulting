/**
 * RFC 8288 links advertised on the homepage. Targets are the files already
 * published for agents: the RFC 9727 catalog, its OpenAPI description, the
 * human-readable API docs, and the llms.txt index.
 *
 * `rel` values are the registered types from RFC 9727 (`api-catalog`) and
 * RFC 8631 (`service-desc`, `service-doc`), plus `describedby` (RFC 6892).
 * `scripts/verify-seo.mjs` requires `public/_headers` to carry this exact value.
 */
export const DISCOVERY_LINK =
	'</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", </api/openapi.yaml>; rel="service-desc"; type="application/yaml", </api/docs.md>; rel="service-doc"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain"';

const HOMEPAGES = new Set(["/", "/en", "/it"]);

/** `/`, `/en`, `/en/`, `/it`, and `/it/` — the apex redirect and both language homes. */
export function isHomepagePath(pathname: string): boolean {
	if (pathname.length > 1 && pathname.endsWith("/")) {
		pathname = pathname.slice(0, -1);
	}
	if (pathname === "") pathname = "/";
	return HOMEPAGES.has(pathname);
}

const REQUIRED_RELS = ["api-catalog", "service-desc", "service-doc", "describedby"] as const;

function alreadyAdvertisesDiscovery(link: string | null): boolean {
	if (!link) return false;
	return REQUIRED_RELS.every((rel) => link.includes(`rel="${rel}"`));
}

/** Status codes that must not carry a body. */
function bodyless(status: number): boolean {
	return status === 101 || status === 204 || status === 205 || status === 304;
}

/**
 * Attach the discovery `Link` header to homepage responses, including the
 * apex 308. Other routes are returned untouched.
 */
export function withDiscoveryLinks(request: Request, response: Response): Response {
	const pathname = new URL(request.url).pathname;
	if (!isHomepagePath(pathname)) return response;
	if (alreadyAdvertisesDiscovery(response.headers.get("Link"))) return response;

	const headers = new Headers(response.headers);
	headers.append("Link", DISCOVERY_LINK);
	return new Response(bodyless(response.status) ? null : response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
