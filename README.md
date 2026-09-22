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

See [BRAND.md](BRAND.md) for the identity, voice, and the relationship to mikolajpiech.com. The homepage is a compact app directory. Each entry links directly to its available website and store destinations. Detailed product pages remain available for search, support, and project history. Email support is at the bottom of the page. The personal website retains its original portfolio style.

The site uses HTML, CSS, and a small script for the copyright year. Navigation, product links, and email work without JavaScript. No build is required. Google Fonts serves DM Sans and DM Mono.

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
3. Use URL Inspection for the homepage, privacy page, and all four `/apps/.../` pages.
4. Validate the homepage and app pages with Google’s [Rich Results Test](https://search.google.com/test/rich-results).
5. Confirm the selected canonical is `https://clevrapps.com/` and that all `www`, HTTP, and `/index.html` variants redirect correctly.
6. Test the social card at `https://clevrapps.com/assets/og-image.png` after deployment.
