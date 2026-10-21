# 阿帆的旅行账本

当前小程序已在 TDesign 初始化框架上接入 2026 年 10 月 1 日至 6 日的大连、丹东行程，以及 10 月 18 日临安狮子岩 Lower40 一日野攀，入口为原生页面。

## 当前功能

- 首页：「好想全职旅攀」，按整趟旅行展示双列卡片，目前维护大连·丹东、临安狮子岩两趟旅行计划，支持关键词搜索和主题筛选；执行发布 SQL 后云端列表同步更新。
- 详情：进入一趟旅行后，按日期查看每日时间线、交通住宿、出行提醒和可选项目；大连为六日旅行，狮子岩为一日行程。
- 地图：有已核实坐标时，点击「展开路线地图」显示微信原生地图，不请求用户当前位置；地址未核实的餐厅不作精确标记。坐标尚未核实的行程不展示地图入口，地图瓦片需要联网。
- 收藏：点击卡片或详情页的爱心，收藏整趟旅行；「我的收藏」可再次查看，不同设备之间不自动同步。
- 分享与复制：通过微信分享当天行程，或将当天时间线复制为文字。
- 野攀保险：仅在当天实际有野攀活动的行程详情中提供购买二维码，上方注明「第二天生效」，支持点击放大和长按图片；首页、收藏页和其他日期不展示。
- 同行报名：详情页日期选择栏上方右侧报名，左侧展示最近三位成员头像；「人同行」人数随实际报名人数更新。报名记录属于整趟旅行，首次使用时选择头像并填写昵称。
- 每日评论：详情底部记录当天实际游玩的反馈，按日期独立保存，支持继续加载和删除自己的留言。评论与报名通过微信云托管和 MySQL 在不同微信用户之间共享。

## 打开预览

在微信开发者工具中导入本目录，使用 AppID `wx5dbd496f801eca64`，选择「普通编译」即可。保留项目现有的 Less 编译插件设置。当前注册的页面全部使用原生组件，无需构建 TDesign npm 包。云端行程、多人评论和报名的启用步骤见 [云托管部署](../cloudrun/README.md)。

`config/cloud.js` 已配置环境 `prod-d7gikpjuqf33d2a1c` 和服务 `express-1zah`。`app.js` 初始化云调用，`utils/trip-store.js` 请求 `/api/trips` 获取完整行程，`utils/community.js` 请求 `/api/community` 读取报名与评论。首页、收藏页及从微信分享打开的详情页均在显示时更新，也支持下拉刷新；更新失败保留原内容并显示重试提示。最近一次成功获取的行程缓存在本机，首次离线可查看包内行程；云端成功返回空列表时显示空列表，不恢复包内行程。之前本机保存的反馈保留在原存储中，不会自动上传。

成员身份由云托管注入的可信 OpenID 标识，客户端选择头像并填写昵称；不能直接读取用户的微信号。头像、昵称会向查看行程的用户展示，上线前在小程序后台填写相应的隐私保护指引。

打包配置已排除原模板的 `miniprogram_npm`、封面生成脚本、旧云函数源码和本说明文件，避免把未使用的组件包或服务端代码上传到客户端。当前后端为上级目录的 `cloudrun/`，需单独部署到微信云托管；`cloudfunctions/` 是早期云开发方案的保留源码，本版本不调用它。原模板文件仍可在本地查看。

建议在执行发布 SQL 后依次检查：首页有大连、狮子岩两张旅行卡片，大连详情可切换六个日期，狮子岩详情仅有 10 月 18 日；搜索「Lower40」能找到狮子岩，野攀当天显示保险二维码；收藏后切换到底部「我的收藏」，并检查有坐标的地图及当天行程复制。微信分享请在真机验证。

## 修改行程

大连源数据维护在 `data/dalian.js`，包括旅行信息 `trip` 和六天行程 `days`，依据 `../plans/dalian-20261001/dalian-travel-plan.md` 整理。源文件用于生成数据库发布 SQL，也作为首次离线的默认行程；已联网的小程序以数据库内容为准。网页仍独立维护。

`data/trips.js` 是旅行列表入口，目前登记大连、狮子岩两趟旅行。狮子岩源数据在 `data/linan-shiziyan.js`，文字计划在 `../plans/linan-shiziyan-20261018/linan-shiziyan-travel-plan.md`。以后增加旅行时，新增对应的数据文件，在该列表登记，并生成、执行发布 SQL，首页就会增加一个旅行块。每天的安排只在旅行详情中展示。

每次修改行程后，在 `../cloudrun/` 执行 `npm run trip-sql`，将生成的 `trip-registry.sql` 在 MySQL 目标库执行。它会同时更新完整行程与报名、评论所需的日期登记。重新进入页面或下拉刷新即可看到新内容，无需上传新小程序或重新部署后端。详情见 [行程发布流程](../cloudrun/README.md#新增或修改旅行无需重新发版)。

- `stops`：时间、地点、类型、说明；`optional: true` 表示可选安排。
- `coordinates`：来自现有网页的 WGS84 坐标，显示时转换成微信地图使用的 GCJ-02。
- `approximate: true`：地址未核实的地点，不在地图中绘制。
- `hasOutdoorClimbing: true`：当天包含野攀活动，仅该日期详情显示保险提示。二维码源图在 `../docs/京东安联户外保险.png`，打包副本在 `static/insurance/outdoor-insurance.png`，更换图片时需同步更新。
- `cover` / `coverTitle` / `coverHeight`：封面、封面文案和首页封面高度。

大连封面文件随小程序打包，生成脚本为 `scripts/generate-covers.py`，重新生成需要 Python 和 Pillow。它们是示意插画，不是景点实拍。新增旅行可复用现有 `/static/travel/` 图片；也支持 HTTPS 图片，需先在小程序后台配置对应合法域名。仅添加新本地图片仍需要发版，不能直接让已安装的小程序读取到新文件。

临安首页卡片、收藏卡片和当天详情共用云托管对象存储中的公开 HTTPS 封面地址，维护在 `data/linan-shiziyan.js` 的旅行和当天 `cover` 中。已验证去除签名参数后可公开访问，不保存带 `sign`、`t` 的临时链接；在已启用联网行程的小程序版本中，执行最新行程 SQL 并刷新即可更新封面，无需为这张图片重新发版。后续换图建议使用新文件名，再同步修改两个 `cover` 并生成、执行 SQL，避免旧图缓存。

临安封面的本地绘制产物保存在 `../docs/travel/linan-shiziyan.jpg`，参考岩场照片中的赭色岩壁、攀爬者、竹林山谷与村落，以现有扁平颗粒插画风格绘制。仅重新生成这一张，在本目录执行 `python3 scripts/generate-covers.py --only linan-shiziyan`，默认输出到 `../docs/travel/`。绘图脚本只生成本地文件，新图需要上传到对象存储后才能用于线上封面。

临安狮子岩、东阳梅谷、新昌百丈岩、衢州两头洞的四张上传用封面统一保存在 `../docs/travel/`，照片参考特征、文件名、公开 HTTPS 地址和批量生成命令见该目录的说明。生成脚本支持 `--only` 后跟多个名称，以及 `--output` 指定输出目录；不带 `--only` 时，原有大连封面与地图标记输出到 `static/travel/`，四张云端封面输出到 `../docs/travel/`。

本次联网改造需要部署一次后端并发布一次小程序；之后内容更新只需执行 SQL。推送 GitHub 或更新 Netlify 不会自动更新数据库。页面布局、交互功能及新的包内资源仍需通过微信开发者工具上传、审核、发布。

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
