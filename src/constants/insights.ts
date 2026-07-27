import type { UiLang } from "../utils/seo";

export const INSIGHT_KEYS = [
	"kubernetes-consultant",
	"platform-vs-devops",
	"regulated-industries",
] as const;

export type InsightKey = (typeof INSIGHT_KEYS)[number];

/** URL segment for the insights hub (same in every language). */
export const INSIGHTS_SECTION_SLUG: Record<UiLang, string> = {
	en: "insights",
	it: "insights",
};

/** Previous IT section slug; middleware 308s it to `insights`. */
export const LEGACY_INSIGHTS_SECTION_SLUGS = ["approfondimenti"] as const;

export function isInsightKey(value: string): value is InsightKey {
	return (INSIGHT_KEYS as readonly string[]).includes(value);
}

export function insightsHubPath(lang: UiLang): string {
	return `/${lang}/${INSIGHTS_SECTION_SLUG[lang]}`;
}

export function insightPath(key: InsightKey, lang: UiLang): string {
	return `${insightsHubPath(lang)}/${key}`;
}

/** Old blog URLs that must 308 to the insights section. */
export const LEGACY_INSIGHT_BLOG_SLUGS: readonly InsightKey[] = INSIGHT_KEYS;
