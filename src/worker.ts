import { handle } from "@astrojs/cloudflare/handler";
import { negotiateMarkdown } from "./utils/markdown-response";

interface WorkerContext {
	waitUntil(promise: Promise<unknown>): void;
}

export default {
	async fetch(request: Request, env: unknown, ctx: WorkerContext) {
		const response = await handle(request, env, ctx);
		return negotiateMarkdown(request, response);
	},
};
