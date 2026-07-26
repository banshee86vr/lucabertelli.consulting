import type { ServiceIconName } from "../types/service-icons";
import type { UiLang } from "../utils/seo";

export const SERVICE_KEYS = [
	"devops",
	"cloud",
	"platform-engineering",
	"kubernetes",
	"secdevops",
	"training",
	"ai-engineering",
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

/** URL segment of the services hub, localized per language. */
export const SERVICES_SECTION_SLUG: Record<UiLang, string> = {
	en: "services",
	it: "servizi",
};

/**
 * Localized slugs are intentionally different per language: Italian queries
 * ("consulenza devops") carry the keyword in the URL path.
 */
export const SERVICE_SLUGS: Record<ServiceKey, Record<UiLang, string>> = {
	devops: {
		en: "devops-consulting",
		it: "consulenza-devops",
	},
	cloud: {
		en: "cloud-migration-consulting",
		it: "consulenza-cloud-migrazione",
	},
	"platform-engineering": {
		en: "platform-engineering-consulting",
		it: "consulenza-platform-engineering",
	},
	kubernetes: {
		en: "kubernetes-consulting",
		it: "consulenza-kubernetes",
	},
	secdevops: {
		en: "secdevops-cicd-consulting",
		it: "consulenza-secdevops-cicd",
	},
	training: {
		en: "devops-cloud-native-training",
		it: "formazione-devops-cloud-native",
	},
	"ai-engineering": {
		en: "ai-agent-governance",
		it: "consulenza-agenti-ai",
	},
};

/**
 * Previous public slugs that must keep resolving. Map language → old slug →
 * service key; middleware 308s to the current `SERVICE_SLUGS` entry.
 */
export const LEGACY_SERVICE_SLUGS: Record<UiLang, Record<string, ServiceKey>> =
	{
		en: {
			"platform-engineering": "platform-engineering",
			"secdevops-cicd": "secdevops",
			"ai-engineering": "ai-engineering",
		},
		it: {
			"platform-engineering": "platform-engineering",
			"secdevops-cicd": "secdevops",
			"ai-engineering": "ai-engineering",
		},
	};

export const SERVICE_ICONS: Record<ServiceKey, ServiceIconName> = {
	devops: "infinity",
	cloud: "cloud-upload",
	"platform-engineering": "layers",
	kubernetes: "boxes",
	secdevops: "shield-check",
	training: "graduation-cap",
	"ai-engineering": "bot",
};

export function isServiceKey(value: string): value is ServiceKey {
	return (SERVICE_KEYS as readonly string[]).includes(value);
}

/** Absolute path of the services hub for a language. */
export function servicesHubPath(lang: UiLang): string {
	return `/${lang}/${SERVICES_SECTION_SLUG[lang]}`;
}

/** Absolute path of a single service page for a language. */
export function servicePath(key: ServiceKey, lang: UiLang): string {
	return `${servicesHubPath(lang)}/${SERVICE_SLUGS[key][lang]}`;
}

/** Reverse lookup used to translate a service URL into its counterpart. */
export function serviceKeyFromSlug(
	slug: string,
	lang: UiLang,
): ServiceKey | null {
	for (const key of SERVICE_KEYS) {
		if (SERVICE_SLUGS[key][lang] === slug) return key;
	}
	return null;
}
