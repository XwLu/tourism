# 阿帆的旅行账本

当前小程序已在 TDesign 初始化框架上接入 2026 年 10 月 1 日至 6 日的大连、丹东行程，入口为原生页面。

## 当前功能

- 首页：「好想全职旅攀」，按整趟旅行展示双列卡片，目前只有大连·丹东一个旅行计划，支持关键词搜索和主题筛选。
- 详情：进入一趟旅行后，在日期标签中切换六天安排，查看每日时间线、交通住宿、出行提醒和可选项目。
- 地图：点击「展开路线地图」显示微信原生地图，不请求用户当前位置；地址未核实的餐厅不作精确标记。地图瓦片需要联网。
- 收藏：点击卡片或详情页的爱心，收藏整趟旅行；「我的收藏」可再次查看，不同设备之间不自动同步。
- 分享与复制：通过微信分享当天行程，或将当天时间线复制为文字。
- 野攀保险：仅在当天实际有野攀活动的行程详情中提供购买二维码，上方注明「第二天生效」，支持点击放大和长按图片；首页、收藏页和其他日期不展示。
- 同行报名：详情页日期选择栏上方右侧报名，左侧展示最近三位成员头像；「人同行」人数随实际报名人数更新。报名记录属于整趟旅行，首次使用时选择头像并填写昵称。
- 每日评论：详情底部记录当天实际游玩的反馈，按日期独立保存，支持继续加载和删除自己的留言。评论与报名通过微信云托管和 MySQL 在不同微信用户之间共享。

## 打开预览

在微信开发者工具中导入本目录，使用 AppID `wx5dbd496f801eca64`，选择「普通编译」即可。保留项目现有的 Less 编译插件设置。当前注册的页面全部使用原生组件，无需构建 TDesign npm 包。浏览行程无需服务器；多人评论和报名的启用步骤见 [云托管部署](../cloudrun/README.md)。

`config/cloud.js` 已配置环境 `prod-d7gikpjuqf33d2a1c` 和服务 `express-1zah`。`app.js` 初始化云调用，`utils/community.js` 通过 `wx.cloud.callContainer` 请求 `/api/community`。服务端尚未部署或不可用时，页面显示错误和重试入口，不会把本机保存误当成共享成功。之前本机保存的反馈保留在原存储中，不会自动上传。

成员身份由云托管注入的可信 OpenID 标识，客户端选择头像并填写昵称；不能直接读取用户的微信号。头像、昵称会向查看行程的用户展示，上线前在小程序后台填写相应的隐私保护指引。

打包配置已排除原模板的 `miniprogram_npm`、封面生成脚本、旧云函数源码和本说明文件，避免把未使用的组件包或服务端代码上传到客户端。当前后端为上级目录的 `cloudrun/`，需单独部署到微信云托管；`cloudfunctions/` 是早期云开发方案的保留源码，本版本不调用它。原模板文件仍可在本地查看。

建议依次检查：首页只有一张大连旅行卡片、进入后切换六个日期、搜索「喜鼎」可找到所属旅行、收藏后切换到底部「我的收藏」、展开地图、复制当天行程。微信分享请在真机验证。

## 修改行程

内容统一维护在 `data/dalian.js`，包括旅行信息 `trip` 和六天行程 `days`。数据依据 `../plans/dalian-20261001/dalian-travel-plan.md` 整理；本版本和网页数据各自维护，修改其中一处不会自动同步另一处。

`data/trips.js` 是旅行列表入口。目前只登记大连这一趟旅行；以后增加旅行时，新增对应的数据文件，并在该列表登记，首页就会增加一个旅行块。每天的安排只在旅行详情中展示。

新旅行或日期还需登记到后端数据库：在 `../cloudrun/` 执行 `npm run trip-sql`，将生成的 `trip-registry.sql` 在 MySQL 目标库执行即可立即启用报名和评论，无需重新部署后端。详情见 [新增旅行流程](../cloudrun/README.md#新增旅行时无需重新部署后端)。

- `stops`：时间、地点、类型、说明；`optional: true` 表示可选安排。
- `coordinates`：来自现有网页的 WGS84 坐标，显示时转换成微信地图使用的 GCJ-02。
- `approximate: true`：地址未核实的地点，不在地图中绘制。
- `hasOutdoorClimbing: true`：当天包含野攀活动，仅该日期详情显示保险提示。二维码源图在 `../docs/京东安联户外保险.png`，打包副本在 `static/insurance/outdoor-insurance.png`，更换图片时需同步更新。
- `cover` / `coverTitle` / `coverHeight`：封面、封面文案和首页封面高度。

封面文件随小程序打包，生成脚本为 `scripts/generate-covers.py`，重新生成需要 Python 和 Pillow。它们是示意插画，不是景点实拍。

当前行程随代码打包，推送 GitHub 或更新 Netlify 不会自动更新已发布的小程序；公开版本更新需要在微信开发者工具中上传、审核、发布。后续可将行程数据改为远程读取。

原框架的登录、聊天、个人中心等示例源码仍保留，暂未注册为页面，也不在应用启动时加载 mock 服务。框架原有说明如下。

---

# TDesign 通用页面模板

基于 TDesign 打造的通用页面模板，包含通用的登陆注册、个人中心、设置中心、信息流等等功能。

## 模版功能预览

### 首页

<div style="display: flex">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/home-1.png">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/home-2.png">
</div>

### 信息发布

<img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/publish-1.png">

### 搜索页

<img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/search-1.png">

### 个人中心
<div style="display: flex">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/user-1.png">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/user-2.png">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/user-3.png">
</div>


### 设置中心

<img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/setting-1.png">

### 消息中心

<img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/message-1.png">


## 开发预览
### 目录结构（TODO: 生成目录结构树）


### 在开发者工具中预览

```bash
# 安装项目依赖
npm install

```

打开[微信开发者工具](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html)，导入整个项目，构建 npm 包，就可以预览示例了。

### 基础库版本

最低基础库版本`^2.6.5`


## 贡献成员

<a href="https://github.com/TDesignOteam/tdesign-miniprogram-starter/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=TDesignOteam/tdesign-miniprogram-starter" />
</a>

## 反馈

有任何问题，建议通过 [Github issues](https://github.com/TDesignOteam/tdesign-miniprogram-starter/issues) 反馈。

## 开源协议

TDesign 遵循 [MIT 协议](https://github.com/TDesignOteam/tdesign-miniprogram-starter/blob/main/LICENSE)。
