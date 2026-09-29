const places = {
  airport: { name: "大连周水子国际机场", kind: "transport", latlng: [38.965, 121.539] },
  hotel: { name: "全季大连高新万达广场酒店", kind: "hotel", latlng: [38.872, 121.530] },
  station: { name: "大连站", kind: "transport", latlng: [38.924, 121.630] },
  dandongStation: { name: "丹东站", kind: "transport", latlng: [40.129, 124.381], locationNote: "丹东市区道路示意点；出发前以车站导航和当天进站口为准。" },
  zhenghuangqi: { name: "正黄旗海鲜·延安路总店", kind: "meal", latlng: [38.916, 121.639], locationNote: "按延安路总店道路点标记；出发前核对具体店面入口和国庆营业时间。" },
  xinchangxing: { name: "新长兴农副产品批发市场", kind: "meal", latlng: [38.9206, 121.595], locationNote: "按沙河口区鞍山路片区标记；市场内海鲜摊位和加工档口以当天现场为准。" },
  aoshen: { name: "澳深鱼市", kind: "meal", latlng: [38.909, 121.695], approximate: true, locationNote: "按海之韵北门/东港方向片区示意；具体门店地址出发前核对。" },
  weierweier: { name: "威尔威尔·星海广场店", kind: "meal", latlng: [38.884, 121.580], approximate: true, locationNote: "按星海广场片区示意；具体店面入口和营业时间出发前核对。" },
  yaluBridge: { name: "鸭绿江断桥/江边", kind: "sight", latlng: [40.128, 124.389], locationNote: "丹东江边市区示意点；以鸭绿江断桥景区入口和当天导航为准。" },
  andongOldStreet: { name: "安东老街", kind: "sight", latlng: [40.120, 124.386], locationNote: "丹东市区道路示意点；出发前以当天导航和现场入口为准。" },
  yanwo: { name: "燕窝岭（滨海中路集合点）", kind: "sight", latlng: [38.863735, 121.650562], locationNote: "按滨海中路道路点标记；野攀具体岩壁和集合位置以组织方通知为准。" },
  xiding: { name: "喜鼎海胆水饺·星海广场店", kind: "meal", latlng: [38.8794, 121.5790] },
  sakura: { name: "樱木千鹤日料", kind: "meal", latlng: [38.881, 121.585], approximate: true },
  xinghai: { name: "星海广场", kind: "sight", latlng: [38.886, 121.580] },
  fujiazhuang: { name: "付家庄（滨海西路入口）", kind: "sight", latlng: [38.865574, 121.619753], locationNote: "标记在滨海西路入口；沙滩沿道路南侧展开。" },
  yinshatan: { name: "银沙滩（滨海西路入口）", kind: "sight", latlng: [38.868761, 121.609797], locationNote: "标记在滨海西路入口；浴场下行入口以现场指引为准。" },
  bridge: { name: "跨海大桥观景点（金沙滩附近）", kind: "sight", latlng: [38.873233, 121.602442], locationNote: "标记在金沙滩附近的滨海西路陆地观景区域，不把桥上或海面当作景点位置。" },
  haizhiyunSouth: { name: "海之韵公园西南门（滨海北路）", kind: "sight", latlng: [38.892768, 121.701791], locationNote: "按滨海北路西南门道路点标记。" },
  haizhiyunNorth: { name: "海之韵公园北门（港隆路）", kind: "sight", latlng: [38.910121, 121.711151], locationNote: "按港隆路北侧入口道路点标记。" },
  nanshan: { name: "南山路", kind: "sight", latlng: [38.909, 121.649] },
  guangfeng: { name: "光风街", kind: "sight", latlng: [38.904, 121.636] },
  yuanyi: { name: "元气攀岩 Energy Climbing Gym", kind: "sight", latlng: [38.836, 121.365], approximate: true, locationNote: "高新园区七贤里文化创意产业园2号楼；出发前核对具体入口和营业时间。" },
  lianhuashan: { name: "莲花山索道·动物园北门", kind: "optional", latlng: [38.892, 121.610], approximate: true, locationNote: "动物园北门与莲花山观景台为不同入口，地图标记为北门集合点。" }
};

