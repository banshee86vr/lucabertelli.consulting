import { SITE_URL } from "../constants/site";
import { absoluteUrl } from "./seo";
import type { UiLang } from "./seo";

const PERSON_ID = `${SITE_URL}/#person`;
const SERVICE_ID = `${SITE_URL}/#professional-service`;

export function buildPersonAndProfessionalService(lang: UiLang): Record<string, unknown>[] {
	const description =
		lang === "it"
			? "Consulenza e ingegneria Cloud Native: Platform Engineering, Kubernetes, SecDevOps e formazione."
			: "Cloud Native consulting and engineering: Platform Engineering, Kubernetes, SecDevOps, and training.";

	return [
		{
			"@type": "Person",
			"@id": PERSON_ID,
			name: "Luca Bertelli",
			alternateName: ["LB Consulting", "lb.consulting"],
			url: SITE_URL,
			jobTitle: "Cloud Native Consultant & Engineer",
			email: "info@lucabertelli.consulting",
			image: absoluteUrl("/about/lucabertelli.jpeg"),
			sameAs: [
				"https://www.linkedin.com/in/luca-bertelli-a1413b77",
				"https://github.com/banshee86vr",
				"https://medium.com/@bertelli.luca",
				"https://www.credly.com/users/luca-bertelli",
			],
			knowsAbout: [
				"Kubernetes",
				"Platform Engineering",
				"DevOps",
				"SecDevOps",
				"Cloud Native",
				"Terraform",
				"CI/CD",
			],
			worksFor: { "@id": SERVICE_ID },
		},
		{
			"@type": "ProfessionalService",
			"@id": SERVICE_ID,
			name: "Luca Bertelli Consulting",
			alternateName: ["LB Consulting", "lb.consulting"],
			url: SITE_URL,
			description,
			areaServed: {
				"@type": "Place",
				name: lang === "it" ? "Italia / UE" : "Italy / EU",
			},
			provider: { "@id": PERSON_ID },
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
};

export function buildServiceOffers(
	services: ServiceOffer[],
	lang: UiLang,
): Record<string, unknown>[] {
	return services.map((s, index) => ({
		"@type": "Service",
		"@id": `${SITE_URL}/#service-${index + 1}`,
		name: s.name,
		description: s.description,
		provider: { "@id": PERSON_ID },
		serviceType: s.name,
		areaServed: lang === "it" ? "IT" : "EU",
	}));
}

export function buildBlogPosting(params: {
	headline: string;
	description: string;
	datePublished: Date;
	image: string;
	url: string;
	inLanguage: UiLang;
	keywords: string[];
}): Record<string, unknown> {
	const imageUrl = absoluteUrl(params.image);
	return {
		"@type": "BlogPosting",
		headline: params.headline,
		description: params.description,
		datePublished: params.datePublished.toISOString(),
		image: imageUrl,
		url: params.url,
		mainEntityOfPage: { "@type": "WebPage", "@id": params.url },
		inLanguage: params.inLanguage === "it" ? "it-IT" : "en-US",
		author: { "@id": PERSON_ID },
		publisher: { "@id": SERVICE_ID },
		keywords: params.keywords.join(", "),
	};
}
