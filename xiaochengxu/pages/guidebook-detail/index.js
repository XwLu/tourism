import { fetchGuidebooks, fetchGuidebookPage } from '../../utils/guidebooks';

Page({
  data: { guide: null, section: null, page: 1, pageBase: 1, pageOptions: [], image: '', loading: false, error: '' },
  onLoad(options) { this.guideId = options.id; this.loadGuide(); },
  onUnload() { this.disposed = true; this.clearImage(this.data.image); },
  async onPullDownRefresh() { await this.loadGuide(); wx.stopPullDownRefresh(); },
  async loadGuide() {
    const sequence = (this.sequence || 0) + 1;
    this.sequence = sequence;
    this.setData({ loading: true, error: '' });
    try {
      const guides = await fetchGuidebooks();
      const guide = guides.find((item) => item.id === this.guideId);
      if (!guide) throw new Error('未找到该路书');
      if (this.disposed || sequence !== this.sequence) return;
      const section = guide.sections.find((item) => item.id === this.data.section?.id) || guide.sections[0];
      const pageBase = this.getPageBase(section);
      const page = this.data.section && this.data.page >= pageBase && this.data.page <= section.endPage ? this.data.page : pageBase;
      this.setData({ guide, section, page, pageBase, pageOptions: this.getPageOptions(section, pageBase) });
      wx.setNavigationBarTitle({ title: guide.title });
      await this.loadPage(this.data.page);
    } catch (error) {
      if (!this.disposed && sequence === this.sequence) this.setData({ loading: false, error: error.message });
    }
  },
  getPageBase(section) { return section.intro && section.id !== 'intro' ? section.startPage - 1 : section.startPage; },
  getPageOptions(section, pageBase) { return Array.from({ length: section.endPage - pageBase + 1 }, (_, index) => index === 0 && pageBase < section.startPage ? '区域介绍' : `第 ${index + 1} 页`); },
  selectSection(event) {
    const section = this.data.guide.sections.find((item) => item.id === event.currentTarget.dataset.id);
    if (!section || section.id === this.data.section.id) return;
    const pageBase = this.getPageBase(section);
    this.setData({ section, pageBase, pageOptions: this.getPageOptions(section, pageBase) });
    this.loadPage(pageBase);
  },
  async loadPage(page) {
    const sequence = (this.sequence || 0) + 1;
    this.sequence = sequence;
    this.setData({ page, loading: true, error: '' });
    if (page < this.data.section.startPage) {
      this.clearImage(this.data.image);
      this.setData({ image: '', loading: false });
      return;
    }
    try {
      const image = await fetchGuidebookPage(this.data.guide, page);
      if (this.disposed || sequence !== this.sequence) { this.clearImage(image); return; }
      const previous = this.data.image;
      this.setData({ image, loading: false });
      if (previous !== image) this.clearImage(previous);
    } catch (error) {
      if (!this.disposed && sequence === this.sequence) {
        this.clearImage(this.data.image);
        this.setData({ loading: false, image: '', error: error.message });
      }
    }
  },
  clearImage(path) { if (path) wx.getFileSystemManager().unlink({ filePath: path, fail() {} }); },
  previousPage() { if (!this.data.loading && this.data.page > this.data.pageBase) this.loadPage(this.data.page - 1); },
  nextPage() { if (!this.data.loading && this.data.page < this.data.section.endPage) this.loadPage(this.data.page + 1); },
  selectPage(event) { if (!this.data.loading) this.loadPage(Number(event.detail.value) + this.data.pageBase); },
  retry() { this.loadGuide(); },
  preview() { if (this.data.image && !this.data.loading) wx.previewImage({ current: this.data.image, urls: [this.data.image] }); },
});
