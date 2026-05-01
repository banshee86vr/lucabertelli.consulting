import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
	const path = context.url.pathname;
	if (path === "/" || path === "") {
		return Response.redirect(new URL("/en/", context.url), 308);
	}
	return next();
});
