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

服务启动时自动创建 `travel_trips`、`travel_trip_days`、`travel_profiles`、`travel_members`、`travel_comments` 五张表，不修改计数器表，不清空已有报名和评论。`travel_trips` 保存整趟旅行及全部日期的 JSON 内容；服务重启只建表，不覆盖已发布的正文。首次启用时还需执行本目录生成的 `trip-registry.sql` 导入完整行程，目前包含大连六日、临安狮子岩一日两趟旅行；仅执行 `schema.sql` 不会导入正文。

## 2. 配置微信云调用

在环境的「云调用」中开启**开放接口服务**，并在「微信令牌权限配置」允许：

- `/wxa/msg_sec_check`：检查昵称和评论。
- `/wxa/img_sec_check`：检查头像。

必须在开启后重新构建服务版本，才能生效。本服务通过容器内的 `http://api.weixin.qq.com` 调用这些接口，无需填写 AppSecret 或 access_token。检查失败时不会保存内容。

本服务只供小程序使用，在「服务设置」中关闭**公网访问**，使用 `wx.cloud.callContainer` 访问。身份读取云托管网关注入的 `X-WX-SOURCE`、`X-WX-APPID`、`X-WX-OPENID`；请求体中的用户 ID 不参与身份判断。部署到普通服务器时不能直接沿用这种鉴权。

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

报名按「整趟旅行 + 微信用户」唯一，评论按「旅行 + 日期」分页，每页 20 条，仅作者可删除。成员区展示最近三位报名者。头像和昵称显示当前资料，修改后已有报名和反馈同步显示新资料。

头像压缩为 128 × 128 的 JPEG 缩略图后保存在 MySQL，与资料和评论一起持久化。头像单独通过云调用读取，在设备上只缓存图片，不额外要求开通对象存储；清理图片缓存不会删除云端记录。旧的本机反馈不会自动上传。

MySQL 和容器均使用已开通环境里的资源，实际费用按控制台套餐和用量计算。这里不要求另开云开发环境。完整行程保存在 `travel_trips`，接口每次直接查询已上架内容，不使用容器文件或服务端缓存。允许报名的旅行和日期保存在 `travel_trip_days`，与内容同时发布。

## 首次启用联网行程

1. 在本目录运行 `npm run trip-sql`，打开「MySQL → 数据库管理」，选中 `MYSQL_DATABASE` 对应的库，执行生成的 `trip-registry.sql`。文件会补建行程表并导入当前所有旅行正文和日期，目前为两趟旅行、七个日期；可以重复执行，不删除已有报名和评论。
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
