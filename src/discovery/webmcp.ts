/**
 * In-browser WebMCP tools for this public, read-only site.
 *
 * The spec and current Chrome expose `document.modelContext`. Older Chrome
 * builds expose `navigator.modelContext`. Registration uses whichever object
 * has `registerTool`, and both when they are different objects, so either
 * entry point lists the tools. One AbortSignal is passed in the options.
 * Aborting that signal is how a tool is unregistered. The signal aborts when
 * the document is discarded, and stays quiet while the page is only frozen
 * in the back-forward cache.
 *
 * `search_site` reads `/llms.txt`. `read_page` reads the open document.
 * `navigate` loads a URL on this origin. The tools do not call other origins,
 * store the call, or issue a credential.
 */

export const WEB_MCP_TOOL_NAMES = ["search_site", "read_page", "navigate"] as const;
export type WebMcpToolName = (typeof WEB_MCP_TOOL_NAMES)[number];

const INDEX_PATH = "/llms.txt";
const MAX_INDEX_CHARS = 1_000_000;
const MAX_LINE_CHARS = 500;
const MIN_QUERY_CHARS = 2;
const MAX_QUERY_CHARS = 200;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;
const MAX_PATH_CHARS = 500;
const NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

export interface ToolAnnotations {
	readOnlyHint: boolean;
	consequentialHint: boolean;
	untrustedContentHint: boolean;
	debugging: boolean;
}

export interface JsonSchema {
	type: "object";
	properties: Record<string, JsonSchemaProperty>;
	required?: string[];
	additionalProperties: false;
}

export interface JsonSchemaProperty {
	type: string;
	description: string;
	minimum?: number;
	maximum?: number;
	default?: number;
}

export interface WebMcpTool {
	name: WebMcpToolName;
	title: string;
	description: string;
	inputSchema: JsonSchema;
	annotations: ToolAnnotations;
	execute: (input: unknown, options?: { signal?: AbortSignal }) => Promise<ToolResult>;
}

export interface ModelContextLike {
	registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => Promise<void> | void;
}

export interface PageSnapshot {
	ok: true;
	url: string;
	lang: string;
	title: string;
	description: string;
	heading: string;
	text: string;
}

export interface SearchHit {
	ok: true;
	query: string;
	matches: string[];
	source: string;
}

export interface NavigationHit {
	ok: true;
	url: string;
}

export interface ToolFailure {
	ok: false;
	error: string;
}

export type ToolResult = PageSnapshot | SearchHit | NavigationHit | ToolFailure;

export interface WebMcpHost {
	origin: string;
	lang: string;
	fetchIndex: (signal: AbortSignal) => Promise<string>;
	readPage: () => PageSnapshot;
	assign: (url: string) => void;
}

const READ_ONLY: ToolAnnotations = {
	readOnlyHint: true,
	consequentialHint: false,
	untrustedContentHint: false,
	debugging: false,
};

const NAVIGATION: ToolAnnotations = {
	readOnlyHint: false,
	consequentialHint: false,
	untrustedContentHint: false,
	debugging: false,
};

function isModelContext(value: ModelContextLike | null | undefined): value is ModelContextLike {
	return Boolean(value && typeof value.registerTool === "function");
}

/** Document entry point first, then the navigator entry point when it is a different object. */
export function modelContextsFrom(
	documentContext: ModelContextLike | null | undefined,
	navigatorContext: ModelContextLike | null | undefined,
): ModelContextLike[] {
	const contexts: ModelContextLike[] = [];
	if (isModelContext(documentContext)) contexts.push(documentContext);
	if (isModelContext(navigatorContext) && navigatorContext !== documentContext) contexts.push(navigatorContext);
	return contexts;
}

export function indexUrl(origin: string): string {
	return new URL(INDEX_PATH, origin).href;
}

export function clipText(value: string, max: number): string {
	const text = value.replace(/\s+/g, " ").trim();
	return text.length <= max ? text : text.slice(0, max);
}

