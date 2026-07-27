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
  "/robots.txt",
  "/en/rss.xml",
  "/it/rss.xml",
  "/sitemap-index.xml",
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
}

console.log(`Checked ${files.length} pages in ${ROOT}.`);

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("No SEO regressions found.");
