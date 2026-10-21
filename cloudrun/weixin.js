class InputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function getIdentity(headers, env = process.env) {
  const appId = env.WECHAT_APPID || 'wx5dbd496f801eca64';
  const environmentId = env.WECHAT_ENV_ID || env.CBR_ENV_ID || 'prod-d7gikpjuqf33d2a1c';
  const openid = headers['x-wx-openid'];
  if (
    !headers['x-wx-source'] ||
    headers['x-wx-appid'] !== appId ||
    (headers['x-wx-from-appid'] && headers['x-wx-from-appid'] !== appId) ||
    (headers['x-wx-env'] && headers['x-wx-env'] !== environmentId) ||
    typeof openid !== 'string' ||
    !/^[\w-]{16,128}$/.test(openid)
  ) {
    throw new InputError('请通过「阿帆的旅行账本」小程序访问', 401);
  }
  return { openid, appId };
}

async function checkContent(endpoint, options, textCheck) {
  let result;
  try {
    const response = await fetch(`http://api.weixin.qq.com/wxa/${endpoint}`, {
      method: 'POST',
      ...options,
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    result = await response.json();
  } catch (error) {
    throw new InputError('内容检查暂时不可用，请稍后重试', 503);
  }
  if (result.errcode === 87014 || (result.errcode === 0 && textCheck && result.result?.suggest !== 'pass')) {
    throw new InputError('内容未通过检查，请修改后重试');
  }
  if (result.errcode !== 0) {
    console.error('WeChat content check unavailable:', endpoint, result.errcode);
    throw new InputError('内容检查暂时不可用，请联系管理员检查云调用配置', 503);
  }
}

function checkText(content, openid, scene) {
  return checkContent(
    'msg_sec_check',
    {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content, openid, scene, version: 2 }),
    },
    true,
  );
}

function checkImage(avatar) {
  const form = new FormData();
  form.set('media', new Blob([avatar], { type: 'image/jpeg' }), 'avatar.jpg');
  return checkContent('img_sec_check', { body: form }, false);
}

module.exports = { InputError, getIdentity, checkText, checkImage };
