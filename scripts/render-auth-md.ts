/**
 * Write the public discovery files from src/discovery/agent-auth.ts
 * (including the ACP document and the UCP profile), src/discovery/agent-skills.ts, and
 * src/discovery/web-bot-auth.ts. The worker serves the same modules, so the
 * files and the responses stay aligned.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileBodies } from "../src/discovery/agent-auth.ts";
import { agentSkillFiles } from "../src/discovery/agent-skills.ts";
import { DIRECTORY_FILE, directoryText } from "../src/discovery/web-bot-auth.ts";

const root = join(import.meta.dirname, "..", "public");
const bodies = { ...fileBodies(), ...(await agentSkillFiles()), [DIRECTORY_FILE]: directoryText() };

for (const [rel, body] of Object.entries(bodies)) {
	const dest = join(root, rel);
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, body);
}
