document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

// Links remain normal links. Analytics never delays a download or navigation.
(() => {
  const production = ["clevrapps.com", "www.clevrapps.com"].includes(location.hostname);
  const optedOut = navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true;
  if (!production || optedOut) return;

  window.va = window.va || function (...args) {
    (window.vaq = window.vaq || []).push(args);
  };

  // Do not send query strings or fragments, which can contain private values.
  window.va("beforeSend", (event) => {
    try {
      const url = new URL(event.url);
      url.search = "";
      url.hash = "";
      return { ...event, url: url.toString() };
    } catch {
      return null;
    }
  });

  const provider = document.createElement("script");
  provider.defer = true;
  provider.src = "/_vercel/insights/script.js";
  document.head.appendChild(provider);

  // Record a source category, never a raw campaign value or referrer URL.
  function trafficSource() {
    const knownCampaigns = new Set(["google", "bing", "linkedin", "x", "twitter", "instagram", "threads", "substack", "newsletter", "mikolajpiech"]);
    const campaign = new URLSearchParams(location.search).get("utm_source");
    if (campaign) return knownCampaigns.has(campaign.toLowerCase()) ? campaign.toLowerCase() : "campaign";
    if (!document.referrer) return "direct";
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (["clevrapps.com", "mikolajpiech.com", "google.com", "google.pl", "bing.com", "linkedin.com", "x.com", "t.co", "instagram.com", "threads.com", "substack.com"].includes(host)) return host;
      return "other";
    } catch {
      return "other";
    }
  }

  const source = trafficSource();
  const events = {
    app_view: "App viewed",
    store: "Store clicked",
    website: "Website opened",
    support: "Support clicked",
    founder: "Founder profile opened",
    case_study: "Project story opened",
  };
  const apps = new Set(["jedziemy", "trailo", "subby", "doso", "twojasiec", "solvee", "charmy-books", "arie"]);
  const placements = new Set(["directory", "archive", "product", "studio", "intro", "support", "footer"]);

  function trackLink(event) {
    if (event.defaultPrevented || (event.type === "click" ? event.button !== 0 : event.button !== 1)) return;
    const anchor = event.target instanceof Element ? event.target.closest("a[data-event]") : null;
    if (!anchor || !events[anchor.dataset.event]) return;
    const app = anchor.closest("[data-app]")?.dataset.app;
    const placement = anchor.closest("[data-location]")?.dataset.location;
    const properties = {
      app: apps.has(app) ? app : "studio",
      location: placements.has(placement) ? placement : "footer",
      source,
    };
    if (["ios", "android", "web"].includes(anchor.dataset.platform)) properties.platform = anchor.dataset.platform;
    window.va("event", { name: events[anchor.dataset.event], data: properties });
  }

  document.addEventListener("click", trackLink);
  document.addEventListener("auxclick", trackLink);
})();
