# HAHA Vending · Location Pitch Builder

一个面向美国终端运营商（Operator）的点位开发与商务提案工具原型。使用原生 HTML / CSS / JavaScript，无需安装依赖或后端服务，可直接部署到 GitHub Pages。

## 当前版本包含

1. **点位评估**：填写点位基本信息，按 7 个维度进行 1–5 分评分，并按权重生成 100 分制结果和下一步建议。
2. **ROI 与收益测算**：根据日均销售商品件数、平均商品售价、商品成本率、物业分成、租金及其他运营成本，估算物业收入、运营商收益、回本周期和测算期 ROI。
3. **商业提案生成**：表单内容实时生成物业合作提案，可打印或导出为独立 HTML 网页文件。
4. **合规文件中心**：管理 UL/ETL、NSF、FCC、ADA 说明、COI、W-9 等文件链接；支持自定义补充资料。
5. **本地项目管理**：项目、测算与文件链接元数据保存在当前浏览器的 `localStorage`。

## 本地预览

本项目使用 ES Modules，建议通过本地静态服务器运行（不要直接双击 `index.html`，部分浏览器会限制本地模块加载）。

推荐使用 VS Code Live Server 或 Python 本地服务器：

```bash
# 在项目根目录运行
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 发布到 GitHub Pages

1. 在 GitHub 创建一个新的空仓库，例如 `location-pitch-builder`。
2. 将本文件夹中的所有文件和目录上传到仓库根目录（确保 `index.html` 在根目录）。
3. 进入仓库 **Settings → Pages**。
4. 在 **Build and deployment** 中选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/ (root)`，点击 Save。
6. 等 GitHub Pages 发布完成后，访问页面显示的站点地址。

本项目使用相对路径引用 CSS 和 JS，可以部署在 GitHub Pages 的项目子路径中。

## 目录结构

```text
location-pitch-builder/
├── index.html                 # 页面结构：导航、各模块表单、预览区域
├── README.md                  # 运行与部署说明
├── styles/
│   └── main.css               # 全局样式、布局、响应式适配
├── js/
│   ├── app.js                 # 应用入口：导航、项目管理、页面数据联动
│   ├── data.js                # 默认数据、评分权重、金额格式化、安全转义
│   ├── storage.js             # localStorage 本地存储
│   ├── scorer.js              # 点位评分计算与展示
│   ├── roi.js                 # ROI 公式和结果渲染
│   ├── proposal.js            # 提案预览与独立 HTML 导出
│   └── compliance.js          # 合规文件卡片、链接和临时附件预览
└── assets/
    ├── certificates/          # 可放公开认证文件（不要放敏感 W-9 / 保单）
    └── images/                # 可放官方机器图、场景图、Planogram 图片
```

## 代码修改位置速查

| 想修改的内容 | 对应文件 |
|---|---|
| 点位评分项、权重、默认分值 | `js/data.js` |
| 点位评分公式和评级区间 | `js/scorer.js` |
| ROI 收益计算公式 | `js/roi.js` 的 `calculateROI()` |
| Proposal 的文案与版式结构 | `js/proposal.js` |
| 合规文件分类和说明文字 | `js/data.js` 的 `DEFAULT_DOCS` |
| 文件链接及临时预览逻辑 | `js/compliance.js` |
| 页面布局和颜色 | `styles/main.css` |
| 左侧导航、各页面 HTML 结构 | `index.html` |
| 项目之间如何联动、保存 | `js/app.js` |

## 重要说明与限制

- **本地数据**：数据保存在当前浏览器。清理浏览器站点数据、换浏览器或换设备后，项目数据不会自动迁移。建议后续增加 JSON 导入 / 导出备份。
- **文件附件**：合规中心“本地预览”只在当前浏览器会话暂时打开文件，不会把文件二进制保存进 `localStorage`。正式使用建议上传到权限受控的 Google Drive，再填写文件链接。
- **敏感文件**：W-9、COI 等资料不要放进公开 GitHub 仓库或公开静态网站。请使用访问权限受控的云端目录。
- **认证准确性**：UL/ETL、NSF、FCC 等资料必须以 HAHA 实际持有且适用于相应机型的文件为准。ADA 卡片定位为无障碍合规说明，不将其冒称为认证。
- **ROI 模型**：当前是初步经营模型，尚未纳入税费、支付手续费、设备折旧、融资成本、库存损耗等所有变量。页面计算结果仅供商务沟通前的情景测算，不是收益承诺。
- **提案分享**：导出按钮下载的是独立 HTML 文件，不会自动生成公共 URL。可将导出的提案文件部署到公司允许的网页托管位置后分享。

## 建议后续迭代

1. 增加 JSON 项目备份 / 恢复。
2. 接入真实 HAHA 机器型号图片、机器参数和官方品牌素材。
3. 将评分权重、成本假设设置成可配置项，并通过真实运营数据校准。
4. 接入权限控制的 Google Drive / 公司文件中心，自动归档合规资料。
5. 增加 Operator 公司资料、联系方式和可复用的 Proposal 模板。
