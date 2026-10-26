import { handle } from "@astrojs/cloudflare/handler";
import { acpResponse } from "./discovery/acp";
import { agentCardResponse } from "./discovery/agent-card";
import { discoveryResponse, withProtectedResourceChallenge } from "./discovery/agent-auth";
import { agentSkillsResponse } from "./discovery/agent-skills";
import { mcpResponse } from "./discovery/mcp-server";
import { directoryResponse } from "./discovery/web-bot-auth";
import { withDiscoveryLinks } from "./utils/discovery-links";
import { negotiateMarkdown } from "./utils/markdown-response";

interface WorkerContext {
	waitUntil(promise: Promise<unknown>): void;
}

export default {
	async fetch(request: Request, env: unknown, ctx: WorkerContext) {
		// Answer the Web Bot Auth directory, Agent Skills, the Agent Card, MCP,
		// ACP, and Auth.md discovery before Astro. POST must not fall through
		// to a static file or a 404, and the body is never stored.
		const directory = await directoryResponse(request, env);
		if (directory) return withProtectedResourceChallenge(request, directory);
		const skills = await agentSkillsResponse(request);
		if (skills) return withProtectedResourceChallenge(request, skills);
		const agentCard = await agentCardResponse(request);
		if (agentCard) return withProtectedResourceChallenge(request, agentCard);
		const mcp = await mcpResponse(request);
		if (mcp) return withProtectedResourceChallenge(request, mcp);
		const acp = await acpResponse(request);
		if (acp) return withProtectedResourceChallenge(request, acp);
		const discovered = await discoveryResponse(request);
		if (discovered) return withProtectedResourceChallenge(request, discovered);
		const response = await negotiateMarkdown(request, await handle(request, env, ctx));
		// HTML routes run the Worker first, so public/_headers does not apply
		// to them. Attach the homepage Link header on the way out.
		return withProtectedResourceChallenge(request, withDiscoveryLinks(request, response));
	},
};
