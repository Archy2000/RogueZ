# RogueZ 词汇表

面向读代码/改文案的同学：**显示名以 `i18n.js` 为准**；下列 **key** 为程序内标识。

---

## 游戏阶段 `state.phase`

| 值 | 含义（简述） |
|----|----------------|
| `menu` | 主菜单 |
| `playing` | 局内（含普通模式与训练场，由 `runMode` 区分） |
| `paused` / `paused_settings` / `paused_settings_controls` | 暂停及暂停下的设置/键位 |
| `menu_settings` / `menu_settings_controls` | 主菜单下的设置/键位 |
| `menu_codex` / `menu_codex_category` | 图鉴 |
| `menu_shop` | 宠物商店 |
| `menu_wheel` | 幸运转盘 |
| `levelup` | 三选一升级 |
| `gameover` | 游戏结束 |

---

## 局内模式 `state.runMode`

| 值 | 说明 |
|----|------|
| `normal` | 常规生存局 |
| `training` | 训练场：无刷怪波次、无排行榜式金币结算等（详见 `docs/README.md`） |

---

## 武器 `weaponDefinitions`（`type` 字符串）

与图鉴 / 文案键 `weapon.<type>.name` 对应。

| type | 备注 |
|------|------|
| `pistol` | 手枪 |
| `smg` | 冲锋枪 |
| `shotgun` | 霰弹枪 |
| `rifle` | 步枪 |
| `laser` | 激光（持续光束机制） |
| `plasma` | 等离子（可连锁） |
| `cryo` | 冰冻 |

---

## 敌人 `kind`（字符串）

与 `enemy.<kind>` 等文案键对应。

| kind | 备注 |
|------|------|
| `walker` | 普通尸 |
| `runner` | 快跑尸 |
| `brute` | 精英体型 |
| `boss` | BOSS |

训练场笼内怪仍使用上述 `kind`，但带 `enemy.cage` 矩形与特殊 AI。

---

## 宠物 `petDefinitions`（`key` 字符串）

与 `pet.<key>.name` / `pet.<key>.desc` 等对应。

| key | `origin` | 备注 |
|-----|----------|------|
| `scoutDroid` | `shop` | 侦查机兵，局内发射子弹 |
| `magnetCore` | `shop` | 磁力核心，被动吸经验 + 脉冲 |
| `medicBee` | `shop` | 医疗蜂，周期性治疗 |
| `thunderPup` | `wheel` | 雷幼犬，连锁电击 |
| `phoenixChick` | `wheel` | 凤凰雏，复活相关 |

---

## 拾取物 `pickup.type`

| type | 含义 |
|------|------|
| `xp` | 经验球 |
| `heal` | 治疗 |
| `magnet` | 短时磁力强化 |
| `cache` | BOSS 宝箱类（触发 `grantBossLoot()`） |

---

## 常用 HUD / 文案前缀（`i18n`）

| 前缀 | 用途 |
|------|------|
| `hud.*` | 左上角 HUD 标签等 |
| `menu.*` | 主菜单按钮与说明 |
| `controls.*` | 操作说明表 |
| `training.*` | 训练场提示与 HUD「训练」标签 |
| `shop.*` / `wheel.*` | 商店与转盘 |
| `pet.*` | 宠物名称与描述 |
| `weapon.*` / `enemy.*` | 武器与敌人名称/解锁说明 |
| `codex.*` | 图鉴锁定/分类等 |
| `msg.*` / `float.*` | 局内消息条与飘字 |

---

## 其它常量速查（非详尽）

| 名称 | 位置 | 作用 |
|------|------|------|
| `COIN_CONVERSION_RATIO` | `game.js` | 结算分 → 金币 |
| `WHEEL_SPIN_COST` | `game.js` | 转盘单次花费 |
| `META_PROGRESS_KEY` / `CODEX_PROGRESS_KEY` | `game.js` | localStorage 键名 |
| `LEADERBOARD_KEY` | `game.js` | 本机排行榜 |

更细的数值见 **`docs/ECONOMY.md`**。
