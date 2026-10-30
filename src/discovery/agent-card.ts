/**
 * A2A 1.0 Agent Card for this public, read-only practice site.
 *
 * The card is discovery. `/a2a/v1` speaks JSON-RPC and answers `SendMessage`
 * with a message that points at the public documents. It does not create a
 * task, store the request, or call any URL the caller supplies.
 *
 * `capabilities.extensions` lists the AP2 v0.1 merchant role twice: once under
 * the specification URI and once under the v0.1.0 URI some scanners compare.
 * `required` is false. A data part whose keys start with `ap2.mandates.` is
 * refused and is not copied into the reply.
 */

import { SERVICE_KEYS, servicePath } from "../constants/services.ts";
import type { ServiceKey } from "../constants/services.ts";

export const ORIGIN = "https://lucabertelli.consulting";
export const AGENT_CARD_PATH = "/.well-known/agent-card.json";
export const A2A_PATH = "/a2a/v1";
export const AGENT_CARD_URL = `${ORIGIN}${AGENT_CARD_PATH}`;
export const A2A_URL = `${ORIGIN}${A2A_PATH}`;

const JSON_TYPE = "application/json; charset=utf-8";
const CARD_ALLOW = "GET, HEAD, OPTIONS";
const RPC_ALLOW = "POST, OPTIONS";
const CARD_CACHE = "public, max-age=3600";
const MAX_BODY = 65_536;
const PROTOCOL_VERSION = "1.0";
const SUPPORTED_VERSIONS = new Set(["1.0", "1.0.0"]);

/** AP2 v0.1 specification identifier. Clients compare this string. They do not fetch it. */
export const AP2_SPEC_URI = "https://github.com/google-agentic-commerce/ap2/tree/v0.1";
/** Identifier named by discovery checks that still look for the v0.1.0 tag form. */
export const AP2_V010_URI = "https://github.com/google-agentic-commerce/AP2/tree/v0.1.0";
export const AP2_EXTENSION_URIS = [AP2_SPEC_URI, AP2_V010_URI] as const;
export const AP2_ROLE = "merchant" as const;
const AP2_EXTENSION_DESCRIPTION =
	"Declares the AP2 v0.1 merchant role for discovery. This extension does not take payment, does not sign a cart mandate or a payment mandate, and does not store payment credentials. Clients can call SendMessage without this extension.";

interface SkillCopy {
	name: string;
	description: string;
	tags: string[];
	examples: string[];
}

