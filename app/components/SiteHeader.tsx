'use client';

import { useRef } from 'react';

import type { TranslationBundle } from '../../lib/language';
import { useHeaderOffset } from '../hooks/useHeaderOffset';
import { LanguageMenu } from './LanguageMenu';
import type { LanguageCode } from '../../lib/language';
import type { Theme } from '../../lib/theme';

type SiteHeaderProps = {
  texts: TranslationBundle;
  theme: Theme;
  onToggleTheme: () => void;
  language: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
};

export function SiteHeader({
  texts,
  theme,
  onToggleTheme,
  language,
  onSelectLanguage,
}: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  useHeaderOffset(headerRef);

  const themeCopy = texts.theme;
  const themeButtonLabel = theme === 'dark' ? themeCopy.toggleToLight : themeCopy.toggleToDark;

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header__inner">
        <div className="site-header__row site-header__row--main">
          <a className="site-header__brand" href="#top">
            <span className="site-header__brand-mark" aria-hidden>
              🏁
            </span>
            <span className="site-header__brand-text">{texts.brandName}</span>
          </a>
          <nav className="site-header__nav" aria-label={texts.brandName}>
            <a className="site-header__link" href="#features">
              {texts.navFeatures}
            </a>
            <a className="site-header__link" href="#faq">
              {texts.navFaq}
            </a>
          </nav>
          <div className="site-header__actions">
            <a className="site-header__cta" href="#schedule">
              {texts.heroCta}
            </a>
            <button
              type="button"
              className="theme-toggle"
              aria-label={themeButtonLabel}
              role="switch"
              aria-checked={theme === 'dark'}
              data-theme-state={theme}
              onClick={onToggleTheme}
            >
              <span className="theme-toggle__icons" aria-hidden>
                <span className="theme-toggle__icon theme-toggle__icon--moon">🌙</span>
                <span className="theme-toggle__icon theme-toggle__icon--sun">☀️</span>
              </span>
            </button>
            <div className="site-header__meta-group">
              <LanguageMenu language={language} onSelect={onSelectLanguage} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
