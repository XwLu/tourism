# 微信云托管：阿帆的旅行账本

本目录是可独立部署的 Express 服务，替换 `express-1zah` 中原来的计数器示例。小程序通过 `GET /api/trips` 从数据库读取完整行程，通过 `POST /api/community` 共享报名与每日反馈。两类接口均使用微信云调用身份，不提供客户端写入行程的接口。

| 项目 | 值 |
| --- | --- |
| AppID | `wx5dbd496f801eca64` |
| 云托管环境 | `prod-d7gikpjuqf33d2a1c` |
| 服务名称 | `express-1zah` |
| 容器端口 | `80` |
| Dockerfile | `Dockerfile` |
| 健康检查路径 | `/health` |

## 1. 填写数据库环境变量

自动发布的首次配置见下方「自动发布行程」。

### 自动发布行程

本地 `npm run trip-publish` 会先生成 SQL 备份，再将完整行程 JSON 发往 `POST /api/admin/trips`。服务校验数据，以参数化语句在同一事务更新正文和日期，回读校验完整正文、上架状态和日期登记后提交。本地检查云端回执中的 ID、标题、日期与野攀标记。不会执行上传的 SQL，不删除历史日期、报名、评论或未包含的旅行；包含的旅行会恢复上架。

首次配置（需要在控制台操作一次）：

1. 小程序后台首页 → 开发与服务 → 云服务 → 云托管（去使用）→ 前往控制台，选择环境 `prod-d7gikpjuqf33d2a1c`。
2. 保持原服务 `express-1zah` 的公网访问关闭。在同一环境新建专用发布服务，上传同一份后端代码包，按本文第 3 节配置端口与 Dockerfile。专用服务复用同一 MySQL 内网连接和 `MYSQL_DATABASE=nodejs_demo`，设置 `TRIP_PUBLISH_ONLY=true`，仅该服务开启 HTTPS 公网访问。此模式禁止访问行程读取和社区接口，避免改变原小程序的访问边界。专用服务会产生相应云托管资源费用。
3. 本机运行下面的命令生成私有配置文件（首次执行，勿覆盖已有文件），将文件中的令牌复制到专用服务的环境变量 `TRIP_PUBLISH_TOKEN`。令牌至少 32 字符，仅保存在控制台和仓库外文件；不要放进小程序、Git 或聊天。构建发布后，把服务的实际 HTTPS 地址填入本机文件的 `TRIP_PUBLISH_URL`。

```sh
mkdir -p "$HOME/.config/tourism"
(umask 077; node -e 'const fs = require("node:fs"); const crypto = require("node:crypto"); fs.writeFileSync(process.env.HOME + "/.config/tourism/publish.env", "TRIP_PUBLISH_URL=https://replace-with-service-host\nTRIP_PUBLISH_TOKEN=" + crypto.randomBytes(32).toString("hex") + "\n", { flag: "wx", mode: 0o600 });')
```

后续发布只需运行：

```sh
cd /Users/looyifan/Workspace/tourism/cloudrun
node --env-file="$HOME/.config/tourism/publish.env" --experimental-vm-modules scripts/publish-trips.mjs
```

也可在已配置上述两个环境变量的终端运行 `npm run trip-publish`。本机需要 Node.js 22+。配置完成后，Codex 可读取该私有文件执行发布，无需再手动进入 SQL 窗口。不要输出文件中的令牌。超时或回执异常不代表数据库一定未提交，可重复发布并验证；未配置令牌时接口关闭，错误令牌返回 401。令牌轮换时同步更新控制台和本机文件。

首次部署由控制台完成；仓库代码和本地 SQL 生成成功均不代表云端已上线。此功能无需修改或重新发布小程序。发布成功后重新进入小程序或下拉刷新，核对正文和野攀日保险提示。仍可按下文的 SQL 流程作为备用。

进入微信云托管控制台，选择上述环境，打开「服务管理 → express-1zah → 服务设置 → 基本信息」，在「环境变量」中添加或修改以下项目。首次部署也可以在发布页面填写环境变量。模板部署可能已自动注入前三项；有正确值时直接沿用，不必重复添加。

