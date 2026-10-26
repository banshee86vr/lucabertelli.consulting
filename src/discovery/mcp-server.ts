/**
 * MCP server card and Streamable HTTP endpoint for this public, read-only site.
 *
 * `GET /.well-known/mcp/server-card.json` is the discovery document the
 * isitagentready scan reads. `POST /mcp` is the transport that document names.
 * The only tool returns the public index. There is no session, no resource
 * list, and no prompt list. The request body is size-capped and is not stored
 * or copied into the reply.
 *
 * Protocol 2026-07-28 is stateless (`server/discover`, per-request `_meta`).
 * Protocols 2025-11-25, 2025-06-18, and 2025-03-26 still use `initialize`.
 * Both eras share this endpoint. HTTP GET and DELETE are 405: this revision
 * has no SSE listen stream and no session to terminate.
 */

import { SERVICE_KEYS, servicePath } from "../constants/services.ts";
import { ORIGIN } from "./agent-card.ts";

export const MCP_CARD_PATH = "/.well-known/mcp/server-card.json";
export const MCP_PATH = "/mcp";
export const MCP_CARD_URL = `${ORIGIN}${MCP_CARD_PATH}`;
export const MCP_URL = `${ORIGIN}${MCP_PATH}`;
export const SERVER_NAME = "Luca Bertelli Consulting";
export const SERVER_VERSION = "1.0.0";
export const MODERN_PROTOCOL = "2026-07-28";
export const LEGACY_PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26"] as const;
export const SUPPORTED_PROTOCOLS = [MODERN_PROTOCOL, ...LEGACY_PROTOCOLS] as const;
export const TOOL_NAME = "read_practice";

const JSON_TYPE = "application/json; charset=utf-8";
const CARD_ALLOW = "GET, HEAD, OPTIONS";
const MCP_ALLOW = "POST, OPTIONS";
const CARD_CACHE = "public, max-age=3600";
const MAX_BODY = 65_536;
const PROTOCOL_KEY = "io.modelcontextprotocol/protocolVersion";
const CLIENT_INFO_KEY = "io.modelcontextprotocol/clientInfo";
const CLIENT_CAPABILITIES_KEY = "io.modelcontextprotocol/clientCapabilities";
const SERVER_INFO_KEY = "io.modelcontextprotocol/serverInfo";

const JSON_TYPE_TOKEN = "application/json";
const SSE_TOKEN = "text/event-stream";

interface ToolDefinition {
	name: string;
	title: string;
	description: string;
	inputSchema: { type: "object"; properties: Record<string, never>; additionalProperties: false };
	annotations: {
		title: string;
		readOnlyHint: true;
		destructiveHint: false;
		idempotentHint: true;
		openWorldHint: false;
	};
}

export interface McpServerCard {
	serverInfo: { name: string; version: string };
	description: string;
	url: string;
	transport: {
		type: "streamable-http";
		endpoint: string;
		supportedProtocolVersions: readonly string[];
	};
	capabilities: { tools: true; resources: false; prompts: false };
}

const INSTRUCTIONS =
	"Luca Bertelli Consulting publishes public practice documents. Call read_practice for the index URLs. This server does not offer resources or prompts, does not store calls, and does not issue credentials.";

export function mcpServerCard(): McpServerCard {
	return {
		serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
		description:
			"Public MCP server for Luca Bertelli Consulting, a freelance Cloud Native and Platform Engineering practice in Italy and the EU. The read_practice tool returns public document URLs. Resources, prompts, and sessions are off.",
		url: MCP_URL,
		transport: {
			type: "streamable-http",
			endpoint: MCP_URL,
			supportedProtocolVersions: SUPPORTED_PROTOCOLS,
		},
		capabilities: { tools: true, resources: false, prompts: false },
	};
}

function jsonText(value: unknown): string {
	return `${JSON.stringify(value, null, 2)}\n`;
}

export function mcpCardText(): string {
	return jsonText(mcpServerCard());
}

export function mcpCardEtag(body: string): string {
	const bytes = new TextEncoder().encode(body);
	let hash = 0x811c9dc5;
	for (const byte of bytes) {
		hash ^= byte;
		hash = Math.imul(hash, 0x01000193);
	}
	return `"${(hash >>> 0).toString(16).padStart(8, "0")}"`;
}

