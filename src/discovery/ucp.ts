/**
 * Universal Commerce Protocol profile for this public consulting practice.
 *
 * `GET /.well-known/ucp` is the business profile. `ucp.version` is the
 * 2026-08-25 release. The same document also carries `protocol_version`,
 * `services`, `capabilities`, and `endpoints` for discovery checks that read
 * those names. `payment_handlers` is empty. `POST /ucp/v1/checkout-sessions`
 * does not create a session, does not take payment, and does not store the
 * body.
 */

import { ORIGIN } from "./agent-card.ts";
import { originAllowed } from "./mcp-server.ts";

export const UCP_PATH = "/.well-known/ucp";
export const UCP_BASE_PATH = "/ucp/v1";
export const UCP_CHECKOUT_PATH = "/ucp/v1/checkout-sessions";
export const UCP_VERSION = "2026-08-25";
export const UCP_SERVICE = "dev.ucp.shopping";
export const UCP_CAPABILITY = "dev.ucp.shopping.checkout";
export const UCP_DOCUMENT_URL = `${ORIGIN}${UCP_PATH}`;
export const UCP_BASE_URL = `${ORIGIN}${UCP_BASE_PATH}`;
export const UCP_CHECKOUT_URL = `${ORIGIN}${UCP_CHECKOUT_PATH}`;
export const UCP_PROFILE_SCHEMA = "https://ucp.dev/2026-08-25/schemas/profile.json";
export const UCP_OVERVIEW_SPEC = "https://ucp.dev/2026-08-25/specification/overview/";
export const UCP_CHECKOUT_SPEC = "https://ucp.dev/2026-08-25/specification/shopping/checkout/";
export const UCP_SERVICE_SCHEMA = "https://ucp.dev/2026-08-25/services/shopping/rest.openapi.json";
export const UCP_CHECKOUT_SCHEMA = "https://ucp.dev/2026-08-25/schemas/shopping/checkout.json";
export const CONTINUE_URL = `${ORIGIN}/en/`;

const JSON_TYPE = "application/json; charset=utf-8";
const JSON_TYPE_TOKEN = "application/json";
const DOCUMENT_ALLOW = "GET, HEAD, OPTIONS";
const CREATE_ALLOW = "POST, OPTIONS";
const RESOURCE_ALLOW = "GET, HEAD, PUT, OPTIONS";
const ACTION_ALLOW = "POST, OPTIONS";
const READ_ALLOW = "GET, HEAD, OPTIONS";
const OTHER_ALLOW = "GET, HEAD, POST, OPTIONS";
const CACHE = "public, max-age=3600";
const MAX_BODY = 65_536;
const REFUSAL =
	"This business does not take payment. payment_handlers is empty. There is no catalog and no checkout session store. Do not send payment credentials. The request body is discarded and is not stored.";
const NO_RESOURCE = "No checkout session, cart, order, or catalog result is stored.";

export interface UcpBinding {
	version: string;
	spec: string;
	schema: string;
	transport?: "rest";
	endpoint?: string;
}

export interface UcpProfile {
	$schema: string;
	protocol_version: string;
	services: Record<string, UcpBinding[]>;
	capabilities: Record<string, UcpBinding[]>;
	endpoints: { rest: string };
	ucp: {
		version: string;
		services: Record<string, UcpBinding[]>;
		capabilities: Record<string, UcpBinding[]>;
		payment_handlers: Record<string, never>;
	};
}

interface UcpErrorBody {
	ucp: {
		version: string;
		status: "error";
		payment_handlers: Record<string, never>;
	};
	messages: { type: "error"; code: string; content: string; severity: "unrecoverable" }[];
	continue_url: string;
}

type Route =
	| { kind: "profile" }
	| { kind: "create" }
	| { kind: "resource" }
	| { kind: "action" }
	| { kind: "read" }
	| { kind: "other" };

function jsonText(value: unknown): string {
	return `${JSON.stringify(value, null, 2)}\n`;
}

function shoppingBinding(): UcpBinding {
	return {
		version: UCP_VERSION,
		spec: UCP_OVERVIEW_SPEC,
		transport: "rest",
		endpoint: UCP_BASE_URL,
		schema: UCP_SERVICE_SCHEMA,
	};
}

function checkoutBinding(): UcpBinding {
	return {
		version: UCP_VERSION,
		spec: UCP_CHECKOUT_SPEC,
		schema: UCP_CHECKOUT_SCHEMA,
	};
}

