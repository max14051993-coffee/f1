# Site analysis

## Overview
RaceSync is a client-side Next.js page that renders a localized schedule of racing events with filtering controls, feature highlights, FAQs, and a modal privacy policy. The core page lives in `app/page.tsx`, with localized strings defined in `lib/language.ts`.

## Key issues and recommended fixes

### 1. Localized hero title is hard-coded
The hero heading is currently hard-coded to "My coffee experience" instead of using the `heroTitle` translation hook defined for every language. This freezes the main marketing message in English, breaks localization, and wastes the dynamic helper that can inject the active series name or other contextual data.【F:app/page.tsx†L436-L452】【F:lib/language.ts†L128-L189】

**Fix**: Replace the literal text with a call such as `{texts.heroTitle(heroSeriesDefinition.label)}` (or another relevant string) so that every locale displays its own copy. Consider adding a fallback parameter to support dynamic data.

### 2. Theme toggle accessibility state is inverted
The header theme toggle sets `aria-pressed={theme === 'light'}` even though the visual "pressed" state corresponds to the dark theme. Screen reader users are told the button is pressed when the light theme is active, which contradicts the actual behavior and WCAG's expectations for toggle buttons.【F:app/page.tsx†L360-L376】【F:app/hooks/useThemePreference.ts†L1-L76】

**Fix**: Align `aria-pressed` with the real active state (`theme === 'dark'`) or switch to a `role="switch"` with `aria-checked`. Also review the `data-theme-state` styling to ensure the two indicators stay synchronized.

### 3. Schedule fetch lacks error handling and loading feedback
If `fetch('./schedule.ics')` fails or takes time (e.g., due to network issues), the UI silently renders an empty schedule without messaging. Because the effect swallows errors with `console.error`, end users are left with a blank grid and no guidance.【F:app/page.tsx†L41-L49】

**Fix**: Track loading and error state in React (e.g., `isLoading`, `loadError`). Display a spinner or skeleton while loading, and a localized error banner if the download fails, retrying when appropriate.

### 4. Language switcher is missing accessible labeling
The language button exposes only the short language code ("RU", "EN", etc.), with no `aria-label` describing its purpose. Screen reader users may not know that the control opens a language picker, and `aria-haspopup` without a name violates ARIA's labeling rule.【F:app/page.tsx†L360-L420】【F:lib/language.ts†L128-L189】

**Fix**: Provide an accessible label (e.g., `aria-label={texts.languageLabel}`) on the toggle button and ensure the currently selected language is announced, possibly by using `aria-labelledby` that references both the button text and a hidden label.

### 5. Privacy policy modal does not trap focus
Opening the privacy policy sets focus to the dialog, but there is no focus trap to keep keyboard users inside the modal. Tabbing can move focus to controls behind the overlay, which violates WCAG modal dialog guidance.【F:app/page.tsx†L200-L320】【F:app/page.tsx†L520-L720】

**Fix**: Implement a simple focus trap (e.g., storing focusable elements in the modal and cycling focus, or using a utility like `focus-trap`). Also restore focus to the trigger button when the modal closes for better usability.

## Additional observations
* The countdown strings rely on `texts.countdown*`; ensure translations supply natural phrasing for relative times once dynamic data is wired in.【F:lib/language.ts†L128-L189】
* Track layout SVGs already expose an accessible label via `aria-label`, which is a good pattern to maintain.【F:app/page.tsx†L520-L640】
