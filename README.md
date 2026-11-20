# Location Pitch Builder | HAHA Vending

智能零售柜点位评估、点位方收益测算、商业提案生成与合规文件中心。

纯静态站点（原生 ES Module，无构建步骤），直接用浏览器打开 `index.html` 即可使用。

## 项目结构

```
location-pitch-builder/
├── index.html            # 单页入口：全部界面区块与表单
├── js/
│   ├── app.js            # 入口模块：初始化、事件绑定、模块装配
│   ├── data.js           # 机型参数、场地类型、默认合规文件等基础数据
│   ├── i18n.js           # 中英文文案与语言切换
│   ├── scorer.js         # 点位评分与开店准备度
│   ├── roi.js            # 点位方收益测算
│   ├── proposal.js       # 商业提案生成 / 导出 HTML / 打印
│   ├── compliance.js     # 合规文件中心
│   └── storage.js        # localStorage 持久化
├── styles/
│   └── main.css          # 全站样式
└── assets/
    ├── images/           # 机型正视图 / 侧视图
    ├── site_images/      # 各类场地场景配图
    └── certificates/     # 认证证书 PDF 与认证 logo
```

## 本地预览

因为使用了 ES Module，`file://` 方式打开会被浏览器拦截，请用任意静态服务器：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 最新版本更新亮点（v5）

1. **点位方收益测算模块全新升级（参考 `partner-benefits-earnings-v4` 逻辑）**：
   - **`01 点位与销售预估 (Location & Sales Assumptions)`**：聚焦点位名称、场地类型、预估日均销售件数、平均商品售价、每月营业天数及 **合作期限（直接输入数字月份）** 六大核心参数，剔除无关的内部成本核算项。
   - **`02 合作模式设置 (Partnership Setup)`**：提供 **按销售额分成 (`%`)**、**固定月租 (`$`)**、**纯便民配套 (`✦`)** 三选一卡片式切换，动态展示对应参数或说明。
   - **`Estimated Monthly Partner Earnings` 实时汇总面板**：突出展示物业预计月收益、预计年收益、合作期累计总收益，以及预计月销售额、合作模式与合作期限 3 行明细，点击底部“下一步：创建商业提案 →”即可一键带入商业提案并滚回页面最顶端。
