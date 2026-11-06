"""Render the static directory and product pages from one shared catalog.

Run after editing data/apps.json. Python's standard library is sufficient;
the committed HTML works without a build step or client-side JavaScript.
"""
import json
from html import escape
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://clevrapps.com"
VERSION = "20261106-details"
UPDATED = "2026-11-06"
APPS = json.loads((ROOT / "data/apps.json").read_text())


def e(value):
    return escape(str(value), quote=True)


def link(url, label, event, *, css="", app=None, platform=None, external=False):
    attrs = f' class="{e(css)}"' if css else ""
    attrs += f' data-event="{e(event)}"'
    if app:
        attrs += f' data-app="{e(app)}"'
    if platform:
        attrs += f' data-platform="{e(platform)}"'
    if external:
        attrs += ' target="_blank" rel="noopener"'
    arrow = "↗" if external else "→"
    return f'<a href="{e(url)}"{attrs}>{e(label)} <span aria-hidden="true">{arrow}</span></a>'


def destination_button(item, app, *, pl=False):
    platform = item["platform"]
    attrs = f'href="{e(item["url"])}" data-event="{e(item["kind"])}" data-app="{e(app["id"])}" data-platform="{e(platform)}" target="_blank" rel="noopener"'
    if item["kind"] == "website":
        label = "Strona" if pl else "Website"
        icon = '<svg class="destination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z"/></svg>'
        arrow = '<svg class="destination-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8"/></svg>'
        return f'<a class="destination-button destination-website" {attrs} aria-label="{e(label)} — {e(app["name"])}">{icon}<span>{label}</span>{arrow}</a>'
    if platform == "ios":
        label, eyebrow = "App Store", "Pobierz w" if pl else "Download on the"
        icon = '<svg class="destination-icon" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.2 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>'
    else:
        label, eyebrow = "Google Play", "Pobierz z" if pl else "Get it on"
        icon = '<svg class="destination-icon" viewBox="0 0 24 26" aria-hidden="true"><path fill="#4285f4" d="M1.5 1.5 13 13 1.5 24.5a2 2 0 0 1-.5-1.4V2.9c0-.5.2-1 .5-1.4Z"/><path fill="#34a853" d="M1.5 1.5C2 .9 2.8.9 3.5 1.3l14.2 8.1L13 13Z"/><path fill="#fbbc04" d="m17.7 9.4 4.4 2.5c1.2.7 1.2 1.5 0 2.2l-4.4 2.5L13 13Z"/><path fill="#ea4335" d="M1.5 24.5c.5.6 1.3.6 2 .2l14.2-8.1L13 13Z"/></svg>'
    return f'<a class="destination-button destination-store destination-{e(platform)}" {attrs} aria-label="{e(app["name"])} — {label}">{icon}<span class="destination-copy"><span class="destination-eyebrow">{eyebrow}</span><span class="destination-name">{label}</span></span></a>'


# A small waving Polish flag for apps that are only available in Poland.
POLISH_FLAG = (
    '<svg class="region-flag" viewBox="0 0 24 16" aria-hidden="true">'
    '<path fill="#fff" d="M1 2.5C5 .8 9 .8 12 2.5S19 4.2 23 2.5V8C19 9.7 15 9.7 12 8S5 6.3 1 8Z"/>'
    '<path fill="#dc143c" d="M1 8C5 6.3 9 6.3 12 8S19 9.7 23 8v5.5c-4 1.7-8 1.7-11 0S5 11.8 1 13.5Z"/>'
    '<path fill="none" stroke="#000" stroke-opacity=".14" stroke-width=".7" d="M1 2.5C5 .8 9 .8 12 2.5S19 4.2 23 2.5v11c-4 1.7-8 1.7-11 0S5 11.8 1 13.5Z"/>'
    '</svg>'
)


def region_badge(app, *, pl=False, short=False):
    if app.get("region") != "PL":
        return ""
    if short:
        label = "Polska" if pl else "Poland"
    else:
        label = "Tylko w Polsce" if pl else "Only in Poland"
    return f'<span class="region-badge">{POLISH_FLAG}{label}</span>'