export function ucpProfile(): UcpProfile {
	const services = { [UCP_SERVICE]: [shoppingBinding()] };
	const capabilities = { [UCP_CAPABILITY]: [checkoutBinding()] };
	return {
		$schema: UCP_PROFILE_SCHEMA,
		protocol_version: UCP_VERSION,
		services,
		capabilities,
		endpoints: { rest: UCP_BASE_URL },
		ucp: {
			version: UCP_VERSION,
			services,
			capabilities,
			payment_handlers: {},
		},
	};
}

export function ucpDocumentText(): string {
	return jsonText(ucpProfile());
}

export function ucpDocumentEtag(body: string): string {
	const bytes = new TextEncoder().encode(body);
	let hash = 0x811c9dc5;
	for (const byte of bytes) {
		hash ^= byte;
		hash = Math.imul(hash, 0x01000193);
	}
	return `"${(hash >>> 0).toString(16).padStart(8, "0")}"`;
}

/** Absolute https URLs named by the profile, including this origin. */
export function referencedUrls(value: unknown, out = new Set<string>()): Set<string> {
	if (typeof value === "string") {
		if (value.startsWith("https://")) out.add(value);
		return out;
	}
	if (!value || typeof value !== "object") return out;
	for (const child of Object.values(value)) referencedUrls(child, out);
	return out;
}

function normalizePath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
	return pathname;
}

function safeId(value: string): boolean {
	return /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function classify(pathname: string): Route | null {
	if (pathname === UCP_PATH || pathname === UCP_BASE_PATH) return { kind: "profile" };
	if (!pathname.startsWith(`${UCP_BASE_PATH}/`)) return null;
	const parts = pathname.slice(UCP_BASE_PATH.length + 1).split("/");
	const [head, id, action] = parts;
	if (head === "checkout-sessions" || head === "carts") {
		if (parts.length === 1) return { kind: "create" };
		if (parts.length === 2 && id && safeId(id)) return { kind: "resource" };
		if (parts.length === 3 && id && safeId(id) && action && (action === "complete" || action === "cancel")) {
			if (head === "carts" && action === "complete") return { kind: "other" };
			return { kind: "action" };
		}
		return { kind: "other" };
	}
	if (head === "catalog" && parts.length === 2 && (id === "search" || id === "lookup" || id === "product")) {
		return { kind: "create" };
	}
	if (head === "orders" && parts.length === 2 && id && safeId(id)) return { kind: "read" };
	return { kind: "other" };
}

function allowFor(route: Route): string {
	if (route.kind === "profile") return DOCUMENT_ALLOW;
	if (route.kind === "create" || route.kind === "action") return route.kind === "action" ? ACTION_ALLOW : CREATE_ALLOW;
	if (route.kind === "resource") return RESOURCE_ALLOW;
	if (route.kind === "read") return READ_ALLOW;
	return OTHER_ALLOW;
}

function documentCors(): Headers {
	return new Headers({
		"access-control-allow-origin": "*",
		"access-control-allow-methods": DOCUMENT_ALLOW,
		"access-control-allow-headers": "Content-Type, If-None-Match, UCP-Agent",
		"access-control-expose-headers": "ETag",
	});
}

function apiCors(allow: string): Headers {
	return new Headers({
		"access-control-allow-origin": "*",
		"access-control-allow-methods": allow,
		"access-control-allow-headers": "Content-Type, UCP-Agent, Idempotency-Key, Request-Id, Authorization",
	});
}

function withCors(base: Headers, cors: Headers): Headers {
	for (const [key, value] of cors) base.set(key, value);
	return base;
}

function corsFor(route: Route): Headers {
	return route.kind === "profile" ? documentCors() : apiCors(allowFor(route));
}

async function discardBody(request: Request): Promise<void> {
	if (request.body === null) return;
	try {
		await request.body.cancel();
	} catch {
		// The body is discarded on purpose.
	}
}

function mediaType(header: string | null): string {
	return (header ?? "").split(";")[0].trim().toLowerCase();
}

function etagMatches(header: string | null, etag: string): boolean {
	if (!header) return false;
	return header.split(",").some((part) => {
		const token = part.trim();
		return token === "*" || token === etag;
	});
}

function errorBody(content: string): UcpErrorBody {
	return {
		ucp: { version: UCP_VERSION, status: "error", payment_handlers: {} },
		messages: [{ type: "error", code: "payment_handler_required", content, severity: "unrecoverable" }],
		continue_url: CONTINUE_URL,
	};
}

function jsonResponse(status: number, value: unknown, allow: string, cors: Headers, head = false): Response {
	const body = jsonText(value);
	const headers = withCors(
		new Headers({
			"content-type": JSON_TYPE,
			allow,
			"cache-control": "no-store",
			"content-length": String(new TextEncoder().encode(body).byteLength),
		}),
		cors,
	);
	return new Response(head ? null : body, { status, headers });
}

function documentResponse(request: Request, head: boolean): Response {
	const body = ucpDocumentText();
	const etag = ucpDocumentEtag(body);
	const headers = withCors(
		new Headers({
			"content-type": JSON_TYPE,
			allow: DOCUMENT_ALLOW,
			"cache-control": CACHE,
			etag,
		}),
		documentCors(),
	);
	if (etagMatches(request.headers.get("if-none-match"), etag)) {
		return new Response(null, { status: 304, headers });
	}
	headers.set("content-length", String(new TextEncoder().encode(body).byteLength));
	return new Response(head ? null : body, { status: 200, headers });
}

async function drainLimited(request: Request, max: number): Promise<"ok" | "too_large" | "unreadable"> {
	if (request.body === null) return "ok";
	const reader = request.body.getReader();
	let total = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (!value) continue;
			total += value.byteLength;
			if (total > max) {
				await reader.cancel();
				return "too_large";
			}
		}
		return "ok";
	} catch {
		await reader.cancel().catch(() => undefined);
		return "unreadable";
	}
}

