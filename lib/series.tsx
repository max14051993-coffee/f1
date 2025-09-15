export type SeriesDefinition = {
  label: string;
  accentColor: string;
  accentRgb: string;
  logoBackground: string;
  logoAccent: string;
  renderLogoContent?: (context: { accent: string; label: string }) => JSX.Element;
};

export const SERIES_DEFINITIONS = {
  F1: {
    label: 'F1',
    accentColor: '#e10600',
    accentRgb: '225, 6, 0',
    logoBackground: '#111',
    logoAccent: '#e10600',
    renderLogoContent: ({ accent }) => (
      <>
        <path d="M7 17h8l1.8-4H8.8l1.4-3.2h7.2L19.2 6H11c-.9 0-1.7.5-2.1 1.3L5.5 16c-.4.9.2 2 1.5 2Z" fill="#fff" />
        <path
          d="M33.5 6h-8.6l-3.4 7.5c-.6 1.4.3 3 1.8 3h9.6c1.3 0 2.6-.5 3.5-1.4l2.4-2.4c.6-.6.2-1.7-.7-1.7h-7.5l2.5-5Z"
          fill={accent}
        />
      </>
    ),
  },
  F2: {
    label: 'F2',
    accentColor: '#0090ff',
    accentRgb: '0, 144, 255',
    logoBackground: '#0090ff',
    logoAccent: '#fff',
    renderLogoContent: ({ accent, label }) => (
      <>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={accent}
          fontFamily="var(--font-display, 'Manrope')"
          fontSize={15}
          letterSpacing={1.2}
        >
          {label}
        </text>
        <path d="M9 7h14l-1.4 3.2H15l-.8 1.8h6.4L19 15H9l3-8Z" fill="#fff" />
      </>
    ),
  },
  F3: {
    label: 'F3',
    accentColor: '#ff6f00',
    accentRgb: '255, 111, 0',
    logoBackground: '#ff6f00',
    logoAccent: '#fff',
    renderLogoContent: ({ accent, label }) => (
      <>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={accent}
          fontFamily="var(--font-display, 'Manrope')"
          fontSize={15}
          letterSpacing={1.2}
        >
          {label}
        </text>
        <path
          d="M9 7h15c1 0 1.6 1.1 1.1 2l-1 1.8c.4.3.6.9.4 1.4l-1 2.4c-.2.7-.9 1.2-1.7 1.2H10l1.4-3.2h7.2l.4-.8h-6.6l1.2-2.8h7.6l.4-.8H10.8L9 7Z"
          fill="#fff"
        />
      </>
    ),
  },
} as const satisfies Record<string, SeriesDefinition>;

export type SeriesId = keyof typeof SERIES_DEFINITIONS;

export const SERIES_IDS = Object.keys(SERIES_DEFINITIONS) as SeriesId[];

export const DEFAULT_SERIES_ID = SERIES_IDS[0];

export const FALLBACK_SERIES_DEFINITION =
  DEFAULT_SERIES_ID ? SERIES_DEFINITIONS[DEFAULT_SERIES_ID] : undefined;

export function isSeriesId(value: string): value is SeriesId {
  return Object.prototype.hasOwnProperty.call(SERIES_DEFINITIONS, value);
}

export function buildSeriesVisibility(value: boolean): Record<SeriesId, boolean> {
  return SERIES_IDS.reduce((acc, series) => {
    acc[series] = value;
    return acc;
  }, {} as Record<SeriesId, boolean>);
}

export const SERIES_TITLE = SERIES_IDS.map(series => SERIES_DEFINITIONS[series].label).join(' / ');
