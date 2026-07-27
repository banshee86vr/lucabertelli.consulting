import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import * as dotenv from "dotenv";
import {
  SERVICES_SECTION_SLUG,
  SERVICE_SLUGS,
  serviceKeyFromSlug,
} from "./src/constants/services";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
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
      lastmod: new Date(),
      serialize(item) {
        const path = new URL(item.url).pathname;

        // The built-in i18n pairing matches identical path suffixes, which the
        // localized service slugs deliberately do not share.
        const serviceMatch = path.match(
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

        const hubMatch = path.match(/^\/(en|it)\/(?:services|servizi)\/?$/);
        if (hubMatch) {
          item.links = ["en", "it"].map((locale) => ({
            lang: locale,
            url: `https://lucabertelli.consulting/${locale}/${SERVICES_SECTION_SLUG[locale]}/`,
          }));
        }

        if (/^\/(en|it)\/?$/.test(path)) {
          item.priority = 1.0;
        } else if (/^\/(en|it)\/(services|servizi)\//.test(path)) {
          item.priority = 0.9;
        } else if (/^\/(en|it)\/(services|servizi)\/?$/.test(path)) {
          item.priority = 0.9;
        } else if (/^\/(en|it)\/blog\/tag\//.test(path)) {
          item.priority = 0.5;
          item.changefreq = "monthly";
        } else if (/^\/(en|it)\/blog\//.test(path)) {
          item.priority = 0.7;
        } else if (/^\/(en|it)\/(privacy|cookies)\/?$/.test(path)) {
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