export function queryOf(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const query = value.trim();
	if (query.length < MIN_QUERY_CHARS || query.length > MAX_QUERY_CHARS) return null;
	return query;
}

export function limitOf(value: unknown): number | null {
	if (value === undefined) return DEFAULT_LIMIT;
	if (typeof value !== "number" || !Number.isInteger(value)) return null;
	if (value < 1 || value > MAX_LIMIT) return null;
	return value;
}

/**
 * A path or absolute URL that stays on `origin`. Protocol-relative URLs,
 * other hosts, credentials, and control characters are left unopened.
 */
export function sameOriginUrl(input: unknown, origin: string): string | null {
	if (typeof input !== "string") return null;
	const raw = input.trim();
	if (raw.length === 0 || raw.length > MAX_PATH_CHARS) return null;
	if (/[\u0000-\u001F\u007F\\]/.test(raw)) return null;
	let base: URL;
	try {
		base = new URL(origin);
	} catch {
		return null;
	}
	if (base.origin !== origin) return null;
	let url: URL;
	try {
		if (raw.startsWith("/")) {
			if (raw.startsWith("//") || raw.startsWith("/\\")) return null;
			url = new URL(raw, origin);
		} else {
			url = new URL(raw);
		}
	} catch {
		return null;
	}
	if (url.origin !== origin) return null;
	if (url.username || url.password) return null;
	if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) return null;
	if (url.pathname.includes("\\")) return null;
	const href = url.href;
	if (href !== `${origin}/` && !href.startsWith(`${origin}/`)) return null;
	return href;
}

export function matchLines(index: string, query: string, limit: number): string[] {
	const needle = query.toLowerCase();
	const matches: string[] = [];
	for (const raw of index.split("\n")) {
		const line = raw.trim();
		if (!line || !line.toLowerCase().includes(needle)) continue;
		matches.push(line.length > MAX_LINE_CHARS ? line.slice(0, MAX_LINE_CHARS) : line);
		if (matches.length >= limit) break;
	}
	return matches;
}

function inputRecord(input: unknown): Record<string, unknown> {
	if (typeof input === "object" && input !== null && !Array.isArray(input)) {
		return input as Record<string, unknown>;
	}
	return {};
}

function executionSignal(options: { signal?: AbortSignal } | undefined): AbortSignal | undefined {
	const signal = options?.signal;
	return signal instanceof AbortSignal ? signal : undefined;
}

