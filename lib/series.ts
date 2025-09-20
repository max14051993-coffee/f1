import type { RaceSession } from './language';
import { withAssetPrefix } from './assets';

type SeriesLogo = {
  src: string;
  width: number;
  height: number;
};

type SeriesLogo = {
  src: string;
  width: number;
  height: number;
};

type SeriesDefinitionBase = {
  label: string;
  accentColor: string;
  accentRgb: string;
  logo: SeriesLogo;
};

export type SeriesDefinition = SeriesDefinitionBase & {
  sessions?: Partial<Record<RaceSession, string>>;
};

export const SERIES_DEFINITIONS = {
  F1: {
    label: 'F1',
    accentColor: '#e10600',
    accentRgb: '225, 6, 0',
    logo: {
      src: withAssetPrefix('/logos/f1.svg'),
      width: 120,
      height: 30,
    },
  },
  F2: {
    label: 'F2',
    accentColor: '#0090ff',
    accentRgb: '0, 144, 255',
    logo: {
      src: withAssetPrefix('/logos/f2.svg'),
      width: 1000,
      height: 320,
    },
  },
  F3: {
    label: 'F3',
    accentColor: '#ff6f00',
    accentRgb: '255, 111, 0',
    logo: {
      src: withAssetPrefix('/logos/f3.svg'),
      width: 1000,
      height: 320,
    },
  },
  MotoGP: {
    label: 'MotoGP',
    accentColor: '#ff0050',
    accentRgb: '255, 0, 80',
    logo: {
      src: withAssetPrefix('/logos/motogp.svg'),
      width: 486,
      height: 266,
    },
  },
} as const satisfies Record<string, SeriesDefinition>;

export type SeriesId = keyof typeof SERIES_DEFINITIONS;

export const SERIES_IDS = Object.keys(SERIES_DEFINITIONS) as SeriesId[];

export const DEFAULT_SERIES_ID: SeriesId | undefined = SERIES_IDS[0];

export const FALLBACK_SERIES_DEFINITION = DEFAULT_SERIES_ID
  ? SERIES_DEFINITIONS[DEFAULT_SERIES_ID]
  : undefined;

export function isSeriesId(value: string): value is SeriesId {
  return Object.prototype.hasOwnProperty.call(SERIES_DEFINITIONS, value);
}

export function buildSeriesVisibility(value: boolean): Record<SeriesId, boolean> {
  return SERIES_IDS.reduce<Record<SeriesId, boolean>>((acc, series) => {
    acc[series] = value;
    return acc;
  }, {} as Record<SeriesId, boolean>);
}
