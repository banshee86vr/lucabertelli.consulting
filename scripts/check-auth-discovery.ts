/**
 * Check Auth.md discovery invariants, response behavior, and (when a build
 * directory is passed) that the shipped files match the module.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

const CONTENT_TYPES: Record<string, string> = {
	"/auth.md": "text/markdown; charset=utf-8",
	"/.well-known/oauth-protected-resource": "application/json; charset=utf-8",
	"/.well-known/oauth-authorization-server": "application/json; charset=utf-8",
	"/.well-known/agent-card.json": "application/json; charset=utf-8",
	"/.well-known/agent-skills/index.json": "application/json; charset=utf-8",
	"/.well-known/agent-skills/consulting-practice/SKILL.md": "text/markdown; charset=utf-8",
	"/.well-known/mcp/server-card.json": "application/json; charset=utf-8",
	"/agent/auth/register": "application/json; charset=utf-8",
	"/agent/auth/claim": "application/json; charset=utf-8",
	"/agent/auth/revoke": "application/json; charset=utf-8",
};

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

	if (!authMarkdown().includes(AGENT_SKILLS_INDEX_URL)) {
		errors.push("auth.md must link the agent skills index");
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

	const root = process.argv[2];
	if (root) {
		const bodies = { ...fileBodies(), ...(await agentSkillFiles()) };
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
