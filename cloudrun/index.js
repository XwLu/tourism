const express = require('express');
const { createDatabase } = require('./db');
const { createCommunity } = require('./community');
const { InputError, getIdentity } = require('./weixin');
const { normalizeTrips } = require('./trip-content');
const { createHash, timingSafeEqual } = require('node:crypto');
const { normalizeGuidebook } = require('./guidebook');

function createApp(database, moderation, env = process.env) {
  const app = express();
  const dispatch = createCommunity(database, moderation);
  app.disable('x-powered-by');
  app.get('/health', (request, response) => response.json({ ok: true }));
  app.get('/', (request, response) => response.json({ service: '阿帆的旅行账本', version: '1.0.0' }));
  const requirePublisher = (request, response, next) => {
    response.set('Cache-Control', 'no-store');
    const token = env.TRIP_PUBLISH_TOKEN;
    if (!token || token.length < 32) return response.status(503).json({ ok: false, message: '行程发布未配置' });
    const supplied = request.headers.authorization || '';
    const digest = (value) => createHash('sha256').update(value).digest();
    if (!timingSafeEqual(digest(supplied), digest(`Bearer ${token}`))) {
      return response.status(401).json({ ok: false, message: '发布凭据无效' });
    }
    next();
  };
  app.post('/api/admin/trips', requirePublisher, express.json({ limit: '2mb' }), async (request, response) => {
    let trips;
    try {
      trips = normalizeTrips(request.body?.trips);
      if (!trips.length) throw new Error('行程列表不能为空');
    } catch (error) {
      throw new InputError(error.message);
    }
    response.json({ ok: true, data: await database.publishTrips(trips) });
  });
  app.post('/api/admin/guidebooks', requirePublisher, express.json({ limit: '16mb' }), async (request, response) => {
    let guide;
    try {
      guide = normalizeGuidebook(request.body);
    } catch (error) {
      throw new InputError(error.message);
    }
    response.json({ ok: true, data: await database.publishGuidebook(guide) });
  });
  app.use((request, response, next) => {
    if (env.TRIP_PUBLISH_ONLY === 'true') return response.status(404).json({ ok: false, message: '接口暂时不存在' });
    next();
  });
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
  app.get('/api/guidebooks', requireWechat, async (request, response) => {
    response.json({ ok: true, data: { guidebooks: await database.listGuidebooks() } });
  });
  app.get('/api/guidebooks/:id/pages/:page', requireWechat, async (request, response) => {
    const { id, page } = request.params;
    const { version } = request.query;
    if (!/^[a-z0-9-]{1,64}$/.test(id) || !/^[1-9]\d{0,3}$/.test(page) || typeof version !== 'string' || !/^[a-f0-9]{64}$/.test(version)) {
      throw new InputError('路书页码无效');
    }
    const image = await database.getGuidebookPage(id, Number(page), version);
    if (!image) return response.status(404).json({ ok: false, message: '路书已更新或页面不存在，请重新加载' });
    response.json({ ok: true, data: { image: image.toString('base64') } });
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
      return response.status(413).json({ ok: false, message: '请求内容过大，请缩小后重试' });
    if (error.type === 'entity.parse.failed')
      return response.status(400).json({ ok: false, message: '请求内容无法读取' });
    console.error('Travel request failed:', error.code || error.name);
    const message = request.path.startsWith('/api/admin/') ? '发布失败，请重新发布并验证' : request.path.startsWith('/api/guidebooks') ? '路书暂时无法加载，请稍后重试' : request.path === '/api/trips' ? '行程暂时无法更新，请稍后重试' : '同行记录暂时不可用，请稍后重试';
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