| 变量名 | 填写内容 |
| --- | --- |
| `MYSQL_ADDRESS` | MySQL 页面「网络信息」中的**内网地址和端口**，例如 `10.x.x.x:3306`。不要加 `http://`。 |
| `MYSQL_USERNAME` | MySQL 的账号名称，例如 `root`；如使用其他账号，需具有目标库的建表、查询和增删改权限。 |
| `MYSQL_PASSWORD` | 该数据库账号的密码，即开通时设置的密码；直接粘贴，不加引号。忘记时在 MySQL 账号管理中重置。 |
| `MYSQL_DATABASE` | `nodejs_demo`。如使用其他已创建的数据库，则填写实际库名。 |
| `PORT` | `80`，与服务端口一致。 |

密码只在控制台填写，不要写入小程序、Git 仓库或聊天。`.env.example` 只提供字段样例；线上读取控制台注入的环境变量，不读取这个样例文件。修改环境变量会创建新版本，已有版本不会原地修改。

在「MySQL → 数据库管理」登录后，确认 `nodejs_demo` 库存在。官方 Express 模板通常已创建；如果没有，在 SQL 窗口执行：

```sql
CREATE DATABASE IF NOT EXISTS nodejs_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

服务启动时按 `schema.sql` 创建所需的行程、社区、路书和攀爬记录表，不清空已有数据。`travel_trips` 保存整趟旅行及全部日期的 JSON 内容；服务重启只建表，不覆盖已发布的正文。首次启用时还需发布本目录生成的行程数据；仅执行 `schema.sql` 不会导入正文。

## 2. 配置微信云调用

在环境的「云调用」中开启**开放接口服务**，并在「微信令牌权限配置」允许：

- `/wxa/msg_sec_check`：检查昵称和评论。
- `/wxa/img_sec_check`：检查头像。

必须在开启后重新构建服务版本，才能生效。本服务通过容器内的 `http://api.weixin.qq.com` 调用这些接口，无需填写 AppSecret 或 access_token。检查失败时不会保存内容。

小程序使用的 `express-1zah` 应关闭**公网访问**，通过 `wx.cloud.callContainer` 访问；专用发布服务按上文单独配置。身份读取云托管网关注入的 `X-WX-SOURCE`、`X-WX-APPID`、`X-WX-OPENID`；请求体中的用户 ID 不参与身份判断。部署到普通服务器时不能直接沿用这种鉴权。

## 3. 上传代码并发布

进入「服务管理 → express-1zah → 部署发布」，选择「手动上传代码包」。上传**本目录内的文件**或它们的 zip 包，压缩包根目录应直接包含 `Dockerfile`、`package.json`、`package-lock.json`、`index.js` 等文件；不要上传整个 tourism 或小程序目录，也不要包含 `node_modules` 和 `.env`。

- 端口填 `80`。
- 目标目录留空。
- Dockerfile 路径填 `Dockerfile`。
- 数据库环境变量沿用第 1 步的配置。

构建并发布后，在业务日志中看到 `Travel journal service is ready` 即表示数据库表初始化完成、服务已监听。这里提供了源码和构建文件，仓库修改不会自动替你把版本发布到控制台。

## 4. 在小程序中验证

重新编译 `../xiaochengxu/`，进入大连行程详情：

1. 微信账号 A 选择头像、填写昵称并报名；切换日期仍显示已报名，因为报名属于整趟旅行。
2. A 在 10 月 1 日留言，切换到 10 月 2 日不应看到该留言。
3. 用账号 B 打开相同行程，能看到 A 的报名头像和 10 月 1 日的反馈；B 不能删除 A 的反馈。
4. 同一账号重复点击或网络重试不会重复报名、重复创建同一条反馈。
5. 重启服务或重新部署后，记录仍从 MySQL 读取。
6. 在数据库发布修改后的行程，下拉刷新首页和详情页即可看到新内容；断网后保留最近成功缓存，并显示当前未更新的提示。从微信分享打开数据库新增的旅行也能读取，无需包内存在该旅行。

微信后台的最低基础库至少设为 `2.26.0`，以支持云托管调用和头像压缩参数；当前项目调试基础库为 `3.7.8`。

## 数据保存方式

### 岩场路书

小程序通过云托管读取 `climbing_guidebooks`、`climbing_guidebook_sections`、`climbing_guidebook_section_intros` 和 `climbing_guidebook_pages`。图片以 JPEG 保存于数据库，每次只读取当前页，点击可放大；列表支持按岩场名和地点搜索。路书目录或页面更新后，在小程序重新进入路书页或下拉刷新即可看到，不需要更新小程序包。

