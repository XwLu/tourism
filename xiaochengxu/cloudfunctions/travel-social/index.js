const cloud = require('wx-server-sdk');
const crypto = require('crypto');
const trips = require('./trips.json');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const database = cloud.database();
const command = database.command;
const profiles = database.collection('travel_profiles');
const members = database.collection('travel_members');
const comments = database.collection('travel_comments');
const pageSize = 20;

class InputError extends Error {}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function validateTrip(tripId, dayId, requireDay = false) {
  if (typeof tripId !== 'string' || !Object.prototype.hasOwnProperty.call(trips, tripId)) {
    throw new InputError('这趟旅行暂时找不到');
  }
  if ((requireDay || dayId !== undefined) && !trips[tripId].includes(dayId)) {
    throw new InputError('这一天的行程暂时找不到');
  }
}

function text(value, maximum, message) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maximum) throw new InputError(message);
  return value.trim();
}

async function findById(collection, id) {
  const result = await collection.where({ _id: id }).limit(1).get();
  return result.data[0] || null;
}

function publicProfile(profile) {
  return profile ? { nickName: profile.nickName, avatarFileId: profile.avatarFileId } : null;
}

async function checkText(content, openid, scene) {
  const result = await cloud.openapi.security.msgSecCheck({ content, openid, scene, version: 2 });
  if (!result.result || result.result.suggest !== 'pass') throw new InputError('内容未通过检查，请修改后重试');
}

async function commentPage(tripId, dayId, userId, cursor) {
  validateTrip(tripId, dayId, true);
  let condition = { tripId, dayId };
  if (cursor) {
    if (!Number.isSafeInteger(cursor.createdAt) || typeof cursor.id !== 'string' || !/^[a-f0-9]{32}$/.test(cursor.id)) {
      throw new InputError('请刷新后重试');
    }
    condition = command.and([
      condition,
      command.or([
        { createdAt: command.lt(cursor.createdAt) },
        { createdAt: cursor.createdAt, _id: command.lt(cursor.id) },
      ]),
    ]);
  }
  const result = await comments
    .where(condition)
    .orderBy('createdAt', 'desc')
    .orderBy('_id', 'desc')
    .limit(pageSize + 1)
    .get();
  const records = result.data.slice(0, pageSize);
  const last = records[records.length - 1];
  return {
    comments: records.map((comment) => ({
      id: comment._id,
      ...publicProfile(comment),
      content: comment.content,
      createdAt: comment.createdAt,
      isMine: comment.userId === userId,
    })),
    nextCursor: result.data.length > pageSize ? { createdAt: last.createdAt, id: last._id } : null,
  };
}

async function getDay(event, userId) {
  const { tripId, dayId } = event;
  validateTrip(tripId, dayId, true);
  const [profile, membership, memberCount, recentMembers, commentCount, page] = await Promise.all([
    findById(profiles, userId),
    findById(members, hash(`${tripId}:${userId}`)),
    members.where({ tripId }).count(),
    members.where({ tripId }).orderBy('joinedAt', 'desc').orderBy('_id', 'desc').limit(3).get(),
    comments.where({ tripId, dayId }).count(),
    commentPage(tripId, dayId, userId),
  ]);
  return {
    profile: publicProfile(profile),
    isJoined: !!membership,
    memberCount: memberCount.total,
    members: recentMembers.data.map((member) => ({ id: member._id, ...publicProfile(member) })),
    commentCount: commentCount.total,
    ...page,
  };
}

async function dispatch(event, openid) {
  const userId = hash(openid);
  switch (event.action) {
    case 'prepareAvatar':
      return { cloudPath: `travel-avatars/${userId}/${crypto.randomBytes(16).toString('hex')}.jpg` };
    case 'saveProfile': {
      const nickName = text(event.nickName, 24, '请填写 1–24 个字的昵称');
      const avatarFileId = text(event.avatarFileId, 512, '请选择头像');
      if (!avatarFileId.startsWith('cloud://') || !avatarFileId.includes(`/travel-avatars/${userId}/`)) {
        throw new InputError('请重新选择头像');
      }
      const files = await cloud.getTempFileURL({ fileList: [avatarFileId] });
      if (!files.fileList[0] || files.fileList[0].status !== 0) throw new InputError('头像未保存，请重新选择');
      await checkText(nickName, openid, 1);
      const profile = { nickName, avatarFileId, updatedAt: Date.now() };
      await profiles.doc(userId).set({ data: profile });
      await members.where({ userId }).update({ data: publicProfile(profile) });
      return { profile: publicProfile(profile) };
    }
    case 'getDay':
      return getDay(event, userId);
    case 'listComments':
      return commentPage(event.tripId, event.dayId, userId, event.cursor);
    case 'join': {
      validateTrip(event.tripId);
      const profile = await findById(profiles, userId);
      if (!profile) throw new InputError('请先选择头像并填写昵称');
      const memberId = hash(`${event.tripId}:${userId}`);
      if (!(await findById(members, memberId))) {
        await members
          .doc(memberId)
          .set({ data: { tripId: event.tripId, userId, ...publicProfile(profile), joinedAt: Date.now() } });
      }
      return { isJoined: true };
    }
    case 'addComment': {
      validateTrip(event.tripId, event.dayId, true);
      const content = text(event.content, 500, '请填写 1–500 个字的游玩反馈');
      if (typeof event.requestId !== 'string' || !/^[a-f0-9]{32}$/.test(event.requestId)) {
        throw new InputError('请重新提交这条留言');
      }
      const profile = await findById(profiles, userId);
      if (!profile) throw new InputError('请先选择头像并填写昵称');
      const commentId = hash(`${userId}:${event.tripId}:${event.dayId}:${event.requestId}`).slice(0, 32);
      if (await findById(comments, commentId)) return { id: commentId };
      await checkText(content, openid, 2);
      await comments.doc(commentId).set({
        data: {
          tripId: event.tripId,
          dayId: event.dayId,
          userId,
          ...publicProfile(profile),
          content,
          createdAt: Date.now(),
        },
      });
      return { id: commentId };
    }
    case 'deleteComment': {
      validateTrip(event.tripId, event.dayId, true);
      if (typeof event.commentId !== 'string' || !/^[a-f0-9]{32}$/.test(event.commentId))
        throw new InputError('留言暂时找不到');
      const comment = await findById(comments, event.commentId);
      if (!comment || comment.userId !== userId || comment.tripId !== event.tripId || comment.dayId !== event.dayId) {
        throw new InputError('只能删除自己在当天发布的留言');
      }
      await comments.doc(event.commentId).remove();
      return { deleted: true };
    }
    default:
      throw new InputError('暂不支持这个操作');
  }
}

exports.main = async (event) => {
  try {
    const { OPENID } = cloud.getWXContext();
    if (!OPENID) throw new InputError('请在微信中打开小程序后重试');
    return { ok: true, data: await dispatch(event || {}, OPENID) };
  } catch (error) {
    if (!(error instanceof InputError)) console.error('travel-social request failed', error);
    return { ok: false, message: error instanceof InputError ? error.message : '暂时无法保存或读取，请稍后重试' };
  }
};
