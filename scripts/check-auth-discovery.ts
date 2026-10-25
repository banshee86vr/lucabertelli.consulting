/**
 * Check Auth.md discovery invariants, response behavior, and (when a build
 * directory is passed) that the shipped files match the module.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { assertDiscoveryResponses, fileBodies } from "../src/discovery/agent-auth.ts";

const CONTENT_TYPES: Record<string, string> = {
	"/auth.md": "text/markdown; charset=utf-8",
	"/.well-known/oauth-protected-resource": "application/json; charset=utf-8",
	"/.well-known/oauth-authorization-server": "application/json; charset=utf-8",
	"/agent/auth/register": "application/json; charset=utf-8",
	"/agent/auth/claim": "application/json; charset=utf-8",
	"/agent/auth/revoke": "application/json; charset=utf-8",
};

function headerBlock(headers: string, route: string): string {
	const marker = `${route}\n`;
	const start = headers.indexOf(marker);
	if (start === -1) return "";
	const rest = headers.slice(start + marker.length);
	const next = rest.search(/\n\/\S/);
	return next === -1 ? rest : rest.slice(0, next);
}

async function main(): Promise<void> {
	const errors: string[] = [];
	try {
		await assertDiscoveryResponses();
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}

	const root = process.argv[2];
	if (root) {
		const bodies = fileBodies();
		for (const [rel, body] of Object.entries(bodies)) {
			const full = join(root, rel);
			if (!existsSync(full)) {
				errors.push(`${rel} is missing from ${root}`);
				continue;
			}
			const shipped = readFileSync(full, "utf8");
			if (shipped !== body) errors.push(`${rel} in ${root} does not match src/discovery/agent-auth.ts`);
		}

		const headersPath = join(root, "_headers");
		if (!existsSync(headersPath)) {
			errors.push("_headers is missing from the build");
		} else {
			const headers = readFileSync(headersPath, "utf8");
			for (const [route, contentType] of Object.entries(CONTENT_TYPES)) {
				const block = headerBlock(headers, route);
				if (!block) errors.push(`_headers has no block for ${route}`);
				else if (!block.includes(`Content-Type: ${contentType}`)) {
					errors.push(`_headers does not set ${contentType} on ${route}`);
				}
			}
		}
	}

	if (errors.length > 0) {
		console.error(errors.join("\n"));
		process.exit(1);
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
