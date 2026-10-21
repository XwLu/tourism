import { getCardColumns, toggleSaved } from '../../utils/travel';
import { getTrips, refreshTrips } from '../../utils/trip-store';

Page({
  data: {
    title: '好想全职旅攀',
    subtitle: '想去看海，想去攀岩，也想把日子过在路上。',
    tripCount: 0,
    tripsLoading: false,
    tripError: '',
    keyword: '',
    category: 'all',
    filters: [
      { id: 'all', label: '全部旅行' },
      { id: 'seaside', label: '山海之间' },
      { id: 'city', label: '城市漫游' },
      { id: 'climbing', label: '攀岩出行' },
    ],
    leftColumn: [],
    rightColumn: [],
    resultCount: 0,
  },
  onShow() {
    this.updateCards();
    this.loadTrips();
  },
  onUnload() {
    this.disposed = true;
  },
  async onPullDownRefresh() {
    await this.loadTrips();
    wx.stopPullDownRefresh();
  },
  async loadTrips() {
    if (this.data.tripsLoading) return;
    this.setData({ tripsLoading: true, tripError: '' });
    try {
      await refreshTrips();
      if (!this.disposed) this.updateCards();
    } catch (error) {
      if (!this.disposed) this.setData({ tripError: error.message });
    } finally {
      if (!this.disposed) this.setData({ tripsLoading: false });
    }
  },
  updateCards() {
    this.setData({
      tripCount: getTrips().length,
      ...getCardColumns({ keyword: this.data.keyword, category: this.data.category }),
    });
  },
  onSearch(event) {
    this.setData({ keyword: event.detail.value });
    this.updateCards();
  },
  selectCategory(event) {
    this.setData({ category: event.currentTarget.dataset.id });
    this.updateCards();
  },
  resetFilters() {
    this.setData({ keyword: '', category: 'all' });
    this.updateCards();
  },
  toggleFavorite(event) {
    toggleSaved(event.detail.id);
    this.updateCards();
  },
  onShareAppMessage() {
    return { title: '好想全职旅攀｜我的旅行计划', path: '/pages/home/index' };
  },
  onShareTimeline() {
    return { title: '好想全职旅攀｜我的旅行计划' };
  },
});