首次启用须将本目录的新代码分别部署到 `express-1zah` 和已配置的专用发布服务，再上传并发布小程序。两个服务均连接同一数据库；服务启动时创建路书表。上传代码包时不要包含 `generated-guidebooks/`、`node_modules/` 或私有环境文件。

### 磕线记录与个人主页

活动详情中的磕线记录按用户、活动、日期、岩场及路线保存，不需要选择区域。每条记录代表一次尝试，心得可留空；个人主页统计不同活动数、顶绳与先锋次数，以及先锋视攀、闪攀或红点的去重路线数。路线去重依据岩场及 Unicode 规范化后忽略大小写的线路名；手动名称不同不会自动合并。删除记录后重新统计。`express-1zah` 和专用发布服务都需要部署新后端，小程序也需发布新版本。

个人主页折线图从首条记录的保存日期起，每 7 天累计一次，红线为先锋、蓝线为顶绳、黑线为二者合计；日期标签及纵轴随数据范围调整。补录历史活动时记录会计入保存日期，不代表实际活动发生日期。

线路目录存入 `climbing_routes`，与路书图片分开维护：发布路书不会自动提取或发布线路。活动页可搜索并单选，未找到时可手动输入；个人路线回顾只允许选择本人已有记录，包括手动输入的路线。更新路书后应检查线路目录是否需要同步更新。以路书为准人工核对名称、归属和难度，按 `guidebooks/meigu-routes.json` 格式整理，再运行：

```sh
cd /Users/looyifan/Workspace/tourism/cloudrun
node --env-file="$HOME/.config/tourism/publish.env" scripts/publish-climbing-routes.mjs guidebooks/meigu-routes.json
```

JSON 包含岩场 `guideId` 和 `routes` 数组，每条线路填写 `name`、`grade`，可填写已有区域的 `sectionId`。发布前先发布对应路书；发布会事务替换该岩场的整个线路目录，不删除磕线记录。各目录文件为 `meigu-routes.json`、`shiziyan-lower40-routes.json`（包含狮子岩五个区域）、`tiandiyan-routes.json`、`shigoudong-routes.json` 和 `baizhangyan-routes.json`。为任何岩场增加线路时，先将已有线路与新线路合并，再一起发布，避免覆盖其他区域的目录。没有可辨识名称的线路不纳入目录；来源明确使用编号作为名称的线路保留编号。原资料中的其他难度格式不在用户指定的选项中时，保存原难度或空 `grade`，当前表单不能自动选择或填写不支持的难度。检查发布回执中的岩场 ID 和数量，再到磕线记录页面搜索抽查；失败时不能宣称已写入数据库。

路线回顾直接展示该路线的原始心得及记录保存时间。此前的总结接口已移除，数据库中已有的总结表不会自动删除；如自行配置过 OpenClaw 定时任务，需在 OpenClaw 中停止。

### 新增和更新路书

#### 内容和排版

1. 先逐页核对用户提供的 PDF，区分独立岩场和各岩场的区域；每个岩场建立一本路书，每个区域对应一个切换栏目。多个 PDF 属于同一岩场时合并到同一本路书，不同岩场分别发布。
2. 使用稳定且唯一的小写英文、数字和连字符 ID，更新同一岩场时沿用原 ID。标题、地点和描述应包含用户可能搜索的岩场名及地点；不要凭空补充来源没有的路线、难度、挂片、交通或安全信息。
3. 优先设置 ID 为 `intro`、标题为「岩场介绍」的首个栏目：用文字概括来源中的位置、到达方式、岩场概况和必要提示，并放入适合整座岩场的总览图或进场示意图。标明资料来源及版本或日期（有提供时）。不要把全岩场总图误放到某一个区域。
4. 每个区域使用来源中的名称；有区域概况、朝向、抵达或注意事项时，整理为 `intro` 文字，作为该区域的独立首页，不直接用 PDF 介绍页截图。没有可靠信息时不编造，也不强行设置介绍。
5. 线路页尽量做到一张岩壁或线路示意图紧接其对应线路说明；跨 PDF 页的内容按原顺序拼接，保留编号、难度、长度、挂片、定线、首攀和安全提示，避免裁掉文字或线路标注。先人工核对图片中的编号与线路表；来源缺图、截断或信息不全时保留已有内容并向用户说明，不自行猜测补全。
6. 去掉与线路无关的网页导航、广告、空白和不需要的致谢；若用户要求保留内容，以用户要求为准。保留必要的作者、来源和路线相关说明。图片可裁切空白及无关区域，但不能改变或遮挡线路信息；检查文字在手机上可读，并可点击放大。

