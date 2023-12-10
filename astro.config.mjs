import { defineConfig } from 'astro/config';
import cloudflare from "@astrojs/cloudflare";
import purgecss from "astro-purgecss";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [purgecss()]
});
