"""Inline ../assets CSS/JS into lessons and reference docs -> standalone/ (single files that open anywhere)."""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
out = root / "standalone"; out.mkdir(exist_ok=True)
for src in sorted([*root.glob("lessons/*.html"), *root.glob("reference/*.html")]):
    html = src.read_text()
    html = re.sub(r'<link rel="stylesheet" href="\.\./assets/([^"]+)">',
                  lambda m: "<style>\n" + (root / "assets" / m[1]).read_text() + "</style>", html)
    html = re.sub(r'<script src="\.\./assets/([^"]+)"></script>',
                  lambda m: "<script>\n" + (root / "assets" / m[1]).read_text() + "</script>", html)
    # Links between docs point at the standalone copies.
    html = re.sub(r'href="\.\./(lessons|reference)/([^"]+)"', r'href="\2"', html)
    (out / src.name).write_text(html)
    print("wrote", out / src.name)
