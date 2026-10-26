/**
 * Web Bot Auth directory and request signing.
 *
 * The public Ed25519 key is published at
 * `/.well-known/http-message-signatures-directory`. The private key is the
 * Worker secret `WEB_BOT_AUTH_PRIVATE_JWK` (raw JSON, or base64url of that
 * JSON). It is not in the repository. Outbound agent requests are signed
 * only with the key that matches this directory.
 *
 * Signature-Agent is the legacy structured-field string. Cloudflare's
 * verifier rejects the dictionary form from later drafts.
 */

import { component, createSignature, verifySignature } from "http-message-sig";
import { generateNonce, sign, verify } from "web-bot-auth";
import { signerFromJWK, verifierFromJWK } from "web-bot-auth/crypto";
import { ORIGIN } from "./agent-card.ts";

export const DIRECTORY_PATH = "/.well-known/http-message-signatures-directory";
export const DIRECTORY_URL = `${ORIGIN}${DIRECTORY_PATH}`;
/** Path relative to `public/` and `dist/client/`. */
export const DIRECTORY_FILE = DIRECTORY_PATH.slice(1);

export const DIRECTORY_TYPE = "application/http-message-signatures-directory+json";
export const SIGNATURE_AGENT = `"${ORIGIN}"`;

const DIRECTORY_TAG = "http-message-signatures-directory";
const REQUEST_TAG = "web-bot-auth";
const LABEL = "sig1";
const REQUEST_TTL_SECONDS = 60;
const DIRECTORY_TTL_SECONDS = 3600;
const ALLOW = "GET, HEAD, OPTIONS";
const CACHE = "public, max-age=300";
const JSON_TYPE = "application/json; charset=utf-8";
const SECRET = "WEB_BOT_AUTH_PRIVATE_JWK";

/** RFC 8037 appendix example. Thumbprint is from RFC 7638 over crv, kty, and x. */
const THUMBPRINT_VECTOR = {
	x: "JrQLj5P_89iXES9-vFgrIy29clF9CC_oPPsw3c5D0bs",
	kid: "poqkLGiymh_W0uP6PZFw-dvez3QJT5SolqXBCW38r0U",
} as const;

/** `kid` is not on TypeScript's `JsonWebKey` in this lib. It is required on the directory key. */
export interface DirectoryJwk {
	kty: "OKP";
	crv: "Ed25519";
	kid: string;
	x: string;
	use: "sig";
	alg: "EdDSA";
}

export const PUBLIC_JWK: DirectoryJwk = {
	kty: "OKP",
	crv: "Ed25519",
	kid: "00BkgtEwOIdVMx6jf3-Hyb4fe785vPEHYUzN8lYr3ik",
	x: "fVXbrHWHkqh5_kYD6j36vZ6VTkB8eZZhjN6xW0cXvf8",
	use: "sig",
	alg: "EdDSA",
};

export function directoryText(): string {
	return `${JSON.stringify({ keys: [publicDirectoryKey()] }, null, 2)}\n`;
}

function publicDirectoryKey(): DirectoryJwk {
	return {
		kty: "OKP",
		crv: "Ed25519",
		kid: PUBLIC_JWK.kid,
		x: PUBLIC_JWK.x,
		use: "sig",
		alg: "EdDSA",
	};
}

export function hasWebBotAuthSecret(env: unknown): boolean {
	return rawSecret(env) !== undefined;
}

/**
 * Private JWK from `env.WEB_BOT_AUTH_PRIVATE_JWK`, or undefined when the
 * secret is missing or does not sign as the published public key.
 */
export async function publishedPrivateJwk(env: unknown): Promise<JsonWebKey | undefined> {
	const raw = rawSecret(env);
	if (raw === undefined) return undefined;
	return privateJwkMatching(raw, PUBLIC_JWK.x ?? "");
}

/**
 * Sign an outbound agent request. Sets Signature-Agent, Signature-Input, and
 * Signature. The covered components are @authority and signature-agent, with
 * tag web-bot-auth.
 */
export async function signAgentRequest(request: Request, privateJwk: JsonWebKey, now = new Date()): Promise<Request> {
	const jwk = asEd25519PrivateJwk(privateJwk);
	const headers = new Headers(request.headers);
	headers.delete("Signature");
	headers.delete("Signature-Input");
	headers.set("Signature-Agent", SIGNATURE_AGENT);
	const withAgent = new Request(request, { headers });
	const signer = await signerFromJWK(jwk);
	const fields = await sign(withAgent, {
		signer,
		created: now,
		expires: new Date(now.getTime() + REQUEST_TTL_SECONDS * 1000),
		nonce: generateNonce(),
		label: LABEL,
	});
	headers.set("Signature", fields.signature);
	headers.set("Signature-Input", fields.signatureInput);
	return new Request(withAgent, { headers });
}