const itinerary = [
  {
    id: "10-01", short: "10/1", label: "10 月 1 日 · 抵达", summary: "23:15 到达后直接打车去酒店，尽早休息。", color: "#487ea8",
    note: "机场上车点以当天指引为准；酒店已订大床房。",
    stops: [
      { place: "airport", time: "23:15", detail: "航班 CA8956 抵达。取行李后到机场出租车排班区打车。" },
      { place: "hotel", time: "约 00:15", detail: "直接办理入住，第二天还要乘 10:53 的高铁。" }
    ]
  },
  {
    id: "10-02", short: "10/2", label: "10 月 2 日 · 丹东往返与正黄旗夜宵", summary: "丹东站—鸭绿江断桥—安东老街—丹东站，返回大连后去正黄旗延安路总店。", color: "#487ea8",
    note: "丹东点位为市区道路示意；若断桥现场拥堵，优先保留江边观景并按时回站。21:05 到达大连后前往正黄旗，若排队过久则直接回酒店。",
    stops: [
      { place: "station", time: "10:53", detail: "乘 D7757 从大连站出发前往丹东。" },
      { place: "dandongStation", time: "13:38", detail: "抵达丹东站；出站后直接前往鸭绿江断桥。" },
      { place: "yaluBridge", time: "14:05–15:20", detail: "鸭绿江断桥及江边观景，远眺中朝友谊桥；不安排游船。" },
      { place: "andongOldStreet", time: "15:40–16:45", detail: "安东老街短线游览，可吃小吃；时间紧不追求逛完。" },
      { place: "dandongStation", time: "17:15", detail: "最晚返回丹东站，预留安检和进站时间。" },
      { place: "station", time: "21:05", detail: "乘 D7750 返回大连站后，打车前往酒店所在的高新万达片区。" },
      { place: "zhenghuangqi", time: "21:45–22:45", detail: "正黄旗延安路总店吃海鲜；出发前确认国庆营业、排队和最晚接单。" },
      { place: "hotel", time: "约 23:00", detail: "吃完夜宵步行或短途打车回酒店。" }
    ],
    routeSegments: [
      { places: ["station", "dandongStation"], dashArray: "4 8", color: "#487ea8" },
      { places: ["dandongStation", "yaluBridge", "andongOldStreet", "dandongStation"], color: "#c06a3a", dashArray: null },
      { places: ["dandongStation", "station"], dashArray: "4 8", color: "#487ea8" },
      { places: ["station", "zhenghuangqi", "hotel"], color: "#487ea8", dashArray: null }
    ]
  },
  {
    id: "10-03", short: "10/3", label: "10 月 3 日 · 燕窝岭野攀", summary: "野攀结束后，在西部滨海方向吃海鲜晚饭。", color: "#c06a3a",
    note: "野攀集合和结束时间待组织方确认；若返程不经过星海或结束太晚，喜鼎改为备选。",
    stops: [
      { place: "yanwo", time: "全天", detail: "参加大连元气攀岩组织的燕窝岭野攀；具体集合时间以组织方通知为准。" },
      { place: "xiding", time: "约 19:00–20:30", detail: "主选喜鼎星海广场店吃海胆水饺及小海鲜，建议提前取号。" },
      { place: "hotel", time: "晚餐后", detail: "结束活动后回酒店休息。" }
    ]
  },
  {
    id: "10-04", short: "10/4", label: "10 月 4 日 · 星海与滨海线", summary: "樱木千鹤必吃；下午沿西部滨海慢走，晚餐吃威尔威尔星海广场店。", color: "#2f7e69",
    note: "樱木千鹤、威尔威尔星海广场店都在星海片区，滨海步行结束后返回同一区域用餐；其他正黄旗门店不安排。",
    stops: [
      { place: "sakura", time: "10:00–12:00", detail: "必吃日料；优先甜虾盖饭、海鲜盖饭。提前核对营业时间与取号。" },
      { place: "xinghai", time: "12:00–14:00", detail: "从樱木千鹤步行前往，逛广场、拍照和休息。" },
      { place: "fujiazhuang", time: "15:00 起", detail: "打车到付家庄，开始西部滨海步行线。" },
      { place: "yinshatan", time: "下午", detail: "沿海慢走，给拍照和休息留时间。" },
      { place: "bridge", time: "日落前", detail: "在跨海大桥附近选择当日可到达的安全观景位置看日落。" },
      { place: "weierweier", time: "18:00–19:30", detail: "在威尔威尔星海广场店吃晚饭；与樱木千鹤、星海广场同片区，不为晚餐远距离折返。" }
    ]
  },
  {
    id: "10-05", short: "10/5", label: "10 月 5 日 · 海之韵与市中心", summary: "上午海之韵，午餐澳深鱼市，下午市中心慢逛，晚餐新长兴。", color: "#5579a6",
    note: "澳深鱼市按海之韵北门/东港方向安排，新长兴按市中心回酒店方向安排；市场营业和加工档口以当天现场为准。",
    stops: [
      { place: "haizhiyunSouth", time: "09:00", detail: "打车到西南门，开始海之韵公园南进北出的约 3 小时路线。" },
      { place: "haizhiyunNorth", time: "约 12:00", detail: "从北门出园，前往海之韵北门/东港方向的澳深鱼市。" },
      { place: "aoshen", time: "12:15–13:30", detail: "海鲜盖饭午餐；按当天门店位置和排队情况就近用餐。" },
      { place: "nanshan", time: "14:00–15:00", detail: "选一段南山路 citywalk 和咖啡。" },
      { place: "guangfeng", time: "15:00–17:00", detail: "从桃源街站附近沿坡路向上逛；体力不足时与南山路二选一。" },
      { place: "xinchangxing", time: "19:15–20:30", detail: "在新长兴吃海鲜；市场营业和加工档口以当天现场为准，晚餐后回酒店。" }
    ]
  },
  {
    id: "10-06", short: "10/6", label: "10 月 6 日 · 返程", summary: "莲花山可选；取行李后 11:00 元气攀岩探馆，13:15 出发去机场。", color: "#8877a4",
    note: "建议 07:00 先退房并寄存行李；11:00–13:00 元气攀岩探馆，结束后 13:15 出发去机场。若索道排队超过 30 分钟，直接取消索道，不影响攀岩和航班。",
    stops: [
      { place: "lianhuashan", time: "07:30–09:30", detail: "可选：动物园北门—莲花山观景台；先寄存行李，确认开放与排队后才执行。", optional: true },
      { place: "hotel", time: "09:30–11:00", detail: "回酒店取行李；酒店与岩馆同在高新园区，距离不远。" },
      { place: "yuanyi", time: "11:00–13:00", detail: "高新园区七贤里文化创意产业园2号楼探馆爬墙；与10月3日野攀同一家。" },
      { place: "airport", time: "15:35 起飞", detail: "13:15 从岩馆打车去机场（约40分钟）；乘 HO2032 返回杭州，提前办理值机。" }
    ]
  }
];

