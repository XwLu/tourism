import { cloudEnvironmentId, cloudServiceName } from '../config/cloud';

const avatarRequests = new Map();
const avatarAccess = new Map();
const avatarLimit = 48 * 1024;
const avatarPrefix = 'travel-shared-avatar-';

async function callCommunity(action, payload = {}) {
  if (!wx.cloud || !wx.cloud.callContainer) throw new Error('请升级微信后使用报名和评论');
  let response;
  try {
    response = await wx.cloud.callContainer({
      config: { env: cloudEnvironmentId },
      path: '/api/community',
      header: { 'X-WX-SERVICE': cloudServiceName, 'content-type': 'application/json' },
      method: 'POST',
      timeout: 15000,
      data: { ...payload, action },
    });
  } catch (error) {
    throw new Error('暂时连不上同行记录，请稍后重试');
  }
  if (response.statusCode === 404) throw new Error('同行记录服务尚未部署，请联系行程管理员');
  const result = response.data;
  if (!result || typeof result.ok !== 'boolean') throw new Error('同行记录服务尚未准备好，请稍后重试');
  if (!result.ok) throw new Error(result.message || '暂时无法保存或读取，请稍后重试');
  if (response.statusCode !== 200) throw new Error('同行记录服务暂时不可用，请稍后重试');
  return result.data;
}

function trimAvatarCache(fileSystem) {
  fileSystem.readdir({
    dirPath: wx.env.USER_DATA_PATH,
    success({ files }) {
      const cached = files
        .filter((name) => name.startsWith(avatarPrefix))
        .sort((left, right) => (avatarAccess.get(left) || 0) - (avatarAccess.get(right) || 0));
      cached.slice(0, Math.max(0, cached.length - 100)).forEach((name) => {
        fileSystem.unlink({ filePath: `${wx.env.USER_DATA_PATH}/${name}`, fail() {} });
        avatarAccess.delete(name);
      });
    },
    fail() {},
  });
}

async function loadAvatar(avatarId) {
  if (!/^[a-f0-9]{64}$/.test(avatarId || '')) return '';
  avatarAccess.set(`${avatarPrefix}${avatarId}.jpg`, Date.now());
  if (avatarRequests.has(avatarId)) return avatarRequests.get(avatarId);
  const request = (async () => {
    const fileSystem = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/${avatarPrefix}${avatarId}.jpg`;
    try {
      await new Promise((resolve, reject) => fileSystem.access({ path: filePath, success: resolve, fail: reject }));
      return filePath;
    } catch (error) {
      const result = await callCommunity('getAvatar', { avatarId });
      if (typeof result.base64 !== 'string' || result.base64.length > Math.ceil(avatarLimit / 3) * 4) return '';
      await new Promise((resolve, reject) => {
        fileSystem.writeFile({ filePath, data: result.base64, encoding: 'base64', success: resolve, fail: reject });
      });
      trimAvatarCache(fileSystem);
      return filePath;
    }
  })().catch(() => '');
  avatarRequests.set(avatarId, request);
  try {
    return await request;
  } catch (error) {
    return '';
  } finally {
    avatarRequests.delete(avatarId);
  }
}

async function displayProfile(profile) {
  if (!profile) return null;
  return { ...profile, avatarUrl: await loadAvatar(profile.avatarId) };
}

export async function requestCommunity(action, payload = {}) {
  const result = await callCommunity(action, payload);
  const [profile, members, comments] = await Promise.all([
    result.profile ? displayProfile(result.profile) : null,
    result.members ? Promise.all(result.members.map(displayProfile)) : null,
    result.comments ? Promise.all(result.comments.map(displayProfile)) : null,
  ]);
  return {
    ...result,
    ...(profile ? { profile } : {}),
    ...(members ? { members } : {}),
    ...(comments ? { comments } : {}),
  };
}

export async function saveCommunityProfile({ nickName, avatar }) {
  if (typeof nickName !== 'string' || !nickName.trim() || nickName.trim().length > 24) {
    throw new Error('请填写 1–24 个字的昵称');
  }
  if (typeof avatar !== 'string' || !avatar) throw new Error('请选择头像');
  const payload = { nickName: nickName.trim() };
  if (!/^[a-f0-9]{64}$/.test(avatar)) {
    let base64;
    try {
      const compressed = await wx.compressImage({
        src: avatar,
        quality: 70,
        compressedWidth: 128,
        compressedHeight: 128,
      });
      const result = await new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: compressed.tempFilePath,
          encoding: 'base64',
          success: resolve,
          fail: reject,
        });
      });
      base64 = result.data;
    } catch (error) {
      throw new Error('头像未能读取，请重新选择');
    }
    if (typeof base64 !== 'string' || base64.length > Math.ceil(avatarLimit / 3) * 4) {
      throw new Error('头像过大，请重新选择一张较小的图片');
    }
    payload.avatarBase64 = base64;
  }
  return requestCommunity('saveProfile', payload);
}

export function formatCommentTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${hours}:${minutes}`;
}
