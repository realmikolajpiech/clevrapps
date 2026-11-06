# Jedziemy privacy-edited masters

`jedziemy-home-anonymized.png` and `jedziemy-calendar-anonymized.png` retain the full 1206 × 2622 original simulator captures. The only changed regions are the instructor surname: one on Home, three in Calendar. The example displayed name is Piotr Nowak.

The built-in image editing tool supplied the replacement lettering. Only the surname lettering was composited into the original captures; generated full-screen images are not used. Pixel comparison confirmed zero changed pixels outside the four surname regions. Region coordinates and verification counts are recorded in `jedziemy-privacy-edits.json`.

Editing instruction: replace the instructor's original surname with “Nowak” wherever visible, matching the existing font, size, color, baseline and alignment. Preserve all other text, dates, photos, UI, status bar and framing. No phone frame, mockup, marketing text, redesign or crop.

`scripts/prepare_assets.py` resizes these committed masters for the website. It must not substitute the unedited Home or Calendar PNGs from the neighboring Jedziemy project.
