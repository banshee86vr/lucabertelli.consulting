import { defineMiddleware } from "astro:middleware";
import {
	INSIGHTS_SECTION_SLUG,
	LEGACY_INSIGHT_BLOG_SLUGS,
	insightPath,
	isInsightKey,
} from "./constants/insights";
import {
	LEGACY_SERVICE_SLUGS,
	SERVICES_SECTION_SLUG,
	servicePath,
} from "./constants/services";
import { isUiLang } from "./i18n/routes";

export const onRequest = defineMiddleware((context, next) => {
	const path = context.url.pathname;
	if (path === "/" || path === "") {
		return Response.redirect(new URL("/en/", context.url), 308);
	}
	// Contact page removed — keep old URLs working
	if (path === "/en/contact" || path === "/en/contact/") {
		return Response.redirect(new URL("/en/", context.url), 308);
	}
	if (path === "/it/contact" || path === "/it/contact/") {
		return Response.redirect(new URL("/it/", context.url), 308);
	}

	// Renamed service slugs (keep ranking and old links alive)
	const serviceMatch = path.match(
		/^\/(en|it)\/(services|servizi)\/([^/]+)\/?$/,
	);
	if (serviceMatch) {
		const [, langRaw, section, slug] = serviceMatch;
		if (isUiLang(langRaw) && section === SERVICES_SECTION_SLUG[langRaw]) {
			const key = LEGACY_SERVICE_SLUGS[langRaw][slug];
			if (key) {
				const target = `${servicePath(key, langRaw)}/`;
				const current = path.endsWith("/") ? path : `${path}/`;
				if (current !== target) {
					return Response.redirect(new URL(target, context.url), 308);
				}
			}
		}
	}

	// Commercial guides used to live under /blog/; send them to /insights|approfondimenti/
	const blogInsightMatch = path.match(/^\/(en|it)\/blog\/([^/]+)\/?$/);
	if (blogInsightMatch) {
		const [, langRaw, slug] = blogInsightMatch;
		if (
			isUiLang(langRaw) &&
			isInsightKey(slug) &&
			(LEGACY_INSIGHT_BLOG_SLUGS as readonly string[]).includes(slug)
		) {
			return Response.redirect(
				new URL(`${insightPath(slug, langRaw)}/`, context.url),
				308,
			);
		}
	}

	// Wrong-language section slug for insights (e.g. /it/insights/…)
	const insightSectionMatch = path.match(
		/^\/(en|it)\/(insights|approfondimenti)(?:\/([^/]+))?\/?$/,
	);
	if (insightSectionMatch) {
		const [, langRaw, section, slug] = insightSectionMatch;
		if (isUiLang(langRaw) && section !== INSIGHTS_SECTION_SLUG[langRaw]) {
			const hub = `/${langRaw}/${INSIGHTS_SECTION_SLUG[langRaw]}/`;
			const dest =
				slug && isInsightKey(slug) ? `${insightPath(slug, langRaw)}/` : hub;
			return Response.redirect(new URL(dest, context.url), 308);
		}
	}

	return next();
});
