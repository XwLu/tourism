# 大连·丹东国庆旅行地图

这是一个用于记录和查看 2026 年国庆大连、丹东行程的静态网页项目。页面以日期为单位展示景点、酒店、交通和餐饮安排，并在可缩放的 Leaflet 地图上标注地点和路线。

## 项目结构

```text
tourism/
├── README.md
├── .gitignore
└── dalian-20261001/
    ├── dalian-travel-plan.md       # 完整的文字行程和待确认事项
    └── web/                        # Netlify 发布目录
        ├── index.html              # 网页入口、页面布局和样式
        └── map-assets/
            ├── dalian-map.js       # 地点、每日行程、路线和交互逻辑
            ├── leaflet.js          # Leaflet 地图库
            ├── leaflet.css         # Leaflet 样式
            ├── dalian-boundary.json # 大连城区边界数据
            ├── dalian-roads.json   # 大连道路示意数据
            └── LEAFLET-LICENSE.txt # Leaflet 许可说明
```

## 网页工作机制

### 1. 页面入口

Netlify 和本地预览都以 `dalian-20261001/web/index.html` 为入口。它负责：

- 加载本地的 Leaflet CSS 和 JavaScript；
- 加载 `map-assets/dalian-map.js` 中的行程数据和交互逻辑；
- 创建日期筛选栏、左侧行程列表和右侧地图；
- 在桌面端左右分栏，在手机端切换为上下布局。

项目没有前端框架、数据库或后端服务，发布的是可直接由浏览器访问的静态文件。

### 2. 行程数据和页面渲染

`dalian-map.js` 中有两组核心数据：

- `places`：地点名称、类型、经纬度和定位备注；
- `itinerary`：每天的标题、摘要、提示、时间、地点和路线段。

页面启动时先显示全部地点。用户点击日期后，脚本会：

1. 更新左侧当天的时间线；
2. 清空并重新绘制当天的地点标记；
3. 绘制当天的路线线段；
4. 自动调整地图范围；
5. 点击列表项目时，把地图移动到对应地点并打开提示框。

餐厅使用橙色标记，普通景点使用绿色标记，交通点使用蓝色标记，酒店使用深绿色标记，可选项目使用紫色标记。

### 3. 地图图层

地图由 Leaflet 管理，包含以下图层：

- OpenStreetMap HOT 在线街道底图；
- `dalian-boundary.json` 提供大连城区边界和浅色区域；
- `dalian-roads.json` 提供道路示意线；
- 行程路线和地点标记由脚本按当前日期动态生成。

在线街道底图需要网络连接。如果瓦片加载失败，页面会显示提示，但本地地点、路线和行程列表仍然可以使用。地图页面保留 OpenStreetMap 的署名信息。

部分餐厅或入口只有片区级地址，因此在数据中标记为示意位置，并在提示框中要求出发前再次核对导航、营业时间和入口。

## 本地预览

由于页面会通过 `fetch()` 加载 JSON，建议使用本地 HTTP 服务，而不是直接双击 HTML 文件：

```bash
python3 -m http.server 8765 --directory dalian-20261001/web
```

然后在浏览器打开：

```text
http://127.0.0.1:8765/
```

修改 `dalian-map.js` 或地图资源后，刷新浏览器即可查看结果。项目不需要安装 npm 依赖，也没有构建步骤。

## GitHub 与 Netlify 自动部署

当前 GitHub 仓库为：

```text
git@github.com:XwLu/tourism.git
```

默认分支是 `main`。Netlify 已连接这个 GitHub 仓库，发布目录配置为：

```text
dalian-20261001/web
```

这是一个静态站点，因此 Netlify 的主要配置是：

- **生产分支：** `main`
- **构建命令：** 留空
- **发布目录：** `dalian-20261001/web`

自动部署流程如下：

```mermaid
flowchart LR
    A[修改 index.html 或 map-assets] --> B[git add / commit]
    B --> C[git push origin main]
    C --> D[GitHub push 事件]
    D --> E[Netlify Webhook / GitHub App]
    E --> F[Netlify 发布 dalian-20261001/web]
    F --> G[Netlify CDN 提供网页]
```

Netlify 主要通过 GitHub 的 push 事件通知触发部署，而不是按固定间隔扫描仓库。每次向 `main` 推送 commit 后，Netlify 会取得最新代码，按发布目录重新生成部署版本，并在完成后更新站点 CDN。

如果配置了 Pull Request 预览，PR 也可以生成独立的预览部署；合并到 `main` 后才会更新生产站点。手动拖拽发布不会自动建立 GitHub 同步关系，应优先使用 Git 推送来更新网站。

## 日常更新流程

1. 修改 `dalian-20261001/web/map-assets/dalian-map.js` 中的地点或行程数据；
2. 如果需要修改页面标题、布局或样式，编辑 `dalian-20261001/web/index.html`；
3. 本地启动 HTTP 服务并检查日期筛选、地图缩放、地点提示和路线；
4. 提交并推送到 `main`：

   ```bash
   git add README.md dalian-20261001
   git commit -m "Update travel itinerary"
   git push origin main
   ```

5. 在 Netlify 的 Deploys 页面查看构建和发布状态。

通常只需要修改 `dalian-map.js` 就能更新行程；地图数据文件的相对路径应保持不变，否则浏览器会无法加载边界或道路图层。

## 注意事项

- `.DS_Store` 和 `.codex/` 已在 `.gitignore` 中排除，不会被提交。
- 地图底图来自在线 OpenStreetMap 瓦片，不能保证离线环境下显示完整彩色底图。
- 行程中的门店营业时间、排队情况、入口位置和交通时间需要在出发前再次确认。
- 地图中的丹东点位是 10 月 2 日短线行程的一部分；具体车次和现场路线以当天车票、导航和景区安排为准。
