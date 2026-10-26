/**
 * Write the public discovery files from src/discovery/agent-auth.ts and
 * src/discovery/agent-skills.ts. The worker serves the same modules, so the
 * files and the responses stay aligned.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileBodies } from "../src/discovery/agent-auth.ts";
import { agentSkillFiles } from "../src/discovery/agent-skills.ts";

const root = join(import.meta.dirname, "..", "public");
const bodies = { ...fileBodies(), ...(await agentSkillFiles()) };

for (const [rel, body] of Object.entries(bodies)) {
	const dest = join(root, rel);
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, body);
}
