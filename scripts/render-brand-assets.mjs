/**
 * Render the square LB mark and the default share cards.
 *
 * Run with `pnpm run brand-assets` after the monogram or the portrait changes.
 * The outputs are committed. The site build does not run this script.
 */
import { createRequire } from "node:module";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const PLATE = "#1c1d20";
const MARK = "#ffe24c";
const INK = "#ffffff";
const ROLE = "#e7e5e0";
const MARK_WIDTH = 116.42;
const MARK_HEIGHT = 113.58;
const INSET = 0.18;
const PATHS = [
	"m20.59,112.08H0V0h20.59v112.08Z",
	"m116.42,71.28c0,6.29-1.07,12.03-3.22,17.22-2.15,5.19-5.07,9.65-8.76,13.36-3.69,3.72-8.02,6.6-12.99,8.65-4.97,2.05-10.29,3.07-15.98,3.07s-10.94-1.05-15.91-3.14c-4.97-2.1-9.31-5.02-13.03-8.76-3.72-3.74-6.65-8.2-8.8-13.36-2.15-5.17-3.22-10.84-3.22-17.03V0h20.51v37.43c1.1-1.4,2.43-2.65,4.01-3.74,1.57-1.1,3.27-2,5.09-2.7,1.82-.7,3.71-1.24,5.65-1.61s3.84-.56,5.69-.56c5.69,0,11.02,1.06,15.98,3.18,4.97,2.12,9.3,5.08,12.99,8.87,3.69,3.79,6.61,8.27,8.76,13.44,2.15,5.17,3.22,10.82,3.22,16.96Zm-20.59,0c0-3.09-.54-5.98-1.61-8.65-1.07-2.67-2.53-4.98-4.38-6.93-1.85-1.95-4.01-3.47-6.48-4.57-2.47-1.1-5.1-1.65-7.9-1.65s-5.43.61-7.9,1.83c-2.47,1.22-4.63,2.84-6.48,4.87-1.85,2.02-3.29,4.34-4.34,6.96s-1.57,5.33-1.57,8.12c0,3.1.52,5.96,1.57,8.61,1.05,2.65,2.5,4.94,4.34,6.89,1.85,1.95,4.01,3.48,6.48,4.6s5.1,1.68,7.9,1.68,5.43-.56,7.9-1.68,4.63-2.66,6.48-4.6c1.85-1.95,3.31-4.24,4.38-6.89,1.07-2.65,1.61-5.51,1.61-8.61Z",
];

const CARD_W = 1200;
const CARD_H = 630;
const PHOTO_W = 520;
const RULE_W = 4;

/** Schema job titles, wrapped so each line stays inside the text column. */
const CARDS = [
	{
		file: "public/og/en.jpg",
		role: "Cloud Native and Platform Engineering Consultant",
		lines: ["Cloud Native and Platform", "Engineering Consultant"],
	},
	{
		file: "public/og/it.jpg",
		role: "Consulente Cloud Native e Platform Engineering",
		lines: ["Consulente Cloud Native", "e Platform Engineering"],
	},
];

function fontFile(pkg, file) {
	const pkgRoot = dirname(require.resolve(`${pkg}/package.json`));
	return join(pkgRoot, "files", file);
}

/** resvg reads sfnt fonts. fontsource ships WOFF, so expand each face once per run. */
function woffToSfnt(woff) {
	if (woff.toString("ascii", 0, 4) !== "wOFF") throw new Error("font is not WOFF");
	const numTables = woff.readUInt16BE(12);
	const tables = [];
	let dir = 44;
	for (let i = 0; i < numTables; i++) {
		const tag = woff.subarray(dir, dir + 4);
		const offset = woff.readUInt32BE(dir + 4);
		const compLength = woff.readUInt32BE(dir + 8);
		const origLength = woff.readUInt32BE(dir + 12);
		const origChecksum = woff.readUInt32BE(dir + 16);
		const compressed = woff.subarray(offset, offset + compLength);
		const data = compLength === origLength ? Buffer.from(compressed) : inflateSync(compressed);
		if (data.length !== origLength) {
			throw new Error(`font table ${tag.toString("ascii")} expanded to ${data.length}, expected ${origLength}`);
		}
		tables.push({ tag, origChecksum, data });
		dir += 20;
	}
	tables.sort((a, b) => Buffer.compare(a.tag, b.tag));
	const searchRange = 2 ** Math.floor(Math.log2(numTables)) * 16;
	const entrySelector = Math.floor(Math.log2(numTables));
	const rangeShift = numTables * 16 - searchRange;
	const header = Buffer.alloc(12);
	header.writeUInt32BE(woff.readUInt32BE(4), 0);
	header.writeUInt16BE(numTables, 4);
	header.writeUInt16BE(searchRange, 6);
	header.writeUInt16BE(entrySelector, 8);
	header.writeUInt16BE(rangeShift, 10);
	let tableOffset = 12 + numTables * 16;
	const directory = Buffer.alloc(numTables * 16);
	const bodies = [];
	tables.forEach((table, index) => {
		const at = index * 16;
		table.tag.copy(directory, at);
		directory.writeUInt32BE(table.origChecksum, at + 4);
		directory.writeUInt32BE(tableOffset, at + 8);
		directory.writeUInt32BE(table.data.length, at + 12);
		const pad = (4 - (table.data.length % 4)) % 4;
		bodies.push(Buffer.concat([table.data, Buffer.alloc(pad)]));
		tableOffset += table.data.length + pad;
	});
	return Buffer.concat([header, directory, ...bodies]);
}

