# Clevr Apps website

A responsive, dependency-free static website for Clevr Apps with dedicated app pages, structured data, social metadata, responsive images, and crawl configuration.

## Preview locally

From this directory, run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

Upload the project root to any static host (Cloudflare Pages, Netlify, Vercel, GitHub Pages, or a standard web server). No build command is required.

## Contact form activation

The contact form submits through FormSubmit without opening the visitor&rsquo;s email client. After the site is live, send one test message and confirm the activation email delivered to `mikolaj@clevrapps.com`. Messages will not be forwarded until that one-time confirmation is completed.

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
