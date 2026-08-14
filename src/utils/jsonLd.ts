import { SITE_URL } from "../constants/site";
import { absoluteUrl } from "./seo";
import type { UiLang } from "./seo";

const PERSON_ID = `${SITE_URL}/#person`;
const SERVICE_ID = `${SITE_URL}/#professional-service`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const SCHEMA_IDS = {
	person: PERSON_ID,
	professionalService: SERVICE_ID,
	website: WEBSITE_ID,
};

const SAME_AS = [
	"https://www.linkedin.com/in/luca-bertelli-a1413b77",
	"https://github.com/banshee86vr",
	"https://medium.com/@bertelli.luca",
	"https://www.credly.com/users/luca-bertelli",
];

const KNOWS_ABOUT = [
	"DevOps",
	"Platform Engineering",
	"Kubernetes",
	"Cloud Migration",
	"SecDevOps",
	"Cloud Native",
	"Terraform",
	"Infrastructure as Code",
	"CI/CD",
	"GitOps",
	"AI Engineering",
	"Knowledge Graphs",
	"Model Context Protocol",
];

/**
 * Nodes present on every page: the person, the practice, and the site itself.
 * `serviceCatalog` lets the home page advertise the full offer without the
 * other pages repeating it.
 */
export function buildPersonAndProfessionalService(
	lang: UiLang,
	serviceCatalog: { name: string; url: string }[] = [],
): Record<string, unknown>[] {
	const description =
		lang === "it"
			? "Consulenza e ingegneria Cloud Native: consulente DevOps, Platform Engineering, Kubernetes, SecDevOps e formazione."
			: "Cloud Native consulting and engineering: DevOps consultant, Platform Engineering, Kubernetes, SecDevOps, and training.";

	const professionalService: Record<string, unknown> = {
		"@type": "ProfessionalService",
		"@id": SERVICE_ID,
		name: "Luca Bertelli Consulting",
		alternateName: ["LB Consulting", "lb.consulting"],
		url: SITE_URL,
		description,
		email: "info@lucabertelli.consulting",
		image: absoluteUrl("/about/lucabertelli.jpeg"),
		logo: absoluteUrl("/logo.png"),
		vatID: "IT05028510237",
		priceRange: "$$$",
		knowsLanguage: ["it", "en"],
		address: {
			"@type": "PostalAddress",
			addressCountry: "IT",
		},
		areaServed: [
			{ "@type": "Country", name: "Italy" },
			{ "@type": "Place", name: "European Union" },
		],
		serviceType: KNOWS_ABOUT,
		founder: { "@id": PERSON_ID },
		provider: { "@id": PERSON_ID },
		sameAs: SAME_AS,
	};

	if (serviceCatalog.length > 0) {
		professionalService.hasOfferCatalog = {
			"@type": "OfferCatalog",
			name: lang === "it" ? "Servizi di consulenza" : "Consulting services",
			itemListElement: serviceCatalog.map((service) => ({
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: service.name,
					url: service.url,
				},
			})),
		};
	}

	return [
		{
			"@type": "Person",
			"@id": PERSON_ID,
			name: "Luca Bertelli",
			alternateName: ["LB Consulting", "lb.consulting"],
			url: SITE_URL,
			jobTitle:
				lang === "it"
					? "Consulente DevOps e Cloud Native"
					: "DevOps and Cloud Native Consultant",
			description:
				lang === "it"
					? "Consulente freelance specializzato in DevOps, Platform Engineering e Kubernetes, con esperienza nei settori Fintech, Insurtech e industriale."
					: "Freelance consultant specialised in DevOps, Platform Engineering and Kubernetes, with experience across Fintech, Insurtech and industrial sectors.",
			email: "info@lucabertelli.consulting",
			image: absoluteUrl("/about/lucabertelli.jpeg"),
			nationality: { "@type": "Country", name: "Italy" },
			sameAs: SAME_AS,
			knowsAbout: KNOWS_ABOUT,
			knowsLanguage: ["it", "en"],
			worksFor: { "@id": SERVICE_ID },
		},
		professionalService,
		{
			"@type": "WebSite",
			"@id": WEBSITE_ID,
			url: SITE_URL,
			name: "Luca Bertelli Consulting",
			inLanguage: lang === "it" ? "it-IT" : "en-US",
			publisher: { "@id": SERVICE_ID },
		},
	];
}

export type Certification = {
	title: string;
	url?: string;
	issueDate: Date;
};

export function buildCertificationCredentials(
	certifications: Certification[],
): Record<string, unknown>[] {
	return certifications.map((cert, index) => {
		const id = `${SITE_URL}/#credential-${index + 1}`;
		const lowerTitle = cert.title.toLowerCase();
		const issuer = lowerTitle.includes("kubernetes") || lowerTitle.includes("cka")
			? "CNCF"
			: lowerTitle.includes("hashicorp") || lowerTitle.includes("vault")
				? "HashiCorp"
				: lowerTitle.includes("terraform")
					? "HashiCorp"
					: lowerTitle.includes("gitlab")
						? "GitLab"
						: lowerTitle.includes("kong")
							? "Kong Inc."
							: lowerTitle.includes("vmware")
								? "VMware"
								: "Certification Body";
		return {
			"@type": "EducationalOccupationalCredential",
			"@id": id,
			name: cert.title,
			url: cert.url,
			dateCreated: cert.issueDate.toISOString(),
			recognizedBy: {
				"@type": "Organization",
				name: issuer,
			},
			credentialCategory: "Professional Certification",
			about: { "@id": PERSON_ID },
		};
	});
}

