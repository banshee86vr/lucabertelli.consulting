/**
 * Machine Payment Protocol discovery for this public consulting practice.
 *
 * `GET /openapi.json` is the OpenAPI 3.1 document. `POST /api/engagement`
 * is the only payable operation. `x-payment-info.amount` is null because the
 * price is a written proposal, not a fixed machine charge. The call returns
 * 402, does not settle Tempo, Stripe, Lightning, or card payments, and does
 * not store the body.
 */

import { ORIGIN } from "./agent-card.ts";
import { originAllowed } from "./mcp-server.ts";

export const OPENAPI_PATH = "/openapi.json";
export const ENGAGEMENT_PATH = "/api/engagement";
export const OPENAPI_URL = `${ORIGIN}${OPENAPI_PATH}`;
export const ENGAGEMENT_URL = `${ORIGIN}${ENGAGEMENT_PATH}`;
export const OPENAPI_FILE = "openapi.json";

export const PAYMENT_INTENT = "charge" as const;
export const PAYMENT_METHOD = "card" as const;
export const PAYMENT_CURRENCY = "eur";
export const SERVICE_CATEGORIES = ["developer-tools"] as const;

const JSON_TYPE = "application/json; charset=utf-8";
const JSON_TYPE_TOKEN = "application/json";
const DOCUMENT_ALLOW = "GET, HEAD, OPTIONS";
const ENGAGEMENT_ALLOW = "POST, OPTIONS";
const DOCUMENT_CACHE = "public, max-age=300";
const MAX_BODY = 65_536;

export const PAYMENT_DESCRIPTION =
	"The engagement price is a written proposal in EUR. amount is null because this endpoint does not publish a fixed charge. This origin does not settle Tempo, Stripe, Lightning, or card payments and does not store payment credentials.";

export const ENGAGEMENT_REFUSAL =
	"This origin does not settle Tempo, Stripe, Lightning, or card payments and does not store payment credentials. Consulting work is priced in a written proposal. Write to info@lucabertelli.consulting. Do not send a card number or a payment token.";

export interface PaymentInfo {
	intent: typeof PAYMENT_INTENT;
	method: typeof PAYMENT_METHOD;
	amount: null;
	currency: typeof PAYMENT_CURRENCY;
	description: string;
}

export interface OpenApiDocument {
	openapi: "3.1.0";
	info: { title: string; version: string; description: string };
	servers: { url: string }[];
	"x-service-info": {
		categories: string[];
		docs: { homepage: string; apiReference: string; llms: string };
	};
	paths: {
		[ENGAGEMENT_PATH]: {
			post: {
				operationId: string;
				summary: string;
				description: string;
				"x-payment-info": PaymentInfo;
				requestBody: {
					required: false;
					content: {
						"application/json": {
							schema: {
								type: "object";
								additionalProperties: false;
								properties: {
									message: { type: "string"; maxLength: number };
								};
							};
						};
					};
				};
				responses: Record<string, { description: string; content?: unknown }>;
			};
		};
	};
}

function jsonText(value: unknown): string {
	return `${JSON.stringify(value, null, 2)}\n`;
}

export function paymentInfo(): PaymentInfo {
	return {
		intent: PAYMENT_INTENT,
		method: PAYMENT_METHOD,
		amount: null,
		currency: PAYMENT_CURRENCY,
		description: PAYMENT_DESCRIPTION,
	};
}

export function openApiDocument(): OpenApiDocument {
	return {
		openapi: "3.1.0",
		info: {
			title: "Luca Bertelli Consulting",
			version: "1.0.0",
			description:
				"Machine Payment Protocol discovery for Luca Bertelli Consulting. POST /api/engagement is the payable operation. amount is null because the price is a written proposal. This origin does not settle the charge.",
		},
		servers: [{ url: ORIGIN }],
		"x-service-info": {
			categories: [...SERVICE_CATEGORIES],
			docs: {
				homepage: `${ORIGIN}/en/`,
				apiReference: `${ORIGIN}/api/docs.md`,
				llms: `${ORIGIN}/llms.txt`,
			},
		},
		paths: {
			[ENGAGEMENT_PATH]: {
				post: {
					operationId: "postEngagement",
					summary: "Request a consulting engagement",
					description:
						"Payable operation. The body is discarded and is not stored. The response is 402. Do not send a card number or a payment token.",
					"x-payment-info": paymentInfo(),
					requestBody: {
						required: false,
						content: {
							"application/json": {
								schema: {
									type: "object",
									additionalProperties: false,
									properties: {
										message: { type: "string", maxLength: 4000 },
									},
								},
							},
						},
					},
					responses: {
						"402": {
							description: "Payment Required",
							content: {
								"application/json": {
									schema: {
										type: "object",
										additionalProperties: false,
										required: ["error", "message"],
										properties: {
											error: { type: "string", const: "payment_not_settled" },
											message: { type: "string" },
										},
									},
								},
							},
						},
						"403": { description: "Origin is local, private, or not https." },
						"413": { description: "Request body is larger than 64 KiB." },
						"415": { description: "Content-Type is not application/json." },
					},
				},
			},
		},
	};
}

