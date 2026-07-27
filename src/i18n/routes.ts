import {
	SERVICES_SECTION_SLUG,
	SERVICE_SLUGS,
	serviceKeyFromSlug,
} from "../constants/services";
import type { UiLang } from "../utils/seo";

export const UI_LANGS: UiLang[] = ["en", "it"];

export function isUiLang(value: string | undefined): value is UiLang {
	return value === "en" || value === "it";
}

/** Split a pathname into its language prefix and the remaining segments. */
export function splitLocalizedPath(pathname: string): {
	lang: UiLang;
	segments: string[];
} | null {
	const segments = pathname.split("/").filter(Boolean);
	const [first, ...rest] = segments;
	if (!isUiLang(first)) return null;
	return { lang: first, segments: rest };
}

/**
 * Translate the segments that follow the language prefix into `target`.
 *
 * Only the services section uses localized slugs; every other route keeps the
 * same suffix across languages, so unknown segments pass through untouched.
 */
function translateSegments(
	segments: string[],
	source: UiLang,
	target: UiLang,
): string[] {
	const [section, ...rest] = segments;
	if (section !== SERVICES_SECTION_SLUG[source]) return segments;

	const translated = [SERVICES_SECTION_SLUG[target]];
	const [serviceSlug, ...tail] = rest;
	if (serviceSlug) {
		const key = serviceKeyFromSlug(serviceSlug, source);
		translated.push(key ? SERVICE_SLUGS[key][target] : serviceSlug);
	}
	return [...translated, ...tail];
}

/**
 * Equivalent pathname of `pathname` in `target`, honouring localized slugs.
 * Returns a path without a trailing slash; paths outside the localized tree
 * are prefixed with the target language.
 */
export function translatePathname(pathname: string, target: UiLang): string {
	const parsed = splitLocalizedPath(pathname);
	if (!parsed) {
		const suffix = pathname === "/" ? "" : pathname;
		return `/${target}${suffix}`;
	}
	const segments = translateSegments(parsed.segments, parsed.lang, target);
	return segments.length > 0
		? `/${target}/${segments.join("/")}`
		: `/${target}`;
}
