// The layout's inline <script> strings and the template's public/js files are
// never parsed by `next build`, so a syntax error in them ships silently. On
// 24 Nov 2026 a stray "})" in the layout script reached production
// ("Uncaught SyntaxError: Unexpected token ')'") and stopped the jQuery plugins.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('inline scripts in the root layout parse', () => {
  const layout = read('../app/layout.js');
  const scripts = [
    ...[...layout.matchAll(/__html:\s*`([\s\S]*?)`/g)].map((m) => m[1]),
    ...[...layout.matchAll(/<Script[^>]*>\s*\{`([\s\S]*?)`\}/g)].map((m) => m[1]), // GA, Meta Pixel
  ];
  assert.ok(scripts.length > 0, 'expected at least one inline script');
  // ${...} placeholders are filled in at build time; any value parses.
  for (const source of scripts.map((s) => s.replace(/\$\{[^}]*\}/g, 'false'))) {
    assert.doesNotThrow(() => new vm.Script(source), `inline script failed to parse:\n${source.slice(0, 200)}`);
  }
});

test('template main.js parses', () => {
  assert.doesNotThrow(() => new vm.Script(read('../public/js/main.js')));
});
