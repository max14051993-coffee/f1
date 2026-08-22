'use client';

import { useEffect, useRef } from 'react';

import type { TranslationBundle } from '../../lib/language';

type PrivacyPolicyCopy = TranslationBundle['privacyPolicy'];

type PrivacyPolicyModalProps = {
  policy: PrivacyPolicyCopy;
  onClose: () => void;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(element => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
}

export function PrivacyPolicyModal({ policy, onClose }: PrivacyPolicyModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = 'privacy-policy-title';
  const descriptionId = 'privacy-policy-description';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    getFocusableElements(dialog)[0]?.focus({ preventScroll: true });
    if (!dialog.contains(document.activeElement)) {
      dialog.focus({ preventScroll: true });
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__dialog" role="document" ref={dialogRef} tabIndex={-1}>
        <div className="modal__header">
          <div className="modal__headline">
            <h2 className="modal__title" id={titleId}>
              {policy.title}
            </h2>
            <p className="privacy-policy__meta">{policy.lastUpdated}</p>
          </div>
          <button type="button" className="modal__close" onClick={onClose}>
            {policy.closeLabel}
          </button>
        </div>
        <div className="modal__content" id={descriptionId}>
          {policy.intro.map((paragraph, index) => (
            <p key={`privacy-intro-${index}`} className="privacy-policy__paragraph">
              {paragraph}
            </p>
          ))}
          {policy.sections.map((section, sectionIndex) => (
            <section className="privacy-policy__section" key={`privacy-section-${sectionIndex}`}>
              <h3 className="privacy-policy__section-title">{section.title}</h3>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`privacy-section-${sectionIndex}-paragraph-${paragraphIndex}`}
                  className="privacy-policy__paragraph"
                >
                  {paragraph}
                </p>
              ))}
              {section.list ? (
                <ul className="privacy-policy__list">
                  {section.list.map((item, itemIndex) => (
                    <li key={`privacy-section-${sectionIndex}-item-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          <p className="privacy-policy__paragraph privacy-policy__conclusion">{policy.conclusion}</p>
        </div>
      </div>
    </div>
  );
}
