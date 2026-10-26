#!/usr/bin/env node
/**
 * Check the built site for the SEO regressions that are easy to introduce and
 * hard to notice: broken internal links, unparseable JSON-LD, non-reciprocal
 * hreflang, missing canonicals, heading problems and sitemap drift.
 *
 * Usage:
 *   pnpm run build && node scripts/verify-seo.mjs
 *
 * Optional: pass a different build directory as the first argument.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] ?? "dist/client";

if (!fs.existsSync(ROOT)) {
  console.error(`No build found at ${ROOT}. Run "pnpm run build" first.`);
  process.exit(1);
}

/** Non-HTML routes that pages are allowed to link to. */
const NON_HTML_ROUTES = new Set([
  "/llms.txt",
  "/llms-full.txt",
  "/robots.txt",
  "/en/rss.xml",
  "/it/rss.xml",
  "/sitemap-index.xml",
  "/.well-known/api-catalog",
  "/.well-known/security.txt",
  "/api/openapi.yaml",
  "/api/docs.md",
  "/api/status.json",
  "/auth.md",
  "/.well-known/oauth-protected-resource",
  "/.well-known/oauth-authorization-server",
  "/.well-known/agent-card.json",
  "/.well-known/agent-skills/index.json",
  "/.well-known/agent-skills/consulting-practice/SKILL.md",
  "/.well-known/mcp/server-card.json",
  "/.well-known/http-message-signatures-directory",
  "/mcp",
  "/a2a/v1",
  "/agent/auth/register",
  "/agent/auth/claim",
  "/agent/auth/revoke",
]);

/** Prefixes served as static assets rather than routes. */
const ASSET_PREFIXES = ["/_astro", "/styles", "/scripts", "/fonts"];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function routeOf(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  return `/${rel.replace(/(^|\/)index\.html$/, "")}`.replace(/\/$/, "") || "/";
}

const failures = [];
const fail = (message) => failures.push(message);

const files = walk(ROOT);
if (files.length === 0) {
  console.error(`No HTML pages under ${ROOT}.`);
  process.exit(1);
}

const routes = new Set(files.map(routeOf));
const alternates = new Map();
const titles = new Map();

for (const file of files) {
  const route = routeOf(file);
  const html = fs.readFileSync(file, "utf8");

  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = match[1].replace(/\/$/, "") || "/";
    if (href === "/" || ASSET_PREFIXES.some((p) => href.startsWith(p))) continue;
    if (routes.has(href) || NON_HTML_ROUTES.has(href)) continue;
    if (fs.existsSync(path.join(ROOT, href))) continue;
    fail(`${route}: broken internal link to ${href}`);
  }

  const script = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  if (!script) {
    fail(`${route}: no JSON-LD block`);
  } else {
    try {
      const graph = JSON.parse(script[1])["@graph"];
      if (!Array.isArray(graph) || graph.length === 0) {
        fail(`${route}: empty JSON-LD @graph`);
      }
    } catch (error) {
      fail(`${route}: JSON-LD does not parse (${error.message})`);
    }
  }

  const headings = [...html.matchAll(/<h1[\s>]/g)].length;
  if (headings === 0) fail(`${route}: no <h1>`);
  if (headings > 1) fail(`${route}: ${headings} <h1> elements, expected 1`);

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!canonical) {
    fail(`${route}: no canonical link`);
  } else {
    alternates.set(
      canonical[1],
      Object.fromEntries(
        [...html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [
          m[1],
          m[2],
        ]),
      ),
    );
  }

  const title = html.match(/<title>([^<]*)<\/title>/);
  if (!title || title[1].trim() === "") fail(`${route}: empty <title>`);
  else titles.set(title[1], [...(titles.get(title[1]) ?? []), route]);
}

// Every alternate must point at a page that declares the same alternate set,
// otherwise search engines drop the pairing entirely.
for (const [canonical, langs] of alternates) {
  for (const lang of ["en", "it"]) {
    const target = langs[lang];
    if (!target) {
      fail(`${canonical}: missing hreflang="${lang}"`);
      continue;
    }
    const reverse = alternates.get(target);
    if (!reverse) {
      fail(`${canonical}: hreflang="${lang}" points at ${target}, which is not a canonical page`);
    } else if (reverse.en !== langs.en || reverse.it !== langs.it) {
      fail(`${canonical}: hreflang is not reciprocal with ${target}`);
    }
  }
}