const map = L.map("map", { zoomControl: true, scrollWheelZoom: true, preferCanvas: true });
map.setView([39.45, 123.0], 8);
const cityBounds = L.latLngBounds([38.70, 121.30], [40.35, 124.70]);
map.setMaxBounds(cityBounds.pad(0.6));
map.options.minZoom = 8;
map.options.maxZoom = 17;

const tileLayer = L.tileLayer("https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  maxZoom: 17,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> · HOT / OSM France'
}).addTo(map);
const status = document.getElementById("map-status");
let tileErrors = 0;
map.createPane("districts").style.zIndex = 250;
map.createPane("roads").style.zIndex = 320;
tileLayer.on("tileerror", () => {
  tileErrors += 1;
  if (tileErrors >= 4) {
    status.hidden = false;
    status.textContent = "在线街道底图暂不可用；地点和路线仍可缩放查看。";
  }
});
tileLayer.on("tileload", () => {
  tileErrors = 0;
  status.hidden = true;
});

fetch("./map-assets/dalian-boundary.json")
  .then((response) => {
    if (!response.ok) throw new Error("boundary unavailable");
    return response.json();
  })
  .then((data) => {
    const urban = new Set(["中山区", "西岗区", "沙河口区", "甘井子区"]);
    L.geoJSON(data, {
      filter: (feature) => urban.has(feature.properties.name),
      pane: "districts",
      style: { color: "#8eafa3", weight: 1, opacity: 0.65, fillColor: "#e8f2ed", fillOpacity: 0.10 },
      interactive: false
    }).addTo(map);
  })
  .catch(() => {});

