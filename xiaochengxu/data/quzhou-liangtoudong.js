const trip = {
  id: 'quzhou-liangtoudong-20260802',
  title: '衢州两头洞野攀',
  subtitle: '从余杭天空之城自驾出发，在两头洞攀爬到傍晚，晚餐后返程。',
  destination: '衢州 · 两头洞',
  dates: '2026.08.02',
  duration: '1 天 · 当日往返',
  cover: 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/quzhou-liangtoudong.jpg',
  coverTitle: ['衢州 · 两头洞', '野攀一日'],
  coverHeight: 430,
  shortDates: '08.02',
  tags: ['野攀', '自驾', '已结束'],
  categories: ['climbing'],
};

const days = [
  {
    id: '08-02',
    hasOutdoorClimbing: true,
    day: 1,
    date: '8 月 2 日',
    shortDate: '08.02',
    weekday: '周日',
    city: '衢州 · 两头洞',
    title: '两头洞野攀，傍晚到上方镇吃饭',
    coverTitle: ['两头洞野攀', '上方镇晚餐'],
    cover: 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/quzhou-liangtoudong.jpg',
    coverHeight: 430,
    theme: 'cliff',
    categories: ['climbing'],
    tags: ['自驾往返', '自备午餐', '海燕酒楼'],
    summary: '07:00 从余杭天空之城自驾出发，11:00 到达两头洞岩场，自备干粮解决午饭；攀爬至 17:30，前往衢州上方镇海燕酒楼吃晚饭，19:00 自驾返程。',
    route: '余杭天空之城 → 两头洞岩场 → 上方镇海燕酒楼 → 自驾返程',
    transport: '自驾 · 07:00 从余杭天空之城出发，19:00 返程',
    stay: '当日往返 · 不住宿',
    note: '这是 2026 年 8 月 2 日的历史行程。午饭自备干粮；户外保险第二天生效，请至少提前一天购买，本次请于 8 月 1 日或之前购买。',
    stops: [
      { time: '07:00', name: '余杭天空之城出发', kind: 'transport', detail: '自驾前往两头洞岩场。' },
      { time: '11:00', name: '到达两头洞岩场', kind: 'sight', detail: '到达岩场，准备装备并开始野攀。' },
      { time: '中午', name: '岩场午餐', kind: 'meal', detail: '自备干粮解决午饭。' },
      { time: '至 17:30', name: '两头洞野攀', kind: 'sight', detail: '攀爬至 17:30 结束，之后整理装备。' },
      { time: '17:30 后', name: '上方镇海燕酒楼晚餐', kind: 'meal', detail: '前往衢州上方镇海燕酒楼吃晚饭。' },
      { time: '19:00', name: '自驾返程', kind: 'transport', detail: '晚餐后自驾返程，当日不安排住宿。' },
    ],
  },
];

export { trip, days };
