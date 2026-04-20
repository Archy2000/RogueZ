# RogueZ 名词清单（GLOSSARY）

本文档归纳游戏中出现的**可称呼元素**之中英文对照，便于策划、本地化与协作查阅。

## 文档用途与维护

- **文案权威来源**：[`i18n.js`](../i18n.js) 中 `zh-CN` 与 `en` 的同名键值。若游戏内显示与本文不一致，以 `i18n.js` 为准并更新本文。
- **代码 ID**：武器、敌人、宠物、拾取物等内部标识符来自 [`game.js`](../game.js)（如 `weaponDefinitions`、`createEnemy`、`spawnPickup`）。
- **未收录内容**：带 `{wave}`、`{name}` 等占位符的完整长句模板（`msg.*` 等）仅在下文「系统提示类别」概括，不逐条复制。
- **与版本同步（重要）**：每次新增或调整**面向玩家的功能**（新武器/敌人/宠物/界面/操作说明等）、或增删改 **`i18n.js` 中的可展示名词** 时，请在本清单中**增补或修订对应表格**，避免文档与游戏脱节。若日后 `docs/` 下增加其它说明文件，同样应在同一提交或近期跟进中更新。
- **已下线但保留设计的功能**：见 [`FEATURE_LIBRARY.md`](FEATURE_LIBRARY.md)（当前不接入 `game.js`，不收录进下表「局内升级」条目中）。

---

## 1. 游戏与品牌

| 中文 | English | 备注 / i18n 键 |
|------|---------|----------------|
| 被解救的僵鸽 | RogueZ · Rescued Zombie Pigeon | 副标题/品牌；`meta.title`（英文含 RogueZ 前缀） |
| 被解救的僵鸽 | Rescued Zombie Pigeon | 页标题后缀；`page.brandSuffix` |
| 俯视角生存肉鸽，自动锁敌射击，撑过尸潮并击败 BOSS。 | Top-down survival roguelike. Auto-aim, survive hordes, defeat the boss. | 页面说明；`page.subtitle` |

---

## 2. HUD（抬头显示字段标签）

| 中文 | English | i18n 键 |
|------|---------|---------|
| 生命: | HP: | `hud.hp` |
| 等级: | Lv: | `hud.level` |
| 经验: | XP: | `hud.xp` |
| 击杀: | Kills: | `hud.kills` |
| 分数: | Score: | `hud.score` |
| 时间: | Time: | `hud.time` |
| 波次: | Wave: | `hud.wave` |
| 武器: | Weapons: | `hud.weapons`（HUD 不显示武器行；战斗中 **G** 打开**背包**查看武器与可叠加强化，见 `backpack.*`） |
| 连击: | Combo: | `hud.combo` |
| (BOSS) | (BOSS) | `hud.waveBoss` |
| Lv. | Lv. | `common.lv` |

---

## 3. 武器（局内 / 图鉴）

| 代码 `type` | 中文 | English | i18n 键（名称） |
|-------------|------|---------|-----------------|
| `pistol` | 手枪 | Pistol | `weapon.pistol.name` |
| `smg` | 冲锋枪 | SMG | `weapon.smg.name` |
| `shotgun` | 霰弹枪 | Shotgun | `weapon.shotgun.name` |
| `rifle` | 穿甲步枪 | Armor-Piercing Rifle | `weapon.rifle.name` |
| `laser` | 激光枪 | Laser | `weapon.laser.name` |
| `plasma` | 电浆枪 | Plasma Gun | `weapon.plasma.name` |
| `cryo` | 冷冻枪 | Cryo Gun | `weapon.cryo.name` |

解锁说明文案见 `weapon.<type>.unlock`（未在表中展开）。

---

## 4. 敌人

| 代码 `kind` | 中文 | English | i18n 键（短名） |
|---------------|------|---------|-----------------|
| `walker` | 行尸 | Walker | `enemy.walker` |
| `runner` | 疾跑尸 | Runner | `enemy.runner` |
| `brute` | 重装尸 | Brute | `enemy.brute` |
| `boss` | 暴食尸王 | Glutton King | `enemy.boss` |