function practiceText(): string {
	const lines = [
		"Luca Bertelli Consulting answers with public documents. This endpoint does not store calls or issue credentials.",
		`MCP server card: ${MCP_CARD_URL}`,
		`Index: ${ORIGIN}/llms.txt`,
		`Full text: ${ORIGIN}/llms-full.txt`,
		`Access: ${ORIGIN}/auth.md`,
		"Services:",
	];
	for (const id of SERVICE_KEYS) {
		lines.push(`- ${id}: ${ORIGIN}${servicePath(id, "en")}`);
	}
	return lines.join("\n");
}

function toolDefinition(): ToolDefinition {
	return {
		name: TOOL_NAME,
		title: "Read the public practice index",
		description:
			"Return the public index URLs for Luca Bertelli Consulting. Does not fetch those URLs, store the call, or issue a credential.",
		inputSchema: { type: "object", properties: {}, additionalProperties: false },
		annotations: {
			title: "Read the public practice index",
			readOnlyHint: true,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false,
		},
	};
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

function mediaType(header: string | null): string {
	return (header ?? "").split(";")[0].trim().toLowerCase();
}

function acceptsJsonAndSse(header: string | null): boolean {
	if (!header) return false;
	const parts = header.split(",").map((part) => part.split(";")[0].trim().toLowerCase());
	if (parts.includes("*/*")) return true;
	return parts.includes(JSON_TYPE_TOKEN) && parts.includes(SSE_TOKEN);
}

function isLocalHost(hostname: string): boolean {
	const host = hostname.toLowerCase();
	if (host === "localhost" || host.endsWith(".localhost")) return true;
	if (host === "0.0.0.0" || host.startsWith("127.")) return true;
	if (host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("169.254.")) return true;
	if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
	if (!host.includes(":")) return false;
	if (host === "::1") return true;
	return host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");
}

/** Absent Origin is a non-browser client. A public https origin may read. Local and private hosts may not. */
export function originAllowed(header: string | null): boolean {
	if (header === null || header.trim() === "") return true;
	if (header.length > 200) return false;
	let url: URL;
	try {
		url = new URL(header);
	} catch {
		return false;
	}
	if (url.origin === ORIGIN) return true;
	if (isLocalHost(url.hostname)) return false;
	return url.protocol === "https:";
}

function requestedToken(version: string): string {
	return /^\d{4}-\d{2}-\d{2}$/.test(version) ? version : "invalid";
}

function headerVersion(request: Request): string | null {
	const value = request.headers.get("mcp-protocol-version");
	if (value === null) return null;
	const trimmed = value.trim();
	if (trimmed.length === 0 || trimmed.length > 32) return "invalid";
	return trimmed;
}

function metaRecord(params: unknown): Record<string, unknown> | null {
	if (params === null || typeof params !== "object" || Array.isArray(params)) return null;
	const meta = (params as Record<string, unknown>)._meta;
	if (meta === null || typeof meta !== "object" || Array.isArray(meta)) return null;
	return meta as Record<string, unknown>;
}

function metaVersion(params: unknown): string | null {
	const meta = metaRecord(params);
	if (!meta) return null;
	const version = meta[PROTOCOL_KEY];
	return typeof version === "string" ? version : null;
}

function decodeHeaderValue(value: string | null): string | null {
	if (value === null || value.length === 0 || value.length > 512) return null;
	const sentinel = value.match(/^=\?base64\?([A-Za-z0-9+/]+={0,2})\?=$/);
	if (sentinel?.[1]) {
		try {
			const binary = atob(sentinel[1]);
			const bytes = new Uint8Array(binary.length);
			for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
			return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
		} catch {
			return null;
		}
	}
	if (!/^[\x21-\x7E]+$/.test(value)) return null;
	return value;
}

function cardCors(): Headers {
	return new Headers({
		"access-control-allow-origin": "*",
		"access-control-allow-methods": CARD_ALLOW,
		"access-control-allow-headers": "Content-Type, If-None-Match",
		"access-control-expose-headers": "ETag",
	});
}

function mcpCors(): Headers {
	return new Headers({
		"access-control-allow-origin": "*",
		"access-control-allow-methods": MCP_ALLOW,
		"access-control-allow-headers":
			"Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name, Mcp-Session-Id, Last-Event-ID",
	});
}

function withCors(base: Headers, cors: Headers): Headers {
	for (const [key, value] of cors) base.set(key, value);
	return base;
}

function etagMatches(header: string | null, etag: string): boolean {
	if (!header) return false;
	return header.split(",").some((part) => {
		const token = part.trim();
		return token === "*" || token === etag;
	});
}

function cardResponse(request: Request): Response {
	const body = mcpCardText();
	const etag = mcpCardEtag(body);
	const headers = withCors(
		new Headers({
			"content-type": JSON_TYPE,
			allow: CARD_ALLOW,
			"cache-control": CARD_CACHE,
			etag,
		}),
		cardCors(),
	);
	if (etagMatches(request.headers.get("if-none-match"), etag)) {
		return new Response(null, { status: 304, headers });
	}
	const byteLength = new TextEncoder().encode(body).byteLength;
	headers.set("content-length", String(byteLength));
	if (request.method.toUpperCase() === "HEAD") return new Response(null, { status: 200, headers });
	return new Response(body, { status: 200, headers });
}

function transportError(status: number, error: string, allow = MCP_ALLOW): Response {
	const body = jsonText({ error });
	return new Response(body, {
		status,
		headers: withCors(
			new Headers({
				"content-type": JSON_TYPE,
				allow,
				"cache-control": "no-store",
				"content-length": String(new TextEncoder().encode(body).byteLength),
			}),
			allow === CARD_ALLOW ? cardCors() : mcpCors(),
		),
	});
}

function originForbidden(allow = MCP_ALLOW): Response {
	const body = jsonText({
		jsonrpc: "2.0",
		id: null,
		error: { code: -32600, message: "Origin is not allowed" },
	});
	return new Response(body, {
		status: 403,
		headers: withCors(
			new Headers({
				"content-type": JSON_TYPE,
				allow,
				"cache-control": "no-store",
				"content-length": String(new TextEncoder().encode(body).byteLength),
			}),
			allow === CARD_ALLOW ? cardCors() : mcpCors(),
		),
	});
}

interface RpcError {
	jsonrpc: "2.0";
	id: string | number | null;
	error: { code: number; message: string; data?: { supported: readonly string[]; requested: string } };
}

function requestId(value: unknown): string | number | null {
	if (typeof value === "string" || typeof value === "number") return value;
	return null;
}

function rpcError(
	id: string | number | null,
	code: number,
	message: string,
	data?: RpcError["error"]["data"],
): RpcError {
	return {
		jsonrpc: "2.0",
		id,
		error: data === undefined ? { code, message } : { code, message, data },
	};
}

function rpcResponse(status: number, value: unknown): Response {
	const body = jsonText(value);
	return new Response(body, {
		status,
		headers: withCors(
			new Headers({
				"content-type": JSON_TYPE,
				allow: MCP_ALLOW,
				"cache-control": "no-store",
				"content-length": String(new TextEncoder().encode(body).byteLength),
			}),
			mcpCors(),
		),
	});
}

function accepted(): Response {
	return new Response(null, {
		status: 202,
		headers: withCors(new Headers({ allow: MCP_ALLOW, "cache-control": "no-store" }), mcpCors()),
	});
}

function unsupportedVersion(id: string | number | null, version: string): Response {
	return rpcResponse(
		400,
		rpcError(id, -32022, "Unsupported protocol version", {
			supported: SUPPORTED_PROTOCOLS,
			requested: requestedToken(version),
		}),
	);
}

function headerMismatch(id: string | number | null): Response {
	return rpcResponse(400, rpcError(id, -32020, "Header mismatch"));
}

async function readLimited(request: Request, max: number): Promise<string | null> {
	if (request.body === null) return "";
	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (!value) continue;
			total += value.byteLength;
			if (total > max) {
				await reader.cancel();
				return null;
			}
			chunks.push(value);
		}
	} catch {
		await reader.cancel().catch(() => undefined);
		throw new Error("body_unreadable");
	}
	const bytes = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new TextDecoder().decode(bytes);
}