def screenshot_image(shot, *, eager=False, css="", sizes="(max-width: 767px) 42vw, 210px"):
    srcset = ""
    if shot.get("small"):
        # The nominal 800 export can be smaller when the original is smaller.
        small_width = 600 if "-600." in shot["small"] else 420
        srcset = f' srcset="{e(shot["small"])} {small_width}w, {e(shot["src"])} {shot["width"]}w" sizes="{e(sizes)}"'
    priority = ' fetchpriority="high"' if eager else ""
    return f'<img class="{e(css)}" src="{e(shot["src"])}"{srcset} width="{shot["width"]}" height="{shot["height"]}" alt="{e(shot["alt"])}" loading="{"eager" if eager else "lazy"}" decoding="async"{priority} />'


def organization_graph():
    return [
        {"@type": "Organization", "@id": BASE + "/#organization", "name": "Clevr Apps", "url": BASE + "/", "logo": BASE + "/assets/brand-mark.svg", "founder": {"@id": "https://mikolajpiech.com/#person"}, "email": "mikolaj@clevrapps.com"},
        {"@type": "Person", "@id": "https://mikolajpiech.com/#person", "name": "Mikołaj Piech", "alternateName": "Mikolaj Piech", "url": "https://mikolajpiech.com/", "worksFor": {"@id": BASE + "/#organization"}, "sameAs": ["https://www.linkedin.com/in/mikolajpiech/", "https://github.com/realmikolajpiech", "https://x.com/mikolajpiech"]},
    ]


def app_schema(app):
    value = {"@type": "SoftwareApplication", "@id": BASE + app["path"] + "#app", "name": app["name"], "url": BASE + app["path"], "description": app["description"], "applicationCategory": app["schemaCategory"], "operatingSystem": app["operatingSystem"], "creativeWorkStatus": {"live": "Published", "acquired": "Acquired", "paused": "On hold"}[app["status"]], "image": BASE + app["icon"], "screenshot": [BASE + shot["src"] for shot in app["screenshots"]], "author": {"@id": BASE + "/#organization"}, "publisher": {"@id": BASE + "/#organization"}}
    store = next((item for item in app["links"] if item["kind"] == "store"), None)
    if store:
        value["downloadUrl"] = store["url"]
    if app.get("authors"):
        value["author"] = app["authors"]
    if app.get("publisher"):
        value["publisher"] = app["publisher"]
    if app.get("region"):
        value["countriesSupported"] = app["region"]
    return value


def head(title, description, path, graph, stylesheet, language="en"):
    schema = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2).replace("</", "<\\/")
    return f'''<!doctype html>
<html lang="{language}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <title>{e(title)}</title>
    <meta name="description" content="{e(description)}" />
    <link rel="canonical" href="{BASE}{path}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Clevr Apps" />
    <meta property="og:locale" content="{"pl_PL" if language == "pl" else "en_US"}" />
    <meta property="og:title" content="{e(title)}" />
    <meta property="og:description" content="{e(description)}" />
    <meta property="og:url" content="{BASE}{path}" />
    <meta property="og:image" content="{BASE}/assets/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Clevr Apps — Apps by Mikołaj Piech" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{e(title)}" />
    <meta name="twitter:description" content="{e(description)}" />
    <meta name="twitter:image" content="{BASE}/assets/og-image.png" />
    <link rel="icon" href="/assets/favicon.svg?v={VERSION}" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="/styles.css?v={VERSION}" />
    <link rel="stylesheet" href="/{stylesheet}?v={VERSION}" />
    <script type="application/ld+json">{schema}</script>
  </head>'''


def header(pl=False):
    return f'''<a class="skip-link" href="#main">{"Przejdź do treści" if pl else "Skip to content"}</a>
    <header class="site-header">
      <a class="brand" href="/" aria-label="Clevr Apps, home"><img class="brand-icon" src="/assets/brand-mark.svg" width="32" height="32" alt="" /><span>clevr<span class="brand-apps">apps</span></span></a>
      <nav class="site-nav" aria-label="{"Nawigacja główna" if pl else "Main navigation"}"><a href="/#work">{"Aplikacje" if pl else "Apps"}</a><a href="#support">{"Kontakt" if pl else "Contact"}</a></nav>
    </header>'''


def footer(css="directory-footer", pl=False, app=None):
    story = link(app["caseStudy"], "Historia projektu" if pl else "Project story", "case_study", app=app["id"], external=True) if app and app.get("caseStudy") else ""
    app_attribute = f' data-app="{e(app["id"])}"' if app else ""
    email = f'<a href="mailto:mikolaj@clevrapps.com" data-event="support"{app_attribute}>mikolaj@clevrapps.com</a>'
    return f'''<span id="contact" aria-hidden="true"></span><footer class="{css}" id="support"><p>© <span data-year>2026</span> Clevr Apps</p><div>{story}{email}<a href="/privacy.html">{"Prywatność" if pl else "Privacy"}</a></div></footer>
    <script src="/script.js?v={VERSION}" defer></script>
  </body>
</html>'''


