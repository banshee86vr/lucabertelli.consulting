/**
 * Agent Skills discovery index (draft v0.2.0) for this public, read-only site.
 *
 * The index lists one skill, `consulting-practice`. That SKILL.md tells an
 * agent how to read the practice. It has no scripts or reference files, so
 * the entry type is `skill-md`. The digest is the SHA-256 of those exact
 * bytes. The Worker and the static files serve the same body.
 */

import { ACP_BASE_URL, ACP_DOCUMENT_URL, CHECKOUT_URL } from "./acp.ts";
import { UCP_BASE_URL, UCP_CHECKOUT_URL, UCP_DOCUMENT_URL, UCP_VERSION } from "./ucp.ts";
import { POPPY_DOCUMENT_URL, POPPY_VERSION } from "./poppy.ts";
import { ENGAGEMENT_URL, OPENAPI_URL } from "./mpp.ts";
import { FACILITATOR_URL, X402_ASSET, X402_NETWORK, X402_PAY_TO, X402_PRICE, X402_URL } from "./x402.ts";
import { AP2_EXTENSION_URIS, ORIGIN } from "./agent-card.ts";
import { MCP_CARD_URL, MCP_URL } from "./mcp-server.ts";
import { DIRECTORY_URL } from "./web-bot-auth.ts";

export const AGENT_SKILLS_SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";
export const SKILL_NAME = "consulting-practice";
export const AGENT_SKILLS_INDEX_PATH = "/.well-known/agent-skills/index.json";
export const SKILL_PATH = `/.well-known/agent-skills/${SKILL_NAME}/SKILL.md`;
export const AGENT_SKILLS_INDEX_URL = `${ORIGIN}${AGENT_SKILLS_INDEX_PATH}`;
export const SKILL_URL = `${ORIGIN}${SKILL_PATH}`;

export const SKILL_DESCRIPTION =
	"Read the public site of Luca Bertelli Consulting, a freelance Cloud Native and Platform Engineering practice in Italy and the EU. Use when an agent needs the services, articles, or machine-readable index. Access is anonymous and the site does not create tasks, checkout sessions, or issue credentials.";

const JSON_TYPE = "application/json; charset=utf-8";
const MARKDOWN = "text/markdown; charset=utf-8";
const ALLOW = "GET, HEAD, OPTIONS";
const CACHE = "public, max-age=3600";
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const INDEX_FILE = AGENT_SKILLS_INDEX_PATH.slice(1);
const SKILL_FILE = SKILL_PATH.slice(1);

export interface AgentSkillEntry {
	name: string;
	type: "skill-md" | "archive";
	description: string;
	url: string;
	digest: string;
}

export interface AgentSkillsIndex {
	$schema: string;
	skills: AgentSkillEntry[];
}

