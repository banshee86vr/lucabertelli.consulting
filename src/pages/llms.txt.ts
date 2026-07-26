import { getBlogPosts, getServices } from "../content/config";
import { getCollection } from "astro:content";
import { SITE_URL } from "../constants/site";
import { servicePath, servicesHubPath } from "../constants/services";
import { tagLabel, tagPath, tagSlug } from "../utils/tags";
import type { UiLang } from "../utils/seo";

export const prerender = true;

const LANGS: UiLang[] = ["en", "it"];

const url = (path: string) => `${SITE_URL}${path}`;

function isoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/**
 * Generated at build time from the same collections that render the site, so
 * the agent-facing summary cannot drift away from the actual pages.
 */
export async function GET() {
	const services = await getServices();
	const posts = await getBlogPosts();
	const certifications = await getCollection("certifications");

	const lines: string[] = [];

	lines.push("# lucabertelli.consulting");
	lines.push("");
	lines.push(
		"> Luca Bertelli is a freelance DevOps and Cloud Native consultant based in Italy, working with clients across Italy and the European Union. Areas of work: DevOps consulting, cloud migration, Platform Engineering, Kubernetes, SecDevOps and CI/CD, technical training, and AI engineering.",
	);
	lines.push("");

	lines.push("## Identity");
	lines.push("- Name: Luca Bertelli");
	lines.push('- Alternate names: LB Consulting, lb.consulting');
	lines.push("- Role: Freelance DevOps and Cloud Native consultant");
	lines.push("- Based in: Italy. Serves: Italy and the European Union");
	lines.push("- Languages: Italian, English");
	lines.push("- Email: info@lucabertelli.consulting");
	lines.push("- VAT / P.IVA: 05028510237");
	lines.push(
		"- Site languages: English at /en/ (default), Italian at /it/. Service slugs are localized per language.",
	);
	lines.push("");

	lines.push("## Key pages");
	for (const lang of LANGS) {
		lines.push(`- Home (${lang}): ${url(`/${lang}`)}`);
	}
	for (const lang of LANGS) {
		lines.push(`- Services hub (${lang}): ${url(servicesHubPath(lang))}`);
	}
	for (const lang of LANGS) {
		lines.push(`- Blog (${lang}): ${url(`/${lang}/blog`)}`);
	}
	for (const lang of LANGS) {
		lines.push(`- RSS (${lang}): ${url(`/${lang}/rss.xml`)}`);
	}
	lines.push("");

	lines.push("## Services");
	for (const lang of LANGS) {
		lines.push("");
		lines.push(`### ${lang === "it" ? "Italian" : "English"}`);
		for (const service of services.filter((s) => s.data.lang === lang)) {
			const key = service.data.key;
			lines.push(`- [${service.data.title}](${url(servicePath(key, lang))}): ${service.data.description}`);
		}
	}
	lines.push("");

	lines.push("## Articles");
	const sortedPosts = [...posts].sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
	for (const lang of LANGS) {
		lines.push("");
		lines.push(`### ${lang === "it" ? "Italian" : "English"}`);
		for (const post of sortedPosts.filter((p) => p.data.lang === lang)) {
			lines.push(
				`- [${post.data.title}](${url(`/${lang}/blog/${post.blog_slug}`)}) - ${isoDate(post.data.date)} - ${post.data.subtitle}`,
			);
		}
	}
	lines.push("");

	lines.push("## Topics");
	const tags = [
		...new Map(
			posts.flatMap((p) => p.data.tags as string[]).map((t) => [tagSlug(t), t]),
		).values(),
	].sort();
	for (const tag of tags) {
		lines.push(`- ${tagLabel(tag)}: ${url(tagPath(tag, "en"))}`);
	}
	lines.push("");

	lines.push("## Certifications");
	for (const cert of [...certifications].sort(
		(a, b) => b.data.issueDate.valueOf() - a.data.issueDate.valueOf(),
	)) {
		const suffix = cert.data.url ? ` - ${cert.data.url}` : "";
		lines.push(`- ${cert.data.title} (${isoDate(cert.data.issueDate)})${suffix}`);
	}
	lines.push("");

	lines.push("## Professional profiles");
	lines.push("- LinkedIn: https://www.linkedin.com/in/luca-bertelli-a1413b77");
	lines.push("- GitHub: https://github.com/banshee86vr");
	lines.push("- Medium: https://medium.com/@bertelli.luca");
	lines.push("- Credly: https://www.credly.com/users/luca-bertelli");
	lines.push("");

	lines.push("## Policies");
	for (const lang of LANGS) {
		lines.push(`- Privacy (${lang}): ${url(`/${lang}/privacy`)}`);
	}
	for (const lang of LANGS) {
		lines.push(`- Cookies (${lang}): ${url(`/${lang}/cookies`)}`);
	}
	lines.push("");

	lines.push("## Machine-readable discovery");
	lines.push(`- Sitemap index: ${url("/sitemap-index.xml")}`);
	lines.push(`- robots.txt: ${url("/robots.txt")}`);
	lines.push("");

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
