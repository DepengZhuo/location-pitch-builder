# Location Pitch Builder (Fixed Bilingual Edition)

智能零售柜点位评估、点位方收益测算、商业提案生成与合规文件中心。

## 本次修复内容说明

1. **修复 `js/i18n.js` 语法/函数闭合与 `MutationObserver` 循环阻塞问题**：
   - 增加 `isTranslating` 互斥锁，避免 DOM 翻译更新时触发 `MutationObserver` 递归死循环导致主线程卡死。
   - 修复中英文双向切换（`中文 <-> EN`）时的文本还原与动态节点更新覆盖问题，注册 `onLanguageChange` 回调自动重绘评分拆解、ROI 测算说明、提案实时预览、合规文件卡片及工作台统计。
2. **修复 `<select>` 选项值被翻译覆盖导致联动失效问题**：
   - 为所有 `<option>` 锁定原始业务 `value`，在切换为英文时仅翻译显示文本而不篡改 `option.value`，保证场地类型推荐联系对象、ROI 合作方式切换及提案同步正常运作。
3. **修复工作台“最近项目”列表“打开”按钮无法点击的问题**：
   - 在 `updateDashboard()` 渲染 `#recentProjects` 后绑定 `[data-open-project]` 点击事件，确保在工作台可直接点击打开任意最近项目。
4. **使用页面内弹窗替代原生 `prompt()` / `confirm()` / `alert()`**：
   - 新增合规文件链接编辑弹窗（`#complianceModal`）与删除项目确认弹窗（`#deleteConfirmModal`），避免现代浏览器或嵌入式沙盒拦截原生弹窗导致按钮点击无响应。

## 本地运行方式

由于项目采用原生 ES Modules (`<script type="module" src="./js/app.js"></script>`)，直接双击 `index.html`（`file://` 协议）会被浏览器的 CORS 策略拦截模块加载。请使用任意本地静态服务器打开：

```bash
# 方式 1：使用 Python 内置 HTTP 服务
python3 -m http.server 8080
# 然后在浏览器访问 http://localhost:8080

# 方式 2：使用 VS Code Live Server 插件右键 index.html -> Open with Live Server
```
