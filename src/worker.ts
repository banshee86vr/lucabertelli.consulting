import { handle } from "@astrojs/cloudflare/handler";
import { acpResponse } from "./discovery/acp";
import { agentCardResponse } from "./discovery/agent-card";
import { discoveryResponse, withProtectedResourceChallenge } from "./discovery/agent-auth";
import { agentSkillsResponse } from "./discovery/agent-skills";
import { ardResponse } from "./discovery/ard";
import { mcpResponse } from "./discovery/mcp-server";
import { mppResponse } from "./discovery/mpp";
import { poppyResponse } from "./discovery/poppy";
import { ucpResponse } from "./discovery/ucp";
import { x402Response } from "./discovery/x402";
import { directoryResponse } from "./discovery/web-bot-auth";
import { withDiscoveryLinks } from "./utils/discovery-links";
import { negotiateMarkdown } from "./utils/markdown-response";

interface WorkerContext {
	waitUntil(promise: Promise<unknown>): void;
}

export default {
	async fetch(request: Request, env: unknown, ctx: WorkerContext) {
		// Answer the Web Bot Auth directory, Agent Skills, the ARD catalog, the
		// Agent Card, MCP, ACP, UCP, Poppy, MPP discovery, the x402 challenge, and
		// Auth.md discovery before Astro. POST must not fall through to a
		// static file or a 404, and the body is never stored.
		const directory = await directoryResponse(request, env);
		if (directory) return withProtectedResourceChallenge(request, directory);
		const skills = await agentSkillsResponse(request);
		if (skills) return withProtectedResourceChallenge(request, skills);
		const ard = await ardResponse(request);
		if (ard) return withProtectedResourceChallenge(request, ard);
		const agentCard = await agentCardResponse(request);
		if (agentCard) return withProtectedResourceChallenge(request, agentCard);
		const mcp = await mcpResponse(request);
		if (mcp) return withProtectedResourceChallenge(request, mcp);
		const acp = await acpResponse(request);
		if (acp) return withProtectedResourceChallenge(request, acp);
		const ucp = await ucpResponse(request);
		if (ucp) return withProtectedResourceChallenge(request, ucp);
		const poppy = await poppyResponse(request);
		if (poppy) return withProtectedResourceChallenge(request, poppy);
		const mpp = await mppResponse(request);
		if (mpp) return withProtectedResourceChallenge(request, mpp);
		const x402 = await x402Response(request);
		if (x402) return withProtectedResourceChallenge(request, x402);
		const discovered = await discoveryResponse(request);
		if (discovered) return withProtectedResourceChallenge(request, discovered);
		const response = await negotiateMarkdown(request, await handle(request, env, ctx));
		// HTML routes run the Worker first, so public/_headers does not apply
		// to them. Attach the homepage Link header on the way out.
		return withProtectedResourceChallenge(request, withDiscoveryLinks(request, response));
	},
};
