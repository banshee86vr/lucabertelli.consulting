/**
 * x402 payment challenge for the public consulting practice.
 *
 * The isitagentready scan requests GET /api and passes when that response is
 * 402 and the PAYMENT-REQUIRED header is a v2 PaymentRequired object.
 * @x402/hono builds that challenge. The public facilitator settles Base
 * Sepolia only, so the route does not offer mainnet USDC. The payTo address
 * is published here and its key is not stored: this origin does not custody
 * a wallet. Consulting work is still priced in a written proposal.
 */

import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware } from "@x402/hono";
import { Hono } from "hono";
import { ORIGIN } from "./agent-card.ts";

export const X402_PATH = "/api";
export const X402_URL = `${ORIGIN}${X402_PATH}`;
export const FACILITATOR_URL = "https://x402.org/facilitator";
export const X402_NETWORK = "eip155:84532" as const;
export const X402_SCHEME = "exact";
export const X402_PRICE = "$0.001";
export const X402_AMOUNT = "1000";
export const X402_ASSET = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
export const X402_PAY_TO = "0x2C2E3d99BeD343A0499c5b68CeedeFaE64DE6510";

const JSON_TYPE = "application/json; charset=utf-8";
const ALLOW = "GET, HEAD, POST, OPTIONS";
const MAX_BODY = 65_536;
const EXPOSE = "PAYMENT-REQUIRED, PAYMENT-RESPONSE";

export const X402_DESCRIPTION =
	"x402 acknowledgement for Luca Bertelli Consulting. The price is 0.001 USDC on Base Sepolia. Consulting scope is a written proposal. This route does not store the request body.";

const PAID_MESSAGE =
	"This response is the x402 acknowledgement for this resource. Consulting work is priced in a written proposal. Write to info@lucabertelli.consulting.";

interface PaymentRequiredHeader {
	x402Version?: number;
	resource?: { url?: string; description?: string; mimeType?: string };
	accepts?: {
		scheme?: string;
		network?: string;
		amount?: string;
		asset?: string;
		payTo?: string;
		maxTimeoutSeconds?: number;
	}[];
}

function paymentOption() {
	return {
		scheme: X402_SCHEME,
		price: X402_PRICE,
		network: X402_NETWORK,
		payTo: X402_PAY_TO,
	};
}

function routeConfig() {
	return {
		accepts: paymentOption(),
		description: X402_DESCRIPTION,
		mimeType: "application/json",
		serviceName: "Luca Bertelli Consulting",
		unpaidResponseBody: () => ({
			contentType: JSON_TYPE,
			body: {
				error: "payment_required",
				message:
					"Send a PAYMENT-SIGNATURE header that satisfies the PAYMENT-REQUIRED challenge. This route does not store the request body.",
			},
		}),
	};
}

// Built on the first protected request. The middleware calls the facilitator
// as it is constructed, and that fetch is illegal in Workers module scope.
let app: Hono | null = null;

function paymentApp(): Hono {
	if (app) return app;
	const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
	const resourceServer = new x402ResourceServer(facilitatorClient).register(X402_NETWORK, new ExactEvmScheme());
	const routes = new Hono();
	routes.use(
		paymentMiddleware(
			{
				"GET /api": routeConfig(),
				"HEAD /api": routeConfig(),
				"POST /api": routeConfig(),
			},
			resourceServer,
		),
	);
	routes.on(["GET", "HEAD", "POST"], "/api", (c) =>
		c.json({
			service: "Luca Bertelli Consulting",
			resource: X402_URL,
			contact: "mailto:info@lucabertelli.consulting",
			message: PAID_MESSAGE,
		}),
	);
	app = routes;
	return routes;
}

function apiPath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
	return pathname;
}

function jsonResponse(status: number, body: unknown, allow: string): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": JSON_TYPE,
			allow,
			"cache-control": "no-store",
			"access-control-allow-origin": "*",
			"access-control-expose-headers": EXPOSE,
		},
	});
}

