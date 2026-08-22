import type { LanguageDefinition } from './types';
import { formatCountdownStart } from './countdown';

export const fr: LanguageDefinition = {
  code: 'fr',
  name: 'Français',
  shortName: 'FR',
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
    heroTitle: 'My race weekend',
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
    countdownStart: relative => formatCountdownStart(relative, 'Commence', 'Commence dans'),
    countdownLive: relative => (relative ? `En direct • départ ${relative}` : 'En direct'),
    countdownFinish: relative => `Terminé ${relative}`,
    countdownScheduled: 'Selon le programme',
    trackLayoutLabel: parts =>
      parts.length ? `Tracé du circuit : ${parts.join(' — ')}` : 'Tracé du circuit',
    theme: {
      toggleToDark: 'Activer le thème sombre',
      toggleToLight: 'Activer le thème clair',
    },
    upcomingEventDescriptorFallback: 'Aucun événement',
    brandName: 'RaceSync',
    navFeatures: 'Fonctionnalités',
    navFaq: 'FAQ',
    heroCta: 'Consulter le calendrier',
    scheduleTitle: 'Flux des week-ends',
    scheduleSubtitle: 'Heures de départ mises à jour en direct dans votre fuseau horaire.',
    scheduleLoadingLabel: 'Chargement du calendrier…',
    scheduleErrorTitle: 'Impossible de charger le calendrier',
    scheduleErrorDescription:
      'Réessayez. Si le problème persiste, ouvrez le fichier du calendrier directement.',
    scheduleRetryButton: 'Réessayer',
    scheduleErrorFallbackPrefix: 'Fichier de diagnostic :',
    scheduleIcsLinkLabel: 'Ouvrir schedule.ics',
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
};