function isAbort(error: unknown): boolean {
	return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

function titleFor(lang: string, english: string, italian: string): string {
	return lang === "it" ? italian : english;
}

async function searchSite(host: WebMcpHost, input: unknown, signal?: AbortSignal): Promise<ToolResult> {
	if (signal?.aborted) return { ok: false, error: "cancelled" };
	const fields = inputRecord(input);
	const query = queryOf(fields.query);
	if (!query) return { ok: false, error: "Query must be 2 to 200 characters." };
	const limit = limitOf(fields.limit);
	if (limit === null) return { ok: false, error: "Limit must be an integer from 1 to 20." };
	const fetchSignal = signal ?? new AbortController().signal;
	try {
		const index = await host.fetchIndex(fetchSignal);
		return { ok: true, query, matches: matchLines(index, query, limit), source: indexUrl(host.origin) };
	} catch (error) {
		if (isAbort(error) || signal?.aborted) return { ok: false, error: "cancelled" };
		return { ok: false, error: "The public index could not be read." };
	}
}

async function readOpenPage(host: WebMcpHost, signal?: AbortSignal): Promise<ToolResult> {
	if (signal?.aborted) return { ok: false, error: "cancelled" };
	return host.readPage();
}

async function openPage(host: WebMcpHost, input: unknown, signal?: AbortSignal): Promise<ToolResult> {
	if (signal?.aborted) return { ok: false, error: "cancelled" };
	const target = sameOriginUrl(inputRecord(input).path, host.origin);
	if (!target) return { ok: false, error: "Path must be on this origin." };
	host.assign(target);
	return { ok: true, url: target };
}

export function createTools(host: WebMcpHost): WebMcpTool[] {
	return [
		{
			name: "search_site",
			title: titleFor(host.lang, "Search the site", "Cerca nel sito"),
			description:
				"Search the public index at /llms.txt and return matching lines. Use this to find services, articles, guides, and their URLs. The query must be 2 to 200 characters.",
			inputSchema: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description: "Words to find in /llms.txt. At least 2 characters and at most 200.",
					},
					limit: {
						type: "integer",
						description: "Maximum matching lines to return. An integer from 1 to 20. Defaults to 8.",
						minimum: 1,
						maximum: MAX_LIMIT,
						default: DEFAULT_LIMIT,
					},
				},
				required: ["query"],
				additionalProperties: false,
			},
			annotations: READ_ONLY,
			execute: (input, options) => searchSite(host, input, executionSignal(options)),
		},
		{
			name: "read_page",
			title: titleFor(host.lang, "Read the open page", "Leggi la pagina aperta"),
			description:
				"Return the open page: its URL, language, title, meta description, h1, and main text. Use this to read what is on screen.",
			inputSchema: {
				type: "object",
				properties: {},
				additionalProperties: false,
			},
			annotations: READ_ONLY,
			execute: (_input, options) => readOpenPage(host, executionSignal(options)),
		},
		{
			name: "navigate",
			title: titleFor(host.lang, "Open a page on this site", "Apri una pagina del sito"),
			description:
				"Open a page on this origin. Pass a path such as /en/services/ or /it/servizi/, or an absolute URL with this page's origin. The browser loads that URL.",
			inputSchema: {
				type: "object",
				properties: {
					path: {
						type: "string",
						description: "A same-origin path, or an absolute URL on this page's origin.",
					},
				},
				required: ["path"],
				additionalProperties: false,
			},
			annotations: NAVIGATION,
			execute: (input, options) => openPage(host, input, executionSignal(options)),
		},
	];
}

export async function registerWebMcp(
	contexts: readonly ModelContextLike[],
	host: WebMcpHost,
	signal: AbortSignal,
): Promise<void> {
	if (signal.aborted) return;
	const unique: ModelContextLike[] = [];
	for (const context of contexts) {
		if (!isModelContext(context) || unique.includes(context)) continue;
		unique.push(context);
	}
	if (unique.length === 0) return;
	const pending: Promise<unknown>[] = [];
	for (const context of unique) {
		for (const tool of createTools(host)) {
			pending.push(Promise.resolve(context.registerTool(tool, { signal })));
		}
	}
	await Promise.all(pending);
}

