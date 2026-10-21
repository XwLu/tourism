import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

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
const { trips } = entry.namespace;
if (!Array.isArray(trips) || !trips.length) throw new Error('行程列表不能为空');

const rows = [];
const tripIds = new Set();
for (const trip of trips) {
  if (typeof trip.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(trip.id) || tripIds.has(trip.id)) {
    throw new Error('旅行 ID 必须唯一，且只能使用 1–64 个小写字母、数字、下划线或短横线');
  }
  tripIds.add(trip.id);
  if (!Array.isArray(trip.days) || !trip.days.length) throw new Error(`旅行 ${trip.id} 至少需要一天行程`);
  const dayIds = new Set();
  for (const day of trip.days) {
    if (typeof day.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,15}$/.test(day.id) || dayIds.has(day.id)) {
      throw new Error(`旅行 ${trip.id} 的日期 ID 必须唯一，且只能使用 1–16 个小写字母、数字、下划线或短横线`);
    }
    dayIds.add(day.id);
    rows.push(`  ('${trip.id}', '${day.id}')`);
  }
}

const sql = `INSERT INTO travel_trip_days (trip_id, day_id) VALUES\n${rows.join(
  ',\n',
)}\nON DUPLICATE KEY UPDATE day_id = VALUES(day_id);\n`;
await fs.writeFile(outputPath, sql, 'utf8');
console.log(
  `已生成 ${outputPath}（${trips.length} 趟旅行，${rows.length} 个日期）。在 MySQL 目标库执行即可生效，无需重新部署后端。`,
);
