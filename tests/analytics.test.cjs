const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

const source = readFileSync(new URL('../script.js', `file://${__filename}`), 'utf8');

function page({ hostname = 'clevrapps.com', search = '', referrer = '', navigator = {} } = {}) {
  const listeners = {};
  const scripts = [];
  const year = {};
  class Element {
    constructor(dataset = {}) { this.dataset = dataset; }
    closest(selector) {
      if (selector === 'a[data-event]') return this;
      if (selector === '[data-app]') return { dataset: { app: 'subby' } };
      if (selector === '[data-location]') return { dataset: { location: 'directory' } };
      return null;
    }
  }
  const document = {
    referrer,
    head: { appendChild: (script) => scripts.push(script) },
    createElement: () => ({}),
    querySelectorAll: () => [year],
    addEventListener: (name, handler) => { listeners[name] = handler; },
  };
  const window = {};
  vm.runInNewContext(source, { document, window, location: { hostname, search }, navigator, Element, URL, URLSearchParams, Date });
  return { window, scripts, listeners, year, Element };
}

test('local previews and browser privacy signals never load analytics', () => {
  for (const options of [{ hostname: '127.0.0.1' }, { hostname: 'preview.vercel.app' }, { navigator: { doNotTrack: '1' } }, { navigator: { globalPrivacyControl: true } }]) {
    const runtime = page(options);
    assert.equal(runtime.scripts.length, 0);
    assert.equal(runtime.window.va, undefined);
    assert.equal(runtime.year.textContent, new Date().getFullYear());
  }
});

test('store clicks include app, platform and placement without leaking arbitrary campaign data', () => {
  const runtime = page({ search: '?utm_source=private-person@example.com&token=secret' });
  assert.equal(runtime.scripts[0].src, '/_vercel/insights/script.js');
  const target = new runtime.Element({ event: 'store', platform: 'ios' });
  const event = { type: 'click', button: 0, defaultPrevented: false, target };
  runtime.listeners.click(event);
  const [kind, payload] = runtime.window.vaq.at(-1);
  assert.equal(kind, 'event');
  assert.equal(payload.name, 'Store clicked');
  assert.equal(payload.data.app, 'subby');
  assert.equal(payload.data.platform, 'ios');
  assert.equal(payload.data.location, 'directory');
  assert.equal(payload.data.source, 'campaign');
  assert.equal(JSON.stringify(payload).includes('private-person'), false);
  assert.equal(event.defaultPrevented, false);
});

test('page URLs lose queries and fragments; malformed URLs are dropped', () => {
  const runtime = page();
  const sanitize = runtime.window.vaq[0][1];
  const event = sanitize({ type: 'pageview', url: 'https://clevrapps.com/apps/subby/?email=private@example.com#token' });
  assert.equal(event.url, 'https://clevrapps.com/apps/subby/');
  assert.equal(sanitize({ url: 'invalid' }), null);
});

test('middle-click is measured once, cancelled and unknown actions are ignored', () => {
  const runtime = page({ referrer: 'https://mikolajpiech.com/private/path?token=secret' });
  const target = new runtime.Element({ event: 'app_view' });
  const event = { button: 1, defaultPrevented: false, target };
  runtime.listeners.click({ ...event, type: 'click' });
  assert.equal(runtime.window.vaq.length, 1);
  runtime.listeners.auxclick({ ...event, type: 'auxclick' });
  assert.equal(runtime.window.vaq.length, 2);
  assert.equal(runtime.window.vaq[1][1].data.source, 'mikolajpiech.com');
  runtime.listeners.click({ ...event, type: 'click', button: 0, defaultPrevented: true });
  runtime.listeners.click({ ...event, type: 'click', button: 0, target: new runtime.Element({ event: 'unexpected' }) });
  assert.equal(runtime.window.vaq.length, 2);
});
