/**
 * Check Auth.md discovery invariants, response behavior, and (when a build
 * directory is passed) that the shipped files match the module.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "dotenv";
import { SERVICE_KEYS } from "../src/constants/services.ts";
import { agentCard, agentCardResponse, assertAgentCardResponses } from "../src/discovery/agent-card.ts";
import { authMarkdown, assertDiscoveryResponses, discoveryResponse, fileBodies, ORIGIN } from "../src/discovery/agent-auth.ts";
import {
	AGENT_SKILLS_INDEX_PATH,
	AGENT_SKILLS_INDEX_URL,
	agentSkillFiles,
	agentSkillsResponse,
	assertAgentSkillsResponses,
	SKILL_PATH,
} from "../src/discovery/agent-skills.ts";
import { assertMcpResponses, MCP_CARD_PATH, MCP_CARD_URL, MCP_PATH, MCP_URL, mcpResponse } from "../src/discovery/mcp-server.ts";
import { assertWebMcpTools, WEB_MCP_TOOL_NAMES } from "../src/discovery/webmcp.ts";
import {
	assertWebBotAuthResponses,
	DIRECTORY_FILE,
	DIRECTORY_TYPE,
	DIRECTORY_URL,
	directoryResponse,
	directoryText,
	PUBLIC_JWK,
} from "../src/discovery/web-bot-auth.ts";
import { verifierFromJWK } from "web-bot-auth/crypto";
import { component, verifySignature } from "http-message-sig";

const CONTENT_TYPES: Record<string, string> = {
	"/auth.md": "text/markdown; charset=utf-8",
	"/.well-known/oauth-protected-resource": "application/json; charset=utf-8",
	"/.well-known/oauth-authorization-server": "application/json; charset=utf-8",
	"/.well-known/agent-card.json": "application/json; charset=utf-8",
	"/.well-known/agent-skills/index.json": "application/json; charset=utf-8",
	"/.well-known/agent-skills/consulting-practice/SKILL.md": "text/markdown; charset=utf-8",
	"/.well-known/mcp/server-card.json": "application/json; charset=utf-8",
	"/.well-known/http-message-signatures-directory": "application/http-message-signatures-directory+json",
	"/agent/auth/register": "application/json; charset=utf-8",
	"/agent/auth/claim": "application/json; charset=utf-8",
	"/agent/auth/revoke": "application/json; charset=utf-8",
};

/** When `.dev.vars` is present, the published key must sign the directory response. */
async function assertPublishedKeySigns(): Promise<void> {
	const devVars = join(import.meta.dirname, "..", ".dev.vars");
	if (!existsSync(devVars)) return;
	const env = parse(readFileSync(devVars, "utf8"));
	const now = new Date();
	const request = new Request(DIRECTORY_URL);
	const response = await directoryResponse(request, env, now);
	if (!response || response.status !== 200) throw new Error("signed directory was not served");
	if (response.headers.get("content-type") !== DIRECTORY_TYPE) {
		throw new Error("signed directory content-type drifted");
	}
	const signature = response.headers.get("signature");
	const signatureInput = response.headers.get("signature-input");
	const contentDigest = response.headers.get("content-digest");
	if (!signature || !signatureInput || !contentDigest) {
		throw new Error("directory response was not signed with .dev.vars");
	}
	if (!signatureInput.includes('"content-digest"')) {
		throw new Error("directory signature does not cover content-digest");
	}
	const body = await response.text();
	if (body !== directoryText()) throw new Error("signed directory body drifted");
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
	const expectedDigest = `sha-256=:${Buffer.from(digest).toString("base64")}:`;
	if (contentDigest !== expectedDigest) throw new Error("Content-Digest does not match the directory body");
	const verified = await verifySignature(
		{
			kind: "response",
			status: 200,
			fields: [
				{ name: "content-digest", value: contentDigest },
				{ name: "signature", value: signature },
				{ name: "signature-input", value: signatureInput },
			],
			request,
		},
		{
			label: "sig1",
			policy: {
				algorithms: ["ed25519"],
				requiredComponents: [component("@authority", { req: true }), "content-digest"],
				requiredParameters: ["created", "expires", "keyid", "alg", "tag"],
				now: Math.floor(now.getTime() / 1000),
				maxAge: 3600,
			},
			resolveVerifier: async () => verifierFromJWK(PUBLIC_JWK),
		},
	);
	if (verified.parameters.keyid !== PUBLIC_JWK.kid) {
		throw new Error("directory signature keyid is not the published thumbprint");
	}
	if (verified.parameters.tag !== "http-message-signatures-directory") {
		throw new Error("directory signature tag drifted");
	}
}

function pageHtml(root: string, lang: string): string | null {
	for (const rel of [`${lang}/index.html`, `${lang}.html`]) {
		const full = join(root, rel);
		if (existsSync(full)) return readFileSync(full, "utf8");
	}
	return null;
}

