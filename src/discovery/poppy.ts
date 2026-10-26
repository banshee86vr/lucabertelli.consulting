/**
 * Personal Agent Protocol discovery for this public consulting practice.
 *
 * `GET /.well-known/poppy.json` is a website-only document. `protocol_version`
 * is `0.1`, the version the isitagentready check names. `web` is empty, so a
 * personal agent browses the site as a signed-out visitor. There is no `auth`
 * block: this origin does not issue session tokens, and its authorization
 * server metadata has no token endpoint.
 */

import { ORIGIN } from "./agent-card.ts";

export const POPPY_PATH = "/.well-known/poppy.json";
export const POPPY_VERSION = "0.1";
export const POPPY_ORGANIZATION_NAME = "Luca Bertelli Consulting";
export const POPPY_DOCUMENT_URL = `${ORIGIN}${POPPY_PATH}`;

const JSON_TYPE = "application/json; charset=utf-8";
const ALLOW = "GET, HEAD, OPTIONS";
const CACHE = "public, max-age=3600";

export interface PoppyDocument {
	protocol_version: typeof POPPY_VERSION;
	organization: {
		name: string;
		domain: string;
	};
	web: Record<string, never>;
}

function jsonText(value: unknown): string {
	return `${JSON.stringify(value, null, 2)}\n`;
}

export function organizationDomain(): string {
	return new URL(ORIGIN).host;
}

/** Compare a document domain to a request host, ignoring case and one leading www. */
export function domainMatchesHost(domain: string, host: string): boolean {
	return comparableHost(domain) === comparableHost(host);
}

function comparableHost(host: string): string {
	const lower = host.trim().toLowerCase();
	return lower.startsWith("www.") ? lower.slice(4) : lower;
}

export function poppyDocument(): PoppyDocument {
	return {
		protocol_version: POPPY_VERSION,
		organization: {
			name: POPPY_ORGANIZATION_NAME,
			domain: organizationDomain(),
		},
		web: {},
	};
}

export function poppyDocumentText(): string {
	return jsonText(poppyDocument());
}

function normalizePath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
	return pathname;
}

async function discardBody(request: Request): Promise<void> {
	if (request.body === null) return;
	try {
		await request.body.cancel();
	} catch {
		// The body is discarded on purpose.
	}
}

function methodNotAllowed(): Response {
	return new Response(jsonText({ error: "method_not_allowed" }), {
		status: 405,
		headers: {
			"content-type": JSON_TYPE,
			allow: ALLOW,
			"cache-control": "no-store",
			"access-control-allow-origin": "*",
		},
	});
}

function documentResponse(request: Request, body: string): Response {
	const headers = new Headers({
		"content-type": JSON_TYPE,
		allow: ALLOW,
		"cache-control": CACHE,
		"access-control-allow-origin": "*",
		"content-length": String(new TextEncoder().encode(body).byteLength),
	});
	if (request.method.toUpperCase() === "HEAD") {
		return new Response(null, { status: 200, headers });
	}
	return new Response(body, { status: 200, headers });
}

/**
 * Poppy discovery response, or null for every other path.
 * The request body is never read.
 */
export async function poppyResponse(request: Request): Promise<Response | null> {
	const url = new URL(request.url);
	if (normalizePath(url.pathname) !== POPPY_PATH) return null;
	await discardBody(request);
	const method = request.method.toUpperCase();
	if (method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: {
				allow: ALLOW,
				"access-control-allow-origin": "*",
				"access-control-allow-methods": ALLOW,
			},
		});
	}
	if (method !== "GET" && method !== "HEAD") return methodNotAllowed();
	return documentResponse(request, poppyDocumentText());
}

