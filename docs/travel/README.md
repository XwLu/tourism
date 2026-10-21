# 岩场插画封面

以下四张封面参考提供的岩场照片，用现有 Pillow 绘图脚本绘制，保持一致的扁平造型、柔和配色和纸张颗粒。均为 720 × 960 的 RGB JPEG，不含标题、截图界面或水印；首页卡片只展示图片，标题、标签和日期放在图片下方。

图片已上传至微信云托管对象存储的 `travel_pic` 文件夹，以下去除 `sign`、`t` 参数后的 HTTPS 地址已验证可公开访问。临安行程已使用对应云端图片；后续新建其他旅行时，旅行及当天的 `cover` 均可直接使用对应地址。

| 岩场 | 文件 | 云端图片 | 画面特征 |
| --- | --- | --- | --- |
| 临安狮子岩 | `linan-shiziyan.jpg` | [公开地址](https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/linan-shiziyan.jpg) | 赭色岩壁、攀爬者、竹林山谷与村落 |
| 东阳梅谷 | `dongyang-meigu.jpg` | [公开地址](https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/dongyang-meigu.jpg) | 两侧岩壁与一线天，攀爬者位于右侧岩壁，底部为林谷 |
| 新昌百丈岩 | `xinchang-baizhangyan.jpg` | [公开地址](https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/xinchang-baizhangyan.jpg) | 浅赭色岩柱与纵向岩缝，树叶围合，包含攀爬者与保护者 |
| 衢州两头洞 | `quzhou-liangtoudong.jpg` | [公开地址](https://7072-prod-d7gikpjuqf33d2a1c-1512169535.tcb.qcloud.la/travel_pic/quzhou-liangtoudong.jpg) | 巨大洞口、远山树林、洞内栈道与阶梯 |

在项目根目录执行以下命令，生成这四张上传用封面，默认输出到本目录：

```sh
python3 xiaochengxu/scripts/generate-covers.py --only linan-shiziyan dongyang-meigu xinchang-baizhangyan quzhou-liangtoudong
```

`--only` 可以指定一张或多张；`--output` 可覆盖输出目录。不带 `--only` 时，原有大连封面和地图标记生成到 `xiaochengxu/static/travel/`，上述四张云端封面生成到本目录。

重新生成图片后，将需要更新的 `.jpg` 文件上传至微信云托管的「对象存储 → 存储管理 → travel_pic」。需要替换已有云端图片时，建议使用新文件名，以免命中旧图缓存。验证不带临时签名的 HTTPS 地址可以公开访问后，同步更新本清单及对应旅行和当天的 `cover`，再生成并执行行程 SQL。

本目录只准备图片，不新增旅行或日期。图片放在小程序打包目录之外，上传云存储后由行程数据引用。
