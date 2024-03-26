import { defineConfig } from 'astro/config';
import cloudflare from "@astrojs/cloudflare";
import purgecss from "astro-purgecss";

// https://astro.build/config
export default defineConfig({
  build: {
    inlineStylesheets: 'never'
  },
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough"
  }),
  integrations: [purgecss()]
});