export async function assertPoppyResponses(): Promise<void> {
	const errors: string[] = [];
	const body = poppyDocumentText();
	if (!body.endsWith("\n")) errors.push("Poppy document must end with a newline");

	let document: PoppyDocument & Record<string, unknown>;
	try {
		document = JSON.parse(body) as PoppyDocument & Record<string, unknown>;
	} catch (error) {
		throw new Error(`Poppy document is not JSON (${error instanceof Error ? error.message : error})`);
	}

	if (document.protocol_version !== POPPY_VERSION) errors.push("Poppy protocol_version");
	const domain = organizationDomain();
	if (document.organization?.name !== POPPY_ORGANIZATION_NAME) errors.push("Poppy organization.name");
	if (document.organization?.domain !== domain) errors.push("Poppy organization.domain");
	if (domain.startsWith("www.")) errors.push("Poppy domain must not include a leading www");
	if (!domainMatchesHost(domain, domain)) errors.push("Poppy domain must match its own host");
	if (!domainMatchesHost(domain, `www.${domain}`)) errors.push("Poppy domain must match a www host");
	if (!domainMatchesHost(domain, `WWW.${domain.toUpperCase()}`)) errors.push("Poppy domain comparison must ignore case");
	if (domainMatchesHost(domain, "example.com")) errors.push("Poppy domain matched a foreign host");
	if (domainMatchesHost(domain, `www.www.${domain}`)) {
		errors.push("Poppy domain comparison must ignore only one leading www");
	}
	if (JSON.stringify(document.web) !== "{}") errors.push("Poppy web must be an empty object");
	for (const key of ["auth", "agent", "apis", "feedback"]) {
		if (key in document) errors.push(`Poppy document must not declare ${key}`);
	}
	if (body.includes("token_endpoint") || body.includes("poppy_domains") || body.includes("issuer")) {
		errors.push("Poppy document must not name an OAuth issuer");
	}

	const get = await poppyResponse(new Request(POPPY_DOCUMENT_URL, { headers: { accept: "application/json" } }));
	if (!get || get.status !== 200) errors.push("GET poppy.json must be 200");
	else {
		if (get.headers.get("content-type") !== JSON_TYPE) errors.push("Poppy content-type");
		if (!get.headers.get("content-type")?.startsWith("application/json")) errors.push("Poppy media type");
		if (get.headers.get("access-control-allow-origin") !== "*") errors.push("Poppy CORS");
		if (get.headers.get("cache-control") !== CACHE) errors.push("Poppy cache-control");
		if ((await get.text()) !== body) errors.push("GET poppy.json body drifted");
	}

	const head = await poppyResponse(new Request(`${POPPY_DOCUMENT_URL}/`, { method: "HEAD" }));
	if (!head || head.status !== 200) errors.push("HEAD poppy.json must be 200");
	else {
		const length = Number(head.headers.get("content-length"));
		if (length !== new TextEncoder().encode(body).byteLength) errors.push("HEAD poppy.json content-length");
		if (await head.text()) errors.push("HEAD poppy.json included a body");
	}

	const posted = await poppyResponse(
		new Request(POPPY_DOCUMENT_URL, {
			method: "POST",
			headers: { accept: "application/json", "content-type": "application/json" },
			body: "{}",
		}),
	);
	if (!posted || posted.status !== 405) errors.push("POST poppy.json must be 405");
	else {
		if (posted.headers.get("content-type") !== JSON_TYPE) errors.push("POST poppy.json must be JSON, not HTML");
		const postedBody = await posted.text();
		if (postedBody.includes("<html") || postedBody.includes("<!DOCTYPE")) {
			errors.push("POST poppy.json returned HTML");
		}
	}

	const options = await poppyResponse(new Request(POPPY_DOCUMENT_URL, { method: "OPTIONS" }));
	if (!options || options.status !== 204) errors.push("OPTIONS poppy.json must be 204");

	const queried = await poppyResponse(new Request(`${POPPY_DOCUMENT_URL}?utm=scan`));
	if (!queried || queried.status !== 200) errors.push("GET poppy.json with a query must still be the document");
	else if ((await queried.text()) !== body) errors.push("query string changed the Poppy document");

	if ((await poppyResponse(new Request(`${ORIGIN}/en/`))) !== null) {
		errors.push("Poppy handler must ignore site pages");
	}

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
