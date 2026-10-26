/**
 * ACP discovery document and the REST base it names.
 *
 * `GET /.well-known/acp.json` is the discovery document. `api_base_url` is
 * `https://lucabertelli.consulting/acp`. The only listed service is checkout.
 * `POST /acp/checkout_sessions` does not create a session, does not take
 * payment, and does not store the body. Orders, carts, and delegate_payment
 * are not offered. There is no idempotency store: the refusal does not depend
 * on the body.
 */

import { ORIGIN } from "./agent-card.ts";
import { originAllowed } from "./mcp-server.ts";

export const ACP_PATH = "/.well-known/acp.json";
export const ACP_BASE_PATH = "/acp";
export const CHECKOUT_COLLECTION = "/acp/checkout_sessions";
export const API_VERSION = "2026-04-17";
export const SUPPORTED_VERSIONS = [API_VERSION] as const;
export const TRANSPORTS = ["rest"] as const;
export const SERVICES = ["checkout"] as const;
export const ACP_DOCUMENT_URL = `${ORIGIN}${ACP_PATH}`;
export const ACP_BASE_URL = `${ORIGIN}${ACP_BASE_PATH}`;
export const CHECKOUT_URL = `${ORIGIN}${CHECKOUT_COLLECTION}`;

const JSON_TYPE = "application/json; charset=utf-8";
const JSON_TYPE_TOKEN = "application/json";
const DOCUMENT_ALLOW = "GET, HEAD, OPTIONS";
const CREATE_ALLOW = "POST, OPTIONS";
const SESSION_ALLOW = "GET, HEAD, POST, OPTIONS";
const OTHER_ALLOW = "GET, HEAD, POST, OPTIONS";
const CACHE = "public, max-age=3600";
const MAX_BODY = 65_536;
const NO_CATALOG =
	"This seller does not create checkout sessions. There is no catalog and no payment handler. Do not send payment credentials. The request body is discarded and is not stored.";
const NO_SESSION = "No checkout session is stored.";
const NOT_OFFERED = "This seller does not offer that ACP service. The request body is discarded and is not stored.";

export interface AcpDiscovery {
	protocol: {
		name: "acp";
		version: string;
		supported_versions: string[];
		documentation_url: string;
	};
	api_base_url: string;
	transports: string[];
	capabilities: { services: string[] };
}

interface AcpErrorBody {
	type: "invalid_request";
	code: string;
	message: string;
	supported_versions?: string[];
}

type Route =
	| { kind: "card" }
	| { kind: "base" }
	| { kind: "create" }
	| { kind: "session"; action: "read" | "complete" | "cancel" }
	| { kind: "other" };

function jsonText(value: unknown): string {
	return `${JSON.stringify(value, null, 2)}\n`;
}

export function acpDiscovery(): AcpDiscovery {
	return {
		protocol: {
			name: "acp",
			version: API_VERSION,
			supported_versions: [...SUPPORTED_VERSIONS],
			documentation_url: `${ORIGIN}/api/docs.md`,
		},
		api_base_url: ACP_BASE_URL,
		transports: [...TRANSPORTS],
		capabilities: { services: [...SERVICES] },
	};
}

export function acpDocumentText(): string {
	return jsonText(acpDiscovery());
}

export function acpDocumentEtag(body: string): string {
	const bytes = new TextEncoder().encode(body);
	let hash = 0x811c9dc5;
	for (const byte of bytes) {
		hash ^= byte;
		hash = Math.imul(hash, 0x01000193);
	}
	return `"${(hash >>> 0).toString(16).padStart(8, "0")}"`;
}

function normalizePath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
	return pathname;
}