/** English service frontmatter. `scripts/check-auth-discovery.ts` fails if a page drifts. */
const SKILL_COPY: Record<ServiceKey, SkillCopy> = {
	devops: {
		name: "DevOps Consultant",
		description:
			"Freelance DevOps consultant in Italy and the EU: maturity assessment, CI/CD pipelines and Infrastructure as Code for Fintech, Insurtech and industrial teams.",
		tags: ["devops", "ci-cd", "infrastructure-as-code"],
		examples: [
			"What does a freelance DevOps engagement cover for a team that wants CI/CD and Infrastructure as Code?",
		],
	},
	cloud: {
		name: "Cloud Consulting and Migration",
		description:
			"Cloud consulting across Italy and the EU: adoption strategy, migration of applications and infrastructure to AWS, Azure and Google Cloud, governance and FinOps.",
		tags: ["cloud", "migration", "cost-governance"],
		examples: ["How do you approach a cloud migration to AWS, Azure, or Google Cloud?"],
	},
	"platform-engineering": {
		name: "Platform Engineering Consulting",
		description:
			"Platform Engineering consulting across Italy and the EU: Internal Developer Platform design, golden paths, self-service on Kubernetes, and measuring real adoption by product teams.",
		tags: ["platform-engineering", "internal-developer-platform", "golden-path"],
		examples: ["What does an Internal Developer Platform engagement include?"],
	},
	kubernetes: {
		name: "Kubernetes Consulting",
		description:
			"Kubernetes consulting from a CKA certified consultant: cluster architecture, multi-tenancy, GitOps with Argo CD, security hardening and day-2 operations.",
		tags: ["kubernetes", "gitops", "multi-tenancy"],
		examples: ["How do you design a production Kubernetes cluster with GitOps?"],
	},
	secdevops: {
		name: "SecDevOps and CI/CD Consulting",
		description:
			"SecDevOps and CI/CD consulting in Italy and the EU: secure pipelines, HashiCorp Vault secrets, software supply chain security, SLSA and NIS2 evidence.",
		tags: ["secdevops", "ci-cd", "supply-chain"],
		examples: ["How do you secure a CI/CD pipeline and its secrets?"],
	},
	"cyber-resilience-act": {
		name: "Cyber Resilience Act Compliance Consulting",
		description:
			"Cyber Resilience Act consulting in Italy and the EU: Annex I gap assessment, vulnerability handling, SBOM, secure updates, documentation, reporting readiness.",
		tags: ["cyber-resilience-act", "sbom", "vulnerability-handling"],
		examples: ["What is the engineering work in a Cyber Resilience Act gap assessment?"],
	},
	training: {
		name: "DevOps and Cloud Native Training",
		description:
			"Corporate training on Kubernetes, DevOps, SecDevOps and Terraform: tailored programmes in English and Italian, with hands-on labs based on your own tooling.",
		tags: ["training", "kubernetes", "devops"],
		examples: ["What does a corporate Kubernetes or DevOps training engagement look like?"],
	},
	"ai-engineering": {
		name: "AI Agent Governance and Adoption",
		description:
			"AI agent governance consulting across Italy and the EU: usage policy, AI Act readiness, MCP server security, internal integration and inference cost control.",
		tags: ["ai-agent-governance", "mcp", "inference-cost"],
		examples: ["How should an enterprise govern AI agents, MCP access, and inference cost?"],
	},
	"knowledge-graphs": {
		name: "Temporal Knowledge Graph Consulting",
		description:
			"Knowledge graph and temporal knowledge graph consulting in Italy and the EU: operational facts, time-aware memory for AI agents, and MCP access.",
		tags: ["knowledge-graph", "temporal", "mcp"],
		examples: ["When is a temporal knowledge graph the right model for operational facts?"],
	},
};

export interface AgentSkill {
	id: ServiceKey;
	name: string;
	description: string;
	tags: string[];
	examples: string[];
}

export interface Ap2Extension {
	uri: string;
	description: string;
	required: boolean;
	params: { roles: ["merchant"] };
}

export interface AgentCard {
	name: string;
	description: string;
	version: string;
	provider: { organization: string; url: string };
	documentationUrl: string;
	iconUrl: string;
	supportedInterfaces: { url: string; protocolBinding: string; protocolVersion: string }[];
	capabilities: {
		streaming: boolean;
		pushNotifications: boolean;
		extendedAgentCard: boolean;
		extensions: Ap2Extension[];
	};
	defaultInputModes: string[];
	defaultOutputModes: string[];
	skills: AgentSkill[];
}

function ap2Extension(uri: (typeof AP2_EXTENSION_URIS)[number]): Ap2Extension {
	return {
		uri,
		description: AP2_EXTENSION_DESCRIPTION,
		required: false,
		params: { roles: [AP2_ROLE] },
	};
}

export function agentCard(): AgentCard {
	return {
		name: "Luca Bertelli Consulting",
		description:
			"Public agent card for Luca Bertelli, a freelance Cloud Native and Platform Engineering consultant in Italy and the European Union. It describes this practice's services and points callers at the public documents. It does not run tasks, store messages, issue credentials, or take payment.",
		version: "1.0.0",
		provider: {
			organization: "Luca Bertelli Consulting",
			url: ORIGIN,
		},
		documentationUrl: `${ORIGIN}/llms.txt`,
		iconUrl: `${ORIGIN}/icon-512.png`,
		supportedInterfaces: [
			{
				url: A2A_URL,
				protocolBinding: "JSONRPC",
				protocolVersion: PROTOCOL_VERSION,
			},
		],
		capabilities: {
			streaming: false,
			pushNotifications: false,
			extendedAgentCard: false,
			extensions: AP2_EXTENSION_URIS.map(ap2Extension),
		},
		defaultInputModes: ["text/plain"],
		defaultOutputModes: ["text/plain"],
		skills: SERVICE_KEYS.map((id) => ({ id, ...SKILL_COPY[id] })),
	};
}

