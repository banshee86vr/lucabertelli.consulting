import { defineMiddleware } from "astro:middleware";
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

	return next();
});
