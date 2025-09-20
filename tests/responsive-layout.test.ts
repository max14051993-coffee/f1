import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

describe('responsive layout styles', () => {
  it('adjusts navigation layout for tablet and mobile breakpoints', () => {
    expect(css).toMatch(/@media \(max-width: 900px\)[\s\S]*?\.site-header__nav[\s\S]*?justify-content:\s*flex-start;/);
    expect(css).toMatch(/@media \(max-width: 540px\)[\s\S]*?\.site-header__row--main[\s\S]*?grid-template-areas:/);
  });

  it('reflows the hero grid across breakpoints', () => {
    expect(css).toMatch(/@media \(max-width: 960px\)[\s\S]*?\.hero__layout[\s\S]*?minmax\(240px, 1fr\)/);
    expect(css).toMatch(/@media \(max-width: 720px\)[\s\S]*?\.hero__layout[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  });

  it('collapses the footer columns on small screens', () => {
    expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*?\.site-footer__inner[\s\S]*?grid-template-columns:\s*1fr/);
    expect(css).toMatch(/@media \(max-width: 520px\)[\s\S]*?\.site-footer__columns[\s\S]*?grid-template-columns:\s*1fr/);
  });
});
