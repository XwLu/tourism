import fs from 'node:fs/promises';

try {
  if (!process.argv[2]) throw new Error('请提供线路目录 JSON 文件');
  const input = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
  const url = new URL(process.env.TRIP_PUBLISH_URL);
  const token = process.env.TRIP_PUBLISH_TOKEN;
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !token || token.length < 32) throw new Error('发布服务配置无效');
  url.pathname = '/api/admin/climbing-routes';
  const response = await fetch(url, { method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`发布请求失败（HTTP ${response.status}）`);
  const result = await response.json();
  if (!result.ok || result.data?.guideId !== input.guideId || result.data?.count !== input.routes.length) throw new Error('发布回执不一致');
  console.log(`线路目录已提交：${input.guideId}，${result.data.count} 条`);
} catch (error) { console.error(`未确认线路目录发布成功：${error.message}`); process.exitCode = 1; }