for (const [title, pages] of titles) {
  if (pages.length > 1) {
    fail(`duplicate <title> "${title}" on ${pages.join(", ")}`);
  }
}

const sitemapPath = path.join(ROOT, "sitemap-0.xml");
if (!fs.existsSync(sitemapPath)) {
  fail("sitemap-0.xml is missing from the build");
} else {
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const locs = new Set(
    [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) =>
      m[1].replace(/\/$/, "") || "/",
    ),
  );
  const origin = [...locs][0]?.match(/^https?:\/\/[^/]+/)?.[0] ?? "";
  for (const route of routes) {
    if (!locs.has(`${origin}${route}`)) fail(`${route}: missing from the sitemap`);
  }
  for (const loc of locs) {
    const route = loc.replace(origin, "") || "/";
    if (!routes.has(route)) fail(`sitemap lists ${loc}, which has no page`);
  }

  // A lastmod that is the same for every URL is what search engines learn to
  // ignore; the config derives it from content dates, so it must vary.
  const lastmods = [...xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((m) => m[1]);
  if (lastmods.length !== locs.size) {
    fail(`sitemap has ${locs.size} URLs but ${lastmods.length} lastmod values`);
  }
  for (const value of lastmods) {
    if (Number.isNaN(Date.parse(value))) fail(`sitemap lastmod "${value}" is not a date`);
  }
  if (new Set(lastmods.map((v) => v.slice(0, 10))).size < 2 && locs.size > 1) {
    fail("every sitemap lastmod falls on the same day; content dates are not being read");
  }
}

for (const file of ["llms.txt", "llms-full.txt", "robots.txt"]) {
  if (!fs.existsSync(path.join(ROOT, file))) fail(`${file} is missing from the build`);
}

// A named user-agent group does not inherit rules from `User-agent: *`, so
// every group must carry the same Content-Signal preference.
const robotsPath = path.join(ROOT, "robots.txt");
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, "utf8");
  const groups = robots.split(/\n(?=User-agent:)/).filter((block) => /^User-agent:/m.test(block));
  if (groups.length === 0) fail("robots.txt has no User-agent groups");
  const required = ["ai-train=yes", "search=yes", "ai-input=yes"];
  for (const group of groups) {
    const agent = group.match(/^User-agent:\s*(\S+)/m)?.[1] ?? "(unknown)";
    const signal = group.match(/^Content-Signal:\s*(.+)$/m)?.[1] ?? "";
    const tokens = new Set(
      signal
        .split(",")
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean),
    );
    for (const token of required) {
      if (!tokens.has(token)) {
        fail(`robots.txt ${agent} group is missing Content-Signal ${token}`);
      }
    }
  }
}