function serverInfo() {
	return { name: SERVER_NAME, version: SERVER_VERSION };
}

function negotiateLegacy(version: unknown): string {
	if (typeof version === "string" && (LEGACY_PROTOCOLS as readonly string[]).includes(version)) return version;
	if (version === "2024-11-05") return "2025-03-26";
	return "2025-11-25";
}

function initializeResult(params: unknown): RpcError | Record<string, unknown> {
	if (params === null || typeof params !== "object" || Array.isArray(params)) {
		return rpcError(null, -32602, "Invalid params");
	}
	const record = params as Record<string, unknown>;
	const client = record.clientInfo;
	if (client === null || typeof client !== "object" || Array.isArray(client)) {
		return rpcError(null, -32602, "Invalid params");
	}
	const name = (client as Record<string, unknown>).name;
	const version = (client as Record<string, unknown>).version;
	if (typeof name !== "string" || name.length === 0 || name.length > 200) return rpcError(null, -32602, "Invalid params");
	if (typeof version !== "string" || version.length === 0 || version.length > 200) {
		return rpcError(null, -32602, "Invalid params");
	}
	if (typeof record.protocolVersion !== "string") return rpcError(null, -32602, "Invalid params");
	return {
		protocolVersion: negotiateLegacy(record.protocolVersion),
		capabilities: { tools: {} },
		serverInfo: serverInfo(),
		instructions: INSTRUCTIONS,
	};
}

