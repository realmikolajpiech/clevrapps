# Clevr Apps website

A responsive, dependency-free static website for Clevr Apps with dedicated app pages, structured data, social metadata, responsive images, crawl configuration, and an AI-readable site map in `llms.txt`.

The Organization and SoftwareApplication structured data use `https://clevrapps.com/#organization` for the studio and `https://mikolajpiech.com/#person` for founder Mikołaj Piech. Keep those identifiers consistent with the personal website when updating either site.

## Preview locally

From this directory, run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

Upload the project root to any static host (Cloudflare Pages, Netlify, Vercel, GitHub Pages, or a standard web server). No build command is required.

## Brand and site roles

See [BRAND.md](BRAND.md) for the identity, voice, and the relationship to mikolajpiech.com. The homepage shows actual product captures and direct links to features, stores and available websites. Jedziemy, Trailo, Subby, Doso and Twoja Sieć are the active projects. Jedziemy is a separate venture co-founded with Marcel Chudyba and retains its own publisher in the structured data. Solvee is an acquired project; Charmy Books and Arie are on hold. They appear in a separate archive without current download offers. Each project has a detail page. Product-specific links lead to the corresponding story in Mikołaj's portfolio.

The site uses HTML, CSS, and a small script for the copyright year and analytics. Navigation, product links, screenshots and email work without JavaScript. No deployment build is required. Google Fonts serves DM Sans and DM Mono.

## Updating the catalog

`data/apps.json` is the shared source for visible product copy, status, platforms, screenshots, structured data and links. After editing it, run:

```sh
python3 scripts/build_catalog.py
python3 scripts/check_site.py
node --test tests/analytics.test.cjs
```

The renderer uses only Python's standard library and writes the committed homepage, eight product pages and sitemap. Keep the generated HTML in version control. It preserves the existing product, legal and support URLs. The check verifies local links, anchors, asset references, metadata, sitemap inclusion and the absence of download offers on historical projects.

Screenshot exports are committed under `assets/apps/previews/`. Their provenance is recorded in that directory's README. `scripts/prepare_assets.py` is an optional maintenance helper requiring Pillow and the neighboring source repositories. It is not part of deployment. Doso uses the current native app captures; archived Charmy Books and Arie previews explicitly identify historical branding and illustrative website content.

## Analytics

The production site loads Vercel Web Analytics from `/_vercel/insights/script.js`. In the existing Vercel project, enable **Analytics → Web Analytics** and deploy these files. The site does not send events on localhost or preview domains, or when Do Not Track / Global Privacy Control is enabled. It does not use cookies or browser storage for analytics.

Custom events are `App viewed`, `Store clicked`, `Website opened`, `Support clicked`, `Founder profile opened`, and `Project story opened`. They carry only an allowlisted app ID, placement, platform when relevant, and a coarse current-page traffic-source category. Arbitrary campaign values and full referrer URLs are not included in custom events; page URL queries and fragments are stripped. The source is per-page context, not persistent cross-page attribution. Clicks are recorded without delaying normal links, including middle-clicks. A store click is not an installation.

[Vercel's setup guide](https://vercel.com/docs/analytics/quickstart) explains activation. [Custom events](https://vercel.com/docs/analytics/custom-events) require a Pro or Enterprise plan; enabling that plan is an account action, not part of this source change. Without activation, the website still works but reports are not collected. `privacy.html` describes the implemented measurement. When hosting elsewhere, replace this integration with the chosen provider before expecting reports.

## Support

Support and general enquiries go to `mikolaj@clevrapps.com` through a mailto link. There is no form provider to activate.

## Domain configuration

Set `https://clevrapps.com` as the primary domain and redirect these variants to it with permanent `301` redirects:

- `http://clevrapps.com/*`
- `http://www.clevrapps.com/*`
- `https://www.clevrapps.com/*`
- `/index.html` → `/`

The included `_redirects` file configures the hostname and `/index.html` redirects for Netlify and Cloudflare Pages. On Vercel, set `clevrapps.com` as the primary production domain in the project’s domain settings.

## SEO launch checklist

After the site is live:

1. Verify the `clevrapps.com` domain property in [Google Search Console](https://search.google.com/search-console/).
2. Submit `https://clevrapps.com/sitemap.xml`.
3. Use URL Inspection for the homepage, privacy page, and all generated product and archive pages.
4. Validate the homepage and app pages with Google’s [Rich Results Test](https://search.google.com/test/rich-results).
5. Confirm the selected canonical is `https://clevrapps.com/` and that all `www`, HTTP, and `/index.html` variants redirect correctly.
6. Test the social card at `https://clevrapps.com/assets/og-image.png` after deployment.
