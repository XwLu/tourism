const trip = {
  id: 'linan-shiziyan-20261018',
  title: '临安狮子岩野攀',
  subtitle: '半小时上山，在 Lower40 先锋与顶绳攀爬，傍晚到盛世人家用餐后自驾返程。',
  destination: '杭州 · 临安狮子岩',
  dates: '2026.10.18',
  duration: '1 天 · 当日往返',
  cover: 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/linan-shiziyan.jpg',
  coverTitle: ['临安 · 狮子岩', 'Lower40 野攀'],
  coverHeight: 430,
  shortDates: '10.18',
  tags: ['Lower40', '先锋 & 顶绳'],
  categories: ['climbing'],
};

const days = [
  {
    id: '10-18',
    hasOutdoorClimbing: true,
    day: 1,
    date: '10 月 18 日',
    shortDate: '10.18',
    weekday: '周日',
    city: '临安 · 高虹镇',
    title: '狮子岩 Lower40，攀到傍晚',
    coverTitle: ['半小时上山', '一下午攀岩'],
    cover: 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/linan-shiziyan.jpg',
    coverHeight: 430,
    theme: 'cliff',
    categories: ['climbing'],
    tags: ['自驾往返', '先锋 & 顶绳', '盛世人家'],
    summary:
      '12:30 自驾到达龙上村，爬山半小时后抵达狮子岩 Lower40。13:00–17:00 先锋与顶绳攀爬，17:30 出发前往盛世人家用餐，人均参考 ¥73，18:30 自驾返程。',
    route: '龙上村 → 狮子岩 Lower40 → 盛世人家 → 自驾返程',
    transport: '自驾 · 12:30 抵达杭州临安高虹镇龙上村，18:30 自驾返程；上山徒步约半小时',
    stay: '当日往返 · 不住宿',
    note: '狮子岩又称狮头岩，Lower40 与岩场共用公开地图标点；龙上村和岩场标点仅作位置参考，具体停车位及上山入口以现场确认为准，地图虚线不是上山步道。盛世人家按提供的高德定位标记，人均 ¥73 仅供参考。户外保险第二天生效，请至少提前一天购买，本次请于 10 月 17 日或之前购买。',
    stops: [
      {
        time: '12:30',
        name: '自驾抵达龙上村',
        kind: 'transport',
        detail: '到达杭州临安高虹镇龙上村，停车后准备上山；地图标记龙上村，具体停车位置以现场确认为准。',
        coordinates: [30.376332, 119.648001],
      },
      {
        time: '12:30–13:00',
        name: '徒步前往狮子岩 Lower40',
        kind: 'sight',
        detail: '爬山约半小时，13:00 到达狮子岩 Lower40 区域；岩场也叫狮头岩，上山入口以现场确认为准。',
      },
      {
        time: '13:00–17:00',
        name: '狮子岩 Lower40 · 先锋 & 顶绳',
        kind: 'sight',
        detail: '在 Lower40 区域进行先锋与顶绳攀爬，17:00 结束；地图采用“杭州临安狮头岩攀岩场”的公开标点。',
        coordinates: [30.376933, 119.647987],
      },
      {
        time: '17:00',
        name: '收绳、整理装备并下山',
        kind: 'sight',
        detail: '结束攀爬后收拾装备，衔接 17:30 前往农家乐的安排；具体下山用时以现场为准。',
      },
      {
        time: '17:30',
        name: '出发前往盛世人家',
        kind: 'meal',
        detail:
          '盛世人家，中餐，人均参考 ¥73；地址：大鱼线与石门村绿道交叉口东 380 米。按提供的高德地图定位前往，实际消费以门店为准。',
        coordinates: [30.369128, 119.667236],
      },
      {
        time: '18:30',
        name: '自驾返程',
        kind: 'transport',
        detail: '从盛世人家出发，自驾返程，当天不安排住宿。',
      },
    ],
  },
];

export { trip, days };
