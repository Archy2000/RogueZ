# 功能库（未接入主流程）

本文档存放**已从当前版本 `game.js` 主流程中移除**、但保留设计与实现要点，便于日后重新接入的功能说明。

维护约定：若将某功能重新并入游戏，请从本文删除对应章节，并同步更新 [`GLOSSARY.md`](GLOSSARY.md)、[`i18n.js`](../i18n.js) 与 UI（如 `index.html` / `style.css`）。

---

## 超载推进（Overdrive）

### 设计摘要

- **定位**：局内被动升级项，`passiveStacks.overdrive` 叠层；与「空格冲刺」互斥（有叠层时禁用 `tryStartDash`）。
- **触发**：战斗中按空格（非长按），每次 **5s** 加速窗口，结束后 **7s** 冷却；背包打开时不可触发。
- **移动**：加速期间沿 `facing` 自动前进，**A/D**（及左右方向键、摇杆水平 `touch.x`）横向位移；拖尾使用橙金色粒子（`SPRINT_TRAIL_COLORS`），与冲刺拖尾共用 `spawnDirectedTrailParticles`。
- **结束**：持续时间归零时施加短暂 **coast**（沿末帧速度方向冲量），并开始冷却。
- **HUD**：左侧 HUD 下方面板显示剩余加速时间 / 冷却进度（`#overdriveHud` 等）。

### 恢复时需在代码中接回的大致清单

1. **`game.js`**
   - 常量：`OVERDRIVE_DURATION`、`OVERDRIVE_COOLDOWN`、`SHIFT_SPRINT_MULT_*`、`SPRINT_COAST_*`、`SPRINT_TRAIL_COLORS`。
   - `spawnSprintTrailParticles`（内部调 `spawnDirectedTrailParticles`）。
   - `getHorizontalStrafeInput`。
   - `tryActivateOverdriveBoost`；`tryStartDash` 内当 `passiveStacks.overdrive > 0` 时 return。
   - `createPlayer`：`passiveStacks.overdrive`，`coastVx/Vy`，`overdriveBoostLeft`，`overdriveCooldown`，`_lastSprintDirX/Y`。
   - `updatePlayer`：coast 衰减；超载分支移动与拖尾；帧末 `overdriveBoostLeft` / `overdriveCooldown` 递减及结束时的 coast。
   - `updateHud` + `refreshHudLabels`：超载 HUD 刷新。
   - `keydown`：空格在 `playing` 且非背包时，若有 overdrive 叠层则调 `tryActivateOverdriveBoost`，否则 `tryStartDash`。
   - `PASSIVE_UPGRADE_KEYS` 含 `"overdrive"`；`createStatUpgradeChoices` 中对应 `apply()`。
2. **`i18n.js`**：`hud.overdrive*`、`upgrade.overdrive.*`；`controls.dash` / `controls.dash.keys` 中与超载相关的说明。
3. **`index.html`**：`#overdriveHud` 结构块。
4. **`style.css`**：`.overdrive-hud` 及相关条样式。
5. **`docs/GLOSSARY.md`**：§6 表格中 `upgrade.overdrive.title` 一行。

### 参考常量（数值可按平衡再调）

```javascript
const OVERDRIVE_DURATION = 5;
const OVERDRIVE_COOLDOWN = 7;
const SHIFT_SPRINT_MULT_BASE = 1.52;
const SHIFT_SPRINT_MULT_PER_STACK = 0.1;
const SPRINT_COAST_BURST = 280;
const SPRINT_COAST_BURST_PER_STACK = 48;
const SPRINT_TRAIL_COLORS = ["#ffb347", "#ffc266", "#ffe0a8", "#ff9a3c"];
```

### 参考文案键（恢复时拷回 `i18n.js`）

- `hud.overdrive`、`hud.overdriveTime`、`hud.overdriveCd`、`hud.overdriveReady`
- `upgrade.overdrive.title`、`upgrade.overdrive.desc`

完整实现请以移除前的 **`game.js` 提交记录** 或本仓库历史为准；本文仅作索引与数值/键位备忘。