function modernMetaOk(params: unknown): boolean {
	const meta = metaRecord(params);
	if (!meta || meta[PROTOCOL_KEY] !== MODERN_PROTOCOL) return false;
	const client = meta[CLIENT_INFO_KEY];
	if (client === null || typeof client !== "object" || Array.isArray(client)) return false;
	const name = (client as Record<string, unknown>).name;
	const version = (client as Record<string, unknown>).version;
	if (typeof name !== "string" || name.length === 0 || name.length > 200) return false;
	if (typeof version !== "string" || version.length === 0 || version.length > 200) return false;
	const capabilities = meta[CLIENT_CAPABILITIES_KEY];
	if (capabilities !== undefined && (capabilities === null || typeof capabilities !== "object" || Array.isArray(capabilities))) {
		return false;
	}
	return true;
}

function discoverResult(): Record<string, unknown> {
	return {
		resultType: "complete",
		supportedVersions: SUPPORTED_PROTOCOLS,
		capabilities: { tools: {} },
		_meta: { [SERVER_INFO_KEY]: serverInfo() },
		instructions: INSTRUCTIONS,
		ttlMs: 3_600_000,
		cacheScope: "public",
	};
}

function toolsListResult(modern: boolean, params: unknown): RpcError | Record<string, unknown> {
	if (params !== undefined && params !== null) {
		if (typeof params !== "object" || Array.isArray(params)) return rpcError(null, -32602, "Invalid params");
		const cursor = (params as Record<string, unknown>).cursor;
		if (cursor !== undefined && cursor !== "") return rpcError(null, -32602, "Invalid params");
	}
	const tools = [toolDefinition()];
	if (!modern) return { tools };
	return { resultType: "complete", tools, ttlMs: 3_600_000, cacheScope: "public" };
}

function toolsCallResult(modern: boolean, params: unknown): RpcError | Record<string, unknown> {
	if (params === null || typeof params !== "object" || Array.isArray(params)) return rpcError(null, -32602, "Invalid params");
	const name = (params as Record<string, unknown>).name;
	if (typeof name !== "string" || name.length === 0 || name.length > 128) return rpcError(null, -32602, "Invalid params");
	if (name !== TOOL_NAME) {
		const errorResult = {
			content: [{ type: "text", text: "Unknown tool" }],
			isError: true,
		};
		return modern ? { resultType: "complete", ...errorResult } : errorResult;
	}
	const args = (params as Record<string, unknown>).arguments;
	if (args !== undefined) {
		if (args === null || typeof args !== "object" || Array.isArray(args)) return rpcError(null, -32602, "Invalid params");
		if (Object.keys(args).length > 0) return rpcError(null, -32602, "Invalid params");
	}
	const ok = {
		content: [{ type: "text", text: practiceText() }],
		isError: false,
	};
	return modern ? { resultType: "complete", ...ok } : ok;
}

type Era = { kind: "legacy"; version: string } | { kind: "modern" } | { kind: "unsupported"; version: string } | { kind: "mismatch" };

function classify(request: Request, method: string, params: unknown): Era {
	if (method === "initialize") return { kind: "legacy", version: "2025-11-25" };
	const header = headerVersion(request);
	const meta = metaVersion(params);
	if (header === "invalid") return { kind: "unsupported", version: "invalid" };
	if (header !== null && meta !== null && header !== meta) return { kind: "mismatch" };
	const version = header ?? meta;
	if (version === null) return { kind: "legacy", version: "2025-03-26" };
	if (version === MODERN_PROTOCOL) return { kind: "modern" };
	if (version.startsWith("2026-")) return { kind: "unsupported", version };
	if ((LEGACY_PROTOCOLS as readonly string[]).includes(version)) return { kind: "legacy", version };
	return { kind: "unsupported", version };
}

function modernHeadersMatch(request: Request, method: string, params: unknown): boolean {
	const mcpMethod = request.headers.get("mcp-method");
	if (mcpMethod !== method) return false;
	if (method !== "tools/call") return true;
	if (params === null || typeof params !== "object" || Array.isArray(params)) return false;
	const name = (params as Record<string, unknown>).name;
	if (typeof name !== "string") return false;
	return decodeHeaderValue(request.headers.get("mcp-name")) === name;
}

