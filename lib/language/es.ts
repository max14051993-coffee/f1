import type { LanguageDefinition } from './types';
import { formatCountdownStart } from './countdown';

export const es: LanguageDefinition = {
  code: 'es',
  name: 'Español',
  shortName: 'ES',
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
    heroTitle: 'My race weekend',
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
    countdownStart: relative => formatCountdownStart(relative, 'Comienza', 'Comienza en'),
    countdownLive: relative => (relative ? `En vivo • empezó ${relative}` : 'En vivo'),
    countdownFinish: relative => `Terminó ${relative}`,
    countdownScheduled: 'Según lo previsto',
    trackLayoutLabel: parts =>
      parts.length ? `Trazado del circuito: ${parts.join(' — ')}` : 'Trazado del circuito',
    theme: {
      toggleToDark: 'Cambiar a tema oscuro',
      toggleToLight: 'Cambiar a tema claro',
    },
    upcomingEventDescriptorFallback: 'Sin eventos',
    brandName: 'RaceSync',
    navFeatures: 'Funciones',
    navFaq: 'Preguntas',
    heroCta: 'Ver calendario',
    scheduleTitle: 'Flujo de fines de semana',
    scheduleSubtitle: 'Horarios actualizados en vivo según tu zona horaria.',
    scheduleLoadingLabel: 'Cargando calendario…',
    scheduleErrorTitle: 'No se pudo cargar el calendario',
    scheduleErrorDescription: 'Inténtalo de nuevo. Si el problema continúa, abre el archivo del calendario directamente.',
    scheduleRetryButton: 'Reintentar',
    scheduleErrorFallbackPrefix: 'Archivo para diagnóstico:',
    scheduleIcsLinkLabel: 'Abrir schedule.ics',
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
};
