import { trip, days } from './dalian';
import { trip as linanTrip, days as linanDays } from './linan-shiziyan';
import { trip as xinchangTrip, days as xinchangDays } from './xinchang-baizhangyan';
import { trip as liangtoudongTrip, days as liangtoudongDays } from './quzhou-liangtoudong';
import { trip as meiguTrip, days as meiguDays } from './dongyang-meigu-20260906';
import { trip as meiguSeptember13Trip, days as meiguSeptember13Days } from './dongyang-meigu-20260913';

const trips = [
  { ...trip, days },
  { ...xinchangTrip, days: xinchangDays },
  { ...linanTrip, days: linanDays },
  { ...meiguSeptember13Trip, days: meiguSeptember13Days },
  { ...meiguTrip, days: meiguDays },
  { ...liangtoudongTrip, days: liangtoudongDays },
];

export { trips };
