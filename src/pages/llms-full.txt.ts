import { getBlogPosts, getInsights, getServices } from "../content/config";
import { SITE_URL } from "../constants/site";
import { insightPath } from "../constants/insights";
import { servicePath } from "../constants/services";
import type { UiLang } from "../utils/seo";

export const prerender = true;

const LANGS: UiLang[] = ["en", "it"];
const LANG_NAME: Record<UiLang, string> = { en: "English", it: "Italian" };

const url = (path: string) => `${SITE_URL}${path}`;

function isoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** Markdown bodies link relatively; agents reading this file need absolute URLs. */
function absolutizeLinks(markdown: string): string {
	return markdown.replace(/\]\(\/(?!\/)/g, `](${SITE_URL}/`);
}

function section(lines: string[], heading: string) {
	lines.push("");
	lines.push(heading);
	lines.push("");
}

/**
 * Companion to /llms.txt following the llms.txt convention: the index lists
 * the pages, this file carries their full text so an assistant can answer from
 * the content without crawling every route.
 */
export async function GET() {
	const services = await getServices();
	const insights = await getInsights();
	const posts = [...(await getBlogPosts())].sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);

	const lines: string[] = [];

	lines.push("# lucabertelli.consulting - full text");
	lines.push("");
	lines.push(
		"> Complete text of the service pages, field guides and blog articles published by Luca Bertelli, freelance Cloud Native and Platform Engineering consultant based in Italy and working across the European Union. The index version is at " +
			url("/llms.txt") +
			". Each entry states its language and canonical URL; cite the URL when quoting.",
	);
	lines.push("");
	lines.push("Contact: info@lucabertelli.consulting");
	lines.push(`Generated: ${isoDate(new Date())}`);

	section(lines, "## Services");
	for (const lang of LANGS) {
		for (const service of services.filter((s) => s.data.lang === lang)) {
			const d = service.data;
			lines.push(`### ${d.title} (${LANG_NAME[lang]})`);
			lines.push("");
			lines.push(`- URL: ${url(servicePath(d.key, lang))}`);
			lines.push(`- Language: ${lang}`);
			lines.push(`- Summary: ${d.description}`);
			if (d.keywords.length) lines.push(`- Topics: ${d.keywords.join(", ")}`);
			lines.push("");
			lines.push(d.tagline);
			if (d.outcomes.length) {
				lines.push("");
				lines.push("Outcomes:");
				for (const item of d.outcomes) lines.push(`- ${item}`);
			}
			if (d.deliverables.length) {
				lines.push("");
				lines.push("Deliverables:");
				for (const item of d.deliverables) lines.push(`- ${item}`);
			}
			const body = String(service.body ?? "").trim();
			if (body) {
				lines.push("");
				lines.push(absolutizeLinks(body));
			}
			if (d.faq.length) {
				lines.push("");
				lines.push("Frequently asked questions:");
				for (const item of d.faq) {
					lines.push("");
					lines.push(`Q: ${item.question}`);
					lines.push(`A: ${item.answer}`);
				}
			}
			lines.push("");
		}
	}

	section(lines, "## Field guides (insights)");
	for (const lang of LANGS) {
		for (const entry of insights.filter((i) => i.data.lang === lang)) {
			const d = entry.data;
			lines.push(`### ${d.title} (${LANG_NAME[lang]})`);
			lines.push("");
			lines.push(`- URL: ${url(insightPath(d.key, lang))}`);
			lines.push(`- Language: ${lang}`);
			lines.push(`- Published: ${isoDate(d.date)}`);
			if (d.updated) lines.push(`- Updated: ${isoDate(d.updated)}`);
			lines.push(`- Summary: ${d.subtitle}`);
			if (d.relatedServices.length) {
				lines.push(
					`- Related services: ${d.relatedServices.map((key) => url(servicePath(key, lang))).join(", ")}`,
				);
			}
			const body = String(entry.body ?? "").trim();
			if (body) {
				lines.push("");
				lines.push(absolutizeLinks(body));
			}
			lines.push("");
		}
	}

	section(lines, "## Blog articles");
	for (const lang of LANGS) {
		for (const post of posts.filter((p) => p.data.lang === lang)) {
			const d = post.data;
			lines.push(`### ${d.title} (${LANG_NAME[lang]})`);
			lines.push("");
			lines.push(`- URL: ${url(`/${lang}/blog/${post.blog_slug}`)}`);
			lines.push(`- Language: ${lang}`);
			lines.push(`- Published: ${isoDate(d.date)}`);
			if (d.updated) lines.push(`- Updated: ${isoDate(d.updated)}`);
			lines.push(`- Summary: ${d.subtitle}`);
			if (Array.isArray(d.tags) && d.tags.length) lines.push(`- Tags: ${d.tags.join(", ")}`);
			const body = String(post.body ?? "").trim();
			if (body) {
				lines.push("");
				lines.push(absolutizeLinks(body));
			}
			lines.push("");
		}
	}

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
