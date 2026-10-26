#!/usr/bin/env node
/**
 * Push the sitemap URLs to IndexNow so Bing (and the engines that share its
 * index: Copilot, DuckDuckGo, ChatGPT search, Yandex, Naver, Seznam) recrawl
 * changed pages within minutes instead of waiting for the next scheduled visit.
 *
 * Usage, after the deploy is live:
 *   pnpm run submit:indexnow                 # every URL in the live sitemap
 *   pnpm run submit:indexnow -- /en/ /it/    # only the given paths
 *   INDEXNOW_DRY_RUN=1 pnpm run submit:indexnow
 *
 * The key must match the file served at https://<host>/<key>.txt (kept in
 * `public/`). It is a public ownership token, not a secret.
 *
 * When WEB_BOT_AUTH_PRIVATE_JWK is set (or present in `.dev.vars`), the POST
 * is signed with Signature-Agent and Signature-Input.
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";
import { hasWebBotAuthSecret, publishedPrivateJwk, signAgentRequest } from "../src/discovery/web-bot-auth.ts";

function webBotEnv() {
  const env = { ...process.env };
  const devVars = fileURLToPath(new URL("../.dev.vars", import.meta.url));
  if (!env.WEB_BOT_AUTH_PRIVATE_JWK && existsSync(devVars)) {
    Object.assign(env, parse(readFileSync(devVars, "utf8")));
  }
  return env;
}

const SITE = process.env.INDEXNOW_SITE ?? "https://lucabertelli.consulting";
const KEY = process.env.INDEXNOW_KEY ?? "4601f867d99a0cb5aeda2cdbaf7f9321";
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const DRY_RUN = process.env.INDEXNOW_DRY_RUN === "1";

const host = new URL(SITE).host;

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

async function sitemapUrls() {
  const index = await fetchText(`${SITE}/sitemap-index.xml`);
  // Child sitemaps are listed with the production origin; resolve them against
  // SITE so the script also works against a preview or local build.
  const sitemaps = [...index.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (m) => new URL(new URL(m[1]).pathname, SITE).href,
  );
  const urls = [];
  for (const sitemap of sitemaps) {
    const xml = await fetchText(sitemap);
    urls.push(
      ...[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
        (m) => new URL(new URL(m[1]).pathname, SITE).href,
      ),
    );
  }
  return urls;
}

async function main() {
  const keyUrl = `${SITE}/${KEY}.txt`;
  const served = (await fetchText(keyUrl)).trim();
  if (served !== KEY) {
    throw new Error(`${keyUrl} serves "${served}", expected the key itself.`);
  }

  const args = process.argv.slice(2);
  const urlList = args.length
    ? args.map((p) => (p.startsWith("http") ? p : `${SITE}${p}`))
    : await sitemapUrls();

  if (urlList.length === 0) throw new Error("No URLs to submit.");
  if (urlList.length > 10000) throw new Error("IndexNow accepts at most 10,000 URLs per call.");

  const payload = { host, key: KEY, keyLocation: keyUrl, urlList };
  console.log(`Submitting ${urlList.length} URL(s) for ${host} to IndexNow`);
  if (DRY_RUN) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  let request = new Request(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const webBot = webBotEnv();
  if (hasWebBotAuthSecret(webBot)) {
    const privateJwk = await publishedPrivateJwk(webBot);
    if (!privateJwk) {
      throw new Error("WEB_BOT_AUTH_PRIVATE_JWK does not match the published Ed25519 key");
    }
    request = await signAgentRequest(request, privateJwk);
    console.log("IndexNow request signed with Web Bot Auth");
  }
  const res = await fetch(request);

  // 200 = accepted, 202 = accepted and key validation pending.
  if (res.status === 200 || res.status === 202) {
    console.log(`IndexNow answered ${res.status}: accepted.`);
    return;
  }
  const body = await res.text();
  throw new Error(`IndexNow answered ${res.status}: ${body || res.statusText}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