async function drainLimited(request: Request, max: number): Promise<"ok" | "too_large" | "unreadable"> {
	if (request.body === null) return "ok";
	const reader = request.body.getReader();
	let total = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (!value) continue;
			total += value.byteLength;
			if (total > max) {
				await reader.cancel();
				return "too_large";
			}
		}
		return "ok";
	} catch {
		await reader.cancel().catch(() => undefined);
		return "unreadable";
	}
}

function withAgentCors(response: Response, method: string): Response {
	const headers = new Headers(response.headers);
	headers.set("access-control-allow-origin", "*");
	if (!headers.get("access-control-expose-headers")?.includes("PAYMENT-REQUIRED")) {
		headers.set("access-control-expose-headers", EXPOSE);
	}
	headers.set("access-control-allow-methods", ALLOW);
	if (method === "HEAD") {
		return new Response(null, { status: response.status, statusText: response.statusText, headers });
	}
	return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function paymentRequest(request: Request): Request {
	const url = new URL(request.url);
	url.pathname = apiPath(url.pathname);
	const headers = new Headers(request.headers);
	headers.delete("content-length");
	headers.delete("transfer-encoding");
	return new Request(url, { method: request.method, headers });
}

export async function x402Response(request: Request): Promise<Response | null> {
	const url = new URL(request.url);
	if (apiPath(url.pathname) !== X402_PATH) return null;

	const method = request.method.toUpperCase();
	const declared = request.headers.get("content-length");
	if (declared !== null) {
		const size = Number(declared);
		if (!Number.isInteger(size) || size < 0) {
			await drainLimited(request, MAX_BODY);
			return jsonResponse(400, { error: "invalid_request", message: "Content-Length is invalid." }, ALLOW);
		}
		if (size > MAX_BODY) {
			await drainLimited(request, MAX_BODY);
			return jsonResponse(413, { error: "payload_too_large", message: "Request body is larger than 64 KiB." }, ALLOW);
		}
	}
	const drained = await drainLimited(request, MAX_BODY);
	if (drained === "too_large") {
		return jsonResponse(413, { error: "payload_too_large", message: "Request body is larger than 64 KiB." }, ALLOW);
	}
	if (drained === "unreadable") {
		return jsonResponse(400, { error: "invalid_request", message: "Request body could not be read." }, ALLOW);
	}

	if (method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: {
				allow: ALLOW,
				"access-control-allow-origin": "*",
				"access-control-allow-methods": ALLOW,
				"access-control-allow-headers": "PAYMENT-SIGNATURE, Content-Type, Accept",
				"access-control-expose-headers": EXPOSE,
				"access-control-max-age": "86400",
				"cache-control": "no-store",
			},
		});
	}
	if (method !== "GET" && method !== "HEAD" && method !== "POST") {
		return jsonResponse(405, { error: "method_not_allowed", message: "Method not allowed." }, ALLOW);
	}

	const response = await paymentApp().fetch(paymentRequest(request));
	return withAgentCors(response, method);
}

function decodeHeader(header: string): PaymentRequiredHeader {
	const json = new TextDecoder().decode(Uint8Array.from(atob(header), (char) => char.charCodeAt(0)));
	return JSON.parse(json) as PaymentRequiredHeader;
}

