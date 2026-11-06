# Clevr Apps and Mikołaj Piech

## The decision

Keep Clevr Apps. It is a useful umbrella name for the products and the business. Describe it as an independent app studio when a label is needed; on the website, simply explain that it is the name Mikołaj publishes his apps under.

The previous websites both tried to sell the same thing: the ability to build software. That made the studio read like an agency and the personal website read like another agency homepage. Clevr is a product directory with real app previews; the personal site retains the portfolio design preferred by Mikołaj.

| Place                      | Who it serves                             | What belongs here                                                                       |
| -------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| clevrapps.com              | People looking for or using an app        | What the apps do, screenshots, platforms, downloads, support, privacy, ownership/status |
| mikolajpiech.com           | People interested in Mikołaj              | A personal introduction, the stories behind projects, collaborators, interests, contact |
| mikolajpiech.com/portfolio | People exploring Mikołaj's work           | Three selected stories and short links to other projects                               |
| mikolajpiech.com/projects/... | Readers interested in how a project was built | Personal role, motivation, product decisions, recorded results, optional technical details |
| Individual product sites   | People interested in one specific product | The product's own identity, detailed explanation, purchase or download                  |

## How the two sites connect

Clevr links Mikołaj’s name in the headline to his personal site. The personal homepage explains that he runs Clevr Apps and links to the studio. Neither site redirects into the other. Existing URLs and the Person/Organization structured-data identifiers remain intact.

The studio email handles product support and business enquiries. The personal email handles personal messages and potential client work. Publicly, use “I” when Mikołaj is speaking. Credit actual collaborators on shared projects. Do not imply a larger team.

## Visual identity

The identity is a typographic wordmark using the same DM Sans lettering as the website. A lowercase “c” from the same typeface sits inside a charcoal rounded square. Use this icon beside the wordmark in the header and on its own for favicons and app-publisher profiles.

- Wordmark: lowercase **clevrapps**, with slightly heavier “clevr”. Keep “Clevr Apps” in normal prose, page titles, and legal references.
- Ink: `#242526`; white: `#ffffff`; link accent: `#45494b`; secondary text: `#707578`.
- Type: DM Sans for the studio, DM Mono for compact platform/status information.
- Product colors remain with their products. The studio's neutral palette gives screenshots room without imposing a new visual identity on each app.
- Motion: small hover movement, no scroll interception, no animated metrics, no constantly moving ticker. Respect reduced motion.

The personal homepage keeps its earlier Instrument Serif / Manrope pairing, large rounded portrait, generous portfolio layout, and light/dark themes. The alternative journal-style redesign was rejected and has been removed. Both English and Polish versions remain supported.

## Logo files

- `assets/brand-lockup.svg`: combined icon and wordmark.
- `assets/brand-mark.svg`: path-based white lowercase c in a charcoal rounded square.
- `assets/brand-wordmark.svg`: horizontal charcoal wordmark, with all lettering converted to paths.
- `assets/brand-logo.svg`: square background version.
- `assets/clevrapps-logo.png`: 1024px square logo.
- `assets/clevrapps-logo-1024.webp` and `assets/clevrapps-logo-640.webp`: web exports.
- `assets/favicon.svg` and `assets/apple-touch-icon.png`: browser/device icons.
- `assets/og-image.svg` and `assets/og-image.png`: social card source and export.

Keep clear space around the wordmark of at least half its letter height. Use charcoal on light backgrounds or white on dark backgrounds. Keep the icon charcoal and white; do not add an orange accent or a shadow. SVG exports use paths and require no installed font.

## Writing

Lead with the app's job. “Track subscriptions and renewal dates” is useful; “a better digital life” is not. Make download and support links easy to find. Avoid service lists, “we” for a solo developer, growth counters, sales funnels, and acquisition pitches above the apps.

Separate available products from acquired and paused projects. Jedziemy, Trailo, Subby, Doso and Twoja Sieć appear in the active directory. Jedziemy is a separate venture co-founded with Marcel Chudyba; inclusion in this directory does not make Clevr Apps its publisher. Solvee is an acquired project; Charmy Books and Arie are currently on hold, as confirmed by Mikołaj. Their pages are historical archives with no current download or launch promises. Charmy Books is the current name; historical screenshots retain earlier JustMine branding and are labeled accordingly.

## Making the personal site more personal

Preserve the established personal-site visual style. Future editorial changes can use genuine personal material without another visual overhaul.

The next useful addition is real non-work material: a few candid photographs, interests, a short note about something Mikołaj is learning, or an occasional update. Add a writing section only when there is something to publish. Make those editorial decisions separately from the visual design.

This is a local implementation and brand direction, not a deployment. Review product availability and personal copy before publishing.

## Product directory layout

Keep the homepage minimal: the “Apps by Mikołaj Piech” heading, five active projects, and a compact footer. Each app gets its icon, name, a short functional label, real screenshots, and direct store/web links. The name and screenshot link to the product page. Use the same preview size for every app. Keep historical projects in a collapsed Archive section.

Do not add marketing slogans, explanatory hero copy, a “find your next app” call to action, category badges, founder paragraphs, repeated project links, or a separate support pitch. The founder's name links to the personal site. Contact is a plain email link in the footer. This minimalism is an explicit preference from Mikołaj.

Use real captures from the apps and websites. Do not generate or redraw the UI. Label historical material honestly: Solvee uses original store screenshots; Charmy Books shows older website branding; Arie uses a screenshot of its original website, including an illustrative demo. Do not present that Arie website demo as a capture of a released application.

## Product pages

Product pages follow the same restraint: app identity, available links, one concise sentence and original screenshots. Show access/pricing facts directly below the gallery in a normal Details section, without disclosure controls. Keep support and the contextual project-story link in the footer. Story links exist only for Solvee, Jedziemy and Twoja Sieć and lead to their dedicated personal story pages, not to another product catalog. Do not repeat download buttons or add separate maker and promotional sections. Use source-confirmed information and avoid invented prices or availability. Galleries remain keyboard accessible. Keep paused and acquired projects clearly labeled. `data/apps.json` is the common source for the directory, detail pages and product metadata.