function jsonText(value: unknown): string {
	return `${JSON.stringify(value, null, 2)}\n`;
}

export function agentCardText(): string {
	return jsonText(agentCard());
}

export function agentCardEtag(body: string): string {
	const bytes = new TextEncoder().encode(body);
	let hash = 0x811c9dc5;
	for (const byte of bytes) {
		hash ^= byte;
		hash = Math.imul(hash, 0x01000193);
	}
	return `"${(hash >>> 0).toString(16).padStart(8, "0")}"`;
}

function publicReply(): string {
	const lines = [
		"Luca Bertelli Consulting answers with public documents. This endpoint does not create tasks, store messages, issue credentials, or take payment. Do not send payment credentials or AP2 mandates.",
		`Agent card: ${AGENT_CARD_URL}`,
		`Index: ${ORIGIN}/llms.txt`,
		`Full text: ${ORIGIN}/llms-full.txt`,
		"Skills:",
	];
	for (const id of SERVICE_KEYS) {
		lines.push(`- ${id}: ${SKILL_COPY[id].name} ${ORIGIN}${servicePath(id, "en")}`);
	}
	return lines.join("\n");
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

function methodNotAllowed(allow: string): Response {
	return new Response(jsonText({ error: "method_not_allowed" }), {
		status: 405,
		headers: {
			"content-type": JSON_TYPE,
			allow,
			"cache-control": "no-store",
		},
	});
}

function etagMatches(header: string | null, etag: string): boolean {
	if (!header) return false;
	return header.split(",").some((part) => {
		const token = part.trim();
		return token === "*" || token === etag;
	});
}

function cardResponse(request: Request): Response {
	const body = agentCardText();
	const etag = agentCardEtag(body);
	const headers = new Headers({
		"content-type": JSON_TYPE,
		allow: CARD_ALLOW,
		"cache-control": CARD_CACHE,
		etag,
	});
	if (etagMatches(request.headers.get("if-none-match"), etag)) {
		return new Response(null, { status: 304, headers });
	}
	const byteLength = new TextEncoder().encode(body).byteLength;
	headers.set("content-length", String(byteLength));
	if (request.method.toUpperCase() === "HEAD") {
		return new Response(null, { status: 200, headers });
	}
	return new Response(body, { status: 200, headers });
}

interface RpcErrorBody {
	jsonrpc: "2.0";
	id: string | number | null;
	error: {
		code: number;
		message: string;
		data?: { "@type": string; reason?: string; domain?: string; fieldViolations?: { field: string; description: string }[] }[];
	};
}

function rpcError(
	id: string | number | null,
	code: number,
	message: string,
	data?: RpcErrorBody["error"]["data"],
): RpcErrorBody {
	return {
		jsonrpc: "2.0",
		id,
		error: data === undefined ? { code, message } : { code, message, data },
	};
}

function a2aError(id: string | number | null, code: number, message: string, reason: string): RpcErrorBody {
	return rpcError(id, code, message, [
		{
			"@type": "type.googleapis.com/google.rpc.ErrorInfo",
			reason,
			domain: "a2a-protocol.org",
		},
	]);
}

function invalidParams(id: string | number | null, field: string, description: string): RpcErrorBody {
	return rpcError(id, -32602, "Invalid parameters", [
		{
			"@type": "type.googleapis.com/google.rpc.BadRequest",
			fieldViolations: [{ field, description }],
		},
	]);
}

function rpcResponse(status: number, value: unknown): Response {
	const body = jsonText(value);
	return new Response(body, {
		status,
		headers: {
			"content-type": JSON_TYPE,
			allow: RPC_ALLOW,
			"cache-control": "no-store",
			"content-length": String(new TextEncoder().encode(body).byteLength),
		},
	});
}

function requestId(value: unknown): string | number | null {
	if (typeof value === "string" || typeof value === "number") return value;
	return null;
}

function mediaType(header: string | null): string {
	return (header ?? "").split(";")[0].trim().toLowerCase();
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

function outputMediaType(modes: unknown): string | null {
	if (modes === undefined) return "text/plain";
	if (!Array.isArray(modes) || modes.length === 0) return null;
	if (modes.some((mode) => typeof mode !== "string")) return null;
	const accepted = modes as string[];
	if (accepted.includes("text/plain") || accepted.includes("text/*") || accepted.includes("*/*")) {
		return "text/plain";
	}
	if (accepted.includes("text/markdown")) return "text/markdown";
	return null;
}

function contextIdFrom(message: Record<string, unknown>): string {
	const value = message.contextId;
	if (typeof value === "string" && /^[A-Za-z0-9._:-]{1,128}$/.test(value)) return value;
	return crypto.randomUUID();
}

function isAp2MandatePart(part: unknown): boolean {
	if (part === null || typeof part !== "object" || Array.isArray(part)) return false;
	const data = (part as Record<string, unknown>).data;
	if (data === null || typeof data !== "object" || Array.isArray(data)) return false;
	return Object.keys(data as Record<string, unknown>).some((key) => key.startsWith("ap2.mandates."));
}

type PartCheck = { ok: true } | { ok: false; field: string; description: string; unsupported: boolean };

function checkPart(part: unknown, index: number): PartCheck {
	if (part === null || typeof part !== "object" || Array.isArray(part)) {
		return { ok: false, field: `message.parts[${index}]`, description: "Part must be an object", unsupported: false };
	}
	const record = part as Record<string, unknown>;
	const keys = (["text", "raw", "url", "data"] as const).filter((key) => record[key] !== undefined);
	if (keys.length !== 1) {
		return {
			ok: false,
			field: `message.parts[${index}]`,
			description: "Part must set exactly one of text, raw, url, or data",
			unsupported: false,
		};
	}
	const media = record.mediaType;
	if (media !== undefined && typeof media !== "string") {
		return { ok: false, field: `message.parts[${index}].mediaType`, description: "mediaType must be a string", unsupported: false };
	}
	if (keys[0] !== "text") {
		return {
			ok: false,
			field: `message.parts[${index}].${keys[0]}`,
			description: "Only text parts are accepted",
			unsupported: true,
		};
	}
	if (typeof record.text !== "string" || record.text.length === 0) {
		return { ok: false, field: `message.parts[${index}].text`, description: "text must be a non-empty string", unsupported: false };
	}
	if (media !== undefined && media !== "text/plain" && media !== "text/markdown") {
		return {
			ok: false,
			field: `message.parts[${index}].mediaType`,
			description: "Only text/plain and text/markdown parts are accepted",
			unsupported: true,
		};
	}
	return { ok: true };
}

function sendMessage(id: string | number | null, params: unknown): RpcErrorBody | Record<string, unknown> {
	if (params === null || typeof params !== "object" || Array.isArray(params)) {
		return invalidParams(id, "params", "SendMessage params must be an object");
	}
	const configuration = (params as Record<string, unknown>).configuration;
	if (configuration !== undefined) {
		if (configuration === null || typeof configuration !== "object" || Array.isArray(configuration)) {
			return invalidParams(id, "configuration", "configuration must be an object");
		}
		if ("taskPushNotificationConfig" in configuration) {
			return a2aError(id, -32003, "Push notifications are not supported", "PUSH_NOTIFICATION_NOT_SUPPORTED");
		}
	}
	const media = outputMediaType(
		configuration !== undefined && configuration !== null && typeof configuration === "object"
			? (configuration as Record<string, unknown>).acceptedOutputModes
			: undefined,
	);
	if (media === null) {
		return a2aError(id, -32005, "Content type not supported", "CONTENT_TYPE_NOT_SUPPORTED");
	}
	const message = (params as Record<string, unknown>).message;
	if (message === null || typeof message !== "object" || Array.isArray(message)) {
		return invalidParams(id, "message", "message must be an object");
	}
	const record = message as Record<string, unknown>;
	if (typeof record.taskId === "string" && record.taskId.length > 0) {
		return a2aError(id, -32001, "Task not found", "TASK_NOT_FOUND");
	}
	if (typeof record.messageId !== "string" || record.messageId.length === 0) {
		return invalidParams(id, "message.messageId", "messageId must be a non-empty string");
	}
	if (record.role !== "ROLE_USER") {
		return invalidParams(id, "message.role", "role must be ROLE_USER");
	}
	if (!Array.isArray(record.parts) || record.parts.length === 0) {
		return invalidParams(id, "message.parts", "At least one part is required");
	}
	for (let index = 0; index < record.parts.length; index += 1) {
		if (isAp2MandatePart(record.parts[index])) {
			return a2aError(
				id,
				-32004,
				"This agent does not accept payment mandates or payment credentials",
				"UNSUPPORTED_OPERATION",
			);
		}
		const checked = checkPart(record.parts[index], index);
		if (!checked.ok) {
			if (checked.unsupported) {
				return a2aError(id, -32005, "Content type not supported", "CONTENT_TYPE_NOT_SUPPORTED");
			}
			return invalidParams(id, checked.field, checked.description);
		}
	}
	return {
		jsonrpc: "2.0",
		id,
		result: {
			message: {
				messageId: crypto.randomUUID(),
				contextId: contextIdFrom(record),
				role: "ROLE_AGENT",
				parts: [{ text: publicReply(), mediaType: media }],
			},
		},
	};
}

function dispatch(request: Request, id: string | number | null, method: string, params: unknown): RpcErrorBody | Record<string, unknown> {
	const version = request.headers.get("a2a-version");
	if (version !== null && version.trim() !== "" && !SUPPORTED_VERSIONS.has(version.trim())) {
		return a2aError(id, -32009, "A2A version not supported", "VERSION_NOT_SUPPORTED");
	}
	if (
		method === "CreateTaskPushNotificationConfig" ||
		method === "GetTaskPushNotificationConfig" ||
		method === "ListTaskPushNotificationConfigs" ||
		method === "DeleteTaskPushNotificationConfig"
	) {
		return a2aError(id, -32003, "Push notifications are not supported", "PUSH_NOTIFICATION_NOT_SUPPORTED");
	}
	if (method === "GetExtendedAgentCard") {
		return a2aError(id, -32007, "Extended agent card is not configured", "EXTENDED_AGENT_CARD_NOT_CONFIGURED");
	}
	if (
		method === "GetTask" ||
		method === "ListTasks" ||
		method === "CancelTask" ||
		method === "SubscribeToTask" ||
		method === "SendStreamingMessage"
	) {
		return a2aError(
			id,
			-32004,
			"This agent answers with a direct message and does not keep tasks",
			"UNSUPPORTED_OPERATION",
		);
	}
	if (method === "SendMessage") return sendMessage(id, params);
	return rpcError(id, -32601, "Method not found");
}

async function rpcHttp(request: Request): Promise<Response> {
	const method = request.method.toUpperCase();
	if (method === "OPTIONS") {
		await discardBody(request);
		return new Response(null, { status: 204, headers: { allow: RPC_ALLOW } });
	}
	if (method !== "POST") {
		await discardBody(request);
		return methodNotAllowed(RPC_ALLOW);
	}
	if (mediaType(request.headers.get("content-type")) !== "application/json") {
		await discardBody(request);
		return rpcResponse(415, rpcError(null, -32600, "Request payload validation error"));
	}
	const declared = request.headers.get("content-length");
	if (declared !== null) {
		const size = Number(declared);
		if (Number.isFinite(size) && size > MAX_BODY) {
			await discardBody(request);
			return rpcResponse(413, rpcError(null, -32600, "Request payload validation error"));
		}
	}
	let text: string | null;
	try {
		text = await readLimited(request, MAX_BODY);
	} catch {
		return rpcResponse(400, rpcError(null, -32700, "Invalid JSON payload"));
	}
	if (text === null) return rpcResponse(413, rpcError(null, -32600, "Request payload validation error"));
	let payload: unknown;
	try {
		payload = JSON.parse(text);
	} catch {
		return rpcResponse(200, rpcError(null, -32700, "Invalid JSON payload"));
	}
	if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
		return rpcResponse(200, rpcError(null, -32600, "Request payload validation error"));
	}
	const record = payload as Record<string, unknown>;
	const id = requestId(record.id);
	if (record.jsonrpc !== "2.0" || !("id" in record) || (typeof record.id !== "string" && typeof record.id !== "number")) {
		return rpcResponse(200, rpcError(id, -32600, "Request payload validation error"));
	}
	if (typeof record.method !== "string" || record.method.length === 0) {
		return rpcResponse(200, rpcError(id, -32600, "Request payload validation error"));
	}
	return rpcResponse(200, dispatch(request, id, record.method, record.params));
}

/**
 * Agent Card and JSON-RPC responses, or null when this request is neither route.
 * The request body is read only for POST `/a2a/v1`, and it is never stored.
 */
export async function agentCardResponse(request: Request): Promise<Response | null> {
	const path = normalizePath(new URL(request.url).pathname);
	if (path === AGENT_CARD_PATH) {
		const method = request.method.toUpperCase();
		await discardBody(request);
		if (method === "OPTIONS") return new Response(null, { status: 204, headers: { allow: CARD_ALLOW } });
		if (method !== "GET" && method !== "HEAD") return methodNotAllowed(CARD_ALLOW);
		return cardResponse(request);
	}
	if (path === A2A_PATH) return rpcHttp(request);
	return null;
}

export async function assertAgentCardResponses(): Promise<void> {
	const errors: string[] = [];
	const card = agentCard();
	const body = agentCardText();
	if (!body.endsWith("\n")) errors.push("agent card must end with a newline");
	let parsed: AgentCard;
	try {
		parsed = JSON.parse(body) as AgentCard;
	} catch (error) {
		throw new Error(`agent card is not JSON (${error instanceof Error ? error.message : error})`);
	}
	if (JSON.stringify(parsed) !== JSON.stringify(card)) errors.push("agent card text drifted from agentCard()");
	if (parsed.name !== "Luca Bertelli Consulting") errors.push("agent card name");
	if (!parsed.description || !parsed.version) errors.push("agent card description and version are required");
	const iface = parsed.supportedInterfaces[0];
	if (parsed.supportedInterfaces.length !== 1) errors.push("supportedInterfaces must list the JSON-RPC endpoint");
	if (!iface || iface.url !== A2A_URL || !iface.url.startsWith("https://")) {
		errors.push("supportedInterfaces url must be the HTTPS JSON-RPC endpoint");
	}
	if (!iface || iface.protocolBinding !== "JSONRPC" || iface.protocolVersion !== "1.0") {
		errors.push("supportedInterfaces transport must be JSONRPC 1.0");
	}
	if (parsed.capabilities.streaming || parsed.capabilities.pushNotifications || parsed.capabilities.extendedAgentCard) {
		errors.push("capabilities must stay false; this agent does not stream, push, or serve an extended card");
	}
	const extensions = parsed.capabilities.extensions;
	if (!extensions || extensions.length !== AP2_EXTENSION_URIS.length) {
		errors.push("capabilities.extensions must list both AP2 identifiers");
	} else {
		for (let index = 0; index < AP2_EXTENSION_URIS.length; index += 1) {
			const extension = extensions[index];
			if (!extension || extension.uri !== AP2_EXTENSION_URIS[index]) {
				errors.push(`AP2 extension ${index} uri drifted`);
			}
			if (!extension || extension.required !== false) errors.push("AP2 extension must not be required");
			if (!extension || extension.params.roles.length !== 1 || extension.params.roles[0] !== AP2_ROLE) {
				errors.push("AP2 role must be merchant only");
			}
			if (!extension || !extension.description.includes("does not take payment")) {
				errors.push("AP2 description must say this practice does not take payment");
			}
		}
	}
	if (parsed.defaultInputModes[0] !== "text/plain" || parsed.defaultOutputModes[0] !== "text/plain") {
		errors.push("default modes must be text/plain");
	}
	if (parsed.skills.map((skill) => skill.id).join(",") !== SERVICE_KEYS.join(",")) {
		errors.push("skills must match SERVICE_KEYS");
	}
	for (const skill of parsed.skills) {
		if (!skill.id || !skill.name || !skill.description || skill.tags.length === 0) {
			errors.push(`skill ${skill.id} is missing id, name, description, or tags`);
		}
	}
	if (parsed.provider.organization !== "Luca Bertelli Consulting" || parsed.provider.url !== ORIGIN) {
		errors.push("provider must be this practice");
	}
	if (parsed.documentationUrl !== `${ORIGIN}/llms.txt` || parsed.iconUrl !== `${ORIGIN}/icon-512.png`) {
		errors.push("documentationUrl and iconUrl must stay on this origin");
	}

	const get = await agentCardResponse(new Request(AGENT_CARD_URL));
	if (!get || get.status !== 200) errors.push("GET agent card must be 200");
	else {
		if (get.headers.get("content-type") !== JSON_TYPE) errors.push("agent card content-type");
		if (get.headers.get("cache-control") !== CARD_CACHE) errors.push("agent card cache-control");
		const etag = get.headers.get("etag");
		if (etag !== agentCardEtag(body)) errors.push("agent card etag");
		if ((await get.text()) !== body) errors.push("GET agent card body drifted");
		const cached = await agentCardResponse(
			new Request(AGENT_CARD_URL, { headers: etag ? { "if-none-match": etag } : {} }),
		);
		if (!cached || cached.status !== 304) errors.push("If-None-Match must return 304");
		else if (await cached.text()) errors.push("304 included a body");
	}

	const head = await agentCardResponse(new Request(AGENT_CARD_URL, { method: "HEAD" }));
	if (!head || head.status !== 200) errors.push("HEAD agent card must be 200");
	else {
		const length = Number(head.headers.get("content-length"));
		if (length !== new TextEncoder().encode(body).byteLength) errors.push("HEAD content-length");
		if (await head.text()) errors.push("HEAD included a body");
	}

	const posted = await agentCardResponse(new Request(AGENT_CARD_URL, { method: "POST" }));
	if (!posted || posted.status !== 405) errors.push("POST agent card must be 405");

	const options = await agentCardResponse(new Request(`${AGENT_CARD_URL}/`, { method: "OPTIONS" }));
	if (!options || options.status !== 204) errors.push("OPTIONS agent card must be 204");

	const sentinel = "super-secret-agent-card-sentinel";
	const send = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: "req-1",
				method: "SendMessage",
				params: {
					message: {
						messageId: "caller-message",
						role: "ROLE_USER",
						contextId: "ctx-1",
						parts: [{ text: sentinel, mediaType: "text/plain" }],
					},
				},
			}),
		}),
	);
	if (!send || send.status !== 200) errors.push("SendMessage must be 200");
	else {
		const text = await send.text();
		if (text.includes(sentinel)) errors.push("SendMessage echoed the request text");
		if (!text.includes("does not") || !text.includes("take payment")) {
			errors.push("SendMessage reply must say this endpoint does not take payment");
		}
		const result = JSON.parse(text) as {
			result?: { message?: { messageId?: string; contextId?: string; role?: string; taskId?: string; parts?: { text?: string }[] }; task?: unknown };
		};
		if (!result.result?.message || result.result.task) errors.push("SendMessage must return a message and no task");
		if (result.result?.message?.role !== "ROLE_AGENT") errors.push("SendMessage role");
		if (result.result?.message?.contextId !== "ctx-1") errors.push("SendMessage must keep a safe contextId");
		if (result.result?.message?.messageId === "caller-message") errors.push("SendMessage must not reuse the caller messageId");
		if (result.result?.message?.taskId) errors.push("SendMessage message must not carry a taskId");
		const reply = result.result?.message?.parts?.[0]?.text ?? "";
		if (!reply.includes(`${ORIGIN}/llms.txt`) || !reply.includes("devops")) errors.push("SendMessage reply missed the public index");
	}

	const task = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "GetTask", params: { id: "task-1" } }),
		}),
	);
	if (!task || JSON.parse(await task.text()).error?.code !== -32004) errors.push("GetTask must be unsupported");

	const push = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 3,
				method: "CreateTaskPushNotificationConfig",
				params: { url: "https://attacker.example/hook" },
			}),
		}),
	);
	if (!push || JSON.parse(await push.text()).error?.code !== -32003) errors.push("push config must be rejected");

	const extended = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ jsonrpc: "2.0", id: 4, method: "GetExtendedAgentCard" }),
		}),
	);
	if (!extended || JSON.parse(await extended.text()).error?.code !== -32007) {
		errors.push("extended card must be rejected");
	}

	const oldVersion = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "application/json", "a2a-version": "0.3" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 5,
				method: "SendMessage",
				params: { message: { messageId: "m", role: "ROLE_USER", parts: [{ text: "hi" }] } },
			}),
		}),
	);
	if (!oldVersion || JSON.parse(await oldVersion.text()).error?.code !== -32009) {
		errors.push("A2A-Version 0.3 must be rejected");
	}

	const jsonMode = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 6,
				method: "SendMessage",
				params: {
					configuration: { acceptedOutputModes: ["application/json"] },
					message: { messageId: "m", role: "ROLE_USER", parts: [{ text: "hi" }] },
				},
			}),
		}),
	);
	if (!jsonMode || JSON.parse(await jsonMode.text()).error?.code !== -32005) {
		errors.push("unsupported output mode must be rejected");
	}

	const withTask = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 7,
				method: "SendMessage",
				params: {
					message: { messageId: "m", role: "ROLE_USER", taskId: "task-9", parts: [{ text: "hi" }] },
				},
			}),
		}),
	);
	if (!withTask || JSON.parse(await withTask.text()).error?.code !== -32001) {
		errors.push("SendMessage with a taskId must report that the task does not exist");
	}

	const broken = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{",
		}),
	);
	if (!broken || JSON.parse(await broken.text()).error?.code !== -32700) errors.push("invalid JSON must be a parse error");

	const textType = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "text/plain" },
			body: sentinel,
		}),
	);
	if (!textType || textType.status !== 415) errors.push("non-JSON POST must be 415");
	else if ((await textType.text()).includes(sentinel)) errors.push("415 echoed the request body");

	const oversized = "x".repeat(MAX_BODY + 1);
	const tooBig = await agentCardResponse(
		new Request(A2A_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: oversized,
		}),
	);
	if (!tooBig || tooBig.status !== 413) errors.push("oversized POST must be 413");
	else if ((await tooBig.text()).includes("xxxx")) errors.push("413 echoed the request body");

	const mandateToken = "pm_live_super-secret-mandate-token";
	for (const [id, key] of [
		[8, "ap2.mandates.PaymentMandate"],
		[9, "ap2.mandates.CartMandate"],
	] as const) {
		const mandate = await agentCardResponse(
			new Request(A2A_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					jsonrpc: "2.0",
					id,
					method: "SendMessage",
					params: {
						message: {
							messageId: "m",
							role: "ROLE_USER",
							parts: [{ data: { [key]: { token: mandateToken } } }],
						},
					},
				}),
			}),
		);
		const text = mandate ? await mandate.text() : "";
		if (!text || JSON.parse(text).error?.code !== -32004) errors.push(`${key} must be refused`);
		if (text.includes(mandateToken)) errors.push(`${key} echoed the payload`);
	}

	const ignored = await agentCardResponse(new Request(`${ORIGIN}/en/`));
	if (ignored !== null) errors.push("agent card handler must ignore site pages");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
