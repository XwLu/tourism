import { getTrips } from './trip-store';

const savedStorageKey = 'travel-saved-trips-v1';
const kinds = { transport: '交通', hotel: '住宿', meal: '餐饮', sight: '游览' };

export function getTrip(id) {
  return getTrips().find((trip) => trip.id === id);
}

export function getDay(id, tripId) {
  const trip = getTrip(tripId);
  return trip ? trip.days.find((day) => day.id === id) : undefined;
}

export function getSavedIds() {
  try {
    const stored = wx.getStorageSync(savedStorageKey);
    return Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : [];
  } catch (error) {
    return [];
  }
}

export function toggleSaved(id) {
  if (!getTrip(id)) return null;
  const savedIds = getSavedIds();
  const isSaved = !savedIds.includes(id);
  const nextIds = isSaved ? [...savedIds, id] : savedIds.filter((savedId) => savedId !== id);
  try {
    wx.setStorageSync(savedStorageKey, nextIds);
    wx.showToast({ title: isSaved ? '已加入收藏' : '已取消收藏', icon: 'none' });
    return isSaved;
  } catch (error) {
    wx.showToast({ title: '收藏未保存，请稍后重试', icon: 'none' });
    return null;
  }
}

export function getCardColumns({ keyword = '', category = 'all', savedOnly = false } = {}) {
  const savedIds = getSavedIds();
  const search = keyword.trim().toLowerCase();
  const cards = getTrips()
    .filter((trip) => !savedOnly || savedIds.includes(trip.id))
    .filter((trip) => category === 'all' || trip.categories.includes(category))
    .filter((trip) =>
      [
        trip.title,
        trip.destination,
        trip.dates,
        trip.subtitle,
        ...trip.tags,
        ...trip.days.map((day) => [day.title, day.date, day.summary, ...day.stops.map((stop) => stop.name)].join(' ')),
      ]
        .join(' ')
        .toLowerCase()
        .includes(search),
    )
    .map((trip) => ({ ...trip, isSaved: savedIds.includes(trip.id) }));
  return {
    leftColumn: cards.filter((trip, index) => index % 2 === 0),
    rightColumn: cards.filter((trip, index) => index % 2 === 1),
    resultCount: cards.length,
  };
}

export function getStops(day) {
  return day.stops.map((stop, index) => ({
    ...stop,
    id: index,
    kindLabel: kinds[stop.kind],
    sequence: `${index + 1}`.padStart(2, '0'),
  }));
}

export function getDayText(day, trip) {
  return [
    `${trip.title} | ${trip.dates}`,
    `${day.date} · ${day.title}`,
    '',
    ...day.stops.map((stop) => `${stop.time}  ${stop.name}${stop.optional ? '（可选）' : ''}\n${stop.detail}`),
    '',
    `交通：${day.transport}`,
    `住宿：${day.stay}`,
    `提醒：${day.note}`,
    ...(day.hasOutdoorClimbing ? ['野攀保险：请提前购买户外保险，第二天生效，请至少提前一天购买。'] : []),
  ].join('\n');
}
