const crypto = require('node:crypto');
const sharp = require('sharp');
const { InputError, checkText, checkImage } = require('./weixin');

const pageSize = 20;
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

function text(value, maxLength, message) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) throw new InputError(message);
  return value.trim();
}

async function normalizeAvatar(base64) {
  if (
    typeof base64 !== 'string' ||
    base64.length > 65536 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)
  ) {
    throw new InputError('头像无法读取，请重新选择');
  }
  try {
    const image = sharp(Buffer.from(base64, 'base64'), { limitInputPixels: 1024 * 1024 });
    const metadata = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format)) throw new Error('Unsupported image');
    return await image.rotate().resize(128, 128, { fit: 'cover' }).jpeg({ quality: 75 }).toBuffer();
  } catch (error) {
    throw new InputError('头像无法读取，请重新选择');
  }
}

function createCommunity(database, moderation = { checkText, checkImage }) {
  async function validateTrip(tripId, dayId, requireDay = false) {
    if (typeof tripId !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(tripId)) {
      throw new InputError('这趟旅行暂时找不到');
    }
    const checkDay = requireDay || dayId !== undefined;
    if (checkDay && (typeof dayId !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,15}$/.test(dayId))) {
      throw new InputError('这一天的行程暂时找不到');
    }
    const exists = await database.hasTripDay(tripId, checkDay ? dayId : undefined);
    if (!exists) throw new InputError(checkDay ? '这一天的行程暂时找不到' : '这趟旅行暂时找不到');
  }

  async function commentPage(event, userId) {
    const { cursor } = event;
    if (
      cursor !== undefined &&
      cursor !== null &&
      (typeof cursor !== 'object' ||
        !Number.isSafeInteger(cursor.createdAt) ||
        cursor.createdAt < 0 ||
        typeof cursor.id !== 'string' ||
        !/^[a-f0-9]{32}$/.test(cursor.id))
    )
      throw new InputError('请重新加载当天反馈');
    const rows = await database.listComments(event.tripId, event.dayId, cursor, pageSize + 1);
    const records = rows.slice(0, pageSize);
    const last = records[records.length - 1];
    return {
      comments: records.map(({ userId: authorId, ...comment }) => ({
        ...comment,
        createdAt: Number(comment.createdAt),
        isMine: authorId === userId,
      })),
      nextCursor: rows.length > pageSize ? { createdAt: Number(last.createdAt), id: last.id } : null,
    };
  }

  return async (event, identity) => {
    const userId = hash(`${identity.appId}:${identity.openid}`);
    switch (event.action) {
      case 'getAvatar': {
        if (typeof event.avatarId !== 'string' || !/^[a-f0-9]{64}$/.test(event.avatarId))
          throw new InputError('头像暂时找不到');
        const avatar = await database.getAvatar(event.avatarId);
        if (!avatar) throw new InputError('头像暂时找不到');
        return { base64: avatar.toString('base64') };
      }
      case 'saveProfile': {
        const nickName = text(event.nickName, 24, '请填写 1–24 个字的昵称');
        const previous = await database.getProfile(userId);
        const avatar = event.avatarBase64 === undefined ? null : await normalizeAvatar(event.avatarBase64);
        if (!previous && !avatar) throw new InputError('请选择头像');
        await Promise.all([
          moderation.checkText(nickName, identity.openid, 1),
          avatar ? moderation.checkImage(avatar) : undefined,
        ]);
        const avatarId = avatar ? hash(avatar) : previous.avatarId;
        return { profile: await database.saveProfile(userId, nickName, avatarId, avatar) };
      }
      case 'getDay': {
        await validateTrip(event.tripId, event.dayId, true);
        const [profile, membership, memberCount, members, commentCount, page] = await Promise.all([
          database.getProfile(userId),
          database.getMembership(event.tripId, userId),
          database.countMembers(event.tripId),
          database.recentMembers(event.tripId),
          database.countComments(event.tripId, event.dayId),
          commentPage(event, userId),
        ]);
        return { profile, isJoined: !!membership, memberCount, members, commentCount, ...page };
      }
      case 'listComments':
        await validateTrip(event.tripId, event.dayId, true);
        return commentPage(event, userId);
      case 'join': {
        await validateTrip(event.tripId);
        if (!(await database.getProfile(userId))) throw new InputError('请先选择头像并填写昵称');
        await database.join(hash(`${event.tripId}:${userId}`), event.tripId, userId);
        return { isJoined: true };
      }
      case 'addComment': {
        await validateTrip(event.tripId, event.dayId, true);
        const content = text(event.content, 500, '请填写 1–500 个字的游玩反馈');
        if (typeof event.requestId !== 'string' || !/^[a-f0-9]{32}$/.test(event.requestId))
          throw new InputError('请重新提交这条反馈');
        const id = hash(`${userId}:${event.tripId}:${event.dayId}:${event.requestId}`).slice(0, 32);
        if (await database.hasComment(id)) return { id };
        if (!(await database.getProfile(userId))) throw new InputError('请先选择头像并填写昵称');
        await moderation.checkText(content, identity.openid, 2);
        await database.addComment(id, event.tripId, event.dayId, userId, content);
        return { id };
      }
      case 'deleteComment': {
        await validateTrip(event.tripId, event.dayId, true);
        if (typeof event.commentId !== 'string' || !/^[a-f0-9]{32}$/.test(event.commentId))
          throw new InputError('这条反馈暂时找不到');
        if (!(await database.deleteComment(event.commentId, event.tripId, event.dayId, userId))) {
          throw new InputError('只能删除自己在当天发布的反馈');
        }
        return { deleted: true };
      }
      default:
        throw new InputError('暂不支持这个操作');
    }
  };
}

module.exports = { createCommunity };
