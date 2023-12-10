import { defineConfig } from 'astro/config';
import cloudflare from "@astrojs/cloudflare";
import purgecss from "astro-purgecss";

import sentry from "@sentry/astro";
import spotlightjs from "@spotlightjs/astro";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [purgecss(), sentry(), spotlightjs()]
});