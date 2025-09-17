export type SessionId = 'Qualifying' | 'Race' | 'Sprint';

export type LanguageCode = 'en' | 'ru' | 'es' | 'fr' | 'de' | 'zh';

type FeatureDescriptor = {
  title: string;
  description: string;
};

type InsightDescriptor = {
  title: string;
  description: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterCopy = {
  tagline: string;
  productHeading: string;
  resourcesHeading: string;
  supportHeading: string;
  contactEmailLabel: string;
  contactEmail: string;
  legal: string;
  productLinks: FooterLink[];
  resourcesLinks: FooterLink[];
  supportLinks: FooterLink[];
};

export type TranslationBundle = {
  heroBadge: string;
  heroTitle: (seriesTitle: string) => string;
  heroSubtitle: string;
  seriesLabel: string;
  activeSelection: (names: string[]) => string;
  allSeriesHidden: string;
  reviewPeriodLabel: string;
  eventsInWindowLabel: string;
  nextStartLabel: string;
  noEvents: string;
  extendPeriodHint: string;
  countdownStart: (relative: string) => string;
  countdownFinish: (relative: string) => string;
  countdownScheduled: string;
  trackLayoutLabel: (parts: string[]) => string;
  trackLayoutUnavailable: string;
  languageLabel: string;
  seriesLogoAria: (series: string) => string;
  upcomingEventDescriptorFallback: string;
  brandName: string;
  navSchedule: string;
  navFeatures: string;
  navFaq: string;
  heroCta: string;
  scheduleTitle: string;
  scheduleSubtitle: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: FeatureDescriptor[];
  insightsTitle: string;
  insightsSubtitle: string;
  insightsSteps: InsightDescriptor[];
  faqTitle: string;
  faqSubtitle: string;
  faqItems: FaqItem[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  footer: FooterCopy;
};

export type LanguageDefinition = {
  code: LanguageCode;
  name: string;
  locale: string;
  periodOptions: { label: string; value?: number }[];
  sessionLabels: Record<SessionId, string>;
  texts: TranslationBundle;
};

export const LANGUAGE_DEFINITIONS = {
  ru: {
    code: 'ru',
    name: 'Русский',
    locale: 'ru',
    periodOptions: [
      { label: '24 часа', value: 24 },
      { label: '48 часов', value: 48 },
      { label: '72 часа', value: 72 },
      { label: '7 дней', value: 168 },
      { label: '30 дней' },
    ],
    sessionLabels: {
      Qualifying: 'Квалификация',
      Race: 'Гонка',
      Sprint: 'Спринт',
    },
    texts: {
      heroBadge: 'живой календарь уик-эндов',
      heroTitle: seriesTitle =>
        `Ближайшие квалификации и гонки — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Синхронизируйтесь с динамикой гоночных уик-эндов: фильтруйте серии, управляйте горизонтом просмотра и следите за временем старта в собственном часовом поясе.',
      seriesLabel: 'Серии',
      activeSelection: names => `Выбрано: ${names.join(' · ')}`,
      allSeriesHidden: 'Все серии скрыты',
      reviewPeriodLabel: 'Период обзора',
      eventsInWindowLabel: 'Событий в окне',
      nextStartLabel: 'Ближайший старт',
      noEvents: 'Нет событий',
      extendPeriodHint: 'Попробуйте расширить период',
      countdownStart: relative => `Старт ${relative}`,
      countdownFinish: relative => `Финиш ${relative}`,
      countdownScheduled: 'По расписанию',
      trackLayoutLabel: parts =>
        parts.length ? `Схема автодрома: ${parts.join(' — ')}` : 'Схема автодрома',
      trackLayoutUnavailable: 'Схема трассы появится позже',
      languageLabel: 'Язык',
      seriesLogoAria: series => `Логотип ${series}`,
      upcomingEventDescriptorFallback: 'Нет событий',
      brandName: 'RaceSync',
      navSchedule: 'Расписание',
      navFeatures: 'Возможности',
      navFaq: 'Вопросы',
      heroCta: 'К событиям',
      scheduleTitle: 'Лента уик-эндов',
      scheduleSubtitle: 'Онлайн-обновление стартов с учётом вашего часового пояса.',
      featuresTitle: 'Сила оперативного календаря',
      featuresSubtitle: 'Всё, чтобы не пропустить старт.',
      features: [
        {
          title: 'Время старта — по местному часовому поясу',
          description: 'Полное расписание уик-энда без расчётов и пересчётов. Поддержка F1, F2, F3 и MotoGP.',
        },
        {
          title: 'Точный обратный отсчёт',
          description: 'Время до старта показывается с точностью до часа и минут, чтобы было проще планировать ожидание.',
        },
        {
          title: 'Гибкий горизонт просмотра',
          description: '24, 48 или 72 часа, неделя или месяц — выбирайте, чтобы видеть только актуальные события.',
        },
      ],
      insightsTitle: 'Как использовать календарь',
      insightsSubtitle: 'Пара шагов — и расписание подстроится под вас.',
      insightsSteps: [
        {
          title: 'Выберите интересующие серии',
          description: 'Скрывайте и показывайте F1, F2, F3 и MotoGP одним кликом по бейджам серий.',
        },
        {
          title: 'Настройте горизонт просмотра',
          description: 'Ограничьте список ближайших стартов 24–72 часами, неделей или месяцем.',
        },
        {
          title: 'Следите за прогрессом уик-энда',
          description: 'Все квалификации, спринты и гонки показаны по порядку и отмечены текущим статусом.',
        },
      ],
      faqTitle: 'Частые вопросы',
      faqSubtitle: 'Ответы помогут быстрее разобраться с календарём.',
      faqItems: [
        {
          question: 'Как быстро обновляется расписание?',
          answer: 'Мы регулярно синхронизируемся с официальными календарями FIA и Dorna, и обновления появляются почти мгновенно.',
        },
        {
          question: 'Можно ли выгрузить события в календарь?',
          answer: 'Да, нажмите на ссылку “Скачать .ics” в разделе “Ресурсы”, чтобы импортировать события в свой календарь.',
        },
        {
          question: 'Работает ли это на мобильном?',
          answer: 'Да, интерфейс оптимизирован под мобильные устройства и поддерживает локальное сохранение настроек.',
        },
      ],
      ctaTitle: 'Откройте расписание уик-энда',
      ctaSubtitle: 'Настройте фильтры по сериям, выберите язык и следите за временем старта без лишних вкладок.',
      ctaButton: 'Перейти к событиям',
      footer: {
        tagline: 'RaceSync объединяет болельщиков, помогая всем следить за стартами в едином ритме.',
        productHeading: 'Продукт',
        resourcesHeading: 'Ресурсы',
        supportHeading: 'Поддержка',
        contactEmailLabel: 'Почта команды',
        contactEmail: 'hello@racesync.app',
        legal: '© {year} RaceSync. Все права защищены.',
        productLinks: [
          { label: 'Расписание', href: '#schedule' },
          { label: 'Функции', href: '#features' },
          { label: 'Как работает', href: '#insights' },
        ],
        resourcesLinks: [
          { label: 'FAQ', href: '#faq' },
          { label: 'Скачать .ics', href: './schedule.ics' },
        ],
        supportLinks: [
          { label: 'Написать на почту', href: 'mailto:hello@racesync.app' },
          { label: 'Политика конфиденциальности', href: '#privacy' },
        ],
      },
    },
  },
  en: {
    code: 'en',
    name: 'English',
    locale: 'en',
    periodOptions: [
      { label: '24 hours', value: 24 },
      { label: '48 hours', value: 48 },
      { label: '72 hours', value: 72 },
      { label: '7 days', value: 168 },
      { label: '30 days' },
    ],
    sessionLabels: {
      Qualifying: 'Qualifying',
      Race: 'Race',
      Sprint: 'Sprint',
    },
    texts: {
      heroBadge: 'live weekend schedule',
      heroTitle: seriesTitle =>
        `Next qualifying and race sessions — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Stay in sync with every session: filter racing series, choose your time window, and track local start times automatically.',
      seriesLabel: 'Series',
      activeSelection: names => `Selected: ${names.join(' · ')}`,
      allSeriesHidden: 'All series are hidden',
      reviewPeriodLabel: 'Window',
      eventsInWindowLabel: 'Sessions in view',
      nextStartLabel: 'Next start',
      noEvents: 'No sessions',
      extendPeriodHint: 'Try extending the time window',
      countdownStart: relative => `Starts ${relative}`,
      countdownFinish: relative => `Finishes ${relative}`,
      countdownScheduled: 'Scheduled',
      trackLayoutLabel: parts =>
        parts.length ? `Track layout: ${parts.join(' — ')}` : 'Track layout',
      trackLayoutUnavailable: 'Track layout coming soon',
      languageLabel: 'Language',
      seriesLogoAria: series => `${series} logo`,
      upcomingEventDescriptorFallback: 'No upcoming sessions',
      brandName: 'RaceSync',
      navSchedule: 'Schedule',
      navFeatures: 'Features',
      navFaq: 'FAQ',
      heroCta: 'View schedule',
      scheduleTitle: 'Upcoming weekend sessions',
      scheduleSubtitle: 'Live-updating start times with automatic time zone adjustments.',
      featuresTitle: 'Built for race weekend focus',
      featuresSubtitle: 'Stay ahead of every green light.',
      features: [
        {
          title: 'Local time, zero math',
          description: 'Every qualifying, sprint, and race translated into your local time zone.',
        },
        {
          title: 'Precise countdown',
          description: 'Hour- and minute-level countdowns so you know exactly when the next session begins.',
        },
        {
          title: 'Flexible viewing window',
          description: '24, 48, or 72 hours, a week or a month — tune the list to show only relevant sessions.',
        },
      ],
      insightsTitle: 'How to use RaceSync',
      insightsSubtitle: 'Three steps to tailor the schedule to your weekend.',
      insightsSteps: [
        {
          title: 'Pick your series',
          description: 'Toggle F1, F2, F3, and MotoGP from the series badges to hide or show events instantly.',
        },
        {
          title: 'Adjust the time window',
          description: 'Limit the upcoming list to 24–72 hours, a week, or a full month to match your planning horizon.',
        },
        {
          title: 'Track weekend progress',
          description: 'See qualifying, sprint, and race status at a glance, with live updates for completed sessions.',
        },
      ],
      faqTitle: 'Frequently asked questions',
      faqSubtitle: 'Quick answers for power users.',
      faqItems: [
        {
          question: 'Where do you source the schedule?',
          answer: 'We sync with official FIA and Dorna calendars and push updates as soon as they are published.',
        },
        {
          question: 'Can I add sessions to my calendar?',
          answer: 'Yes — use the “Download .ics” link under Resources to import every session into your calendar app.',
        },
        {
          question: 'Does this work on mobile?',
          answer: 'Absolutely. The interface is optimized for phones and tablets and stores your preferences locally.',
        },
      ],
      ctaTitle: 'Lock in every session',
      ctaSubtitle: 'Open the live schedule, set your filters, and be ready before the lights go out.',
      ctaButton: 'Open schedule',
      footer: {
        tagline: 'RaceSync keeps fans aligned with every session start worldwide.',
        productHeading: 'Product',
        resourcesHeading: 'Resources',
        supportHeading: 'Support',
        contactEmailLabel: 'Contact email',
        contactEmail: 'hello@racesync.app',
        legal: '© {year} RaceSync. All rights reserved.',
        productLinks: [
          { label: 'Schedule', href: '#schedule' },
          { label: 'Features', href: '#features' },
          { label: 'How it works', href: '#insights' },
        ],
        resourcesLinks: [
          { label: 'FAQ', href: '#faq' },
          { label: 'Download .ics', href: './schedule.ics' },
        ],
        supportLinks: [
          { label: 'Email support', href: 'mailto:hello@racesync.app' },
          { label: 'Privacy policy', href: '#privacy' },
        ],
      },
    },
  },
  es: {
    code: 'es',
    name: 'Español',
    locale: 'es',
    periodOptions: [
      { label: '24 horas', value: 24 },
      { label: '48 horas', value: 48 },
      { label: '72 horas', value: 72 },
      { label: '7 días', value: 168 },
      { label: '30 días' },
    ],
    sessionLabels: {
      Qualifying: 'Clasificación',
      Race: 'Carrera',
      Sprint: 'Sprint',
    },
    texts: {
      heroBadge: 'calendario en vivo de carreras',
      heroTitle: seriesTitle =>
        `Próximas clasificaciones y carreras — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Sigue cada sesión del fin de semana: filtra por serie, ajusta la ventana de tiempo y consulta tu hora local automáticamente.',
      seriesLabel: 'Series',
      activeSelection: names => `Seleccionado: ${names.join(' · ')}`,
      allSeriesHidden: 'Todas las series ocultas',
      reviewPeriodLabel: 'Ventana',
      eventsInWindowLabel: 'Sesiones en vista',
      nextStartLabel: 'Próximo inicio',
      noEvents: 'No hay sesiones',
      extendPeriodHint: 'Amplía la ventana de tiempo',
      countdownStart: relative => `Comienza ${relative}`,
      countdownFinish: relative => `Termina ${relative}`,
      countdownScheduled: 'Programado',
      trackLayoutLabel: parts =>
        parts.length ? `Trazado del circuito: ${parts.join(' — ')}` : 'Trazado del circuito',
      trackLayoutUnavailable: 'Pronto añadiremos el trazado',
      languageLabel: 'Idioma',
      seriesLogoAria: series => `Logotipo de ${series}`,
      upcomingEventDescriptorFallback: 'Sin próximas sesiones',
      brandName: 'RaceSync',
      navSchedule: 'Calendario',
      navFeatures: 'Funciones',
      navFaq: 'FAQ',
      heroCta: 'Ver calendario',
      scheduleTitle: 'Sesiones del fin de semana',
      scheduleSubtitle: 'Inicio de cada sesión en tu zona horaria, con actualizaciones automáticas.',
      featuresTitle: 'Pensado para fanáticos de las carreras',
      featuresSubtitle: 'No te pierdas ninguna salida.',
      features: [
        {
          title: 'Hora local sin cálculos',
          description: 'Clasificaciones, sprint y carreras convertidas automáticamente a tu zona horaria.',
        },
        {
          title: 'Cuenta regresiva precisa',
          description: 'Cuenta atrás con precisión de horas y minutos para saber exactamente cuándo comienza la próxima sesión.',
        },
        {
          title: 'Ventana ajustable',
          description: 'Selecciona 24, 48 o 72 horas, una semana o un mes para ver solo lo que te importa.',
        },
      ],
      insightsTitle: 'Cómo aprovechar RaceSync',
      insightsSubtitle: 'Tres pasos para adaptar el calendario a tu fin de semana.',
      insightsSteps: [
        {
          title: 'Elige las series',
          description: 'Activa o desactiva F1, F2, F3 y MotoGP desde los botones de series al instante.',
        },
        {
          title: 'Ajusta la ventana de tiempo',
          description: 'Limita la lista de próximos eventos a 24–72 horas, una semana o todo un mes.',
        },
        {
          title: 'Sigue el progreso del fin de semana',
          description: 'Consulta de un vistazo qué sesiones ya se disputaron y cuáles vienen a continuación.',
        },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqSubtitle: 'Respuestas rápidas para planificar mejor.',
      faqItems: [
        {
          question: '¿De dónde proviene la información?',
          answer: 'Sincronizamos con los calendarios oficiales de la FIA y Dorna y aplicamos los cambios al momento.',
        },
        {
          question: '¿Puedo exportar las sesiones?',
          answer: 'Sí, descarga el archivo .ics desde la sección Recursos para importarlo en tu calendario.',
        },
        {
          question: '¿Funciona en móviles?',
          answer: 'Sí, la interfaz está optimizada para móviles y guarda tus preferencias de idioma y series.',
        },
      ],
      ctaTitle: 'Prepara tu fin de semana',
      ctaSubtitle: 'Abre el calendario en vivo, configura los filtros y llega a tiempo a cada salida.',
      ctaButton: 'Abrir calendario',
      footer: {
        tagline: 'RaceSync sincroniza a los aficionados de todo el mundo con cada sesión.',
        productHeading: 'Producto',
        resourcesHeading: 'Recursos',
        supportHeading: 'Soporte',
        contactEmailLabel: 'Correo del equipo',
        contactEmail: 'hello@racesync.app',
        legal: '© {year} RaceSync. Todos los derechos reservados.',
        productLinks: [
          { label: 'Calendario', href: '#schedule' },
          { label: 'Funciones', href: '#features' },
          { label: 'Cómo funciona', href: '#insights' },
        ],
        resourcesLinks: [
          { label: 'FAQ', href: '#faq' },
          { label: 'Descargar .ics', href: './schedule.ics' },
        ],
        supportLinks: [
          { label: 'Contacto', href: 'mailto:hello@racesync.app' },
          { label: 'Política de privacidad', href: '#privacy' },
        ],
      },
    },
  },
  fr: {
    code: 'fr',
    name: 'Français',
    locale: 'fr',
    periodOptions: [
      { label: '24 heures', value: 24 },
      { label: '48 heures', value: 48 },
      { label: '72 heures', value: 72 },
      { label: '7 jours', value: 168 },
      { label: '30 jours' },
    ],
    sessionLabels: {
      Qualifying: 'Qualifications',
      Race: 'Course',
      Sprint: 'Sprint',
    },
    texts: {
      heroBadge: 'calendrier des week-ends en direct',
      heroTitle: seriesTitle =>
        `Prochaines qualifications et courses — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Restez synchronisé avec chaque session : filtrez les séries, ajustez la fenêtre temporelle et consultez automatiquement l\'heure locale.',
      seriesLabel: 'Séries',
      activeSelection: names => `Sélectionné : ${names.join(' · ')}`,
      allSeriesHidden: 'Toutes les séries sont masquées',
      reviewPeriodLabel: 'Fenêtre',
      eventsInWindowLabel: 'Sessions visibles',
      nextStartLabel: 'Prochain départ',
      noEvents: 'Aucune session',
      extendPeriodHint: 'Étendez la fenêtre temporelle',
      countdownStart: relative => `Début ${relative}`,
      countdownFinish: relative => `Fin ${relative}`,
      countdownScheduled: 'Prévu',
      trackLayoutLabel: parts =>
        parts.length ? `Tracé du circuit : ${parts.join(' — ')}` : 'Tracé du circuit',
      trackLayoutUnavailable: 'Tracé disponible bientôt',
      languageLabel: 'Langue',
      seriesLogoAria: series => `Logo ${series}`,
      upcomingEventDescriptorFallback: 'Aucune session à venir',
      brandName: 'RaceSync',
      navSchedule: 'Programme',
      navFeatures: 'Fonctionnalités',
      navFaq: 'FAQ',
      heroCta: 'Voir le programme',
      scheduleTitle: 'Sessions du week-end',
      scheduleSubtitle: 'Heures de départ locales mises à jour en temps réel.',
      featuresTitle: 'Pensé pour les passionnés',
      featuresSubtitle: 'Ne ratez aucun feu vert.',
      features: [
        {
          title: 'Heure locale automatique',
          description: 'Toutes les sessions du week-end converties dans votre fuseau horaire.',
        },
        {
          title: 'Compte à rebours précis',
          description: 'Heures et minutes restantes avant chaque session pour planifier au mieux.',
        },
        {
          title: 'Fenêtre personnalisable',
          description: '24, 48 ou 72 heures, une semaine ou un mois pour afficher uniquement les sessions pertinentes.',
        },
      ],
      insightsTitle: 'Comment utiliser RaceSync',
      insightsSubtitle: 'Adaptez le calendrier en trois étapes.',
      insightsSteps: [
        {
          title: 'Choisissez vos séries',
          description: 'Activez ou désactivez F1, F2, F3 et MotoGP depuis les badges de séries.',
        },
        {
          title: 'Réglez la fenêtre temporelle',
          description: 'Limitez la liste aux 24–72 heures à venir, à une semaine ou à un mois entier.',
        },
        {
          title: 'Suivez le déroulement du week-end',
          description: 'Repérez instantanément les sessions passées et à venir.',
        },
      ],
      faqTitle: 'Questions fréquentes',
      faqSubtitle: 'Des réponses rapides pour gagner du temps.',
      faqItems: [
        {
          question: 'Quelle est la source des horaires ?',
          answer: 'Nous synchronisons les calendriers officiels FIA et Dorna pour appliquer les mises à jour immédiatement.',
        },
        {
          question: 'Puis-je exporter les sessions ?',
          answer: 'Oui, téléchargez le fichier .ics dans la section Ressources pour l\'importer dans votre agenda.',
        },
        {
          question: 'Est-ce optimisé pour mobile ?',
          answer: 'Oui, l\'interface est adaptée aux mobiles et conserve vos préférences localement.',
        },
      ],
      ctaTitle: 'Préparez votre week-end',
      ctaSubtitle: 'Ouvrez le calendrier en direct, réglez vos filtres et soyez prêt avant chaque départ.',
      ctaButton: 'Accéder au calendrier',
      footer: {
        tagline: 'RaceSync synchronise les fans du monde entier avec chaque session.',
        productHeading: 'Produit',
        resourcesHeading: 'Ressources',
        supportHeading: 'Support',
        contactEmailLabel: 'Contact',
        contactEmail: 'hello@racesync.app',
        legal: '© {year} RaceSync. Tous droits réservés.',
        productLinks: [
          { label: 'Programme', href: '#schedule' },
          { label: 'Fonctionnalités', href: '#features' },
          { label: 'Comment ça marche', href: '#insights' },
        ],
        resourcesLinks: [
          { label: 'FAQ', href: '#faq' },
          { label: 'Télécharger .ics', href: './schedule.ics' },
        ],
        supportLinks: [
          { label: 'Assistance par e-mail', href: 'mailto:hello@racesync.app' },
          { label: 'Politique de confidentialité', href: '#privacy' },
        ],
      },
    },
  },
  de: {
    code: 'de',
    name: 'Deutsch',
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
      heroBadge: 'Live-Rennkalender',
      heroTitle: seriesTitle =>
        `Nächste Qualifyings und Rennen — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Bleib im Rhythmus jedes Rennwochenendes: Filtere Serien, wähle den Betrachtungszeitraum und sieh alle Startzeiten in deiner Zeitzone.',
      seriesLabel: 'Serien',
      activeSelection: names => `Ausgewählt: ${names.join(' · ')}`,
      allSeriesHidden: 'Alle Serien ausgeblendet',
      reviewPeriodLabel: 'Zeitraum',
      eventsInWindowLabel: 'Sessions im Blick',
      nextStartLabel: 'Nächster Start',
      noEvents: 'Keine Sessions',
      extendPeriodHint: 'Zeitraum erweitern',
      countdownStart: relative => `Startet ${relative}`,
      countdownFinish: relative => `Endet ${relative}`,
      countdownScheduled: 'Geplant',
      trackLayoutLabel: parts =>
        parts.length ? `Streckenlayout: ${parts.join(' — ')}` : 'Streckenlayout',
      trackLayoutUnavailable: 'Layout folgt in Kürze',
      languageLabel: 'Sprache',
      seriesLogoAria: series => `${series}-Logo`,
      upcomingEventDescriptorFallback: 'Keine bevorstehenden Sessions',
      brandName: 'RaceSync',
      navSchedule: 'Zeitplan',
      navFeatures: 'Funktionen',
      navFaq: 'FAQ',
      heroCta: 'Zeitplan ansehen',
      scheduleTitle: 'Sessions am Rennwochenende',
      scheduleSubtitle: 'Automatische Aktualisierung der Startzeiten in deiner Zeitzone.',
      featuresTitle: 'Für Rennwochenenden gebaut',
      featuresSubtitle: 'Keinen Start mehr verpassen.',
      features: [
        {
          title: 'Lokale Startzeiten',
          description: 'Qualifying, Sprint und Rennen direkt in deiner Zeitzone – ohne Umrechnen.',
        },
        {
          title: 'Präziser Countdown',
          description: 'Countdown auf Stunden- und Minutenbasis, damit du immer weißt, wann es losgeht.',
        },
        {
          title: 'Flexible Ansicht',
          description: '24, 48 oder 72 Stunden, eine Woche oder ein Monat – zeig nur, was gerade zählt.',
        },
      ],
      insightsTitle: 'So nutzt du RaceSync',
      insightsSubtitle: 'Drei Schritte für deinen perfekten Überblick.',
      insightsSteps: [
        {
          title: 'Serien auswählen',
          description: 'Blende F1, F2, F3 und MotoGP mit den Serien-Badges nach Bedarf ein oder aus.',
        },
        {
          title: 'Zeitraum einstellen',
          description: 'Beschränke die Liste der Sessions auf 24–72 Stunden, eine Woche oder einen Monat.',
        },
        {
          title: 'Wochenendfortschritt verfolgen',
          description: 'Sieh sofort, welche Sessions abgeschlossen sind und welche als nächstes starten.',
        },
      ],
      faqTitle: 'Häufige Fragen',
      faqSubtitle: 'Schnelle Antworten für Rennfans.',
      faqItems: [
        {
          question: 'Woher stammen die Daten?',
          answer: 'Wir synchronisieren mit den offiziellen FIA- und Dorna-Kalendern und aktualisieren sofort.',
        },
        {
          question: 'Kann ich Sessions exportieren?',
          answer: 'Ja, lade die .ics-Datei im Bereich „Ressourcen“ herunter und importiere sie in deinen Kalender.',
        },
        {
          question: 'Funktioniert das auf dem Handy?',
          answer: 'Ja, die Oberfläche ist mobiloptimiert und speichert deine Einstellungen lokal.',
        },
      ],
      ctaTitle: 'Starte dein Rennwochenende',
      ctaSubtitle: 'Öffne den Live-Zeitplan, setze deine Filter und sei bereit, bevor die Lichter ausgehen.',
      ctaButton: 'Zeitplan öffnen',
      footer: {
        tagline: 'RaceSync bringt Fans weltweit im selben Takt an den Start.',
        productHeading: 'Produkt',
        resourcesHeading: 'Ressourcen',
        supportHeading: 'Support',
        contactEmailLabel: 'Kontakt',
        contactEmail: 'hello@racesync.app',
        legal: '© {year} RaceSync. Alle Rechte vorbehalten.',
        productLinks: [
          { label: 'Zeitplan', href: '#schedule' },
          { label: 'Funktionen', href: '#features' },
          { label: 'Funktionsweise', href: '#insights' },
        ],
        resourcesLinks: [
          { label: 'FAQ', href: '#faq' },
          { label: '.ics herunterladen', href: './schedule.ics' },
        ],
        supportLinks: [
          { label: 'E-Mail-Support', href: 'mailto:hello@racesync.app' },
          { label: 'Datenschutz', href: '#privacy' },
        ],
      },
    },
  },
  zh: {
    code: 'zh',
    name: '中文',
    locale: 'zh',
    periodOptions: [
      { label: '24 小时', value: 24 },
      { label: '48 小时', value: 48 },
      { label: '72 小时', value: 72 },
      { label: '7 天', value: 168 },
      { label: '30 天' },
    ],
    sessionLabels: {
      Qualifying: '排位赛',
      Race: '正赛',
      Sprint: '冲刺赛',
    },
    texts: {
      heroBadge: '实时赛程日历',
      heroTitle: seriesTitle =>
        `下一场排位和正赛 — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        '掌握整个周末的节奏：按系列筛选赛事、选择时间窗口，并自动转换为本地开始时间。',
      seriesLabel: '系列',
      activeSelection: names => `已选择：${names.join(' · ')}`,
      allSeriesHidden: '所有系列均被隐藏',
      reviewPeriodLabel: '时间范围',
      eventsInWindowLabel: '窗口内的赛事',
      nextStartLabel: '下一场开始',
      noEvents: '暂无赛事',
      extendPeriodHint: '尝试延长时间范围',
      countdownStart: relative => `开始于 ${relative}`,
      countdownFinish: relative => `结束于 ${relative}`,
      countdownScheduled: '按计划进行',
      trackLayoutLabel: parts =>
        parts.length ? `赛道布局：${parts.join(' — ')}` : '赛道布局',
      trackLayoutUnavailable: '赛道布局即将上线',
      languageLabel: '语言',
      seriesLogoAria: series => `${series} 标志`,
      upcomingEventDescriptorFallback: '暂无即将开始的赛事',
      brandName: 'RaceSync',
      navSchedule: '赛程',
      navFeatures: '功能',
      navFaq: '常见问题',
      heroCta: '查看赛程',
      scheduleTitle: '周末赛事一览',
      scheduleSubtitle: '所有开始时间自动转换为本地时间并实时更新。',
      featuresTitle: '为赛车周末而生',
      featuresSubtitle: '不错过每一次熄灯。',
      features: [
        {
          title: '本地时间无需换算',
          description: '排位赛、冲刺赛和正赛全部显示为你的本地时间。',
        },
        {
          title: '精准倒计时',
          description: '以小时和分钟为单位的倒计时，让你准确掌握下一场的开始时间。',
        },
        {
          title: '可调节查看窗口',
          description: '24、48、72 小时、一周或一个月，自由选择查看范围。',
        },
      ],
      insightsTitle: '如何使用 RaceSync',
      insightsSubtitle: '三步即可完成个性化设置。',
      insightsSteps: [
        {
          title: '选择关注的系列',
          description: '通过系列标签随时显示或隐藏 F1、F2、F3 和 MotoGP 的赛事。',
        },
        {
          title: '调整时间范围',
          description: '根据计划，将列表限制在未来 24–72 小时、一周或整个月。',
        },
        {
          title: '追踪周末进度',
          description: '快速查看排位、冲刺和正赛的最新状态。',
        },
      ],
      faqTitle: '常见问题',
      faqSubtitle: '快速找到需要的答案。',
      faqItems: [
        {
          question: '赛程信息来自哪里？',
          answer: '我们与 FIA 和 Dorna 的官方日历保持同步，并在更新后第一时间刷新内容。',
        },
        {
          question: '可以导出到日历吗？',
          answer: '可以，点击资源中的 “下载 .ics” 链接，即可导入到你的日历应用。',
        },
        {
          question: '手机使用体验如何？',
          answer: '界面针对移动端优化，并会在本地保存语言和筛选设置。',
        },
      ],
      ctaTitle: '准备好迎接下一场比赛',
      ctaSubtitle: '打开实时赛程，设置好偏好，提前进入比赛节奏。',
      ctaButton: '立即查看',
      footer: {
        tagline: 'RaceSync 让全球车迷在同一节奏下迎接每个赛道周末。',
        productHeading: '产品',
        resourcesHeading: '资源',
        supportHeading: '支持',
        contactEmailLabel: '团队邮箱',
        contactEmail: 'hello@racesync.app',
        legal: '© {year} RaceSync。保留所有权利。',
        productLinks: [
          { label: '赛程', href: '#schedule' },
          { label: '功能', href: '#features' },
          { label: '如何使用', href: '#insights' },
        ],
        resourcesLinks: [
          { label: '常见问题', href: '#faq' },
          { label: '下载 .ics', href: './schedule.ics' },
        ],
        supportLinks: [
          { label: '邮件联系', href: 'mailto:hello@racesync.app' },
          { label: '隐私政策', href: '#privacy' },
        ],
      },
    },
  },
} satisfies Record<LanguageCode, LanguageDefinition>;

export const LANGUAGE_CODES = Object.keys(LANGUAGE_DEFINITIONS) as LanguageCode[];

export const DEFAULT_LANGUAGE: LanguageCode = 'ru';

export function isLanguageCode(value: string): value is LanguageCode {
  return Object.prototype.hasOwnProperty.call(LANGUAGE_DEFINITIONS, value);
}