/** Follow the homepage script graph so a bundled WebMCP chunk is still checked. */
function scriptBundle(root: string, html: string, errors: string[]): string {
	const queue: string[] = [];
	for (const match of html.matchAll(/<script\b[^>]*>/g)) {
		const src = match[0].match(/\bsrc="([^"]+)"/);
		if (src?.[1]) queue.push(src[1]);
	}
	for (const match of html.matchAll(/<link\b[^>]*>/g)) {
		const tag = match[0];
		if (!tag.includes('rel="modulepreload"')) continue;
		const href = tag.match(/\bhref="([^"]+\.js)"/);
		if (href?.[1]) queue.push(href[1]);
	}
	const seen = new Set<string>();
	let bundle = html;
	while (queue.length > 0 && seen.size < 40) {
		const src = queue.shift();
		if (!src || seen.has(src) || src.startsWith("http")) continue;
		seen.add(src);
		const rel = src.startsWith("/") ? src.slice(1) : src;
		const file = join(root, rel);
		if (!existsSync(file)) {
			errors.push(`WebMCP: script ${src} is missing from the build`);
			continue;
		}
		const text = readFileSync(file, "utf8");
		bundle += text;
		for (const match of text.matchAll(/["']((?:\/_astro\/|\.\/)[^"']+\.js)["']/g)) {
			const spec = match[1];
			if (!spec) continue;
			if (spec.startsWith("/")) {
				queue.push(spec);
				continue;
			}
			try {
				const base = src.startsWith("/") ? src : `/${src}`;
				queue.push(new URL(spec, `https://assets.local${base}`).pathname);
			} catch {
				errors.push(`WebMCP: could not resolve ${spec} from ${src}`);
			}
		}
	}
	return bundle;
}

function headerBlock(headers: string, route: string): string {
	const marker = `${route}\n`;
	const start = headers.indexOf(marker);
	if (start === -1) return "";
	const rest = headers.slice(start + marker.length);
	const next = rest.search(/\n\/\S/);
	return next === -1 ? rest : rest.slice(0, next);
}

