import { defineMiddleware } from "astro:middleware";

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
	return next();
});
