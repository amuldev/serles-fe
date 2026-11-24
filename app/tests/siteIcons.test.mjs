// Favicon/icon regression guard (24 Nov 2026). Google showed a generic globe
// for serlesbake.in because /favicon.ico was still the stock Next.js icon
// (25,931 bytes, advertised as 16x16) and a second manual <link rel="icon">
// pointed somewhere else. Google wants one square icon, a multiple of 48px.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const file = (p) => new URL(p, import.meta.url);

function icoSizes(buf) {
  const count = buf.readUInt16LE(4);
  return Array.from({ length: count }, (_, i) => buf[6 + i * 16] || 256);
}

test('favicon.ico is the brand icon, includes 48x48, and is not the Next.js default', () => {
  const ico = readFileSync(file('../app/favicon.ico'));
  assert.notEqual(ico.length, 25931, 'app/favicon.ico is the stock create-next-app icon');
  assert.ok(icoSizes(ico).includes(48), `favicon sizes ${icoSizes(ico)} must include 48`);
});

test('app icons exist and the layout does not add competing icon links', () => {
  for (const f of ['../app/icon.png', '../app/apple-icon.png']) assert.ok(existsSync(file(f)), `${f} missing`);
  const layout = readFileSync(file('../app/layout.js'), 'utf8');
  assert.doesNotMatch(layout, /<link[^>]+rel="(?:shortcut )?icon"/, 'icons must come from app/ files, not manual <link> tags');
});

test('web manifest icons are PNGs that exist (192 and 512)', () => {
  const manifest = JSON.parse(readFileSync(file('../public/site.webmanifest'), 'utf8'));
  const sizes = manifest.icons.map((i) => i.sizes);
  assert.ok(sizes.includes('192x192') && sizes.includes('512x512'));
  for (const icon of manifest.icons) {
    assert.equal(icon.type, 'image/png');
    assert.ok(existsSync(file(`../public${icon.src}`)), `${icon.src} missing`);
  }
});
