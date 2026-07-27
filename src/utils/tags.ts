/** URL-safe form of a blog tag. Tags are authored kebab-case, this guards the rest. */
export function tagSlug(tag: string): string {
	return tag
		.toLowerCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/** Human-readable form used in headings and titles ("github-actions" -> "GitHub Actions"). */
const DISPLAY_OVERRIDES: Record<string, string> = {
	cicd: "CI/CD",
	"github-actions": "GitHub Actions",
	devsecops: "DevSecOps",
	kubernetes: "Kubernetes",
	helm: "Helm",
	mcp: "MCP",
	vcluster: "vCluster",
	argo: "Argo",
	renovate: "Renovate",
	"multi-tenancy": "Multi-tenancy",
	"fleet-management": "Fleet management",
	"dependency-management": "Dependency management",
	observability: "Observability",
	drift: "Drift",
	"platform-engineering": "Platform Engineering",
	fintech: "Fintech",
	insurtech: "Insurtech",
};

export function tagLabel(tag: string): string {
	const slug = tagSlug(tag);
	if (DISPLAY_OVERRIDES[slug]) return DISPLAY_OVERRIDES[slug];
	return slug
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function tagPath(tag: string, lang: string): string {
	return `/${lang}/blog/tag/${tagSlug(tag)}`;
}