function browserHost(): WebMcpHost {
	const origin = location.origin;
	return {
		origin,
		lang: document.documentElement.lang,
		async fetchIndex(signal: AbortSignal): Promise<string> {
			const response = await fetch(indexUrl(origin), {
				method: "GET",
				credentials: "omit",
				redirect: "error",
				headers: { Accept: "text/plain" },
				signal,
			});
			if (!response.ok) throw new Error("index request failed");
			const type = (response.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase();
			if (type !== "text/plain") throw new Error("index was not text");
			const text = await response.text();
			return text.length > MAX_INDEX_CHARS ? text.slice(0, MAX_INDEX_CHARS) : text;
		},
		readPage(): PageSnapshot {
			const description = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
			const heading = document.querySelector("h1")?.textContent ?? "";
			const text = document.querySelector("#main-content")?.textContent ?? "";
			return {
				ok: true,
				url: location.href,
				lang: document.documentElement.lang,
				title: clipText(document.title, 300),
				description: clipText(description, 400),
				heading: clipText(heading, 300),
				text: clipText(text, 4000),
			};
		},
		assign(url: string): void {
			location.assign(url);
		},
	};
}

let started = false;

/** Register tools on page load. No-op when the browser has no WebMCP entry point. */
export function startWebMcp(): void {
	if (started || typeof document === "undefined" || typeof navigator === "undefined") return;
	const documentContext = (document as Document & { modelContext?: ModelContextLike }).modelContext;
	const navigatorContext = (navigator as Navigator & { modelContext?: ModelContextLike }).modelContext;
	const contexts = modelContextsFrom(documentContext, navigatorContext);
	if (contexts.length === 0) return;
	started = true;
	const controller = new AbortController();
	window.addEventListener("pagehide", (event) => {
		if (event.persisted) return;
		controller.abort();
	});
	void registerWebMcp(contexts, browserHost(), controller.signal).catch(() => {
		// A rejected registration must leave the page usable.
	});
}

interface RecordedCall {
	tool: WebMcpTool;
	signal: AbortSignal | undefined;
}

function recordingContext(): { context: ModelContextLike; calls: RecordedCall[] } {
	const calls: RecordedCall[] = [];
	return {
		calls,
		context: {
			registerTool(tool, options) {
				calls.push({ tool, signal: options?.signal });
			},
		},
	};
}

function failureMessage(result: ToolResult | undefined): string | undefined {
	if (result && result.ok === false) return result.error;
	return undefined;
}

function matchCount(result: ToolResult | undefined): number | undefined {
	if (result && result.ok === true && "matches" in result) return result.matches.length;
	return undefined;
}

function pageHeading(result: ToolResult | undefined): string | undefined {
	if (result && result.ok === true && "heading" in result) return result.heading;
	return undefined;
}

function openedUrl(result: ToolResult | undefined): string | undefined {
	if (result && result.ok === true && "url" in result && !("heading" in result) && !("matches" in result)) {
		return result.url;
	}
	return undefined;
}

function testHost(overrides: Partial<WebMcpHost> = {}): WebMcpHost & { assigned: string[]; fetches: number } {
	const host = {
		origin: "https://lucabertelli.consulting",
		lang: "en",
		assigned: [] as string[],
		fetches: 0,
		async fetchIndex(): Promise<string> {
			host.fetches += 1;
			return [
				"# index",
				"- DevOps consulting: https://lucabertelli.consulting/en/services/devops-consulting/",
				"- Kubernetes consulting: https://lucabertelli.consulting/en/services/kubernetes-consulting/",
			].join("\n");
		},
		readPage(): PageSnapshot {
			return {
				ok: true,
				url: "https://lucabertelli.consulting/en/",
				lang: "en",
				title: "Luca Bertelli",
				description: "Cloud Native consulting",
				heading: "DevOps consultant",
				text: "Public practice page",
			};
		},
		assign(url: string): void {
			host.assigned.push(url);
		},
		...overrides,
	};
	return host;
}

export async function assertWebMcpTools(): Promise<void> {
	const errors: string[] = [];
	const push = (condition: boolean, message: string) => {
		if (!condition) errors.push(message);
	};

	const origin = "https://lucabertelli.consulting";
	push(indexUrl(origin) === `${origin}/llms.txt`, "index URL drifted");
	push(sameOriginUrl("/en/services/", origin) === `${origin}/en/services/`, "path navigation drifted");
	push(
		sameOriginUrl(`${origin}/it/servizi/`, origin) === `${origin}/it/servizi/`,
		"absolute same-origin URL was rejected",
	);
	push(sameOriginUrl("/en/?q=devops#faq", origin) === `${origin}/en/?q=devops#faq`, "query and hash were dropped");
	push(sameOriginUrl("  /en/  ", origin) === `${origin}/en/`, "trimmed path was rejected");
	const rejected = [
		"https://evil.example/en/",
		"//evil.example/en/",
		"javascript:alert(1)",
		"/\\evil",
		`https://user:pass@lucabertelli.consulting/en/`,
		"https://lucabertelli.consulting.evil.example/",
		"http://lucabertelli.consulting/en/",
		"en/services",
		"",
		`/${"a".repeat(MAX_PATH_CHARS)}`,
		"/en/\n/evil",
		"https://evil.example#@lucabertelli.consulting",
	];
	for (const path of rejected) {
		push(sameOriginUrl(path, origin) === null, `accepted an off-origin path: ${path.slice(0, 40)}`);
	}
	push(queryOf("  kubernetes ") === "kubernetes", "query trim drifted");
	push(queryOf("a") === null, "one-character query was accepted");
	push(queryOf("a".repeat(MAX_QUERY_CHARS)) === "a".repeat(MAX_QUERY_CHARS), "200-character query was rejected");
	push(queryOf("a".repeat(MAX_QUERY_CHARS + 1)) === null, "201-character query was accepted");
	push(limitOf(undefined) === DEFAULT_LIMIT, "default limit drifted");
	push(limitOf(1) === 1 && limitOf(20) === 20, "limit bounds drifted");
	push(limitOf(0) === null && limitOf(21) === null && limitOf(1.5) === null && limitOf("8") === null, "bad limit was accepted");

	const lines = matchLines("Alpha devops\n\nbeta Kubernetes\n", "kubernetes", 8);
	push(lines.length === 1 && lines[0] === "beta Kubernetes", "line match drifted");
	push(matchLines("one consulting\ntwo consulting\n", "consulting", 1).length === 1, "limit was ignored");

	const host = testHost();
	const documentContext = recordingContext();
	const navigatorContext = recordingContext();
	const controller = new AbortController();
	await registerWebMcp([documentContext.context, navigatorContext.context], host, controller.signal);
	push(documentContext.calls.length === 3, "document context did not receive three tools");
	push(navigatorContext.calls.length === 3, "navigator context did not receive three tools");
	const names = documentContext.calls.map((call) => call.tool.name);
	push(names.join(",") === WEB_MCP_TOOL_NAMES.join(","), `tool names drifted: ${names.join(",")}`);
	for (const call of documentContext.calls) {
		push(call.signal === controller.signal, `${call.tool.name} was registered without the abort signal`);
		push(NAME_PATTERN.test(call.tool.name), `${call.tool.name} is not a WebMCP name`);
		push(call.tool.description.length > 15, `${call.tool.name} description is too short`);
		push(typeof call.tool.execute === "function", `${call.tool.name} is missing execute`);
		push(call.tool.inputSchema.type === "object", `${call.tool.name} schema is not an object`);
		push(call.tool.inputSchema.additionalProperties === false, `${call.tool.name} schema allows extra fields`);
		push(JSON.stringify(call.tool.inputSchema).length > 2, `${call.tool.name} schema did not serialize`);
		push(call.tool.annotations.debugging === false, `${call.tool.name} is marked for debugging`);
		push(call.tool.annotations.consequentialHint === false, `${call.tool.name} is marked consequential`);
		push(call.tool.annotations.untrustedContentHint === false, `${call.tool.name} is marked untrusted`);
	}
	const search = documentContext.calls[0]?.tool;
	const read = documentContext.calls[1]?.tool;
	const navigate = documentContext.calls[2]?.tool;
	push(search?.annotations.readOnlyHint === true, "search_site must be read-only");
	push(read?.annotations.readOnlyHint === true, "read_page must be read-only");
	push(navigate?.annotations.readOnlyHint === false, "navigate changes the page");
	push(search?.inputSchema.required?.join(",") === "query", "search_site required fields drifted");
	push(navigate?.inputSchema.required?.join(",") === "path", "navigate required fields drifted");

	const found = await search?.execute({ query: "Kubernetes", limit: 5 });
	push(matchCount(found) === 1, "search missed Kubernetes");
	push(host.fetches === 1, "search did not read the index once");
	const empty = await search?.execute({ query: "not-a-service" });
	push(matchCount(empty) === 0, "empty search failed");
	const tiny = await search?.execute({ query: "q" });
	push(failureMessage(tiny) === "Query must be 2 to 200 characters.", "short query message drifted");
	const secret = `SENTINEL_SECRET${"a".repeat(MAX_QUERY_CHARS)}`;
	const echoed = await search?.execute({ query: secret });
	push(failureMessage(echoed) !== undefined && !JSON.stringify(echoed).includes("SENTINEL_SECRET"), "rejected query was echoed");
	const badLimit = await search?.execute({ query: "devops", limit: 99 });
	push(failureMessage(badLimit) === "Limit must be an integer from 1 to 20.", "limit 99 was accepted");

	const aborted = new AbortController();
	aborted.abort();
	const before = host.fetches;
	const cancelled = await search?.execute({ query: "devops" }, { signal: aborted.signal });
	push(failureMessage(cancelled) === "cancelled", "aborted search did not cancel");
	push(host.fetches === before, "aborted search still fetched the index");

	const failing = testHost({
		async fetchIndex(): Promise<string> {
			throw new Error("secret-body");
		},
	});
	const failed = await createTools(failing)[0]?.execute({ query: "devops" });
	push(failureMessage(failed) === "The public index could not be read.", "fetch failure message drifted");
	push(!JSON.stringify(failed).includes("secret-body"), "fetch failure echoed the error");

	const abortingFetch = testHost({
		async fetchIndex(): Promise<string> {
			const error = new Error("aborted");
			error.name = "AbortError";
			throw error;
		},
	});
	const inFlight = await createTools(abortingFetch)[0]?.execute({ query: "devops" });
	push(failureMessage(inFlight) === "cancelled", "in-flight abort was not cancelled");

	const page = await read?.execute({});
	push(pageHeading(page) === "DevOps consultant", "read_page missed the heading");
	const readCancelled = await read?.execute({}, { signal: aborted.signal });
	push(readCancelled?.ok === false, "aborted read_page still returned the page");

	const opened = await navigate?.execute({ path: "/en/services/devops-consulting/" });
	push(openedUrl(opened) === `${origin}/en/services/devops-consulting/`, "navigate URL drifted");
	push(host.assigned.length === 1 && host.assigned[0] === `${origin}/en/services/devops-consulting/`, "navigate did not assign");
	const blocked = await navigate?.execute({ path: "https://evil.example/phish" });
	push(failureMessage(blocked) === "Path must be on this origin.", "off-origin navigate message drifted");
	push(!JSON.stringify(blocked).includes("evil.example"), "rejected navigate echoed the URL");
	push(host.assigned.length === 1, "off-origin navigate assigned a URL");
	const absolute = await navigate?.execute({ path: `${origin}/it/` });
	push(absolute?.ok === true && host.assigned.at(-1) === `${origin}/it/`, "absolute same-origin navigate failed");

	const italian = testHost({ lang: "it" });
	const italianNames = createTools(italian).map((tool) => tool.title);
	push(italianNames[0] === "Cerca nel sito", "Italian search title drifted");
	push(italianNames[2] === "Apri una pagina del sito", "Italian navigate title drifted");

	const onlyNavigator = recordingContext();
	await registerWebMcp(modelContextsFrom(undefined, onlyNavigator.context), host, new AbortController().signal);
	push(onlyNavigator.calls.length === 3, "navigator fallback did not register");
	const shared = recordingContext();
	await registerWebMcp(modelContextsFrom(shared.context, shared.context), host, new AbortController().signal);
	push(shared.calls.length === 3, "the same context was registered twice");
	const alreadyAborted = new AbortController();
	alreadyAborted.abort();
	const skipped = recordingContext();
	await registerWebMcp([skipped.context], host, alreadyAborted.signal);
	push(skipped.calls.length === 0, "an aborted signal still registered tools");
	await registerWebMcp(
		[{ registerTool: undefined as unknown as ModelContextLike["registerTool"] }],
		host,
		new AbortController().signal,
	);

	const longLine = "x".repeat(MAX_LINE_CHARS + 40);
	const clipped = matchLines(longLine, "xxx", 1);
	push(clipped[0]?.length === MAX_LINE_CHARS, "long lines were not clipped");
	push(clipText(`  ${"word ".repeat(50)}`, 12).length === 12, "clipText drifted");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
