import { isDeepStrictEqual } from 'node:util';
import { trips } from './generate-trip-sql.mjs';

try {
  const url = new URL(process.env.TRIP_PUBLISH_URL);
  const token = process.env.TRIP_PUBLISH_TOKEN;
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('TRIP_PUBLISH_URL 必须是无凭据、查询参数的 HTTPS 服务地址');
  }
  if (!token || token.length < 32) throw new Error('请配置至少 32 字符的 TRIP_PUBLISH_TOKEN');
  url.pathname = '/api/admin/trips';
  const response = await fetch(url, {
    method: 'POST',
    redirect: 'error',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ trips }),
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`发布请求失败（HTTP ${response.status}）`);
  const result = await response.json();
  const expected = trips.map((trip) => ({
    id: trip.id, title: trip.title, published: 1,
    days: trip.days.map((day) => ({ id: day.id, date: day.date, hasOutdoorClimbing: day.hasOutdoorClimbing })),
  }));
  if (!result.ok || !isDeepStrictEqual(result.data?.trips, expected)) throw new Error('云端发布回执与源数据不一致');
  console.log('云端事务已提交，正文和日期登记已查询验证：');
  console.log(JSON.stringify(result.data, null, 2));
} catch (error) {
  console.error(`未确认云端发布成功：${error.message}。登记 SQL 已生成；如发生超时，可安全重试。`);
  process.exitCode = 1;
}