export function openApiText(): string {
	return jsonText(openApiDocument());
}

export function openApiEtag(body: string): string {
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

function documentCors(): Headers {
	return new Headers({
		"access-control-allow-origin": "*",
		"access-control-allow-methods": DOCUMENT_ALLOW,
		"access-control-allow-headers": "Content-Type, If-None-Match",
		"access-control-expose-headers": "ETag",
	});
}

function engagementCors(): Headers {
	return new Headers({
		"access-control-allow-origin": "*",
		"access-control-allow-methods": ENGAGEMENT_ALLOW,
		"access-control-allow-headers": "Content-Type",
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

function mediaType(header: string | null): string {
	return (header ?? "").split(";")[0].trim().toLowerCase();
}

async function discardBody(request: Request): Promise<void> {
	if (request.body === null) return;
	try {
		await request.body.cancel();
	} catch {
		// The body is discarded on purpose.
	}
}

function jsonResponse(status: number, value: unknown, allow: string, cors: Headers): Response {
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
	return new Response(body, { status, headers });
}

function documentResponse(request: Request): Response {
	const body = openApiText();
	const etag = openApiEtag(body);
	const headers = withCors(
		new Headers({
			"content-type": JSON_TYPE,
			allow: DOCUMENT_ALLOW,
			"cache-control": DOCUMENT_CACHE,
			etag,
		}),
		documentCors(),
	);
	if (etagMatches(request.headers.get("if-none-match"), etag)) {
		return new Response(null, { status: 304, headers });
	}
	headers.set("content-length", String(new TextEncoder().encode(body).byteLength));
	if (request.method.toUpperCase() === "HEAD") {
		return new Response(null, { status: 200, headers });
	}
	return new Response(body, { status: 200, headers });
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

function refusal(): { error: "payment_not_settled"; message: string } {
	return { error: "payment_not_settled", message: ENGAGEMENT_REFUSAL };
}

async function engagementResponse(request: Request): Promise<Response> {
	const method = request.method.toUpperCase();
	const cors = engagementCors();
	if (!originAllowed(request.headers.get("origin"))) {
		await discardBody(request);
		return jsonResponse(403, { error: "origin_not_allowed", message: "Origin is not allowed." }, ENGAGEMENT_ALLOW, cors);
	}
	if (method === "OPTIONS") {
		await discardBody(request);
		return new Response(null, { status: 204, headers: withCors(new Headers({ allow: ENGAGEMENT_ALLOW }), cors) });
	}
	if (method !== "POST") {
		await discardBody(request);
		return jsonResponse(405, { error: "method_not_allowed", message: "Method not allowed." }, ENGAGEMENT_ALLOW, cors);
	}
	const type = request.headers.get("content-type");
	if (type !== null && mediaType(type) !== JSON_TYPE_TOKEN) {
		await discardBody(request);
		return jsonResponse(
			415,
			{ error: "unsupported_media_type", message: "Content-Type must be application/json." },
			ENGAGEMENT_ALLOW,
			cors,
		);
	}
	const declared = request.headers.get("content-length");
	if (declared !== null) {
		const size = Number(declared);
		if (!Number.isInteger(size) || size < 0) {
			await discardBody(request);
			return jsonResponse(400, { error: "invalid_request", message: "Content-Length is invalid." }, ENGAGEMENT_ALLOW, cors);
		}
		if (size > MAX_BODY) {
			await discardBody(request);
			return jsonResponse(
				413,
				{ error: "payload_too_large", message: "Request body is larger than 64 KiB." },
				ENGAGEMENT_ALLOW,
				cors,
			);
		}
	}
	const drained = await drainLimited(request, MAX_BODY);
	if (drained === "too_large") {
		return jsonResponse(
			413,
			{ error: "payload_too_large", message: "Request body is larger than 64 KiB." },
			ENGAGEMENT_ALLOW,
			cors,
		);
	}
	if (drained === "unreadable") {
		return jsonResponse(400, { error: "invalid_request", message: "The request body could not be read." }, ENGAGEMENT_ALLOW, cors);
	}
	return jsonResponse(402, refusal(), ENGAGEMENT_ALLOW, cors);
}

/**
 * OpenAPI document and engagement refusal, or null when this request is neither route.
 * The engagement body is size-capped and dropped. It is not stored or echoed.
 */
export async function mppResponse(request: Request): Promise<Response | null> {
	const path = normalizePath(new URL(request.url).pathname);
	if (path === OPENAPI_PATH) {
		const method = request.method.toUpperCase();
		if (!originAllowed(request.headers.get("origin"))) {
			await discardBody(request);
			return jsonResponse(
				403,
				{ error: "origin_not_allowed", message: "Origin is not allowed." },
				DOCUMENT_ALLOW,
				documentCors(),
			);
		}
		if (method === "OPTIONS") {
			await discardBody(request);
			return new Response(null, {
				status: 204,
				headers: withCors(new Headers({ allow: DOCUMENT_ALLOW }), documentCors()),
			});
		}
		await discardBody(request);
		if (method !== "GET" && method !== "HEAD") {
			return jsonResponse(
				405,
				{ error: "method_not_allowed", message: "Method not allowed." },
				DOCUMENT_ALLOW,
				documentCors(),
			);
		}
		return documentResponse(request);
	}
	if (path === ENGAGEMENT_PATH) return engagementResponse(request);
	return null;
}

export async function assertMppResponses(): Promise<void> {
	const errors: string[] = [];
	const document = openApiDocument();
	const body = openApiText();
	if (!body.endsWith("\n")) errors.push("openapi document must end with a newline");
	if (new TextEncoder().encode(body).byteLength > 65_536) errors.push("openapi document is larger than 64 KiB");
	let parsed: OpenApiDocument;
	try {
		parsed = JSON.parse(body) as OpenApiDocument;
	} catch (error) {
		throw new Error(`openapi document is not JSON (${error instanceof Error ? error.message : error})`);
	}
	if (JSON.stringify(parsed) !== JSON.stringify(document)) errors.push("openapi text drifted from openApiDocument()");
	if (parsed.openapi !== "3.1.0") errors.push("openapi version must be 3.1.0");
	if (parsed.info.title !== "Luca Bertelli Consulting" || !parsed.info.version) errors.push("openapi info");
	if (parsed.servers[0]?.url !== ORIGIN) errors.push("openapi server must be this origin");
	if (parsed["x-service-info"].categories.join(",") !== SERVICE_CATEGORIES.join(",")) {
		errors.push("x-service-info categories drifted");
	}
	const docs = parsed["x-service-info"].docs;
	if (docs.homepage !== `${ORIGIN}/en/` || docs.apiReference !== `${ORIGIN}/api/docs.md` || docs.llms !== `${ORIGIN}/llms.txt`) {
		errors.push("x-service-info docs must stay on this origin");
	}
	const operation = parsed.paths[ENGAGEMENT_PATH]?.post;
	if (!operation) errors.push("POST /api/engagement is missing");
	else {
		const info = operation["x-payment-info"];
		if (info.intent !== "charge" || info.method !== "card" || info.amount !== null || info.currency !== "eur") {
			errors.push("x-payment-info must be a charge in eur with a null amount");
		}
		if (!info.description.includes("does not settle")) errors.push("x-payment-info must say this origin does not settle");
		if ("offers" in info) errors.push("x-payment-info must not combine offers with the shorthand fields");
		if (operation.responses["402"]?.description !== "Payment Required") errors.push("payable operation must declare 402");
		const keys = Object.keys(info);
		if (keys.join(",") !== "intent,method,amount,currency,description") errors.push("x-payment-info fields drifted");
	}

	const get = await mppResponse(new Request(OPENAPI_URL));
	if (!get || get.status !== 200) errors.push("GET /openapi.json must be 200");
	else {
		if (get.headers.get("content-type") !== JSON_TYPE) errors.push("openapi content-type");
		if (get.headers.get("cache-control") !== DOCUMENT_CACHE) errors.push("openapi cache-control");
		if (get.headers.get("access-control-allow-origin") !== "*") errors.push("openapi CORS");
		if ((await get.text()) !== body) errors.push("GET /openapi.json body drifted");
		const etag = get.headers.get("etag");
		const cached = await mppResponse(new Request(OPENAPI_URL, { headers: etag ? { "if-none-match": etag } : {} }));
		if (!cached || cached.status !== 304) errors.push("If-None-Match must return 304");
		else if (await cached.text()) errors.push("304 included a body");
	}

	const head = await mppResponse(new Request(`${OPENAPI_URL}/`, { method: "HEAD" }));
	if (!head || head.status !== 200) errors.push("HEAD /openapi.json must be 200");
	else if (Number(head.headers.get("content-length")) !== new TextEncoder().encode(body).byteLength) {
		errors.push("HEAD content-length");
	} else if (await head.text()) errors.push("HEAD included a body");

	const posted = await mppResponse(new Request(OPENAPI_URL, { method: "POST" }));
	if (!posted || posted.status !== 405) errors.push("POST /openapi.json must be 405");

	const options = await mppResponse(new Request(OPENAPI_URL, { method: "OPTIONS" }));
	if (!options || options.status !== 204) errors.push("OPTIONS /openapi.json must be 204");

	const sentinel = "4242424242424242";
	const charge = await mppResponse(
		new Request(ENGAGEMENT_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ message: sentinel, card: sentinel }),
		}),
	);
	if (!charge || charge.status !== 402) errors.push("POST /api/engagement must be 402");
	else {
		const text = await charge.text();
		if (text.includes(sentinel)) errors.push("402 echoed the request body");
		const payload = JSON.parse(text) as { error?: string; message?: string };
		if (payload.error !== "payment_not_settled" || payload.message !== ENGAGEMENT_REFUSAL) {
			errors.push("402 body drifted");
		}
		if (charge.headers.get("cache-control") !== "no-store") errors.push("402 must not be cached");
		if (charge.headers.get("www-authenticate")?.toLowerCase().includes("payment")) {
			errors.push("402 must not advertise a Payment challenge");
		}
	}

	const bare = await mppResponse(new Request(ENGAGEMENT_URL, { method: "POST" }));
	if (!bare || bare.status !== 402) errors.push("POST /api/engagement without a body must be 402");

	const textType = await mppResponse(
		new Request(ENGAGEMENT_URL, {
			method: "POST",
			headers: { "content-type": "text/plain" },
			body: sentinel,
		}),
	);
	if (!textType || textType.status !== 415) errors.push("non-JSON POST must be 415");
	else if ((await textType.text()).includes(sentinel)) errors.push("415 echoed the request body");

	const oversized = "x".repeat(MAX_BODY + 1);
	const tooBig = await mppResponse(
		new Request(ENGAGEMENT_URL, {
			method: "POST",
			headers: { "content-type": "application/json", "content-length": String(oversized.length) },
			body: oversized,
		}),
	);
	if (!tooBig || tooBig.status !== 413) errors.push("oversized POST must be 413");
	else if ((await tooBig.text()).includes("xxxx")) errors.push("413 echoed the request body");

	const local = await mppResponse(
		new Request(ENGAGEMENT_URL, {
			method: "POST",
			headers: { origin: "http://127.0.0.1:8787", "content-type": "application/json" },
			body: JSON.stringify({ message: sentinel }),
		}),
	);
	if (!local || local.status !== 403) errors.push("local Origin must be 403");
	else if ((await local.text()).includes(sentinel)) errors.push("403 echoed the request body");

	const getEngagement = await mppResponse(new Request(ENGAGEMENT_URL));
	if (!getEngagement || getEngagement.status !== 405) errors.push("GET /api/engagement must be 405");

	const ignored = await mppResponse(new Request(`${ORIGIN}/en/`));
	if (ignored !== null) errors.push("mpp handler must ignore site pages");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
