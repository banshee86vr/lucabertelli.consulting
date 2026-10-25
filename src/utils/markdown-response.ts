import { parseHTML } from "linkedom";
import TurndownService from "turndown/lib/turndown.browser.es.js";
import { strikethrough, taskListItems } from "turndown-plugin-gfm";

const HTML_LIMIT = Math.floor(1.5 * 1024 * 1024);

const turndown = new TurndownService({
	headingStyle: "atx",
	codeBlockStyle: "fenced",
	bulletListMarker: "-",
});
turndown.use(strikethrough);
turndown.use(taskListItems);
turndown.addRule("gfmTable", {
	filter: (node) => node.nodeName === "TABLE",
	replacement: (_content, node) => markdownTable(node as unknown as Element),
});
turndown.addRule("fencedPre", {
	filter: "pre",
	replacement: (_content, node) => {
		const text = node.textContent ?? "";
		const language = codeLanguage(node);
		return `\n\n${fenced(language, text)}\n\n`;
	},
});

interface MediaRange {
	type: string;
	subtype: string;
	q: number;
	index: number;
}

/** True when text/markdown is acceptable and preferred over text/html. */
export function prefersMarkdown(accept: string | null): boolean {
	if (!accept) return false;
	const ranges = parseAccept(accept);
	const markdown = matchQuality(ranges, "text", "markdown");
	if (!markdown) return false;
	const html = matchQuality(ranges, "text", "html");
	if (!html) return true;
	if (markdown.q !== html.q) return markdown.q > html.q;
	return markdown.index < html.index;
}

export async function negotiateMarkdown(request: Request, response: Response): Promise<Response> {
	if (response.status >= 300 && response.status < 400) return response;
	if (!isHtml(response)) return response;

	const varied = withVaryAccept(response);
	if (!prefersMarkdown(request.headers.get("accept"))) return varied;

	const advertised = Number(varied.headers.get("content-length"));
	if (Number.isFinite(advertised) && advertised > HTML_LIMIT) return varied;

	const htmlBuffer = await varied.arrayBuffer();
	if (htmlBuffer.byteLength > HTML_LIMIT) {
		return new Response(htmlBuffer, {
			status: varied.status,
			statusText: varied.statusText,
			headers: varied.headers,
		});
	}

	let markdown: string;
	try {
		markdown = htmlToMarkdown(new TextDecoder().decode(htmlBuffer), new URL(request.url).origin);
	} catch (error) {
		console.error("markdown conversion failed", error);
		return new Response(htmlBuffer, {
			status: varied.status,
			statusText: varied.statusText,
			headers: varied.headers,
		});
	}
	const headers = new Headers(varied.headers);
	headers.delete("content-length");
	headers.delete("content-encoding");
	headers.delete("etag");
	headers.delete("last-modified");
	headers.set("content-type", "text/markdown; charset=utf-8");
	headers.set("x-markdown-tokens", String(Math.ceil(markdown.length / 4)));
	headers.set("content-signal", "ai-train=yes, search=yes, ai-input=yes");
	return new Response(markdown, {
		status: varied.status,
		statusText: varied.statusText,
		headers,
	});
}

function htmlToMarkdown(html: string, origin: string): string {
	const { document } = parseHTML(html);
	const source = document.querySelector("#main-content") ?? document.body;
	if (source) prepareForMarkdown(source);
	const body = source
		? absolutize(turndown.turndown(source).replace(/\n{3,}/g, "\n\n").trim(), origin)
		: "";
	const frontmatter = yamlFrontmatter(document, origin);
	const jsonLd = jsonLdBlock(document);
	return [frontmatter, body, jsonLd].filter(Boolean).join("\n\n") + "\n";
}

function prepareForMarkdown(source: Element) {
	source.querySelectorAll("script, style, noscript, .lb-breadcrumbs__sep").forEach((node) => node.remove());
	separateTouchingElements(source);
}

function markdownTable(table: Element): string {
	const rows = [...table.querySelectorAll("tr")].map((row) =>
		[...row.children]
			.filter((cell) => cell.nodeName === "TH" || cell.nodeName === "TD")
			.map((cell) =>
				turndown
					.turndown(cell)
					.replace(/\|/g, "\\|")
					.replace(/\s+/g, " ")
					.trim(),
			),
	);
	if (rows.length === 0 || rows[0].length === 0) return "";
	const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
	const divider = `| ${rows[0].map(() => "---").join(" | ")} |`;
	return `\n\n${[line(rows[0]), divider, ...rows.slice(1).map(line)].join("\n")}\n\n`;
}

