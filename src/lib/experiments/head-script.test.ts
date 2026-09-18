import { describe, expect, it } from 'vitest';
import { assign, EXPERIMENTS } from './bucket';
import source from './head-script.js?raw';

// BaseLayout wraps the file as `(function(E){...})(registry)`; E is [[key, variants], ...].
const registry = EXPERIMENTS.map((e) => [e.key, [...e.variants]]);

function run(cookie = '', { https = false, uuid = 'fresh-uuid' as string | null } = {}) {
  const attrs: Record<string, string> = {};
  const doc = {
    cookie,
    documentElement: { dataset: {} as Record<string, unknown>, setAttribute: (k: string, v: string) => void (attrs[k] = v) },
  };
  const crypto = { randomUUID: () => { if (uuid === null) throw new Error('no crypto'); return uuid; } };
  const location = { protocol: https ? 'https:' : 'http:' };
  new Function('E', 'document', 'location', 'crypto', source)(registry, doc, location, crypto);
  return { attrs, doc, written: doc.cookie };
}

describe('head script', () => {
  it('is under 1024 bytes', () => {
    expect(new TextEncoder().encode(source).length).toBeLessThan(1024);
  });

  it('assigns exactly like assign() for 1000 ids', () => {
    for (let i = 0; i < 1000; i++) {
      const id = crypto.randomUUID();
      const { attrs } = run(`fxr_aid=${id}`);
      for (const { key } of EXPERIMENTS) expect(attrs[key]).toBe(assign(key, id));
    }
  });

  it('mints an id, sets the cookie and marks a new visitor', () => {
    const { doc, written } = run('');
    expect(written).toContain('fxr_aid=fresh-uuid');
    expect(written).toContain('max-age=31536000');
    expect(written).toContain('SameSite=Lax');
    expect(written).not.toContain('Secure');
    expect(doc.documentElement.dataset.returning).toBe(false);
  });

  it('keeps an existing id, refreshes the cookie and marks a returning visitor', () => {
    const { doc, written } = run('a=1; fxr_aid=keep-me; b=2');
    expect(written).toContain('fxr_aid=keep-me');
    expect(doc.documentElement.dataset.returning).toBe(true);
  });

  it('adds Secure on https', () => {
    expect(run('', { https: true }).written).toContain(';Secure');
  });

  it('falls back to Math.random when crypto.randomUUID is unavailable', () => {
    const { written, attrs } = run('', { uuid: null });
    expect(written).toMatch(/fxr_aid=[a-z0-9]{10,}/);
    expect(Object.keys(attrs)).toEqual(EXPERIMENTS.map((e) => e.key));
  });
});