def preview(app, *, eager=False, archive=False):
    website = app.get("screenshotType") == "website"
    shots = app["screenshots"][:1 if archive or website else 2]
    images = "".join(screenshot_image(shot, eager=eager and index == 0, css="screen-capture", sizes="(max-width: 767px) 42vw, 210px" if not website else "(max-width: 767px) 90vw, 460px") for index, shot in enumerate(shots))
    return f'<a class="app-preview preview-{app["previewStyle"]}{" preview-website" if website else ""}" href="{e(app["path"])}" data-event="app_view" aria-label="Explore {e(app["name"])}"><div class="preview-captures">{images}</div></a>'


def app_card(app, index):
    actions = "".join(destination_button(item, app) for item in app["links"])
    return f'''<article class="app-card" id="project-{app["id"]}" data-app="{app["id"]}" data-location="directory">
      <div class="app-identity"><img src="{e(app["icon"])}" alt="" width="44" height="44" loading="lazy" /><div><h3><a href="{e(app["path"])}" data-event="app_view">{e(app["name"])}</a></h3><p>{e(app["label"])}{region_badge(app, short=True)}</p></div></div>
      {preview(app, eager=index == 0)}
      <div class="app-actions">{actions}</div>
    </article>'''


def archive_card(app):
    alias = '<span id="project-charmy" class="legacy-project-anchor" aria-hidden="true"></span>' if app["id"] == "charmy-books" else ""
    return f'''<article class="archive-card" id="project-{app["id"]}" data-app="{app["id"]}" data-location="archive">{alias}{preview(app, archive=True)}<div class="archive-body"><h3><a href="{e(app["path"])}" data-event="app_view">{e(app["name"])}</a></h3><p>{e(app["statusLabel"])}</p></div></article>'''


def build_home():
    live = [app for app in APPS if app["status"] == "live"]
    archived = [app for app in APPS if app["status"] != "live"]
    graph = organization_graph() + [{"@type": "WebSite", "@id": BASE + "/#website", "url": BASE + "/", "name": "Clevr Apps", "inLanguage": "en", "publisher": {"@id": BASE + "/#organization"}}, {"@type": "ItemList", "@id": BASE + "/#apps", "name": "Apps and projects by Clevr Apps", "itemListElement": [{"@type": "ListItem", "position": index + 1, "item": app_schema(app)} for index, app in enumerate(APPS)]}]
    html = head("Clevr Apps — Independent apps by Mikołaj Piech", "Explore Jedziemy, Subby, Twoja Sieć, Trailo and Doso. App previews, downloads and projects by Mikołaj Piech.", "/", graph, "home.css")
    html += f'''\n  <body class="studio-home">
    {header()}
    <main id="main">
      <section class="directory-intro" id="studio" aria-labelledby="intro-title" data-location="intro"><h1 id="intro-title">Apps by<br />{link("https://mikolajpiech.com/", "Mikołaj Piech", "founder", external=True)}</h1></section>
      <section class="directory" id="work" aria-labelledby="apps-title"><h2 class="sr-only" id="apps-title">Apps</h2><div class="directory-grid">{"".join(app_card(app, index) for index, app in enumerate(live))}</div></section>
      <details class="directory-archive" id="archive"><summary>Archive <span aria-hidden="true">+</span></summary><div class="archive-grid">{"".join(archive_card(app) for app in archived)}</div></details>
    </main>
    {footer()}'''
    (ROOT / "index.html").write_text("\n".join(line.rstrip() for line in html.splitlines()) + "\n")