fetch("./map-assets/dalian-roads.json")
  .then((response) => {
    if (!response.ok) throw new Error("roads unavailable");
    return response.json();
  })
  .then((data) => {
    const roadGroups = { major: [], primary: [], secondary: [], tertiary: [] };
    for (const road of data.elements) {
      if (!road.geometry || road.geometry.length < 2) continue;
      const highway = road.tags?.highway;
      const group = highway === "motorway" || highway === "trunk" ? "major" : highway;
      if (roadGroups[group]) roadGroups[group].push(road.geometry.map((point) => [point.lat, point.lon]));
    }
    for (const [group, lines] of Object.entries(roadGroups)) {
      if (lines.length === 0) continue;
      L.polyline(lines, {
        pane: "roads", color: group === "major" ? "#b7ada0" : "#cfc8b7",
        weight: { major: 2.8, primary: 2.3, secondary: 1.7, tertiary: 1.2 }[group],
        opacity: 0.42, interactive: false, smoothFactor: 1
      }).addTo(map);
    }
  })
  .catch(() => {});

const routeLayer = L.layerGroup().addTo(map);
const markerLayer = L.layerGroup().addTo(map);
const markerByPlace = new Map();
const nav = document.getElementById("date-nav");
const list = document.getElementById("stop-list");
const title = document.getElementById("day-title");
const summary = document.getElementById("day-summary");
const note = document.getElementById("stop-note");
let selectedDay = "all";

function safe(text) {
  return String(text).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function stopGroups(stops) {
  const groups = new Map();
  for (const stop of stops) {
    if (!groups.has(stop.place)) groups.set(stop.place, []);
    groups.get(stop.place).push(stop);
  }
  return groups;
}

function makeMarker(placeId, stops, overview = false) {
  const place = places[placeId];
  const time = stops.map((stop) => stop.time).join(" / ");
  const icon = L.divIcon({
    className: `map-pin ${place.kind} ${overview ? "overview" : ""}`,
    html: `<div class="pin-content"><span class="pin-dot"></span><span class="pin-label">${safe(time)} · ${safe(place.name)}</span></div>`,
    iconSize: [0, 0], iconAnchor: [8, 8]
  });
  const marker = L.marker(place.latlng, { icon, title: `${place.name} · ${time}` }).addTo(markerLayer);
  const details = stops.map((stop) => `<p class="popup-detail"><span class="popup-time">${safe(stop.time)}</span>　${safe(stop.detail)}</p>`).join("");
  const locationNote = place.locationNote || (place.approximate ? "位置为片区示意，出发前请核对导航。" : "");
  marker.bindPopup(`<div><div class="popup-name">${safe(place.name)}</div>${details}${locationNote ? `<p class="popup-note">${safe(locationNote)}</p>` : ""}</div>`);
  markerByPlace.set(placeId, marker);
}

function fitCurrent(animate = true) {
  const activePlaces = selectedDay === "all"
    ? Object.keys(places)
    : itinerary.find((day) => day.id === selectedDay).stops.map((stop) => stop.place);
  const bounds = L.latLngBounds(activePlaces.map((id) => places[id].latlng));
  map.fitBounds(bounds.pad(0.26), { padding: [22, 22], maxZoom: selectedDay === "all" ? 12 : 13, animate });
}

function showPlace(placeId) {
  const place = places[placeId];
  map.flyTo(place.latlng, Math.max(map.getZoom(), 14), { duration: 0.35 });
  markerByPlace.get(placeId)?.openPopup();
}

function renderOverview() {
  title.textContent = "全部大连·丹东地点";
  summary.textContent = "按日期筛选可看到每一天的顺序与具体时间。";
  note.textContent = "地图包含大连及 10/2 丹东短线；丹东点位为市区道路示意。未确认具体地址的餐厅不作精确标记。";
  for (const day of itinerary) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "stop-button";
    button.type = "button";
    const date = document.createElement("span");
    date.className = "stop-time";
    date.textContent = day.short;
    const name = document.createElement("span");
    name.className = "stop-name";
    name.textContent = day.label.split(" · ")[1];
    const detail = document.createElement("span");
    detail.className = "stop-detail";
    detail.textContent = day.summary;
    button.append(date, name, detail);
    button.addEventListener("click", () => selectDay(day.id));
    item.append(button);
    list.append(item);
  }
  const allStops = itinerary.flatMap((day) => day.stops);
  for (const [placeId, stops] of stopGroups(allStops)) makeMarker(placeId, stops, true);
}

