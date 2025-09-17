'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { getTrackLayout } from '../lib/track-layouts';

type SeriesDefinition = {
  label: string;
  accentColor: string;
  accentRgb: string;
  logoBackground: string;
  logoAsset?: string;
};

const ASSET_PREFIX = (process.env.NEXT_PUBLIC_ASSET_PREFIX ?? '').replace(/\/$/, '');

function prefixAssetPath(asset?: string) {
  if (!asset) return undefined;
  if (asset.startsWith('http://') || asset.startsWith('https://')) return asset;
  if (!ASSET_PREFIX) return asset;
  if (asset.startsWith('/')) return `${ASSET_PREFIX}${asset}`;
  return `${ASSET_PREFIX}/${asset}`;
}

const SERIES_DEFINITIONS = {
  F1: {
    label: 'F1',
    accentColor: '#e10600',
    accentRgb: '225, 6, 0',
    logoBackground: '#111',
    logoAsset: '/logos/f1.svg',
  },
  F2: {
    label: 'F2',
    accentColor: '#0090ff',
    accentRgb: '0, 144, 255',
    logoBackground: '#fff',
    logoAsset: '/logos/f2.svg',
  },
  F3: {
    label: 'F3',
    accentColor: '#ff6f00',
    accentRgb: '255, 111, 0',
    logoBackground: '#fff',
    logoAsset: '/logos/f3.svg',
  },
  MotoGP: {
    label: 'MotoGP',
    accentColor: '#ff0050',
    accentRgb: '255, 0, 80',
    logoBackground: '#fff',
    logoAsset: '/logos/motogp.svg',
  },
} as const satisfies Record<string, SeriesDefinition>;

type SeriesId = keyof typeof SERIES_DEFINITIONS;

const SERIES_IDS = Object.keys(SERIES_DEFINITIONS) as SeriesId[];

const DEFAULT_SERIES_ID = SERIES_IDS[0];

const FALLBACK_SERIES_DEFINITION =
  DEFAULT_SERIES_ID ? SERIES_DEFINITIONS[DEFAULT_SERIES_ID] : undefined;

function isSeriesId(value: string): value is SeriesId {
  return Object.prototype.hasOwnProperty.call(SERIES_DEFINITIONS, value);
}

function buildSeriesVisibility(value: boolean): Record<SeriesId, boolean> {
  return SERIES_IDS.reduce((acc, series) => {
    acc[series] = value;
    return acc;
  }, {} as Record<SeriesId, boolean>);
}

type Row = {
  series: SeriesId;
  round: string;
  country?: string;
  circuit?: string;
  session: 'Qualifying' | 'Race' | 'Sprint';
  startsAtUtc: string; // ISO
};

type LanguageCode = 'en' | 'ru' | 'es' | 'fr' | 'de' | 'zh';

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

