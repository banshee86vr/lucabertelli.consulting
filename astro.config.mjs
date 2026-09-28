import { defineConfig } from "astro/config";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import * as dotenv from "dotenv";
import { INSIGHTS_SECTION_SLUG } from "./src/constants/insights";
import {
  SERVICES_SECTION_SLUG,
  SERVICE_SLUGS,
  serviceKeyFromSlug,
} from "./src/constants/services";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const BUILD_DATE = new Date();
const CONTENT_DIR = fileURLToPath(new URL("./src/content/", import.meta.url));
const PAGES_DIR = fileURLToPath(new URL("./src/pages/", import.meta.url));

/** Newest of `date` / `updated` in a markdown frontmatter, or null. */
function frontmatterDate(file) {
  if (!fs.existsSync(file)) return null;
  const head = fs.readFileSync(file, "utf8").split(/^---\s*$/m)[1] ?? "";
  // Same coercion as the collection schema (`z.coerce.date()`), so free-form
  // values such as `1 April 2024` resolve the way the page itself renders them.
  const dates = [...head.matchAll(/^(?:date|updated):\s*["']?([^"'\n]+?)["']?\s*$/gm)]
    .map((m) => new Date(m[1]))
    .filter((d) => !Number.isNaN(d.valueOf()));
  return dates.length ? new Date(Math.max(...dates.map((d) => d.valueOf()))) : null;
}

const gitDateCache = new Map();
/** Last commit that touched any of the files; null when git history is unavailable. */
function gitDate(...files) {
  const existing = files.filter((f) => fs.existsSync(f));
  if (existing.length === 0) return null;
  const key = existing.join("\0");
  if (gitDateCache.has(key)) return gitDateCache.get(key);
  let result = null;
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...existing],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (out) result = new Date(out);
  } catch {
    result = null;
  }
  gitDateCache.set(key, result);
  return result;
}

function newest(...dates) {
  const valid = dates.filter((d) => d instanceof Date && !Number.isNaN(d.valueOf()));
  return valid.length ? new Date(Math.max(...valid.map((d) => d.valueOf()))) : null;
}

function collectionNewest(collection, lang) {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return null;
  return newest(
    ...fs
      .readdirSync(dir)
      .map((entry) => frontmatterDate(path.join(dir, entry, `${lang}.md`))),
  );
}

/**
 * A `lastmod` that tracks the content: frontmatter dates where they exist,
 * the last commit touching the source otherwise. Everything else falls back to
 * the build date, which is what the whole sitemap used to advertise.
 */
function lastmodFor(pathname) {
  const blog = pathname.match(/^\/(en|it)\/blog\/([^/]+)\/?$/);
  if (blog && blog[2] !== "tag") {
    return frontmatterDate(path.join(CONTENT_DIR, "blog", blog[2], `${blog[1]}.md`));
  }
  const insight = pathname.match(/^\/(en|it)\/insights\/([^/]+)\/?$/);
  if (insight) {
    return frontmatterDate(
      path.join(CONTENT_DIR, "insights", insight[2], `${insight[1]}.md`),
    );
  }
  const service = pathname.match(/^\/(en|it)\/(?:services|servizi)\/([^/]+)\/?$/);
  if (service) {
    const key = serviceKeyFromSlug(service[2], service[1]);
    return key
      ? gitDate(path.join(CONTENT_DIR, "services", key, `${service[1]}.md`))
      : null;
  }
  const listing = pathname.match(/^\/(en|it)\/(blog|insights)(?:\/tag\/[^/]+)?\/?$/);
  if (listing) return collectionNewest(listing[2], listing[1]);
  if (/^\/(en|it)\/(?:services|servizi)\/?$/.test(pathname)) {
    return gitDate(
      path.join(CONTENT_DIR, "services"),
      path.join(PAGES_DIR, "[lang]", "[servicesSection]", "index.astro"),
    );
  }
  if (/^\/(en|it)\/?$/.test(pathname)) {
    return gitDate(
      path.join(PAGES_DIR, "[lang]", "index.astro"),
      fileURLToPath(new URL("./src/i18n/ui.ts", import.meta.url)),
      path.join(CONTENT_DIR, "services"),
    );
  }
  const legal = pathname.match(/^\/(en|it)\/(privacy|cookies)\/?$/);
  if (legal) return gitDate(path.join(PAGES_DIR, "[lang]", `${legal[2]}.astro`));
  return null;
}

