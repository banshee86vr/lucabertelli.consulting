import { SITE_URL } from "../constants/site";

export type UiLang = "en" | "it";

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
 * hreflang alternates for /en/* and /it/* routes (same path suffix).
 */
export function alternatesForPathname(pathname: string): {
	en: string;
	it: string;
	xDefault: string;
} | null {
	const normalized = pathname.endsWith("/") && pathname.length > 1
		? pathname.slice(0, -1)
		: pathname;
	const segments = normalized.split("/").filter(Boolean);
	const first = segments[0];
	if (first !== "en" && first !== "it") return null;
	const rest = segments.slice(1).join("/");
	const suffix = rest ? `/${rest}` : "";
	return {
		en: `${SITE_URL}/en${suffix}`,
		it: `${SITE_URL}/it${suffix}`,
		xDefault: `${SITE_URL}/en${suffix}`,
	};
}
