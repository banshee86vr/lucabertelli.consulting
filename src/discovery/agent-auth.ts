import { ACP_BASE_URL, ACP_DOCUMENT_URL, ACP_PATH, API_VERSION, CHECKOUT_URL, acpDocumentText } from "./acp.ts";
import { A2A_URL, AGENT_CARD_PATH, AGENT_CARD_URL, agentCardText } from "./agent-card.ts";
import { AGENT_SKILLS_INDEX_URL, SKILL_NAME, SKILL_URL } from "./agent-skills.ts";
import { MCP_CARD_PATH, MCP_CARD_URL, MCP_URL, mcpCardText } from "./mcp-server.ts";
import { DIRECTORY_URL } from "./web-bot-auth.ts";

/**
 * Auth.md discovery for a public, read-only site.
 *
 * Anonymous access is the only registration method. These documents do not
 * advertise ID-JAG, verified email, or any grant that would issue a token:
 * nothing on this origin checks an Authorization header or stores an agent
 * credential. POST handlers must keep ignoring the body.
 */

export const ORIGIN = "https://lucabertelli.consulting";

/**
 * Cloudflare Access issuer for this account. Its OAuth authorization server
 * metadata is `/.well-known/oauth-authorization-server` on this host.
 */
export const ACCESS_ISSUER = "https://lucabertelli.cloudflareaccess.com";

export const PATHS = {
	authMd: "/auth.md",
	protectedResource: "/.well-known/oauth-protected-resource",
	authorizationServer: "/.well-known/oauth-authorization-server",
	register: "/agent/auth/register",
	registerAlias: "/agent/auth",
	claim: "/agent/auth/claim",
	revoke: "/agent/auth/revoke",
} as const;

const MARKDOWN = "text/markdown; charset=utf-8";
const JSON_TYPE = "application/json; charset=utf-8";
const DOCUMENT_ALLOW = "GET, HEAD, OPTIONS";
const AGENT_ALLOW = "GET, HEAD, POST, OPTIONS";
const SCOPE = "read";

const skillUrl = `${ORIGIN}${PATHS.authMd}`;
const registerUri = `${ORIGIN}${PATHS.register}`;
const claimUri = `${ORIGIN}${PATHS.claim}`;
const revocationUri = `${ORIGIN}${PATHS.revoke}`;
const privacyEn = `${ORIGIN}/en/privacy`;
const privacyIt = `${ORIGIN}/it/privacy`;

export interface AgentAuthBlock {
	skill: string;
	register_uri: string;
	identity_endpoint: string;
	claim_uri: string;
	claim_endpoint: string;
	revocation_uri: string;
	identity_types_supported: ["anonymous"];
	anonymous: {
		credential_types_supported: ["none"];
		claim_uri: string;
	};
	credentials_note: string;
}

export function agentAuthBlock(): AgentAuthBlock {
	return {
		skill: skillUrl,
		register_uri: registerUri,
		identity_endpoint: registerUri,
		claim_uri: claimUri,
		claim_endpoint: claimUri,
		revocation_uri: revocationUri,
		identity_types_supported: ["anonymous"],
		anonymous: {
			credential_types_supported: ["none"],
			claim_uri: claimUri,
		},
		credentials_note:
			"No credential is issued. Fetch public documents without an Authorization header. The read scope names that public access.",
	};
}

export function protectedResourceMetadata(resource = ORIGIN) {
	return {
		resource,
		resource_name: "Luca Bertelli Consulting",
		resource_logo_uri: `${ORIGIN}/logo.png`,
		// Access is the OAuth issuer. This origin stays listed so the anonymous
		// Auth.md issuer is one of the servers the protected resource names.
		authorization_servers: [ACCESS_ISSUER, ORIGIN],
		scopes_supported: [SCOPE],
		bearer_methods_supported: ["header"],
		resource_documentation: skillUrl,
		resource_policy_uri: privacyEn,
		agent_auth: agentAuthBlock(),
	};
}

export function authorizationServerMetadata() {
	return {
		issuer: ORIGIN,
		scopes_supported: [SCOPE],
		// Empty on purpose. Omitting grant_types_supported would mean
		// authorization_code and implicit (RFC 8414), and this issuer has
		// no authorization endpoint and no token endpoint.
		grant_types_supported: [] as string[],
		response_types_supported: [] as string[],
		service_documentation: skillUrl,
		agent_auth: agentAuthBlock(),
	};
}