function renderDay(day) {
  title.textContent = day.label;
  summary.textContent = day.summary;
  note.textContent = day.note;
  for (const stop of day.stops) {
    const place = places[stop.place];
    const item = document.createElement("li");
    item.className = stop.optional ? "optional" : place.kind;
    const button = document.createElement("button");
    button.className = "stop-button";
    button.type = "button";
    const time = document.createElement("span");
    time.className = "stop-time";
    time.textContent = stop.time + (stop.optional ? " · 可选" : "");
    const name = document.createElement("span");
    name.className = "stop-name";
    name.textContent = place.name;
    const detail = document.createElement("span");
    detail.className = "stop-detail";
    detail.textContent = stop.detail;
    button.append(time, name, detail);
    button.addEventListener("click", () => showPlace(stop.place));
    item.append(button);
    list.append(item);
  }
  for (const [placeId, stops] of stopGroups(day.stops)) makeMarker(placeId, stops);
  if (day.routeSegments) {
    for (const segment of day.routeSegments) {
      const route = segment.places.map((placeId) => places[placeId].latlng);
      if (route.length < 2) continue;
      L.polyline(route, {
        color: segment.color || day.color,
        weight: 3,
        opacity: 0.78,
        dashArray: segment.dashArray || undefined,
        interactive: false
      }).addTo(routeLayer);
    }
  } else {
    const route = day.stops.map((stop) => places[stop.place].latlng);
    if (route.length > 1) {
      L.polyline(route, { color: day.color, weight: 3, opacity: 0.78, dashArray: "7 7", interactive: false }).addTo(routeLayer);
    }
  }
}

function selectDay(dayId) {
  selectedDay = dayId;
  routeLayer.clearLayers();
  markerLayer.clearLayers();
  markerByPlace.clear();
  list.replaceChildren();
  for (const button of nav.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.day === dayId));
  if (dayId === "all") renderOverview();
  else renderDay(itinerary.find((day) => day.id === dayId));
  fitCurrent(false);
}

for (const day of [{ id: "all", short: "全部地点" }, ...itinerary]) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "date-button";
  button.dataset.day = day.id;
  button.textContent = day.short;
  button.setAttribute("aria-pressed", String(day.id === selectedDay));
  button.addEventListener("click", () => selectDay(day.id));
  nav.append(button);
}

document.getElementById("fit-button").addEventListener("click", () => fitCurrent());
selectDay(selectedDay);
