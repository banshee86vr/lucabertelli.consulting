import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getBlogPosts } from "../../content/config";
import { SITE_URL } from "../../constants/site";
import type { UiLang } from "../../utils/seo";

export const prerender = true;

export function getStaticPaths() {
	return [{ params: { lang: "en" } }, { params: { lang: "it" } }];
}

const FEED_META: Record<UiLang, { title: string; description: string }> = {
	en: {
		title: "Luca Bertelli | DevOps and Cloud Native",
		description:
			"Articles on Kubernetes, CI/CD, platform engineering and cloud-native operations by Luca Bertelli, freelance DevOps consultant.",
	},
	it: {
		title: "Luca Bertelli | DevOps e Cloud Native",
		description:
			"Articoli su Kubernetes, CI/CD, platform engineering e operatività cloud-native di Luca Bertelli, consulente DevOps freelance.",
	},
};

export async function GET(context: APIContext) {
	const lang = (context.params.lang === "it" ? "it" : "en") as UiLang;
	const meta = FEED_META[lang];

	const posts = (await getBlogPosts())
		.filter((post) => post.data.lang === lang)
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

	return rss({
		title: meta.title,
		description: meta.description,
		site: SITE_URL,
		trailingSlash: false,
		xmlns: { atom: "http://www.w3.org/2005/Atom" },
		customData: `<language>${lang === "it" ? "it-IT" : "en-US"}</language><atom:link href="${SITE_URL}/${lang}/rss.xml" rel="self" type="application/rss+xml"/>`,
		items: posts.map((post) => ({
			title: post.data.title as string,
			description: post.data.subtitle as string,
			pubDate: post.data.date as Date,
			link: `/${lang}/blog/${post.blog_slug}`,
			categories: post.data.tags as string[],
		})),
	});
}
