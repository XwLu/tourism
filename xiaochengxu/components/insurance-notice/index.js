Component({
  data: { qrCode: '/static/insurance/outdoor-insurance.png' },
  methods: {
    previewQrCode() {
      wx.previewImage({ current: this.data.qrCode, urls: [this.data.qrCode] });
    },
  },
});