export async function assertX402Responses(): Promise<void> {
	const errors: string[] = [];
	if (FACILITATOR_URL !== "https://x402.org/facilitator") errors.push("facilitator URL drifted");
	if (X402_NETWORK !== "eip155:84532" || X402_SCHEME !== "exact" || X402_PRICE !== "$0.001") {
		errors.push("x402 price or network drifted");
	}
	if (!/^0x[0-9a-fA-F]{40}$/.test(X402_PAY_TO)) errors.push("payTo is not an EVM address");

	const probe = await x402Response(new Request(X402_URL));
	if (!probe || probe.status !== 402) errors.push("GET /api must be 402");
	else {
		const header = probe.headers.get("payment-required");
		if (!header) errors.push("GET /api is missing PAYMENT-REQUIRED");
		else {
			let decoded: PaymentRequiredHeader;
			try {
				decoded = decodeHeader(header);
			} catch (error) {
				errors.push(`PAYMENT-REQUIRED is not base64 JSON (${error instanceof Error ? error.message : error})`);
				decoded = {};
			}
			if (decoded.x402Version !== 2) errors.push("PAYMENT-REQUIRED x402Version must be 2");
			if (decoded.resource?.url !== X402_URL) errors.push("PAYMENT-REQUIRED resource url drifted");
			if (decoded.resource?.description !== X402_DESCRIPTION) errors.push("PAYMENT-REQUIRED description drifted");
			const offer = decoded.accepts?.[0];
			if (!offer) errors.push("PAYMENT-REQUIRED accepts is empty");
			else {
				if (offer.scheme !== X402_SCHEME) errors.push("accepts scheme drifted");
				if (offer.network !== X402_NETWORK) errors.push("accepts network drifted");
				if (offer.amount !== X402_AMOUNT) errors.push("accepts amount drifted");
				if (offer.asset !== X402_ASSET) errors.push("accepts asset drifted");
				if (offer.payTo !== X402_PAY_TO) errors.push("accepts payTo drifted");
				if (typeof offer.maxTimeoutSeconds !== "number" || offer.maxTimeoutSeconds <= 0) {
					errors.push("accepts maxTimeoutSeconds is missing");
				}
			}
		}
		const text = await probe.text();
		if (!text.includes("payment_required")) errors.push("402 body must name payment_required");
		if (text.includes(PAID_MESSAGE)) errors.push("unpaid 402 returned the settled acknowledgement");
		if (probe.headers.get("cache-control") !== "no-store") errors.push("402 must not be cached");
		if (!probe.headers.get("access-control-expose-headers")?.includes("PAYMENT-REQUIRED")) {
			errors.push("402 must expose PAYMENT-REQUIRED");
		}
	}

	const sentinel = "4242424242424242";
	const posted = await x402Response(
		new Request(X402_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ message: sentinel, card: sentinel }),
		}),
	);
	if (!posted || posted.status !== 402) errors.push("POST /api must be 402");
	else if ((await posted.text()).includes(sentinel)) errors.push("402 echoed the request body");

	const head = await x402Response(new Request(`${X402_URL}/`, { method: "HEAD" }));
	if (!head || head.status !== 402) errors.push("HEAD /api must be 402");
	else if (await head.text()) errors.push("HEAD included a body");

	const options = await x402Response(new Request(X402_URL, { method: "OPTIONS" }));
	if (!options || options.status !== 204) errors.push("OPTIONS /api must be 204");

	const oversized = "x".repeat(MAX_BODY + 1);
	const tooBig = await x402Response(
		new Request(X402_URL, {
			method: "POST",
			headers: { "content-type": "application/json", "content-length": String(oversized.length) },
			body: oversized,
		}),
	);
	if (!tooBig || tooBig.status !== 413) errors.push("oversized POST must be 413");
	else if ((await tooBig.text()).includes("xxxx")) errors.push("413 echoed the request body");

	const forged = await x402Response(
		new Request(X402_URL, {
			headers: { "payment-signature": btoa("{}") },
		}),
	);
	if (!forged || forged.status !== 402) errors.push("a forged PAYMENT-SIGNATURE must stay 402");
	else if ((await forged.text()).includes(PAID_MESSAGE)) errors.push("forged payment unlocked the acknowledgement");

	if ((await x402Response(new Request(`${ORIGIN}/api/v1`))) !== null) errors.push("x402 handler must ignore /api/v1");
	if ((await x402Response(new Request(`${ORIGIN}/api/engagement`))) !== null) {
		errors.push("x402 handler must ignore /api/engagement");
	}
	if ((await x402Response(new Request(`${ORIGIN}/en/`))) !== null) errors.push("x402 handler must ignore site pages");

	if (errors.length > 0) throw new Error(errors.join("\n"));
}
