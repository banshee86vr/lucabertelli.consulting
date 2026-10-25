declare module "turndown/lib/turndown.browser.es.js" {
	interface HtmlNode {
		nodeType: number;
		nodeName: string;
		textContent: string | null;
		getAttribute(name: string): string | null;
		querySelector(selector: string): HtmlNode | null;
	}

	interface TurndownRule {
		filter: string | readonly string[] | ((node: HtmlNode) => boolean);
		replacement: (content: string, node: HtmlNode) => string;
	}

	export default class TurndownService {
		constructor(options?: {
			headingStyle?: "setext" | "atx";
			codeBlockStyle?: "indented" | "fenced";
			bulletListMarker?: "-" | "+" | "*";
		});
		turndown(input: HtmlNode): string;
		use(plugin: (service: TurndownService) => void): this;
		addRule(key: string, rule: TurndownRule): this;
	}
}

declare module "turndown-plugin-gfm" {
	import type TurndownService from "turndown/lib/turndown.browser.es.js";
	export function strikethrough(service: TurndownService): void;
	export function taskListItems(service: TurndownService): void;
}

declare module "@astrojs/cloudflare/handler" {
	export function handle(
		request: Request,
		env: unknown,
		context: { waitUntil(promise: Promise<unknown>): void },
	): Promise<Response>;
}
