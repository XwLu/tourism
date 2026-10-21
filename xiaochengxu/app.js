App({
  onLaunch() {
    if (wx.cloud && wx.cloud.callContainer) wx.cloud.init();
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '发现新行程',
        content: '新版本已经准备好，是否重新打开？',
        success(result) {
          if (result.confirm) updateManager.applyUpdate();
        },
      });
    });
  },
});