def build_product(app):
    pl = app.get("language") == "pl"
    headline = app.get("headlinePl", app["headline"]) if pl else app["headline"]
    description = app.get("descriptionPl", app["description"]) if pl else app["description"]
    screenshots = [{**shot, "alt": shot.get("altPl", shot["alt"]), "caption": shot.get("captionPl", shot["caption"])} for shot in app["screenshots"]] if pl else app["screenshots"]
    graph = organization_graph() + [app_schema(app), {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Clevr Apps", "item": BASE + "/"}, {"@type": "ListItem", "position": 2, "name": app["name"], "item": BASE + app["path"]}]}]
    html = head(f'{app["name"]} — {headline.rstrip(".")} | Clevr Apps', description, app["path"], graph, "product.css", "pl" if pl else "en")
    actions = "".join(destination_button(item, app, pl=pl) for item in app["links"])
    status = f'<p class="product-status">{e(app["statusLabel"])}</p>' if app.get("statusLabel") else ""
    gallery_type = " product-gallery-website" if app.get("screenshotType") == "website" else ""
    gallery = "".join(f'<figure>{screenshot_image(shot, eager=index == 0, sizes="(max-width: 767px) 75vw, 700px" if gallery_type else "(max-width: 767px) 60vw, 250px")}</figure>' for index, shot in enumerate(screenshots))
    facts = "".join(f'<div><dt>{e(label)}</dt><dd>{e(value)}</dd></div>' for label, value in app["facts"])
    note = f'<aside class="product-note">{e(app["note"])}</aside>' if app.get("note") else ""
    summary = "Lokalne wiadomości, alerty i wydarzenia w jednym miejscu." if pl else app["shortDescription"]
    html += f'''\n  <body class="product-page product-page-{app["id"]}">
    {header(pl)}
    <main id="main" data-app="{app["id"]}" data-location="product"><a class="product-back" href="/{"#work" if app["status"] == "live" else "#archive"}"><span aria-hidden="true">←</span> {"Wszystkie aplikacje" if pl else "All apps"}</a>
      <section class="product-overview" aria-labelledby="product-title"><div class="product-heading"><div class="product-identity"><img src="{e(app["icon"])}" alt="" width="64" height="64" /><div><h1 id="product-title">{e(app["name"])}</h1><p>{e(app.get("platformsPl", app["platforms"]) if pl else app["platforms"])}{region_badge(app, pl=pl)}</p></div></div><div class="product-actions">{actions}{status}</div></div><p class="product-summary">{e(summary)}</p></section>
      {note if app["status"] != "live" else ""}
      <section class="product-gallery{gallery_type}" aria-label="{"Zrzuty ekranu" if pl else "Screenshots"}" tabindex="0">{gallery}</section>
      <section class="product-details" id="app-story" aria-labelledby="features-title"><h2 id="features-title">{"Szczegóły" if pl else "Details"}</h2><dl class="product-facts">{facts}</dl>{note if app["status"] == "live" else ""}</section>
    </main>
    {footer("product-footer", pl, app)}'''
    destination = ROOT / app["path"].strip("/") / "index.html"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text("\n".join(line.rstrip() for line in html.splitlines()) + "\n")


def build_sitemap():
    namespace = "http://www.sitemaps.org/schemas/sitemap/0.9"
    image_ns = "http://www.google.com/schemas/sitemap-image/1.1"
    ET.register_namespace("", namespace)
    ET.register_namespace("image", image_ns)
    old = ET.parse(ROOT / "sitemap.xml").getroot()
    owned = {BASE + "/"} | {BASE + app["path"] for app in APPS}
    kept = [node for node in old if node.findtext("{" + namespace + "}loc") not in owned]
    for node in kept:
        if node.findtext("{" + namespace + "}loc") == BASE + "/privacy.html":
            node.find("{" + namespace + "}lastmod").text = UPDATED
    root = ET.Element("{" + namespace + "}urlset")
    for url, shots in [(BASE + "/", [])] + [(BASE + app["path"], app["screenshots"]) for app in APPS]:
        node = ET.SubElement(root, "{" + namespace + "}url")
        ET.SubElement(node, "{" + namespace + "}loc").text = url
        ET.SubElement(node, "{" + namespace + "}lastmod").text = UPDATED
        for shot in shots:
            image = ET.SubElement(node, "{" + image_ns + "}image")
            ET.SubElement(image, "{" + image_ns + "}loc").text = BASE + shot["src"]
            ET.SubElement(image, "{" + image_ns + "}title").text = shot["caption"]
    root.extend(kept)
    ET.indent(root, space="  ")
    ET.ElementTree(root).write(ROOT / "sitemap.xml", encoding="UTF-8", xml_declaration=True)


if __name__ == "__main__":
    build_home()
    for app in APPS:
        build_product(app)
    build_sitemap()
    print(f"Rendered homepage, {len(APPS)} project pages and sitemap.")