function dispatch(era: Era, method: string, params: unknown): RpcError | Record<string, unknown> {
	const modern = era.kind === "modern";
	if (method === "initialize") {
		if (modern) return rpcError(null, -32601, "Method not found");
		return initializeResult(params);
	}
	if (method === "server/discover") {
		if (!modern) return rpcError(null, -32601, "Method not found");
		if (!modernMetaOk(params)) return rpcError(null, -32602, "Invalid params");
		return discoverResult();
	}
	if (method === "ping") return {};
	if (method === "tools/list") {
		if (modern && !modernMetaOk(params)) return rpcError(null, -32602, "Invalid params");
		return toolsListResult(modern, params);
	}
	if (method === "tools/call") {
		if (modern && !modernMetaOk(params)) return rpcError(null, -32602, "Invalid params");
		return toolsCallResult(modern, params);
	}
	return rpcError(null, -32601, "Method not found");
}

function isRpcError(value: RpcError | Record<string, unknown>): value is RpcError {
	return "error" in value && "jsonrpc" in value;
}

async function mcpPost(request: Request): Promise<Response> {
	if (!acceptsJsonAndSse(request.headers.get("accept"))) {
		await discardBody(request);
		return transportError(406, "not_acceptable");
	}
	if (mediaType(request.headers.get("content-type")) !== JSON_TYPE_TOKEN) {
		await discardBody(request);
		return transportError(415, "unsupported_media_type");
	}
	const declared = request.headers.get("content-length");
	if (declared !== null) {
		const size = Number(declared);
		if (Number.isFinite(size) && size > MAX_BODY) {
			await discardBody(request);
			return transportError(413, "payload_too_large");
		}
	}
	let text: string | null;
	try {
		text = await readLimited(request, MAX_BODY);
	} catch {
		return rpcResponse(400, rpcError(null, -32700, "Parse error"));
	}
	if (text === null) return transportError(413, "payload_too_large");
	let payload: unknown;
	try {
		payload = JSON.parse(text);
	} catch {
		return rpcResponse(400, rpcError(null, -32700, "Parse error"));
	}
	if (Array.isArray(payload) || payload === null || typeof payload !== "object") {
		return rpcResponse(400, rpcError(null, -32600, "Invalid request"));
	}
	const record = payload as Record<string, unknown>;
	const id = requestId(record.id);
	if (record.jsonrpc !== "2.0") return rpcResponse(400, rpcError(id, -32600, "Invalid request"));
	if (typeof record.method === "string" && !("id" in record)) return accepted();
	if (!("method" in record) && ("result" in record || "error" in record)) {
		if (headerVersion(request) === MODERN_PROTOCOL) return rpcResponse(400, rpcError(null, -32600, "Invalid request"));
		return accepted();
	}
	if (typeof record.method !== "string" || record.method.length === 0 || !("id" in record) || id === null) {
		return rpcResponse(400, rpcError(id, -32600, "Invalid request"));
	}
	const era = classify(request, record.method, record.params);
	if (era.kind === "mismatch") return headerMismatch(id);
	if (era.kind === "unsupported") return unsupportedVersion(id, era.version);
	if (era.kind === "modern" && !modernHeadersMatch(request, record.method, record.params)) return headerMismatch(id);
	const result = dispatch(era, record.method, record.params);
	if (isRpcError(result)) {
		const status = result.error.code === -32601 && era.kind === "modern" ? 404 : 200;
		return rpcResponse(status, { ...result, id });
	}
	return rpcResponse(200, { jsonrpc: "2.0", id, result });
}

/**
 * Server card and Streamable HTTP responses, or null when this request is neither route.
 * The request body is read only for POST `/mcp`, and it is never stored.
 */
export async function mcpResponse(request: Request): Promise<Response | null> {
	const path = normalizePath(new URL(request.url).pathname);
	if (path === MCP_CARD_PATH) {
		const method = request.method.toUpperCase();
		await discardBody(request);
		if (!originAllowed(request.headers.get("origin"))) return originForbidden(CARD_ALLOW);
		if (method === "OPTIONS") {
			return new Response(null, { status: 204, headers: withCors(new Headers({ allow: CARD_ALLOW }), cardCors()) });
		}
		if (method !== "GET" && method !== "HEAD") return transportError(405, "method_not_allowed", CARD_ALLOW);
		return cardResponse(request);
	}
	if (path !== MCP_PATH) return null;
	const method = request.method.toUpperCase();
	if (!originAllowed(request.headers.get("origin"))) {
		await discardBody(request);
		return originForbidden();
	}
	if (method === "OPTIONS") {
		await discardBody(request);
		return new Response(null, { status: 204, headers: withCors(new Headers({ allow: MCP_ALLOW }), mcpCors()) });
	}
	if (method !== "POST") {
		await discardBody(request);
		return transportError(405, "method_not_allowed");
	}
	return mcpPost(request);
}