/**
 * Directory response, or null when this request is not the well-known path.
 * The body is the public JWKS. When `env` holds the matching private key,
 * the response is signed with tag http-message-signatures-directory.
 */
export async function directoryResponse(request: Request, env?: unknown, now = new Date()): Promise<Response | null> {
	const url = new URL(request.url);
	if (normalizePath(url.pathname) !== DIRECTORY_PATH) return null;
	await discardBody(request);

	const method = request.method.toUpperCase();
	if (method === "OPTIONS") {
		return new Response(null, { status: 204, headers: { allow: ALLOW } });
	}
	if (method !== "GET" && method !== "HEAD") {
		return new Response(`${JSON.stringify({ error: "method_not_allowed" }, null, 2)}\n`, {
			status: 405,
			headers: {
				"content-type": JSON_TYPE,
				allow: ALLOW,
				"cache-control": "no-store",
			},
		});
	}

	const body = directoryText();
	const headers = new Headers({
		"content-type": DIRECTORY_TYPE,
		allow: ALLOW,
		"cache-control": CACHE,
		"content-length": String(new TextEncoder().encode(body).byteLength),
	});
	const privateJwk = await publishedPrivateJwk(env);
	if (hasWebBotAuthSecret(env) && !privateJwk) {
		console.error("WEB_BOT_AUTH_PRIVATE_JWK does not match the published Ed25519 key");
		return signingFailure(method, "signing_key_mismatch");
	}
	if (privateJwk) {
		try {
			const fields = await createDirectorySignature(request, privateJwk, now);
			headers.set("Content-Digest", fields.contentDigest);
			headers.set("Signature", fields.signature);
			headers.set("Signature-Input", fields.signatureInput);
		} catch (error) {
			console.error(error instanceof Error ? error.message : "directory signing failed");
			return signingFailure(method, "directory_signature_failed");
		}
	}
	if (method === "HEAD") return new Response(null, { status: 200, headers });
	return new Response(body, { status: 200, headers });
}

export async function ed25519Thumbprint(x: string): Promise<string> {
	if (!/^[A-Za-z0-9_-]+$/.test(x)) throw new Error("Ed25519 x is not base64url");
	const json = `{"crv":"Ed25519","kty":"OKP","x":"${x}"}`;
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(json));
	return base64url(digest);
}

async function createDirectorySignature(request: Request, privateJwk: JsonWebKey, now: Date) {
	const jwk = asEd25519PrivateJwk(privateJwk);
	const signer = await signerFromJWK(jwk);
	const created = unixSeconds(now);
	const contentDigest = await sha256ContentDigest(directoryText());
	const fields = await createSignature(
		{
			kind: "response",
			status: 200,
			fields: [{ name: "content-digest", value: contentDigest }],
			request,
		},
		{
			label: LABEL,
			components: [component("@authority", { req: true }), "content-digest"],
			parameters: {
				alg: "ed25519",
				keyid: signer.keyid,
				nonce: generateNonce(),
				tag: DIRECTORY_TAG,
				created,
				expires: created + DIRECTORY_TTL_SECONDS,
			},
			signer,
		},
	);
	return { ...fields, contentDigest };
}

/** RFC 9530 digest of the directory body. The signature covers this header. */
async function sha256ContentDigest(body: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
	return `sha-256=:${standardBase64(digest)}:`;
}

function standardBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

async function privateJwkMatching(raw: string, publicX: string): Promise<JsonWebKey | undefined> {
	let parsed: unknown;
	try {
		parsed = decodeSecret(raw);
	} catch {
		return undefined;
	}
	if (!isRecord(parsed)) return undefined;
	let jwk: JsonWebKey;
	try {
		jwk = asEd25519PrivateJwk(parsed as JsonWebKey);
	} catch {
		return undefined;
	}
	if (jwk.x !== publicX) return undefined;
	if (!(await keySignsAs(jwk, publicX))) return undefined;
	return jwk;
}

