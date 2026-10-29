Component({
  data: {
    selected: 'pages/home/index',
    tabs: [
      { path: 'pages/home/index', label: '发现行程', icon: 'discover' },
      { path: 'pages/guidebooks/index', label: '岩场路书', icon: 'guide' },
      { path: 'pages/saved/index', label: '我的收藏', icon: 'saved' },
    ],
  },
  lifetimes: {
    attached() {
      this.updateSelection();
    },
  },
  pageLifetimes: {
    show() {
      this.updateSelection();
    },
  },
  methods: {
    updateSelection() {
      const pages = getCurrentPages();
      if (pages.length) this.setData({ selected: pages[pages.length - 1].route });
    },
    switchTab(event) {
      const { path } = event.currentTarget.dataset;
      wx.switchTab({ url: `/${path}` });
    },
  },
});