const fontDir = mkdtempSync(join(tmpdir(), "brand-fonts-"));
const fontFiles = [
	["@fontsource/plus-jakarta-sans", "plus-jakarta-sans-latin-500-normal.woff"],
	["@fontsource/plus-jakarta-sans", "plus-jakarta-sans-latin-600-normal.woff"],
	["@fontsource/plus-jakarta-sans", "plus-jakarta-sans-latin-700-normal.woff"],
	["@fontsource/space-grotesk", "space-grotesk-latin-500-normal.woff"],
	["@fontsource/space-grotesk", "space-grotesk-latin-700-normal.woff"],
].map(([pkg, file]) => {
	const dest = join(fontDir, file.replace(/\.woff$/, ".ttf"));
	writeFileSync(dest, woffToSfnt(readFileSync(fontFile(pkg, file))));
	return dest;
});

const num = (value) => Number(value.toFixed(4));

function markPaths(fill) {
	return PATHS.map((d) => `<path fill="${fill}" d="${d}"/>`).join("");
}

/** Square plate with the mark inset so a circular crop still contains it. */
function iconSvg(size) {
	const inner = size * (1 - INSET * 2);
	const scale = inner / MARK_WIDTH;
	const drawnW = MARK_WIDTH * scale;
	const drawnH = MARK_HEIGHT * scale;
	const x = (size - drawnW) / 2;
	const y = (size - drawnH) / 2;
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${PLATE}"/>
  <g transform="translate(${num(x)} ${num(y)}) scale(${num(scale)})">
    ${markPaths(MARK)}
  </g>
</svg>
`;
}

function cardSvg(lines) {
	const textX = PHOTO_W + RULE_W + 64;
	const markBox = 52;
	const scale = markBox / MARK_WIDTH;
	const markH = MARK_HEIGHT * scale;
	const eyebrow = 16;
	const name = 58;
	const role = 26;
	const roleStep = 36;
	const block = markH + 28 + eyebrow + 22 + name + 20 + roleStep + role;
	let y = Math.round((CARD_H - block) / 2);
	const markY = y;
	y += markH + 28 + eyebrow;
	const eyebrowY = y;
	y += 22 + name;
	const nameY = y;
	y += 20 + role;
	const roleY = y;
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
  <g transform="translate(${textX} ${num(markY)}) scale(${num(scale)})">
    ${markPaths(MARK)}
  </g>
  <text x="${textX}" y="${eyebrowY}" fill="${MARK}" font-family="Plus Jakarta Sans" font-weight="600" font-size="${eyebrow}" letter-spacing="1.4">Luca Bertelli Consulting</text>
  <text x="${textX}" y="${nameY}" fill="${INK}" font-family="Space Grotesk" font-weight="700" font-size="${name}">Luca Bertelli</text>
  <text x="${textX}" y="${roleY}" fill="${ROLE}" font-family="Plus Jakarta Sans" font-weight="500" font-size="${role}">${lines[0]}</text>
  <text x="${textX}" y="${roleY + roleStep}" fill="${ROLE}" font-family="Plus Jakarta Sans" font-weight="500" font-size="${role}">${lines[1]}</text>
</svg>
`;
}

function renderSvg(svg, width) {
	const resvg = new Resvg(svg, {
		fitTo: { mode: "width", value: width },
		textRendering: 1,
		shapeRendering: 2,
		font: {
			fontFiles,
			loadSystemFonts: false,
			defaultFontFamily: "Plus Jakarta Sans",
			sansSerifFamily: "Plus Jakarta Sans",
		},
	});
	const rendered = resvg.render();
	return { png: rendered.asPng(), width: rendered.width, height: rendered.height };
}

function icoFromPngs(images) {
	const count = images.length;
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(count, 4);
	let offset = 6 + count * 16;
	const entries = [];
	for (const { size, png } of images) {
		const entry = Buffer.alloc(16);
		entry.writeUInt8(size >= 256 ? 0 : size, 0);
		entry.writeUInt8(size >= 256 ? 0 : size, 1);
		entry.writeUInt16LE(1, 4);
		entry.writeUInt16LE(32, 6);
		entry.writeUInt32LE(png.length, 8);
		entry.writeUInt32LE(offset, 12);
		entries.push(entry);
		offset += png.length;
	}
	return Buffer.concat([header, ...entries, ...images.map((image) => image.png)]);
}

function writePublic(rel, data) {
	const dest = join(root, rel);
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, data);
}