// https://astro.build/config
export default defineConfig({
  site: "https://lucabertelli.consulting",
  output: "server",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", it: "it" },
      },
      changefreq: "weekly",
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        item.lastmod = (lastmodFor(pathname) ?? BUILD_DATE).toISOString();

        // The built-in i18n pairing matches identical path suffixes, which the
        // localized service slugs deliberately do not share.
        const serviceMatch = pathname.match(
          /^\/(en|it)\/(?:services|servizi)\/([^/]+)\/?$/,
        );
        if (serviceMatch) {
          const [, lang, slug] = serviceMatch;
          const key = serviceKeyFromSlug(slug, lang);
          if (key) {
            item.links = ["en", "it"].map((locale) => ({
              lang: locale,
              url: `https://lucabertelli.consulting/${locale}/${SERVICES_SECTION_SLUG[locale]}/${SERVICE_SLUGS[key][locale]}/`,
            }));
          }
        }

        const hubMatch = pathname.match(/^\/(en|it)\/(?:services|servizi)\/?$/);
        if (hubMatch) {
          item.links = ["en", "it"].map((locale) => ({
            lang: locale,
            url: `https://lucabertelli.consulting/${locale}/${SERVICES_SECTION_SLUG[locale]}/`,
          }));
        }

        const insightMatch = pathname.match(
          /^\/(en|it)\/insights(?:\/([^/]+))?\/?$/,
        );
        if (insightMatch) {
          const [, , slug] = insightMatch;
          item.links = ["en", "it"].map((locale) => ({
            lang: locale,
            url: slug
              ? `https://lucabertelli.consulting/${locale}/insights/${slug}/`
              : `https://lucabertelli.consulting/${locale}/insights/`,
          }));
        }

        if (/^\/(en|it)\/?$/.test(pathname)) {
          item.priority = 1.0;
        } else if (/^\/(en|it)\/(services|servizi)\//.test(pathname)) {
          item.priority = 0.9;
        } else if (/^\/(en|it)\/(services|servizi)\/?$/.test(pathname)) {
          item.priority = 0.9;
        } else if (/^\/(en|it)\/insights\//.test(pathname)) {
          item.priority = 0.8;
        } else if (/^\/(en|it)\/insights\/?$/.test(pathname)) {
          item.priority = 0.8;
        } else if (/^\/(en|it)\/blog\/tag\//.test(pathname)) {
          item.priority = 0.5;
          item.changefreq = "monthly";
        } else if (/^\/(en|it)\/blog\//.test(pathname)) {
          item.priority = 0.7;
        } else if (/^\/(en|it)\/(privacy|cookies)\/?$/.test(pathname)) {
          item.priority = 0.2;
          item.changefreq = "yearly";
        }
        return item;
      },
    }),
  ],
  legacy: {
    collectionsBackwardsCompat: true,
  },
  adapter: cloudflare({
    imageService: { build: "compile", runtime: "passthrough" },
  }),
  platformProxy: {
    enabled: true,
  },
  vite: {
    resolve: {
      // Astro 7.3.0 injects `astro/_internal/logger` into the workerd bundle,
      // but publishConfig strips that export. Absolute path bypasses exports map.
      alias: {
        "astro/_internal/logger": fileURLToPath(
          new URL("./node_modules/astro/dist/core/logger/core.js", import.meta.url),
        ),
      },
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: false,
        },
      },
      cssCodeSplit: true,
      rollupOptions: {},
    },
    server: {
      proxy: {
        "/__eventitech_proxy": {
          target: "https://api.eventitech.it",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__eventitech_proxy/, ""),
        },
      },
    },
  },
});