#### 数据准备

- 单 PDF 可使用 `scripts/prepare-guidebook.py`，以 `guidebooks/meigu-layout.json` 和 `guidebooks/meigu-sections.json` 为例。多 PDF 或需要按矩形裁切时使用 `scripts/prepare-multi-guidebook.py`，以 `guidebooks/shiziyan.json` 和新昌三份配置为例；一个 PDF 对应一个区域时也应归入同一岩场配置。
- 多 PDF 配置的 `sections` 每项包括 `id`、`title`、原 PDF 文件名 `pdf` 和 `pages`。每个 `pages` 元素是一组顺序拼接的片段，片段的 `page` 为从 1 开始的原 PDF 页码，`rect` 为 `[左, 上, 右, 下]`，以页面宽高的 0–1 比例表示。`intro` 是 `{ "label": "标题", "text": "内容" }` 数组，可在数据库更新；`intro` 栏目将文字与首张总览图一起显示，其他带 `intro` 的区域先显示文字，再翻页显示线路。
- 图片从原 PDF 重新渲染，单 PDF 脚本使用 2.25 倍、JPEG 质量 83，多 PDF 脚本使用 3 倍、JPEG 质量 87。应从原 PDF 而非已压缩的中间图片生成，并检查放大后的清晰度及发布大小限制；原 PDF 中低分辨率图片的细节无法凭提高渲染分辨率恢复。
- 单 PDF 的 `startPage`、`endPage` 指组合后的页码，从 1 开始，范围必须按顺序且不重叠。未提供区域时默认为全部页面。每本路书最多 100 张 JPEG、每张约不超过 1 MB，发布请求不超过 16 MB；转换后检查区域范围、页数、裁切和拼接。当前图片中的线路文字不可单独搜索或复制。
- 转换结果和 SQL 保存在 Git 忽略的 `generated-guidebooks/`；维护可复用的配置、脚本与必要文档。用户提供的原 PDF 路径可能不同，运行前确认文件实际位置。

#### 封面

- 首页卡片的图标应使用对应岩场的封面；已有封面优先复用。用户提供参考照片时，可沿用 `xiaochengxu/scripts/generate-covers.py` 的插画风格制作，并在 `docs/travel/README.md` 记录来源、生成方式和存放位置。封面是展示图，不替代岩壁线路示意图。
- 当前路书封面映射写在 `xiaochengxu/pages/guidebooks/index.js`，新增或修改映射属于小程序功能代码变更，需要发布小程序；包内封面放在 `xiaochengxu/static/`，新增或替换包内图片同样需要发版。没有映射或加载失败时显示默认图标。
- 行程封面与路书数据分别维护。若确有对应行程，使用已打包图片或已配置合法域名、可公开访问的 HTTPS 图片，并遵循行程 SQL 发布规则；没有行程时只准备可复用封面，不凭空新增行程。需要在不重新发布小程序的情况下使用新封面时，先上传到可用的 HTTPS 存储，再发布引用该地址的行程数据。

#### 发布和检查

1. 按下方示例生成 JSON 和 SQL，检查路书 ID、标题、来源、区域顺序、页面范围和图文对应。先查看生成页面，尤其是跨页拼接、首尾裁切和原文中模糊的路线。
2. 已配置 `~/.config/tourism/publish.env` 且路书服务已部署时，主动运行 `scripts/publish-guidebook.mjs` 发布。脚本生成 SQL 备份，通过受保护接口以事务更新单本路书的正文、区域和图片，并回读核对；不要输出或提交令牌。超时不代表一定没有提交，可安全重试并检查回执。
3. 若没有可用发布服务或请求失败，仍生成 SQL 备份，明确告知用户尚未写入云端，并提供文件路径与 MySQL 控制台执行方法。SQL 包含建表及单本路书的事务，应完整执行到 `COMMIT;`；不要将生成文件成功当作发布成功。
4. 确认发布回执的 ID、版本和页数，并检查数据库中的栏目和文字介绍；在小程序重新进入路书页或下拉刷新，检查搜索、区域切换、文字首页、线路翻页与图片放大。首次上线或涉及小程序代码、包内资源、后端代码时，分别完成相应部署和发布；仅修改已支持的数据无需重新发布小程序或后端。
5. 检查并按上方「磕线记录与个人主页」更新该岩场的线路目录；路书图片和可搜索线路是两份独立数据。

