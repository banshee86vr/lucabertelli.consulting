import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getBlogPosts, getInsights } from "../../content/config";
import { insightPath } from "../../constants/insights";
import { SITE_URL } from "../../constants/site";
import type { UiLang } from "../../utils/seo";

export const prerender = true;

export function getStaticPaths() {
	return [{ params: { lang: "en" } }, { params: { lang: "it" } }];
}

const FEED_META: Record<
	UiLang,
	{ title: string; description: string; insightsCategory: string }
> = {
	en: {
		title: "Luca Bertelli | Cloud Native and Platform Engineering",
		description:
			"Engineering articles and field guides on Kubernetes, CI/CD, platform engineering, software supply chain security and the Cyber Resilience Act by Luca Bertelli, freelance Cloud Native and Platform Engineering consultant.",
		insightsCategory: "Field guide",
	},
	it: {
		title: "Luca Bertelli | Cloud Native e Platform Engineering",
		description:
			"Articoli tecnici e guide su Kubernetes, CI/CD, platform engineering, sicurezza della supply chain software e Cyber Resilience Act di Luca Bertelli, consulente Cloud Native e Platform Engineering freelance.",
		insightsCategory: "Guida",
	},
};

export async function GET(context: APIContext) {
	const lang = (context.params.lang === "it" ? "it" : "en") as UiLang;
	const meta = FEED_META[lang];

	const posts = (await getBlogPosts())
		.filter((post) => post.data.lang === lang)
		.map((post) => ({
			title: post.data.title as string,
			description: post.data.subtitle as string,
			pubDate: post.data.date as Date,
			link: `/${lang}/blog/${post.blog_slug}`,
			categories: post.data.tags as string[],
		}));

	const insights = (await getInsights(lang)).map((entry) => ({
		title: entry.data.title,
		description: entry.data.subtitle,
		pubDate: entry.data.date,
		link: insightPath(entry.data.key, lang),
		categories: [meta.insightsCategory],
	}));

	const items = [...posts, ...insights].sort(
		(a, b) => b.pubDate.valueOf() - a.pubDate.valueOf(),
	);

	return rss({
		title: meta.title,
		description: meta.description,
		site: SITE_URL,
		trailingSlash: false,
		xmlns: { atom: "http://www.w3.org/2005/Atom" },
		customData: `<language>${lang === "it" ? "it-IT" : "en-US"}</language><atom:link href="${SITE_URL}/${lang}/rss.xml" rel="self" type="application/rss+xml"/>`,
		items,
	});
}