function link(url: string): string {
	return `[${url}](${url})`;
}

export function authMarkdown(): string {
	const host = new URL(ORIGIN).host;
	return `# auth.md

Luca Bertelli Consulting publishes this file for agents that need to know how to access ${ORIGIN}. The site is a public, read-only practice site. Anonymous clients read every document. No account and no credential are required.

## Audience

Automated agents, and the people who operate them, use the same public pages, feeds, and discovery files as a browser. The practice answers in English and Italian. Machine-readable discovery is in English.

## Registration

The supported method is anonymous access. Calling the registration endpoint creates nothing.

The registration endpoint is ${link(registerUri)}. \`GET\` and \`POST\` return a JSON document describing anonymous access. \`POST\` does not store the body: no account is created, no email is sent, and no credential is issued. ${link(`${ORIGIN}${PATHS.registerAlias}`)} returns the same document.

A passive client can stop after this file and the two metadata documents below. \`POST\` is safe, and it is not required to learn the access rules.

## Supported methods

Anonymous access is the only method.

- \`identity_types_supported\` is \`["anonymous"]\`.
- \`anonymous.credential_types_supported\` is \`["none"]\`.
- The claim URL is ${link(claimUri)}.

An identity assertion is outside this method. The metadata does not list \`urn:ietf:params:oauth:token-type:id-jag\` or \`verified_email\`.

## Credentials

Fetch every document with no \`Authorization\` header. The scope name \`read\` is the public read access anonymous clients already have. Protected resource metadata lists \`bearer_methods_supported\` as \`["header"]\` so a client that has a bearer token knows the header it would use. This issuer does not mint bearer tokens. A request that sends one receives the same public document; the header is not checked.

## Claim

There is no account to claim. ${link(claimUri)} answers \`GET\` and \`POST\` with that fact. It does not start a confirmation ceremony and it does not send email.

## Revocation

This origin stores no agent credential. ${link(revocationUri)} answers \`GET\` and \`POST\` with that fact. To ask for deletion of email you sent to the practice, write to info@lucabertelli.consulting. The privacy notice is published in [English](${privacyEn}) and [Italian](${privacyIt}).

## Discovery

Read these documents. All of them are public.

1. Protected Resource Metadata for this origin: ${link(`${ORIGIN}${PATHS.protectedResource}`)}
2. Protected Resource Metadata for the English homepage: ${link(`${ORIGIN}${PATHS.protectedResource}/en/`)}
3. Authorization Server metadata for anonymous access: ${link(`${ORIGIN}${PATHS.authorizationServer}`)}
4. Cloudflare Access authorization server metadata: ${link(`${ACCESS_ISSUER}/.well-known/oauth-authorization-server`)}

\`authorization_servers\` lists Cloudflare Access first (\`${ACCESS_ISSUER}\`) and this origin second. Access is the OAuth authorization server. This origin does not mint tokens. Its authorization server metadata describes anonymous access, and its \`issuer\` is \`${ORIGIN}\`, the second entry in \`authorization_servers\`. The \`agent_auth\` block carries \`skill\` (this file), \`register_uri\`, \`claim_uri\`, \`revocation_uri\`, and the anonymous method above. \`identity_endpoint\` and \`claim_endpoint\` repeat \`register_uri\` and \`claim_uri\` for clients that look up those names.

\`grant_types_supported\` on this origin is an empty list. There is no authorization endpoint and no token endpoint here. Access publishes those endpoints on its own issuer.

The apex redirects to the English homepage, so clients that start at ${link(ORIGIN)} use ${link(`${ORIGIN}/en/`)} as the resource identifier. That identifier's metadata is the second link above, and its \`resource\` value is the identifier itself. The same insertion applies to any other path on this host.

A 401 response carries a \`WWW-Authenticate\` challenge whose \`resource_metadata\` parameter is the metadata URL for the resource that was requested. Public pages answer 200 and do not send that challenge.

## Public documents

The API catalog and the OpenAPI description list the read API:

- [API catalog](${ORIGIN}/.well-known/api-catalog)
- [OpenAPI description](${ORIGIN}/api/openapi.yaml)
- [API docs](${ORIGIN}/api/docs.md)
- [llms.txt](${ORIGIN}/llms.txt)
- [llms-full.txt](${ORIGIN}/llms-full.txt)
- [Security contact](${ORIGIN}/.well-known/security.txt)
- [A2A Agent Card](${AGENT_CARD_URL})
- [A2A JSON-RPC](${A2A_URL})
- [Agent Skills index](${AGENT_SKILLS_INDEX_URL})
- [MCP Server Card](${MCP_CARD_URL})
- [MCP endpoint](${MCP_URL})
- [ACP discovery](${ACP_DOCUMENT_URL})

The Agent Card is A2A 1.0. ${link(A2A_URL)} accepts \`POST\` JSON-RPC \`SendMessage\` and answers with a message that points at these documents. It does not create a task, store the request, or issue a credential.

The MCP server card names a Streamable HTTP endpoint. ${link(MCP_URL)} accepts \`POST\` JSON-RPC. The tool \`read_practice\` returns the public index. Resources, prompts, and sessions are off. The call is not stored and no credential is issued.

ACP discovery is ${link(ACP_DOCUMENT_URL)}. \`protocol.name\` is \`acp\`. \`protocol.version\` is \`${API_VERSION}\`. The REST base is ${link(ACP_BASE_URL)}. \`transports\` lists \`rest\`. \`capabilities.services\` lists \`checkout\`. ${link(CHECKOUT_URL)} answers \`POST\` with an error. This seller does not create a checkout session, does not take payment, and does not store the request.

HTML pages register WebMCP tools on load: \`search_site\` reads the public index, \`read_page\` returns the open page, and \`navigate\` opens a path on this origin. The call is \`document.modelContext.registerTool\`, or \`navigator.modelContext.registerTool\` when that is the browser entry point. An AbortSignal unregisters the tools when the page is discarded.

The Agent Skills index lists \`${SKILL_NAME}\`. The artifact is ${link(SKILL_URL)}. Its digest is the SHA-256 of that file.

DNS for AI Discovery publishes ServiceMode HTTPS and SVCB records at \`_index._agents.${host}\`, \`_a2a._agents.${host}\`, and \`_mcp._agents.${host}\`. The target is ${host}, TLS is \`h2\` on port 443, and the agent protocol is the private-use SvcParam \`key65402\`. \`key65400\` is the capability URL. \`key65409\` is the well-known path.

Requests this origin sends as an agent are signed with HTTP message signatures. The public Ed25519 key is ${link(DIRECTORY_URL)}. A verifier fetches that directory and checks the \`Signature-Agent\` and \`Signature-Input\` headers. The directory media type is \`application/http-message-signatures-directory+json\`.

An HTML page also answers \`Accept: text/markdown\` with that page's main content.
`;
}

