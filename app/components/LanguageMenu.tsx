'use client';

import { KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from 'react';

import { LANGUAGE_CODES, LANGUAGE_DEFINITIONS, type LanguageCode } from '../../lib/language';

type LanguageMenuProps = {
  language: LanguageCode;
  onSelect: (code: LanguageCode) => void;
};

export function LanguageMenu({ language, onSelect }: LanguageMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const displayName = LANGUAGE_DEFINITIONS[language].shortName || LANGUAGE_DEFINITIONS[language].name;
  const menuLabel =
    language === 'ru'
      ? `Выбор языка. Текущий язык: ${displayName}`
      : `Language selector. Current language: ${displayName}`;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (controlRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const openWithCurrentLanguage = () => {
    setFocusedIndex(
      Math.max(
        0,
        LANGUAGE_CODES.findIndex(code => code === language),
      ),
    );
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    optionRefs.current[focusedIndex]?.focus({ preventScroll: true });
  }, [isOpen, focusedIndex]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openWithCurrentLanguage();
    }
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % LANGUAGE_CODES.length);
        return;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => (prev - 1 + LANGUAGE_CODES.length) % LANGUAGE_CODES.length);
        return;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        return;
      case 'End':
        event.preventDefault();
        setFocusedIndex(LANGUAGE_CODES.length - 1);
        return;
      case 'Enter': {
        event.preventDefault();
        const code = LANGUAGE_CODES[focusedIndex];
        if (code) {
          onSelect(code);
        }
        setIsOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
      }
    }
  };

  const selectAndClose = (code: LanguageCode) => {
    onSelect(code);
    setIsOpen(false);
    toggleRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="site-header__meta-portion site-header__language" ref={controlRef}>
      <button
        type="button"
        id="language-select"
        className="site-header__language-toggle"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="language-select-menu"
        aria-label={menuLabel}
        ref={toggleRef}
        onClick={() => (isOpen ? setIsOpen(false) : openWithCurrentLanguage())}
        onKeyDown={handleToggleKeyDown}
      >
        <span className="site-header__language-value">{displayName}</span>
      </button>
      {isOpen ? (
        <ul
          className="site-header__language-menu"
          role="listbox"
          id="language-select-menu"
          aria-labelledby="language-select"
          onKeyDown={handleMenuKeyDown}
        >
          {LANGUAGE_CODES.map(code => {
            const definition = LANGUAGE_DEFINITIONS[code];
            const isSelected = code === language;
            return (
              <li
                key={code}
                className="site-header__language-option"
                role="option"
                aria-selected={isSelected}
              >
                <button
                  type="button"
                  className="site-header__language-option-button"
                  data-active={isSelected}
                  ref={element => {
                    optionRefs.current[LANGUAGE_CODES.indexOf(code)] = element;
                  }}
                  onClick={() => selectAndClose(code)}
                >
                  <span className="site-header__language-option-name">{definition.name}</span>
                  {isSelected && <span className="site-header__language-option-check">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