function yamlQuoted(value: string): string {
	return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function skillMarkdown(): string {
	return `---
name: ${SKILL_NAME}
description: ${yamlQuoted(SKILL_DESCRIPTION)}
---

# Consulting practice

Use this skill to read ${ORIGIN}. The site is a public practice site. Anonymous clients read every document. This origin does not create tasks, store agent messages, or issue credentials.

## Start here

1. Read ${ORIGIN}/llms.txt for the index: identity, pages, and the FAQ questions on each service.
2. Read ${ORIGIN}/llms-full.txt when you need the full text of a service, guide, or article.
3. English pages start at ${ORIGIN}/en/. Italian pages start at ${ORIGIN}/it/.

${ORIGIN}/ answers 308 to ${ORIGIN}/en/. Machine-readable discovery is in English. Service slugs differ by language.

Quote a page only for a claim that page makes. Do not invent prices, availability, or engagement terms.

An HTML page also answers \`Accept: text/markdown\` with that page's main content.

## Access

Read ${ORIGIN}/auth.md. Access is anonymous. No account and no credential are required.

\`GET\` and \`POST\` ${ORIGIN}/agent/auth/register, ${ORIGIN}/agent/auth/claim, and ${ORIGIN}/agent/auth/revoke describe that and change nothing. Do not send an identity assertion.

## Agent card

\`GET\` ${ORIGIN}/.well-known/agent-card.json is the A2A 1.0 card. \`POST\` ${ORIGIN}/a2a/v1 with \`Content-Type: application/json\` accepts JSON-RPC \`SendMessage\` and returns a public message. It does not create a task. \`capabilities.extensions\` lists the AP2 merchant role at \`${AP2_EXTENSION_URIS[0]}\` and \`${AP2_EXTENSION_URIS[1]}\`. \`required\` is false. This card does not take card payment. Do not send payment credentials or an \`ap2.mandates\` data part.

## MCP

\`GET\` ${MCP_CARD_URL} is the MCP server card. \`POST\` ${MCP_URL} with \`Content-Type: application/json\` and \`Accept: application/json, text/event-stream\` is Streamable HTTP. The tool \`read_practice\` returns the public index. Resources, prompts, and sessions are off.

## ARD

\`GET\` ${ORIGIN}/.well-known/ai-catalog.json and \`GET\` ${ORIGIN}/.well-known/ard.json are the same catalog. \`specVersion\` is \`1.0\`. Entries point at the MCP server card, the A2A agent card, this skill, and the OpenAPI documents.

## ACP

\`GET\` ${ACP_DOCUMENT_URL} is the Agentic Commerce Protocol discovery document. \`protocol.name\` is \`acp\`. The REST base is ${ACP_BASE_URL}. \`POST\` ${CHECKOUT_URL} does not create a session, does not take payment, and does not store the body. Do not send payment credentials.

## UCP

\`GET\` ${UCP_DOCUMENT_URL} is the Universal Commerce Protocol profile. \`protocol_version\` is \`${UCP_VERSION}\`. The REST base is ${UCP_BASE_URL}. \`ucp.payment_handlers\` is empty. \`POST\` ${UCP_CHECKOUT_URL} does not create a session, does not take payment, and does not store the body. Do not send payment credentials.

## Poppy

\`GET\` ${POPPY_DOCUMENT_URL} is the Personal Agent Protocol document. \`protocol_version\` is \`${POPPY_VERSION}\`. \`organization.domain\` is lucabertelli.consulting. \`web\` is empty. There is no \`auth\` issuer. Browse the site as a signed-out visitor. Do not send a session token.

## Machine payments

\`GET\` ${OPENAPI_URL} is the Machine Payment Protocol discovery document. \`POST\` ${ENGAGEMENT_URL} returns 402. \`x-payment-info.amount\` is null because the price is a written proposal. This origin does not settle Tempo, Stripe, Lightning, or card payments. Do not send a card number or a payment token. Do not invent a price.

\`GET\`, \`HEAD\`, and \`POST\` ${X402_URL} are the x402 resource. An unpaid call returns 402 with a \`PAYMENT-REQUIRED\` header. The scheme is \`exact\`, the network is \`${X402_NETWORK}\` (Base Sepolia), the price is \`${X402_PRICE}\` USDC, the asset is \`${X402_ASSET}\`, and \`payTo\` is \`${X402_PAY_TO}\`. The facilitator is ${FACILITATOR_URL}. A settled call returns a JSON acknowledgement and does not store the body. Consulting work is still priced in a written proposal.

## Web Bot Auth

Requests sent as this origin's agent include \`Signature-Agent\` and \`Signature-Input\`. The public key is ${DIRECTORY_URL}.

## WebMCP

HTML pages register \`search_site\`, \`read_page\`, and \`navigate\` on load through \`document.modelContext.registerTool\`, or \`navigator.modelContext.registerTool\` when that is the browser entry point. \`search_site\` searches ${ORIGIN}/llms.txt. \`read_page\` returns the open page. \`navigate\` opens a path or absolute URL on this origin. An AbortSignal unregisters the tools when the page is discarded.

## Contact

Write to info@lucabertelli.consulting. Do not send secrets.
`;
}

export async function sha256Prefixed(body: string): Promise<string> {
	const bytes = new TextEncoder().encode(body);
	const digest = await crypto.subtle.digest("SHA-256", bytes);
	const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
	return `sha256:${hex}`;
}

function indexText(digest: string): string {
	const index: AgentSkillsIndex = {
		$schema: AGENT_SKILLS_SCHEMA,
		skills: [
			{
				name: SKILL_NAME,
				type: "skill-md",
				description: SKILL_DESCRIPTION,
				url: SKILL_PATH,
				digest,
			},
		],
	};
	return `${JSON.stringify(index, null, 2)}\n`;
}

let filesPromise: Promise<Record<string, string>> | undefined;

/** Paths relative to `public/` and `dist/client/`. */
export function agentSkillFiles(): Promise<Record<string, string>> {
	filesPromise ??= buildAgentSkillFiles();
	return filesPromise;
}

async function buildAgentSkillFiles(): Promise<Record<string, string>> {
	const skill = skillMarkdown();
	const digest = await sha256Prefixed(skill);
	return {
		[INDEX_FILE]: indexText(digest),
		[SKILL_FILE]: skill,
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

function documentResponse(request: Request, body: string, contentType: string): Response {
	const headers = new Headers({
		"content-type": contentType,
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
 * Index and SKILL.md responses, or null when this request is neither document.
 * The request body is never read.
 */
export async function agentSkillsResponse(request: Request): Promise<Response | null> {
	const path = normalizePath(new URL(request.url).pathname);
	if (path !== AGENT_SKILLS_INDEX_PATH && path !== SKILL_PATH) return null;
	const files = await agentSkillFiles();
	const body = files[path.slice(1)];
	if (body === undefined) return null;
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
	const contentType = path === SKILL_PATH ? MARKDOWN : JSON_TYPE;
	return documentResponse(request, body, contentType);
}

export async function assertAgentSkillsResponses(): Promise<void> {
	const errors: string[] = [];
	const files = await agentSkillFiles();
	const skill = files[SKILL_FILE];
	const indexBody = files[INDEX_FILE];
	if (!skill || !indexBody) {
		throw new Error("agent skill files were not built");
	}
	if (!skill.endsWith("\n") || !indexBody.endsWith("\n")) errors.push("agent skill files must end with a newline");
	if (skill !== skillMarkdown()) errors.push("SKILL.md drifted from skillMarkdown()");

	const frontmatter = skill.split("\n").slice(0, 4);
	if (frontmatter[0] !== "---" || frontmatter[3] !== "---") errors.push("SKILL.md frontmatter fence");
	if (frontmatter[1] !== `name: ${SKILL_NAME}`) errors.push("SKILL.md name drifted");
	if (frontmatter[2] !== `description: ${yamlQuoted(SKILL_DESCRIPTION)}`) {
		errors.push("SKILL.md description drifted from the index description");
	}
	if (!skill.includes(`${ORIGIN}/llms.txt`) || !skill.includes(`${ORIGIN}/auth.md`)) {
		errors.push("SKILL.md must point at the public index and auth.md");
	}
	if (!skill.includes(MCP_CARD_URL) || !skill.includes(MCP_URL)) {
		errors.push("SKILL.md must point at the MCP server card and endpoint");
	}
	if (!skill.includes(DIRECTORY_URL)) errors.push("SKILL.md must point at the Web Bot Auth directory");
	if (!skill.includes("search_site") || !skill.includes("read_page") || !skill.includes("navigate")) {
		errors.push("SKILL.md must name the WebMCP tools");
	}
	if (!skill.includes("document.modelContext.registerTool")) {
		errors.push("SKILL.md must name the WebMCP registration call");
	}

	let index: AgentSkillsIndex;
	try {
		index = JSON.parse(indexBody) as AgentSkillsIndex;
	} catch (error) {
		throw new Error(`agent skills index is not JSON (${error instanceof Error ? error.message : error})`);
	}
	if (index.$schema !== AGENT_SKILLS_SCHEMA) errors.push("agent skills $schema");
	if (!Array.isArray(index.skills) || index.skills.length !== 1) errors.push("agent skills must list one skill");
	const entry = index.skills[0];
	if (!entry) errors.push("agent skills entry missing");
	else {
		if (entry.name !== SKILL_NAME || !NAME_PATTERN.test(entry.name) || entry.name.length > 64) {
			errors.push("agent skill name");
		}
		if (entry.type !== "skill-md") errors.push("agent skill type must be skill-md");
		if (entry.description !== SKILL_DESCRIPTION || entry.description.length > 1024) {
			errors.push("agent skill description");
		}
		if (entry.url !== SKILL_PATH) errors.push("agent skill url");
		const resolved = new URL(entry.url, AGENT_SKILLS_INDEX_URL);
		if (resolved.href !== SKILL_URL) errors.push("agent skill url does not resolve to the SKILL.md");
		const digest = await sha256Prefixed(skill);
		if (!/^sha256:[a-f0-9]{64}$/.test(entry.digest) || entry.digest !== digest) {
			errors.push("agent skill digest is not the SHA-256 of SKILL.md");
		}
	}

	const getIndex = await agentSkillsResponse(new Request(AGENT_SKILLS_INDEX_URL));
	if (!getIndex || getIndex.status !== 200) errors.push("GET agent skills index must be 200");
	else {
		if (getIndex.headers.get("content-type") !== JSON_TYPE) errors.push("agent skills index content-type");
		if (getIndex.headers.get("cache-control") !== CACHE) errors.push("agent skills index cache-control");
		if (getIndex.headers.get("access-control-allow-origin") !== "*") errors.push("agent skills index CORS");
		if ((await getIndex.text()) !== indexBody) errors.push("GET agent skills index body drifted");
	}

	const headIndex = await agentSkillsResponse(new Request(AGENT_SKILLS_INDEX_URL, { method: "HEAD" }));
	if (!headIndex || headIndex.status !== 200) errors.push("HEAD agent skills index must be 200");
	else if (await headIndex.text()) errors.push("HEAD agent skills index included a body");

	const posted = await agentSkillsResponse(new Request(AGENT_SKILLS_INDEX_URL, { method: "POST", body: "{}" }));
	if (!posted || posted.status !== 405) errors.push("POST agent skills index must be 405");

	const options = await agentSkillsResponse(new Request(`${AGENT_SKILLS_INDEX_URL}/`, { method: "OPTIONS" }));
	if (!options || options.status !== 204) errors.push("OPTIONS agent skills index must be 204");

	const getSkill = await agentSkillsResponse(new Request(SKILL_URL));
	if (!getSkill || getSkill.status !== 200) errors.push("GET SKILL.md must be 200");
	else {
		if (getSkill.headers.get("content-type") !== MARKDOWN) errors.push("SKILL.md content-type");
		const served = await getSkill.text();
		if (served !== skill) errors.push("GET SKILL.md body drifted");
		if ((await sha256Prefixed(served)) !== index.skills[0]?.digest) {
			errors.push("served SKILL.md does not match the index digest");
		}
	}

	const headSkill = await agentSkillsResponse(new Request(`${SKILL_URL}/`, { method: "HEAD" }));
	if (!headSkill || headSkill.status !== 200) errors.push("HEAD SKILL.md must be 200");
	else {
		const length = Number(headSkill.headers.get("content-length"));
		if (length !== new TextEncoder().encode(skill).byteLength) errors.push("HEAD SKILL.md content-length");
		if (await headSkill.text()) errors.push("HEAD SKILL.md included a body");
	}

	const ignored = await agentSkillsResponse(new Request(`${ORIGIN}/en/`));
	if (ignored !== null) errors.push("agent skills handler must ignore site pages");
	const missing = await agentSkillsResponse(new Request(`${ORIGIN}/.well-known/agent-skills/missing/SKILL.md`));
	if (missing !== null) errors.push("unknown skill must fall through");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