/** Discard a JSON POST or PUT. The bytes are not kept, parsed, or copied into the reply. */
async function consumeJson(request: Request, allow: string, cors: Headers): Promise<Response | null> {
	if (mediaType(request.headers.get("content-type")) !== JSON_TYPE_TOKEN) {
		await discardBody(request);
		return jsonResponse(415, errorBody("Content-Type must be application/json."), allow, cors);
	}
	const declared = request.headers.get("content-length");
	if (declared !== null) {
		const size = Number(declared);
		if (!Number.isInteger(size) || size < 0) {
			await discardBody(request);
			return jsonResponse(400, errorBody("Content-Length is invalid."), allow, cors);
		}
		if (size > MAX_BODY) {
			await discardBody(request);
			return jsonResponse(413, errorBody("Request body is larger than 64 KiB."), allow, cors);
		}
	}
	const drained = await drainLimited(request, MAX_BODY);
	if (drained === "too_large") return jsonResponse(413, errorBody("Request body is larger than 64 KiB."), allow, cors);
	if (drained === "unreadable") return jsonResponse(400, errorBody("The request body could not be read."), allow, cors);
	return null;
}

/**
 * Profile and REST replies, or null when this request is not UCP.
 * POST and PUT bodies are size-capped and dropped. They are not stored or echoed.
 */
export async function ucpResponse(request: Request): Promise<Response | null> {
	const route = classify(normalizePath(new URL(request.url).pathname));
	if (!route) return null;
	const method = request.method.toUpperCase();
	const allow = allowFor(route);
	const cors = corsFor(route);

	if (!originAllowed(request.headers.get("origin"))) {
		await discardBody(request);
		return jsonResponse(403, errorBody("Origin is not allowed."), allow, cors);
	}
	if (method === "OPTIONS") {
		await discardBody(request);
		return new Response(null, { status: 204, headers: withCors(new Headers({ allow }), cors) });
	}

	if (route.kind === "profile") {
		await discardBody(request);
		if (method !== "GET" && method !== "HEAD") {
			return jsonResponse(405, errorBody("Method not allowed."), allow, cors);
		}
		return documentResponse(request, method === "HEAD");
	}

	const writes = method === "POST" || method === "PUT";
	const reads = method === "GET" || method === "HEAD";
	const allowed =
		(route.kind === "create" || route.kind === "action" ? method === "POST" : false) ||
		(route.kind === "resource" ? reads || method === "PUT" : false) ||
		(route.kind === "read" ? reads : false) ||
		(route.kind === "other" ? reads || method === "POST" : false);
	if (!allowed) {
		await discardBody(request);
		return jsonResponse(405, errorBody("Method not allowed."), allow, cors);
	}
	if (writes) {
		const consumed = await consumeJson(request, allow, cors);
		if (consumed) return consumed;
		const missing = route.kind === "read" || route.kind === "other";
		return jsonResponse(missing ? 404 : 400, errorBody(missing ? NO_RESOURCE : REFUSAL), allow, cors);
	}
	await discardBody(request);
	return jsonResponse(404, errorBody(NO_RESOURCE), allow, cors, method === "HEAD");
}

