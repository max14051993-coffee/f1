'use client';

import type { FooterCopy } from '../../lib/language';

type SiteFooterProps = {
  brandName: string;
  footer: FooterCopy;
  onOpenPrivacyPolicy: () => void;
};

function FooterLink({ link }: { link: FooterCopy['productLinks'][number] }) {
  return (
    <a href={link.href} {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
      {link.label}
    </a>
  );
}

export function SiteFooter({ brandName, footer, onOpenPrivacyPolicy }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();
  const footerLegal = footer.legal.replace('{year}', currentYear.toString());

  return (
    <footer className="site-footer" id="footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand-block">
          <a className="site-footer__brand" href="#top">
            <span className="site-footer__brand-mark" aria-hidden>
              🏁
            </span>
            <span className="site-footer__brand-text">{brandName}</span>
          </a>
          <p className="site-footer__tagline">{footer.tagline}</p>
          <div className="site-footer__contact">
            <span className="site-footer__contact-label">{footer.contactEmailLabel}</span>
            <a className="site-footer__contact-link" href={`mailto:${footer.contactEmail}`}>
              {footer.contactEmail}
            </a>
          </div>
        </div>
        <div className="site-footer__columns">
          <div className="site-footer__column">
            <h3 className="site-footer__heading">{footer.productHeading}</h3>
            <ul className="site-footer__list">
              {footer.productLinks.map(link => (
                <li key={`${link.href}-${link.label}`} className="site-footer__list-item">
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </div>
          <div className="site-footer__column">
            <h3 className="site-footer__heading">{footer.resourcesHeading}</h3>
            <ul className="site-footer__list">
              {footer.resourcesLinks.map(link => (
                <li key={`${link.href}-${link.label}`} className="site-footer__list-item">
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </div>
          <div className="site-footer__column">
            <h3 className="site-footer__heading">{footer.supportHeading}</h3>
            <ul className="site-footer__list">
              {footer.supportLinks.map(link => (
                <li key={`${link.href}-${link.label}`} className="site-footer__list-item">
                  {link.href === '#privacy' ? (
                    <button type="button" className="site-footer__list-button" onClick={onOpenPrivacyPolicy}>
                      {link.label}
                    </button>
                  ) : (
                    <FooterLink link={link} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="site-footer__legal" id="privacy">
        <span>{footerLegal}</span>
      </div>
    </footer>
  );
}
