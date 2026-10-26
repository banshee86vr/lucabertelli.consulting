import { getBlogPosts, getInsights, getServices } from "../content/config";
import { getCollection } from "astro:content";
import { API_VERSION } from "../discovery/acp";
import { SITE_URL } from "../constants/site";
import { insightPath, insightsHubPath } from "../constants/insights";
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
	const insights = await getInsights();
	const certifications = await getCollection("certifications");

	const lines: string[] = [];

	lines.push("# lucabertelli.consulting");
	lines.push("");
	lines.push(
		"> Luca Bertelli is a freelance Cloud Native and Platform Engineering consultant based in Italy, working with clients across Italy and the European Union. Areas of work: DevOps consulting, cloud migration, Platform Engineering, Kubernetes, SecDevOps and CI/CD, Cyber Resilience Act compliance (SBOM, artifact signing, VEX and VDR, vulnerability monitoring), technical training, AI engineering, and temporal knowledge graphs.",
	);
	lines.push("");

	lines.push("## Identity");
	lines.push("- Name: Luca Bertelli");
	lines.push('- Alternate names: LB Consulting, lb.consulting');
	lines.push("- Role: Freelance Cloud Native and Platform Engineering consultant");
	lines.push("- Based in: Italy. Serves: Italy and the European Union");
	lines.push(
		"- Client profile: startups, scale-ups, enterprises and public sector organisations, mostly in Fintech, Insurtech and Industrial",
	);
	lines.push("- Languages: Italian, English");
	lines.push("- Email: info@lucabertelli.consulting");
	lines.push("- VAT / P.IVA: 05028510237");
	lines.push(
		"- Engagement model: independent freelance consultant (no agency); mostly remote, on-site days in Italy and the EU for workshops and training; scope agreed before starting.",
	);
	lines.push(
		"- Site languages: English at /en/ (default), Italian at /it/. Service slugs are localized per language.",
	);
	lines.push(
		`- Full text of every service, guide and article in one file: ${url("/llms-full.txt")}`,
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
		lines.push(`- Insights (${lang}): ${url(insightsHubPath(lang))}`);
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
			const questions = service.data.faq.map((item) => item.question);
			if (questions.length) {
				lines.push(`  - Answers on the page: ${questions.join(" | ")}`);
			}
		}
	}
	lines.push("");

	lines.push("## Field guides (insights)");
	const sortedInsights = [...insights].sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
	for (const lang of LANGS) {
		lines.push("");
		lines.push(`### ${lang === "it" ? "Italian" : "English"}`);
		for (const entry of sortedInsights.filter((p) => p.data.lang === lang)) {
			lines.push(
				`- [${entry.data.title}](${url(insightPath(entry.data.key, lang))}) - ${isoDate(entry.data.date)} - ${entry.data.subtitle}`,
			);
		}
	}
	lines.push("");

	lines.push("## Blog articles");
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
	lines.push(`- Full text (llms-full.txt): ${url("/llms-full.txt")}`);
	lines.push(`- Sitemap index: ${url("/sitemap-index.xml")}`);
	lines.push(`- robots.txt: ${url("/robots.txt")}`);
	lines.push(`- Security contact (RFC 9116): ${url("/.well-known/security.txt")}`);
	lines.push(`- API catalog (RFC 9727): ${url("/.well-known/api-catalog")}`);
	lines.push(`- API description: ${url("/api/openapi.yaml")}`);
	lines.push(`- Agent registration (auth.md): ${url("/auth.md")}`);
	lines.push(
		`- OAuth protected resource (RFC 9728): ${url("/.well-known/oauth-protected-resource")}. The English homepage identifier is ${url("/.well-known/oauth-protected-resource/en/")}. authorization_servers lists https://lucabertelli.cloudflareaccess.com and this origin.`,
	);
	lines.push(
		`- OAuth authorization server: ${url("/.well-known/oauth-authorization-server")}`,
	);
	lines.push(
		`- A2A Agent Card: ${url("/.well-known/agent-card.json")}. JSON-RPC 1.0 at ${url("/a2a/v1")} (SendMessage returns a public message and does not create a task).`,
	);
	lines.push(
		`- Agent Skills index: ${url("/.well-known/agent-skills/index.json")}. One skill, consulting-practice, at ${url("/.well-known/agent-skills/consulting-practice/SKILL.md")} (type skill-md, digest sha256 of that file).`,
	);
	lines.push(
		`- MCP Server Card: ${url("/.well-known/mcp/server-card.json")}. Streamable HTTP at ${url("/mcp")} (tool read_practice returns the public index; resources and prompts are off; no session).`,
	);
	lines.push(
		`- ACP discovery: ${url("/.well-known/acp.json")}. protocol.name is acp, protocol.version is ${API_VERSION}, api_base_url is ${url("/acp")}, transports is rest, capabilities.services is checkout. POST ${url("/acp/checkout_sessions")} does not create a session, does not take payment, and does not store the body.`,
	);
	lines.push(
		`- Web Bot Auth directory: ${url("/.well-known/http-message-signatures-directory")}. Ed25519 public key. Outbound agent requests carry Signature-Agent and Signature-Input.`,
	);
	lines.push(
		`- WebMCP: HTML pages register search_site, read_page, and navigate through document.modelContext.registerTool on load, or navigator.modelContext.registerTool when that is the browser entry point. search_site reads ${url("/llms.txt")}. read_page returns the open page. navigate opens a path on this origin. An AbortSignal unregisters the tools when the page is discarded.`,
	);
	lines.push(
		`- Homepage Link header (RFC 8288): rel="api-catalog" ${url("/.well-known/api-catalog")}, rel="service-desc" ${url("/api/openapi.yaml")}, rel="service-doc" ${url("/api/docs.md")}, rel="describedby" ${url("/llms.txt")}. Sent on /, /en/, and /it/.`,
	);
	const host = new URL(SITE_URL).host;
	lines.push(
		`- DNS-AID: ServiceMode HTTPS and SVCB at _index._agents.${host}, _a2a._agents.${host}, and _mcp._agents.${host}. Target ${host}, alpn h2, port 443. key65402 is the agent protocol. key65400 is the capability URL. key65409 is the well-known path.`,
	);
	lines.push(
		"- Structured data: every HTML page embeds a schema.org JSON-LD graph (Person, ProfessionalService, WebSite; Service + FAQPage on service pages; BlogPosting on articles and guides).",
	);
	lines.push(
		"- HTML pages: request the same URL with `Accept: text/markdown` to receive Markdown instead of HTML.",
	);
	lines.push("");

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