function modernCall(id: string | number, method: string, params: Record<string, unknown>): Request {
	const name = params.name;
	const headers: Record<string, string> = {
		"content-type": "application/json",
		accept: "application/json, text/event-stream",
		"mcp-protocol-version": MODERN_PROTOCOL,
		"mcp-method": method,
	};
	if (typeof name === "string") headers["mcp-name"] = name;
	return new Request(MCP_URL, {
		method: "POST",
		headers,
		body: JSON.stringify({
			jsonrpc: "2.0",
			id,
			method,
			params: {
				...params,
				_meta: {
					[PROTOCOL_KEY]: MODERN_PROTOCOL,
					[CLIENT_INFO_KEY]: { name: "discovery-check", version: "1.0.0" },
					[CLIENT_CAPABILITIES_KEY]: {},
				},
			},
		}),
	});
}

export async function assertMcpResponses(): Promise<void> {
	const errors: string[] = [];
	const card = mcpServerCard();
	const body = mcpCardText();
	if (!body.endsWith("\n")) errors.push("mcp server card must end with a newline");
	let parsed: McpServerCard;
	try {
		parsed = JSON.parse(body) as McpServerCard;
	} catch (error) {
		throw new Error(`mcp server card is not JSON (${error instanceof Error ? error.message : error})`);
	}
	if (JSON.stringify(parsed) !== JSON.stringify(card)) errors.push("mcp server card text drifted from mcpServerCard()");
	if (parsed.serverInfo.name !== SERVER_NAME || parsed.serverInfo.version !== SERVER_VERSION) {
		errors.push("serverInfo name and version are required");
	}
	if (parsed.url !== MCP_URL || parsed.transport.endpoint !== MCP_URL || !parsed.transport.endpoint.startsWith("https://")) {
		errors.push("transport endpoint must be the HTTPS /mcp URL");
	}
	if (parsed.transport.type !== "streamable-http") errors.push("transport type must be streamable-http");
	if (JSON.stringify(parsed.transport.supportedProtocolVersions) !== JSON.stringify(SUPPORTED_PROTOCOLS)) {
		errors.push("supportedProtocolVersions drifted");
	}
	if (!parsed.capabilities.tools || parsed.capabilities.resources || parsed.capabilities.prompts) {
		errors.push("capabilities must advertise tools only");
	}

	const get = await mcpResponse(new Request(MCP_CARD_URL));
	if (!get || get.status !== 200) errors.push("GET mcp server card must be 200");
	else {
		if (get.headers.get("content-type") !== JSON_TYPE) errors.push("mcp server card content-type");
		if (get.headers.get("cache-control") !== CARD_CACHE) errors.push("mcp server card cache-control");
		if (get.headers.get("access-control-allow-origin") !== "*") errors.push("mcp server card CORS");
		const etag = get.headers.get("etag");
		if (etag !== mcpCardEtag(body)) errors.push("mcp server card etag");
		if ((await get.text()) !== body) errors.push("GET mcp server card body drifted");
		const cached = await mcpResponse(new Request(MCP_CARD_URL, { headers: etag ? { "if-none-match": etag } : {} }));
		if (!cached || cached.status !== 304) errors.push("If-None-Match must return 304");
		else if (await cached.text()) errors.push("304 included a body");
	}

	const head = await mcpResponse(new Request(MCP_CARD_URL, { method: "HEAD" }));
	if (!head || head.status !== 200) errors.push("HEAD mcp server card must be 200");
	else {
		const length = Number(head.headers.get("content-length"));
		if (length !== new TextEncoder().encode(body).byteLength) errors.push("HEAD content-length");
		if (await head.text()) errors.push("HEAD included a body");
	}

	const sentinel = "super-secret-mcp-sentinel";
	const posted = await mcpResponse(new Request(MCP_CARD_URL, { method: "POST", body: sentinel }));
	if (!posted || posted.status !== 405) errors.push("POST mcp server card must be 405");
	else if ((await posted.text()).includes(sentinel)) errors.push("405 echoed the request body");

	const options = await mcpResponse(new Request(`${MCP_CARD_URL}/`, { method: "OPTIONS" }));
	if (!options || options.status !== 204) errors.push("OPTIONS mcp server card must be 204");

	const getEndpoint = await mcpResponse(new Request(MCP_URL, { method: "GET" }));
	if (!getEndpoint || getEndpoint.status !== 405) errors.push("GET /mcp must be 405");
	const deleted = await mcpResponse(new Request(MCP_URL, { method: "DELETE" }));
	if (!deleted || deleted.status !== 405) errors.push("DELETE /mcp must be 405");
	const mcpOptions = await mcpResponse(new Request(`${MCP_URL}/`, { method: "OPTIONS" }));
	if (!mcpOptions || mcpOptions.status !== 204) errors.push("OPTIONS /mcp must be 204");

	const forbidden = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: {
				origin: `http://${sentinel}.example`,
				"content-type": "application/json",
				accept: "application/json, text/event-stream",
			},
			body: sentinel,
		}),
	);
	if (!forbidden || forbidden.status !== 403) errors.push("private or non-https Origin must be 403");
	else if ((await forbidden.text()).includes(sentinel)) errors.push("403 echoed the origin or body");

	const local = await mcpResponse(
		new Request(MCP_CARD_URL, { headers: { origin: "http://127.0.0.1:8787" } }),
	);
	if (!local || local.status !== 403) errors.push("localhost Origin must be 403");

	const initialize = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				accept: "application/json, text/event-stream",
				"mcp-protocol-version": "2025-06-18",
			},
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 1,
				method: "initialize",
				params: {
					protocolVersion: "2025-06-18",
					capabilities: {},
					clientInfo: { name: "discovery-check", version: "1.0.0" },
				},
			}),
		}),
	);
	if (!initialize || initialize.status !== 200) errors.push("initialize must be 200");
	else {
		if (initialize.headers.get("mcp-session-id")) errors.push("initialize must not mint a session");
		const result = JSON.parse(await initialize.text()) as {
			result?: { protocolVersion?: string; capabilities?: { tools?: unknown; resources?: unknown; prompts?: unknown }; serverInfo?: { name?: string; version?: string } };
		};
		if (result.result?.protocolVersion !== "2025-06-18") errors.push("initialize must echo a supported legacy version");
		if (!result.result?.capabilities?.tools || result.result.capabilities.resources || result.result.capabilities.prompts) {
			errors.push("initialize capabilities must advertise tools only");
		}
		if (result.result?.serverInfo?.name !== card.serverInfo.name || result.result?.serverInfo?.version !== card.serverInfo.version) {
			errors.push("initialize serverInfo drifted from the card");
		}
	}

	const initialized = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
			body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
		}),
	);
	if (!initialized || initialized.status !== 202) errors.push("notifications/initialized must be 202");
	else if (await initialized.text()) errors.push("202 included a body");

	const listed = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
			body: JSON.stringify({ jsonrpc: "2.0", id: "list-1", method: "tools/list" }),
		}),
	);
	if (!listed || listed.status !== 200) errors.push("legacy tools/list must be 200");
	else {
		const result = JSON.parse(await listed.text()) as { result?: { tools?: { name?: string }[] } };
		if (result.result?.tools?.map((tool) => tool.name).join(",") !== TOOL_NAME) {
			errors.push("legacy tools/list must name read_practice");
		}
	}

	const called = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: "call-1",
				method: "tools/call",
				params: { name: TOOL_NAME, arguments: { note: sentinel } },
			}),
		}),
	);
	if (!called || called.status !== 200) errors.push("tools/call with arguments must be 200");
	else if ((await called.text()).includes(sentinel)) errors.push("tools/call echoed an argument");

	const read = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: "call-2",
				method: "tools/call",
				params: { name: TOOL_NAME, arguments: {} },
			}),
		}),
	);
	if (!read || read.status !== 200) errors.push("tools/call must be 200");
	else {
		const result = JSON.parse(await read.text()) as { result?: { isError?: boolean; content?: { text?: string }[] } };
		const text = result.result?.content?.[0]?.text ?? "";
		if (result.result?.isError !== false || !text.includes(`${ORIGIN}/llms.txt`) || !text.includes("devops")) {
			errors.push("tools/call must return the public index");
		}
	}

	const discover = await mcpResponse(modernCall("discover-1", "server/discover", {}));
	if (!discover || discover.status !== 200) errors.push("server/discover must be 200");
	else {
		const result = JSON.parse(await discover.text()) as {
			result?: {
				supportedVersions?: string[];
				capabilities?: { tools?: unknown; resources?: unknown; prompts?: unknown };
				_meta?: { [SERVER_INFO_KEY]?: { name?: string; version?: string } };
			};
		};
		if (!result.result?.supportedVersions?.includes(MODERN_PROTOCOL)) errors.push("server/discover must list 2026-07-28");
		if (!result.result?.capabilities?.tools || result.result.capabilities.resources || result.result.capabilities.prompts) {
			errors.push("server/discover capabilities must advertise tools only");
		}
		const info = result.result?._meta?.[SERVER_INFO_KEY];
		if (info?.name !== card.serverInfo.name || info?.version !== card.serverInfo.version) {
			errors.push("server/discover serverInfo drifted from the card");
		}
	}

	const modernTool = await mcpResponse(modernCall("call-3", "tools/call", { name: TOOL_NAME, arguments: {} }));
	if (!modernTool || modernTool.status !== 200) errors.push("modern tools/call must be 200");
	else {
		const result = JSON.parse(await modernTool.text()) as { result?: { resultType?: string; isError?: boolean } };
		if (result.result?.resultType !== "complete" || result.result.isError !== false) {
			errors.push("modern tools/call result shape");
		}
	}

	const modernResources = await mcpResponse(modernCall(4, "resources/list", {}));
	if (!modernResources || modernResources.status !== 404) errors.push("modern resources/list must be 404");
	else if (JSON.parse(await modernResources.text()).error?.code !== -32601) errors.push("resources/list must be method not found");

	const legacyPrompts = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
			body: JSON.stringify({ jsonrpc: "2.0", id: 5, method: "prompts/list" }),
		}),
	);
	if (!legacyPrompts || legacyPrompts.status !== 200) errors.push("legacy prompts/list must be 200");
	else if (JSON.parse(await legacyPrompts.text()).error?.code !== -32601) errors.push("prompts/list must be method not found");

	const mismatch = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				accept: "application/json, text/event-stream",
				"mcp-protocol-version": MODERN_PROTOCOL,
				"mcp-method": sentinel,
			},
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 6,
				method: "tools/list",
				params: {
					_meta: {
						[PROTOCOL_KEY]: MODERN_PROTOCOL,
						[CLIENT_INFO_KEY]: { name: "discovery-check", version: "1.0.0" },
						[CLIENT_CAPABILITIES_KEY]: {},
					},
				},
			}),
		}),
	);
	if (!mismatch || mismatch.status !== 400) errors.push("Mcp-Method mismatch must be 400");
	else if ((await mismatch.text()).includes(sentinel)) errors.push("header mismatch echoed the header");

	const old = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				accept: "application/json, text/event-stream",
				"mcp-protocol-version": "1900-01-01",
				"mcp-method": "tools/list",
			},
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 7,
				method: "tools/list",
				params: { note: sentinel, _meta: { [PROTOCOL_KEY]: "1900-01-01", [CLIENT_INFO_KEY]: { name: sentinel, version: "1" } } },
			}),
		}),
	);
	if (!old || old.status !== 400) errors.push("unsupported protocol version must be 400");
	else {
		const text = await old.text();
		if (text.includes(sentinel)) errors.push("unsupported version echoed the request");
		const error = JSON.parse(text) as { error?: { code?: number; data?: { supported?: string[]; requested?: string } } };
		if (error.error?.code !== -32022 || !error.error.data?.supported?.includes(MODERN_PROTOCOL)) {
			errors.push("unsupported version must list supported protocols");
		}
		if (error.error?.data?.requested !== "1900-01-01") errors.push("unsupported version must name the requested date");
	}

	const textType = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: { "content-type": "text/plain", accept: "application/json, text/event-stream" },
			body: sentinel,
		}),
	);
	if (!textType || textType.status !== 415) errors.push("non-JSON POST must be 415");
	else if ((await textType.text()).includes(sentinel)) errors.push("415 echoed the request body");

	const missingAccept = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		}),
	);
	if (!missingAccept || missingAccept.status !== 406) errors.push("missing Accept must be 406");

	const oversized = "x".repeat(MAX_BODY + 1);
	const tooBig = await mcpResponse(
		new Request(MCP_URL, {
			method: "POST",
			headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
			body: oversized,
		}),
	);
	if (!tooBig || tooBig.status !== 413) errors.push("oversized POST must be 413");
	else if ((await tooBig.text()).includes("xxxx")) errors.push("413 echoed the request body");

	const ignored = await mcpResponse(new Request(`${ORIGIN}/en/`));
	if (ignored !== null) errors.push("mcp handler must ignore site pages");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
