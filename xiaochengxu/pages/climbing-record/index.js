import { fetchGuidebooks } from '../../utils/guidebooks';
import { requestCommunity } from '../../utils/community';
import { grades, styles, results } from '../../utils/climbing';

Page({
  data: { guides: [], guideQuery: '', guideMatches: [], routes: [], matches: [], routeQuery: '', activeMenu: '', manual: false, routesLoading: false, routesError: '', guideIndex: -1, gradeIndex: -1, styleIndex: -1, resultIndex: -1, grades, styles, results, routeName: '', note: '', loading: true, saving: false, error: '' },
  onLoad(options) { this.tripId = options.tripId; this.dayId = options.dayId; this.loadGuides(); },
  onHide() { this.closeMenus(); },
  onUnload() { this.disposed = true; this.routesSequence = (this.routesSequence || 0) + 1; },
  async loadGuides() {
    this.setData({ loading: true, error: '' });
    try { const guides = await fetchGuidebooks(); this.setData({ guides, guideMatches: guides }); }
    catch (error) { this.setData({ error: error.message }); }
    finally { this.setData({ loading: false }); }
  },
  keepMenuOpen() {},
  closeMenus() {
    if (this.data.activeMenu) this.setData({ activeMenu: '' });
  },
  focusGuide() {
    this.setData({ activeMenu: 'guide', guideMatches: this.data.guides });
  },
  inputGuide(event) {
    const guideQuery = event.detail.value;
    this.routesSequence = (this.routesSequence || 0) + 1;
    this.setData({ guideQuery, guideMatches: this.data.guides.filter((guide) => guide.title.toLowerCase().includes(guideQuery.trim().toLowerCase())), activeMenu: 'guide', guideIndex: -1, routes: [], matches: [], routeQuery: '', routeName: '', gradeIndex: -1, manual: false, routesLoading: false, routesError: '' });
  },
  async chooseGuide(event) {
    const guide = this.data.guideMatches[Number(event.currentTarget.dataset.index)];
    if (!guide) return;
    const guideIndex = this.data.guides.findIndex((item) => item.id === guide.id);
    this.setData({ guideIndex, guideQuery: guide.title, activeMenu: '', routes: [], matches: [], routeQuery: '', routeName: '', gradeIndex: -1, manual: false });
    await this.loadRoutes(guide.id);
  },
  async loadRoutes(guideId) {
    const sequence = (this.routesSequence || 0) + 1;
    this.routesSequence = sequence;
    this.setData({ routesLoading: true, routesError: '' });
    try {
      const result = await requestCommunity('climbingRoutes', { guideId });
      if (!this.disposed && sequence === this.routesSequence) this.setData({ routes: result.routes, matches: result.routes, routesLoading: false });
    } catch (error) {
      if (!this.disposed && sequence === this.routesSequence) this.setData({ routesLoading: false, routesError: error.message });
    }
  },
  retryRoutes() { if (this.data.guideIndex >= 0) this.loadRoutes(this.data.guides[this.data.guideIndex].id); },
  chooseGrade(event) { this.setData({ gradeIndex: Number(event.detail.value) }); },
  chooseStyle(event) { this.setData({ styleIndex: Number(event.detail.value) }); },
  chooseResult(event) { this.setData({ resultIndex: Number(event.detail.value) }); },
  focusRoute() {
    this.setData({ activeMenu: 'route', matches: this.data.routes });
  },
  inputRoute(event) {
    const routeQuery = event.detail.value;
    this.setData({ routeQuery, routeName: '', gradeIndex: -1, manual: false, activeMenu: 'route', matches: this.data.routes.filter((item) => item.routeName.toLowerCase().includes(routeQuery.trim().toLowerCase())) });
  },
  selectRoute(event) {
    const route = this.data.matches[Number(event.currentTarget.dataset.index)];
    if (route) {
      this.setData({ routeName: route.routeName, routeQuery: route.routeName, matches: [], activeMenu: '', manual: false, gradeIndex: grades.indexOf(route.grade) });
    }
  },
  useManual() {
    if (!this.data.routesLoading && !this.data.routesError) {
      this.setData({ manual: true, routeName: this.data.routeQuery.trim(), matches: [], activeMenu: '' });
    }
  },
  inputNote(event) { this.setData({ note: event.detail.value }); },
  async submit() {
    const { guideIndex, gradeIndex, styleIndex, resultIndex, guides, routeName, note } = this.data;
    if ([guideIndex, gradeIndex, styleIndex, resultIndex].some((index) => index < 0) || !routeName.trim()) { wx.showToast({ title: '请填写所有必选项', icon: 'none' }); return; }
    if (this.data.saving) return;
    const payload = { tripId: this.tripId, dayId: this.dayId, guideId: guides[guideIndex].id, routeName: routeName.trim(), grade: grades[gradeIndex], style: styles[styleIndex].id, result: results[resultIndex].id, note };
    const signature = JSON.stringify(payload);
    if (!this.requestId || this.requestSignature !== signature) {
      this.requestId = `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 32).padEnd(32, '0');
      this.requestSignature = signature;
    }
    this.setData({ saving: true });
    try {
      await requestCommunity('addClimbingRecord', { ...payload, requestId: this.requestId });
      wx.showToast({ title: '记录已保存', icon: 'success' });
      wx.navigateBack();
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }); }
    finally { this.setData({ saving: false }); }
  },
});
