import { defineCollection, z } from "astro:content";
import { getCollection } from "astro:content";

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
    category: z.string(),
    image: z.string(),
    tags: z.array(z.string()),
    lang: z.enum(['en', 'it']),
  }),
});

export const collections = {
  certifications: certifications,
  blog: blog
};

export async function getBlogPosts() {
	const posts = await getCollection('blog');

	return posts.map((post) => {
		const blog_slug = post.slug.split('/')[0];
		return {
			...post,
			blog_slug
		}
	})
}