function safeId(value: string): boolean {
	return /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function classify(pathname: string): Route | null {
	if (pathname === ACP_PATH) return { kind: "card" };
	if (pathname === ACP_BASE_PATH) return { kind: "base" };
	if (!pathname.startsWith(`${ACP_BASE_PATH}/`)) return null;
	if (pathname === CHECKOUT_COLLECTION) return { kind: "create" };
	if (pathname.startsWith(`${CHECKOUT_COLLECTION}/`)) {
		const rest = pathname.slice(CHECKOUT_COLLECTION.length + 1);
		const parts = rest.split("/");
		if (parts.length === 1 && safeId(parts[0])) return { kind: "session", action: "read" };
		if (parts.length === 2 && safeId(parts[0]) && (parts[1] === "complete" || parts[1] === "cancel")) {
			return { kind: "session", action: parts[1] };
		}
	}
	return { kind: "other" };
}

function allowFor(route: Route): string {
	if (route.kind === "card" || route.kind === "base") return DOCUMENT_ALLOW;
	if (route.kind === "create") return CREATE_ALLOW;
	if (route.kind === "session" && route.action === "read") return SESSION_ALLOW;
	if (route.kind === "session") return CREATE_ALLOW;
	return OTHER_ALLOW;
}

function documentCors(): Headers {
	return new Headers({
		"access-control-allow-origin": "*",
		"access-control-allow-methods": DOCUMENT_ALLOW,
		"access-control-allow-headers": "Content-Type, If-None-Match",
		"access-control-expose-headers": "ETag",
	});
}

function apiCors(allow: string): Headers {
	return new Headers({
		"access-control-allow-origin": "*",
		"access-control-allow-methods": allow,
		"access-control-allow-headers":
			"Content-Type, API-Version, Idempotency-Key, Authorization, Accept-Language, Request-Id",
	});
}

function withCors(base: Headers, cors: Headers): Headers {
	for (const [key, value] of cors) base.set(key, value);
	return base;
}

function corsFor(route: Route): Headers {
	return route.kind === "card" || route.kind === "base" ? documentCors() : apiCors(allowFor(route));
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

function errorBody(code: string, message: string, versions = false): AcpErrorBody {
	const body: AcpErrorBody = { type: "invalid_request", code, message };
	if (versions) body.supported_versions = [...SUPPORTED_VERSIONS];
	return body;
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
	const body = acpDocumentText();
	const etag = acpDocumentEtag(body);
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

/** Discard a JSON POST. The bytes are not kept, parsed, or copied into the reply. */
async function consumeJson(request: Request, allow: string, cors: Headers): Promise<Response | null> {
	if (mediaType(request.headers.get("content-type")) !== JSON_TYPE_TOKEN) {
		await discardBody(request);
		return jsonResponse(415, errorBody("invalid_request", "Content-Type must be application/json."), allow, cors);
	}
	const declared = request.headers.get("content-length");
	if (declared !== null) {
		const size = Number(declared);
		if (!Number.isInteger(size) || size < 0) {
			await discardBody(request);
			return jsonResponse(400, errorBody("invalid_request", "Content-Length is invalid."), allow, cors);
		}
		if (size > MAX_BODY) {
			await discardBody(request);
			return jsonResponse(413, errorBody("invalid_request", "Request body is larger than 64 KiB."), allow, cors);
		}
	}
	const drained = await drainLimited(request, MAX_BODY);
	if (drained === "too_large") {
		return jsonResponse(413, errorBody("invalid_request", "Request body is larger than 64 KiB."), allow, cors);
	}
	if (drained === "unreadable") {
		return jsonResponse(400, errorBody("invalid_request", "The request body could not be read."), allow, cors);
	}
	return null;
}

function versionError(request: Request, allow: string, cors: Headers): Response | null {
	const value = request.headers.get("api-version");
	if (value === null || value.trim() === "") {
		return jsonResponse(400, errorBody("missing_api_version", "API-Version is required.", true), allow, cors);
	}
	const trimmed = value.trim();
	if (trimmed.length > 32 || trimmed !== API_VERSION) {
		return jsonResponse(400, errorBody("unsupported_api_version", "API-Version is not supported.", true), allow, cors);
	}
	return null;
}

function idempotencyError(request: Request, allow: string, cors: Headers): Response | null {
	const value = request.headers.get("idempotency-key");
	if (value === null || value.trim() === "") {
		return jsonResponse(400, errorBody("idempotency_key_required", "Idempotency-Key is required."), allow, cors);
	}
	if (value.trim().length > 255) {
		return jsonResponse(
			400,
			errorBody("invalid_request", "Idempotency-Key must be at most 255 characters."),
			allow,
			cors,
		);
	}
	return null;
}

/**
 * Discovery document and REST replies, or null when this request is not ACP.
 * POST bodies are size-capped and dropped. They are not stored or echoed.
 */
export async function acpResponse(request: Request): Promise<Response | null> {
	const route = classify(normalizePath(new URL(request.url).pathname));
	if (!route) return null;
	const method = request.method.toUpperCase();
	const allow = allowFor(route);
	const cors = corsFor(route);

	if (!originAllowed(request.headers.get("origin"))) {
		await discardBody(request);
		return jsonResponse(403, errorBody("invalid_request", "Origin is not allowed."), allow, cors);
	}
	if (method === "OPTIONS") {
		await discardBody(request);
		return new Response(null, { status: 204, headers: withCors(new Headers({ allow }), cors) });
	}

	if (route.kind === "card" || route.kind === "base") {
		await discardBody(request);
		if (method !== "GET" && method !== "HEAD") {
			return jsonResponse(405, errorBody("invalid_request", "Method not allowed."), allow, cors);
		}
		return documentResponse(request, method === "HEAD");
	}

	if (route.kind === "create") {
		if (method !== "POST") {
			await discardBody(request);
			return jsonResponse(405, errorBody("invalid_request", "Method not allowed."), allow, cors);
		}
		const consumed = await consumeJson(request, allow, cors);
		if (consumed) return consumed;
		return (
			versionError(request, allow, cors) ??
			idempotencyError(request, allow, cors) ??
			jsonResponse(400, errorBody("invalid_request", NO_CATALOG), allow, cors)
		);
	}

	if (route.kind === "session") {
		const postOnly = route.action !== "read";
		const allowed = postOnly ? method === "POST" : method === "GET" || method === "HEAD" || method === "POST";
		if (!allowed) {
			await discardBody(request);
			return jsonResponse(405, errorBody("invalid_request", "Method not allowed."), allow, cors);
		}
		if (method === "POST") {
			const consumed = await consumeJson(request, allow, cors);
			if (consumed) return consumed;
			const rejected = versionError(request, allow, cors) ?? idempotencyError(request, allow, cors);
			if (rejected) return rejected;
		} else {
			await discardBody(request);
			const rejected = versionError(request, allow, cors);
			if (rejected) return rejected;
		}
		return jsonResponse(404, errorBody("invalid_request", NO_SESSION), allow, cors, method === "HEAD");
	}

	if (method === "POST") {
		const consumed = await consumeJson(request, allow, cors);
		if (consumed) return consumed;
		return jsonResponse(404, errorBody("invalid_request", NOT_OFFERED), allow, cors);
	}
	await discardBody(request);
	if (method !== "GET" && method !== "HEAD") {
		return jsonResponse(405, errorBody("invalid_request", "Method not allowed."), allow, cors);
	}
	return jsonResponse(404, errorBody("invalid_request", NOT_OFFERED), allow, cors, method === "HEAD");
}

function checkoutRequest(
	path: string,
	init: {
		method?: string;
		version?: string | null;
		key?: string | null;
		body?: string;
		origin?: string;
		contentType?: string | null;
		contentLength?: string;
	} = {},
): Request {
	const headers: Record<string, string> = {};
	if (init.contentType !== null) headers["content-type"] = init.contentType ?? JSON_TYPE_TOKEN;
	if (init.version !== null) headers["api-version"] = init.version ?? API_VERSION;
	if (init.key !== null) headers["idempotency-key"] = init.key ?? "idem-1";
	if (init.origin) headers.origin = init.origin;
	if (init.contentLength) headers["content-length"] = init.contentLength;
	const method = init.method ?? "POST";
	return new Request(`${ORIGIN}${path}`, {
		method,
		headers,
		body: method === "GET" || method === "HEAD" ? undefined : (init.body ?? "{}"),
	});
}

export async function assertAcpResponses(): Promise<void> {
	const errors: string[] = [];
	const document = acpDiscovery();
	const body = acpDocumentText();
	if (!body.endsWith("\n")) errors.push("ACP document must end with a newline");
	let parsed: AcpDiscovery;
	try {
		parsed = JSON.parse(body) as AcpDiscovery;
	} catch (error) {
		throw new Error(`ACP document is not JSON (${error instanceof Error ? error.message : error})`);
	}
	if (JSON.stringify(parsed) !== JSON.stringify(document)) errors.push("ACP document text drifted");
	if (parsed.protocol.name !== "acp") errors.push("protocol.name must be acp");
	if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.protocol.version) || parsed.protocol.version !== API_VERSION) {
		errors.push("protocol.version must be the supported date");
	}
	if (
		parsed.protocol.supported_versions.length === 0 ||
		parsed.protocol.supported_versions.at(-1) !== parsed.protocol.version
	) {
		errors.push("supported_versions must be non-empty and end with protocol.version");
	}
	let base: URL;
	try {
		base = new URL(parsed.api_base_url);
	} catch {
		errors.push("api_base_url must be an absolute URL");
		base = new URL(ACP_BASE_URL);
	}
	if (base.protocol !== "https:" || parsed.api_base_url !== ACP_BASE_URL) {
		errors.push("api_base_url must be the HTTPS /acp URL");
	}
	if (parsed.transports.length === 0 || !parsed.transports.includes("rest") || parsed.transports.includes("mcp")) {
		errors.push("transports must list rest and not mcp");
	}
	if (
		parsed.capabilities.services.length === 0 ||
		!parsed.capabilities.services.includes("checkout") ||
		parsed.capabilities.services.some((service) => service === "orders" || service === "delegate_payment" || service === "carts")
	) {
		errors.push("services must list checkout and not orders, carts, or delegate_payment");
	}
	if (parsed.protocol.documentation_url !== `${ORIGIN}/api/docs.md`) errors.push("documentation_url drifted");

	const get = await acpResponse(new Request(ACP_DOCUMENT_URL));
	if (!get || get.status !== 200) errors.push("GET ACP document must be 200");
	else {
		if (get.headers.get("content-type") !== JSON_TYPE) errors.push("ACP document content-type");
		if (get.headers.get("cache-control") !== CACHE) errors.push("ACP document cache-control");
		if (get.headers.get("access-control-allow-origin") !== "*") errors.push("ACP document CORS");
		const etag = get.headers.get("etag");
		if (etag !== acpDocumentEtag(body)) errors.push("ACP document etag");
		if ((await get.text()) !== body) errors.push("GET ACP document body drifted");
		const cached = await acpResponse(new Request(ACP_DOCUMENT_URL, { headers: etag ? { "if-none-match": etag } : {} }));
		if (!cached || cached.status !== 304) errors.push("If-None-Match must return 304");
		else if (await cached.text()) errors.push("304 included a body");
	}

	const head = await acpResponse(new Request(ACP_DOCUMENT_URL, { method: "HEAD" }));
	if (!head || head.status !== 200) errors.push("HEAD ACP document must be 200");
	else {
		if (Number(head.headers.get("content-length")) !== new TextEncoder().encode(body).byteLength) {
			errors.push("HEAD content-length");
		}
		if (await head.text()) errors.push("HEAD included a body");
	}

	const baseGet = await acpResponse(new Request(ACP_BASE_URL));
	if (!baseGet || baseGet.status !== 200 || (await baseGet.text()) !== body) {
		errors.push("GET /acp must return the discovery document");
	}

	const sentinel = "super-secret-acp-sentinel";
	const posted = await acpResponse(new Request(ACP_DOCUMENT_URL, { method: "POST", body: sentinel }));
	if (!posted || posted.status !== 405) errors.push("POST ACP document must be 405");
	else if ((await posted.text()).includes(sentinel)) errors.push("405 echoed the request body");

	const options = await acpResponse(new Request(`${ACP_DOCUMENT_URL}/`, { method: "OPTIONS" }));
	if (!options || options.status !== 204 || !options.headers.get("allow")?.includes("GET")) {
		errors.push("OPTIONS ACP document must be 204 and allow GET");
	}

	const local = await acpResponse(new Request(ACP_DOCUMENT_URL, { headers: { origin: "http://127.0.0.1:8787" } }));
	if (!local || local.status !== 403) errors.push("localhost Origin must be 403");

	const refused = await acpResponse(
		checkoutRequest(CHECKOUT_COLLECTION, { body: JSON.stringify({ items: [{ id: "shirt" }], note: sentinel }) }),
	);
	if (!refused || refused.status !== 400) errors.push("POST checkout_sessions must be 400");
	else {
		const text = await refused.text();
		const error = JSON.parse(text) as AcpErrorBody;
		if (error.type !== "invalid_request" || error.code !== "invalid_request" || !error.message.includes("does not create checkout sessions")) {
			errors.push("checkout refusal shape drifted");
		}
		if (text.includes(sentinel)) errors.push("checkout refusal echoed the request body");
	}

	const again = await acpResponse(checkoutRequest(CHECKOUT_COLLECTION));
	if (!again || again.status !== 400) errors.push("a second checkout POST must also be 400");

	const missingVersion = await acpResponse(checkoutRequest(CHECKOUT_COLLECTION, { version: null }));
	if (!missingVersion || missingVersion.status !== 400) errors.push("missing API-Version must be 400");
	else {
		const error = JSON.parse(await missingVersion.text()) as AcpErrorBody;
		if (error.code !== "missing_api_version" || error.supported_versions?.[0] !== API_VERSION) {
			errors.push("missing API-Version must name supported_versions");
		}
	}

	const badVersion = await acpResponse(checkoutRequest(CHECKOUT_COLLECTION, { version: sentinel }));
	if (!badVersion || badVersion.status !== 400) errors.push("unsupported API-Version must be 400");
	else {
		const text = await badVersion.text();
		const error = JSON.parse(text) as AcpErrorBody;
		if (error.code !== "unsupported_api_version" || text.includes(sentinel)) {
			errors.push("unsupported API-Version must not echo the header");
		}
	}

	const missingKey = await acpResponse(checkoutRequest(CHECKOUT_COLLECTION, { key: null }));
	if (!missingKey || missingKey.status !== 400) errors.push("missing Idempotency-Key must be 400");
	else if ((JSON.parse(await missingKey.text()) as AcpErrorBody).code !== "idempotency_key_required") {
		errors.push("missing Idempotency-Key code drifted");
	}

	const longKey = "k".repeat(256);
	const longKeyResponse = await acpResponse(checkoutRequest(CHECKOUT_COLLECTION, { key: longKey }));
	if (!longKeyResponse || longKeyResponse.status !== 400) errors.push("long Idempotency-Key must be 400");
	else if ((await longKeyResponse.text()).includes(longKey.slice(0, 40))) errors.push("long Idempotency-Key was echoed");

	const oversized = "x".repeat(MAX_BODY + 1);
	const tooBig = await acpResponse(checkoutRequest(CHECKOUT_COLLECTION, { body: oversized }));
	if (!tooBig || tooBig.status !== 413) errors.push("oversized POST must be 413");
	else if ((await tooBig.text()).includes("xxxx")) errors.push("413 echoed the request body");

	const declared = await acpResponse(checkoutRequest(CHECKOUT_COLLECTION, { contentLength: String(MAX_BODY + 1) }));
	if (!declared || declared.status !== 413) errors.push("oversized Content-Length must be 413");

	const textBody = await acpResponse(checkoutRequest(CHECKOUT_COLLECTION, { contentType: "text/plain", body: sentinel }));
	if (!textBody || textBody.status !== 415) errors.push("non-JSON POST must be 415");
	else if ((await textBody.text()).includes(sentinel)) errors.push("415 echoed the request body");

	const session = await acpResponse(
		checkoutRequest(`${CHECKOUT_COLLECTION}/${sentinel}`, { method: "GET", key: null, contentType: null }),
	);
	if (!session || session.status !== 404) errors.push("GET checkout session must be 404");
	else if ((await session.text()).includes(sentinel)) errors.push("404 echoed the session id");

	const complete = await acpResponse(
		checkoutRequest(`${CHECKOUT_COLLECTION}/session-1/complete`, {
			body: JSON.stringify({ payment_data: { token: sentinel } }),
		}),
	);
	if (!complete || complete.status !== 404) errors.push("POST complete must be 404");
	else if ((await complete.text()).includes(sentinel)) errors.push("complete echoed payment data");

	const delegated = await acpResponse(
		checkoutRequest("/acp/delegate_payment", { version: null, key: null, body: JSON.stringify({ token: sentinel }) }),
	);
	if (!delegated || delegated.status !== 404) errors.push("POST delegate_payment must be 404");
	else {
		const text = await delegated.text();
		if (text.includes(sentinel) || !text.includes("does not offer that ACP service")) {
			errors.push("delegate_payment refusal echoed the body or drifted");
		}
	}

	const forbidden = await acpResponse(
		checkoutRequest(CHECKOUT_COLLECTION, { origin: `http://${sentinel}.example`, body: sentinel }),
	);
	if (!forbidden || forbidden.status !== 403) errors.push("non-https Origin must be 403");
	else if ((await forbidden.text()).includes(sentinel)) errors.push("403 echoed the origin or body");

	if ((await acpResponse(new Request(`${ORIGIN}/en/`))) !== null) errors.push("ACP handler must ignore site pages");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
