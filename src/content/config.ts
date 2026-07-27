import { defineCollection } from "astro:content";
import { getCollection } from "astro:content";
import { z } from "astro/zod";
import { INSIGHT_KEYS } from "../constants/insights";
import type { InsightKey } from "../constants/insights";
import { SERVICE_KEYS } from "../constants/services";
import type { ServiceKey } from "../constants/services";
import type { UiLang } from "../utils/seo";

const certifications = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    issueDate: z.coerce.date(),
    badgeImage: z.string().optional(),
    url: z.string().optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.coerce.date(),
    /** Last substantive revision; falls back to `date` when absent. */
    updated: z.coerce.date().optional(),
    category: z.string(),
    image: z.string(),
    tags: z.array(z.string()),
    lang: z.enum(["en", "it"]),
  }),
});

const services = defineCollection({
  type: "content",
  schema: z.object({
    /** Stable identifier shared by every translation of the service. */
    key: z.enum(SERVICE_KEYS),
    lang: z.enum(["en", "it"]),
    /** H1 and card label. */
    title: z.string(),
    /** Short lead shown under the H1 and reused as meta description fallback. */
    tagline: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    order: z.number(),
    keywords: z.array(z.string()),
    /** Blog tags used to surface related articles on the page. */
    relatedTags: z.array(z.string()).default([]),
    /** Certification slugs highlighted as proof for this service. */
    credentials: z.array(z.string()).default([]),
    outcomes: z.array(z.string()).default([]),
    deliverables: z.array(z.string()).default([]),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .default([]),
  }),
});

const insights = defineCollection({
  type: "content",
  schema: z.object({
    /** Stable identifier shared by every translation of the insight. */
    key: z.enum(INSIGHT_KEYS),
    lang: z.enum(["en", "it"]),
    title: z.string(),
    subtitle: z.string(),
    seoTitle: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    image: z.string(),
    /** Service keys this guide should surface on (and link to). */
    relatedServices: z.array(z.enum(SERVICE_KEYS)).default([]),
  }),
});

export const collections = {
  certifications: certifications,
  blog: blog,
  services: services,
  insights: insights,
};

export interface BlogPost {
  data: {
    lang: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any; // Aggiungi altre proprietà se necessario
  };
  blog_slug: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any; // Aggiungi altre proprietà se necessario
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog");

  return posts.map((post) => {
    const entryId = "slug" in post ? (post as { slug: string }).slug : post.id;
    const blog_slug = entryId.split("/")[0];
    return {
      ...post,
      blog_slug,
    };
  });
}

export interface ServiceData {
  key: ServiceKey;
  lang: UiLang;
  title: string;
  tagline: string;
  seoTitle: string;
  description: string;
  order: number;
  keywords: string[];
  relatedTags: string[];
  credentials: string[];
  outcomes: string[];
  deliverables: string[];
  faq: { question: string; answer: string }[];
}

export interface ServiceEntry {
  data: ServiceData;
  // biome-ignore lint/suspicious/noExplicitAny: mirrors the BlogPost helper
  [key: string]: any;
}

/** Services of a language, ordered as they should appear in listings. */
export async function getServices(lang?: UiLang): Promise<ServiceEntry[]> {
  const entries = (await getCollection("services")) as unknown as ServiceEntry[];
  return entries
    .filter((entry) => (lang ? entry.data.lang === lang : true))
    .sort((a, b) => a.data.order - b.data.order);
}

export interface InsightData {
  key: InsightKey;
  lang: UiLang;
  title: string;
  subtitle: string;
  seoTitle: string;
  date: Date;
  updated?: Date;
  image: string;
  relatedServices: ServiceKey[];
}

export interface InsightEntry {
  data: InsightData;
  body?: string;
  // biome-ignore lint/suspicious/noExplicitAny: mirrors the BlogPost helper
  [key: string]: any;
}

/** Commercial field guides, newest first. */
export async function getInsights(lang?: UiLang): Promise<InsightEntry[]> {
  const entries = (await getCollection("insights")) as unknown as InsightEntry[];
  return entries
    .filter((entry) => (lang ? entry.data.lang === lang : true))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
