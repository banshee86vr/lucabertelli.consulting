import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

// Cloudflare Pages reads wrangler.toml (including pages_build_output_dir and
// NODE_VERSION) *before* executing the build command. However, the
// @cloudflare/vite-plugin used by @astrojs/cloudflare errors during
// `astro build` if it sees pages_build_output_dir, because the generated
// prerender worker config contains an ASSETS binding reserved in Pages projects.
//
// This wrapper strips pages_build_output_dir before running astro, then always
// restores the original file so it remains correct in the working tree.

const configPath = "wrangler.toml";
const original = readFileSync(configPath, "utf8");
const patched = original.replace(/^pages_build_output_dir\s*=.*\n?/m, "");

try {
  writeFileSync(configPath, patched);
  execSync("npx astro check && npx astro build", { stdio: "inherit" });
} finally {
  writeFileSync(configPath, original);
}