图鉴中的敌人描述见 `codex.enemy.<kind>.desc`。

---

## 5. 局内拾取物（掉落物）

以下为 [`game.js`](../game.js) 中 `pickup.type` 与画面上对应图形，**无单独 `name` 键**，称呼为玩家/说明用语。

| 代码 `type` | 中文（俗称） | English（说明） | 备注 |
|-------------|--------------|-----------------|------|
| `xp` | 经验球 / 经验晶体 | XP orb | 青色圆点；击杀掉落 |
| `heal` | 医疗包 | Medkit | 绿色方块+十字；`msg.pickupHeal` |
| `magnet` | 磁力核心 / 磁吸核心 | Magnet pickup | 紫色菱形；`msg.magnetStart` |
| `cache` | BOSS 补给箱 / BOSS 补给 | Boss cache | 金色方块；BOSS 掉落；`msg.bossLootUnlock` 等 |

---

## 6. 升级强化（三选一 / 构建选项）

| 中文 | English | i18n 键 |
|------|---------|---------|
| 强化弹头 | Heavy rounds | `upgrade.damage.title` |
| 快速换弹 | Fast hands | `upgrade.fire.title` |
| 战术靴 | Tactical boots | `upgrade.boots.title` |
| 急救注射 | Combat stim | `upgrade.med.title` |
| 恢复芯片 | Regen chip | `upgrade.regen.title` |
| 磁力回收 | Pickup magnet | `upgrade.magnet.title` |

模板：`upgrade.unlockTitle`（解锁 {name}）、`upgrade.levelTitle` / `upgrade.levelDesc`（武器升级类）。

---

## 7. 宠物与来源

| 代码 `key` | 中文 | English | i18n 键（名称） |
|------------|------|---------|-----------------|
| `scoutDroid` | 侦察无人机 | Scout Droid | `pet.scoutDroid.name` |
| `magnetCore` | 磁吸核心 | Magnet Core | `pet.magnetCore.name` |
| `medicBee` | 医疗蜂 | Medic Bee | `pet.medicBee.name` |
| `thunderPup` | 雷霆幼崽 | Thunder Pup | `pet.thunderPup.name` |
| `phoenixChick` | 不死鸟雏 | Phoenix Chick | `pet.phoenixChick.name` |

| 中文 | English | i18n 键 |
|------|---------|---------|
| 商店 | Shop | `pet.origin.shop` |
| 转盘专属 | Wheel only | `pet.origin.wheel` |

特殊：`pet.phoenix.revive` 涅槃 / Rebirth；`pet.phoenix.reviveMsg` 为复活提示长句。

---

## 8. 元游戏：金币、商店、转盘、排行榜

| 中文 | English | i18n 键 |
|------|---------|---------|
| 金币 | Coins | `meta.coinsName` |
| 宠物商店 | Pet Shop | `shop.title` |
| 购买 / 装备 / 已装备 / 金币不足 / 已拥有 / 卸下 / 返回 | Buy / Equip / Equipped / Not enough coins / Owned / Unequip / Back | `shop.*` |
| 幸运转盘 | Lucky Wheel | `wheel.title` |
| 旋转 ({cost}) | Spin ({cost}) | `wheel.spinButton` |
| 获得金币 / 抽到宠物 / 重复宠物 | Coins won / Pet won / Duplicate | `wheel.result.*` |
| 本地排行榜 | Local leaderboard | `lb.title` |

---

## 9. 图鉴（Codex）

| 中文 | English | i18n 键 |
|------|---------|---------|
| 图鉴 | Codex | `codex.title` / `menu.codex.label` |
| 武器 | Weapons | `codex.weapons` |
| 敌人 | Enemies | `codex.enemies` |
| 已发现 | Discovered | `codex.discovered.badge` |
| 未解锁 | Locked | `codex.locked.badge` |
| ??? | ??? | `codex.locked.name` |
| 返回图鉴 | Back to Codex | `codex.backToRoot.label` |

统计模板固定词：`codex.collected`、`codex.sectionTitle`、`codex.page`（页 {current}/{total}）。