async function main(): Promise<void> {
	const errors: string[] = [];
	try {
		await assertDiscoveryResponses();
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}
	try {
		await assertAgentCardResponses();
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}
	try {
		await assertAgentSkillsResponses();
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}
	try {
		await assertMcpResponses();
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}
	try {
		await assertWebBotAuthResponses();
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}
	try {
		await assertWebMcpTools();
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}
	try {
		await assertPublishedKeySigns();
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}

	if (!authMarkdown().includes(AGENT_SKILLS_INDEX_URL)) {
		errors.push("auth.md must link the agent skills index");
	}
	if (!authMarkdown().includes("_index._agents.")) {
		errors.push("auth.md must name the DNS-AID index");
	}
	const layout = readFileSync(join(import.meta.dirname, "..", "src", "layouts", "Common.astro"), "utf8");
	if (!layout.includes("startWebMcp")) errors.push("Common.astro does not start WebMCP on page load");
	const llmsSource = readFileSync(join(import.meta.dirname, "..", "src", "pages", "llms.txt.ts"), "utf8");
	if (!WEB_MCP_TOOL_NAMES.every((name) => llmsSource.includes(name))) {
		errors.push("llms.txt source does not list the WebMCP tools");
	}
	if (!llmsSource.includes("_index._agents.")) {
		errors.push("llms.txt source does not name the DNS-AID index");
	}

	const cardRequest = await discoveryResponse(new Request(`${ORIGIN}/.well-known/agent-card.json`));
	if (cardRequest !== null) errors.push("discovery handler must not claim the agent card");
	const skillsRequest = await discoveryResponse(new Request(`${ORIGIN}${AGENT_SKILLS_INDEX_PATH}`));
	if (skillsRequest !== null) errors.push("discovery handler must not claim the agent skills index");
	const skillFileRequest = await discoveryResponse(new Request(`${ORIGIN}${SKILL_PATH}`));
	if (skillFileRequest !== null) errors.push("discovery handler must not claim the skill file");
	const rpcRequest = await discoveryResponse(new Request(`${ORIGIN}/a2a/v1`));
	if (rpcRequest !== null) errors.push("discovery handler must not claim the A2A endpoint");
	const mcpCardRequest = await discoveryResponse(new Request(MCP_CARD_URL));
	if (mcpCardRequest !== null) errors.push("discovery handler must not claim the MCP server card");
	const mcpRequest = await discoveryResponse(new Request(MCP_URL, { method: "POST" }));
	if (mcpRequest !== null) errors.push("discovery handler must not claim the MCP endpoint");
	const directoryClaim = await discoveryResponse(new Request(DIRECTORY_URL));
	if (directoryClaim !== null) errors.push("discovery handler must not claim the Web Bot Auth directory");
	for (const url of [MCP_CARD_URL, MCP_URL]) {
		if ((await agentCardResponse(new Request(url))) !== null) errors.push(`agent card handler claimed ${url}`);
		if ((await agentSkillsResponse(new Request(url))) !== null) errors.push(`agent skills handler claimed ${url}`);
		if ((await mcpResponse(new Request(url))) === null) errors.push(`mcp handler missed ${url}`);
	}
	if (MCP_CARD_PATH !== "/.well-known/mcp/server-card.json" || MCP_PATH !== "/mcp") {
		errors.push("MCP paths drifted");
	}

	const servicesRoot = join(import.meta.dirname, "..", "src", "content", "services");
	const skills = agentCard().skills;
	if (skills.length !== SERVICE_KEYS.length) errors.push("agent card skill count drifted from SERVICE_KEYS");
	for (const skill of skills) {
		const page = join(servicesRoot, skill.id, "en.md");
		if (!existsSync(page)) {
			errors.push(`agent card skill ${skill.id} has no English service page`);
			continue;
		}
		const markdown = readFileSync(page, "utf8");
		const title = markdown.match(/^title:\s*"([^"]*)"\s*$/m)?.[1];
		const description = markdown.match(/^description:\s*"([^"]*)"\s*$/m)?.[1];
		if (skill.name !== title) errors.push(`agent card skill ${skill.id} name drifted from the English title`);
		if (skill.description !== description) {
			errors.push(`agent card skill ${skill.id} description drifted from the English service page`);
		}
	}

	const publicRoot = join(import.meta.dirname, "..", "public");
	const sourceBodies = { ...fileBodies(), ...(await agentSkillFiles()), [DIRECTORY_FILE]: directoryText() };
	for (const [rel, body] of Object.entries(sourceBodies)) {
		const full = join(publicRoot, rel);
		if (!existsSync(full)) {
			errors.push(`${rel} is missing from public/; run render-auth-md.ts`);
			continue;
		}
		if (readFileSync(full, "utf8") !== body) {
			errors.push(`${rel} in public/ does not match the discovery source; run render-auth-md.ts`);
		}
	}

	const root = process.argv[2];
	if (root) {
		const bodies = { ...fileBodies(), ...(await agentSkillFiles()), [DIRECTORY_FILE]: directoryText() };
		for (const [rel, body] of Object.entries(bodies)) {
			const full = join(root, rel);
			if (!existsSync(full)) {
				errors.push(`${rel} is missing from ${root}`);
				continue;
			}
			const shipped = readFileSync(full, "utf8");
			if (shipped !== body) errors.push(`${rel} in ${root} does not match the discovery source`);
		}

		const llmsPath = join(root, "llms.txt");
		if (!existsSync(llmsPath)) errors.push("llms.txt is missing from the build");
		else if (!readFileSync(llmsPath, "utf8").includes(AGENT_SKILLS_INDEX_URL)) {
			errors.push("llms.txt does not list the agent skills index");
		} else if (!readFileSync(llmsPath, "utf8").includes(MCP_CARD_URL)) {
			errors.push("llms.txt does not list the MCP server card");
		} else if (!readFileSync(llmsPath, "utf8").includes(DIRECTORY_URL)) {
			errors.push("llms.txt does not list the Web Bot Auth directory");
		} else if (!WEB_MCP_TOOL_NAMES.every((name) => readFileSync(llmsPath, "utf8").includes(name))) {
			errors.push("llms.txt does not list the WebMCP tools");
		} else if (!readFileSync(llmsPath, "utf8").includes("_index._agents.")) {
			errors.push("llms.txt does not name the DNS-AID index");
		}

		for (const lang of ["en", "it"]) {
			const html = pageHtml(root, lang);
			if (!html) {
				errors.push(`WebMCP: ${lang} homepage HTML is missing from the build`);
				continue;
			}
			const bundle = scriptBundle(root, html, errors);
			for (const needle of ["registerTool", "modelContext", ...WEB_MCP_TOOL_NAMES]) {
				if (!bundle.includes(needle)) errors.push(`WebMCP: ${lang} homepage script is missing ${needle}`);
			}
		}

		const headersPath = join(root, "_headers");
		if (!existsSync(headersPath)) {
			errors.push("_headers is missing from the build");
		} else {
			const headers = readFileSync(headersPath, "utf8");
			for (const [route, contentType] of Object.entries(CONTENT_TYPES)) {
				const block = headerBlock(headers, route);
				if (!block) errors.push(`_headers has no block for ${route}`);
				else if (!block.includes(`Content-Type: ${contentType}`)) {
					errors.push(`_headers does not set ${contentType} on ${route}`);
				}
			}
		}
	}

	if (errors.length > 0) {
		console.error(errors.join("\n"));
		process.exit(1);
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
