import { defineCollection, z } from "astro:content";

const certifications = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    issueDate: z.coerce.date(),
    badgeImage: z.string().optional(),
  }),
});

export const collections = {
  certifications: certifications
};