export type ServiceOffer = {
	name: string;
	description: string;
	url?: string;
};

export function buildServiceOffers(
	services: ServiceOffer[],
	lang: UiLang,
): Record<string, unknown>[] {
	return services.map((s, index) => ({
		"@type": "Service",
		"@id": s.url ? `${s.url}#service` : `${SITE_URL}/#service-${index + 1}`,
		name: s.name,
		description: s.description,
		url: s.url,
		provider: { "@id": PERSON_ID },
		serviceType: s.name,
		areaServed: lang === "it" ? "IT" : "EU",
	}));
}

/**
 * Full `Service` node for a dedicated service page, including the deliverables
 * as an offer catalog.
 */
export function buildServicePage(params: {
	name: string;
	description: string;
	url: string;
	lang: UiLang;
	serviceType: string[];
	deliverables: string[];
}): Record<string, unknown> {
	const node: Record<string, unknown> = {
		"@type": "Service",
		"@id": `${params.url}#service`,
		name: params.name,
		description: params.description,
		url: params.url,
		serviceType: params.serviceType,
		provider: { "@id": PERSON_ID },
		brand: { "@id": SERVICE_ID },
		areaServed: [
			{ "@type": "Country", name: "Italy" },
			{ "@type": "Place", name: "European Union" },
		],
		availableLanguage: ["it", "en"],
		audience: {
			"@type": "BusinessAudience",
			name: params.lang === "it" ? "Aziende e team tecnici" : "Companies and engineering teams",
		},
	};

	if (params.deliverables.length > 0) {
		node.hasOfferCatalog = {
			"@type": "OfferCatalog",
			name: params.name,
			itemListElement: params.deliverables.map((item) => ({
				"@type": "Offer",
				itemOffered: { "@type": "Service", name: item },
			})),
		};
	}

	return node;
}

export function buildFaqPage(
	faq: { question: string; answer: string }[],
	pageUrl: string,
): Record<string, unknown>[] {
	if (faq.length === 0) return [];
	return [
		{
			"@type": "FAQPage",
			"@id": `${pageUrl}#faq`,
			mainEntity: faq.map((item) => ({
				"@type": "Question",
				name: item.question,
				acceptedAnswer: {
					"@type": "Answer",
					text: item.answer,
				},
			})),
		},
	];
}

export function buildBreadcrumbs(
	items: { name: string; url: string }[],
): Record<string, unknown>[] {
	if (items.length < 2) return [];
	return [
		{
			"@type": "BreadcrumbList",
			"@id": `${items[items.length - 1].url}#breadcrumb`,
			itemListElement: items.map((item, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: item.name,
				item: item.url,
			})),
		},
	];
}

/** `CollectionPage` node for listings such as the services hub or a blog tag. */
export function buildCollectionPage(params: {
	name: string;
	description: string;
	url: string;
	lang: UiLang;
	items: { name: string; url: string }[];
}): Record<string, unknown> {
	return {
		"@type": "CollectionPage",
		"@id": `${params.url}#collection`,
		name: params.name,
		description: params.description,
		url: params.url,
		inLanguage: params.lang === "it" ? "it-IT" : "en-US",
		isPartOf: { "@id": WEBSITE_ID },
		mainEntity: {
			"@type": "ItemList",
			itemListElement: params.items.map((item, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: item.name,
				url: item.url,
			})),
		},
	};
}

export function buildBlogPosting(params: {
	headline: string;
	description: string;
	datePublished: Date;
	dateModified?: Date;
	image: string;
	url: string;
	inLanguage: UiLang;
	keywords: string[];
	articleSection?: string;
	wordCount?: number;
}): Record<string, unknown> {
	const imageUrl = absoluteUrl(params.image);
	const node: Record<string, unknown> = {
		"@type": "BlogPosting",
		"@id": `${params.url}#article`,
		headline: params.headline,
		description: params.description,
		datePublished: params.datePublished.toISOString(),
		dateModified: (params.dateModified ?? params.datePublished).toISOString(),
		image: imageUrl,
		url: params.url,
		mainEntityOfPage: { "@type": "WebPage", "@id": params.url },
		inLanguage: params.inLanguage === "it" ? "it-IT" : "en-US",
		isPartOf: { "@id": WEBSITE_ID },
		author: { "@id": PERSON_ID },
		publisher: { "@id": SERVICE_ID },
		keywords: params.keywords.join(", "),
	};
	if (params.articleSection) node.articleSection = params.articleSection;
	if (params.wordCount) node.wordCount = params.wordCount;
	return node;
}

/** `Blog` node for the blog index. */
export function buildBlog(params: {
	name: string;
	description: string;
	url: string;
	lang: UiLang;
	posts: { name: string; url: string }[];
}): Record<string, unknown> {
	return {
		"@type": "Blog",
		"@id": `${params.url}#blog`,
		name: params.name,
		description: params.description,
		url: params.url,
		inLanguage: params.lang === "it" ? "it-IT" : "en-US",
		isPartOf: { "@id": WEBSITE_ID },
		publisher: { "@id": SERVICE_ID },
		blogPost: params.posts.map((post) => ({
			"@type": "BlogPosting",
			headline: post.name,
			url: post.url,
		})),
	};
}
