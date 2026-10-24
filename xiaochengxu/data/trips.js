import { trip, days } from './dalian';
import { trip as linanTrip, days as linanDays } from './linan-shiziyan';
import { trip as xinchangTrip, days as xinchangDays } from './xinchang-baizhangyan';

const trips = [
  { ...trip, days },
  { ...xinchangTrip, days: xinchangDays },
  { ...linanTrip, days: linanDays },
];

export { trips };
