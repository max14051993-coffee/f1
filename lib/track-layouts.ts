import trackLayouts from '../data/track-layouts.json';

export type TrackShape = { viewBox: string; path: string };
type LayoutMap = Record<string, TrackShape>;

const LAYOUTS = trackLayouts as LayoutMap;

const CIRCUIT_ALIASES: Record<string, string> = {
  'albert-park-circuit': 'albert-park-circuit',
  'albert-park-melbourne': 'albert-park-circuit',
  melbourne: 'albert-park-circuit',
  australian: 'albert-park-circuit',
  australia: 'albert-park-circuit',
  'bahrain-international-circuit': 'bahrain-international-circuit',
  'bahrain-international-circuit-sakhir': 'bahrain-international-circuit',
  sakhir: 'bahrain-international-circuit',
  bahrain: 'bahrain-international-circuit',
  'jeddah-corniche-circuit': 'jeddah-corniche-circuit',
  jeddah: 'jeddah-corniche-circuit',
  'jeddah-street-circuit-jeddah': 'jeddah-corniche-circuit',
  'saudi-arabian': 'jeddah-corniche-circuit',
  'saudi-arabia': 'jeddah-corniche-circuit',
  'albert-park': 'albert-park-circuit',
  'suzuka-international-racing-course': 'suzuka-international-racing-course',
  'suzuka-circuit-suzuka': 'suzuka-international-racing-course',
  suzuka: 'suzuka-international-racing-course',
  japanese: 'suzuka-international-racing-course',
  japan: 'suzuka-international-racing-course',
  'shanghai-international-circuit': 'shanghai-international-circuit',
  'shanghai-international-circuit-shanghai': 'shanghai-international-circuit',
  shanghai: 'shanghai-international-circuit',
  chinese: 'shanghai-international-circuit',
  china: 'shanghai-international-circuit',
  'miami-international-autodrome': 'miami-international-autodrome',
  'miami-international-autodrome-miami': 'miami-international-autodrome',
  miami: 'miami-international-autodrome',
  'imola': 'imola',
  'autodromo-enzo-e-dino-ferrari-imola': 'imola',
  'emilia-romagna': 'imola',
  'circuit-de-monaco': 'circuit-de-monaco',
  'circuit-de-monaco-monte-carlo': 'circuit-de-monaco',
  'monte-carlo': 'circuit-de-monaco',
  monaco: 'circuit-de-monaco',
  'circuit-gilles-villeneuve': 'circuit-gilles-villeneuve',
  'circuit-gilles-villeneuve-montreal': 'circuit-gilles-villeneuve',
  montreal: 'circuit-gilles-villeneuve',
  canadian: 'circuit-gilles-villeneuve',
  canada: 'circuit-gilles-villeneuve',
  'circuit-de-barcelona-catalunya': 'circuit-de-barcelona-catalunya',
  'circuit-de-catalunya-barcelona': 'circuit-de-barcelona-catalunya',
  barcelona: 'circuit-de-barcelona-catalunya',
  spanish: 'circuit-de-barcelona-catalunya',
  spain: 'circuit-de-barcelona-catalunya',
  'red-bull-ring': 'red-bull-ring',
  'red-bull-ring-spielberg': 'red-bull-ring',
  spielberg: 'red-bull-ring',
  austrian: 'red-bull-ring',
  austria: 'red-bull-ring',
  'silverstone-circuit': 'silverstone-circuit',
  'circuit-silverstone-silverstone': 'silverstone-circuit',
  silverstone: 'silverstone-circuit',
  british: 'silverstone-circuit',
  'great-britain': 'silverstone-circuit',
  'hungaroring': 'hungaroring',
  'hungaroring-budapest': 'hungaroring',
  budapest: 'hungaroring',
  hungarian: 'hungaroring',
  hungary: 'hungaroring',
  'spa-francorchamps': 'spa-francorchamps',
  'spa-francorchamps-francochamps': 'spa-francorchamps',
  belgian: 'spa-francorchamps',
  belgium: 'spa-francorchamps',
  'circuit-zandvoort': 'circuit-zandvoort',
  'circuit-zandvoort-zandvoort': 'circuit-zandvoort',
  zandvoort: 'circuit-zandvoort',
  dutch: 'circuit-zandvoort',
  netherlands: 'circuit-zandvoort',
  monza: 'monza',
  'autodromo-nazionale-monza-monza': 'monza',
  italian: 'monza',
  'baku-city-circuit': 'baku-city-circuit',
  'baku-city-circuit-baku': 'baku-city-circuit',
  baku: 'baku-city-circuit',
  azerbaijan: 'baku-city-circuit',
  'marina-bay-street-circuit': 'marina-bay-street-circuit',
  'marina-bay-street-circuit-singapore': 'marina-bay-street-circuit',
  singapore: 'marina-bay-street-circuit',
  'circuit-of-the-americas': 'circuit-of-the-americas',
  'circuit-of-the-americas-austin': 'circuit-of-the-americas',
  austin: 'circuit-of-the-americas',
  'united-states': 'circuit-of-the-americas',
  usa: 'circuit-of-the-americas',
  cota: 'circuit-of-the-americas',
  'autodromo-hermanos-rodriguez': 'autodromo-hermanos-rodriguez',
  'autodromo-hermanos-rodriguez-mexico-city': 'autodromo-hermanos-rodriguez',
  'mexico-city': 'autodromo-hermanos-rodriguez',
  mexican: 'autodromo-hermanos-rodriguez',
  mexico: 'autodromo-hermanos-rodriguez',
  'autodromo-jose-carlos-pace': 'autodromo-jose-carlos-pace',
  'autodromo-jose-carlos-pace-interlagos-sao-paulo': 'autodromo-jose-carlos-pace',
  interlagos: 'autodromo-jose-carlos-pace',
  'sao-paulo': 'autodromo-jose-carlos-pace',
  brazilian: 'autodromo-jose-carlos-pace',
  brazil: 'autodromo-jose-carlos-pace',
  'las-vegas-street-circuit': 'las-vegas-street-circuit',
  'las-vegas-street-circuit-las-vegas': 'las-vegas-street-circuit',
  'las-vegas': 'las-vegas-street-circuit',
  'losail-international-circuit': 'losail-international-circuit',
  'losail-international-circuit-lusail': 'losail-international-circuit',
  lusail: 'losail-international-circuit',
  doha: 'losail-international-circuit',
  qatar: 'losail-international-circuit',
  'yas-marina-circuit': 'yas-marina-circuit',
  'yas-marina-circuit-abu-dhabi': 'yas-marina-circuit',
  'yas-marina': 'yas-marina-circuit',
  'abu-dhabi': 'yas-marina-circuit',
};

function slugify(source: string): string {
  return source
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export type TrackLayoutMatch = { key: string; layout: TrackShape };

export function getTrackLayout(circuit?: string | null, round?: string | null): TrackLayoutMatch | null {
  const candidates: string[] = [];
  if (circuit) {
    const normalized = slugify(circuit);
    candidates.push(normalized);
  }
  if (round) {
    candidates.push(slugify(round));
  }

  for (const candidate of candidates) {
    if (candidate in LAYOUTS) {
      return { key: candidate, layout: LAYOUTS[candidate] };
    }
    const alias = CIRCUIT_ALIASES[candidate];
    if (alias && alias in LAYOUTS) {
      return { key: alias, layout: LAYOUTS[alias] };
    }
  }

  return null;
}

export type TrackLayout = TrackLayoutMatch;

export const TRACK_LAYOUTS: LayoutMap = LAYOUTS;