用于数据库核验时，把以下 `meigu` 替换为本次路书 ID，并与源配置逐项比对：

```sql
SELECT guide_id, title, version, page_count, published FROM climbing_guidebooks WHERE guide_id = 'meigu';
SELECT COUNT(*) AS pages, SUM(OCTET_LENGTH(image)) AS image_bytes FROM climbing_guidebook_pages WHERE guide_id = 'meigu';
SELECT section_id, title, start_page, end_page FROM climbing_guidebook_sections WHERE guide_id = 'meigu' ORDER BY section_order;
SELECT section_id, intro FROM climbing_guidebook_section_intros WHERE guide_id = 'meigu';
```

准备和发布路书需要 Python 3、`pypdfium2`、Pillow 及 Node.js 22 或更高版本。下面是梅谷示例；新增或更新其他岩场时替换 PDF 路径、ID、标题、地点和描述，同一岩场始终使用相同 ID：

```sh
cd /Users/looyifan/Workspace/tourism/cloudrun
python3 -m pip install pypdfium2 Pillow
python3 scripts/prepare-guidebook.py '/Users/looyifan/Downloads/梅谷路书.pdf' --id meigu --title '梅谷岩场' --location '浙江 · 金华 · 东阳' --description '水库旁的峡谷岩场，包含东西两侧岩壁与线路资料。路书更新于 2026 年 6 月。' --layout guidebooks/meigu-layout.json --sections guidebooks/meigu-sections.json --output generated-guidebooks/meigu.json
node --env-file="$HOME/.config/tourism/publish.env" scripts/publish-guidebook.mjs generated-guidebooks/meigu.json
```

`--layout` 可按配置将 PDF 页面或片段依次拼为一页，格式见 `guidebooks/meigu-layout.json`；页码从 1 开始，`vertical` 使用上下边界的比例。梅谷的每面岩壁与对应线路表放在同一页。区域通过 `--sections` 指定 JSON 配置，格式见 `guidebooks/meigu-sections.json`：每项包含唯一的英文 `id`、显示名称 `title`、组合后的页码 `startPage` 和 `endPage`；区域按页码排列且不能重叠，可以留空不需要显示的页。不指定时显示全部页面。梅谷显示介绍、西侧、东侧，最后一页致谢不展示。修改区域或组合只需重新准备和发布数据。

如果尚未部署专用发布服务，可在发布脚本后添加 `--sql-only`，将生成的 SQL 完整导入 MySQL 的 `nodejs_demo` 库作为备用。生成 SQL 并不代表云端已更新。梅谷应为 21 页（包括不展示的致谢页），且图片字节数大于零；按上面的查询核验。线路资料与现场状况可能不同，请参照原路书的行为准则。

狮子岩路书使用多份 PDF 和 `guidebooks/shiziyan.json`，每份文件对应一个区域，配置中的 `rect` 是原 PDF 页面的左右上下裁剪比例。更新时保持原文件名，重新执行：

```sh
cd /Users/looyifan/Workspace/tourism/cloudrun
python3 scripts/prepare-multi-guidebook.py --config guidebooks/shiziyan.json --source-dir /Users/looyifan/Downloads --output generated-guidebooks/linan-shiziyan.json
node --env-file="$HOME/.config/tourism/publish.env" scripts/publish-guidebook.mjs generated-guidebooks/linan-shiziyan.json
```

每个区域可配置 `intro`，按 `label` 和 `text` 写入可更新的文字介绍；总体介绍区同时显示总览图片，其他区域介绍独立显示在线路图片之前。首次启用文字介绍需重新部署读取服务和发布服务，并更新小程序。旧发布服务会忽略文字介绍，切勿在升级前用它发布带介绍的数据。

新昌天地岩、石狗洞、百丈岩分别使用 `guidebooks/tiandiyan.json`、`guidebooks/shigoudong.json`、`guidebooks/baizhangyan.json`；以对应配置文件及原 PDF 目录运行同一个 `prepare-multi-guidebook.py`，并用 `publish-guidebook.mjs` 发布生成的 JSON。三本路书各自拥有独立 ID，更新其中一本不会覆盖其他路书。

报名按「整趟旅行 + 微信用户」唯一，评论按「旅行 + 日期」分页，每页 20 条，仅作者可删除。成员区展示最近三位报名者。头像和昵称显示当前资料，修改后已有报名和反馈同步显示新资料。

