"""Generate the sponsor lockups used on team apparel.

Text is converted to outlines so print shops get files that do not depend on
installed fonts. Requires: pip install fonttools uharfbuzz cairosvg

    python3 docs/brand/sponsor/build.py
"""

import re
from pathlib import Path

import cairosvg
import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
FONTS = ROOT / "public/fonts/ClashDisplay"

NAME = "LUCA BERTELLI"
TAGLINE = "CONSULENZA CLOUD · DEVOPS · AI"
URL = "lucabertelli.consulting"
TAG_TRACKING = 0.05

YELLOW = "#ffe24c"
DARK = "#1c1d20"
WHITE = "#ffffff"

# The "lb" monogram, taken from the favicon so both stay identical.
MARK_W, MARK_H = 116.42, 113.58
MARK_PATHS = tuple(re.findall(r'<path fill="#ffe24c" d="([^"]+)"', (ROOT / "public/favicon.svg").read_text()))

# Colourways: (monogram, badge behind monogram or None, name, tagline, url).
COLOURWAYS = {
    "tessuto-scuro": (YELLOW, None, WHITE, YELLOW, WHITE),
    "tessuto-chiaro": (YELLOW, DARK, DARK, DARK, DARK),
    "mono-bianco": (WHITE, None, WHITE, WHITE, WHITE),
    "mono-nero": (DARK, None, DARK, DARK, DARK),
}
PREVIEW_BG = {
    "tessuto-scuro": "#14213d",
    "tessuto-chiaro": "#f2f2f2",
    "mono-bianco": "#b3202a",
    "mono-nero": "#f2f2f2",
}


class Font:
    def __init__(self, weight):
        path = FONTS / f"ClashDisplay-{weight}.ttf"
        self.tt = TTFont(path)
        self.upem = self.tt["head"].unitsPerEm
        self.cap = self.tt["OS/2"].sCapHeight / self.upem
        self.glyphs = self.tt.getGlyphSet()
        self.order = self.tt.getGlyphOrder()
        self.hb = hb.Font(hb.Face(path.read_bytes()))

    def shape(self, text, tracking=0.0):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, {"kern": True, "liga": False})
        track = tracking * self.upem
        glyphs, x = [], 0.0
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            glyphs.append((self.order[info.codepoint], x + pos.x_offset))
            x += pos.x_advance + track
        return glyphs, (x - track) / self.upem

    def width(self, text, size, tracking=0.0):
        return self.shape(text, tracking)[1] * size

    def path(self, text, size, x0, baseline, tracking=0.0):
        glyphs, _ = self.shape(text, tracking)
        scale = size / self.upem
        pen = SVGPathPen(self.glyphs)
        for name, gx in glyphs:
            transform = (scale, 0, 0, -scale, x0 + gx * scale, baseline)
            self.glyphs[name].draw(TransformPen(pen, transform))
        return pen.getCommands()


BOLD = Font("Bold")
SEMI = Font("Semibold")
MED = Font("Medium")


def fit_size(font, text, tracking, width):
    return width / font.width(text, 1.0, tracking)


def mark(x, y, h, colour, badge):
    """Monogram whose box (or badge, when given) is h tall at (x, y)."""
    parts = []
    if badge:
        parts.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{h:.2f}" height="{h:.2f}" fill="{badge}"/>')
        s = h * 0.64 / MARK_H
        mx, my = x + (h - MARK_W * s) / 2, y + (h - MARK_H * s) / 2
    else:
        s = h / MARK_H
        mx, my = x, y
    group = "".join(f'<path d="{d}"/>' for d in MARK_PATHS)
    parts.append(f'<g fill="{colour}" transform="translate({mx:.3f} {my:.3f}) scale({s:.5f})">{group}</g>')
    return "".join(parts), MARK_W * s if not badge else h


def text_path(font, text, size, x, baseline, colour, tracking=0.0):
    d = font.path(text, size, x, baseline, tracking)
    return f'<path fill="{colour}" d="{d}"/>'


