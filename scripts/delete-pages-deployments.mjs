#!/usr/bin/env node
/**
 * Delete old Cloudflare Pages deployments (workaround for projects with 100+ deployments).
 * See: https://developers.cloudflare.com/pages/platform/known-issues/#delete-a-project-with-a-high-number-of-deployments
 *
 * Usage:
 *   CF_API_TOKEN=<token> CF_ACCOUNT_ID=<id> CF_PAGES_PROJECT_NAME=<name> node scripts/delete-pages-deployments.mjs
 *
 * Optional: CF_DELETE_ALIASED_DEPLOYMENTS=true to also delete aliased deployments (e.g. staging).
 */

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const PROJECT_NAME = process.env.CF_PAGES_PROJECT_NAME;
const DELETE_ALIASED = process.env.CF_DELETE_ALIASED_DEPLOYMENTS === "true";

if (!ACCOUNT_ID || !API_TOKEN || !PROJECT_NAME) {
  console.error(
    "Missing env: set CF_ACCOUNT_ID, CF_API_TOKEN, and CF_PAGES_PROJECT_NAME"
  );
  process.exit(1);
}

const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${encodeURIComponent(PROJECT_NAME)}`;

async function listDeployments(page = 1, perPage = 50) {
  const url = `${BASE}/deployments?per_page=${perPage}&page=${page}`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!r.ok) {
    throw new Error(`List failed: ${r.status} ${await r.text()}`);
  }
  const data = await r.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || "List request failed");
  }
  return data.result;
}

async function deleteDeployment(deploymentId, aliased = false) {
  const force = aliased ? "?force=true" : "";
  const url = `${BASE}/deployments/${deploymentId}${force}`;
  const r = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Delete ${deploymentId} failed: ${r.status} ${text}`);
  }
  const data = await r.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || "Delete request failed");
  }
  return data.result;
}

async function main() {
  const kept = new Set();
  const toDelete = [];
  let page = 1;
  let total = 0;

  console.log(`Listing deployments for project: ${PROJECT_NAME}`);
  do {
    const deployments = await listDeployments(page);
    total = deployments.length;
    for (const d of deployments) {
      const id = d.id;
      const isProd = d.environment === "production";
      const isLatest = d.latest_stage?.name === "deploy";
      const isAliased = !!d.aliases?.length;

      if (isProd && isLatest) {
        kept.add(id);
        console.log(`  Keep (production latest): ${id}`);
        continue;
      }
      if (isAliased && !DELETE_ALIASED) {
        kept.add(id);
        console.log(`  Skip (aliased): ${id}`);
        continue;
      }
      toDelete.push({ id, aliased: isAliased });
    }
    page++;
  } while (total === 50);

  console.log(`\nDeleting ${toDelete.length} deployment(s)...`);
  for (const { id, aliased } of toDelete) {
    await deleteDeployment(id, aliased);
    console.log(`  Deleted: ${id}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
