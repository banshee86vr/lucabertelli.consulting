#!/usr/bin/env node
import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const configPath = join(homedir(), "Library/Preferences/.wrangler/config/default.toml");
const config = readFileSync(configPath, "utf8");
const tokenMatch = config.match(/oauth_token\s*=\s*"([^"]+)"/);
if (!tokenMatch) { console.error("No OAuth token found"); process.exit(1); }

const TOKEN = tokenMatch[1];
const ACCOUNT_ID = "c138ed146a7c6f964da4657fa15fdd69";
const PROJECT = "lucabertelli-consulting";
const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}`;
const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

async function listAll() {
  const all = [];
  let page = 1;
  while (true) {
    const r = await fetch(`${BASE}/deployments?per_page=25&page=${page}`, { headers });
    const data = await r.json();
    if (!data.success) throw new Error(JSON.stringify(data.errors));
    if (data.result.length === 0) break;
    all.push(...data.result);
    if (data.result.length < 25) break;
    page++;
  }
  return all;
}

async function del(id) {
  const r = await fetch(`${BASE}/deployments/${id}?force=true`, { method: "DELETE", headers });
  const data = await r.json();
  if (!data.success) console.error(`  Failed ${id}: ${JSON.stringify(data.errors)}`);
  else console.log(`  Deleted ${id}`);
}

async function deleteProject() {
  const r = await fetch(BASE, { method: "DELETE", headers });
  const data = await r.json();
  if (!data.success) throw new Error(JSON.stringify(data.errors));
  console.log("Project deleted!");
}

async function main() {
  const deployments = await listAll();
  console.log(`Found ${deployments.length} deployment(s). Deleting...`);

  const BATCH = 5;
  for (let i = 0; i < deployments.length; i += BATCH) {
    await Promise.all(deployments.slice(i, i + BATCH).map(d => del(d.id)));
  }

  console.log("\nAll deployments deleted. Deleting project...");
  await deleteProject();
}

main().catch(e => { console.error(e); process.exit(1); });
