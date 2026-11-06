"""Check real navigation, asset references, metadata and archived availability."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
APPS = json.loads((ROOT / "data/apps.json").read_text())
ERRORS = []


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.refs, self.ids, self.images, self.anchors, self.schema = [], set(), [], [], []
        self.h1s = 0
        self.canonical = None
        self.schema_text = None
        self.feed(path.read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get("id"):
            if attrs["id"] in self.ids:
                ERRORS.append(f"{self.path}: duplicate id {attrs['id']}")
            self.ids.add(attrs["id"])
        if tag == "h1": self.h1s += 1
        if tag == "a":
            self.anchors.append(attrs)
            self.refs.append(attrs.get("href", ""))
        if tag in ("script", "img") and attrs.get("src"): self.refs.append(attrs["src"])
        if tag == "img":
            self.images.append(attrs)
            for entry in attrs.get("srcset", "").split(","):
                if entry.strip(): self.refs.append(entry.strip().split()[0])
        if tag == "link" and attrs.get("rel") == "stylesheet": self.refs.append(attrs["href"])
        if tag == "link" and attrs.get("rel") == "canonical": self.canonical = attrs["href"]
        if tag == "script" and attrs.get("type") == "application/ld+json": self.schema_text = ""

    def handle_data(self, data):
        if self.schema_text is not None: self.schema_text += data

    def handle_endtag(self, tag):
        if tag == "script" and self.schema_text is not None:
            self.schema.append(json.loads(self.schema_text))
            self.schema_text = None


def resolve(url, origin):
    path = unquote(urlsplit(url).path)
    target = ROOT / path.lstrip("/") if path.startswith("/") else origin.parent / path
    if not path: target = origin
    if target.is_dir(): target /= "index.html"
    return target


home = Page(ROOT / "index.html")
pages = [home] + [Page(ROOT / app["path"].strip("/") / "index.html") for app in APPS]
for page in pages:
    if page.h1s != 1: ERRORS.append(f"{page.path}: expected one h1")
    if not page.canonical or not page.schema: ERRORS.append(f"{page.path}: missing metadata")
    for image in page.images:
        if not all(key in image for key in ("alt", "width", "height")):
            ERRORS.append(f"{page.path}: image missing alt or dimensions")
    for ref in page.refs:
        parts = urlsplit(ref)
        if parts.scheme or parts.netloc: continue
        if not ref: ERRORS.append(f"{page.path}: empty link"); continue
        target = resolve(ref, page.path)
        if not target.exists(): ERRORS.append(f"{page.path}: missing {ref}")
        elif parts.fragment and target.suffix == ".html":
            ids = Page(target).ids
            if parts.fragment not in ids: ERRORS.append(f"{page.path}: missing anchor {ref}")

for app, page in zip(APPS, pages[1:]):
    if page.canonical != "https://clevrapps.com" + app["path"]:
        ERRORS.append(f"{app['id']}: incorrect canonical")
    if not any(anchor.get("href") == app["path"] for anchor in home.anchors):
        ERRORS.append(f"{app['id']}: unreachable from homepage")
    if app["status"] != "live" and any(anchor.get("data-event") in ("store", "website") for anchor in page.anchors):
        ERRORS.append(f"{app['id']}: historical project has a current download offer")
    if not app["screenshots"]: ERRORS.append(f"{app['id']}: no screenshot")

sitemap = ET.parse(ROOT / "sitemap.xml")
locations = {node.text for node in sitemap.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
for page in pages:
    if page.canonical not in locations: ERRORS.append(f"{page.path}: missing from sitemap")

if ERRORS:
    raise SystemExit("\n".join(ERRORS))
print(f"Checked {len(pages)} pages: local links, anchors, images, metadata, sitemap and archived availability.")
