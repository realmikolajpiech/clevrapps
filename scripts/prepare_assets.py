"""Export existing product captures; never synthesize or redraw application UI.

One-time maintenance helper. Requires Pillow and the neighboring source projects.
Generated WebP files are committed, so hosting needs no build or Python runtime.
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT.parent
PERSONAL = PROJECTS / "personalwebsite" / "assets"
OUTPUT = ROOT / "assets/apps/previews"
OUTPUT.mkdir(parents=True, exist_ok=True)


def export(source, stem, widths):
    image = Image.open(source).convert("RGB")
    for requested in widths:
        width = min(requested, image.width)
        height = round(image.height * width / image.width)
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        resized.save(OUTPUT / f"{stem}-{requested}.webp", quality=86, method=6)


for app in ("trailo", "subby"):
    export(ROOT / f"assets/apps/{app}.png", f"{app}-1", (420, 800))

export(PROJECTS / "health-app/assets/images/icon-mascot-v2.png", "doso-icon", (160,))

icon = Image.open(PERSONAL / "jedziemy/app-logo.png").convert("RGBA")
icon.resize((160, 160), Image.Resampling.LANCZOS).save(OUTPUT / "jedziemy-icon-160.webp", quality=86, method=6)
for index, filename in enumerate(("teoria-path", "teoria-training", "teoria-answer"), 1):
    export(PERSONAL / "jedziemy" / f"{filename}.jpg", f"jedziemy-{index}", (420, 800))

for index, filename in enumerate(("01-today", "02-medications", "03-history", "04-family", "05-flexible-schedules"), 1):
    export(PROJECTS / "health-app/artifacts/app-store/raw" / f"{filename}.png", f"doso-{index}", (420, 800))

for index, filename in enumerate(("twojasiec-feed", "twojasiec-events", "twojasiec-alerts"), 1):
    export(PERSONAL / "twojasiec" / f"{filename}.jpeg", f"twojasiec-{index}", (420, 800))

for index, filename in enumerate(("justmine-create-step-4", "justmine-home"), 1):
    export(PERSONAL / "justmine" / f"{filename}.jpg", f"charmy-{index}", (600, 1200))

# Capture the original local Arie website with the browser before running this.
arie_capture = Path("/tmp/clevr-arie-website.jpg")
if arie_capture.exists():
    export(arie_capture, "arie-1", (600, 1200))

catalog_path = ROOT / "data/apps.json"
catalog = json.loads(catalog_path.read_text())
for app in catalog:
    for screenshot in app["screenshots"]:
        with Image.open(ROOT / screenshot["src"].lstrip("/")) as image:
            screenshot["width"], screenshot["height"] = image.size
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
print("Exported existing screenshots and synchronized their dimensions.")