def horizontal(cw, with_url):
    """Monogram on the left, justified text block on the right."""
    c_mark, badge, c_name, c_tag, c_url = COLOURWAYS[cw]
    h = 100.0
    mark_svg, mark_w = mark(0, 0, h, c_mark, badge)
    x = mark_w + h * 0.24

    name_cap = h * 0.48
    name_size = name_cap / BOLD.cap
    width = BOLD.width(NAME, name_size, 0.01)
    tag_size = fit_size(SEMI, TAGLINE, TAG_TRACKING, width)

    parts = [
        mark_svg,
        text_path(BOLD, NAME, name_size, x, name_cap, c_name, 0.01),
        text_path(SEMI, TAGLINE, tag_size, x, h, c_tag, TAG_TRACKING),
    ]
    total_w, total_h = x + width, h
    if with_url:
        url_size = fit_size(MED, URL, 0.03, total_w * 0.62)
        url_w = MED.width(URL, url_size, 0.03)
        total_h = h + h * 0.26 + url_size * MED.cap
        parts.append(text_path(MED, URL, url_size, (total_w - url_w) / 2, total_h, c_url, 0.03))
        total_h += url_size * 0.2
    return parts, total_w, total_h


def stacked(cw):
    """Monogram centred on top, text block below; for backs and sleeves."""
    c_mark, badge, c_name, c_tag, c_url = COLOURWAYS[cw]
    name_size = 60.0 / BOLD.cap
    width = BOLD.width(NAME, name_size, 0.01)
    tag_size = fit_size(SEMI, TAGLINE, TAG_TRACKING, width)
    url_size = fit_size(MED, URL, 0.02, width * 0.82)
    url_w = MED.width(URL, url_size, 0.02)

    mark_h = width * 0.30
    mark_svg, mark_w = mark(0, 0, mark_h, c_mark, badge)
    mark_svg = f'<g transform="translate({(width - mark_w) / 2:.2f} 0)">{mark_svg}</g>'

    y = mark_h + 44
    parts = [mark_svg]
    y += name_size * BOLD.cap
    parts.append(text_path(BOLD, NAME, name_size, 0, y, c_name, 0.01))
    y += 26 + tag_size * SEMI.cap
    parts.append(text_path(SEMI, TAGLINE, tag_size, 0, y, c_tag, TAG_TRACKING))
    y += 34 + url_size * MED.cap
    parts.append(text_path(MED, URL, url_size, (width - url_w) / 2, y, c_url, 0.02))
    # Descenders of "p" and "g" in the URL sit below the baseline.
    return parts, width, y + url_size * 0.2


def svg(parts, w, h, pad, bg=None):
    vw, vh = w + 2 * pad, h + 2 * pad
    back = f'<rect width="{vw:.2f}" height="{vh:.2f}" fill="{bg}"/>' if bg else ""
    body = "".join(parts)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw:.2f} {vh:.2f}" '
        f'width="{vw:.0f}" height="{vh:.0f}">{back}<g transform="translate({pad} {pad})">{body}</g></svg>\n'
    )


LAYOUTS = {
    "orizzontale": lambda cw: horizontal(cw, with_url=False),
    "orizzontale-sito": lambda cw: horizontal(cw, with_url=True),
    "verticale": stacked,
}


def write(name, markup, png_width):
    (OUT / "svg").mkdir(exist_ok=True)
    (OUT / "pdf").mkdir(exist_ok=True)
    (OUT / "png").mkdir(exist_ok=True)
    (OUT / "svg" / f"{name}.svg").write_text(markup)
    cairosvg.svg2pdf(bytestring=markup.encode(), write_to=str(OUT / "pdf" / f"{name}.pdf"))
    cairosvg.svg2png(
        bytestring=markup.encode(), write_to=str(OUT / "png" / f"{name}.png"), output_width=png_width, dpi=300
    )


