import { fetchGuidebooks } from '../../utils/guidebooks';

const guideCovers = {
  meigu: 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/dongyang-meigu.jpg',
  'linan-shiziyan': 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/linan-shiziyan.jpg',
  'quzhou-liangtoudong': 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/quzhou-liangtoudong.jpg',
  'xinchang-baizhangyan': 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/xinchang-baizhangyan.jpg',
  'xinchang-shigoudong': '/static/travel/xinchang-shigoudong.jpg',
  'xinchang-tiandiyan': '/static/travel/xinchang-tiandiyan.jpg',
};

Page({
  data: { keyword: '', guides: [], results: [], loading: false, error: '' },
  onShow() {
    if (typeof this.getTabBar === 'function') this.getTabBar()?.setData({ selected: 'pages/guidebooks/index' });
    this.loadGuides();
  },
  async onPullDownRefresh() { await this.loadGuides(); wx.stopPullDownRefresh(); },
  async loadGuides() {
    if (this.data.loading) return;
    this.setData({ loading: true, error: '' });
    try {
      const guides = (await fetchGuidebooks()).map((guide) => ({ ...guide, cover: guideCovers[guide.id] || '' }));
      this.setData({ guides });
      this.filterGuides();
    } catch (error) {
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },
  onSearch(event) { this.setData({ keyword: event.detail.value }); this.filterGuides(); },
  clearSearch() { this.setData({ keyword: '' }); this.filterGuides(); },
  onCoverError(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ guides: this.data.guides.map((guide) => guide.id === id ? { ...guide, cover: '' } : guide) });
    this.filterGuides();
  },
  filterGuides() {
    const keyword = this.data.keyword.trim().toLowerCase();
    this.setData({ results: this.data.guides.filter((guide) => [guide.title, guide.location, guide.description].some((value) => value.toLowerCase().includes(keyword))) });
  },
  openGuide(event) { wx.navigateTo({ url: `/pages/guidebook-detail/index?id=${event.currentTarget.dataset.id}` }); },
});
