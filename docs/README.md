# RogueZ 项目文档

## 仓库里有没有 docs？

当前仓库内 **`docs/`** 下除本文件外，另有：

- **[经济系统](./ECONOMY.md)** — 金币、商店、转盘权重与重复宠物折现等  
- **[词汇表](./GLOSSARY.md)** — `phase` / `runMode`、武器与敌人 type、宠物 key、拾取类型、`i18n` 前缀速查  
- **[难度与敌人曲线](./DIFFICULTY.md)** — 波次时间、血量/攻击力公式、刷怪间隔与数量、BOSS 与类型权重  

本文档概括 **玩法与近期新增功能**；数值与标识细节以上两文件与 `game.js` / `i18n.js` 为准。

---

## 主模式（生存肉鸽）

- 入口：主菜单 **开始游戏** → `startRun()`，`state.runMode === "normal"`。
- 波次、刷怪、经验升级、排行榜结算等逻辑仅在普通模式下运行。

---

## 训练场模式

- **入口**：主菜单 **训练场** → `startTrainingRun()` → `resetRunState({ training: true })`。
- **标识**：`state.runMode === "training"`，游戏阶段仍为 `playing`，因此暂停、冲刺、Q 轮盘等与主模式共用大部分逻辑。
- **规则摘要**：
  - 不推进波次、不刷野外尸潮；**不计击杀/分数**（HUD 显示为「—」）；**不获得经验**；**不弹升级三选一**。
  - **武器**：同一时间 **只持有一把枪**；在北排 **武器台** 旁（距离 ≤ `TRAINING_STALL_INTERACT`）按 **E** 拾取，会 **整把替换** 为对应武器，等级为 `TRAINING_WEAPON_LEVEL`（默认 3）。
  - **靶子**：多只僵尸关在带 `enemy.cage` 的矩形区内，**笼内游荡**，**不对玩家造成近战伤害**；死亡后在同笼 **立即重生**。
  - **射程**：训练场内由 `getPlayerWeaponStats()` 将武器 **`range` 乘以 `TRAINING_WEAPON_RANGE_MUL`（2.1）**，便于在武器台附近射击北侧笼内目标。
  - **失败**：`triggerGameOver` 在训练场会 **回满生命** 并提示，不写排行榜。
- **地图绘制**：`drawTrainingArena()` 绘制笼区虚线框、武器台色块与图标；可交互时在摊位上方绘制 **E** 提示。
- **相关常量**：`TRAINING_STALL_INTERACT`、`TRAINING_WEAPON_LEVEL`、`TRAINING_WEAPON_RANGE_MUL`；布局见 `initTrainingLayout()`。

---

## 武器轮盘（战斗中）

- **触发**：`playing` 且按住 **Q**（`keys.has("q")`），`keydown` 对 Q 使用 `preventDefault` 避免浏览器抢占。
- **表现**：`drawWeaponWheel()` 在画布上绘制；扇形总张角为 `min(2π, n·π/2)`（1 把 90°，4 把及以上为整圆），**朝上固定**（不随瞄准旋转）；每把武器为 **环形扇区**，配色为图鉴 accent，图标为浅色 SVG。
- **武器数量**：最多展示 **8** 把（`weapons.slice(0, 8)`）。
- **文案**：`i18n` 中 `controls.weaponWheel` / `controls.weaponWheel.keys`；已移除全屏遮罩与底部「松开 Q」提示行。

---

## 操作说明 UI

- 设置 → **操作方式** 使用 `.settings-controls-row` 网格；左侧标题 `max-content` + `white-space: nowrap`，避免「武器轮盘」等被压成竖排（见 `style.css`）。

---

## 文案与本地化

- 字符串集中在 **`i18n.js`**（`window.RogueZI18n`），`game.js` 内通过 `t(key, vars)` 插值。
- 训练场、武器轮盘、菜单项等键名可在 `i18n.js` 中搜索 `training.`、`controls.weaponWheel`、`menu.training` 等。

---

## 相关文件

| 区域 | 主要文件 |
|------|-----------|
| 核心逻辑 | `game.js` |
| 文案 | `i18n.js` |
| 样式（含操作说明行、HUD 壳） | `style.css` |
| 页面结构 | `index.html` |

经济与设计词汇已拆至 **`ECONOMY.md`**、**`GLOSSARY.md`**（见上文链接）。