function rawSecret(env: unknown): string | undefined {
	if (!isRecord(env)) return undefined;
	const value = env[SECRET];
	if (typeof value !== "string" || value.length === 0) return undefined;
	return value;
}

function signingFailure(method: string, errorCode: string): Response {
	const body = `${JSON.stringify({ error: errorCode }, null, 2)}\n`;
	const headers = new Headers({
		"content-type": JSON_TYPE,
		"cache-control": "no-store",
		"content-length": String(new TextEncoder().encode(body).byteLength),
	});
	if (method === "HEAD") return new Response(null, { status: 500, headers });
	return new Response(body, { status: 500, headers });
}

function decodeSecret(raw: string): unknown {
	const trimmed = raw.trim();
	if (trimmed.startsWith("{")) return JSON.parse(trimmed);
	const pad = trimmed.length % 4 === 0 ? "" : "=".repeat(4 - (trimmed.length % 4));
	const base64 = trimmed.replace(/-/g, "+").replace(/_/g, "/") + pad;
	return JSON.parse(atob(base64));
}

function asEd25519PrivateJwk(value: JsonWebKey): JsonWebKey {
	if (value.kty !== "OKP" || value.crv !== "Ed25519") throw new Error("Web Bot Auth key must be Ed25519");
	if (value.alg !== undefined && value.alg !== "EdDSA" && value.alg !== "Ed25519") {
		throw new Error("Ed25519 JWK alg must be EdDSA");
	}
	if (typeof value.x !== "string" || typeof value.d !== "string" || value.d === "") {
		throw new Error("Web Bot Auth key is incomplete");
	}
	return { kty: "OKP", crv: "Ed25519", alg: "EdDSA", x: value.x, d: value.d };
}

