import { getCardColumns, toggleSaved } from '../../utils/travel';

Page({
  data: { leftColumn: [], rightColumn: [], resultCount: 0 },
  onShow() {
    this.updateCards();
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