export interface AgentEndpointDocument {
	skill: string;
	resource: string;
	identity_type: "anonymous";
	credential_types_supported: ["none"];
	credential_issued: false;
	account_created: false;
	register_uri: string;
	claim_uri: string;
	revocation_uri: string;
	message: string;
	registration_required?: false;
	claim_supported?: false;
	revocation_supported?: false;
	credential_stored?: false;
	contact?: string;
	privacy?: string[];
}

export function registrationDocument(): AgentEndpointDocument {
	return {
		registration_required: false,
		identity_type: "anonymous",
		credential_types_supported: ["none"],
		credential_issued: false,
		account_created: false,
		skill: skillUrl,
		resource: ORIGIN,
		register_uri: registerUri,
		claim_uri: claimUri,
		revocation_uri: revocationUri,
		message:
			"No account is created and no credential is issued. Fetch public documents without an Authorization header.",
	};
}

export function claimDocument(): AgentEndpointDocument {
	return {
		claim_supported: false,
		identity_type: "anonymous",
		credential_types_supported: ["none"],
		credential_issued: false,
		account_created: false,
		skill: skillUrl,
		resource: ORIGIN,
		register_uri: registerUri,
		claim_uri: claimUri,
		revocation_uri: revocationUri,
		message:
			"There is no account to claim. Public documents are already available without a credential.",
	};
}

