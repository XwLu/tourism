const trip = {
  id: 'xinchang-baizhangyan-20261031',
  title: '新昌百丈岩野攀',
  subtitle: '10 月 31 日晚从杭州余杭自驾出发，落脚新昌县城；11 月 1 日到百丈岩，一整天泡在两片岩壁上。',
  destination: '绍兴 · 新昌百丈岩',
  dates: '2026.10.31 — 11.01',
  duration: '2 天 1 晚',
  cover: 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/xinchang-baizhangyan.jpg',
  coverTitle: ['新昌 · 百丈岩', '两片岩壁'],
  coverHeight: 430,
  shortDates: '10.31 — 11.01',
  tags: ['百丈岩', '运动攀', '自驾'],
  categories: ['climbing'],
  hotel: '汉庭酒店（新昌大佛寺店）',
  hotelDetail: '10 月 31 日晚入住，11 月 1 日退房 · 鼓山中路 128 号',
};

const days = [
  {
    id: '10-31',
    day: 1,
    date: '10 月 31 日',
    shortDate: '10.31',
    weekday: '周六',
    city: '杭州 → 新昌',
    title: '余杭出发，夜里落脚新昌',
    coverTitle: ['余杭出发', '新昌歇脚'],
    cover: 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/xinchang-baizhangyan.jpg',
    coverHeight: 430,
    theme: 'night',
    categories: ['transit'],
    tags: ['自驾', '余杭出发', '住县城'],
    summary:
      '晚上从杭州余杭云汇城自驾出发，约 150 公里、2 小时到达新昌，22:00 入住汉庭（新昌大佛寺店）。当晚不安排其他活动，早点休息，第二天要上岩壁。',
    route: '杭州余杭云汇城 → 汉庭酒店（新昌大佛寺店）',
    transport: '自驾 · 余杭云汇城出发，约 150 公里、2 小时车程；酒店有免费停车场和充电桩',
    stay: trip.hotel,
    note: '云汇城就在地铁 5 号线五常站上盖（A 口直达），从小区车库直接上高架更省事。22:00 入住偏晚，建议提前和前台确认保留房间；当晚把车停酒店，第二天再开去岩场。酒店地址鼓山中路 128 号，紧邻新昌县人民医院，距大佛寺约 1.2 公里。',
    stops: [
      {
        time: '19:30',
        name: '杭州余杭 · 云汇城',
        kind: 'transport',
        detail:
          '从云汇城出发，自驾前往新昌。云汇城是地铁 5 号线五常站上盖项目，标点按五常站 A 口（通未来@天空中心、云汇城）位置示意，具体出发门岗以实际为准。',
        coordinates: [30.298778, 120.040269],
        locationNote: '按五常站 A 口（云汇城上盖）标注，具体车库出口以现场为准。',
      },
      {
        time: '22:00',
        name: '汉庭酒店（新昌大佛寺店）',
        kind: 'hotel',
        detail:
          '鼓山中路 128 号办理入住，当晚不再安排行程。酒店位置按鼓山中路与人民医院片区标注，属示意位置，具体入口和停车入口请以导航为准。',
        coordinates: [29.504688, 120.892412],
        locationNote: '按鼓山中路 128 号（紧邻新昌县人民医院）标注，具体入口以导航为准。',
      },
    ],
  },
  {
    id: '11-01',
    hasOutdoorClimbing: true,
    day: 2,
    date: '11 月 1 日',
    shortDate: '11.01',
    weekday: '周日',
    city: '新昌 · 百丈岩',
    title: '百丈岩，两片岩壁爬一天',
    coverTitle: ['神雕崖', '望雕崖'],
    cover: 'https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/xinchang-baizhangyan.jpg',
    coverHeight: 430,
    theme: 'cliff',
    categories: ['climbing'],
    tags: ['运动攀', '自驾', '神雕崖 & 望雕崖'],
    summary:
      '早上从酒店自驾约 15 分钟到百丈岩景区停车场，沿台阶和步道上行几分钟即到岩壁。神雕崖线路最多、日照充足；望雕崖白天有部分阴影，午后更舒服。',
    route: '汉庭酒店 → 百丈岩景区停车场 → 神雕崖 → 望雕崖 → 返程',
    transport: '自驾 · 酒店到百丈岩直线约 4 公里、车程约 15 分钟；景区入口有商业停车场，收费不高，装有监控',
    stay: '当日返程 · 不安排住宿',
    note:
      '百丈岩两条岩壁共 71 条运动攀线路，难度约 5.7–5.12c。停车场有卫生间和分类垃圾桶，但不提供餐饮，建议自带水和补给；离开时把垃圾带走。台阶后的岔路走法：沿步道走约 5 分钟可见右侧上小岩壁的岔路；继续直行到左侧废弃房屋，过桥左转再走约 50 米即到社区搭建的平台。户外保险第二天生效，请至少提前一天购买，本次请于 10 月 31 日或之前购买。停放和上山入口以现场确认为准。',
    stops: [
      {
        time: '08:30',
        name: '汉庭酒店退房出发',
        kind: 'transport',
        detail: '退房后自驾前往百丈岩景区，行李随车携带；出发前确认当天天气和岩壁干湿情况。',
        coordinates: [29.504688, 120.892412],
      },
      {
        time: '09:00',
        name: '百丈岩景区停车场',
        kind: 'transport',
        detail:
          '景区入口的商业停车场，收费不高且有监控摄像头，旁边有卫生间（建议自备纸巾）。停车后沿台阶和短坡进入步道。',
        coordinates: [29.474869, 120.869903],
      },
      {
        time: '09:15',
        name: '步行上岩壁',
        kind: 'sight',
        detail:
          '沿步道走约 5 分钟，右侧有岔路上小岩壁；继续直行至左侧废弃房屋，过桥左转约 50 米到社区修建的平台。',
      },
      {
        time: '09:30–12:00',
        name: '神雕崖 · 运动攀',
        kind: 'sight',
        detail:
          '百丈岩较大的那片岩壁，线路集中、大部分时间在阳光下，经典线路如「夹缝求生」5.10a、「暴风机」5.10c、「风起云涌」5.11b。',
        coordinates: [29.475256, 120.872936],
      },
      {
        time: '12:00',
        name: '岩场午餐',
        kind: 'meal',
        detail: '岩场附近没有成熟餐饮，建议自带干粮和饮水；也可下山到县城用餐，往返约 30 分钟。',
      },
      {
        time: '13:00–16:30',
        name: '望雕崖 · 运动攀',
        kind: 'sight',
        detail:
          '与神雕崖相邻的第二片岩壁，白天有部分区域处于阴影中，午后体感更舒适。收绳前确认装备清点完毕。',
        coordinates: [29.47471, 120.87299],
      },
      {
        time: '16:30',
        name: '收绳、整理装备下山',
        kind: 'sight',
        detail: '清点装备和垃圾，沿步道原路返回停车场，具体下山用时以现场为准。',
      },
      {
        time: '17:00',
        name: '自驾返程',
        kind: 'transport',
        detail: '从百丈岩景区停车场出发返回杭州，当日不安排住宿。',
      },
    ],
  },
];

export { trip, days };
