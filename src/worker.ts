import { handle } from "@astrojs/cloudflare/handler";
import { discoveryResponse } from "./discovery/agent-auth";
import { negotiateMarkdown } from "./utils/markdown-response";

interface WorkerContext {
	waitUntil(promise: Promise<unknown>): void;
}

export default {
	async fetch(request: Request, env: unknown, ctx: WorkerContext) {
		// Answer Auth.md discovery before Astro. POST must not fall through to a
		// static file or a 404, and the body is never stored.
		const discovered = await discoveryResponse(request);
		if (discovered) return discovered;
		const response = await handle(request, env, ctx);
		return negotiateMarkdown(request, response);
	},
};
