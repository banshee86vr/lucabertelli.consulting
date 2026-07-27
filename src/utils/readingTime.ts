/** Rough adult silent-reading pace for technical prose. */
const WORDS_PER_MINUTE = 200;

export function wordCountFromBody(body: string | undefined | null): number {
	return String(body ?? "")
		.split(/\s+/)
		.filter(Boolean).length;
}

export function readingMinutes(wordCount: number): number {
	return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
