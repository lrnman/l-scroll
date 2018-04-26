Page({

  data: {
    colors: [],
    scrollTop: 0,
  },

  _randomColor: function () {
    return `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${(Math.random() * 0.3 + 0.2).toFixed(1)})`;
  },

  _generateColors: function (length) {
    return new Array(length).fill(null).map(() => this._randomColor());
  },

  //下拉刷新监听函数
  _onPullDownRefresh: function () {
    this._onLoadmore(() => [], () => this.setData({ refreshing: false }));
  },

  //加载更多监听函数
  _onLoadmore: function (cb, cb2) {
    setTimeout(() => {
      const colors = this._generateColors(20);
      var old = this.data.colors;
      cb instanceof Function && cb() && (old = []);
      this.setData({ colors: [...old, ...colors] });
      cb2 instanceof Function && cb2();
      if (this.data.colors.length >= 50) {
        this.setData({ nomore: true })
      }
    }, 500);
  },

  _onScroll: function (e) {
    console.log(e.detail);
  },

  onLoad: function (options) {
    const colors = this._generateColors(20);
    setTimeout(() => {
      this.setData({
        colors,
        // downTrigger: true
      })
      setTimeout(() => this.setData({
        scrollTop: 1
      }), 1);
    }, 1000);
  },

  _doTap: function () {
    console.log('----tap');
    this.setData({ downTrigger: true });
    // this.setData({ scrollTop: this.data.scrollTop + 100 });
  }
})