type FooterLink = {
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

type TranslationBundle = {
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

type LanguageDefinition = {
  code: LanguageCode;
  name: string;
  locale: string;
  periodOptions: { label: string; value?: number }[];
  sessionLabels: Record<Row['session'], string>;
  texts: TranslationBundle;
};

const LANGUAGE_DEFINITIONS: Record<LanguageCode, LanguageDefinition> = {
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
          title: 'Локальное время без вычислений',
          description: 'Все сессии автоматически отображаются в вашем часовом поясе, без ручного пересчёта.',
        },
        {
          title: 'Гибкая фильтрация серий',
          description: 'Выберите только интересующие чемпионаты и сосредоточьтесь на нужных событиях.',
        },
        {
          title: 'Схемы трасс с деталями',
          description: 'Каждый этап сопровождается контуром автодрома и кратким контекстом.',
        },
      ],
      insightsTitle: 'Как это работает',
      insightsSubtitle: 'Три шага до полной картины гоночного уик-энда.',
      insightsSteps: [
        {
          title: 'Выберите интересующие серии',
          description: 'Оставьте F1, F2, F3 или MotoGP — всё под контролем в один клик.',
        },
        {
          title: 'Настройте период обзора',
          description: 'Расширьте окно до 30 дней или сфокусируйтесь на ближайших 24 часах.',
        },
        {
          title: 'Следите за обратным отсчётом',
          description: 'Живые подсказки покажут, сколько осталось до старта или финиша.',
        },
      ],
      faqTitle: 'Частые вопросы',
      faqSubtitle: 'Быстрые ответы на популярные запросы сообщества.',
      faqItems: [
        {
          question: 'Откуда берутся данные?',
          answer:
            'Мы синхронизируемся с официальными календарями чемпионатов и обновляем расписание автоматически.',
        },
        {
          question: 'Можно ли пользоваться на телефоне?',
          answer: 'Да, интерфейс адаптирован под мобильные устройства и сохраняет фильтры.',
        },
        {
          question: 'Не вижу нужное событие — что делать?',
          answer: 'Убедитесь, что серия включена, и расширьте период обзора до 30 дней.',
        },
      ],
      ctaTitle: 'Готовы к старту?',
      ctaSubtitle: 'Откройте живой календарь и держите расписание всегда под рукой.',
      ctaButton: 'Открыть календарь',
      footer: {
        tagline: 'RaceSync помогает болельщикам синхронизироваться с гоночными уик-эндами.',
        productHeading: 'Продукт',
        resourcesHeading: 'Ресурсы',
        supportHeading: 'Поддержка',
        contactEmailLabel: 'Почта команды',
        contactEmail: 'hello@racesync.app',
        legal: '© {year} RaceSync. Все права защищены.',
        productLinks: [
          { label: 'Расписание', href: '#schedule' },
          { label: 'Возможности', href: '#features' },
          { label: 'Как это работает', href: '#insights' },
        ],
        resourcesLinks: [
          { label: 'Частые вопросы', href: '#faq' },
          { label: 'Календарь .ics', href: './schedule.ics' },
        ],
        supportLinks: [
          { label: 'Написать нам', href: 'mailto:hello@racesync.app' },
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
      heroBadge: 'live weekend calendar',
      heroTitle: seriesTitle =>
        `Upcoming qualifying & races — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Stay in sync with race weekends: filter the series, adjust the viewing window, and track session times in your own timezone.',
      seriesLabel: 'Series',
      activeSelection: names => `Selected: ${names.join(' · ')}`,
      allSeriesHidden: 'All series hidden',
      reviewPeriodLabel: 'Viewing window',
      eventsInWindowLabel: 'Events in window',
      nextStartLabel: 'Next session',
      noEvents: 'No events',
      extendPeriodHint: 'Try expanding the window',
      countdownStart: relative => `Starts ${relative}`,
      countdownFinish: relative => `Finished ${relative}`,
      countdownScheduled: 'On schedule',
      trackLayoutLabel: parts =>
        parts.length ? `Circuit layout: ${parts.join(' — ')}` : 'Circuit layout',
      trackLayoutUnavailable: 'Layout preview coming soon',
      languageLabel: 'Language',
      seriesLogoAria: series => `${series} logo`,
      upcomingEventDescriptorFallback: 'No events',
      brandName: 'RaceSync',
      navSchedule: 'Schedule',
      navFeatures: 'Features',
      navFaq: 'FAQ',
      heroCta: 'Browse schedule',
      scheduleTitle: 'Weekend feed',
      scheduleSubtitle: 'Live-updated start times aligned with your timezone.',
      featuresTitle: 'Why fans choose RaceSync',
      featuresSubtitle: 'Purpose-built utilities for race weekend planning.',
      features: [
        {
          title: 'Local time awareness',
          description: 'Every session converts to your device timezone automatically — no manual math required.',
        },
        {
          title: 'Multi-series control',
          description: 'Toggle F1, F2, F3, or MotoGP with a tap and focus on the championships you follow.',
        },
        {
          title: 'Track visuals included',
          description: 'Instant circuit outlines add context to every round on the calendar.',
        },
      ],
      insightsTitle: 'How it works',
      insightsSubtitle: 'Three simple steps to stay ahead of lights out.',
      insightsSteps: [
        {
          title: 'Select your series',
          description: 'Keep the championships you care about visible and hide the rest.',
        },
        {
          title: 'Adjust the window',
          description: 'Expand the viewing horizon up to 30 days or zoom into the next 24 hours.',
        },
        {
          title: 'Watch the countdown',
          description: 'Live relative timers surface how soon each qualifying or race begins.',
        },
      ],
      faqTitle: 'Frequently asked questions',
      faqSubtitle: 'Quick answers to the most common topics from our community.',
      faqItems: [
        {
          question: 'Where does the data come from?',
          answer:
            'We ingest official championship calendars and refresh the live feed automatically as schedules update.',
        },
        {
          question: 'Is it mobile friendly?',
          answer: 'Yes. The layout adapts to phones and keeps your preferences in local storage.',
        },
        {
          question: 'Why can’t I see an event?',
          answer: 'Make sure the series is active and expand the viewing window if you need more coverage.',
        },
      ],
      ctaTitle: 'Ready for lights out?',
      ctaSubtitle: 'Open the live calendar, set your filters, and never miss a session.',
      ctaButton: 'Launch the calendar',
      footer: {
        tagline: 'RaceSync keeps global fans aligned with every race weekend.',
        productHeading: 'Product',
        resourcesHeading: 'Resources',
        supportHeading: 'Support',
        contactEmailLabel: 'Team email',
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
      heroBadge: 'calendario de fines de semana en vivo',
      heroTitle: seriesTitle =>
        `Próximas clasificaciones y carreras — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        'Mantente sincronizado con los fines de semana de carreras: filtra las series, ajusta la ventana de visualización y sigue los horarios de las sesiones en tu propio huso horario.',
      seriesLabel: 'Series',
      activeSelection: names => `Seleccionadas: ${names.join(' · ')}`,
      allSeriesHidden: 'Todas las series ocultas',
      reviewPeriodLabel: 'Ventana de visualización',
      eventsInWindowLabel: 'Eventos en la ventana',
      nextStartLabel: 'Próxima sesión',
      noEvents: 'Sin eventos',
      extendPeriodHint: 'Intenta ampliar la ventana',
      countdownStart: relative => `Comienza ${relative}`,
      countdownFinish: relative => `Terminó ${relative}`,
      countdownScheduled: 'Según lo previsto',
      trackLayoutLabel: parts =>
        parts.length ? `Trazado del circuito: ${parts.join(' — ')}` : 'Trazado del circuito',
      trackLayoutUnavailable: 'Trazado del circuito disponible pronto',
      languageLabel: 'Idioma',
      seriesLogoAria: series => `Logotipo de ${series}`,
      upcomingEventDescriptorFallback: 'Sin eventos',
      brandName: 'RaceSync',
      navSchedule: 'Calendario',
      navFeatures: 'Funciones',
      navFaq: 'Preguntas',
      heroCta: 'Ver calendario',
      scheduleTitle: 'Flujo de fines de semana',
      scheduleSubtitle: 'Horarios actualizados en vivo según tu zona horaria.',
      featuresTitle: 'Por qué elegir RaceSync',
      featuresSubtitle: 'Herramientas creadas para planificar cada sesión.',
      features: [
        {
          title: 'Horas locales automáticas',
          description: 'Cada sesión se convierte automáticamente a tu zona horaria. Olvídate de los cálculos manuales.',
        },
        {
          title: 'Control multiserie',
          description: 'Activa o oculta F1, F2, F3 o MotoGP y céntrate en los campeonatos que sigues.',
        },
        {
          title: 'Diseños de circuitos',
          description: 'Obtén el trazado de cada circuito para tener contexto inmediato de la carrera.',
        },
      ],
      insightsTitle: 'Cómo funciona',
      insightsSubtitle: 'Tres pasos para adelantarte a la próxima largada.',
      insightsSteps: [
        {
          title: 'Elige tus series',
          description: 'Mantén visibles los campeonatos que sigues y oculta el resto.',
        },
        {
          title: 'Ajusta la ventana',
          description: 'Amplía el horizonte hasta 30 días o concéntrate en las próximas 24 horas.',
        },
        {
          title: 'Sigue la cuenta regresiva',
          description: 'Los temporizadores en vivo muestran cuánto falta para cada sesión.',
        },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqSubtitle: 'Resolvemos las dudas más comunes de la comunidad.',
      faqItems: [
        {
          question: '¿De dónde provienen los datos?',
          answer:
            'Nos sincronizamos con los calendarios oficiales de los campeonatos y actualizamos el feed automáticamente.',
        },
        {
          question: '¿Funciona bien en el móvil?',
          answer: 'Sí, el diseño es adaptable y guarda tus preferencias en el dispositivo.',
        },
        {
          question: 'No veo un evento, ¿qué hago?',
          answer: 'Activa la serie correspondiente y amplía la ventana de visualización para encontrarlo.',
        },
      ],
      ctaTitle: '¿Listo para la largada?',
      ctaSubtitle: 'Abre el calendario en vivo y configura tus preferencias en segundos.',
      ctaButton: 'Abrir calendario',
      footer: {
        tagline: 'RaceSync mantiene a los fans sincronizados con cada fin de semana de carreras.',
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
          { label: 'Preguntas frecuentes', href: '#faq' },
          { label: 'Descargar .ics', href: './schedule.ics' },
        ],
        supportLinks: [
          { label: 'Escríbenos', href: 'mailto:hello@racesync.app' },
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
        'Restez synchronisé avec les week-ends de course : filtrez les séries, ajustez la fenêtre d’affichage et suivez les horaires des sessions dans votre propre fuseau horaire.',
      seriesLabel: 'Séries',
      activeSelection: names => `Sélection : ${names.join(' · ')}`,
      allSeriesHidden: 'Toutes les séries masquées',
      reviewPeriodLabel: 'Fenêtre d’affichage',
      eventsInWindowLabel: 'Événements dans la fenêtre',
      nextStartLabel: 'Prochaine session',
      noEvents: 'Aucun événement',
      extendPeriodHint: 'Essayez d’élargir la fenêtre',
      countdownStart: relative => `Commence ${relative}`,
      countdownFinish: relative => `Terminé ${relative}`,
      countdownScheduled: 'Selon le programme',
      trackLayoutLabel: parts =>
        parts.length ? `Tracé du circuit : ${parts.join(' — ')}` : 'Tracé du circuit',
      trackLayoutUnavailable: 'Tracé du circuit bientôt disponible',
      languageLabel: 'Langue',
      seriesLogoAria: series => `Logo ${series}`,
      upcomingEventDescriptorFallback: 'Aucun événement',
      brandName: 'RaceSync',
      navSchedule: 'Calendrier',
      navFeatures: 'Fonctionnalités',
      navFaq: 'FAQ',
      heroCta: 'Consulter le calendrier',
      scheduleTitle: 'Flux des week-ends',
      scheduleSubtitle: 'Heures de départ mises à jour en direct dans votre fuseau horaire.',
      featuresTitle: 'Pourquoi choisir RaceSync',
      featuresSubtitle: 'Des outils pensés pour organiser chaque session.',
      features: [
        {
          title: 'Horaires locaux automatiques',
          description: 'Chaque session est instantanément convertie dans votre fuseau horaire.',
        },
        {
          title: 'Contrôle multi-séries',
          description: 'Activez ou masquez F1, F2, F3 ou MotoGP pour vous concentrer sur vos championnats.',
        },
        {
          title: 'Tracés de circuit inclus',
          description: 'Accédez au plan de chaque circuit et à son contexte en un coup d’œil.',
        },
      ],
      insightsTitle: 'Comment ça marche',
      insightsSubtitle: 'Trois étapes pour anticiper chaque départ.',
      insightsSteps: [
        {
          title: 'Choisissez vos séries',
          description: 'Gardez sous les yeux les championnats qui vous intéressent et masquez les autres.',
        },
        {
          title: 'Réglez la fenêtre',
          description: 'Élargissez l’horizon jusqu’à 30 jours ou focalisez-vous sur les 24 prochaines heures.',
        },
        {
          title: 'Surveillez le compte à rebours',
          description: 'Des minuteries en direct indiquent l’approche de chaque qualification ou course.',
        },
      ],
      faqTitle: 'Questions fréquentes',
      faqSubtitle: 'Les réponses aux demandes les plus courantes de la communauté.',
      faqItems: [
        {
          question: 'D’où proviennent les données ?',
          answer:
            'Nous nous synchronisons avec les calendriers officiels des championnats et mettons à jour le flux automatiquement.',
        },
        {
          question: 'Est-ce adapté au mobile ?',
          answer: 'Oui, l’interface s’adapte aux smartphones et conserve vos préférences locales.',
        },
        {
          question: 'Pourquoi un événement est-il absent ?',
          answer: 'Vérifiez que la série est active et élargissez la fenêtre d’affichage pour le retrouver.',
        },
      ],
      ctaTitle: 'Prêt pour le départ ?',
      ctaSubtitle: 'Ouvrez le calendrier en direct et gardez vos filtres toujours à portée de main.',
      ctaButton: 'Ouvrir le calendrier',
      footer: {
        tagline: 'RaceSync aide les fans du monde entier à suivre chaque week-end de course.',
        productHeading: 'Produit',
        resourcesHeading: 'Ressources',
        supportHeading: 'Support',
        contactEmailLabel: 'E-mail de l’équipe',
        contactEmail: 'hello@racesync.app',
        legal: '© {year} RaceSync. Tous droits réservés.',
        productLinks: [
          { label: 'Calendrier', href: '#schedule' },
          { label: 'Fonctionnalités', href: '#features' },
          { label: 'Comment ça marche', href: '#insights' },
        ],
        resourcesLinks: [
          { label: 'Questions fréquentes', href: '#faq' },
          { label: 'Télécharger le .ics', href: './schedule.ics' },
        ],
        supportLinks: [
          { label: 'Nous écrire', href: 'mailto:hello@racesync.app' },
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
      heroBadge: 'Live-Wochenendkalender',
      heroTitle: seriesTitle =>
        `Bevorstehende Qualifyings & Rennen — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
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
      countdownStart: relative => `Beginnt ${relative}`,
      countdownFinish: relative => `Beendet ${relative}`,
      countdownScheduled: 'Planmäßig',
      trackLayoutLabel: parts =>
        parts.length ? `Streckenlayout: ${parts.join(' — ')}` : 'Streckenlayout',
      trackLayoutUnavailable: 'Streckenlayout folgt in Kürze',
      languageLabel: 'Sprache',
      seriesLogoAria: series => `${series}-Logo`,
      upcomingEventDescriptorFallback: 'Keine Events',
      brandName: 'RaceSync',
      navSchedule: 'Kalender',
      navFeatures: 'Funktionen',
      navFaq: 'FAQ',
      heroCta: 'Zum Kalender',
      scheduleTitle: 'Wochenend-Feed',
      scheduleSubtitle: 'Live aktualisierte Startzeiten in deiner Zeitzone.',
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
      heroBadge: '周末赛事实时日历',
      heroTitle: seriesTitle =>
        `即将到来的排位赛与正赛 — ${seriesTitle || 'F1 / F2 / F3 / MotoGP'}`,
      heroSubtitle:
        '掌握赛周节奏：筛选系列、调整查看窗口，并在本地时区追踪各场次开始时间。',
      seriesLabel: '系列',
      activeSelection: names => `已选择：${names.join(' · ')}`,
      allSeriesHidden: '所有系列已隐藏',
      reviewPeriodLabel: '查看窗口',
      eventsInWindowLabel: '窗口内的赛事',
      nextStartLabel: '下一场次',
      noEvents: '暂无赛事',
      extendPeriodHint: '试着延长查看窗口',
      countdownStart: relative => `将于 ${relative} 开始`,
      countdownFinish: relative => `已于 ${relative} 结束`,
      countdownScheduled: '按计划进行',
      trackLayoutLabel: parts =>
        parts.length ? `赛道布局：${parts.join(' — ')}` : '赛道布局',
      trackLayoutUnavailable: '赛道布局稍后提供',
      languageLabel: '语言',
      seriesLogoAria: series => `${series} 标志`,
      upcomingEventDescriptorFallback: '暂无赛事',
      brandName: 'RaceSync',
      navSchedule: '赛程',
      navFeatures: '功能',
      navFaq: '常见问题',
      heroCta: '查看赛程',
      scheduleTitle: '周末赛程流',
      scheduleSubtitle: '开赛时间实时更新并匹配你的时区。',
      featuresTitle: '为什么选择 RaceSync',
      featuresSubtitle: '为赛车周末而生的实用功能。',
      features: [
        {
          title: '自动换算本地时间',
          description: '所有赛程都会自动转换到你的设备时区，无需再手动换算。',
        },
        {
          title: '多系列一键切换',
          description: '自由切换 F1、F2、F3 或 MotoGP，只保留你真正关心的比赛。',
        },
        {
          title: '赛道示意随时可见',
          description: '每一站都附带赛道轮廓与关键信息，帮助你迅速了解赛况。',
        },
      ],
      insightsTitle: '如何使用',
      insightsSubtitle: '三步即可掌握整个赛道周末。',
      insightsSteps: [
        {
          title: '选择关注的系列',
          description: '只保留你追随的锦标赛，其他全部隐藏。',
        },
        {
          title: '调整查看窗口',
          description: '最长可延展至 30 天，也可以聚焦未来 24 小时。',
        },
        {
          title: '关注倒计时提示',
          description: '动态倒计时会提醒你距离起跑或结束还有多久。',
        },
      ],
      faqTitle: '常见问题',
      faqSubtitle: '快速解答社区里最常提到的疑问。',
      faqItems: [
        {
          question: '数据来源是什么？',
          answer: '我们同步各系列的官方日历，并在更新后自动刷新页面内容。',
        },
        {
          question: '手机上体验如何？',
          answer: '界面针对移动端优化，并会在本地保存语言和筛选设置。',
        },
        {
          question: '为什么找不到某个赛事？',
          answer: '请确认对应系列已启用，并适当延长查看窗口即可找到。',
        },
      ],
      ctaTitle: '准备好出发了吗？',
      ctaSubtitle: '打开实时日历，设定你的偏好，抢先锁定每一次灯灭。',
      ctaButton: '立即打开',
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
} as const;

const LANGUAGE_CODES = Object.keys(LANGUAGE_DEFINITIONS) as LanguageCode[];
const DEFAULT_LANGUAGE: LanguageCode = 'ru';
const LANGUAGE_STORAGE_KEY = 'schedule-language';

function isLanguageCode(value: string): value is LanguageCode {
  return Object.prototype.hasOwnProperty.call(LANGUAGE_DEFINITIONS, value);
}

function normalizeSession(raw: string): Row['session'] | undefined {
  const trimmed = raw.trim();
  if (!trimmed.length) return undefined;

  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();

  if (lower.includes('sprint') || upper === 'SPR') {
    if (lower.includes('qual')) return 'Qualifying';
    return 'Sprint';
  }
  if (lower.includes('qual') || /^Q\d+$/.test(upper)) return 'Qualifying';
  if (lower.includes('feature')) return 'Race';
  if (lower.includes('race') || upper === 'RAC' || lower === 'grand prix' || upper === 'GP') return 'Race';
  return undefined;
}

function parseICS(ics: string): Row[] {
  const lines = ics.split(/\r?\n/);
  const events: Row[] = [];
  let current: Record<string, string> = {};
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
    } else if (line === 'END:VEVENT') {
      const summary = current.SUMMARY;
      const dtstart = current.DTSTART;
      if (summary && dtstart) {
        const categories = current.CATEGORIES
          ? current.CATEGORIES.split(',').map(part => part.trim()).filter(Boolean)
          : [];
        const isMotoGpEvent =
          categories.some(cat => cat.toLowerCase() === 'motogp') || /^MotoGP\b/i.test(summary);

        if (summary.includes('|')) {
          const parts = summary.split('|').map(part => part.trim());
          if (parts.length >= 5) {
            const [seriesRaw, roundRaw, countryRaw, circuitRaw, sessionRaw] = parts;
            if (!isSeriesId(seriesRaw)) continue;

            let dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss'Z'", { zone: 'utc' });
            if (!dt.isValid) {
              const tz = current.DTSTART_TZID || 'utc';
              dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss", { zone: tz });
            }
            if (dt.isValid) {
              const session = normalizeSession(sessionRaw);
              if (!session) continue;

              const round = roundRaw.trim();
              const country = countryRaw.trim();
              const circuit = circuitRaw.trim();

              events.push({
                series: seriesRaw,
                round,
                country: country.length ? country : undefined,
                circuit: circuit.length ? circuit : undefined,
                session,
                startsAtUtc: dt.toUTC().toISO()!,
              });
            }
          }
        } else if (isMotoGpEvent) {
          let dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss'Z'", { zone: 'utc' });
          if (!dt.isValid) {
            const tz = current.DTSTART_TZID || 'utc';
            dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss", { zone: tz });
          }
          if (dt.isValid) {
            const [rawDetails, rawRoundCandidate] = summary.split(/\s+[–-]\s+/);
            const detailPart = rawDetails ?? summary;
            const sessionCode = detailPart.replace(/^MotoGP\s*/i, '').trim();
            const session = normalizeSession(sessionCode);
            if (!session) continue;

            const roundCandidate = rawRoundCandidate?.trim() ?? '';
            const location = current.LOCATION
              ?.replace(/\\,/g, ',')
              .replace(/\\\\/g, '\\');
            const locationParts = location
              ? location.split(',').map(part => part.trim()).filter(Boolean)
              : [];
            const circuit = locationParts[0];
            const country = locationParts.length > 1 ? locationParts.slice(1).join(', ') : undefined;

            const descriptionLines = current.DESCRIPTION
              ? current.DESCRIPTION.split('\\n').map(line => line.trim()).filter(Boolean)
              : [];
            let round = roundCandidate;
            if (!round.length) {
              const fallbackLine =
                descriptionLines.find(line => /grand prix/i.test(line)) ?? descriptionLines[0];
              if (fallbackLine) {
                round = fallbackLine
                  .replace(/^MotoGP\s*/i, '')
                  .replace(/^PT\s+/i, '')
                  .trim();
              } else if (country) {
                round = `${country} MotoGP`;
              } else if (circuit) {
                round = circuit;
              } else {
                round = 'MotoGP';
              }
            }
            round = round.replace(/\s+/g, ' ').trim();
            if (!round.length) round = 'MotoGP';

            const series: SeriesId = 'MotoGP';

            events.push({
              series,
              round,
              country: country && country.length ? country : undefined,
              circuit: circuit && circuit.length ? circuit : undefined,
              session,
              startsAtUtc: dt.toUTC().toISO()!,
            });
          }
        } else {
          const [rawEvent, rawSession] = summary.split(' - ');
          if (rawEvent && rawSession) {
            const session = normalizeSession(rawSession);
            if (session) {
              const eventName = rawEvent.replace(/^RN365\s*/, '').trim();
              const tz = current.DTSTART_TZID || 'utc';
              const dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss", { zone: tz });
              if (dt.isValid) {
                const circuit = current.LOCATION
                  ?.replace(/\\,/g, ',')
                  .replace(/\\\\/g, '\\');
                const fallbackSeries = DEFAULT_SERIES_ID;
                if (!fallbackSeries) continue;

                events.push({
                  series: fallbackSeries,
                  round: eventName,
                  circuit,
                  session,
                  startsAtUtc: dt.toUTC().toISO()!,
                });
              }
            }
          }
        }
      }
    } else {
      const [rawKey, value] = line.split(':', 2);
      if (!rawKey || !value) continue;
      const [key, ...params] = rawKey.split(';');
      current[key] = value;
      if (key === 'DTSTART') {
        const tzParam = params.find(p => p.startsWith('TZID='));
        if (tzParam) current.DTSTART_TZID = tzParam.split('=')[1];
      }
    }
  }
  return events;
}

function SeriesLogo({ series, ariaLabel }: { series: SeriesId; ariaLabel?: string }) {
  const definition = SERIES_DEFINITIONS[series];
  const { label, logoBackground, logoAsset, accentColor } = definition;
  const resolvedLogoAsset = useMemo(() => prefixAssetPath(logoAsset), [logoAsset]);
  const accessibleLabel = ariaLabel ?? `${label} logo`;

  const defaultText = (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={accentColor}
      fontFamily="var(--font-display, 'Manrope')"
      fontSize={15}
      letterSpacing={1.2}
    >
      {label}
    </text>
  );

  return (
    <svg
      width={56}
      height={24}
      viewBox="0 0 56 24"
      role="img"
      aria-label={accessibleLabel}
      style={{ display: 'block' }}
    >
      <rect x={0} y={0} width={56} height={24} rx={6} fill={logoBackground} />
      {resolvedLogoAsset ? (
        <image
          x={0}
          y={0}
          width={56}
          height={24}
          preserveAspectRatio="xMidYMid meet"
          href={resolvedLogoAsset}
          xlinkHref={resolvedLogoAsset}
        />
      ) : (
        defaultText
      )}
    </svg>
  );
}

const SERIES_TITLE = SERIES_IDS.map(series => SERIES_DEFINITIONS[series].label).join(' / ');

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesId, boolean>>(() =>
    buildSeriesVisibility(true),
  );
  const [hours, setHours] = useState<number | undefined>(undefined);
  const [userTz, setUserTz] = useState<string>('UTC');
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isLanguageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageControlRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      const text = await fetch('./schedule.ics').then(r => r.text());
      const events = parseICS(text);
      setRows(events);
    }
    load().catch(console.error);
    setUserTz(DateTime.local().zoneName);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isLanguageCode(stored)) {
      setLanguage(stored);
      return;
    }

    const browserLanguage =
      (typeof navigator !== 'undefined' && navigator.languages && navigator.languages[0]) ||
      (typeof navigator !== 'undefined' ? navigator.language : undefined);
    if (!browserLanguage) return;

    const base = browserLanguage.split('-')[0]?.toLowerCase();
    if (!base) return;

    if (isLanguageCode(base)) {
      setLanguage(base);
    } else {
      setLanguage('en');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (languageControlRef.current?.contains(event.target as Node)) {
        return;
      }
      setLanguageMenuOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isLanguageMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLanguageMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLanguageMenuOpen]);

  const languageDefinition = LANGUAGE_DEFINITIONS[language];
  const { texts, periodOptions, sessionLabels, locale } = languageDefinition;

  const filtered = useMemo(() => {
    let arr = rows.filter(r => visibleSeries[r.series]);
    const now = DateTime.utc();
    const limit = hours && hours > 0 ? hours : 24 * 30; // default 30 days
    const from = now.minus({ hours: 24 });
    const to = now.plus({ hours: limit });
    arr = arr.filter(r => {
      const dt = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' });
      return dt >= from && dt <= to;
    });
    return arr
      .slice()
      .sort((a, b) => Date.parse(a.startsAtUtc) - Date.parse(b.startsAtUtc));
  }, [rows, visibleSeries, hours]);

  const nowLocal = DateTime.local().setZone(userTz).setLocale(locale);
  const timezoneOffset = nowLocal.toFormat('ZZ');
  const timezoneBadgeLabel = userTz?.trim().length
    ? `${userTz} (UTC${timezoneOffset})`
    : `UTC${timezoneOffset}`;
  const activeSeries = (Object.entries(visibleSeries) as [SeriesId, boolean][])
    .filter(([, active]) => active)
    .map(([series]) => series);
  const activeSeriesNames = activeSeries.map(series => SERIES_DEFINITIONS[series].label);
  const hasActiveSeries = activeSeriesNames.length > 0;
  const activeSeriesSelection = hasActiveSeries
    ? texts.activeSelection(activeSeriesNames)
    : texts.allSeriesHidden;
  const selectedPeriodLabel =
    periodOptions.find(opt => opt.value === hours)?.label ?? periodOptions[periodOptions.length - 1]?.label ?? '';
  const nextEvent = filtered[0];
  const nextSeriesDefinition = nextEvent ? SERIES_DEFINITIONS[nextEvent.series] : undefined;
  const nextSeriesLabel = nextSeriesDefinition?.label ?? nextEvent?.series ?? '';
  const nextLocal = nextEvent
    ? DateTime.fromISO(nextEvent.startsAtUtc, { zone: 'utc' })
        .setZone(userTz)
        .setLocale(locale)
    : null;
  const nextRelative = nextLocal
    ? nextLocal.toRelative({ base: nowLocal, locale, style: 'long' })
    : null;
  const nextCountdown =
    nextLocal && nextRelative
      ? nextLocal > nowLocal
        ? texts.countdownStart(nextRelative)
        : texts.countdownFinish(nextRelative)
      : null;
  const nextDescriptor = nextEvent
    ? `${nextEvent.round}${nextEvent.country ? ` • ${nextEvent.country}` : ''}`
    : texts.upcomingEventDescriptorFallback;
  const heroSeriesDefinition = nextSeriesDefinition ?? FALLBACK_SERIES_DEFINITION;
  const heroAccentColor = heroSeriesDefinition?.accentColor ?? '#e10600';
  const heroAccentRgb = heroSeriesDefinition?.accentRgb ?? '225, 6, 0';
  const features = texts.features;
  const insightSteps = texts.insightsSteps;
  const faqItems = texts.faqItems;
  const footer = texts.footer;
  const currentYear = new Date().getFullYear();
  const footerLegal = footer.legal.replace('{year}', currentYear.toString());

  return (
    <div className="site" id="top">
      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__row site-header__row--main">
            <a className="site-header__brand" href="#top">
              <span className="site-header__brand-mark" aria-hidden>
                🏁
              </span>
              <span className="site-header__brand-text">{texts.brandName}</span>
            </a>
            <nav className="site-header__nav" aria-label={texts.brandName}>
              <a className="site-header__link" href="#schedule">
                {texts.navSchedule}
              </a>
              <a className="site-header__link" href="#features">
                {texts.navFeatures}
              </a>
              <a className="site-header__link" href="#faq">
                {texts.navFaq}
              </a>
            </nav>
            <div className="site-header__actions">
              <div className="site-header__meta-group">
                <div className="site-header__meta-portion site-header__meta-portion--timezone">
                  <span className="site-header__meta-value">{timezoneBadgeLabel}</span>
                </div>
                <div
                  className="site-header__meta-portion site-header__language"
                  ref={languageControlRef}
                >
                  <button
                    type="button"
                    id="language-select"
                    className="site-header__language-toggle"
                    aria-haspopup="listbox"
                    aria-expanded={isLanguageMenuOpen}
                    aria-controls="language-select-menu"
                    onClick={() => setLanguageMenuOpen(prev => !prev)}
                  >
                    <span className="site-header__language-value">{languageDefinition.name}</span>
                  </button>
                  {isLanguageMenuOpen ? (
                    <ul
                      className="site-header__language-menu"
                      role="listbox"
                      id="language-select-menu"
                      aria-labelledby="language-select"
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
                              onClick={() => {
                                setLanguage(code);
                                setLanguageMenuOpen(false);
                              }}
                            >
                              <span className="site-header__language-option-name">
                                {definition.name}
                              </span>
                              {isSelected && <span className="site-header__language-option-check">✓</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              </div>
              <a className="site-header__cta" href="#schedule">
                {texts.heroCta}
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="page-shell">
        <section
          className="hero"
          id="schedule"
          style={
            {
              '--hero-accent': heroAccentColor,
              '--hero-accent-rgb': heroAccentRgb,
            } as CSSProperties
          }
        >
          <div className="hero__intro">
            <h1 className="hero__title">
              {texts.heroTitle(SERIES_TITLE || 'F1 / F2 / F3 / MotoGP')}
            </h1>
            <p className="hero__subtitle">{texts.heroSubtitle}</p>
          </div>
        <div className="hero__layout">
          <div className="hero__column">
            <div className="hero-card">
              <div className="hero-card__section">
                <div className="hero-card__section-header">
                  <span className="control-panel__label">{texts.seriesLabel}</span>
                  <span
                    className="control-panel__selection"
                    aria-live="polite"
                    data-empty={!hasActiveSeries}
                  >
                    {activeSeriesSelection}
                  </span>
                </div>
                <div className="series-chips">
                  {SERIES_IDS.map(series => {
                    const definition = SERIES_DEFINITIONS[series];
                    return (
                      <label
                        key={series}
                        className="series-chip"
                        data-active={visibleSeries[series]}
                        style={
                          {
                            '--chip-color': definition.accentColor,
                            '--chip-rgb': definition.accentRgb,
                          } as CSSProperties
                        }
                      >
                        <input
                          type="checkbox"
                          checked={visibleSeries[series]}
                          onChange={() =>
                            setVisibleSeries(prev => ({
                              ...prev,
                              [series]: !prev[series],
                            }))
                          }
                        />
                        <span className="series-chip__indicator" aria-hidden />
                        <span>{definition.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="hero-card__section">
                <div className="hero-card__section-header">
                  <span className="control-panel__label">{texts.reviewPeriodLabel}</span>
                </div>
                <div className="period-buttons">
                  {periodOptions.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      className="period-button"
                      data-active={hours === opt.value}
                      onClick={() => setHours(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="hero__event-summary">
                  <span className="hero__event-summary-label">{texts.eventsInWindowLabel}</span>
                  <span className="hero__event-summary-value">{filtered.length}</span>
                  <span className="hero__event-summary-period">{selectedPeriodLabel}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero__column">
            <div className="hero-card hero-card--summary">
              <span className="hero-card__label">{texts.nextStartLabel}</span>
              {nextEvent && nextLocal ? (
                <>
                  <span className="hero-card__value">{nextLocal.toFormat('dd LLL • HH:mm')}</span>
                  <span className="hero-card__meta">{nextSeriesLabel}</span>
                  <span className="hero-card__meta hero-card__meta--muted">{nextDescriptor}</span>
                  {nextCountdown ? (
                    <span className="hero-card__meta hero-card__meta--accent">
                      {nextCountdown}
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="hero-card__value">{texts.noEvents}</span>
                  <span className="hero-card__meta hero-card__meta--muted">
                    {texts.extendPeriodHint}
                  </span>
                </>
              )}
            </div>
          </div>
          </div>
        </section>
        <section className="events-section" aria-labelledby="schedule-heading">
          <div className="section-heading">
            <h2 id="schedule-heading" className="section-heading__title">
              {texts.scheduleTitle}
            </h2>
            <p className="section-heading__description">{texts.scheduleSubtitle}</p>
          </div>
          <ul className="events-grid">
            {filtered.map((r, index) => {
              const definition = SERIES_DEFINITIONS[r.series];
              const accentColor = definition.accentColor;
              const accentRgb = definition.accentRgb;
              const local = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' }).setZone(userTz);
              const localized = local.setLocale(locale);
              const isoLocal = local.toISO();
              const timeLabel = localized.toFormat('HH:mm');
              const dayLabel = localized.toFormat('ccc');
              const dateLabel = localized.toFormat('dd LLL');
              const relative = localized.toRelative({ base: nowLocal, locale, style: 'long' });
              const countdown = relative
                ? localized > nowLocal
                  ? texts.countdownStart(relative)
                  : texts.countdownFinish(relative)
                : texts.countdownScheduled;
              const track = getTrackLayout(r.circuit, r.round);
              const trackLabelParts = Array.from(
                new Set(
                  [r.circuit, r.round].filter(
                    (part): part is string => !!part && part.trim().length > 0
                  )
                )
              );
              const trackLabel = texts.trackLayoutLabel(trackLabelParts);
              const sessionLabel = sessionLabels[r.session] ?? r.session;

              return (
                <li
                  key={`${r.startsAtUtc}-${index}`}
                  className="event-card"
                  style={
                    {
                      '--accent-color': accentColor,
                      '--accent-rgb': accentRgb,
                    } as CSSProperties
                  }
                >
                  <div className="event-card__inner">
                    <div className="event-card__top">
                      <div className="event-card__series">
                        <div className="event-card__logo">
                          <SeriesLogo
                            series={r.series}
                            ariaLabel={texts.seriesLogoAria(definition.label)}
                          />
                        </div>
                        <span className="event-card__series-pill">{definition.label}</span>
                      </div>
                      <time className="event-card__datetime" dateTime={isoLocal ?? undefined}>
                        <span className="event-card__time">{timeLabel}</span>
                        <span className="event-card__date">
                          {dayLabel}, {dateLabel}
                        </span>
                      </time>
                    </div>
                    <div className="event-card__info">
                      <span className="event-card__title">{r.round}</span>
                      {r.country ? (
                        <span className="event-card__country">{r.country}</span>
                      ) : null}
                      {r.circuit ? (
                        <span className="event-card__meta-line">{r.circuit}</span>
                      ) : null}
                      <span className="event-card__meta-line event-card__session">{sessionLabel}</span>
                    </div>
                    {track ? (
                      <div className="event-card__track">
                        <svg
                          viewBox={track.layout.viewBox}
                          role="img"
                          aria-label={trackLabel}
                          focusable="false"
                        >
                          <path className="event-card__track-shadow" d={track.layout.path} />
                          <path className="event-card__track-outline" d={track.layout.path} />
                          <path className="event-card__track-highlight" d={track.layout.path} />
                        </svg>
                      </div>
                    ) : null}
                    <div className="event-card__countdown">
                      <span className="event-card__countdown-dot" aria-hidden />
                      <span>{countdown}</span>

                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="features" className="features-section" aria-labelledby="features-heading">
          <div className="section-heading">
            <h2 id="features-heading" className="section-heading__title">
              {texts.featuresTitle}
            </h2>
            <p className="section-heading__description">{texts.featuresSubtitle}</p>
          </div>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <article key={`${feature.title}-${index}`} className="feature-card" data-index={index}>
                <div className="feature-card__icon" aria-hidden>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="insights" className="insights-section" aria-labelledby="insights-heading">
          <div className="section-heading">
            <h2 id="insights-heading" className="section-heading__title">
              {texts.insightsTitle}
            </h2>
            <p className="section-heading__description">{texts.insightsSubtitle}</p>
          </div>
          <ol className="insights-list">
            {insightSteps.map((step, index) => (
              <li key={`${step.title}-${index}`} className="insights-item">
                <span className="insights-item__number">{String(index + 1).padStart(2, '0')}</span>
                <div className="insights-item__content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="faq" className="faq-section" aria-labelledby="faq-heading">
          <div className="section-heading">
            <h2 id="faq-heading" className="section-heading__title">
              {texts.faqTitle}
            </h2>
            <p className="section-heading__description">{texts.faqSubtitle}</p>
          </div>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <details key={`${item.question}-${index}`} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="cta" className="cta-section" aria-labelledby="cta-heading">
          <div className="cta-section__inner">
            <div className="cta-section__content">
              <h2 id="cta-heading">{texts.ctaTitle}</h2>
              <p>{texts.ctaSubtitle}</p>
            </div>
            <a className="cta-section__button" href="#schedule">
              {texts.ctaButton}
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand-block">
            <a className="site-footer__brand" href="#top">
              <span className="site-footer__brand-mark" aria-hidden>
                🏁
              </span>
              <span className="site-footer__brand-text">{texts.brandName}</span>
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
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-footer__column">
              <h3 className="site-footer__heading">{footer.resourcesHeading}</h3>
              <ul className="site-footer__list">
                {footer.resourcesLinks.map(link => (
                  <li key={`${link.href}-${link.label}`} className="site-footer__list-item">
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-footer__column">
              <h3 className="site-footer__heading">{footer.supportHeading}</h3>
              <ul className="site-footer__list">
                {footer.supportLinks.map(link => (
                  <li key={`${link.href}-${link.label}`} className="site-footer__list-item">
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    >
                      {link.label}
                    </a>
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
    </div>
  );
}