def main():
    previews = []
    for layout, build in LAYOUTS.items():
        for cw in COLOURWAYS:
            parts, w, h = build(cw)
            pad = h * 0.08
            write(f"sponsor-{layout}-{cw}", svg(parts, w, h, pad), 3000)
            previews.append((layout, cw, parts, w, h))

    # Contact sheet showing each file on a representative fabric colour.
    cell_w, cell_h, margin = 900.0, 520.0, 30.0
    cols = len(COLOURWAYS)
    sheet = []
    for i, (layout, cw, parts, w, h) in enumerate(previews):
        col, row = i % cols, i // cols
        x, y = margin + col * (cell_w + margin), margin + row * (cell_h + margin)
        s = min((cell_w * 0.78) / w, (cell_h * 0.62) / h)
        ox, oy = x + (cell_w - w * s) / 2, y + (cell_h - h * s) / 2 - 18
        label_colour = DARK if PREVIEW_BG[cw] == "#f2f2f2" else WHITE
        sheet.append(f'<rect x="{x}" y="{y}" width="{cell_w}" height="{cell_h}" rx="18" fill="{PREVIEW_BG[cw]}"/>')
        sheet.append(f'<g transform="translate({ox:.2f} {oy:.2f}) scale({s:.4f})">{"".join(parts)}</g>')
        label = f"{layout} / {cw}"
        lw = MED.width(label, 22)
        sheet.append(text_path(MED, label, 22, x + (cell_w - lw) / 2, y + cell_h - 26, label_colour))
    rows = (len(previews) + cols - 1) // cols
    sw, sh = margin + cols * (cell_w + margin), margin + rows * (cell_h + margin)
    markup = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {sw} {sh}" width="{sw:.0f}" height="{sh:.0f}">'
        f'<rect width="{sw}" height="{sh}" fill="#ffffff"/>{"".join(sheet)}</svg>\n'
    )
    cairosvg.svg2png(bytestring=markup.encode(), write_to=str(OUT / "anteprima.png"), output_width=2400)
    mockup()


SHIRT = "M130 20Q200 62 270 20L362 52 404 158 342 182 330 146V440H70V146L58 182-4 158 38 52Z"


def placed(parts, w, h, cx, top, width):
    s = width / w
    return f'<g transform="translate({cx - width / 2:.2f} {top:.2f}) scale({s:.4f})">{"".join(parts)}</g>', h * s


def mockup():
    """Front and back of a jersey for each fabric colourway."""
    shirts = []
    for i, (cw, fabric, trim, number) in enumerate(
        (("tessuto-scuro", "#14213d", "#0d1730", WHITE), ("tessuto-chiaro", "#f4f4f4", "#d9d9d9", DARK))
    ):
        for j, side in enumerate(("fronte", "retro")):
            ox = 40 + (i * 2 + j) * 470
            body = [f'<path d="{SHIRT}" fill="{fabric}" stroke="{trim}" stroke-width="4"/>']
            neck = "M130 20Q200 62 270 20" if side == "fronte" else "M130 20Q200 36 270 20"
            body.append(f'<path d="{neck}" fill="none" stroke="{trim}" stroke-width="10"/>')
            if side == "fronte":
                logo, _ = placed(*horizontal(cw, with_url=False), 200, 120, 180)
                body.append(logo)
            else:
                size = 105 / BOLD.cap
                nw = BOLD.width("10", size)
                body.append(text_path(BOLD, "10", size, 200 - nw / 2, 190, number))
                logo, _ = placed(*stacked(cw), 200, 240, 170)
                body.append(logo)
            label = f"{cw} / {side}"
            lw = MED.width(label, 20)
            body.append(text_path(MED, label, 20, 200 - lw / 2, 480, DARK))
            shirts.append(f'<g transform="translate({ox} 40)">{"".join(body)}</g>')
    sw, sh = 40 + 4 * 470, 560
    markup = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {sw} {sh}" width="{sw}" height="{sh}">'
        f'<rect width="{sw}" height="{sh}" fill="#ffffff"/>{"".join(shirts)}</svg>\n'
    )
    cairosvg.svg2png(bytestring=markup.encode(), write_to=str(OUT / "mockup-maglia.png"), output_width=2400)


if __name__ == "__main__":
    main()
