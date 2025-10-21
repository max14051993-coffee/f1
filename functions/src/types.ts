export type SeriesId = 'F1' | 'F2' | 'F3' | 'MotoGP';

export type RaceSession = 'Qualifying' | 'Race' | 'Sprint';

export type ScheduleEvent = {
  uid?: string;
  series: SeriesId;
  round: string;
  country?: string;
  circuit?: string;
  session: RaceSession;
  startsAtUtc: string;
  endsAtUtc?: string;
};
