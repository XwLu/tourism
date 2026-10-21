import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const { normalizeTrips } = createRequire(import.meta.url)('../trip-content');

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDirectory = path.resolve(serverDirectory, '../xiaochengxu/data');
const outputPath = path.join(serverDirectory, 'trip-registry.sql');
const context = vm.createContext({});
const modules = new Map();

async function loadModule(filename) {
  if (!modules.has(filename)) {
    modules.set(
      filename,
      fs
        .readFile(filename, 'utf8')
        .then((source) => new vm.SourceTextModule(source, { context, identifier: filename })),
    );
  }
  return modules.get(filename);
}

const entry = await loadModule(path.join(dataDirectory, 'trips.js'));
await entry.link((specifier, parent) => {
  const filename = path.resolve(
    path.dirname(parent.identifier),
    specifier.endsWith('.js') ? specifier : `${specifier}.js`,
  );
  if (!filename.startsWith(`${dataDirectory}${path.sep}`)) throw new Error('行程数据只能引用 data 目录内的模块');
  return loadModule(filename);
});
await entry.evaluate({ timeout: 1000 });
const trips = normalizeTrips(entry.namespace.trips);
if (!trips.length) throw new Error('行程列表不能为空；下架旅行请在数据库中设置 published = 0');

const rows = [];
const contents = [];
for (const trip of trips) {
  for (const day of trip.days) {
    rows.push(`  ('${trip.id}', '${day.id}')`);
  }
  const content = Buffer.from(JSON.stringify(trip), 'utf8').toString('hex');
  contents.push(`  ('${trip.id}', CONVERT(0x${content} USING utf8mb4), ${contents.length}, 1)`);
}

const schema = await fs.readFile(path.join(serverDirectory, 'schema.sql'), 'utf8');
const tables = schema
  .split(';')
  .map((statement) => statement.trim())
  .filter((statement) => /^CREATE TABLE IF NOT EXISTS travel_(trip_days|trips)\s*\(/.test(statement));
if (tables.length !== 2) throw new Error('缺少行程数据表定义');
const sql =
  `${tables.join(';\n\n')};\n\nSTART TRANSACTION;\n\n` +
  `INSERT INTO travel_trips (trip_id, content, sort_order, published) VALUES\n${contents.join(',\n')}\n` +
  `ON DUPLICATE KEY UPDATE content = VALUES(content), sort_order = VALUES(sort_order), published = VALUES(published);\n\n` +
  `INSERT INTO travel_trip_days (trip_id, day_id) VALUES\n${rows.join(',\n')}\n` +
  `ON DUPLICATE KEY UPDATE day_id = VALUES(day_id);\n\nCOMMIT;\n`;
await fs.writeFile(outputPath, sql, 'utf8');
console.log(
  `已生成 ${outputPath}（${trips.length} 趟完整旅行，${rows.length} 个日期）。在 MySQL 目标库执行即可更新小程序行程，无需重新发版。`,
);
