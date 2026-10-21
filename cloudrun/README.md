# 微信云托管：阿帆的旅行账本

本目录是可独立部署的 Express 服务，替换 `express-1zah` 中原来的计数器示例。小程序已对接 `/api/community`；只有部署成功后，报名与反馈才会在不同用户之间共享。

| 项目 | 值 |
| --- | --- |
| AppID | `wx5dbd496f801eca64` |
| 云托管环境 | `prod-d7gikpjuqf33d2a1c` |
| 服务名称 | `express-1zah` |
| 容器端口 | `80` |
| Dockerfile | `Dockerfile` |
| 健康检查路径 | `/health` |

## 1. 填写数据库环境变量

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

服务启动时自动创建 `travel_trip_days`、`travel_profiles`、`travel_members`、`travel_comments` 四张表，并补入大连六天的登记记录，不修改计数器表，不清空已有报名和评论。也可以先选中目标库手动执行本目录的 `schema.sql`。

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

微信后台的最低基础库至少设为 `2.26.0`，以支持云托管调用和头像压缩参数；当前项目调试基础库为 `3.7.8`。

## 数据保存方式

报名按「整趟旅行 + 微信用户」唯一，评论按「旅行 + 日期」分页，每页 20 条，仅作者可删除。成员区展示最近三位报名者。头像和昵称显示当前资料，修改后已有报名和反馈同步显示新资料。

头像压缩为 128 × 128 的 JPEG 缩略图后保存在 MySQL，与资料和评论一起持久化。头像单独通过云调用读取，在设备上只缓存图片，不额外要求开通对象存储；清理图片缓存不会删除云端记录。旧的本机反馈不会自动上传。

MySQL 和容器均使用已开通环境里的资源，实际费用按控制台套餐和用量计算。这里不要求另开云开发环境。允许报名的旅行和日期保存在 MySQL 的 `travel_trip_days` 表中，每次请求直接查询数据库，新增登记无需重启服务或重新发布后端。

## 新增旅行时无需重新部署后端

本次升级需要上传新的后端代码包并发布一次。升级会自动增加行程登记表，现有大连行程、报名和评论继续使用原有 ID，不需要重新报名。旧的 `trips.json` 已移除。

以后新增旅行，流程如下：

1. 在 `../xiaochengxu/data/` 添加旅行数据，并在 `data/trips.js` 登记旅行列表。
2. 在本目录运行 `npm run trip-sql`（需要 Node.js 22 或更高版本），生成 `trip-registry.sql`。
3. 打开云托管「MySQL → 数据库管理」，选中 `MYSQL_DATABASE` 对应的数据库，将生成的 SQL 粘贴到 SQL 窗口执行。它只补充登记记录，可以重复执行，不删除已有报名和评论。
4. 上传新的小程序体验版；正式版按微信流程审核、发布。云托管服务不需要重新部署。

例如，登记一趟新旅行的两个日期，可以直接执行：

```sql
INSERT INTO travel_trip_days (trip_id, day_id) VALUES
  ('beijing-20270501', '05-01'),
  ('beijing-20270501', '05-02')
ON DUPLICATE KEY UPDATE day_id = VALUES(day_id);
```

其中 ID 必须与小程序数据完全一致。旅行 ID 支持 1–64 个小写字母、数字、下划线和短横线；日期 ID 支持同样字符，长度为 1–16。未登记的旅行或日期仍然不能报名、评论。登记操作在数据库控制台完成，小程序用户没有新增登记的接口。

新增日期同样只需生成并执行登记 SQL。生成器只补充当前数据中的记录，不会自动删除已经移除的日期，也不会修改用户反馈。行程正文目前仍随小程序打包，因此本次升级消除的是后端发布步骤；修改接口或功能代码时才需要重新发布后端。

## 常见问题

- **提示服务尚未部署**：当前还是默认计数器服务，或者新版流量尚未切换，需部署本目录代码。
- **启动提示缺少 MYSQL 变量**：到服务设置补齐变量并重新部署；不要把密码填到 `config/cloud.js`。
- **`ER_BAD_DB_ERROR`**：目标数据库尚未创建，检查 `MYSQL_DATABASE` 并按第 1 步建库。
- **`ER_ACCESS_DENIED_ERROR`**：账号或密码不匹配，检查控制台变量；重置密码后也要更新变量并发布新版本。
- **数据库刚唤醒时失败**：稍等后点击页面的重新加载。服务启动也会短暂重试数据库连接。
- **内容检查不可用**：检查开放接口服务开关、上述两个接口权限，并确保服务版本是在开启后重新构建的。

官方说明：[部署发布](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/guide/service/online.html)、[开放接口服务](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/guide/weixin/open.html)、[小程序调用](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/development/call/mini.html)。