function writeRequest(
	path: string,
	init: { method?: string; body?: string; origin?: string; contentType?: string | null; contentLength?: string } = {},
): Request {
	const headers: Record<string, string> = {};
	if (init.contentType !== null) headers["content-type"] = init.contentType ?? JSON_TYPE_TOKEN;
	if (init.origin) headers.origin = init.origin;
	if (init.contentLength) headers["content-length"] = init.contentLength;
	const method = init.method ?? "POST";
	return new Request(`${ORIGIN}${path}`, {
		method,
		headers,
		body: method === "GET" || method === "HEAD" ? undefined : (init.body ?? "{}"),
	});
}

export async function assertUcpResponses(): Promise<void> {
	const errors: string[] = [];
	const document = ucpProfile();
	const body = ucpDocumentText();
	if (!body.endsWith("\n")) errors.push("UCP document must end with a newline");
	let parsed: UcpProfile;
	try {
		parsed = JSON.parse(body) as UcpProfile;
	} catch (error) {
		throw new Error(`UCP document is not JSON (${error instanceof Error ? error.message : error})`);
	}
	if (JSON.stringify(parsed) !== JSON.stringify(document)) errors.push("UCP document text drifted");
	if (parsed.protocol_version !== UCP_VERSION || parsed.ucp.version !== UCP_VERSION) {
		errors.push("protocol_version and ucp.version must be the 2026-08-25 release");
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.protocol_version)) errors.push("protocol_version must be YYYY-MM-DD");
	const service = parsed.services[UCP_SERVICE]?.[0];
	const nested = parsed.ucp.services[UCP_SERVICE]?.[0];
	if (!service || !nested || service.endpoint !== UCP_BASE_URL || service.transport !== "rest") {
		errors.push("shopping service must be REST at /ucp/v1");
	}
	if (service?.spec !== UCP_OVERVIEW_SPEC || service.schema !== UCP_SERVICE_SCHEMA) {
		errors.push("shopping service spec or schema drifted");
	}
	const capability = parsed.capabilities[UCP_CAPABILITY]?.[0];
	if (!capability || capability.spec !== UCP_CHECKOUT_SPEC || capability.schema !== UCP_CHECKOUT_SCHEMA) {
		errors.push("checkout capability spec or schema drifted");
	}
	if (JSON.stringify(parsed.services) !== JSON.stringify(parsed.ucp.services)) {
		errors.push("top-level services drifted from ucp.services");
	}
	if (JSON.stringify(parsed.capabilities) !== JSON.stringify(parsed.ucp.capabilities)) {
		errors.push("top-level capabilities drifted from ucp.capabilities");
	}
	if (parsed.endpoints.rest !== UCP_BASE_URL || Object.keys(parsed.ucp.payment_handlers).length !== 0) {
		errors.push("endpoints.rest must be the REST base and payment_handlers must be empty");
	}
	if (parsed.$schema !== UCP_PROFILE_SCHEMA) errors.push("profile schema drifted");

	const remote = [...referencedUrls(parsed)].filter((url) => !url.startsWith(`${ORIGIN}/`));
	const expectedRemote = new Set([
		UCP_PROFILE_SCHEMA,
		UCP_OVERVIEW_SPEC,
		UCP_CHECKOUT_SPEC,
		UCP_SERVICE_SCHEMA,
		UCP_CHECKOUT_SCHEMA,
	]);
	if (remote.length !== expectedRemote.size || remote.some((url) => !expectedRemote.has(url))) {
		errors.push(`remote URLs drifted: ${remote.join(", ")}`);
	}
	await Promise.all(
		remote.map(async (url) => {
			try {
				const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20_000) });
				if (response.status !== 200) errors.push(`${url} returned ${response.status}`);
				await response.arrayBuffer();
			} catch (error) {
				errors.push(`${url} was not reachable (${error instanceof Error ? error.message : error})`);
			}
		}),
	);

	const get = await ucpResponse(new Request(UCP_DOCUMENT_URL));
	if (!get || get.status !== 200) errors.push("GET UCP profile must be 200");
	else {
		if (get.headers.get("content-type") !== JSON_TYPE) errors.push("UCP profile content-type");
		if (get.headers.get("cache-control") !== CACHE) errors.push("UCP profile cache-control");
		if (get.headers.get("access-control-allow-origin") !== "*") errors.push("UCP profile CORS");
		const etag = get.headers.get("etag");
		if (etag !== ucpDocumentEtag(body)) errors.push("UCP profile etag");
		if ((await get.text()) !== body) errors.push("GET UCP profile body drifted");
		const cached = await ucpResponse(new Request(UCP_DOCUMENT_URL, { headers: etag ? { "if-none-match": etag } : {} }));
		if (!cached || cached.status !== 304) errors.push("If-None-Match must return 304");
		else if (await cached.text()) errors.push("304 included a body");
	}

	const head = await ucpResponse(new Request(UCP_DOCUMENT_URL, { method: "HEAD" }));
	if (!head || head.status !== 200) errors.push("HEAD UCP profile must be 200");
	else {
		if (Number(head.headers.get("content-length")) !== new TextEncoder().encode(body).byteLength) {
			errors.push("HEAD content-length");
		}
		if (await head.text()) errors.push("HEAD included a body");
	}

	const baseGet = await ucpResponse(new Request(UCP_BASE_URL));
	if (!baseGet || baseGet.status !== 200 || (await baseGet.text()) !== body) {
		errors.push("GET /ucp/v1 must return the profile");
	}

	const sentinel = "super-secret-ucp-sentinel";
	const posted = await ucpResponse(new Request(UCP_DOCUMENT_URL, { method: "POST", body: sentinel }));
	if (!posted || posted.status !== 405) errors.push("POST UCP profile must be 405");
	else if ((await posted.text()).includes(sentinel)) errors.push("405 echoed the request body");

	const options = await ucpResponse(new Request(`${UCP_DOCUMENT_URL}/`, { method: "OPTIONS" }));
	if (!options || options.status !== 204 || !options.headers.get("allow")?.includes("GET")) {
		errors.push("OPTIONS UCP profile must be 204 and allow GET");
	}

	const local = await ucpResponse(new Request(UCP_DOCUMENT_URL, { headers: { origin: "http://127.0.0.1:8787" } }));
	if (!local || local.status !== 403) errors.push("localhost Origin must be 403");

	const refused = await ucpResponse(
		writeRequest(UCP_CHECKOUT_PATH, { body: JSON.stringify({ line_items: [{ id: "hour" }], note: sentinel }) }),
	);
	if (!refused || refused.status !== 400) errors.push("POST checkout-sessions must be 400");
	else {
		const text = await refused.text();
		const error = JSON.parse(text) as UcpErrorBody;
		if (error.ucp.status !== "error" || error.messages[0]?.code !== "payment_handler_required" || !error.messages[0].content.includes("does not take payment")) {
			errors.push("checkout refusal shape drifted");
		}
		if (text.includes(sentinel)) errors.push("checkout refusal echoed the request body");
	}

	const session = await ucpResponse(writeRequest(`${UCP_CHECKOUT_PATH}/${sentinel}`, { method: "GET", contentType: null }));
	if (!session || session.status !== 404) errors.push("GET checkout session must be 404");
	else if ((await session.text()).includes(sentinel)) errors.push("404 echoed the session id");

	const complete = await ucpResponse(
		writeRequest(`${UCP_CHECKOUT_PATH}/session-1/complete`, { body: JSON.stringify({ payment: { token: sentinel } }) }),
	);
	if (!complete || complete.status !== 400) errors.push("POST complete must be 400");
	else if ((await complete.text()).includes(sentinel)) errors.push("complete echoed payment data");

	const catalog = await ucpResponse(writeRequest("/ucp/v1/catalog/search", { body: JSON.stringify({ query: sentinel }) }));
	if (!catalog || catalog.status !== 400) errors.push("POST catalog search must be 400");
	else if ((await catalog.text()).includes(sentinel)) errors.push("catalog search echoed the query");

	const oversized = "x".repeat(MAX_BODY + 1);
	const tooBig = await ucpResponse(writeRequest(UCP_CHECKOUT_PATH, { body: oversized }));
	if (!tooBig || tooBig.status !== 413) errors.push("oversized POST must be 413");
	else if ((await tooBig.text()).includes("xxxx")) errors.push("413 echoed the request body");

	const textBody = await ucpResponse(writeRequest(UCP_CHECKOUT_PATH, { contentType: "text/plain", body: sentinel }));
	if (!textBody || textBody.status !== 415) errors.push("non-JSON POST must be 415");
	else if ((await textBody.text()).includes(sentinel)) errors.push("415 echoed the request body");

	const forbidden = await ucpResponse(writeRequest(UCP_CHECKOUT_PATH, { origin: `http://${sentinel}.example`, body: sentinel }));
	if (!forbidden || forbidden.status !== 403) errors.push("non-https Origin must be 403");
	else if ((await forbidden.text()).includes(sentinel)) errors.push("403 echoed the origin or body");

	if ((await ucpResponse(new Request(`${ORIGIN}/en/`))) !== null) errors.push("UCP handler must ignore site pages");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
