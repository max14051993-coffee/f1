import type { LanguageDefinition } from './types';
import { formatCountdownStart } from './countdown';

export const de: LanguageDefinition = {
  code: 'de',
  name: 'Deutsch',
  shortName: 'DE',
  locale: 'de',
  periodOptions: [
    { label: '24 Stunden', value: 24 },
    { label: '48 Stunden', value: 48 },
    { label: '72 Stunden', value: 72 },
    { label: '7 Tage', value: 168 },
    { label: '30 Tage' },
  ],
  sessionLabels: {
    Qualifying: 'Qualifying',
    Race: 'Rennen',
    Sprint: 'Sprint',
  },
  texts: {
    heroTitle: 'My race weekend',
    heroSubtitle:
      'Bleib mit den Rennwochenenden im Takt: Filtere die Serien, passe das Betrachtungsfenster an und verfolge die Sessionzeiten in deiner eigenen Zeitzone.',
    seriesLabel: 'Serien',
    activeSelection: names => `Ausgewählt: ${names.join(' · ')}`,
    allSeriesHidden: 'Alle Serien ausgeblendet',
    reviewPeriodLabel: 'Betrachtungszeitraum',
    eventsInWindowLabel: 'Events im Zeitraum',
    nextStartLabel: 'Nächste Session',
    noEvents: 'Keine Events',
    extendPeriodHint: 'Versuche den Zeitraum zu vergrößern',
    countdownStart: relative => formatCountdownStart(relative, 'Beginnt', 'Beginnt in'),
    countdownLive: relative => (relative ? `Live • Start ${relative}` : 'Live'),
    countdownFinish: relative => `Beendet ${relative}`,
    countdownScheduled: 'Planmäßig',
    trackLayoutLabel: parts =>
      parts.length ? `Streckenlayout: ${parts.join(' — ')}` : 'Streckenlayout',
    theme: {
      toggleToDark: 'Zur dunklen Ansicht wechseln',
      toggleToLight: 'Zur hellen Ansicht wechseln',
    },
    upcomingEventDescriptorFallback: 'Keine Events',
    brandName: 'RaceSync',
    navFeatures: 'Funktionen',
    navFaq: 'FAQ',
    heroCta: 'Zum Kalender',
    scheduleTitle: 'Wochenend-Feed',
    scheduleSubtitle: 'Live aktualisierte Startzeiten in deiner Zeitzone.',
    scheduleLoadingLabel: 'Zeitplan wird geladen…',
    scheduleErrorTitle: 'Zeitplan konnte nicht geladen werden',
    scheduleErrorDescription: 'Bitte versuche es erneut. Wenn der Fehler bleibt, öffne die Kalenderdatei direkt.',
    scheduleRetryButton: 'Erneut versuchen',
    scheduleErrorFallbackPrefix: 'Diagnosedatei:',
    scheduleIcsLinkLabel: 'schedule.ics öffnen',
    featuresTitle: 'Darum RaceSync',
    featuresSubtitle: 'Durchdachte Werkzeuge für deine Rennplanung.',
    features: [
      {
        title: 'Lokale Zeiten automatisch',
        description: 'Alle Sessions erscheinen direkt in deiner Zeitzone – keine Umrechnung mehr.',
      },
      {
        title: 'Serien flexibel steuern',
        description: 'Blende F1, F2, F3 oder MotoGP nach Bedarf ein oder aus.',
      },
      {
        title: 'Streckenansichten inklusive',
        description: 'Jedes Event zeigt den Kursverlauf und liefert zusätzlichen Kontext.',
      },
    ],
    insightsTitle: 'So funktioniert es',
    insightsSubtitle: 'Drei Schritte, um keine Session zu verpassen.',
    insightsSteps: [
      {
        title: 'Wähle deine Serien',
        description: 'Lass nur die Meisterschaften sichtbar, die dich interessieren.',
      },
      {
        title: 'Passe den Zeitraum an',
        description: 'Erweitere den Blick auf 30 Tage oder konzentriere dich auf die nächsten 24 Stunden.',
      },
      {
        title: 'Behalte den Countdown im Blick',
        description: 'Live-Timer zeigen, wie lange es bis zu Qualifying oder Rennen dauert.',
      },
    ],
    faqTitle: 'Häufige Fragen',
    faqSubtitle: 'Antworten auf die wichtigsten Themen aus der Community.',
    faqItems: [
      {
        question: 'Woher stammen die Daten?',
        answer:
          'Wir nutzen die offiziellen Meisterschaftskalender und aktualisieren den Feed automatisch.',
      },
      {
        question: 'Funktioniert das auf dem Smartphone?',
        answer: 'Ja, das Layout ist mobilfreundlich und speichert deine Einstellungen lokal.',
      },
      {
        question: 'Warum sehe ich ein Event nicht?',
        answer: 'Aktiviere die passende Serie und vergrößere bei Bedarf den Betrachtungszeitraum.',
      },
    ],
    ctaTitle: 'Bereit für das Startsignal?',
    ctaSubtitle: 'Öffne den Live-Kalender, stelle deine Filter ein und bleib immer informiert.',
    ctaButton: 'Kalender öffnen',
    footer: {
      tagline: 'RaceSync hält Fans weltweit mit jedem Rennwochenende synchron.',
      productHeading: 'Produkt',
      resourcesHeading: 'Ressourcen',
      supportHeading: 'Support',
      contactEmailLabel: 'Team-E-Mail',
      contactEmail: 'hello@racesync.app',
      legal: '© {year} RaceSync. Alle Rechte vorbehalten.',
      productLinks: [
        { label: 'Kalender', href: '#schedule' },
        { label: 'Funktionen', href: '#features' },
        { label: 'So funktioniert es', href: '#insights' },
      ],
      resourcesLinks: [
        { label: 'Häufige Fragen', href: '#faq' },
        { label: '.ics herunterladen', href: './schedule.ics' },
      ],
      supportLinks: [
        { label: 'Kontakt per E-Mail', href: 'mailto:hello@racesync.app' },
        { label: 'Datenschutz', href: '#privacy' },
      ],
    },
    privacyPolicy: {
      title: 'Datenschutzerklärung',
      lastUpdated: 'Zuletzt aktualisiert: 20. März 2024',
      intro: [
        'RaceSync hilft Fans, Motorsport-Kalender zu verfolgen und erhebt dabei so wenige personenbezogene Daten wie möglich. Diese Erklärung erläutert, welche Informationen wir verarbeiten, wenn du die Website besuchst oder unsere Kalender nutzt.',
      ],
      sections: [
        {
          title: 'Welche Daten wir erfassen',
          paragraphs: [
            'Wir sammeln nur die Angaben, die für den Betrieb und die Verbesserung des Dienstes erforderlich sind.',
          ],
          list: [
            'Kontaktdaten, die du freiwillig an hello@racesync.app sendest.',
            'Anonymisierte Nutzungsstatistiken zu Seitenaufrufen und Funktionen.',
            'Technische Protokolle, die automatisch zur Sicherung und Stabilität der Website erstellt werden.',
          ],
        },
        {
          title: 'Wie wir die Daten nutzen',
          paragraphs: [
            'Die gesammelten Informationen helfen uns, RaceSync weiterzuentwickeln und eine stabile Erfahrung für alle sicherzustellen.',
          ],
          list: [
            'Antworten auf Fragen oder Feedback, das du per E-Mail sendest.',
            'Verstehen, welche Bereiche und Funktionen für Fans am wichtigsten sind.',
            'Technische Probleme erkennen und die Infrastruktur vor Missbrauch schützen.',
          ],
        },
        {
          title: 'Aufbewahrung und Sicherheit',
          paragraphs: [
            'Der Zugriff auf Daten ist auf das kleine RaceSync-Team beschränkt. Analysen werden nur in aggregierter Form gespeichert und lassen keine Rückschlüsse auf einzelne Besucher zu.',
            'Nachrichten werden nur so lange aufbewahrt, wie es zur Bearbeitung deiner Anfrage nötig ist, und anschließend aus aktiven Systemen gelöscht.',
          ],
        },
        {
          title: 'Deine Optionen',
          paragraphs: [
            'Du kannst anonyme Analysen über deinen Browser oder Blocker einschränken. Wenn du zuvor übermittelte Informationen entfernen lassen möchtest, kontaktiere uns und wir kümmern uns zeitnah darum.',
          ],
        },
      ],
      conclusion:
        'Du hast Fragen zum Datenschutz bei RaceSync? Schreib an hello@racesync.app und wir melden uns schnellstmöglich.',
      closeLabel: 'Schließen',
    },
  },
};