async function assertPng(rel, width, height) {
	const meta = await sharp(join(root, rel)).metadata();
	if (meta.format !== "png" || meta.width !== width || meta.height !== height) {
		throw new Error(`${rel} is ${meta.format} ${meta.width}x${meta.height}, expected png ${width}x${height}`);
	}
	if (width !== height) throw new Error(`${rel} is not square`);
}

function contentImagePaths() {
	const paths = new Set(["/og/en.jpg", "/og/it.jpg"]);
	const files = [];
	const walk = (dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const full = join(dir, entry.name);
			if (entry.isDirectory()) walk(full);
			else if (entry.name.endsWith(".md")) files.push(full);
		}
	};
	walk(join(root, "src/content"));
	for (const file of files) {
		const text = readFileSync(file, "utf8");
		for (const match of text.matchAll(/^image:\s*["']([^"']+)["']/gm)) {
			paths.add(match[1]);
		}
	}
	return [...paths].sort();
}

function mimeOf(filePath) {
	if (filePath.endsWith(".webp")) return "image/webp";
	if (filePath.endsWith(".png")) return "image/png";
	if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
	throw new Error(`no MIME for ${filePath}`);
}

async function writeImageMeta() {
	const entries = [];
	for (const publicPath of contentImagePaths()) {
		const abs = join(root, "public", publicPath.replace(/^\//, ""));
		const meta = await sharp(abs).metadata();
		if (!meta.width || !meta.height) throw new Error(`${publicPath} has no pixel size`);
		entries.push(
			`\t${JSON.stringify(publicPath)}: { width: ${meta.width}, height: ${meta.height}, type: ${JSON.stringify(mimeOf(publicPath))} },`,
		);
	}
	const body = `/** Generated by scripts/render-brand-assets.mjs. Do not edit. */
export const ogImageMeta: Record<string, { width: number; height: number; type: string }> = {
${entries.join("\n")}
};
`;
	writeFileSync(join(root, "src/generated/og-image-meta.ts"), body);
}

async function main() {
	for (const card of CARDS) {
		if (card.lines.join(" ") !== card.role) {
			throw new Error(`role wrap drifted for ${card.file}`);
		}
	}

	const svg = iconSvg(64);
	writePublic("public/favicon.svg", svg);

	const sizes = [
		["public/icon-192.png", 192],
		["public/icon-512.png", 512],
		["public/apple-touch-icon.png", 180],
	];
	for (const [rel, size] of sizes) {
		const rendered = renderSvg(iconSvg(size), size);
		if (rendered.width !== size || rendered.height !== size) {
			throw new Error(`${rel} rendered ${rendered.width}x${rendered.height}`);
		}
		writePublic(rel, rendered.png);
		await assertPng(rel, size, size);
	}

	const icoImages = [];
	for (const size of [16, 32, 48]) {
		const rendered = renderSvg(iconSvg(size), size);
		if (rendered.width !== size || rendered.height !== size) {
			throw new Error(`favicon ${size} rendered ${rendered.width}x${rendered.height}`);
		}
		icoImages.push({ size, png: rendered.png });
	}
	const ico = icoFromPngs(icoImages);
	if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) {
		throw new Error("favicon.ico header is not an ICO");
	}
	writePublic("public/favicon.ico", ico);

	writePublic(
		"public/site.webmanifest",
		`${JSON.stringify(
			{
				name: "Luca Bertelli Consulting",
				short_name: "LB Consulting",
				icons: [
					{ src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
					{ src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
				],
				theme_color: PLATE,
				background_color: PLATE,
				display: "browser",
				start_url: "/en/",
			},
			null,
			2,
		)}\n`,
	);

	const portrait = join(root, "public/about/lucabertelli.jpeg");
	const photo = await sharp(portrait)
		.resize(PHOTO_W, CARD_H, { fit: "cover", position: "attention" })
		.toBuffer();
	const rule = await sharp({
		create: { width: RULE_W, height: CARD_H, channels: 3, background: MARK },
	})
		.png()
		.toBuffer();

	for (const card of CARDS) {
		const overlay = renderSvg(cardSvg(card.lines), CARD_W);
		if (overlay.width !== CARD_W || overlay.height !== CARD_H) {
			throw new Error(`${card.file} overlay is ${overlay.width}x${overlay.height}`);
		}
		const jpeg = await sharp({
			create: { width: CARD_W, height: CARD_H, channels: 3, background: PLATE },
		})
			.composite([
				{ input: photo, left: 0, top: 0 },
				{ input: rule, left: PHOTO_W, top: 0 },
				{ input: overlay.png, left: 0, top: 0 },
			])
			.jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" })
			.toBuffer();
		writePublic(card.file, jpeg);
		const meta = await sharp(join(root, card.file)).metadata();
		if (meta.format !== "jpeg" || meta.width !== CARD_W || meta.height !== CARD_H) {
			throw new Error(`${card.file} is ${meta.format} ${meta.width}x${meta.height}`);
		}
	}

	await writeImageMeta();
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => {
		rmSync(fontDir, { recursive: true, force: true });
	});
