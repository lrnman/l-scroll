Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pullText: {
      type: String,
      value: '下拉刷新',
    },
    releaseText: {
      type: String,
      value: '松手刷新',
    },
    loadingText: {
      type: String,
      value: '',
    },
    finishText: {
      type: String,
      value: '',
    },
    loadmoreText: {
      type: String,
      value: '加载中',
    },
    nomoreText: {
      type: String,
      value: '到底啦~',
    },
    pullDownHeight: {
      type: Number,
      value: 120,
    },
    refreshing: {
      type: Boolean,
      value: false,
      observer: '_onRefreshFinished',
    },
    nomore: {
      type: Boolean,
      value: false,
    },
    downTrigger: {
      type: Boolean,
      value: false,
      observer: '_triggerDown',
    },
    scrollTop: {
      type: Number,
      value: 0,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    /**
     * 0/1: 拉动中（未到阈值）
     * 2  ：拉动中，松开刷新
     * 3  ：松手，触发刷新
     * 4  ：加载结束
     */
    pullDownStatus: 0,
    // 上次上拉加载时组件的scrollTop值
    lastScrollEnd: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onScroll(e) {
      this.triggerEvent('scrolling', e.detail);

      const status = this.data.pullDownStatus;
      if (status === 3 || status === 4) return;

      const scrollTop = e.detail.scrollTop;
      const height = this.properties.pullDownHeight;
      let targetStatus;
      if (scrollTop < -1 * height) {
        targetStatus = 2;
      } else if (scrollTop < 0) {
        targetStatus = 1;
      } else {
        targetStatus = 0;
      }
      if (status != targetStatus) {
        this.setData({
          pullDownStatus: targetStatus,
        });
      }
    },

    _onTouchEnd(e, isTrigger) {
      const status = this.data.pullDownStatus;
      if (status === 2 || isTrigger == true) {
        this.setData({
          pullDownStatus: 3,
          //标记【正在加载】中。。
          refreshing: true,
          downTrigger: false,
        });

        //把刷新响应扔出去
        this.triggerEvent('refresh');
        wx.showLoading({
          mask: true,
          title: '',
        });
      }
    },

    //监控父组件传过来【加载结束】结束
    _onRefreshFinished(newVal, oldVal) {
      if (oldVal === true && newVal === false) {
        this.setData({
          nomore: false,
          lastScrollEnd: 0,
          pullDownStatus: 4,
        })
      }
    },

    _finishAnimateHandler(e) {
      this.setData({
        pullDownStatus: 0,
      });
      wx.hideLoading();
    },

    //每页内容总高度应大于组件的高度，否则在底部加载时会出现问题，
    //因此在当前页确定为最后一页时【如内容不足一页】就应该【将 nomore 设为 true】
    _onLoadmore() {
      if (!this.properties.nomore) {
        let query = wx.createSelectorQuery().in(this);
        query.select('.scroll-view').fields({
          size: true,
          scrollOffset: true,
        }, res => {
          if (Math.abs(res.scrollTop - this.data.lastScrollEnd) > res.height) {
            console.log('load more');
            this.setData({
              lastScrollEnd: res.scrollTop,
            });
            this.triggerEvent('loadmore');
          }
        }).exec();
      }
    },

    _triggerDown(newVal, oldVal) {
      if (newVal == false) return;
      const status = this.data.pullDownStatus;
      if (status == 0) {
        //未在刷新状态，触发刷新
        if (newVal == true) {
          this.setData({ scrollTop: 0 });
          this._onTouchEnd(null, true);
        }
      } else {
        //在刷新进程，还原标志
        this.setData({ downTrigger: false });
      }
    },
  },
})