头像压缩为 128 × 128 的 JPEG 缩略图后保存在 MySQL，与资料和评论一起持久化。头像单独通过云调用读取，在设备上只缓存图片，不额外要求开通对象存储；清理图片缓存不会删除云端记录。旧的本机反馈不会自动上传。

MySQL 和容器均使用已开通环境里的资源，实际费用按控制台套餐和用量计算。这里不要求另开云开发环境。完整行程保存在 `travel_trips`，接口每次直接查询已上架内容，不使用容器文件或服务端缓存。允许报名的旅行和日期保存在 `travel_trip_days`，与内容同时发布。

## 首次启用联网行程

1. 在本目录运行 `npm run trip-sql`，打开「MySQL → 数据库管理」，选中 `MYSQL_DATABASE` 对应的库，执行生成的 `trip-registry.sql`。文件会补建行程表并导入当前所有旅行正文和日期；可以重复执行，不删除已有报名和评论。
2. 按第 3 节上传新的 `cloudrun-deploy.zip` 并发布，沿用现有环境变量。新版本必须包含 `trip-content.js`；Dockerfile 已同步更新。
3. 在开发者工具重新编译小程序，验证后上传体验版；正式版按微信流程审核、发布。这一步只需在首次切换联网行程时进行。
4. 用另一个微信账号验证行程、报名和评论，再在数据库更新一处文字，下拉刷新确认内容变化。

现有大连行程、报名和评论继续使用原有 ID，不需要重新报名。没有云端数据库连接或已登录的控制台时，本地生成 SQL 不代表已经写入云端；需在控制台执行后查询验证。

## 新增或修改旅行无需重新发版

1. 在 `../xiaochengxu/data/` 添加旅行数据，并在 `data/trips.js` 登记旅行列表。
2. 在本目录运行 `npm run trip-sql`（需要 Node.js 22 或更高版本），生成 `trip-registry.sql`。
3. 在云托管 MySQL 目标库执行该文件。生成器校验完整内容，使用十六进制 UTF-8 字面量保存中文、引号及换行，不依赖数据库的反斜杠转义模式；正文及日期登记在同一事务内更新。
4. 重新进入小程序或下拉刷新，即可看到新旅行及修改内容。无需重新发布小程序，也无需重新部署后端。

修改已有旅行也执行相同步骤；ID 保持不变，原有报名和评论即可继续关联。生成器不会删除本地入口中已经移除的旧旅行和日期；下架旅行请执行：

```sql
UPDATE travel_trips SET published = 0 WHERE trip_id = 'dalian-20261001';
```

下架仅隐藏行程列表和详情，不删除历史报名和评论。再次生成并执行包含该旅行的 SQL 会恢复上架。验证发布结果：

```sql
SELECT trip_id, JSON_UNQUOTE(JSON_EXTRACT(content, '$.title')) AS title,
       JSON_LENGTH(JSON_EXTRACT(content, '$.days')) AS days, published, updated_at
FROM travel_trips ORDER BY sort_order, trip_id;
SELECT trip_id, day_id FROM travel_trip_days ORDER BY trip_id, day_id;
```

旅行 ID 支持 1–64 个小写字母、数字、下划线和短横线；日期 ID 长度为 1–16。未登记的旅行或日期仍不能报名、评论。封面可复用现有包内图片，或使用已配置合法域名的 HTTPS 图片。新增包内图片、页面布局或功能代码仍需发版；本方案免除的是行程内容更新时的发布。

## 常见问题

- **提示服务尚未部署**：当前还是默认计数器服务，或者新版流量尚未切换，需部署本目录代码。
- **启动提示缺少 MYSQL 变量**：到服务设置补齐变量并重新部署；不要把密码填到 `config/cloud.js`。
- **`ER_BAD_DB_ERROR`**：目标数据库尚未创建，检查 `MYSQL_DATABASE` 并按第 1 步建库。
- **`ER_ACCESS_DENIED_ERROR`**：账号或密码不匹配，检查控制台变量；重置密码后也要更新变量并发布新版本。
- **数据库刚唤醒时失败**：稍等后点击页面的重新加载。服务启动也会短暂重试数据库连接。
- **内容检查不可用**：检查开放接口服务开关、上述两个接口权限，并确保服务版本是在开启后重新构建的。

官方说明：[部署发布](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/guide/service/online.html)、[开放接口服务](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/guide/weixin/open.html)、[小程序调用](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/development/call/mini.html)。
