/**
 * Agentic Resource Discovery catalog for this public consulting practice.
 *
 * `GET /.well-known/ai-catalog.json` is the path the isitagentready scan
 * fetches. `GET /.well-known/ard.json` is the path ARD v0.91 tells consumers
 * to fetch. Both URLs return the same document. `specVersion` is the
 * AI Catalog data model, `1.0`, not the ARD spec version. Each entry points
 * at a document this origin already serves. Nothing here is inlined, and the
 * catalog does not add a search endpoint.
 */

import { AGENT_CARD_URL, ORIGIN } from "./agent-card.ts";
import { SKILL_URL } from "./agent-skills.ts";
import { MCP_CARD_URL } from "./mcp-server.ts";
import { OPENAPI_URL } from "./mpp.ts";

export const AI_CATALOG_PATH = "/.well-known/ai-catalog.json";
export const ARD_PATH = "/.well-known/ard.json";
export const AI_CATALOG_URL = `${ORIGIN}${AI_CATALOG_PATH}`;
export const ARD_URL = `${ORIGIN}${ARD_PATH}`;
export const SPEC_VERSION = "1.0";
export const HOST_NAME = "Luca Bertelli Consulting";
export const HOST_IDENTIFIER = ORIGIN;
export const SITE_OPENAPI_URL = `${ORIGIN}/api/openapi.yaml`;

export const MCP_ENTRY_TYPE = "application/mcp-server-card+json";
export const A2A_ENTRY_TYPE = "application/a2a-agent-card+json";
export const SKILL_ENTRY_TYPE = "application/agent-skills+md";
export const OPENAPI_YAML_TYPE = "application/vnd.oai.openapi+yaml";
export const OPENAPI_JSON_TYPE = "application/vnd.oai.openapi+json";