/** Put a space between adjacent elements whose text runs together, outside code. */
function separateTouchingElements(root: Element) {
	for (const el of root.querySelectorAll("*")) {
		if (el.closest("pre, code")) continue;
		const prev = el.previousSibling;
		if (!prev) continue;
		const left = prev.textContent?.slice(-1) ?? "";
		const right = el.textContent?.slice(0, 1) ?? "";
		if (left && right && !/\s/.test(left) && !/\s/.test(right)) {
			el.parentNode?.insertBefore(el.ownerDocument.createTextNode(" "), el);
		}
	}
}

function yamlFrontmatter(document: Document, origin: string): string {
	const title = document.querySelector("title")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
	const description = metaContent(document, 'meta[name="description"]');
	const image = absoluteUrl(metaContent(document, 'meta[property="og:image"]'), origin);
	const fields = [
		title ? `title: ${yamlString(title)}` : "",
		description ? `description: ${yamlString(description)}` : "",
		image ? `image: ${yamlString(image)}` : "",
	].filter(Boolean);
	if (fields.length === 0) return "";
	return `---\n${fields.join("\n")}\n---`;
}

function jsonLdBlock(document: Document): string {
	const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')]
		.map((node) => node.textContent?.trim() ?? "")
		.filter(Boolean);
	if (blocks.length === 0) return "";
	return fenced("json", blocks.join("\n"));
}

function metaContent(document: Document, selector: string): string {
	return document.querySelector(selector)?.getAttribute("content")?.replace(/\s+/g, " ").trim() ?? "";
}

function yamlString(value: string): string {
	return JSON.stringify(value);
}

function absoluteUrl(value: string, origin: string): string {
	if (value.startsWith("/") && !value.startsWith("//")) return `${origin}${value}`;
	return value;
}

function absolutize(markdown: string, origin: string): string {
	return markdown.replace(/\]\(\/(?!\/)/g, `](${origin}/`);
}

function codeLanguage(node: { getAttribute(name: string): string | null; querySelector(selector: string): { getAttribute(name: string): string | null } | null }): string {
	const fromData = node.getAttribute("data-language");
	if (fromData && fromData !== "plaintext") return fromData;
	const code = node.querySelector("code");
	const classes = `${node.getAttribute("class") ?? ""} ${code?.getAttribute("class") ?? ""}`;
	return classes.match(/language-([\w#+-]+)/)?.[1] ?? "";
}

function fenced(language: string, text: string): string {
	const body = text.replace(/\n$/, "");
	const fence = "`".repeat(Math.max(3, longestBacktickRun(body) + 1));
	return `${fence}${language}\n${body}\n${fence}`;
}

function longestBacktickRun(text: string): number {
	let longest = 0;
	let current = 0;
	for (const char of text) {
		if (char === "`") {
			current += 1;
			if (current > longest) longest = current;
		} else {
			current = 0;
		}
	}
	return longest;
}

function parseAccept(header: string): MediaRange[] {
	const ranges: MediaRange[] = [];
	for (const [index, part] of header.split(",").entries()) {
		const pieces = part
			.split(";")
			.map((piece) => piece.trim())
			.filter(Boolean);
		const media = pieces.shift()?.toLowerCase();
		if (!media) continue;
		const slash = media.indexOf("/");
		if (slash <= 0 || slash === media.length - 1) continue;
		const type = media.slice(0, slash);
		const subtype = media.slice(slash + 1);
		let q = 1;
		let invalid = false;
		for (const param of pieces) {
			const eq = param.indexOf("=");
			if (eq === -1) continue;
			if (param.slice(0, eq).trim().toLowerCase() !== "q") continue;
			const value = Number(param.slice(eq + 1).trim());
			if (!Number.isFinite(value)) {
				invalid = true;
				break;
			}
			q = value;
		}
		if (!invalid && q > 0) ranges.push({ type, subtype, q, index });
	}
	return ranges;
}

function matchQuality(ranges: MediaRange[], type: string, subtype: string): { q: number; index: number } | null {
	let best: { q: number; specificity: number; index: number } | null = null;
	for (const range of ranges) {
		let specificity = -1;
		if (range.type === type && range.subtype === subtype) specificity = 2;
		else if (range.type === type && range.subtype === "*") specificity = 1;
		else if (range.type === "*" && range.subtype === "*") specificity = 0;
		if (specificity < 0) continue;
		if (
			!best ||
			specificity > best.specificity ||
			(specificity === best.specificity && range.q > best.q) ||
			(specificity === best.specificity && range.q === best.q && range.index < best.index)
		) {
			best = { q: range.q, specificity, index: range.index };
		}
	}
	return best ? { q: best.q, index: best.index } : null;
}

function isHtml(response: Response): boolean {
	const type = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
	return type === "text/html";
}

function withVaryAccept(response: Response): Response {
	const headers = new Headers(response.headers);
	const vary = headers.get("vary");
	const hasAccept = vary?.split(",").some((part) => part.trim().toLowerCase() === "accept") ?? false;
	if (!hasAccept) headers.set("vary", vary ? `${vary}, Accept` : "Accept");
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
