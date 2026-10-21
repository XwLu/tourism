import { trip, days } from './dalian';
import { trip as linanTrip, days as linanDays } from './linan-shiziyan';

const trips = [
  { ...trip, days },
  { ...linanTrip, days: linanDays },
];

export { trips };
