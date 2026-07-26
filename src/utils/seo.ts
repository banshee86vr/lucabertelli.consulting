import { translatePathname } from "../i18n/routes";
import { SITE_URL } from "../constants/site";

export type UiLang = "en" | "it";

/** Strip a trailing slash so canonical and alternate URLs stay consistent. */
export function normalizePathname(pathname: string): string {
	return pathname.endsWith("/") && pathname.length > 1
		? pathname.slice(0, -1)
		: pathname;
}

/** Build absolute URL for paths or pass through absolute URLs. */
export function absoluteUrl(pathOrUrl: string): string {
	if (!pathOrUrl) return SITE_URL;
	if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
		return pathOrUrl;
	}
	const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
	return `${SITE_URL}${path}`;
}

/**
 * hreflang alternates for /en/* and /it/* routes. Slugs that differ between
 * languages (the services tree) are resolved through the route translation map.
 */
export function alternatesForPathname(pathname: string): {
	en: string;
	it: string;
	xDefault: string;
} | null {
	const normalized = normalizePathname(pathname);
	const first = normalized.split("/").filter(Boolean)[0];
	if (first !== "en" && first !== "it") return null;
	const en = absoluteUrl(translatePathname(normalized, "en"));
	const it = absoluteUrl(translatePathname(normalized, "it"));
	return { en, it, xDefault: en };
}