export function revocationDocument(): AgentEndpointDocument {
	return {
		revocation_supported: false,
		credential_stored: false,
		identity_type: "anonymous",
		credential_types_supported: ["none"],
		credential_issued: false,
		account_created: false,
		skill: skillUrl,
		resource: ORIGIN,
		register_uri: registerUri,
		claim_uri: claimUri,
		revocation_uri: revocationUri,
		contact: "mailto:info@lucabertelli.consulting",
		privacy: [privacyEn, privacyIt],
		message:
			"This origin stores no agent credential to revoke. To ask for deletion of email you sent, write to info@lucabertelli.consulting.",
	};
}

export function jsonText(value: unknown): string {
	return `${JSON.stringify(value, null, 2)}\n`;
}

/** Paths relative to `public/` and `dist/client/`. `/agent/auth`, `/a2a/v1`, `/mcp`, `/acp`, and path-suffixed protected resource metadata are worker-only. */
export function fileBodies(): Record<string, string> {
	return {
		"auth.md": authMarkdown(),
		".well-known/oauth-protected-resource": jsonText(protectedResourceMetadata()),
		".well-known/oauth-authorization-server": jsonText(authorizationServerMetadata()),
		[AGENT_CARD_PATH.replace(/^\//, "")]: agentCardText(),
		[MCP_CARD_PATH.replace(/^\//, "")]: mcpCardText(),
		[ACP_PATH.replace(/^\//, "")]: acpDocumentText(),
		"agent/auth/register": jsonText(registrationDocument()),
		"agent/auth/claim": jsonText(claimDocument()),
		"agent/auth/revoke": jsonText(revocationDocument()),
	};
}

interface Route {
	body: string;
	contentType: string;
	allow: string;
	post: boolean;
}

function routes(): Record<string, Route> {
	const files = fileBodies();
	const document = (body: string): Route => ({
		body,
		contentType: MARKDOWN,
		allow: DOCUMENT_ALLOW,
		post: false,
	});
	const jsonDocument = (body: string): Route => ({
		body,
		contentType: JSON_TYPE,
		allow: DOCUMENT_ALLOW,
		post: false,
	});
	const agent = (body: string): Route => ({
		body,
		contentType: JSON_TYPE,
		allow: AGENT_ALLOW,
		post: true,
	});
	return {
		[PATHS.authMd]: document(files["auth.md"]),
		[PATHS.authorizationServer]: jsonDocument(files[".well-known/oauth-authorization-server"]),
		[PATHS.registerAlias]: agent(files["agent/auth/register"]),
		[PATHS.register]: agent(files["agent/auth/register"]),
		[PATHS.claim]: agent(files["agent/auth/claim"]),
		[PATHS.revoke]: agent(files["agent/auth/revoke"]),
	};
}

function normalizePath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
	return pathname;
}

/**
 * RFC 9728 inserts `/.well-known/oauth-protected-resource` between the host and
 * the resource path. The returned identifier keeps the request path and query,
 * including a trailing slash.
 */
export function resourceIdentifierFromMetadataPath(url: URL): string | null {
	const { pathname, search } = url;
	const prefix = PATHS.protectedResource;
	if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) return null;
	const suffix = pathname.slice(prefix.length);
	let decoded: string;
	try {
		decoded = decodeURIComponent(suffix);
	} catch {
		return null;
	}
	if (decoded.split("/").some((segment) => segment === "." || segment === "..")) return null;
	if (/[\u0000-\u001f\u007f\\]/.test(decoded)) return null;
	return `${ORIGIN}${suffix}${search}`;
}

/** Metadata URL for a resource identifier, per RFC 9728 section 3. */
export function protectedResourceMetadataUrl(resourceUrl: string): string {
	const url = new URL(resourceUrl);
	const suffix = url.pathname === "/" ? "" : url.pathname;
	return `${url.origin}${PATHS.protectedResource}${suffix}${url.search}`;
}

function protectedResourceRoute(resource: string): Route {
	return {
		body: jsonText(protectedResourceMetadata(resource)),
		contentType: JSON_TYPE,
		allow: DOCUMENT_ALLOW,
		post: false,
	};
}

async function discardBody(request: Request): Promise<void> {
	if (request.body === null) return;
	try {
		await request.body.cancel();
	} catch {
		// The body is discarded on purpose. Registration stores nothing.
	}
}

/**
 * Public discovery response, or null when this request is not one of those routes.
 * The request body is never read.
 */
export async function discoveryResponse(request: Request): Promise<Response | null> {
	const url = new URL(request.url);
	const resource = resourceIdentifierFromMetadataPath(url);
	const route = resource === null ? routes()[normalizePath(url.pathname)] : protectedResourceRoute(resource);
	if (!route) return null;

	await discardBody(request);

	const method = request.method.toUpperCase();
	if (method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: { allow: route.allow },
		});
	}
	if (method !== "GET" && method !== "HEAD" && !(method === "POST" && route.post)) {
		return new Response(jsonText({ error: "method_not_allowed" }), {
			status: 405,
			headers: {
				"content-type": JSON_TYPE,
				allow: route.allow,
				"cache-control": "no-store",
			},
		});
	}

	const headers = new Headers({
		"content-type": route.contentType,
		allow: route.allow,
		"cache-control": method === "POST" ? "no-store" : "public, max-age=3600",
	});
	if (method === "HEAD") {
		headers.set("content-length", String(new TextEncoder().encode(route.body).byteLength));
		return new Response(null, { status: 200, headers });
	}
	return new Response(route.body, { status: 200, headers });
}

/**
 * On 401, add the RFC 9728 `resource_metadata` challenge for the requested URL.
 * Other statuses are returned as they are. Public pages do not use this.
 */
export function withProtectedResourceChallenge(request: Request, response: Response): Response {
	if (response.status !== 401) return response;
	const existing = response.headers.get("WWW-Authenticate");
	if (existing?.includes("resource_metadata=")) return response;
	const headers = new Headers(response.headers);
	const challenge = `Bearer resource_metadata="${protectedResourceMetadataUrl(request.url)}"`;
	if (existing) headers.append("WWW-Authenticate", challenge);
	else headers.set("WWW-Authenticate", challenge);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export function assertDiscovery(): void {
	const errors: string[] = [];
	const markdown = authMarkdown();
	const firstLine = markdown.split("\n")[0];
	if (firstLine !== "# auth.md") {
		errors.push(`auth.md H1 must be exactly "# auth.md", got ${JSON.stringify(firstLine)}`);
	}
	const h1Count = markdown.split("\n").filter((line) => line.startsWith("# ")).length;
	if (h1Count !== 1) errors.push(`auth.md has ${h1Count} H1 headings`);

	const prmUrl = `${ORIGIN}${PATHS.protectedResource}`;
	const englishPrmUrl = `${prmUrl}/en/`;
	const asUrl = `${ORIGIN}${PATHS.authorizationServer}`;
	const accessMetadataUrl = `${ACCESS_ISSUER}/.well-known/oauth-authorization-server`;
	for (const url of [
		prmUrl,
		englishPrmUrl,
		asUrl,
		accessMetadataUrl,
		registerUri,
		claimUri,
		revocationUri,
		AGENT_CARD_URL,
		A2A_URL,
		MCP_CARD_URL,
		MCP_URL,
		DIRECTORY_URL,
	]) {
		if (!markdown.includes(`](${url})`)) {
			errors.push(`auth.md is missing an absolute markdown link to ${url}`);
		}
	}
	if (!AGENT_CARD_URL.startsWith(`${ORIGIN}/`) || !A2A_URL.startsWith(`${ORIGIN}/`)) {
		errors.push("A2A URLs must use this origin");
	}
	if (markdown.includes("`/.well-known/oauth-protected-resource`")) {
		errors.push("auth.md wraps the PRM path in a code span; scanners miss that");
	}
	if (!markdown.includes("search_site") || !markdown.includes("document.modelContext.registerTool")) {
		errors.push("auth.md must describe the WebMCP tools");
	}

	const prm = protectedResourceMetadata();
	if (prm.resource !== ORIGIN) errors.push("PRM resource must be the site origin");
	if (prm.authorization_servers[0] !== ACCESS_ISSUER || !prm.authorization_servers.includes(ORIGIN)) {
		errors.push("PRM authorization_servers must list Cloudflare Access, then this origin");
	}
	if (prm.authorization_servers.length !== 2) {
		errors.push("PRM authorization_servers must be Access and this origin");
	}
	const englishResource = `${ORIGIN}/en/`;
	if (protectedResourceMetadata(englishResource).resource !== englishResource) {
		errors.push("path-specific PRM must echo the resource identifier");
	}
	if (!prm.scopes_supported.includes(SCOPE)) errors.push("PRM scopes_supported is missing read");
	if (!prm.bearer_methods_supported.includes("header")) {
		errors.push('PRM bearer_methods_supported must include "header"');
	}

	const authorizationServer = authorizationServerMetadata();
	if (authorizationServer.issuer !== ORIGIN) errors.push("issuer must be the site origin");
	if (!prm.authorization_servers.includes(authorizationServer.issuer)) {
		errors.push("issuer does not match PRM authorization_servers");
	}
	if (authorizationServer.grant_types_supported.length !== 0) {
		errors.push("grant_types_supported must stay empty; this issuer does not issue tokens");
	}
	if (
		"authorization_endpoint" in authorizationServer ||
		"token_endpoint" in authorizationServer
	) {
		errors.push("do not advertise an authorization or token endpoint");
	}

	const agent = authorizationServer.agent_auth;
	if (agent.skill !== skillUrl) errors.push("agent_auth.skill must point at /auth.md");
	if (agent.register_uri !== registerUri || agent.identity_endpoint !== registerUri) {
		errors.push("register_uri and identity_endpoint must be the registration URL");
	}
	if (!agent.identity_types_supported.includes("anonymous")) {
		errors.push("identity_types_supported must include anonymous");
	}
	if (agent.identity_types_supported.length !== 1) {
		errors.push("anonymous is the only supported identity type");
	}
	if (
		agent.anonymous.credential_types_supported.length !== 1 ||
		agent.anonymous.credential_types_supported[0] !== "none"
	) {
		errors.push('anonymous.credential_types_supported must be ["none"]');
	}
	if (agent.claim_uri !== claimUri || agent.anonymous.claim_uri !== claimUri) {
		errors.push("claim_uri must be the claim URL");
	}
	if (agent.claim_endpoint !== claimUri) errors.push("claim_endpoint must repeat claim_uri");
	if (agent.revocation_uri !== revocationUri) errors.push("revocation_uri must be the revocation URL");
	if (JSON.stringify(prm.agent_auth) !== JSON.stringify(agent)) {
		errors.push("agent_auth on the PRM and the authorization server drifted");
	}

	const serialized = JSON.stringify({ prm, authorizationServer });
	if (serialized.includes("id-jag") || serialized.includes("verified_email")) {
		errors.push("metadata advertises an identity assertion this site does not accept");
	}

	const files = fileBodies();
	for (const [rel, body] of Object.entries(files)) {
		if (!body.endsWith("\n")) errors.push(`${rel} must end with a newline`);
		if (rel.endsWith(".md")) continue;
		try {
			JSON.parse(body);
		} catch (error) {
			errors.push(`${rel} is not JSON (${error instanceof Error ? error.message : error})`);
		}
	}
	if (JSON.stringify(JSON.parse(files[".well-known/oauth-protected-resource"])) !== JSON.stringify(prm)) {
		errors.push("PRM file body drifted from protectedResourceMetadata()");
	}
	if (
		JSON.stringify(JSON.parse(files[".well-known/oauth-authorization-server"])) !==
		JSON.stringify(authorizationServer)
	) {
		errors.push("authorization server file body drifted");
	}

	if (errors.length > 0) throw new Error(errors.join("\n"));
}

export async function assertDiscoveryResponses(): Promise<void> {
	assertDiscovery();
	const errors: string[] = [];
	const sentinel = "super-secret-assertion-sentinel";
	const post = await discoveryResponse(
		new Request(registerUri, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ assertion: sentinel, type: "identity_assertion" }),
		}),
	);
	if (!post) errors.push("POST register returned no discovery response");
	else {
		const text = await post.text();
		if (post.status !== 200) errors.push(`POST register status ${post.status}`);
		if (post.headers.get("content-type") !== JSON_TYPE) errors.push("POST register content-type");
		if (text.includes(sentinel)) errors.push("registration response echoed the request body");
		if (JSON.parse(text).registration_required !== false) {
			errors.push("POST register must say registration is not required");
		}
	}

	const alias = await discoveryResponse(new Request(`${ORIGIN}${PATHS.registerAlias}`));
	const canonical = await discoveryResponse(new Request(registerUri));
	if (!alias || !canonical) errors.push("register alias or canonical route missing");
	else if ((await alias.text()) !== (await canonical.text())) {
		errors.push("/agent/auth and /agent/auth/register diverged");
	}

	const auth = await discoveryResponse(new Request(skillUrl));
	if (!auth) errors.push("GET /auth.md missing");
	else {
		if (auth.headers.get("content-type") !== MARKDOWN) errors.push("auth.md content-type");
		const text = await auth.text();
		if (!text.startsWith("# auth.md\n")) errors.push("served auth.md lost its H1");
	}

	const head = await discoveryResponse(new Request(skillUrl, { method: "HEAD" }));
	if (!head) errors.push("HEAD /auth.md missing");
	else {
		const length = Number(head.headers.get("content-length"));
		if (length !== new TextEncoder().encode(authMarkdown()).byteLength) {
			errors.push("HEAD /auth.md content-length does not match the body");
		}
		if (await head.text()) errors.push("HEAD /auth.md included a body");
	}

	const postedMarkdown = await discoveryResponse(new Request(skillUrl, { method: "POST" }));
	if (!postedMarkdown || postedMarkdown.status !== 405) errors.push("POST /auth.md must be 405");

	const removed = await discoveryResponse(new Request(revocationUri, { method: "DELETE" }));
	if (!removed || removed.status !== 405) errors.push("DELETE revoke must be 405");
	else if (!removed.headers.get("allow")?.includes("POST")) {
		errors.push("405 must advertise the allowed methods");
	}

	const options = await discoveryResponse(new Request(claimUri, { method: "OPTIONS" }));
	if (!options || options.status !== 204) errors.push("OPTIONS claim must be 204");

	const ignored = await discoveryResponse(new Request(`${ORIGIN}/en/`));
	if (ignored !== null) errors.push("discovery handler must ignore site pages");

	const slashed = await discoveryResponse(new Request(`${registerUri}/`));
	if (!slashed || slashed.status !== 200) errors.push("trailing slash on register must still answer");

	const englishResource = `${ORIGIN}/en/`;
	const englishMetadata = `${ORIGIN}${PATHS.protectedResource}/en/`;
	const english = await discoveryResponse(new Request(englishMetadata));
	if (!english || english.status !== 200) errors.push("GET English homepage PRM must be 200");
	else {
		if (english.headers.get("content-type") !== JSON_TYPE) {
			errors.push("English homepage PRM content-type");
		}
		const body = JSON.parse(await english.text()) as ReturnType<typeof protectedResourceMetadata>;
		if (body.resource !== englishResource) {
			errors.push(`English homepage PRM resource is ${body.resource}`);
		}
		if (body.authorization_servers[0] !== ACCESS_ISSUER || !body.authorization_servers.includes(ORIGIN)) {
			errors.push("English homepage PRM authorization_servers drifted");
		}
		if (!body.scopes_supported.includes(SCOPE)) errors.push("English homepage PRM is missing read");
	}
	if (protectedResourceMetadataUrl(englishResource) !== englishMetadata) {
		errors.push("metadata URL insertion does not round-trip the English homepage");
	}
	const identifier = resourceIdentifierFromMetadataPath(new URL(englishMetadata));
	if (identifier !== englishResource) {
		errors.push(`metadata path did not restore ${englishResource}`);
	}

	const queried = await discoveryResponse(
		new Request(`${ORIGIN}${PATHS.protectedResource}/it/?lang=it`),
	);
	if (!queried) errors.push("query on a path-specific PRM must still answer");
	else if (JSON.parse(await queried.text()).resource !== `${ORIGIN}/it/?lang=it`) {
		errors.push("path-specific PRM must keep the query in resource");
	}

	const escapedDot = await discoveryResponse(
		new Request(`${ORIGIN}${PATHS.protectedResource}/%2e%2e/secret`),
	);
	if (escapedDot !== null) errors.push("dot segments must not publish protected resource metadata");

	const challenged = withProtectedResourceChallenge(
		new Request(englishResource),
		new Response("no", { status: 401 }),
	);
	const challenge = `Bearer resource_metadata="${englishMetadata}"`;
	if (challenged.headers.get("WWW-Authenticate") !== challenge) {
		errors.push(`401 challenge was ${challenged.headers.get("WWW-Authenticate")}`);
	}
	const open = withProtectedResourceChallenge(new Request(englishResource), new Response("ok"));
	if (open.headers.get("WWW-Authenticate")) errors.push("200 must not send WWW-Authenticate");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
