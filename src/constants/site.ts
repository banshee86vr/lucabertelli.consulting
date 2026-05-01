/** Canonical site origin (no trailing slash). Override via PUBLIC_SITE_URL in env. */
export const SITE_URL = (
	import.meta.env.PUBLIC_SITE_URL ?? "https://lucabertelli.consulting"
).replace(/\/$/, "");
