# RogueZ 经济系统

数据与规则以 `game.js` 为准；本页便于策划/对照数值。

---

## 持久化（元进度）

| 项目 | 说明 |
|------|------|
| **localStorage 键** | `rogueZMetaV1`（`META_PROGRESS_KEY`） |
| **存储字段** | `coins`（非负整数）、`ownedPets`（宠物 id 数组）、`equippedPet`（当前装备 id 或 `null`） |
| **读写函数** | `loadMetaProgress()`、`saveMetaProgress()` |

图鉴进度另存 **`rogueZCodexV1`**（`CODEX_PROGRESS_KEY`），与经济无直接混用。

---

## 金币（Coins）

### 获得

| 来源 | 规则 |
|------|------|
| **单局结算** | 游戏结束时 `coinsEarned = floor(finalScore / COIN_CONVERSION_RATIO)`，写入 `state.meta.coins` 并 `saveMetaProgress()`。`COIN_CONVERSION_RATIO = **20**`（分数 20 分换 1 币）。 |
| **转盘** | 转到 `type === "coins"` 的奖品时直接加对应 `amount`（见下表）。 |
| **转盘重复宠物** | 已拥有该宠物时：`refund = floor(petDefinitions[key].price * 0.6)`，加金币。 |

### 消费

| 去向 | 金额 |
|------|------|
| **商店购买宠物** | 见下表「商店宠物标价」 |
| **幸运转盘** | 每次旋转固定扣除 **`WHEEL_SPIN_COST = 80`** 金币（旋转开始时扣款，与奖品无关） |

### 展示

`formatCoins(n)` 用于 UI 千分位等展示（具体实现见 `game.js`）。

---

## 商店（宠物）

商店只列出 `origin === "shop"` 的宠物（`listPetsByOrigin("shop")`）。

| 宠物 key | 标价（`def.price`） |
|-----------|---------------------|
| `magnetCore` | 320 |
| `scoutDroid` | 420 |
| `medicBee` | 540 |

- 购买：`state.meta.coins -= price`，加入 `ownedPets`；若当前未装备任何宠物则自动 `equippedPet = 该 key`。
- 装备/卸下：见商店 UI 逻辑；**不**在商店外自动扣费。

---

## 幸运转盘

### 单次成本

- **`WHEEL_SPIN_COST = 80`** 金币/次。

### 金币奖品（`buildWheelPool`）

| id | 金额 | weight（权重） |
|----|------|------------------|
| `coins_small` | 20 | 30 |
| `coins_med` | 60 | 22 |
| `coins_big` | 160 | 10 |
| `coins_huge` | 360 | 3 |

### 宠物奖品

- **转盘专属宠**（`origin === "wheel"`）：`thunderPup`（rare，权重 **7**）、`phoenixChick`（legendary，权重 **2**）。
- **商店宠再进池**：`scoutDroid`、`magnetCore`、`medicBee` 各一条目，权重均为 **6**（便于抽到但可能重复）。

抽到宠物且 **已拥有**：按该宠 **`price * 0.6` 取下整** 返还金币，不重复入队。

---

## 与单局内经济无关的内容

- **训练场**（`runMode === "training"`）不结算排行榜金币、局内也不消耗元进度金币。
- **经验 / 分数 / 击杀** 为元进度外的局内数据；金币结算只看 **结算分** 与 **`COIN_CONVERSION_RATIO`**。
