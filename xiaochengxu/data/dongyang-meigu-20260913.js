const trip = {
  id: 'dongyang-meigu-20260913',
  title: '东阳梅谷野攀',
  subtitle: '从余杭天空之城自驾出发，在梅谷攀爬到傍晚后返程。',
  destination: '金华 · 东阳梅谷',
  dates: '2026.09.13',
  duration: '1 天 · 当日往返',
  cover: 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/dongyang-meigu.jpg',
  coverTitle: ['东阳 · 梅谷', '野攀一日'],
  coverHeight: 430,
  shortDates: '09.13',
  tags: ['野攀', '自驾', '已结束'],
  categories: ['climbing'],
};

const days = [
  {
    id: '09-13',
    hasOutdoorClimbing: true,
    day: 1,
    date: '9 月 13 日',
    shortDate: '09.13',
    weekday: '周日',
    city: '东阳 · 梅谷',
    title: '梅谷野攀，傍晚自驾返程',
    coverTitle: ['梅谷野攀', '当日往返'],
    cover: trip.cover,
    coverHeight: 430,
    theme: 'cliff',
    categories: ['climbing'],
    tags: ['自驾往返', '自备午餐'],
    summary: '09:00 从余杭天空之城自驾出发，12:00 到达东阳梅谷，自备干粮解决午饭；攀爬至 17:30 结束，整理装备后自驾返程。',
    route: '余杭天空之城 → 东阳梅谷 → 自驾返程',
    transport: '自驾 · 09:00 从余杭天空之城出发，攀爬结束后返程',
    stay: '当日往返 · 不住宿',
    note: '这是 2026 年 9 月 13 日的历史行程。午饭自备干粮；户外保险第二天生效，请至少提前一天购买，本次请于 9 月 12 日或之前购买。',
    stops: [
      { time: '09:00', name: '余杭天空之城出发', kind: 'transport', detail: '自驾前往东阳梅谷。' },
      { time: '12:00', name: '到达东阳梅谷', kind: 'sight', detail: '到达岩场，准备攀爬装备。' },
      { time: '中午', name: '岩场午餐', kind: 'meal', detail: '自备干粮解决午饭。' },
      { time: '至 17:30', name: '梅谷野攀', kind: 'sight', detail: '攀爬至 17:30 结束，之后整理装备。' },
      { time: '17:30 后', name: '自驾返程', kind: 'transport', detail: '结束攀爬并整理装备后自驾返程，当日不安排住宿。' },
    ],
  },
];

export { trip, days };