---

## 10. 主菜单 / 暂停 / 设置 / 操作方式

| 中文 | English | i18n 键 |
|------|---------|---------|
| 尸潮来袭 | The horde arrives | `menu.title` |
| 开始游戏 | Play | `menu.start.label` |
| 设置 | Settings | `menu.settings.label` / `settings.title` |
| 排行榜 | Leaderboard | `menu.leaderboard.label` |
| 图鉴 | Codex | `menu.codex.label` |
| 商店 | Shop | `menu.shop.label` |
| 转盘 | Wheel | `menu.wheel.label` |
| 已暂停 | Paused | `pause.title` |
| 继续游戏 | Resume | `pause.resume.label` |
| 主菜单 | Main menu | `pause.menu.label` |
| 操作方式 | Controls | `settings.controls.label` / `controls.title` |
| 背包（战斗中） | Backpack (in combat) | `controls.backpack` |
| G 开/关 | G toggle | `controls.backpack.keys` |
| 背包 / 本次强化等 | Backpack UI strings | `backpack.*` |
| 简体中文 / English | 简体中文 / English | `lang.zh` / `lang.en` |

---

## 11. 游戏结束与默认提示

| 中文 | English | i18n 键 |
|------|---------|---------|
| 你倒下了 | You died | `go.title` |
| 再来一局 | Try again | `go.again.label` |
| 返回开始菜单 | Main menu | `go.menu.label`（英文与暂停「主菜单」同键不同文） |
| 清理尸潮，尽可能活得更久。 | Clear the horde. Survive as long as you can. | `default.message` |
| 选择一项强化。 | Choose an upgrade. | `overlay.pickOne` |

---

## 12. 横幅与升级界面

| 中文 | English | i18n 键 |
|------|---------|---------|
| 第 {wave} 波 | Wave {wave} | `banner.wave` |
| 第 {wave} 波 BOSS 来袭 | Wave {wave} — BOSS | `banner.bossWave` |
| 升级选择 | Level up | `level.title` |
| 构建你的武器组合与生存能力。左右或 A/D 切换，空格确认。 | Shape your loadout. ←/→ or A/D to browse, Space to pick. | `level.subtitle` |

---

## 13. 浮动提示（飘字关键词）

| 中文 | English | i18n 键 |
|------|---------|---------|
| +{v} EXP | +{v} XP | `float.exp` |
| +{v} HP | +{v} HP | `float.hp` |
| 解锁 {w} | Unlock {w} | `float.unlock` |
| 全武器强化 | All weapons + | `float.buffAll` |
| 磁吸 | Magnet | `float.magnetShort` |

---

## 14. 系统提示类别（概括）

以下条目在游戏内为**带变量的完整句子**，此处仅标分类与键前缀：

| 类别 | 说明 | 主要 i18n 前缀 |
|------|------|----------------|
| 波次与 BOSS | 开局、波次推进、BOSS 登场等 | `msg.wave*`、`msg.boss*` |
| 战斗与拾取 | 受击、升级选择、获得强化、无目标提示等 | `msg.playerHit`、`msg.levelUpPick`、`msg.gotUpgrade`、`msg.noTargets` |
| BOSS 补给 | 解锁武器、升级武器、全武器强化 | `msg.bossLoot*` |
| 结算 | 本局金币与总分 | `go.coinsLine`（与 `go.body` 搭配） |

---

## 15. 附录：图鉴与武器统计模板（固定标签词）

用于详情页拼接，非独立实体名：

| 用途 | i18n 键 |
|------|---------|
| 通用弹道武器一行 | `codex.weaponStats.ballistic` |
| 霰弹枪 | `codex.weaponStats.shotgun` |
| 激光 | `codex.weaponStats.laser` |
| 电浆 | `codex.weaponStats.plasma` |
| 冷冻 | `codex.weaponStats.cryo` |
| 敌人一行 | `codex.enemyStats` |

---

*文档生成依据：RogueZ `i18n.js` 全量键与 `game.js` 中实体 ID 对照。*
