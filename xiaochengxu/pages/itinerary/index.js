import { getTrip, getDay, getDayText, getSavedIds, getStops, toggleSaved } from '../../utils/travel';
import { getMapData } from '../../utils/coordinates';
import { formatCommentTime, requestCommunity, saveCommunityProfile } from '../../utils/community';
import { refreshTrips } from '../../utils/trip-store';

function displayComments(comments) {
  return comments.map((comment) => ({
    ...comment,
    initial: comment.nickName.slice(0, 1),
    timeLabel: formatCommentTime(comment.createdAt),
  }));
}

Page({
  data: {
    trip: null,
    tripLoading: false,
    tripError: '',
    days: [],
    day: null,
    stops: [],
    isSaved: false,
    showMap: false,
    previousDay: null,
    nextDay: null,
    communityLoading: false,
    communityLoaded: false,
    communityError: '',
    profile: null,
    members: [],
    memberCount: null,
    isJoined: false,
    joining: false,
    comments: [],
    commentCount: 0,
    commentDraft: '',
    nextCommentCursor: null,
    loadingMoreComments: false,
    postingComment: false,
    deletingCommentId: '',
    profileVisible: false,
    profileAvatar: '',
    profileAvatarPreview: '',
    profileNickName: '',
    profileSaving: false,
    profileAction: '',
  },
  onLoad(options) {
    this.tripId = options.id;
    this.initialDayId = options.day;
    this.commentDrafts = {};
    this.commentRequests = {};
    this.renderTrip(options.day);
  },
  renderTrip(dayId) {
    const trip = getTrip(this.tripId);
    if (!trip) {
      this.communitySequence = (this.communitySequence || 0) + 1;
      this.setData({ trip: null, day: null, days: [], communityLoading: false });
      return;
    }
    this.setData({ trip, days: trip.days, isSaved: getSavedIds().includes(trip.id) });
    this.showDay(getDay(dayId, trip.id) || trip.days[0]);
    wx.setNavigationBarTitle({ title: `${trip.destination} · 旅行计划` });
  },
  async loadTrip() {
    if (this.data.tripLoading) return;
    this.setData({ tripLoading: true, tripError: '' });
    try {
      await refreshTrips();
      if (!this.disposed) this.renderTrip(this.data.day ? this.data.day.id : this.initialDayId);
    } catch (error) {
      if (!this.disposed) this.setData({ tripError: error.message });
    } finally {
      if (!this.disposed) this.setData({ tripLoading: false });
    }
  },
  async onPullDownRefresh() {
    await this.loadTrip();
    wx.stopPullDownRefresh();
  },
  showDay(day) {
    const { days } = this.data;
    const dayIndex = days.findIndex((item) => item.id === day.id);
    this.setData({
      day,
      stops: getStops(day),
      previousDay: days[dayIndex - 1] || null,
      nextDay: days[dayIndex + 1] || null,
      showMap: false,
      comments: [],
      commentCount: 0,
      nextCommentCursor: null,
      loadingMoreComments: false,
      commentDraft: this.commentDrafts[day.id] || '',
      communityLoaded: false,
      communityError: '',
      ...getMapData(day),
    });
    this.loadCommunity();
  },
  onShow() {
    if (this.data.trip) {
      this.setData({ isSaved: getSavedIds().includes(this.data.trip.id) });
    }
    this.loadTrip();
  },
  onUnload() {
    this.disposed = true;
    this.communitySequence = (this.communitySequence || 0) + 1;
  },
  async loadCommunity() {
    const sequence = (this.communitySequence || 0) + 1;
    this.communitySequence = sequence;
    const { trip, day } = this.data;
    this.setData({ communityLoading: true, communityError: '' });
    try {
      const result = await requestCommunity('getDay', { tripId: trip.id, dayId: day.id });
      if (sequence !== this.communitySequence || this.disposed) return;
      this.setData({
        profile: result.profile,
        members: result.members.map((member) => ({ ...member, initial: member.nickName.slice(0, 1) })),
        memberCount: result.memberCount,
        isJoined: result.isJoined,
        comments: displayComments(result.comments),
        commentCount: result.commentCount,
        nextCommentCursor: result.nextCursor,
        communityLoaded: true,
      });
    } catch (error) {
      if (sequence === this.communitySequence && !this.disposed) this.setData({ communityError: error.message });
    } finally {
      if (sequence === this.communitySequence && !this.disposed) this.setData({ communityLoading: false });
    }
  },
  async loadMoreComments() {
    if (this.data.loadingMoreComments || !this.data.nextCommentCursor || this.data.communityLoading) return;
    const sequence = this.communitySequence;
    const { trip, day, nextCommentCursor } = this.data;
    this.setData({ loadingMoreComments: true });
    try {
      const result = await requestCommunity('listComments', {
        tripId: trip.id,
        dayId: day.id,
        cursor: nextCommentCursor,
      });
      if (sequence !== this.communitySequence || this.disposed) return;
      const existingIds = new Set(this.data.comments.map((comment) => comment.id));
      this.setData({
        comments: [
          ...this.data.comments,
          ...displayComments(result.comments).filter((comment) => !existingIds.has(comment.id)),
        ],
        nextCommentCursor: result.nextCursor,
      });
    } catch (error) {
      if (sequence === this.communitySequence && !this.disposed) wx.showToast({ title: error.message, icon: 'none' });
    } finally {
      if (sequence === this.communitySequence && !this.disposed) this.setData({ loadingMoreComments: false });
    }
  },
  canUseCommunity() {
    if (this.data.communityLoading || !this.data.communityLoaded || this.data.communityError) {
      wx.showToast({ title: this.data.communityError || '正在读取，请稍候', icon: 'none' });
      return false;
    }
    return true;
  },
  startJoin() {
    if (this.data.joining || this.data.isJoined || !this.canUseCommunity()) return;
    if (!this.data.profile) this.openProfile('join');
    else this.joinTrip();
  },
  async joinTrip() {
    if (this.data.joining) return;
    this.setData({ joining: true });
    try {
      await requestCommunity('join', { tripId: this.data.trip.id });
      if (this.disposed) return;
      this.setData({ isJoined: true });
      wx.showToast({ title: '报名成功', icon: 'success' });
      await this.loadCommunity();
    } catch (error) {
      if (!this.disposed) wx.showToast({ title: error.message, icon: 'none' });
    } finally {
      if (!this.disposed) this.setData({ joining: false });
    }
  },
  openProfile(action) {
    const { profile } = this.data;
    this.setData({
      profileVisible: true,
      profileAction: action,
      profileAvatar: profile ? profile.avatarId : '',
      profileAvatarPreview: profile ? profile.avatarUrl || '' : '',
      profileNickName: profile ? profile.nickName : '',
    });
  },
  editProfile() {
    if (this.canUseCommunity()) this.openProfile('edit');
  },
  closeProfile() {
    if (!this.data.profileSaving) this.setData({ profileVisible: false });
  },
  preventEvent() {},
  onChooseAvatar(event) {
    if (this.data.profileSaving || !event.detail.avatarUrl) return;
    this.setData({ profileAvatar: event.detail.avatarUrl, profileAvatarPreview: event.detail.avatarUrl });
  },
  async submitProfile(event) {
    if (this.data.profileSaving) return;
    const nickName = (event.detail.value.nickName || '').trim();
    if (!nickName || !this.data.profileAvatar) {
      wx.showToast({ title: '请选择头像并填写昵称', icon: 'none' });
      return;
    }
    const { profileAction, profileAvatar } = this.data;
    this.setData({ profileSaving: true });
    try {
      const result = await saveCommunityProfile({
        nickName,
        avatar: profileAvatar,
      });
      if (this.disposed) return;
      this.setData({ profile: result.profile, profileVisible: false });
      if (profileAction === 'join') await this.joinTrip();
      else if (profileAction === 'comment') await this.postComment();
      else await this.loadCommunity();
    } catch (error) {
      if (!this.disposed) wx.showToast({ title: error.message, icon: 'none' });
    } finally {
      if (!this.disposed) this.setData({ profileSaving: false });
    }
  },
  onCommentInput(event) {
    this.commentDrafts[this.data.day.id] = event.detail.value;
    this.setData({ commentDraft: event.detail.value });
  },
  submitComment() {
    if (this.data.postingComment || !this.canUseCommunity()) return;
    if (!this.data.commentDraft.trim()) {
      wx.showToast({ title: '先写一点今天的反馈吧', icon: 'none' });
      return;
    }
    if (!this.data.profile) this.openProfile('comment');
    else this.postComment();
  },
  async postComment() {
    if (this.data.postingComment) return;
    const { trip, day, commentDraft } = this.data;
    const content = commentDraft.trim();
    const previous = this.commentRequests[day.id];
    const requestId =
      previous && previous.content === content
        ? previous.id
        : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
            .slice(0, 32)
            .padEnd(32, '0');
    this.commentRequests[day.id] = { id: requestId, content };
    this.setData({ postingComment: true });
    try {
      await requestCommunity('addComment', { tripId: trip.id, dayId: day.id, content, requestId });
      delete this.commentDrafts[day.id];
      delete this.commentRequests[day.id];
      if (this.disposed) return;
      wx.showToast({ title: '反馈已保存', icon: 'success' });
      if (this.data.day.id === day.id) {
        this.setData({ commentDraft: '' });
        await this.loadCommunity();
      }
    } catch (error) {
      if (!this.disposed) wx.showToast({ title: error.message, icon: 'none' });
    } finally {
      if (!this.disposed) this.setData({ postingComment: false });
    }
  },
  deleteComment(event) {
    if (this.data.deletingCommentId || !this.canUseCommunity()) return;
    const { id } = event.currentTarget.dataset;
    const { trip, day } = this.data;
    wx.showModal({
      title: '删除这条反馈？',
      content: '删除后无法恢复。',
      success: async (result) => {
        if (!result.confirm || this.disposed || this.data.deletingCommentId) return;
        this.setData({ deletingCommentId: id });
        try {
          await requestCommunity('deleteComment', { tripId: trip.id, dayId: day.id, commentId: id });
          if (!this.disposed && this.data.day.id === day.id) await this.loadCommunity();
        } catch (error) {
          if (!this.disposed) wx.showToast({ title: error.message, icon: 'none' });
        } finally {
          if (!this.disposed) this.setData({ deletingCommentId: '' });
        }
      },
    });
  },
  toggleFavorite() {
    const isSaved = toggleSaved(this.data.trip.id);
    if (isSaved !== null) this.setData({ isSaved });
  },
  copyItinerary() {
    wx.setClipboardData({ data: getDayText(this.data.day, this.data.trip) });
  },
  copyPlace(event) {
    wx.setClipboardData({ data: event.currentTarget.dataset.name });
  },
  toggleMap() {
    this.setData({ showMap: !this.data.showMap });
  },
  selectDay(event) {
    const { id } = event.currentTarget.dataset;
    const day = this.data.days.find((item) => item.id === id);
    if (!day) return;
    this.showDay(day);
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },
  changeDay(event) {
    this.selectDay(event);
  },
  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  },
  onShareAppMessage() {
    const { trip, day } = this.data;
    return trip
      ? { title: trip.title, path: `/pages/itinerary/index?id=${trip.id}&day=${day.id}` }
      : { title: '好想全职旅攀', path: '/pages/home/index' };
  },
  onShareTimeline() {
    const { trip, day } = this.data;
    return trip ? { title: trip.title, query: `id=${trip.id}&day=${day.id}` } : { title: '好想全职旅攀' };
  },
});