const JSON_TYPE = "application/json; charset=utf-8";
const ALLOW = "GET, HEAD, OPTIONS";
const CACHE = "public, max-age=3600";
const PATHS = new Set([AI_CATALOG_PATH, ARD_PATH]);
const URN = /^urn:air:lucabertelli\.consulting:[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MEDIA_TYPE = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/;

export interface ArdHost {
	displayName: string;
	identifier: string;
	documentationUrl: string;
}

export interface ArdEntry {
	identifier: string;
	displayName: string;
	type: string;
	url: string;
	description: string;
	representativeQueries: string[];
}

export interface ArdCatalog {
	specVersion: string;
	host: ArdHost;
	entries: ArdEntry[];
}

function entry(
	name: string,
	namespace: string,
	displayName: string,
	type: string,
	url: string,
	description: string,
	representativeQueries: string[],
): ArdEntry {
	return {
		identifier: `urn:air:lucabertelli.consulting:${namespace}:${name}`,
		displayName,
		type,
		url,
		description,
		representativeQueries,
	};
}

export function aiCatalog(): ArdCatalog {
	return {
		specVersion: SPEC_VERSION,
		host: {
			displayName: HOST_NAME,
			identifier: HOST_IDENTIFIER,
			documentationUrl: `${ORIGIN}/llms.txt`,
		},
		entries: [
			entry(
				"practice",
				"server",
				"Practice MCP server",
				MCP_ENTRY_TYPE,
				MCP_CARD_URL,
				"Public MCP server card. The read_practice tool returns the practice index. Resources, prompts, and sessions are off.",
				[
					"what public documents does this consulting practice publish",
					"list the English service page URLs",
					"read the practice index",
				],
			),
			entry(
				"practice",
				"a2a",
				HOST_NAME,
				A2A_ENTRY_TYPE,
				AGENT_CARD_URL,
				"A2A agent card for Luca Bertelli Consulting. SendMessage returns a public message and does not create a task.",
				[
					"what services does Luca Bertelli Consulting offer",
					"how do I contact this platform engineering practice",
					"what does the consulting agent answer",
				],
			),
			entry(
				"consulting-practice",
				"skill",
				"Consulting practice",
				SKILL_ENTRY_TYPE,
				SKILL_URL,
				"Agent skill that tells a client how to read this public practice site. Access is anonymous.",
				[
					"how should an agent read this consulting site",
					"where is the machine-readable index of this practice",
					"which documents describe anonymous access",
				],
			),
			entry(
				"site",
				"api",
				"Public site API",
				OPENAPI_YAML_TYPE,
				SITE_OPENAPI_URL,
				"OpenAPI description of the public read-only documents on this origin.",
				[
					"which public HTTP routes does this site document",
					"show the OpenAPI description of the agent index",
					"what discovery documents can an agent fetch",
				],
			),
			entry(
				"engagement",
				"api",
				"Engagement OpenAPI",
				OPENAPI_JSON_TYPE,
				OPENAPI_URL,
				"OpenAPI document for the engagement declaration. amount is null because consulting work is priced in a written proposal.",
				[
					"does this practice publish a fixed machine charge",
					"what does the engagement endpoint return",
					"how is consulting work priced",
				],
			),
		],
	};
}

export function aiCatalogText(): string {
	return `${JSON.stringify(aiCatalog(), null, 2)}\n`;
}

/** Paths relative to `public/` and `dist/client/`. Both files are the same bytes. */
export function catalogFiles(): Record<string, string> {
	const body = aiCatalogText();
	return {
		[AI_CATALOG_PATH.slice(1)]: body,
		[ARD_PATH.slice(1)]: body,
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

function methodNotAllowed(): Response {
	return new Response(`${JSON.stringify({ error: "method_not_allowed" }, null, 2)}\n`, {
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
 * Catalog responses for both well-known paths, or null for every other path.
 * The request body is never read.
 */
export async function ardResponse(request: Request): Promise<Response | null> {
	const path = normalizePath(new URL(request.url).pathname);
	if (!PATHS.has(path)) return null;
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
	return documentResponse(request, aiCatalogText());
}

export function assertArdResponses(): void {
	const errors: string[] = [];
	const body = aiCatalogText();
	if (!body.endsWith("\n")) errors.push("ARD catalog must end with a newline");

	let catalog: ArdCatalog;
	try {
		catalog = JSON.parse(body) as ArdCatalog;
	} catch (error) {
		throw new Error(`ARD catalog is not JSON (${error instanceof Error ? error.message : error})`);
	}
	if (catalog.specVersion !== SPEC_VERSION) errors.push("ARD specVersion");
	if (catalog.host?.displayName !== HOST_NAME || catalog.host?.identifier !== HOST_IDENTIFIER) {
		errors.push("ARD host");
	}
	if (catalog.host?.documentationUrl !== `${ORIGIN}/llms.txt`) errors.push("ARD host documentationUrl");
	if (!Array.isArray(catalog.entries) || catalog.entries.length < 2 || catalog.entries.length > 8) {
		errors.push("ARD entries");
	}

	const seen = new Set<string>();
	for (const item of catalog.entries ?? []) {
		if (!URN.test(item.identifier)) errors.push(`ARD identifier ${item.identifier}`);
		if (seen.has(item.identifier)) errors.push(`duplicate ARD identifier ${item.identifier}`);
		seen.add(item.identifier);
		if (!item.displayName) errors.push(`ARD displayName missing on ${item.identifier}`);
		if (!MEDIA_TYPE.test(item.type)) errors.push(`ARD type ${item.type}`);
		const hasUrl = typeof item.url === "string" && item.url.length > 0;
		const hasData = "data" in item;
		if (hasUrl === hasData) errors.push(`ARD entry ${item.identifier} must have exactly one of url or data`);
		if (hasUrl && !item.url.startsWith(`${ORIGIN}/`)) errors.push(`ARD url left the origin: ${item.url}`);
		const queries = item.representativeQueries;
		if (!Array.isArray(queries) || queries.length < 2 || queries.length > 5) {
			errors.push(`ARD representativeQueries on ${item.identifier}`);
		} else if (queries.some((query) => typeof query !== "string" || query.trim() === "")) {
			errors.push(`ARD representativeQueries empty on ${item.identifier}`);
		}
	}

	const urls = new Set((catalog.entries ?? []).map((item) => item.url));
	for (const url of [MCP_CARD_URL, AGENT_CARD_URL, SKILL_URL, SITE_OPENAPI_URL, OPENAPI_URL]) {
		if (!urls.has(url)) errors.push(`ARD catalog is missing ${url}`);
	}

	const files = catalogFiles();
	if (files[AI_CATALOG_PATH.slice(1)] !== files[ARD_PATH.slice(1)]) {
		errors.push("ARD catalog files diverged");
	}

	if (errors.length > 0) throw new Error(errors.join("\n"));
}

export async function assertArdHttp(): Promise<void> {
	const errors: string[] = [];
	const body = aiCatalogText();
	for (const url of [AI_CATALOG_URL, ARD_URL]) {
		const get = await ardResponse(new Request(url));
		if (!get || get.status !== 200) errors.push(`GET ${url} must be 200`);
		else {
			if (get.headers.get("content-type") !== JSON_TYPE) errors.push(`content-type ${url}`);
			if (get.headers.get("access-control-allow-origin") !== "*") errors.push(`CORS ${url}`);
			if (get.headers.get("cache-control") !== CACHE) errors.push(`cache-control ${url}`);
			if ((await get.text()) !== body) errors.push(`GET body drifted ${url}`);
		}

		const head = await ardResponse(new Request(`${url}/`, { method: "HEAD" }));
		if (!head || head.status !== 200) errors.push(`HEAD ${url} must be 200`);
		else {
			const length = Number(head.headers.get("content-length"));
			if (length !== new TextEncoder().encode(body).byteLength) errors.push(`HEAD content-length ${url}`);
			if (await head.text()) errors.push(`HEAD ${url} included a body`);
		}

		const posted = await ardResponse(new Request(url, { method: "POST", body: "{}" }));
		if (!posted || posted.status !== 405) errors.push(`POST ${url} must be 405`);
		else if (posted.headers.get("access-control-allow-origin") !== "*") errors.push(`POST CORS ${url}`);

		const options = await ardResponse(new Request(url, { method: "OPTIONS" }));
		if (!options || options.status !== 204) errors.push(`OPTIONS ${url} must be 204`);
		else if (options.headers.get("access-control-allow-origin") !== "*") errors.push(`OPTIONS CORS ${url}`);
	}

	const ignored = await ardResponse(new Request(`${ORIGIN}/en/`));
	if (ignored !== null) errors.push("ARD handler must ignore site pages");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
