import { getCardColumns, toggleSaved } from '../../utils/travel';
import { refreshTrips } from '../../utils/trip-store';

Page({
  data: { leftColumn: [], rightColumn: [], resultCount: 0, tripsLoading: false, tripError: '' },
  onShow() {
    if (typeof this.getTabBar === 'function') this.getTabBar()?.setData({ selected: 'pages/saved/index' });
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
    this.setData(getCardColumns({ savedOnly: true }));
  },
  toggleFavorite(event) {
    toggleSaved(event.detail.id);
    this.updateCards();
  },
  goDiscover() {
    wx.switchTab({ url: '/pages/home/index' });
  },
});
