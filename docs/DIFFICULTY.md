# RogueZ 难度与敌人曲线

全部来自 `game.js`（`updateWave`、`updateSpawning`、`createEnemy`、`pickEnemyTypeForWave`、`isBossWave`）。**训练场**使用 `wave = 1` 的 `createEnemy` 快照，不跑下列波次/刷怪逻辑。

---

## 1. 波次 `wave` 怎么涨？

```text
state.waveDuration = 28   // 秒，每「格」时间片长度
state.wave = floor(state.elapsed / state.waveDuration) + 1
```

| 局内时间 `elapsed` | `wave` |
|----------------------|--------|
| 0 ≤ t < 28 | 1 |
| 28 ≤ t < 56 | 2 |
| … | … |

换波时会刷新 `waveAnnouncementTimer`、清 `bossSpawnedInWave` 等（见 `updateWave`）。

---

## 2. 小怪通用缩放 `waveScale`（Boss 不用）

对 **walker / runner / brute**：

```text
waveScale = 1 + (wave - 1) * 0.2
```

| wave | waveScale |
|------|-----------|
| 1 | 1.0 |
| 2 | 1.2 |
| 3 | 1.4 |
| 5 | 1.8 |
| 10 | 2.8 |

**Boss** 的 HP **不乘** `waveScale`，而是用下面线性式。

---

## 3. 敌人血量 `hp` / `maxHp`

### Walker（默认）

```text
hp = 34 * waveScale
```

### Runner

```text
hp = 22 * waveScale
```

### Brute

```text
hp = 74 * waveScale
```

### Boss（每 `wave % 3 === 0` 且 `wave > 0` 的 BOSS 波生成）

```text
hp = 620 + wave * 190
```

示例：

| wave | walker hp | runner hp | brute hp | boss hp |
|------|-----------|-----------|----------|---------|
| 1 | 34 | 22 | 74 | 810 |
| 3 | 47.6 | 30.8 | 103.6 | 1190 |
| 6 | 54.4 | 35.2 | 118.4 | 1760 |

---

## 4. 敌人近战伤害 `damage`（贴脸碰撞）

### Walker

```text
damage = 10 + wave * 0.5
```

### Runner

```text
damage = 8 + wave * 0.4
```

### Brute

```text
damage = 18 + wave * 0.7
```

### Boss

```text
damage = 24 + wave
```

---

## 5. 移速 `speed`（与难度相关，非血量）

| kind | 公式 |
|------|------|
| walker | `84 + wave * 2` |
| runner | `128 + wave * 3` |
| brute | `62 + wave * 1.8` |
| boss | `76 + wave * 2` |

---

## 6. 刷怪节奏（压力曲线）

### 刷新间隔 `interval`

```text
baseInterval = max(0.2, 0.9 - wave * 0.05)
interval = boss在场 ? baseInterval * 1.25 : baseInterval
```

- 波次越高，间隔越短，下限 **0.2s**。
- BOSS 在场时略放慢（×1.25）。

### 每次「触发」生成只数 `count`

```text
count = 1 + floor((wave - 1) / 2)
若 boss 在场: count = max(1, count - 1)
```

| wave | count（无 boss） |
|------|------------------|
| 1 | 1 |
| 2–3 | 2 |
| 4–5 | 3 |
| 6–7 | 4 |

每次 `spawnTimer` 攒满 `interval` 就连续 `spawnEnemy()` `count` 次。

### 类型权重 `pickEnemyTypeForWave()`

```text
wave >= 5 且 random() > 0.75 → brute
否则 wave >= 2 且 random() > 0.45 → runner
否则 → walker
```

---

## 7. BOSS 波

```text
isBossWave(wave) = wave > 0 && wave % 3 === 0
```

即 wave **3、6、9…** 为 BOSS 波（每 3 波一次），且同波内只尝试生成一次 BOSS（`bossSpawnedInWave` 门闩）。

---

## 8. 经验球 `xpValue`（与成长曲线相关）

| kind | xpValue |
|------|---------|
| walker | 8 |
| runner | 10 |
| brute | 18 |
| boss | `120 + wave * 30` |

玩家升级、武器强度不在本表内；见 `gainXp`、`weaponDefinitions.*.getStats`。
