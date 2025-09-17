export type LanguageCode = 'en' | 'ru' | 'es' | 'fr' | 'de' | 'zh';

export type RaceSession = 'Qualifying' | 'Race' | 'Sprint';


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

type PrivacyPolicySection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

type PrivacyPolicyCopy = {
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: PrivacyPolicySection[];
  conclusion: string;
  closeLabel: string;
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
  privacyPolicy: PrivacyPolicyCopy;
};

export type LanguageDefinition = {
  code: LanguageCode;
  name: string;
  locale: string;
  periodOptions: { label: string; value?: number }[];
  sessionLabels: Record<RaceSession, string>;
  texts: TranslationBundle;
};

export const LANGUAGE_DEFINITIONS: Record<LanguageCode, LanguageDefinition> = {
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
      privacyPolicy: {
        title: 'Политика конфиденциальности',
        lastUpdated: 'Обновлено: 20 марта 2024 г.',
        intro: [
          'RaceSync создан, чтобы помогать болельщикам следить за расписанием гонок и при этом собирать минимум данных. В этом документе описано, какую информацию мы обрабатываем, когда вы пользуетесь сайтом или календарями.',
        ],
        sections: [
          {
            title: 'Какие данные мы собираем',
            paragraphs: [
              'Мы стремимся получать только те сведения, которые необходимы для работы сервиса.',
            ],
            list: [
              'Контактные данные, которые вы добровольно отправляете на hello@racesync.app.',
              'Обезличенную аналитику о посещениях страниц и том, какие функции используются.',
              'Технические журналы, автоматически формируемые для защиты сайта от сбоев и злоупотреблений.',
            ],
          },
          {
            title: 'Как мы используем данные',
            paragraphs: [
              'Полученная информация помогает улучшать RaceSync и поддерживать стабильную работу сервиса.',
            ],
            list: [
              'Отвечать на обращения и вопросы, которые вы отправляете по электронной почте.',
              'Понимать, какие разделы и возможности востребованы у пользователей.',
              'Выявлять технические проблемы и обеспечивать безопасность инфраструктуры.',
            ],
          },
          {
            title: 'Хранение и безопасность',
            paragraphs: [
              'Доступ к данным ограничен небольшой командой RaceSync. Аналитика хранится в агрегированном виде и не позволяет идентифицировать отдельных пользователей.',
              'Контактные сообщения хранятся столько, сколько нужно для решения вашего запроса, после чего удаляются из активных систем.',
            ],
          },
          {
            title: 'Ваш выбор',
            paragraphs: [
              'Вы можете ограничить сбор обезличенной аналитики с помощью настроек браузера или расширений блокировки. Если хотите удалить ранее переданные данные, напишите нам — мы обработаем запрос в разумный срок.',
            ],
          },
        ],
        conclusion:
          'Если у вас остались вопросы о защите данных в RaceSync, напишите на hello@racesync.app — мы ответим в кратчайшие сроки.',
        closeLabel: 'Закрыть',
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
      privacyPolicy: {
        title: 'Privacy policy',
        lastUpdated: 'Last updated: 20 March 2024',
        intro: [
          'RaceSync exists to help fans track motorsport schedules while collecting as little personal data as possible. This policy explains what information we process when you visit the website or subscribe to our calendars.',
        ],
        sections: [
          {
            title: 'Information we collect',
            paragraphs: [
              'We only gather the details that allow us to operate and improve the service.',
            ],
            list: [
              'Contact information you voluntarily share when emailing hello@racesync.app.',
              'Anonymous analytics about page visits and feature usage.',
              'Technical logs generated automatically to keep the site secure and reliable.',
            ],
          },
          {
            title: 'How we use information',
            paragraphs: [
              'The collected data supports the ongoing development of RaceSync and ensures the experience stays stable for everyone.',
            ],
            list: [
              'Responding to questions or feedback you send by email.',
              'Understanding which sections and capabilities fans use most.',
              'Detecting technical issues and protecting the infrastructure from abuse.',
            ],
          },
          {
            title: 'Retention and security',
            paragraphs: [
              'Access to data is limited to the small RaceSync team. Analytics are stored in aggregate form so they cannot identify individual visitors.',
              'Messages you send are kept only as long as needed to resolve your request and are removed from active systems afterwards.',
            ],
          },
          {
            title: 'Your choices',
            paragraphs: [
              'You can limit anonymous analytics through your browser or blocking extensions. Contact us if you want to remove previously shared information and we will process the request promptly.',
            ],
          },
        ],
        conclusion:
          'Questions about privacy at RaceSync? Email hello@racesync.app and we will get back to you as soon as possible.',
        closeLabel: 'Close',
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
      privacyPolicy: {
        title: 'Política de privacidad',
        lastUpdated: 'Última actualización: 20 de marzo de 2024',
        intro: [
          'RaceSync existe para que los aficionados sigan los calendarios del automovilismo recopilando la menor cantidad posible de datos personales. Esta política describe la información que tratamos cuando visitas la web o utilizas nuestros calendarios.',
        ],
        sections: [
          {
            title: 'Qué datos recopilamos',
            paragraphs: [
              'Solo reunimos la información necesaria para operar y mejorar el servicio.',
            ],
            list: [
              'Datos de contacto que compartes voluntariamente al escribir a hello@racesync.app.',
              'Analíticas anónimas sobre visitas a páginas y uso de funciones.',
              'Registros técnicos generados automáticamente para mantener el sitio seguro y estable.',
            ],
          },
          {
            title: 'Cómo usamos la información',
            paragraphs: [
              'Los datos recopilados nos permiten mejorar RaceSync y garantizar una experiencia estable para toda la comunidad.',
            ],
            list: [
              'Responder a las preguntas o comentarios que envías por correo.',
              'Comprender qué secciones y herramientas son más útiles para los fans.',
              'Detectar incidencias técnicas y proteger la infraestructura frente a abusos.',
            ],
          },
          {
            title: 'Conservación y seguridad',
            paragraphs: [
              'El acceso a los datos está limitado al pequeño equipo de RaceSync. Las analíticas se guardan de forma agregada, por lo que no identifican a visitantes individuales.',
              'Los mensajes que envías se conservan únicamente el tiempo necesario para resolver tu solicitud y después se eliminan de los sistemas activos.',
            ],
          },
          {
            title: 'Tus opciones',
            paragraphs: [
              'Puedes limitar la analítica anónima mediante la configuración de tu navegador o extensiones de bloqueo. Si deseas eliminar información que compartiste anteriormente, contáctanos y atenderemos la solicitud lo antes posible.',
            ],
          },
        ],
        conclusion:
          'Si tienes preguntas sobre privacidad en RaceSync, escribe a hello@racesync.app y te responderemos a la brevedad.',
        closeLabel: 'Cerrar',
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
      privacyPolicy: {
        title: 'Politique de confidentialité',
        lastUpdated: 'Dernière mise à jour : 20 mars 2024',
        intro: [
          'RaceSync aide les fans à suivre les calendriers de sport automobile tout en collectant le minimum de données personnelles. Cette politique décrit les informations que nous traitons lorsque vous visitez le site ou utilisez nos calendriers.',
        ],
        sections: [
          {
            title: 'Données que nous collectons',
            paragraphs: [
              'Nous ne recueillons que les éléments indispensables au fonctionnement et à l’amélioration du service.',
            ],
            list: [
              'Les coordonnées que vous partagez volontairement en écrivant à hello@racesync.app.',
              'Des statistiques anonymes sur la fréquentation des pages et l’usage des fonctionnalités.',
              'Des journaux techniques générés automatiquement pour maintenir la sécurité et la stabilité du site.',
            ],
          },
          {
            title: 'Comment nous utilisons ces données',
            paragraphs: [
              'Les informations collectées nous aident à développer RaceSync et à garantir une expérience fiable pour tous.',
            ],
            list: [
              'Répondre aux questions ou retours envoyés par courriel.',
              'Comprendre quelles sections et fonctionnalités sont les plus utiles aux fans.',
              'Détecter les problèmes techniques et protéger notre infrastructure contre les abus.',
            ],
          },
          {
            title: 'Conservation et sécurité',
            paragraphs: [
              'L’accès aux données est limité à la petite équipe RaceSync. Les statistiques sont stockées sous forme agrégée et ne permettent pas d’identifier un visiteur.',
              'Les messages reçus sont conservés uniquement le temps nécessaire pour traiter votre demande puis supprimés des systèmes actifs.',
            ],
          },
          {
            title: 'Vos choix',
            paragraphs: [
              'Vous pouvez limiter les statistiques anonymes via votre navigateur ou des extensions de blocage. Si vous souhaitez supprimer des informations précédemment partagées, contactez-nous et nous traiterons la demande rapidement.',
            ],
          },
        ],
        conclusion:
          'Pour toute question relative à la confidentialité chez RaceSync, écrivez à hello@racesync.app et nous vous répondrons au plus vite.',
        closeLabel: 'Fermer',
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
      privacyPolicy: {
        title: '隐私政策',
        lastUpdated: '最后更新：2024 年 3 月 20 日',
        intro: [
          'RaceSync 致力于帮助车迷跟踪赛车日程，并尽可能少地收集个人数据。本政策说明当你访问我们的网站或订阅日历时会处理哪些信息。',
        ],
        sections: [
          {
            title: '我们收集哪些数据',
            paragraphs: [
              '我们仅收集维持和改进服务所必需的信息。',
            ],
            list: [
              '你主动发送至 hello@racesync.app 的联系信息。',
              '关于页面访问和功能使用情况的匿名分析数据。',
              '为保障网站安全稳定而自动生成的技术日志。',
            ],
          },
          {
            title: '我们如何使用这些信息',
            paragraphs: [
              '这些数据帮助我们不断优化 RaceSync，并为所有用户保持稳定体验。',
            ],
            list: [
              '回复你通过电子邮件提交的问题或反馈。',
              '了解车迷最常使用的版块和功能。',
              '排查技术问题并防止对基础设施的滥用。',
            ],
          },
          {
            title: '数据保留与安全',
            paragraphs: [
              '只有少量 RaceSync 团队成员可以访问这些数据。分析数据以聚合方式保存，不会识别个人访客。',
              '你的邮件仅会在处理需求所需的时间内保留，之后会从活跃系统中删除。',
            ],
          },
          {
            title: '你的选择',
            paragraphs: [
              '你可以通过浏览器或拦截扩展限制匿名分析。如果希望删除之前提供的信息，请与我们联系，我们会尽快处理。',
            ],
          },
        ],
        conclusion:
          '若对 RaceSync 的隐私保护有任何疑问，请发送邮件至 hello@racesync.app，我们会尽快回复。',
        closeLabel: '关闭',
      },
    },
  },
} as const;

export const LANGUAGE_CODES = Object.keys(LANGUAGE_DEFINITIONS) as LanguageCode[];
export const DEFAULT_LANGUAGE: LanguageCode = 'ru';

export function isLanguageCode(value: string): value is LanguageCode {
  return Object.prototype.hasOwnProperty.call(LANGUAGE_DEFINITIONS, value);
}
