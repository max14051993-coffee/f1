import HomeClient from './HomeClient';
import { loadUpcomingEvents } from './load-schedule';

export default function Page() {
  // Server component: bakes the upcoming schedule into the exported HTML.
  return <HomeClient initialEvents={loadUpcomingEvents()} />;
}
