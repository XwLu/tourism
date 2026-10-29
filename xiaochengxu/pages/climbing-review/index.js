import { requestCommunity, formatCommentTime } from '../../utils/community';
import { labelRecord, results } from '../../utils/climbing';

Page({
  data: { records: [], guides: [], guideSearch: '', guideMatches: [], routes: [], routeSearch: '', routeMatches: [], activeMenu: '', guideIndex: -1, routeIndex: -1, routeRecords: [], routeNotes: [], routeStats: null, loading: true, error: '', scrollHeight: 600, scrollTarget: '' },
  onLoad() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.windowHeight = windowInfo.windowHeight || 600;
    this.setData({ scrollHeight: this.windowHeight });
    this.load();
  },
  onHide() { this.closeMenus(); },
  onUnload() { this.disposed = true; clearTimeout(this.menuTimer); clearTimeout(this.scrollTimer); },
  async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
  async load() {
    if (this.requesting) return;
    this.requesting = true;
    this.setData({ loading: true, error: '' });
    try {
      const data = await requestCommunity('climbingRecords');
      if (this.disposed) return;
      const records = data.records.map((record) => ({ ...labelRecord(record), timeLabel: `${new Date(Number(record.createdAt)).getFullYear()} 年 ${formatCommentTime(Number(record.createdAt))}` }));
      const guides = [...new Map(records.map((item) => [item.guideId, { id: item.guideId, title: item.guideTitle }])).values()];
      this.setData({ records, guides, guideMatches: guides, guideSearch: '', guideIndex: -1, routes: [], routeSearch: '', routeMatches: [], routeIndex: -1, routeStats: null, routeRecords: [], routeNotes: [], activeMenu: '' });
    } catch (error) { if (!this.disposed) this.setData({ error: error.message }); }
    finally { this.requesting = false; if (!this.disposed) this.setData({ loading: false }); }
  },
  keepMenuOpen() {},
  closeMenus() {
    clearTimeout(this.menuTimer);
    if (this.data.activeMenu) this.setData({ activeMenu: '' });
  },
  closeMenuAfterBlur() {
    clearTimeout(this.menuTimer);
    this.menuTimer = setTimeout(() => { if (!this.disposed) this.setData({ activeMenu: '' }); }, 200);
  },
  revealActiveField() {
    const target = this.data.activeMenu === 'guide' ? 'guide-select' : this.data.activeMenu === 'route' ? 'route-select' : '';
    if (!target) return;
    clearTimeout(this.scrollTimer);
    this.setData({ scrollTarget: '' }, () => {
      this.scrollTimer = setTimeout(() => { if (!this.disposed && this.data.activeMenu) this.setData({ scrollTarget: target }); }, 50);
    });
  },
  onKeyboardHeightChange(event) {
    const keyboardHeight = Math.max(0, Number(event.detail.height) || 0);
    this.keyboardHeight = keyboardHeight;
    this.setData({ scrollHeight: Math.max(160, this.windowHeight - keyboardHeight) }, () => { if (keyboardHeight) this.revealActiveField(); });
  },
  focusGuide() { clearTimeout(this.menuTimer); this.setData({ activeMenu: 'guide', guideMatches: this.data.guides }, () => { if (this.keyboardHeight) this.revealActiveField(); }); },
  focusRoute() { clearTimeout(this.menuTimer); this.setData({ activeMenu: 'route', routeMatches: this.data.routes }, () => { if (this.keyboardHeight) this.revealActiveField(); }); },
  searchGuides(event) {
    const guideSearch = event.detail.value;
    this.setData({ guideSearch, guideMatches: this.data.guides.filter((item) => item.title.toLowerCase().includes(guideSearch.trim().toLowerCase())), activeMenu: 'guide', guideIndex: -1, routeIndex: -1, routes: [], routeSearch: '', routeMatches: [], routeStats: null, routeRecords: [], routeNotes: [] });
  },
  chooseGuide(event) {
    const selected = this.data.guideMatches[Number(event.currentTarget.dataset.index)];
    if (!selected) return;
    clearTimeout(this.menuTimer);
    const guideIndex = this.data.guides.findIndex((item) => item.id === selected.id);
    const routes = [...new Map(this.data.records.filter((item) => item.guideId === selected.id).map((item) => [item.routeKey, { id: item.routeKey, title: item.routeName }])).values()];
    this.setData({ guideIndex, guideSearch: selected.title, guideMatches: [], activeMenu: '', routes, routeIndex: -1, routeSearch: '', routeMatches: routes, routeRecords: [], routeNotes: [], routeStats: null });
    wx.hideKeyboard();
  },
  searchRoutes(event) {
    const routeSearch = event.detail.value;
    this.setData({ routeSearch, activeMenu: 'route', routeIndex: -1, routeStats: null, routeRecords: [], routeNotes: [], routeMatches: this.data.routes.filter((item) => item.title.toLowerCase().includes(routeSearch.trim().toLowerCase())) });
  },
  chooseRoute(event) {
    const route = this.data.routeMatches[Number(event.currentTarget.dataset.index)];
    if (!route) return;
    clearTimeout(this.menuTimer);
    this.setData({ routeIndex: this.data.routes.findIndex((item) => item.id === route.id), routeSearch: route.title, routeMatches: [], activeMenu: '', routeStats: null, routeRecords: [], routeNotes: [] });
    wx.hideKeyboard();
  },
  query() {
    if (this.data.guideIndex < 0 || this.data.routeIndex < 0) { wx.showToast({ title: '请选择岩场和路线', icon: 'none' }); return; }
    this.closeMenus();
    wx.hideKeyboard();
    const route = this.data.routes[this.data.routeIndex];
    const routeRecords = this.data.records.filter((item) => item.routeKey === route.id);
    const best = results.find((result) => routeRecords.some((record) => record.result === result.id));
    this.setData({ routeRecords, routeNotes: routeRecords.filter((item) => typeof item.note === 'string' && item.note.trim()), routeStats: { toprope: routeRecords.filter((item) => item.style === 'toprope').length, lead: routeRecords.filter((item) => item.style === 'lead').length, best: best?.label || '暂无' } });
  },
});
