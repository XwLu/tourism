Component({
  properties: { trip: Object },
  methods: {
    openItinerary() {
      wx.navigateTo({ url: `/pages/itinerary/index?id=${this.data.trip.id}` });
    },
    toggleFavorite() {
      this.triggerEvent('favorite', { id: this.data.trip.id });
    },
  },
});