async function keySignsAs(jwk: JsonWebKey, publicX: string): Promise<boolean> {
	const data = new TextEncoder().encode("web-bot-auth");
	try {
		const privateKey = await crypto.subtle.importKey("jwk", jwk, { name: "Ed25519" }, false, ["sign"]);
		const signature = await crypto.subtle.sign("Ed25519", privateKey, data);
		const publicKey = await crypto.subtle.importKey(
			"jwk",
			{ kty: "OKP", crv: "Ed25519", x: publicX },
			{ name: "Ed25519" },
			false,
			["verify"],
		);
		return crypto.subtle.verify("Ed25519", publicKey, signature, data);
	} catch {
		return false;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unixSeconds(date: Date): number {
	return Math.floor(date.getTime() / 1000);
}

function base64url(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function normalizePath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
	return pathname;
}

async function discardBody(request: Request): Promise<void> {
	if (request.body === null) return;
	try {
		await request.body.cancel();
	} catch {
		// The body is discarded on purpose.
	}
}

async function ephemeralPrivateJwk(): Promise<JsonWebKey> {
	const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
	return crypto.subtle.exportKey("jwk", pair.privateKey);
}

export async function assertWebBotAuthResponses(): Promise<void> {
	const errors: string[] = [];
	const now = new Date("2026-10-26T07:00:00.000Z");
	const created = unixSeconds(now);

	if ((await ed25519Thumbprint(THUMBPRINT_VECTOR.x)) !== THUMBPRINT_VECTOR.kid) {
		errors.push("Ed25519 thumbprint drifted from the RFC 8037 vector");
	}
	if (!PUBLIC_JWK.x || (await ed25519Thumbprint(PUBLIC_JWK.x)) !== PUBLIC_JWK.kid) {
		errors.push("published kid is not the JWK thumbprint");
	}

	const directory = directoryText();
	if (!directory.endsWith("\n")) errors.push("directory JSON must end with a newline");
	let parsed: { keys?: DirectoryJwk[] };
	try {
		parsed = JSON.parse(directory) as { keys?: DirectoryJwk[] };
	} catch (error) {
		throw new Error(`directory is not JSON (${error instanceof Error ? error.message : error})`);
	}
	const published = parsed.keys?.[0];
	if (!parsed.keys || parsed.keys.length !== 1 || !published) errors.push("directory must publish one key");
	else {
		if (published.kty !== "OKP" || published.crv !== "Ed25519" || published.x !== PUBLIC_JWK.x) {
			errors.push("directory key is not the published Ed25519 key");
		}
		if (published.kid !== PUBLIC_JWK.kid) errors.push("directory kid drifted");
		if ("d" in published) errors.push("directory must not publish the private key");
		if (directory.includes('"d":')) errors.push("directory text contains a private key field");
	}

	const unsigned = await directoryResponse(new Request(DIRECTORY_URL), undefined, now);
	if (!unsigned || unsigned.status !== 200) errors.push("GET directory must be 200");
	else {
		if (unsigned.headers.get("content-type") !== DIRECTORY_TYPE) errors.push("directory content-type");
		if (unsigned.headers.get("cache-control") !== CACHE) errors.push("directory cache-control");
		if (unsigned.headers.get("signature") || unsigned.headers.get("signature-input")) {
			errors.push("directory without a private key must not be signed");
		}
		if ((await unsigned.text()) !== directory) errors.push("GET directory body drifted");
	}

	const head = await directoryResponse(new Request(`${DIRECTORY_URL}/`, { method: "HEAD" }), undefined, now);
	if (!head || head.status !== 200) errors.push("HEAD directory must be 200");
	else {
		const length = Number(head.headers.get("content-length"));
		if (length !== new TextEncoder().encode(directory).byteLength) errors.push("HEAD directory content-length");
		if (await head.text()) errors.push("HEAD directory included a body");
	}

	const posted = await directoryResponse(
		new Request(DIRECTORY_URL, { method: "POST", body: JSON.stringify({ d: "nope" }) }),
		undefined,
		now,
	);
	if (!posted || posted.status !== 405) errors.push("POST directory must be 405");
	else if ((await posted.text()).includes("nope")) errors.push("POST directory echoed the body");

	const options = await directoryResponse(new Request(DIRECTORY_URL, { method: "OPTIONS" }), undefined, now);
	if (!options || options.status !== 204) errors.push("OPTIONS directory must be 204");

	const ignored = await directoryResponse(new Request(`${ORIGIN}/en/`), undefined, now);
	if (ignored !== null) errors.push("directory handler must ignore site pages");
	const extra = await directoryResponse(new Request(`${DIRECTORY_URL}/extra`), undefined, now);
	if (extra !== null) errors.push("directory handler must ignore nested paths");

	const privateJwk = await ephemeralPrivateJwk();
	const target = new Request("https://example.com/page");
	const signed = await signAgentRequest(target, privateJwk, now);
	const agent = signed.headers.get("signature-agent");
	const input = signed.headers.get("signature-input");
	const signature = signed.headers.get("signature");
	if (agent !== SIGNATURE_AGENT) errors.push(`Signature-Agent was ${JSON.stringify(agent)}`);
	if (!input || !signature) errors.push("signed request is missing Signature or Signature-Input");
	else {
		if (!input.startsWith(`${LABEL}=("@authority" "signature-agent");`)) {
			errors.push(`Signature-Input components drifted: ${input}`);
		}
		if (!input.includes(`tag="${REQUEST_TAG}"`)) errors.push("Signature-Input tag must be web-bot-auth");
		if (input.includes(";req") || input.includes(";key=")) {
			errors.push("request Signature-Input uses a parameter Cloudflare rejects");
		}
		if (agent?.startsWith("sig")) errors.push("Signature-Agent must be a string, not a dictionary");
		const verified = await verify(signed, {
			resolver: async () => verifierFromJWK({ kty: "OKP", crv: "Ed25519", alg: "EdDSA", x: privateJwk.x }),
			now,
		});
		if (verified.tag !== REQUEST_TAG) errors.push("verified request tag drifted");
		if (verified.keyid !== (await ed25519Thumbprint(privateJwk.x ?? ""))) {
			errors.push("verified keyid is not the thumbprint");
		}
		const lifetime = Math.floor(verified.expires.getTime() / 1000) - Math.floor(verified.created.getTime() / 1000);
		if (lifetime !== REQUEST_TTL_SECONDS) errors.push(`request signature lifetime was ${lifetime}s`);
	}

	const payload = JSON.stringify({ host: "lucabertelli.consulting" });
	const postedOut = new Request("https://api.indexnow.org/IndexNow", {
		method: "POST",
		headers: { "content-type": JSON_TYPE },
		body: payload,
	});
	const signedPost = await signAgentRequest(postedOut, privateJwk, now);
	if (signedPost.method !== "POST") errors.push("signed POST lost its method");
	if ((await signedPost.text()) !== payload) errors.push("signed POST dropped the body");
	if (!signedPost.headers.get("signature-input")?.includes(`tag="${REQUEST_TAG}"`)) {
		errors.push("signed POST lost Signature-Input");
	}

	const directoryRequest = new Request(DIRECTORY_URL);
	const directoryFields = await createDirectorySignature(directoryRequest, privateJwk, now);
	if (!directoryFields.signatureInput.includes('"@authority";req')) {
		errors.push("directory signature must cover @authority;req");
	}
	if (!directoryFields.signatureInput.includes('"content-digest"')) {
		errors.push("directory signature must cover content-digest");
	}
	if (directoryFields.contentDigest !== (await sha256ContentDigest(directory))) {
		errors.push("Content-Digest is not the SHA-256 of the directory body");
	}
	if (!directoryFields.signatureInput.includes(`tag="${DIRECTORY_TAG}"`)) {
		errors.push("directory signature tag drifted");
	}
	if (directoryFields.signatureInput.includes(`tag="${REQUEST_TAG}"`)) {
		errors.push("directory signature used the request tag");
	}
	const directoryVerified = await verifySignature(
		{
			kind: "response",
			status: 200,
			fields: [
				{ name: "content-digest", value: directoryFields.contentDigest },
				{ name: "signature", value: directoryFields.signature },
				{ name: "signature-input", value: directoryFields.signatureInput },
			],
			request: directoryRequest,
		},
		{
			label: LABEL,
			policy: {
				algorithms: ["ed25519"],
				requiredComponents: [component("@authority", { req: true }), "content-digest"],
				requiredParameters: ["created", "expires", "keyid", "alg", "tag"],
				now: created,
				maxAge: DIRECTORY_TTL_SECONDS,
			},
			resolveVerifier: async () => verifierFromJWK({ kty: "OKP", crv: "Ed25519", alg: "EdDSA", x: privateJwk.x }),
		},
	);
	if (directoryVerified.parameters.tag !== DIRECTORY_TAG) errors.push("verified directory tag drifted");
	if (directoryVerified.parameters.keyid !== (await ed25519Thumbprint(privateJwk.x ?? ""))) {
		errors.push("verified directory keyid is not the thumbprint");
	}

	const secretBytes = new TextEncoder().encode(JSON.stringify(asEd25519PrivateJwk(privateJwk)));
	const encoded = base64url(secretBytes.buffer.slice(secretBytes.byteOffset, secretBytes.byteOffset + secretBytes.byteLength));
	const matched = await privateJwkMatching(encoded, privateJwk.x ?? "");
	if (!matched || matched.x !== privateJwk.x) errors.push("base64url private key did not round-trip");
	const swapped = await privateJwkMatching(encoded, PUBLIC_JWK.x ?? "");
	if (swapped) errors.push("a private key for another x was accepted as the published key");
	if (await publishedPrivateJwk({ [SECRET]: encoded })) {
		errors.push("publishedPrivateJwk accepted a key that is not in the directory");
	}
	if (await publishedPrivateJwk(undefined)) errors.push("missing env must not yield a private key");

	const mismatch = await directoryResponse(new Request(DIRECTORY_URL), { [SECRET]: encoded }, now);
	if (!mismatch || mismatch.status !== 500) errors.push("a mismatched signing key must not serve the directory");
	else {
		const text = await mismatch.text();
		if (text.includes(encoded) || text.includes(privateJwk.d ?? "missing-d")) {
			errors.push("signing key mismatch response leaked the private key");
		}
		if (mismatch.headers.get("signature") || mismatch.headers.get("content-digest")) {
			errors.push("signing key mismatch response was signed");
		}
		const headMismatch = await directoryResponse(
			new Request(DIRECTORY_URL, { method: "HEAD" }),
			{ [SECRET]: encoded },
			now,
		);
		if (!headMismatch || headMismatch.status !== 500) errors.push("HEAD mismatch must be 500");
		else if (await headMismatch.text()) errors.push("HEAD mismatch included a body");
		else if (Number(headMismatch.headers.get("content-length")) !== new TextEncoder().encode(text).byteLength) {
			errors.push("HEAD mismatch content-length drifted from the GET body");
		}
	}

	const blank = await directoryResponse(new Request(DIRECTORY_URL), { [SECRET]: " \n\t" }, now);
	if (!blank || blank.status !== 500) errors.push("a whitespace signing key must not serve an unsigned directory");
	const unset = await directoryResponse(new Request(DIRECTORY_URL), { [SECRET]: "" }, now);
	if (!unset || unset.status !== 200 || unset.headers.get("signature")) {
		errors.push("an empty signing key must be treated as unset");
	}

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
