import { requestCommunity, saveCommunityProfile } from '../../utils/community';
import { labelRecord, weeklyClimbingTotals } from '../../utils/climbing';
Page({
  data: { profile: null, records: [], chartWeeks: [], missingClimbingDates: false, activityCount: 0, topropeCount: 0, leadCount: 0, redpointCount: 0, loading: false, error: '', avatar: '', nickName: '', saving: false },
  onShow() {
    if (typeof this.getTabBar === 'function') this.getTabBar()?.setData({ selected: 'pages/climbing-profile/index' });
    this.load();
  },
  async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
  async load() {
    if (this.data.loading) return;
    this.setData({ loading: true, error: '' });
    try {
      const data = await requestCommunity('climbingRecords');
      const records = data.records.map(labelRecord);
      this.setData({ profile: data.profile, records, chartWeeks: weeklyClimbingTotals(records), missingClimbingDates: records.some((record) => !record.climbingDate), activityCount: new Set(records.map((record) => record.tripId)).size, topropeCount: records.filter((record) => record.style === 'toprope').length, leadCount: records.filter((record) => record.style === 'lead').length, redpointCount: new Set(records.filter((record) => record.style === 'lead' && ['onsight', 'flash', 'redpoint'].includes(record.result)).map((record) => record.routeKey)).size }, () => this.drawChart());
    } catch (error) { this.setData({ error: error.message }); }
    finally { this.setData({ loading: false }); }
  },
  drawChart() {
    wx.createSelectorQuery().in(this).select('#climbing-chart').fields({ node: true, size: true }).exec((entries) => {
      const item = entries?.[0];
      if (!item?.node || !item.width || !item.height) return;
      const { node: canvas, width, height } = item;
      const ratio = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      const context = canvas.getContext('2d');
      context.scale(ratio, ratio);
      const weeks = this.data.chartWeeks;
      if (!weeks.length) return;
      const left = 42, right = 38, top = 16, bottom = 35;
      const plotWidth = width - left - right, plotHeight = height - top - bottom;
      const step = Math.max(1, Math.ceil(weeks[weeks.length - 1].total / 4));
      const maximum = step * 4;
      const position = (index) => left + (weeks.length === 1 ? plotWidth / 2 : plotWidth * index / (weeks.length - 1));
      context.font = '11px sans-serif';
      context.fillStyle = '#899087';
      context.strokeStyle = '#e9ebe6';
      context.lineWidth = 1;
      for (let tick = 0; tick <= 4; tick += 1) {
        const y = top + plotHeight * (1 - tick / 4);
        context.beginPath(); context.moveTo(left, y); context.lineTo(width - right, y); context.stroke();
        context.textAlign = 'right'; context.fillText(String(step * tick), left - 7, y + 4);
      }
      const labelInterval = Math.max(1, Math.ceil((weeks.length - 1) / Math.max(1, Math.floor(plotWidth / 90))));
      weeks.forEach((week, index) => {
        if (index !== 0 && index !== weeks.length - 1 && (index % labelInterval !== 0 || weeks.length - 1 - index < labelInterval)) return;
        context.textAlign = 'center';
        context.fillText(week.label, position(index), height - 10);
      });
      for (const [field, color] of [['total', '#111111'], ['lead', '#dc5149'], ['toprope', '#3c80c8']]) {
        context.strokeStyle = color; context.fillStyle = color; context.lineWidth = 2; context.beginPath();
        weeks.forEach((week, index) => {
          const x = position(index), y = top + plotHeight * (1 - week[field] / maximum);
          if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
        });
        context.stroke();
        weeks.forEach((week, index) => {
          const x = position(index), y = top + plotHeight * (1 - week[field] / maximum);
          context.beginPath(); context.arc(x, y, 2.5, 0, Math.PI * 2); context.fill();
        });
      }
    });
  },
  chooseAvatar(event) { if (event.detail.avatarUrl) this.setData({ avatar: event.detail.avatarUrl }); },
  inputName(event) { this.setData({ nickName: event.detail.value }); },
  async saveProfile() {
    if (this.data.saving) return;
    this.setData({ saving: true });
    try { await saveCommunityProfile({ nickName: this.data.nickName, avatar: this.data.avatar }); await this.load(); }
    catch (error) { wx.showToast({ title: error.message, icon: 'none' }); }
    finally { this.setData({ saving: false }); }
  },
  openReview() { wx.navigateTo({ url: '/pages/climbing-review/index' }); },
});