// RFC 9727: the well-known catalog is a linkset, and every link it publishes
// has to be a file the build actually ships.
const catalogPath = path.join(ROOT, ".well-known", "api-catalog");
if (!fs.existsSync(catalogPath)) {
  fail(".well-known/api-catalog is missing from the build");
} else {
  let catalog;
  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  } catch (error) {
    fail(`.well-known/api-catalog is not JSON (${error.message})`);
  }
  const entries = catalog?.linkset;
  if (!catalog) {
    // parse failure already reported
  } else if (!Array.isArray(entries) || entries.length === 0) {
    fail(".well-known/api-catalog has no linkset entries");
  } else {
    for (const [index, entry] of entries.entries()) {
      if (typeof entry.anchor !== "string" || entry.anchor === "") {
        fail(`.well-known/api-catalog linkset[${index}] has no anchor`);
      }
      for (const rel of ["service-desc", "service-doc", "status"]) {
        const links = entry[rel];
        if (!Array.isArray(links) || links.length === 0) {
          fail(`.well-known/api-catalog linkset[${index}] has no ${rel}`);
          continue;
        }
        for (const link of links) {
          let pathname = "";
          try {
            pathname = new URL(link.href).pathname;
          } catch {
            fail(`.well-known/api-catalog ${rel} href is not a URL`);
            continue;
          }
          if (!fs.existsSync(path.join(ROOT, pathname.replace(/^\//, "")))) {
            fail(`.well-known/api-catalog ${rel} points at ${pathname}, which is not in the build`);
          }
        }
      }
      if (Array.isArray(entry.describedby)) {
        for (const link of entry.describedby) {
          let pathname = "";
          try {
            pathname = new URL(link.href).pathname;
          } catch {
            fail(`.well-known/api-catalog describedby href is not a URL`);
            continue;
          }
          if (!fs.existsSync(path.join(ROOT, pathname.replace(/^\//, "")))) {
            fail(`.well-known/api-catalog describedby points at ${pathname}, which is not in the build`);
          }
        }
      }
    }
  }
}

const headersPath = path.join(ROOT, "_headers");
if (!fs.existsSync(headersPath)) {
  fail("_headers is missing from the build");
} else {
  const headers = fs.readFileSync(headersPath, "utf8");
  if (!headers.includes("application/linkset+json")) {
    fail("_headers does not set application/linkset+json on the API catalog");
  }

  // Homepage Link headers are set by the Worker (HTML runs worker-first, so
  // _headers would not apply) and repeated here for a direct asset response.
  // The two copies must stay the same string.
  const discoverySource = fs.readFileSync(
    path.resolve("src/utils/discovery-links.ts"),
    "utf8",
  );
  const discoveryLink = discoverySource.match(
    /export const DISCOVERY_LINK =\s*'([^']*)'/,
  )?.[1];
  const workerSource = fs.readFileSync(path.resolve("src/worker.ts"), "utf8");
  if (!discoveryLink) {
    fail("src/utils/discovery-links.ts is missing DISCOVERY_LINK");
  } else if (!workerSource.includes("withDiscoveryLinks")) {
    fail("src/worker.ts does not attach homepage discovery links");
  } else {
    for (const rel of ["api-catalog", "service-desc", "service-doc", "describedby"]) {
      if (!discoveryLink.includes(`rel="${rel}"`)) {
        fail(`DISCOVERY_LINK is missing rel="${rel}"`);
      }
    }
    const rules = parseHeaderRules(headers);
    for (const homepage of ["/", "/en", "/en/", "/it", "/it/"]) {
      const rule = rules.find((entry) => entry.path === homepage);
      const link = rule?.headers.find((header) => header.name.toLowerCase() === "link");
      if (!rule || link?.value !== discoveryLink) {
        fail(`_headers ${homepage} Link does not match DISCOVERY_LINK`);
      }
    }
  }
}

/** Split a Cloudflare `_headers` file into path rules. */
function parseHeaderRules(text) {
  const rules = [];
  let current = null;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      current = { path: line.trim(), headers: [] };
      rules.push(current);
      continue;
    }
    const match = line.match(/^\s+([^:]+):\s*(.*)$/);
    if (current && match) {
      current.headers.push({ name: match[1].trim(), value: match[2].trim() });
    }
  }
  return rules;
}

// RFC 9116: an expired security.txt is treated as absent by scanners.
const securityTxt = path.join(ROOT, ".well-known", "security.txt");
if (!fs.existsSync(securityTxt)) {
  fail(".well-known/security.txt is missing from the build");
} else {
  const text = fs.readFileSync(securityTxt, "utf8");
  if (!/^Contact:\s*\S+/m.test(text)) fail("security.txt has no Contact field");
  const expires = text.match(/^Expires:\s*(\S+)/m)?.[1];
  const expiresAt = expires ? Date.parse(expires) : Number.NaN;
  if (Number.isNaN(expiresAt)) fail("security.txt has no valid Expires field");
  else if (expiresAt < Date.now()) fail(`security.txt expired on ${expires}; bump the date`);
  else if (expiresAt - Date.now() < 30 * 24 * 3600 * 1000) {
    fail(`security.txt expires within 30 days (${expires}); bump the date`);
  }
}

const authCheck = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "scripts/check-auth-discovery.ts", ROOT],
  { encoding: "utf8" },
);
if (authCheck.status !== 0) {
  const detail = (authCheck.stderr || authCheck.stdout || "auth.md discovery check failed").trim();
  fail(detail);
}

console.log(`Checked ${files.length} pages in ${ROOT}.`);

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("No SEO regressions found.");
