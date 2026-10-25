/**
 * Write the public Auth.md discovery files from src/discovery/agent-auth.ts.
 * The worker serves the same module, so the files and the responses stay aligned.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileBodies } from "../src/discovery/agent-auth.ts";

const root = join(import.meta.dirname, "..", "public");

for (const [rel, body] of Object.entries(fileBodies())) {
	const dest = join(root, rel);
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, body);
}
