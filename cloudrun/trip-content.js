function normalizeTrips(trips) {
  if (!Array.isArray(trips)) throw new Error('行程列表必须是数组');
  const tripIds = new Set();
  const string = (value, field) => {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`行程缺少 ${field}`);
    return value;
  };
  const strings = (value, fallback = []) => {
    if (value === undefined) return fallback;
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
      throw new Error('行程标签和封面文案必须是文字数组');
    }
    return value;
  };
  const cover = (value) => {
    if (value === undefined || value === '') return '/static/travel/sunset.jpg';
    if (typeof value !== 'string' || !/^(\/static\/[\w/.-]+|https:\/\/[^\s]+)$/.test(value)) {
      throw new Error('封面需使用已打包的 static 图片或 HTTPS 图片地址');
    }
    return value;
  };
  return trips.map((trip) => {
    if (!trip || typeof trip.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(trip.id) || tripIds.has(trip.id)) {
      throw new Error('旅行 ID 必须唯一，且只能使用 1–64 个小写字母、数字、下划线或短横线');
    }
    tripIds.add(trip.id);
    for (const field of ['title', 'destination', 'dates', 'duration']) string(trip[field], field);
    if (!Array.isArray(trip.days) || !trip.days.length) throw new Error(`旅行 ${trip.id} 至少需要一天行程`);
    const dayIds = new Set();
    const days = trip.days.map((day, index) => {
      if (!day || typeof day.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,15}$/.test(day.id) || dayIds.has(day.id)) {
        throw new Error(`旅行 ${trip.id} 的日期 ID 必须唯一，且只能使用 1–16 个小写字母、数字、下划线或短横线`);
      }
      dayIds.add(day.id);
      for (const field of ['title', 'date', 'summary', 'transport', 'stay', 'note']) string(day[field], field);
      if (day.hasOutdoorClimbing !== undefined && typeof day.hasOutdoorClimbing !== 'boolean') {
        throw new Error('hasOutdoorClimbing 必须为 true 或 false');
      }
      if (!Array.isArray(day.stops)) throw new Error(`日期 ${day.id} 缺少 stops`);
      for (const stop of day.stops) {
        if (!stop) throw new Error('行程站点不能为空');
        for (const field of ['time', 'name', 'detail']) string(stop[field], field);
        if (!['transport', 'hotel', 'meal', 'sight'].includes(stop.kind)) throw new Error('站点类型无效');
        if (
          stop.coordinates !== undefined &&
          (!Array.isArray(stop.coordinates) ||
            stop.coordinates.length !== 2 ||
            !Number.isFinite(stop.coordinates[0]) ||
            Math.abs(stop.coordinates[0]) > 90 ||
            !Number.isFinite(stop.coordinates[1]) ||
            Math.abs(stop.coordinates[1]) > 180)
        ) {
          throw new Error('站点坐标应为有效的 [纬度, 经度]');
        }
      }
      return {
        ...day,
        day: index + 1,
        shortDate: day.shortDate || day.date,
        weekday: day.weekday || '',
        city: day.city || trip.destination,
        route: day.route || day.stops.map((stop) => stop.name).join(' → '),
        cover: cover(day.cover),
        coverTitle: strings(day.coverTitle, [day.title]),
        tags: strings(day.tags),
        hasOutdoorClimbing: day.hasOutdoorClimbing === true,
      };
    });
    return {
      ...trip,
      subtitle: trip.subtitle || '',
      shortDates: trip.shortDates || trip.dates,
      year: trip.dates.match(/\d{4}/)?.[0] || '',
      cover: cover(trip.cover),
      coverHeight: Number.isFinite(trip.coverHeight) ? Math.max(240, Math.min(640, trip.coverHeight)) : 460,
      coverTitle: strings(trip.coverTitle, [trip.destination, trip.title]),
      tags: strings(trip.tags),
      categories: strings(trip.categories),
      days,
    };
  });
}

module.exports = { normalizeTrips };
