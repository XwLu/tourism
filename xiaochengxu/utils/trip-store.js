import { trips as bundledTrips } from '../data/trips';
import { cloudEnvironmentId, cloudServiceName } from '../config/cloud';

const cacheKey = 'travel-trip-content-v1';
let currentTrips = null;
let pendingRequest = null;

function validateTrips(trips) {
  if (!Array.isArray(trips)) throw new Error('行程内容暂时无法读取，请稍后重试');
  const tripIds = new Set();
  for (const trip of trips) {
    if (
      !trip ||
      typeof trip.id !== 'string' ||
      tripIds.has(trip.id) ||
      !['title', 'destination', 'dates', 'duration'].every((field) => typeof trip[field] === 'string') ||
      !['tags', 'categories', 'coverTitle', 'days'].every((field) => Array.isArray(trip[field])) ||
      !trip.days.length
    ) {
      throw new Error('行程内容暂时无法读取，请稍后重试');
    }
    tripIds.add(trip.id);
    const dayIds = new Set();
    for (const day of trip.days) {
      if (
        !day ||
        typeof day.id !== 'string' ||
        dayIds.has(day.id) ||
        !['title', 'date', 'summary', 'transport', 'stay', 'note'].every((field) => typeof day[field] === 'string') ||
        !Array.isArray(day.tags) ||
        !Array.isArray(day.coverTitle) ||
        !Array.isArray(day.stops) ||
        (day.hasOutdoorClimbing !== undefined && typeof day.hasOutdoorClimbing !== 'boolean') ||
        day.stops.some(
          (stop) => !stop || !['name', 'time', 'kind', 'detail'].every((field) => typeof stop[field] === 'string'),
        )
      ) {
        throw new Error('行程内容暂时无法读取，请稍后重试');
      }
      dayIds.add(day.id);
    }
  }
  return trips;
}

export function getTrips() {
  if (currentTrips !== null) return currentTrips;
  try {
    const cached = wx.getStorageSync(cacheKey);
    if (cached && cached.version === 1) currentTrips = validateTrips(cached.trips);
  } catch (error) {}
  if (currentTrips === null) currentTrips = bundledTrips;
  return currentTrips;
}

export function refreshTrips() {
  if (pendingRequest) return pendingRequest;
  pendingRequest = fetchTrips().finally(() => {
    pendingRequest = null;
  });
  return pendingRequest;
}

async function fetchTrips() {
  if (!wx.cloud || !wx.cloud.callContainer) throw new Error('请升级微信后更新行程');
  let response;
  try {
    response = await wx.cloud.callContainer({
      config: { env: cloudEnvironmentId },
      path: '/api/trips',
      header: { 'X-WX-SERVICE': cloudServiceName },
      method: 'GET',
      timeout: 15000,
    });
  } catch (error) {
    throw new Error('暂时连不上行程，请稍后重试');
  }
  if (response.statusCode === 404) throw new Error('行程服务尚未部署，请联系行程管理员');
  if (response.statusCode !== 200 || !response.data || response.data.ok !== true) {
    throw new Error(response.data?.message || '行程暂时无法更新，请稍后重试');
  }
  const trips = validateTrips(response.data.data?.trips);
  currentTrips = trips;
  try {
    wx.setStorageSync(cacheKey, { version: 1, trips });
  } catch (error) {}
  return trips;
}
