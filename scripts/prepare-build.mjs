import { readFileSync, writeFileSync } from "fs";

// Cloudflare Pages reads wrangler.toml (including pages_build_output_dir and
// NODE_VERSION) *before* executing the build command. However, the
// @cloudflare/vite-plugin used by @astrojs/cloudflare will error during
// `astro build` if it sees pages_build_output_dir, because the generated
// prerender worker config contains an ASSETS binding that is reserved in Pages
// projects. Stripping the directive here avoids the conflict while still
// letting the Pages build system honour the setting it already parsed.
const path = "wrangler.toml";
const content = readFileSync(path, "utf8");
const updated = content.replace(/^pages_build_output_dir\s*=.*$/m, "");
writeFileSync(path, updated);
