const express = require('express');
const { createDatabase } = require('./db');
const { createCommunity } = require('./community');
const { InputError, getIdentity } = require('./weixin');
const { normalizeTrips } = require('./trip-content');

function createApp(database, moderation) {
  const app = express();
  const dispatch = createCommunity(database, moderation);
  app.disable('x-powered-by');
  app.get('/health', (request, response) => response.json({ ok: true }));
  app.get('/', (request, response) => response.json({ service: '阿帆的旅行账本', version: '1.0.0' }));
  const requireWechat = (request, response, next) => {
    try {
      request.wechatIdentity = getIdentity(request.headers);
      response.set('Cache-Control', 'no-store');
      next();
    } catch (error) {
      next(error);
    }
  };
  app.get('/api/trips', requireWechat, async (request, response) => {
    response.json({ ok: true, data: { trips: normalizeTrips(await database.listTrips()) } });
  });
  app.post('/api/community', requireWechat, express.json({ limit: '80kb' }), async (request, response) => {
    if (!request.body || Array.isArray(request.body) || typeof request.body !== 'object')
      throw new InputError('请求内容无法读取');
    response.json({ ok: true, data: await dispatch(request.body, request.wechatIdentity) });
  });
  app.use((request, response) => response.status(404).json({ ok: false, message: '接口暂时不存在' }));
  app.use((error, request, response, next) => {
    if (error instanceof InputError) return response.status(error.status).json({ ok: false, message: error.message });
    if (error.type === 'entity.too.large')
      return response.status(413).json({ ok: false, message: '头像过大，请重新选择' });
    if (error.type === 'entity.parse.failed')
      return response.status(400).json({ ok: false, message: '请求内容无法读取' });
    console.error('Travel request failed:', error.code || error.name);
    const message = request.path === '/api/trips' ? '行程暂时无法更新，请稍后重试' : '同行记录暂时不可用，请稍后重试';
    return response.status(503).json({ ok: false, message });
  });
  return app;
}

async function start() {
  const database = createDatabase();
  for (let attempt = 0; ; attempt += 1) {
    try {
      await database.init();
      break;
    } catch (error) {
      if (attempt >= 5) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  const server = createApp(database).listen(Number(process.env.PORT || 80), '0.0.0.0', () => {
    console.log('Travel journal service is ready');
  });
  process.on('SIGTERM', () => {
    server.close(async () => {
      await database.close();
      process.exit(0);
    });
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Service startup failed:', error.code || error.message);
    process.exit(1);
  });
}

module.exports = { createApp };
