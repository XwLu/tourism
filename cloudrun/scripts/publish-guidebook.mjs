import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { normalizeGuidebook } = require('../guidebook');

try {
  const inputPath = process.argv[2];
  if (!inputPath) throw new Error('请提供准备好的路书 JSON 路径');
  const input = JSON.parse(await fs.readFile(inputPath, 'utf8'));
  const guide = normalizeGuidebook(input);
  const schema = await fs.readFile(new URL('../schema.sql', import.meta.url), 'utf8');
  const tables = ['climbing_guidebooks', 'climbing_guidebook_pages', 'climbing_guidebook_sections', 'climbing_guidebook_section_intros'].map((name) => {
    const match = schema.match(new RegExp(`CREATE TABLE IF NOT EXISTS ${name} \\([\\s\\S]*?;`));
    if (!match) throw new Error('路书表结构未找到');
    return match[0];
  });
  const sqlText = (value) => `CONVERT(X'${Buffer.from(value, 'utf8').toString('hex')}' USING utf8mb4)`;
  const statements = [
    ...tables, 'START TRANSACTION;',
    `INSERT INTO climbing_guidebooks (guide_id,title,location,description,version,page_count,published) VALUES (${sqlText(guide.id)},${sqlText(guide.title)},${sqlText(guide.location)},${sqlText(guide.description)},'${guide.version}',${guide.pages.length},1) ON DUPLICATE KEY UPDATE title=VALUES(title),location=VALUES(location),description=VALUES(description),version=VALUES(version),page_count=VALUES(page_count),published=1;`,
    `DELETE FROM climbing_guidebook_pages WHERE guide_id=${sqlText(guide.id)};`,
    `DELETE FROM climbing_guidebook_section_intros WHERE guide_id=${sqlText(guide.id)};`,
    `DELETE FROM climbing_guidebook_sections WHERE guide_id=${sqlText(guide.id)};`,
    ...input.pages.map((page, index) => `INSERT INTO climbing_guidebook_pages (guide_id,page_number,image) VALUES (${sqlText(guide.id)},${index + 1},FROM_BASE64('${page}'));`),
    ...guide.sections.map((section, index) => `INSERT INTO climbing_guidebook_sections (guide_id,section_order,section_id,title,start_page,end_page) VALUES (${sqlText(guide.id)},${index},${sqlText(section.id)},${sqlText(section.title)},${section.startPage},${section.endPage});`),
    ...guide.sections.filter((section) => section.intro).map((section) => `INSERT INTO climbing_guidebook_section_intros (guide_id,section_id,intro) VALUES (${sqlText(guide.id)},${sqlText(section.id)},${sqlText(JSON.stringify(section.intro))});`),
    'COMMIT;', '',
  ];
  const sqlPath = path.join(path.dirname(inputPath), `${guide.id}.sql`);
  await fs.writeFile(sqlPath, statements.join('\n'));
  console.log(`已生成路书 SQL：${sqlPath}（${guide.pages.length} 页）`);
  if (process.argv.includes('--sql-only')) process.exit(0);
  const url = new URL(process.env.TRIP_PUBLISH_URL);
  const token = process.env.TRIP_PUBLISH_TOKEN;
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('发布地址必须是无凭据、查询参数的 HTTPS 地址');
  if (!token || token.length < 32) throw new Error('请配置发布令牌');
  url.pathname = '/api/admin/guidebooks';
  const response = await fetch(url, { method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`发布请求失败（HTTP ${response.status}）`);
  const result = await response.json();
  if (!result.ok || result.data?.id !== guide.id || result.data?.version !== guide.version || result.data?.pageCount !== guide.pages.length) throw new Error('发布回执与路书不一致');
  console.log(`路书已提交并验证：${guide.title}，${guide.pages.length} 页。`);
} catch (error) {
  console.error(`未确认路书发布成功：${error.message}`);
  process.exitCode = 1;
}
