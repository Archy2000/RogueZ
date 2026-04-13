const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_MIN_WIDTH = 320;
const CANVAS_MIN_HEIGHT = 180;

function resizeCanvasToDisplay() {
  const cssW = Math.floor(canvas.clientWidth);
  const cssH = Math.floor(canvas.clientHeight);
  const w = Math.max(CANVAS_MIN_WIDTH, cssW);
  const h = Math.max(CANVAS_MIN_HEIGHT, cssH);
  if (w <= 0 || h <= 0) {
    return;
  }
  if (canvas.width === w && canvas.height === h) {
    return;
  }
  canvas.width = w;
  canvas.height = h;
}

if (typeof ResizeObserver !== "undefined") {
  new ResizeObserver(() => resizeCanvasToDisplay()).observe(canvas);
}

window.addEventListener("resize", resizeCanvasToDisplay);

const hpText = document.getElementById("hpText");
const levelText = document.getElementById("levelText");
const xpText = document.getElementById("xpText");
const killsText = document.getElementById("killsText");
const scoreText = document.getElementById("scoreText");
const timeText = document.getElementById("timeText");
const waveText = document.getElementById("waveText");
const weaponText = document.getElementById("weaponText");
const message = document.getElementById("message");
const comboHud = document.getElementById("comboHud");
const comboFlame = document.getElementById("comboFlame");
const comboText = document.getElementById("comboText");
const comboMultText = document.getElementById("comboMultText");

const overlay = document.getElementById("overlay");
const overlayCard = overlay.querySelector(".overlay-card");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const upgradeOptions = document.getElementById("upgradeOptions");

const bossBar = document.getElementById("bossBar");
const bossName = document.getElementById("bossName");
const bossWave = document.getElementById("bossWave");
const bossHpFill = document.getElementById("bossHpFill");

const joystick = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystickKnob");

const TAU = Math.PI * 2;
const keys = new Set();

const DASH_DURATION = 0.13;
const DASH_SPEED = 780;
const DASH_COOLDOWN = 1.05;
const DASH_IFRAME_DURATION = 0.09;
const DASH_TRAIL_COLORS = ["#5ec8ff", "#7ad4ff", "#9ee0ff", "#cfefff"];
const COMBO_RESET_TIME = 2.4;
const COMBO_TIER_STEP = 3;
const LEADERBOARD_KEY = "rogueZLeaderboardV1";
const LEADERBOARD_MAX = 5;
const CODEX_PROGRESS_KEY = "rogueZCodexV1";
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

let currentLocale = "zh-CN";

function loadStoredLocale() {
  try {
    const raw = localStorage.getItem("rogueZLocale");
    if (raw === "en" || raw === "zh-CN") {
      return raw;
    }
  } catch (_) {
    /* ignore */
  }
  return "zh-CN";
}

currentLocale = loadStoredLocale();
document.documentElement.lang = currentLocale === "en" ? "en" : "zh-CN";

function t(key, vars) {
  const dict = (typeof RogueZI18n !== "undefined" && RogueZI18n[currentLocale]) || {};
  const fb = (typeof RogueZI18n !== "undefined" && RogueZI18n["zh-CN"]) || {};
  let s = dict[key] !== undefined ? dict[key] : fb[key] !== undefined ? fb[key] : key;
  if (vars && typeof s === "string") {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(String(v));
    }
  }
  return s;
}

function weaponName(type) {
  return t(`weapon.${type}.name`);
}

function weaponUnlockText(type) {
  return t(`weapon.${type}.unlock`);
}

function enemyDisplayName(kind) {
  return t(`enemy.${kind}`);
}

function setLocale(locale) {
  if (locale !== "en" && locale !== "zh-CN") {
    return;
  }
  currentLocale = locale;
  try {
    localStorage.setItem("rogueZLocale", locale);
  } catch (_) {
    /* ignore */
  }
  document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
  applyStaticPageStrings();
  refreshHudLabels();
  if (state.player) {
    refreshEntityNamesForLocale();
    updateHud();
    updateBossBar();
  }
  refreshMessageBarForLocale();
  applyLanguageToOpenOverlay();
}

const hudLblHp = document.getElementById("hudLblHp");
const hudLblLevel = document.getElementById("hudLblLevel");
const hudLblXp = document.getElementById("hudLblXp");
const hudLblKills = document.getElementById("hudLblKills");
const hudLblScore = document.getElementById("hudLblScore");
const hudLblTime = document.getElementById("hudLblTime");
const hudLblWave = document.getElementById("hudLblWave");
const hudLblWeapons = document.getElementById("hudLblWeapons");
const hudLblCombo = document.getElementById("hudLblCombo");

function applyStaticPageStrings() {
  document.title = t("meta.title");
  const suffix = document.getElementById("gameTitleSuffix");
  if (suffix) {
    suffix.textContent = t("page.brandSuffix");
  }
  const sub = document.getElementById("pageSubtitle");
  if (sub) {
    sub.textContent = t("page.subtitle");
  }
  const hint = document.querySelector(".touch-hint");
  if (hint) {
    hint.textContent = t("touch.hint");
  }
}

function refreshEntityNamesForLocale() {
  for (const e of state.enemies) {
    e.name = enemyDisplayName(e.kind);
  }
  if (state.boss) {
    state.boss.name = enemyDisplayName(state.boss.kind);
  }
}

function refreshMessageBarForLocale() {
  switch (state.phase) {
    case "paused":
    case "paused_settings":
      message.textContent = t("msg.paused");
      break;
    case "menu_settings":
      message.textContent = t("msg.menuHint");
      break;
    case "levelup":
      message.textContent = t("msg.levelUpPick");
      break;
    default:
      break;
  }
}

function refreshHudLabels() {
  if (hudLblHp) {
    hudLblHp.textContent = t("hud.hp");
  }
  if (hudLblLevel) {
    hudLblLevel.textContent = t("hud.level");
  }
  if (hudLblXp) {
    hudLblXp.textContent = t("hud.xp");
  }
  if (hudLblKills) {
    hudLblKills.textContent = t("hud.kills");
  }
  if (hudLblScore) {
    hudLblScore.textContent = t("hud.score");
  }
  if (hudLblTime) {
    hudLblTime.textContent = t("hud.time");
  }
  if (hudLblWave) {
    hudLblWave.textContent = t("hud.wave");
  }
  if (hudLblWeapons) {
    hudLblWeapons.textContent = t("hud.weapons");
  }
  if (hudLblCombo) {
    hudLblCombo.textContent = t("hud.combo");
  }
}

function applyLanguageToOpenOverlay() {
  if (overlay.classList.contains("hidden")) {
    return;
  }
  switch (state.phase) {
    case "menu":
      openMainMenuOverlay();
      break;
    case "menu_codex":
      showCodexRootFromMenu();
      break;
    case "menu_codex_category":
      showCodexCategoryFromMenu(state.codex.category);
      break;
    case "paused":
      showPauseMenu();
      break;
    case "paused_settings":
      showSettingsOverlay(true);
      break;
    case "menu_settings":
      showSettingsOverlay(false);
      break;
    case "gameover":
      showGameOverOverlay();
      break;
    default:
      break;
  }
}

const weaponDefinitions = {
  pistol: {
    maxLevel: 6,
    getStats(level, player) {
      return {
        damage: (18 + (level - 1) * 6) * player.damageMultiplier,
        cooldown: Math.max(0.18, 0.42 * Math.pow(0.9, level - 1)) / player.fireRate,
        range: 300 + level * 24,
        speed: 760,
        projectiles: level >= 5 ? 2 : 1,
        spread: level >= 5 ? 0.08 : 0.02,
        pierce: level >= 4 ? 1 : 0,
        size: 4,
        color: "#ffe38c",
      };
    },
  },
  smg: {
    maxLevel: 6,
    getStats(level, player) {
      return {
        damage: (7 + (level - 1) * 2.5) * player.damageMultiplier,
        cooldown: Math.max(0.06, 0.13 * Math.pow(0.95, level - 1)) / player.fireRate,
        range: 285 + level * 14,
        speed: 820,
        projectiles: level >= 4 ? 2 : 1,
        spread: 0.16,
        pierce: 0,
        size: 3,
        color: "#8ce6ff",
      };
    },
  },
  shotgun: {
    maxLevel: 6,
    getStats(level, player) {
      return {
        damage: (10 + (level - 1) * 3) * player.damageMultiplier,
        cooldown: Math.max(0.4, 0.92 * Math.pow(0.93, level - 1)) / player.fireRate,
        range: 245 + level * 18,
        speed: 680,
        pellets: 5 + (level - 1),
        spread: 0.58,
        pierce: level >= 6 ? 1 : 0,
        size: 4,
        color: "#ffd9a6",
      };
    },
  },
  rifle: {
    maxLevel: 6,
    getStats(level, player) {
      return {
        damage: (34 + (level - 1) * 10) * player.damageMultiplier,
        cooldown: Math.max(0.42, 1.06 * Math.pow(0.92, level - 1)) / player.fireRate,
        range: 420 + level * 28,
        speed: 940,
        projectiles: 1,
        spread: 0.02,
        pierce: 2 + Math.floor(level / 2),
        size: 5,
        color: "#ffb2b2",
      };
    },
  },
  laser: {
    maxLevel: 6,
    getStats(level, player) {
      const fr = player.fireRate;
      return {
        magazineCooldown: Math.max(5.4, 11 * Math.pow(0.93, level - 1)) / fr,
        beamDuration: 2.05 + level * 0.32,
        dps: (26 + (level - 1) * 8.5) * player.damageMultiplier,
        range: 320 + level * 34,
        beamHalfWidth: 9 + level * 1.1,
        color: "#66ffc8",
      };
    },
  },
  plasma: {
    maxLevel: 6,
    getStats(level, player) {
      return {
        damage: (22 + (level - 1) * 5.5) * player.damageMultiplier,
        cooldown: Math.max(0.48, 0.96 * Math.pow(0.93, level - 1)) / player.fireRate,
        range: 290 + level * 24,
        speed: 560 + level * 18,
        projectiles: 1,
        spread: 0.03,
        pierce: 0,
        size: 6 + level * 0.25,
        color: "#8ef6ff",
        chainRange: 120 + level * 10,
        chainTargets: 2 + Math.floor(level / 2),
        chainDamageFactor: 0.62 + level * 0.03,
        chainDecay: 0.86,
        slowMultiplier: Math.max(0.48, 0.72 - level * 0.03),
        slowDuration: 1.1 + level * 0.14,
      };
    },
  },
};

const state = {
  phase: "menu",
  elapsed: 0,
  wave: 1,
  waveDuration: 28,
  kills: 0,
  spawnTimer: 0,
  pendingLevelUps: 0,
  score: 0,
  enemies: [],
  projectiles: [],
  pickups: [],
  damageTexts: [],
  dashTrailParticles: [],
  laserHitParticles: [],
  chainArcs: [],
  lastGameOver: null,
  combo: {
    count: 0,
    timer: 0,
    multiplier: 1,
    pulse: 0,
    tier: 0,
  },
  player: null,
  boss: null,
  bossSpawnedInWave: false,
  nextEnemyId: 1,
  waveAnnouncementTimer: 0,
  codex: {
    discoveredWeapons: new Set(),
    discoveredEnemies: new Set(),
    category: "weapons",
    page: 0,
    pageSize: 6,
  },
  touch: {
    active: false,
    id: null,
    x: 0,
    y: 0,
  },
  audio: {
    context: null,
    outputGainNode: null,
    lastShootAt: 0,
    lastHitAt: 0,
    lastLaserHumAt: 0,
    lastPlasmaHitAt: 0,
    volume: 1,
    outputBoost: 2.35,
  },
};

function createWeapon(type, level = 1) {
  const weapon = {
    type,
    level,
    cooldownTimer: 0,
  };
  if (type === "laser") {
    weapon.beamTimeLeft = 0;
    weapon.laserAngle = 0;
    weapon.laserTargetId = null;
  }
  return weapon;
}

function createPlayer() {
  return {
    x: 0,
    y: 0,
    radius: 16,
    moveSpeed: 230,
    hp: 100,
    maxHp: 100,
    level: 1,
    xp: 0,
    xpToNext: 50,
    regen: 0,
    facing: 0,
    invulnerableTimer: 0,
    magnetRange: 140,
    damageMultiplier: 1,
    fireRate: 1,
    weapons: [createWeapon("pistol")],
    dashTimeLeft: 0,
    dashCooldown: 0,
    dashDirX: 0,
    dashDirY: 0,
    dashInvulnLeft: 0,
  };
}

function getComboTier(count) {
  return Math.floor(Math.max(0, count - 1) / COMBO_TIER_STEP);
}

function getComboMultiplier(count) {
  const chain = Math.max(0, count - 1);
  const tier = Math.floor(chain / COMBO_TIER_STEP);
  const withinTier = chain % COMBO_TIER_STEP;
  return Math.min(4, 1 + tier * 0.35 + withinTier * 0.08);
}

function resetCombo() {
  state.combo.count = 0;
  state.combo.timer = 0;
  state.combo.multiplier = 1;
  state.combo.pulse = 0;
  state.combo.tier = 0;
}

function awardKillScore(enemy) {
  state.combo.count += 1;
  state.combo.timer = COMBO_RESET_TIME;
  state.combo.multiplier = getComboMultiplier(state.combo.count);
  state.combo.tier = getComboTier(state.combo.count);
  state.combo.pulse = 0.28;

  const baseScore = enemy.kind === "boss"
    ? 520
    : Math.round(18 + enemy.xpValue * 2.2);
  const gained = Math.round(baseScore * state.combo.multiplier);
  state.score += gained;
  spawnFloatingText(enemy.x, enemy.y - enemy.radius - 14, `+${gained}`, "#ffbf7b");
}

function updateCombo(dt) {
  state.combo.pulse = Math.max(0, state.combo.pulse - dt);
  if (state.phase !== "playing") {
    return;
  }
  if (state.combo.timer > 0) {
    state.combo.timer = Math.max(0, state.combo.timer - dt);
    if (state.combo.timer <= 0) {
      resetCombo();
    }
  }
}

function resetRunState() {
  state.elapsed = 0;
  state.wave = 1;
  state.kills = 0;
  state.score = 0;
  state.spawnTimer = 0;
  state.pendingLevelUps = 0;
  state.enemies = [];
  state.projectiles = [];
  state.pickups = [];
  state.damageTexts = [];
  state.dashTrailParticles = [];
  state.laserHitParticles = [];
  state.chainArcs = [];
  resetCombo();
  state.player = createPlayer();
  discoverWeapon("pistol");
  state.boss = null;
  state.bossSpawnedInWave = false;
  state.waveAnnouncementTimer = 2.2;
  state.nextEnemyId = 1;
  updateBossBar();
  updateHud();
}

function showOverlay(title, text, buttons) {
  overlayCard.querySelectorAll(".codex-info-panel--floating").forEach((panel) => panel.remove());
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
  overlayCard.classList.remove("overlay-card--codex");
  upgradeOptions.className = "upgrade-options";
  upgradeOptions.innerHTML = "";

  for (const buttonConfig of buttons) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "upgrade-button";
    button.innerHTML = `<strong>${buttonConfig.label}</strong><span>${buttonConfig.description}</span>`;
    button.addEventListener("click", buttonConfig.onClick);
    upgradeOptions.appendChild(button);
  }
}

function hideOverlay() {
  overlayCard.querySelectorAll(".codex-info-panel--floating").forEach((panel) => panel.remove());
  overlay.classList.add("hidden");
  overlayCard.classList.remove("overlay-card--codex");
  upgradeOptions.className = "upgrade-options";
  upgradeOptions.innerHTML = "";
}

function showPauseMenu() {
  state.phase = "paused";
  message.textContent = t("msg.paused");
  showOverlay(t("pause.title"), t("pause.hint"), [
    {
      label: t("pause.resume.label"),
      description: t("pause.resume.desc"),
      onClick: resumeGame,
    },
    {
      label: t("pause.settings.label"),
      description: t("pause.settings.desc"),
      onClick: showSettingsFromPause,
    },
    {
      label: t("pause.menu.label"),
      description: t("pause.menu.desc"),
      onClick: goToMainMenuFromPause,
    },
  ]);
}

function resumeGame() {
  if (state.phase !== "paused") {
    return;
  }
  state.phase = "playing";
  hideOverlay();
  message.textContent = t("msg.resumeMove");
}

function pauseGame() {
  if (state.phase !== "playing") {
    return;
  }
  ensureAudio();
  state.phase = "paused";
  showPauseMenu();
}

function goToMainMenuFromPause() {
  hideOverlay();
  resetTouchVector();
  showStartMenu();
}

function showSettingsOverlay(fromPause) {
  state.phase = fromPause ? "paused_settings" : "menu_settings";
  overlayTitle.textContent = t("settings.title");
  overlayText.textContent = fromPause ? t("settings.hint") : t("settings.hintMenu");
  overlay.classList.remove("hidden");
  upgradeOptions.className = "upgrade-options upgrade-options--settings";
  upgradeOptions.innerHTML = "";

  const row = document.createElement("div");
  row.className = "settings-volume-row";

  const labelTop = document.createElement("div");
  labelTop.className = "settings-volume-label";
  const labelText = document.createElement("span");
  labelText.textContent = t("settings.volume");
  const valueSpan = document.createElement("span");
  valueSpan.className = "settings-volume-value";
  valueSpan.textContent = `${Math.round(state.audio.volume * 100)}%`;
  labelTop.appendChild(labelText);
  labelTop.appendChild(valueSpan);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = String(Math.round(state.audio.volume * 100));
  slider.className = "settings-volume-slider";

  slider.addEventListener("input", () => {
    const v = Number(slider.value) / 100;
    state.audio.volume = clamp(v, 0, 1);
    refreshAudioOutputGain();
    valueSpan.textContent = `${Math.round(state.audio.volume * 100)}%`;
    try {
      localStorage.setItem("zombieRoguelikeVolume", String(state.audio.volume));
    } catch (_) {
      /* ignore */
    }
  });

  row.appendChild(labelTop);
  row.appendChild(slider);
  upgradeOptions.appendChild(row);

  const langRow = document.createElement("div");
  langRow.className = "settings-volume-row";
  const langLabelTop = document.createElement("div");
  langLabelTop.className = "settings-volume-label";
  const langLabel = document.createElement("span");
  langLabel.textContent = t("settings.language");
  langLabelTop.appendChild(langLabel);
  const langSelect = document.createElement("select");
  langSelect.className = "settings-lang-select";
  langSelect.setAttribute("aria-label", t("settings.language"));
  const optZh = document.createElement("option");
  optZh.value = "zh-CN";
  optZh.textContent = t("lang.zh");
  const optEn = document.createElement("option");
  optEn.value = "en";
  optEn.textContent = t("lang.en");
  langSelect.appendChild(optZh);
  langSelect.appendChild(optEn);
  langSelect.value = currentLocale;
  langSelect.addEventListener("change", () => {
    setLocale(langSelect.value);
  });
  langRow.appendChild(langLabelTop);
  langRow.appendChild(langSelect);
  upgradeOptions.appendChild(langRow);

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "upgrade-button";
  backBtn.innerHTML = `<strong>${t("lb.back.label")}</strong><span>${
    fromPause ? t("settings.backPause") : t("settings.backMenu")
  }</span>`;
  backBtn.addEventListener("click", () => {
    if (fromPause) {
      state.phase = "paused";
      showPauseMenu();
    } else {
      state.phase = "menu";
      openMainMenuOverlay();
    }
  });
  upgradeOptions.appendChild(backBtn);
}

function showSettingsFromPause() {
  showSettingsOverlay(true);
}

function showSettingsFromMenu() {
  showSettingsOverlay(false);
}

function showStartMenu() {
  resetRunState();
  state.phase = "menu";
  message.textContent = t("msg.menuHint");
  openMainMenuOverlay();
}

function startRun() {
  ensureAudio();
  resetRunState();
  state.phase = "playing";
  message.textContent = t("msg.wave1Start");
  hideOverlay();
  playSound("start");
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function computeRunScore() {
  const p = state.player;
  const level = p ? p.level : 1;
  return Math.floor(state.score + state.wave * 220 + state.elapsed * 2.5 + level * 45);
}

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) {
      return [];
    }
    return arr
      .filter((e) => typeof e.score === "number")
      .sort((a, b) => b.score - a.score)
      .slice(0, LEADERBOARD_MAX);
  } catch (_) {
    return [];
  }
}

function saveLeaderboard(list) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list.slice(0, LEADERBOARD_MAX)));
  } catch (_) {
    /* ignore quota / private mode */
  }
}

function loadCodexProgress() {
  try {
    const raw = localStorage.getItem(CODEX_PROGRESS_KEY);
    if (!raw) {
      return;
    }
    const data = JSON.parse(raw);
    const weapons = Array.isArray(data.weapons) ? data.weapons : [];
    const enemies = Array.isArray(data.enemies) ? data.enemies : [];
    state.codex.discoveredWeapons = new Set(weapons.filter((type) => weaponDefinitions[type]));
    state.codex.discoveredEnemies = new Set(enemies.filter((kind) => ["walker", "runner", "brute", "boss"].includes(kind)));
  } catch (_) {
    state.codex.discoveredWeapons = new Set();
    state.codex.discoveredEnemies = new Set();
  }
}

function saveCodexProgress() {
  try {
    localStorage.setItem(CODEX_PROGRESS_KEY, JSON.stringify({
      weapons: [...state.codex.discoveredWeapons],
      enemies: [...state.codex.discoveredEnemies],
    }));
  } catch (_) {
    /* ignore */
  }
}

function discoverWeapon(type) {
  if (!weaponDefinitions[type] || state.codex.discoveredWeapons.has(type)) {
    return;
  }
  state.codex.discoveredWeapons.add(type);
  saveCodexProgress();
}

function discoverEnemy(kind) {
  if (!["walker", "runner", "brute", "boss"].includes(kind) || state.codex.discoveredEnemies.has(kind)) {
    return;
  }
  state.codex.discoveredEnemies.add(kind);
  saveCodexProgress();
}

function recordLeaderboardEntry() {
  const score = computeRunScore();
  const entry = {
    score,
    kills: state.kills,
    wave: state.wave,
    elapsed: Math.floor(state.elapsed),
    level: state.player.level,
    at: new Date().toISOString(),
  };
  const list = loadLeaderboard();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  saveLeaderboard(list.slice(0, LEADERBOARD_MAX));
}

function openMainMenuOverlay() {
  state.phase = "menu";
  showOverlay(t("menu.title"), t("menu.subtitle"), [
    {
      label: t("menu.start.label"),
      description: t("menu.start.desc"),
      onClick: startRun,
    },
    {
      label: t("menu.settings.label"),
      description: t("menu.settings.desc"),
      onClick: showSettingsFromMenu,
    },
    {
      label: t("menu.leaderboard.label"),
      description: t("menu.leaderboard.desc"),
      onClick: showLeaderboardFromMenu,
    },
    {
      label: t("menu.codex.label"),
      description: t("menu.codex.desc"),
      onClick: showCodexRootFromMenu,
    },
  ]);
}

function getBasePlayerForCodex() {
  return {
    damageMultiplier: 1,
    fireRate: 1,
  };
}

function formatCodexNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function buildWeaponCodexSummary(type) {
  const basePlayer = getBasePlayerForCodex();
  const stats = weaponDefinitions[type].getStats(1, basePlayer);

  if (type === "shotgun") {
    return t("codex.weaponStats.shotgun", {
      damage: formatCodexNumber(stats.damage),
      pellets: stats.pellets,
      cooldown: formatCodexNumber(stats.cooldown),
      range: formatCodexNumber(stats.range),
    });
  }

  if (type === "laser") {
    return t("codex.weaponStats.laser", {
      dps: formatCodexNumber(stats.dps),
      duration: formatCodexNumber(stats.beamDuration),
      range: formatCodexNumber(stats.range),
    });
  }

  if (type === "plasma") {
    return t("codex.weaponStats.plasma", {
      damage: formatCodexNumber(stats.damage),
      chain: stats.chainTargets,
      slow: Math.round((1 - stats.slowMultiplier) * 100),
      range: formatCodexNumber(stats.range),
    });
  }

  return t("codex.weaponStats.ballistic", {
    damage: formatCodexNumber(stats.damage),
    cooldown: formatCodexNumber(stats.cooldown),
    range: formatCodexNumber(stats.range),
  });
}

function buildEnemyCodexSummary(kind) {
  const currentWave = state.wave;
  state.wave = 1;
  const enemy = createEnemy(kind, 0, 0);
  state.wave = currentWave;
  return {
    name: enemyDisplayName(kind),
    description: t(`codex.enemy.${kind}.desc`),
    summary: t("codex.enemyStats", {
      hp: formatCodexNumber(enemy.maxHp),
      speed: formatCodexNumber(enemy.speed),
      damage: formatCodexNumber(enemy.damage),
      xp: enemy.xpValue,
    }),
  };
}

function getCodexCardVisuals(category, key) {
  const accent = "#90a4ff";
  if (category === "enemies") {
    const map = {
      walker: { accent, icon: "Z", rarity: "standard" },
      runner: { accent, icon: ">>", rarity: "standard" },
      brute: { accent, icon: "B", rarity: "standard" },
      boss: { accent, icon: "BOSS", rarity: "standard" },
    };
    return map[key] || { accent, icon: "?", rarity: "standard" };
  }

  const map = {
    pistol: { accent, icon: "P", rarity: "standard" },
    smg: { accent, icon: "SMG", rarity: "standard" },
    shotgun: { accent, icon: "SG", rarity: "standard" },
    rifle: { accent, icon: "AR", rarity: "standard" },
    laser: { accent, icon: "LZR", rarity: "standard" },
    plasma: { accent, icon: "PLS", rarity: "standard" },
  };
  return map[key] || { accent, icon: "?", rarity: "standard" };
}

function createCodexCard(entry, category, index) {
  const visuals = getCodexCardVisuals(category, entry.key);
  const card = document.createElement("button");
  card.type = "button";
  card.className = `codex-card${entry.discovered ? " is-discovered" : " is-locked"}`;
  card.style.setProperty("--codex-accent", visuals.accent);
  card.dataset.category = category;
  card.dataset.rarity = visuals.rarity;

  const displayName = entry.discovered ? entry.name : "";
  const icon = entry.discovered ? visuals.icon : t("codex.locked.icon");

  card.innerHTML = `
    <div class="codex-card-top">
      <span class="codex-card-tag">${category === "weapons" ? t("codex.weapons") : t("codex.enemies")}</span>
      <span class="codex-card-index">${String(index + 1).padStart(2, "0")}</span>
    </div>
    <div class="codex-card-art${entry.discovered ? "" : " codex-card-art--back"}">${icon}</div>
    ${entry.discovered ? `<strong class="codex-card-name">${displayName}</strong>` : ""}
  `;

  return card;
}

function createCodexInfoPanel(entry, category) {
  const panel = document.createElement("section");
  panel.className = "codex-info-panel";

  const visuals = getCodexCardVisuals(category, entry.key);
  const name = entry.discovered ? entry.name : t("codex.locked.name");
  const desc = entry.discovered ? entry.description : t("codex.locked.desc");
  const summary = entry.discovered ? entry.summary : t("codex.locked.stats");
  const badge = entry.discovered ? t("codex.discovered.badge") : t("codex.locked.badge");
  const categoryLabel = category === "weapons" ? t("codex.weapons") : t("codex.enemies");
  const icon = entry.discovered ? visuals.icon : t("codex.locked.icon");

  panel.style.setProperty("--codex-accent", visuals.accent);

  panel.innerHTML = `
    <div class="codex-info-layout">
      <div class="codex-info-preview${entry.discovered ? "" : " is-locked"}">
        <div class="codex-info-preview-top">
          <span class="codex-info-preview-tag">${categoryLabel}</span>
          <span class="codex-info-index">${String((entry.absoluteIndex ?? 0) + 1).padStart(2, "0")}</span>
        </div>
        <div class="codex-info-preview-art${entry.discovered ? "" : " codex-info-preview-art--back"}">${icon}</div>
        <strong class="codex-info-preview-name">${name}</strong>
      </div>
      <div class="codex-info-content">
        <div class="codex-info-top">
          <span class="codex-info-badge">${badge}</span>
        </div>
        <h4 class="codex-info-title">${name}</h4>
        <p class="codex-info-desc">${desc}</p>
        <div class="codex-info-stats">${summary}</div>
      </div>
    </div>
  `;

  return panel;
}

function createCodexSection(title, entries, category) {
  const section = document.createElement("section");
  section.className = "codex-section";

  const heading = document.createElement("h3");
  heading.className = "codex-section-title";
  heading.textContent = title;
  section.appendChild(heading);

  const gridWrap = document.createElement("div");
  gridWrap.className = "codex-grid-wrap";
  const grid = document.createElement("div");
  grid.className = "codex-grid";
  const infoPanel = document.createElement("section");
  infoPanel.className = "codex-info-panel codex-info-panel--floating";
  overlayCard.appendChild(infoPanel);

  const hidePreview = () => {
    infoPanel.classList.remove("is-visible");
  };

  const showPreview = (entry, card) => {
    const nextPanel = createCodexInfoPanel(entry, category);
    infoPanel.innerHTML = nextPanel.innerHTML;
    infoPanel.className = "codex-info-panel codex-info-panel--floating is-visible";

    requestAnimationFrame(() => {
      if (!infoPanel.classList.contains("is-visible")) {
        return;
      }

      const gap = 12;
      const hostRect = overlayCard.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const panelRect = infoPanel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = 0;
      let top = 0;
      left = cardRect.left - hostRect.left + ((cardRect.width - panelRect.width) / 2);
      const minLeft = -hostRect.left + gap;
      const maxLeft = viewportWidth - hostRect.left - panelRect.width - gap;
      left = Math.max(minLeft, Math.min(left, maxLeft));

      const preferredTop = cardRect.top - hostRect.top - panelRect.height - gap;
      const minTop = -hostRect.top + gap;
      if (preferredTop >= minTop) {
        top = preferredTop;
      } else {
        const fallbackBottom = cardRect.bottom - hostRect.top + gap;
        const maxTop = viewportHeight - hostRect.top - panelRect.height - gap;
        top = Math.min(fallbackBottom, maxTop);
      }

      infoPanel.style.left = `${left}px`;
      infoPanel.style.top = `${top}px`;
    });
  };

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const card = createCodexCard(entry, entry.category, entry.absoluteIndex ?? i);

    card.addEventListener("mouseenter", () => showPreview(entry, card));
    card.addEventListener("focus", () => showPreview(entry, card));
    card.addEventListener("click", () => showPreview(entry, card));
    card.addEventListener("blur", hidePreview);

    grid.appendChild(card);
  }

  gridWrap.addEventListener("mouseleave", hidePreview);
  gridWrap.appendChild(grid);
  section.appendChild(gridWrap);
  return section;
}

function getCodexEntries(category) {
  if (category === "enemies") {
    return ["walker", "runner", "brute", "boss"].map((kind, index) => ({
      key: kind,
      category,
      ...buildEnemyCodexSummary(kind),
      discovered: state.codex.discoveredEnemies.has(kind),
      absoluteIndex: index,
    }));
  }

  return Object.keys(weaponDefinitions).map((type, index) => ({
    key: type,
    category,
    name: weaponName(type),
    description: weaponUnlockText(type),
    summary: buildWeaponCodexSummary(type),
    discovered: state.codex.discoveredWeapons.has(type),
    absoluteIndex: index,
  }));
}

function showCodexRootFromMenu() {
  state.phase = "menu_codex";
  overlayCard.querySelectorAll(".codex-info-panel--floating").forEach((panel) => panel.remove());
  overlayTitle.textContent = t("codex.title");
  overlayText.textContent = t("codex.hint");
  overlay.classList.remove("hidden");
  overlayCard.classList.add("overlay-card--codex");
  upgradeOptions.className = "upgrade-options upgrade-options--codex-root";
  upgradeOptions.innerHTML = "";

  const rootGrid = document.createElement("div");
  rootGrid.className = "codex-root-grid";

  const weaponCard = document.createElement("button");
  weaponCard.type = "button";
  weaponCard.className = "codex-root-card";
  weaponCard.innerHTML = `<strong>${t("codex.weapons")}</strong><span>${t("codex.root.weapons.desc")}</span><small>${t("codex.collected", {
    count: state.codex.discoveredWeapons.size,
    total: Object.keys(weaponDefinitions).length,
  })}</small>`;
  weaponCard.addEventListener("click", () => showCodexCategoryFromMenu("weapons", 0));
  rootGrid.appendChild(weaponCard);

  const enemyCard = document.createElement("button");
  enemyCard.type = "button";
  enemyCard.className = "codex-root-card";
  enemyCard.innerHTML = `<strong>${t("codex.enemies")}</strong><span>${t("codex.root.enemies.desc")}</span><small>${t("codex.collected", {
    count: state.codex.discoveredEnemies.size,
    total: 4,
  })}</small>`;
  enemyCard.addEventListener("click", () => showCodexCategoryFromMenu("enemies", 0));
  rootGrid.appendChild(enemyCard);

  upgradeOptions.appendChild(rootGrid);

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "upgrade-button codex-back-button";
  backBtn.innerHTML = `<strong>${t("lb.back.label")}</strong><span>${t("lb.back.desc")}</span>`;
  backBtn.addEventListener("click", openMainMenuOverlay);
  upgradeOptions.appendChild(backBtn);
}

function changeCodexPage(delta) {
  const entries = getCodexEntries(state.codex.category);
  const totalPages = Math.max(1, Math.ceil(entries.length / state.codex.pageSize));
  state.codex.page = Math.max(0, Math.min(totalPages - 1, state.codex.page + delta));
  showCodexCategoryFromMenu(state.codex.category, state.codex.page);
}

function showCodexCategoryFromMenu(category, page = 0) {
  state.phase = "menu_codex_category";
  overlayCard.querySelectorAll(".codex-info-panel--floating").forEach((panel) => panel.remove());
  state.codex.category = category;
  state.codex.page = page;
  overlayTitle.textContent = category === "weapons" ? t("codex.weapons") : t("codex.enemies");
  overlayText.textContent = t("codex.categoryHint");
  overlay.classList.remove("hidden");
  overlayCard.classList.add("overlay-card--codex");
  upgradeOptions.className = "upgrade-options upgrade-options--codex";
  upgradeOptions.innerHTML = "";

  const entries = getCodexEntries(category);
  const discoveredCount = entries.filter((entry) => entry.discovered).length;
  const totalPages = Math.max(1, Math.ceil(entries.length / state.codex.pageSize));
  state.codex.page = Math.max(0, Math.min(totalPages - 1, state.codex.page));
  const pageStart = state.codex.page * state.codex.pageSize;
  const visibleEntries = entries.slice(pageStart, pageStart + state.codex.pageSize);

  const pageArea = document.createElement("div");
  pageArea.className = "codex-page-area";
  pageArea.appendChild(createCodexSection(
    t("codex.sectionTitle", {
      name: category === "weapons" ? t("codex.weapons") : t("codex.enemies"),
      collected: discoveredCount,
      total: entries.length,
    }),
    visibleEntries,
    category
  ));

  upgradeOptions.appendChild(pageArea);

  const footer = document.createElement("div");
  footer.className = "codex-footer";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "codex-page-button";
  prevBtn.textContent = t("codex.prev");
  prevBtn.disabled = state.codex.page <= 0;
  prevBtn.addEventListener("click", () => changeCodexPage(-1));
  footer.appendChild(prevBtn);

  const pageText = document.createElement("div");
  pageText.className = "codex-page-indicator";
  pageText.textContent = t("codex.page", { current: state.codex.page + 1, total: totalPages });
  footer.appendChild(pageText);

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "codex-page-button";
  nextBtn.textContent = t("codex.next");
  nextBtn.disabled = state.codex.page >= totalPages - 1;
  nextBtn.addEventListener("click", () => changeCodexPage(1));
  footer.appendChild(nextBtn);

  upgradeOptions.appendChild(footer);

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "upgrade-button codex-back-button";
  backBtn.innerHTML = `<strong>${t("codex.backToRoot.label")}</strong><span>${t("codex.backToRoot.desc")}</span>`;
  backBtn.addEventListener("click", showCodexRootFromMenu);
  upgradeOptions.appendChild(backBtn);
}

function showLeaderboardFromMenu() {
  const rows = loadLeaderboard();
  overlayTitle.textContent = t("lb.title");
  overlayText.textContent = t("lb.hint");
  overlay.classList.remove("hidden");
  upgradeOptions.className = "upgrade-options upgrade-options--leaderboard";
  upgradeOptions.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "leaderboard-wrap";

  const dateLocale = currentLocale === "en" ? "en-US" : "zh-CN";

  if (rows.length === 0) {
    const empty = document.createElement("p");
    empty.className = "leaderboard-empty";
    empty.textContent = t("lb.empty");
    wrap.appendChild(empty);
  } else {
    const ol = document.createElement("ol");
    ol.className = "leaderboard-list";
    for (let i = 0; i < rows.length; i += 1) {
      const r = rows[i];
      const li = document.createElement("li");
      li.className = "leaderboard-row";
      const dateStr = r.at
        ? new Date(r.at).toLocaleString(dateLocale, {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        : "";
      const scoreLine = t("lb.scoreLine", {
        score: r.score.toLocaleString(dateLocale),
        wave: r.wave,
        kills: r.kills,
      });
      li.innerHTML = `<span class="lb-rank">${i + 1}</span><div class="lb-body"><div class="lb-score-line"><strong>${scoreLine}</strong></div><div class="lb-sub">${formatTime(r.elapsed)} · ${t("common.lv")}${r.level} · ${dateStr}</div></div>`;
      ol.appendChild(li);
    }
    wrap.appendChild(ol);
  }

  upgradeOptions.appendChild(wrap);

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "upgrade-button";
  backBtn.innerHTML = `<strong>${t("lb.back.label")}</strong><span>${t("lb.back.desc")}</span>`;
  backBtn.addEventListener("click", openMainMenuOverlay);
  upgradeOptions.appendChild(backBtn);
}

function updateHud() {
  const player = state.player;
  hpText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
  levelText.textContent = `${player.level}`;
  xpText.textContent = `${Math.floor(player.xp)} / ${player.xpToNext}`;
  killsText.textContent = `${state.kills}`;
  scoreText.textContent = `${computeRunScore()}`;
  timeText.textContent = formatTime(state.elapsed);
  waveText.textContent = `${state.wave}${isBossWave(state.wave) ? ` ${t("hud.waveBoss")}` : ""}`;
  weaponText.textContent = getWeaponSummary();

  const comboActive = state.combo.count > 1 && state.combo.timer > 0;
  comboHud.classList.toggle("hidden", !comboActive);
  if (comboActive) {
    comboHud.dataset.tier = String(Math.min(5, state.combo.tier));
    comboHud.classList.toggle("is-active", state.combo.pulse > 0);
    comboText.textContent = `${state.combo.count}`;
    comboMultText.textContent = `x${state.combo.multiplier.toFixed(2)}`;
    comboFlame.dataset.tier = String(Math.min(5, state.combo.tier));
  } else {
    comboHud.dataset.tier = "0";
    comboHud.classList.remove("is-active");
    comboText.textContent = "0";
    comboMultText.textContent = "x1.00";
    comboFlame.dataset.tier = "0";
  }
}

function updateBossBar() {
  if (!state.boss) {
    bossBar.classList.add("hidden");
    bossHpFill.style.width = "0%";
    return;
  }

  bossBar.classList.remove("hidden");
  bossName.textContent = enemyDisplayName(state.boss.kind);
  bossWave.textContent = t("boss.wave", { wave: state.wave });
  bossHpFill.style.width = `${Math.max(0, (state.boss.hp / state.boss.maxHp) * 100)}%`;
}

function getWeaponSummary() {
  return state.player.weapons.map((weapon) => `${weaponName(weapon.type)} ${t("common.lv")}${weapon.level}`).join(" / ");
}

function ensureAudio() {
  if (!AudioContextClass) {
    return;
  }

  if (!state.audio.context) {
    state.audio.context = new AudioContextClass();
    state.audio.outputGainNode = state.audio.context.createGain();
    state.audio.outputGainNode.connect(state.audio.context.destination);
  }

  if (state.audio.context.state === "suspended") {
    state.audio.context.resume();
  }

  refreshAudioOutputGain();
}

function refreshAudioOutputGain() {
  if (!state.audio.outputGainNode || !state.audio.context) {
    return;
  }

  state.audio.outputGainNode.gain.setValueAtTime(
    state.audio.volume * state.audio.outputBoost,
    state.audio.context.currentTime
  );
}

function playDashSound(context) {
  const start = context.currentTime;
  const master = context.createGain();
  master.connect(state.audio.outputGainNode || context.destination);

  master.gain.setValueAtTime(0.13, start);
  master.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);

  const low = context.createOscillator();
  const lowGain = context.createGain();
  low.type = "sawtooth";
  low.frequency.setValueAtTime(180, start);
  low.frequency.exponentialRampToValueAtTime(620, start + 0.12);
  lowGain.gain.setValueAtTime(1, start);
  lowGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
  low.connect(lowGain);
  lowGain.connect(master);

  const high = context.createOscillator();
  const highGain = context.createGain();
  high.type = "triangle";
  high.frequency.setValueAtTime(520, start);
  high.frequency.exponentialRampToValueAtTime(980, start + 0.08);
  highGain.gain.setValueAtTime(0.65, start);
  highGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
  high.connect(highGain);
  highGain.connect(master);

  low.start(start);
  high.start(start);
  low.stop(start + 0.2);
  high.stop(start + 0.14);
}

function playPlasmaHitSound(context) {
  const start = context.currentTime;
  const master = context.createGain();
  master.connect(state.audio.outputGainNode || context.destination);
  master.gain.setValueAtTime(0.085, start);
  master.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

  const zap = context.createOscillator();
  const zapGain = context.createGain();
  const zapFilter = context.createBiquadFilter();
  zap.type = "sawtooth";
  zap.frequency.setValueAtTime(980, start);
  zap.frequency.exponentialRampToValueAtTime(360, start + 0.07);
  zapFilter.type = "highpass";
  zapFilter.frequency.setValueAtTime(420, start);
  zapGain.gain.setValueAtTime(0.9, start);
  zapGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
  zap.connect(zapFilter);
  zapFilter.connect(zapGain);
  zapGain.connect(master);

  const crack = context.createOscillator();
  const crackGain = context.createGain();
  crack.type = "square";
  crack.frequency.setValueAtTime(640, start);
  crack.frequency.exponentialRampToValueAtTime(1320, start + 0.04);
  crackGain.gain.setValueAtTime(0.42, start);
  crackGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
  crack.connect(crackGain);
  crackGain.connect(master);

  const thump = context.createOscillator();
  const thumpGain = context.createGain();
  thump.type = "triangle";
  thump.frequency.setValueAtTime(180, start);
  thump.frequency.exponentialRampToValueAtTime(92, start + 0.11);
  thumpGain.gain.setValueAtTime(0.28, start);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
  thump.connect(thumpGain);
  thumpGain.connect(master);

  zap.start(start);
  crack.start(start + 0.004);
  thump.start(start);
  zap.stop(start + 0.09);
  crack.stop(start + 0.06);
  thump.stop(start + 0.14);
}

function playSound(kind) {
  const context = state.audio.context;
  if (!context || state.audio.volume <= 0) {
    return;
  }

  const now = performance.now();
  if (kind === "shoot" && now - state.audio.lastShootAt < 65) {
    return;
  }
  if (kind === "hit" && now - state.audio.lastHitAt < 45) {
    return;
  }
  if (kind === "plasmaHit" && now - state.audio.lastPlasmaHitAt < 55) {
    return;
  }

  if (kind === "shoot") {
    state.audio.lastShootAt = now;
  }
  if (kind === "hit") {
    state.audio.lastHitAt = now;
  }
  if (kind === "plasmaHit") {
    state.audio.lastPlasmaHitAt = now;
  }

  if (kind === "dash") {
    playDashSound(context);
    return;
  }
  if (kind === "plasmaHit") {
    playPlasmaHitSound(context);
    return;
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(state.audio.outputGainNode || context.destination);

  let frequency = 220;
  let endFrequency = frequency;
  let volume = 0.04;
  let duration = 0.09;
  let type = "square";

  if (kind === "shoot") {
    frequency = 340;
    endFrequency = 220;
    volume = 0.05;
    duration = 0.07;
    type = "square";
  } else if (kind === "hit") {
    frequency = 180;
    endFrequency = 120;
    volume = 0.035;
    duration = 0.06;
    type = "triangle";
  } else if (kind === "pickup") {
    frequency = 560;
    endFrequency = 780;
    volume = 0.055;
    duration = 0.1;
    type = "triangle";
  } else if (kind === "levelup") {
    frequency = 420;
    endFrequency = 820;
    volume = 0.065;
    duration = 0.18;
    type = "triangle";
  } else if (kind === "boss") {
    frequency = 150;
    endFrequency = 70;
    volume = 0.085;
    duration = 0.35;
    type = "sawtooth";
  } else if (kind === "start") {
    frequency = 300;
    endFrequency = 480;
    volume = 0.06;
    duration = 0.14;
    type = "triangle";
  } else if (kind === "gameover") {
    frequency = 280;
    endFrequency = 90;
    volume = 0.07;
    duration = 0.35;
    type = "sawtooth";
  } else if (kind === "laser") {
    frequency = 480;
    endFrequency = 320;
    volume = 0.03;
    duration = 0.06;
    type = "sine";
  } else if (kind === "plasma") {
    frequency = 250;
    endFrequency = 520;
    volume = 0.045;
    duration = 0.11;
    type = "triangle";
  }

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, endFrequency), context.currentTime + duration);

  gainNode.gain.setValueAtTime(volume, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

(function loadPersistedVolume() {
  try {
    const raw = localStorage.getItem("zombieRoguelikeVolume");
    if (raw !== null) {
      const n = Number.parseFloat(raw);
      if (Number.isFinite(n)) {
        state.audio.volume = clamp(n, 0, 1);
      }
    }

  } catch (_) {
    /* ignore */
  }
})();

loadCodexProgress();

function normalizeVector(x, y) {
  const length = Math.hypot(x, y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: x / length, y: y / length };
}

function getMoveInput() {
  let x = 0;
  let y = 0;

  if (keys.has("w") || keys.has("arrowup")) y -= 1;
  if (keys.has("s") || keys.has("arrowdown")) y += 1;
  if (keys.has("a") || keys.has("arrowleft")) x -= 1;
  if (keys.has("d") || keys.has("arrowright")) x += 1;

  x += state.touch.x;
  y += state.touch.y;

  return normalizeVector(x, y);
}

function hasWeapon(type) {
  return state.player.weapons.some((weapon) => weapon.type === type);
}

function getWeapon(type) {
  return state.player.weapons.find((weapon) => weapon.type === type);
}

function getLockedWeaponTypes() {
  return Object.keys(weaponDefinitions).filter((type) => !hasWeapon(type));
}

function getNearestEnemyInRange(range) {
  const player = state.player;
  let best = null;
  let bestDist = Infinity;

  for (const enemy of state.enemies) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= range && dist < bestDist) {
      best = enemy;
      bestDist = dist;
    }
  }

  return best;
}

function spawnProjectile(config) {
  state.projectiles.push({
    x: config.x,
    y: config.y,
    vx: config.vx,
    vy: config.vy,
    radius: config.radius,
    damage: config.damage,
    color: config.color,
    life: config.life,
    pierce: config.pierce,
    kind: config.kind || "ballistic",
    chainRange: config.chainRange || 0,
    chainTargets: config.chainTargets || 0,
    chainDamageFactor: config.chainDamageFactor || 0,
    chainDecay: config.chainDecay || 1,
    slowMultiplier: config.slowMultiplier || 1,
    slowDuration: config.slowDuration || 0,
    hitIds: new Set(),
  });
}

function distPointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-8) {
    return Math.hypot(px - x1, py - y1);
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = clamp(t, 0, 1);
  const nx = x1 + t * dx;
  const ny = y1 + t * dy;
  return Math.hypot(px - nx, py - ny);
}

function updateLaserAim(weapon, stats, player) {
  let aim = null;
  if (weapon.laserTargetId != null) {
    const locked = state.enemies.find((e) => e.id === weapon.laserTargetId);
    if (locked) {
      const d = Math.hypot(locked.x - player.x, locked.y - player.y);
      if (d <= stats.range) {
        aim = locked;
      }
    }
  }
  if (!aim) {
    aim = getNearestEnemyInRange(stats.range);
    weapon.laserTargetId = aim ? aim.id : null;
  }
  if (aim) {
    weapon.laserAngle = Math.atan2(aim.y - player.y, aim.x - player.x);
    player.facing = weapon.laserAngle;
  }
}

function applyLaserBeamDamage(weapon, stats, dt) {
  const player = state.player;
  const cos = Math.cos(weapon.laserAngle);
  const sin = Math.sin(weapon.laserAngle);
  const ox = player.x + cos * 18;
  const oy = player.y + sin * 18;
  const ex = player.x + cos * stats.range;
  const ey = player.y + sin * stats.range;
  const dmg = stats.dps * dt;
  let hitAny = false;

  for (let j = state.enemies.length - 1; j >= 0; j -= 1) {
    const enemy = state.enemies[j];
    const distSeg = distPointToSegment(enemy.x, enemy.y, ox, oy, ex, ey);
    if (distSeg > enemy.radius + stats.beamHalfWidth) {
      continue;
    }
    hitAny = true;
    enemy.hp -= dmg;
    enemy.laserFlash = 0.08;
    spawnLaserHitParticles(enemy, stats, weapon.laserAngle);
    if (enemy.hp <= 0) {
      handleEnemyDeath(enemy, j);
    } else if (enemy.kind === "boss") {
      updateBossBar();
    }
  }

  const now = performance.now();
  if (hitAny && now - state.audio.lastLaserHumAt > 85) {
    state.audio.lastLaserHumAt = now;
    playSound("laser");
  }
}

function updateLaserWeapon(weapon, dt, player) {
  const stats = weaponDefinitions.laser.getStats(weapon.level, player);

  if (weapon.beamTimeLeft > 0) {
    weapon.beamTimeLeft -= dt;
    updateLaserAim(weapon, stats, player);
    applyLaserBeamDamage(weapon, stats, dt);
    if (weapon.beamTimeLeft <= 0) {
      weapon.cooldownTimer = stats.magazineCooldown;
      weapon.beamTimeLeft = 0;
      weapon.laserTargetId = null;
    }
    return;
  }

  weapon.cooldownTimer = Math.max(0, weapon.cooldownTimer - dt);
  if (weapon.cooldownTimer > 0) {
    return;
  }

  const target = getNearestEnemyInRange(stats.range);
  if (!target) {
    return;
  }

  weapon.laserTargetId = target.id;
  weapon.laserAngle = Math.atan2(target.y - player.y, target.x - player.x);
  player.facing = weapon.laserAngle;
  weapon.beamTimeLeft = stats.beamDuration;
  playSound("laser");
  applyLaserBeamDamage(weapon, stats, dt);
}

function fireWeapon(weapon, stats, target) {
  const player = state.player;
  const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
  player.facing = baseAngle;

  const shots = weapon.type === "shotgun" ? stats.pellets : stats.projectiles;
  for (let i = 0; i < shots; i += 1) {
    let angleOffset = 0;
    if (shots > 1) {
      const step = shots === 1 ? 0 : i / (shots - 1);
      angleOffset = (step - 0.5) * stats.spread;
    } else if (stats.spread > 0.04) {
      angleOffset = randomRange(-stats.spread, stats.spread);
    }

    const angle = baseAngle + angleOffset;
    spawnProjectile({
      x: player.x + Math.cos(angle) * 18,
      y: player.y + Math.sin(angle) * 18,
      vx: Math.cos(angle) * stats.speed,
      vy: Math.sin(angle) * stats.speed,
      radius: stats.size,
      damage: stats.damage,
      color: stats.color,
      life: stats.range / stats.speed,
      pierce: stats.pierce,
      kind: weapon.type,
      chainRange: stats.chainRange,
      chainTargets: stats.chainTargets,
      chainDamageFactor: stats.chainDamageFactor,
      chainDecay: stats.chainDecay,
      slowMultiplier: stats.slowMultiplier,
      slowDuration: stats.slowDuration,
    });
  }

  playSound(weapon.type === "plasma" ? "plasma" : "shoot");
}

function spawnDashTrailParticles(player, dt) {
  const n = Math.max(1, Math.ceil(dt * 52));
  for (let i = 0; i < n; i += 1) {
    const back = randomRange(6, 22);
    const perpX = -player.dashDirY;
    const perpY = player.dashDirX;
    const px = player.x - player.dashDirX * back + perpX * randomRange(-8, 8);
    const py = player.y - player.dashDirY * back + perpY * randomRange(-8, 8);
    const life = randomRange(0.22, 0.48);
    state.dashTrailParticles.push({
      x: px,
      y: py,
      vx: -player.dashDirX * randomRange(35, 120) + randomRange(-28, 28),
      vy: -player.dashDirY * randomRange(35, 120) + randomRange(-28, 28),
      life,
      maxLife: life,
      r: randomRange(2.2, 5.2),
      color: DASH_TRAIL_COLORS[Math.floor(Math.random() * DASH_TRAIL_COLORS.length)],
    });
  }
}

function spawnLaserHitParticles(enemy, stats, beamAngle) {
  const n = enemy.kind === "boss" ? 5 : 3;
  const dirX = Math.cos(beamAngle);
  const dirY = Math.sin(beamAngle);
  const perpX = -dirY;
  const perpY = dirX;

  for (let i = 0; i < n; i += 1) {
    const spread = randomRange(-1, 1);
    const forward = randomRange(14, 60);
    const side = randomRange(-14, 14);
    const life = randomRange(0.08, 0.16);
    state.laserHitParticles.push({
      x: enemy.x + perpX * side,
      y: enemy.y + perpY * side,
      vx: dirX * forward + perpX * spread * 80,
      vy: dirY * forward + perpY * spread * 80,
      life,
      maxLife: life,
      r: randomRange(1.8, 3.8),
      color: stats.color,
    });
  }
}

function updateDashTrailParticles(dt) {
  for (let i = state.dashTrailParticles.length - 1; i >= 0; i -= 1) {
    const p = state.dashTrailParticles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.88, dt * 60);
    p.vy *= Math.pow(0.88, dt * 60);
    if (p.life <= 0) {
      state.dashTrailParticles.splice(i, 1);
    }
  }
}

function updateLaserHitParticles(dt) {
  for (let i = state.laserHitParticles.length - 1; i >= 0; i -= 1) {
    const p = state.laserHitParticles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.82, dt * 60);
    p.vy *= Math.pow(0.82, dt * 60);
    if (p.life <= 0) {
      state.laserHitParticles.splice(i, 1);
    }
  }
}

function updateChainArcs(dt) {
  for (let i = state.chainArcs.length - 1; i >= 0; i -= 1) {
    const arc = state.chainArcs[i];
    arc.life -= dt;
    if (arc.life <= 0) {
      state.chainArcs.splice(i, 1);
    }
  }
}

function applySlowToEnemy(enemy, slowMultiplier, slowDuration) {
  if (slowDuration <= 0) {
    return;
  }
  enemy.slowTimer = Math.max(enemy.slowTimer || 0, slowDuration);
  enemy.slowMultiplier = Math.min(enemy.slowMultiplier || 1, slowMultiplier);
  enemy.shockFlash = Math.max(enemy.shockFlash || 0, 0.14);
}

function spawnChainArc(x1, y1, x2, y2, color) {
  state.chainArcs.push({
    x1,
    y1,
    x2,
    y2,
    color,
    life: 0.12,
    maxLife: 0.12,
  });
}

function scoreChainTarget(originX, originY, candidate, visitedIds, chainRange) {
  const dist = Math.hypot(candidate.x - originX, candidate.y - originY);
  if (dist > chainRange) {
    return -Infinity;
  }

  const clusterRadius = Math.min(118, chainRange * 0.85);
  let densityScore = 0;
  for (const other of state.enemies) {
    if (other.id === candidate.id || visitedIds.has(other.id)) {
      continue;
    }
    const neighborDist = Math.hypot(other.x - candidate.x, other.y - candidate.y);
    if (neighborDist <= clusterRadius) {
      densityScore += 1 - (neighborDist / clusterRadius);
    }
  }

  const bossBonus = candidate.kind === "boss" ? 0.2 : 0;
  return densityScore * 100 - dist + bossBonus * 100;
}

function applyChainDamage(sourceX, sourceY, projectile, initialTargetId) {
  if (projectile.chainTargets <= 0) {
    return;
  }

  const visitedIds = new Set(projectile.hitIds);
  visitedIds.add(initialTargetId);
  let originX = sourceX;
  let originY = sourceY;
  let damage = projectile.damage * projectile.chainDamageFactor;

  for (let bounce = 0; bounce < projectile.chainTargets; bounce += 1) {
    let nextEnemy = null;
    let nextIndex = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < state.enemies.length; i += 1) {
      const enemy = state.enemies[i];
      if (visitedIds.has(enemy.id)) {
        continue;
      }
      const score = scoreChainTarget(originX, originY, enemy, visitedIds, projectile.chainRange);
      if (score > bestScore) {
        bestScore = score;
        nextEnemy = enemy;
        nextIndex = i;
      }
    }

    if (!nextEnemy) {
      break;
    }

    visitedIds.add(nextEnemy.id);
    projectile.hitIds.add(nextEnemy.id);
    spawnChainArc(originX, originY, nextEnemy.x, nextEnemy.y, projectile.color);
    nextEnemy.hp -= damage;
    applySlowToEnemy(nextEnemy, projectile.slowMultiplier, projectile.slowDuration);
    spawnFloatingText(nextEnemy.x, nextEnemy.y - nextEnemy.radius, `-${Math.round(damage)}`, "#9cf7ff");
    playSound("plasmaHit");

    if (nextEnemy.hp <= 0) {
      handleEnemyDeath(nextEnemy, nextIndex);
    } else if (nextEnemy.kind === "boss") {
      updateBossBar();
    }

    originX = nextEnemy.x;
    originY = nextEnemy.y;
    damage *= projectile.chainDecay;
  }
}

function drawDashTrailParticles(cameraX, cameraY) {
  for (const p of state.dashTrailParticles) {
    const t = p.life / p.maxLife;
    const alpha = t * 0.72;
    const sx = p.x - cameraX + canvas.width / 2;
    const sy = p.y - cameraY + canvas.height / 2;
    ctx.fillStyle = hexToRgba(p.color, alpha);
    ctx.beginPath();
    ctx.arc(sx, sy, p.r * (0.65 + 0.35 * t), 0, TAU);
    ctx.fill();
  }
}

function drawLaserHitParticles(cameraX, cameraY) {
  for (const p of state.laserHitParticles) {
    const t = p.life / p.maxLife;
    const alpha = 0.2 + t * 0.8;
    const sx = p.x - cameraX + canvas.width / 2;
    const sy = p.y - cameraY + canvas.height / 2;
    ctx.fillStyle = hexToRgba(p.color, alpha);
    ctx.beginPath();
    ctx.arc(sx, sy, p.r * (0.7 + 0.4 * t), 0, TAU);
    ctx.fill();
  }
}

function drawChainArcs(cameraX, cameraY) {
  ctx.save();
  ctx.lineCap = "round";
  for (const arc of state.chainArcs) {
    const alpha = arc.life / arc.maxLife;
    ctx.strokeStyle = hexToRgba(arc.color, 0.18 + alpha * 0.72);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(arc.x1 - cameraX + canvas.width / 2, arc.y1 - cameraY + canvas.height / 2);
    ctx.lineTo(arc.x2 - cameraX + canvas.width / 2, arc.y2 - cameraY + canvas.height / 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(235, 255, 255, ${0.16 + alpha * 0.64})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arc.x1 - cameraX + canvas.width / 2, arc.y1 - cameraY + canvas.height / 2);
    ctx.lineTo(arc.x2 - cameraX + canvas.width / 2, arc.y2 - cameraY + canvas.height / 2);
    ctx.stroke();
  }
  ctx.restore();
}

function tryStartDash() {
  if (state.phase !== "playing" || !state.player) {
    return;
  }
  const player = state.player;
  if (player.dashTimeLeft > 0 || player.dashCooldown > 0) {
    return;
  }
  const input = getMoveInput();
  let dx = input.x;
  let dy = input.y;
  if (dx === 0 && dy === 0) {
    dx = Math.cos(player.facing);
    dy = Math.sin(player.facing);
  } else {
    const n = normalizeVector(dx, dy);
    dx = n.x;
    dy = n.y;
  }
  player.dashDirX = dx;
  player.dashDirY = dy;
  player.dashTimeLeft = DASH_DURATION;
  player.dashCooldown = DASH_COOLDOWN;
  player.facing = Math.atan2(dy, dx);
  ensureAudio();
  playSound("dash");
  player.dashInvulnLeft = DASH_IFRAME_DURATION;
  spawnDashTrailParticles(player, 0.05);
}

function updatePlayer(dt) {
  const player = state.player;
  const input = getMoveInput();

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);

  if (player.dashTimeLeft > 0) {
    player.dashTimeLeft -= dt;
    player.x += player.dashDirX * DASH_SPEED * dt;
    player.y += player.dashDirY * DASH_SPEED * dt;
    player.facing = Math.atan2(player.dashDirY, player.dashDirX);
    spawnDashTrailParticles(player, dt);
  } else {
    player.x += input.x * player.moveSpeed * dt;
    player.y += input.y * player.moveSpeed * dt;
  }

  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  player.dashInvulnLeft = Math.max(0, player.dashInvulnLeft - dt);

  if (player.regen > 0) {
    player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);
  }

  for (const weapon of player.weapons) {
    if (weapon.type === "laser") {
      updateLaserWeapon(weapon, dt, player);
      continue;
    }

    weapon.cooldownTimer = Math.max(0, weapon.cooldownTimer - dt);
    if (weapon.cooldownTimer > 0) {
      continue;
    }

    const stats = weaponDefinitions[weapon.type].getStats(weapon.level, player);
    const target = getNearestEnemyInRange(stats.range);
    if (!target) {
      continue;
    }

    fireWeapon(weapon, stats, target);
    weapon.cooldownTimer = stats.cooldown;
  }
}

function isBossWave(wave) {
  return wave > 0 && wave % 3 === 0;
}

function createEnemy(kind, x, y) {
  const waveScale = 1 + (state.wave - 1) * 0.2;

  if (kind === "runner") {
    return {
      id: state.nextEnemyId++,
      kind,
      name: enemyDisplayName("runner"),
      x,
      y,
      radius: 12,
      hp: 22 * waveScale,
      maxHp: 22 * waveScale,
      speed: 128 + state.wave * 3,
      damage: 8 + state.wave * 0.4,
      xpValue: 10,
      tint: "#8ef7c5",
      laserFlash: 0,
      shockFlash: 0,
      slowTimer: 0,
      slowMultiplier: 1,
      touchDamageCooldown: 0,
      summonTimer: 0,
    };
  }

  if (kind === "brute") {
    return {
      id: state.nextEnemyId++,
      kind,
      name: enemyDisplayName("brute"),
      x,
      y,
      radius: 19,
      hp: 74 * waveScale,
      maxHp: 74 * waveScale,
      speed: 62 + state.wave * 1.8,
      damage: 18 + state.wave * 0.7,
      xpValue: 18,
      tint: "#ffb067",
      laserFlash: 0,
      shockFlash: 0,
      slowTimer: 0,
      slowMultiplier: 1,
      touchDamageCooldown: 0,
      summonTimer: 0,
    };
  }

  if (kind === "boss") {
    return {
      id: state.nextEnemyId++,
      kind,
      name: enemyDisplayName("boss"),
      x,
      y,
      radius: 30,
      hp: 620 + state.wave * 190,
      maxHp: 620 + state.wave * 190,
      speed: 76 + state.wave * 2,
      damage: 24 + state.wave,
      xpValue: 120 + state.wave * 30,
      tint: "#ff5d70",
      laserFlash: 0,
      shockFlash: 0,
      slowTimer: 0,
      slowMultiplier: 1,
      touchDamageCooldown: 0,
      summonTimer: 4.8,
    };
  }

  return {
    id: state.nextEnemyId++,
    kind: "walker",
    name: enemyDisplayName("walker"),
    x,
    y,
    radius: 14,
    hp: 34 * waveScale,
    maxHp: 34 * waveScale,
    speed: 84 + state.wave * 2,
    damage: 10 + state.wave * 0.5,
    xpValue: 8,
    tint: "#9bf25a",
    laserFlash: 0,
    shockFlash: 0,
    slowTimer: 0,
    slowMultiplier: 1,
    touchDamageCooldown: 0,
    summonTimer: 0,
  };
}

function getSpawnPositionNear(originX, originY, distanceMin, distanceMax) {
  const angle = Math.random() * TAU;
  const distance = randomRange(distanceMin, distanceMax);
  return {
    x: originX + Math.cos(angle) * distance,
    y: originY + Math.sin(angle) * distance,
  };
}

function getSpawnPositionAtViewportEdge(originX = state.player.x, originY = state.player.y, outwardMin = 36, outwardMax = 100) {
  const halfW = canvas.width / 2;
  const halfH = canvas.height / 2;
  const pad = randomRange(outwardMin, outwardMax);
  const edge = Math.floor(Math.random() * 4);
  let x;
  let y;

  if (edge === 0) {
    y = originY - halfH - pad;
    x = originX + randomRange(-halfW - pad, halfW + pad);
  } else if (edge === 1) {
    x = originX + halfW + pad;
    y = originY + randomRange(-halfH - pad, halfH + pad);
  } else if (edge === 2) {
    y = originY + halfH + pad;
    x = originX + randomRange(-halfW - pad, halfW + pad);
  } else {
    x = originX - halfW - pad;
    y = originY + randomRange(-halfH - pad, halfH + pad);
  }

  return { x, y };
}

function pickEnemyTypeForWave() {
  const roll = Math.random();
  if (state.wave >= 5 && roll > 0.75) {
    return "brute";
  }
  if (state.wave >= 2 && roll > 0.45) {
    return "runner";
  }
  return "walker";
}

function spawnEnemy(kind = pickEnemyTypeForWave()) {
  const spawn = getSpawnPositionAtViewportEdge();
  discoverEnemy(kind);
  state.enemies.push(createEnemy(kind, spawn.x, spawn.y));
}

function spawnBoss() {
  const spawn = getSpawnPositionAtViewportEdge(state.player.x, state.player.y, 64, 140);
  discoverEnemy("boss");
  const boss = createEnemy("boss", spawn.x, spawn.y);
  state.enemies.push(boss);
  state.boss = boss;
  state.bossSpawnedInWave = true;
  message.textContent = t("msg.bossSpawn", { wave: state.wave, name: boss.name });
  state.waveAnnouncementTimer = 3;
  updateBossBar();
  playSound("boss");
}

function updateWave(dt) {
  const previousWave = state.wave;
  state.wave = Math.floor(state.elapsed / state.waveDuration) + 1;
  if (state.wave !== previousWave) {
    state.waveAnnouncementTimer = 2.4;
    state.bossSpawnedInWave = false;
    message.textContent = t("msg.waveStart", { wave: state.wave });
  }

  if (state.waveAnnouncementTimer > 0) {
    state.waveAnnouncementTimer = Math.max(0, state.waveAnnouncementTimer - dt);
  }

  if (isBossWave(state.wave) && !state.boss && !state.bossSpawnedInWave) {
    spawnBoss();
  }
}

function updateSpawning(dt) {
  state.spawnTimer += dt;

  const baseInterval = Math.max(0.2, 0.9 - state.wave * 0.05);
  const interval = state.boss ? baseInterval * 1.25 : baseInterval;

  while (state.spawnTimer >= interval) {
    state.spawnTimer -= interval;
    let count = 1 + Math.floor((state.wave - 1) / 2);
    if (state.boss) {
      count = Math.max(1, count - 1);
    }

    for (let i = 0; i < count; i += 1) {
      spawnEnemy();
    }
  }
}

function spawnPickup(type, x, y, value = 0) {
  state.pickups.push({
    type,
    x,
    y,
    value,
    radius: type === "cache" ? 10 : 8,
    life: 20,
    magnetized: false,
  });
}

function handleEnemyDeath(enemy, index) {
  state.kills += 1;
  awardKillScore(enemy);
  spawnPickup("xp", enemy.x, enemy.y, enemy.xpValue);

  if (enemy.kind === "boss") {
    spawnPickup("cache", enemy.x + 26, enemy.y - 12, 1);
    spawnPickup("heal", enemy.x - 24, enemy.y + 8, 35);
    state.boss = null;
    message.textContent = t("msg.enemyDown", { name: enemy.name });
    updateBossBar();
  } else {
    if (Math.random() < 0.085) {
      spawnPickup("heal", enemy.x, enemy.y, 24);
    }
    if (Math.random() < 0.045) {
      spawnPickup("magnet", enemy.x, enemy.y, 1);
    }
  }

  state.enemies.splice(index, 1);
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.projectiles[i];
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;

    let removeProjectile = projectile.life <= 0;

    for (let j = state.enemies.length - 1; j >= 0; j -= 1) {
      const enemy = state.enemies[j];
      if (projectile.hitIds.has(enemy.id)) {
        continue;
      }

      const dx = enemy.x - projectile.x;
      const dy = enemy.y - projectile.y;
      const dist = Math.hypot(dx, dy);
      if (dist > enemy.radius + projectile.radius) {
        continue;
      }

      projectile.hitIds.add(enemy.id);
      enemy.hp -= projectile.damage;
      if (projectile.kind === "plasma") {
        applySlowToEnemy(enemy, projectile.slowMultiplier, projectile.slowDuration);
        spawnChainArc(projectile.x, projectile.y, enemy.x, enemy.y, projectile.color);
      }
      spawnFloatingText(enemy.x, enemy.y - enemy.radius, `-${Math.round(projectile.damage)}`, "#fff1a1");
      playSound(projectile.kind === "plasma" ? "plasmaHit" : "hit");

      if (projectile.kind === "plasma") {
        applyChainDamage(enemy.x, enemy.y, projectile, enemy.id);
      }

      if (enemy.hp <= 0) {
        handleEnemyDeath(enemy, j);
      } else if (enemy.kind === "boss") {
        updateBossBar();
      }

      if (projectile.pierce > 0) {
        projectile.pierce -= 1;
      } else {
        removeProjectile = true;
        break;
      }
    }

    if (removeProjectile) {
      state.projectiles.splice(i, 1);
    }
  }
}

function updateEnemies(dt) {
  const player = state.player;

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const angle = Math.atan2(dy, dx);
    enemy.slowTimer = Math.max(0, (enemy.slowTimer || 0) - dt);
    if (enemy.slowTimer <= 0) {
      enemy.slowMultiplier = 1;
    }
    const moveScale = enemy.slowTimer > 0 ? enemy.slowMultiplier : 1;

    enemy.x += Math.cos(angle) * enemy.speed * moveScale * dt;
    enemy.y += Math.sin(angle) * enemy.speed * moveScale * dt;
    enemy.touchDamageCooldown = Math.max(0, enemy.touchDamageCooldown - dt);
    enemy.laserFlash = Math.max(0, (enemy.laserFlash || 0) - dt);
    enemy.shockFlash = Math.max(0, (enemy.shockFlash || 0) - dt);

    if (enemy.kind === "boss") {
      enemy.summonTimer -= dt;
      if (enemy.summonTimer <= 0) {
        enemy.summonTimer = Math.max(2.6, 4.8 - state.wave * 0.1);
        for (let n = 0; n < 4; n += 1) {
          const kind = n % 2 === 0 ? "walker" : "runner";
          const spawn = getSpawnPositionNear(enemy.x, enemy.y, 34, 82);
          discoverEnemy(kind);
          state.enemies.push(createEnemy(kind, spawn.x, spawn.y));
        }
        message.textContent = t("msg.bossSummon", { name: enemy.name });
      }
    }

    const dist = Math.hypot(dx, dy);
    if (dist <= enemy.radius + player.radius + 4 && enemy.touchDamageCooldown <= 0) {
      enemy.touchDamageCooldown = enemy.kind === "boss" ? 0.55 : 0.7;
      if (player.invulnerableTimer <= 0 && player.dashInvulnLeft <= 0) {
        player.hp -= enemy.damage;
        player.invulnerableTimer = 0.35;
        message.textContent = t("msg.playerHit");
        spawnFloatingText(player.x, player.y - 24, `-${Math.round(enemy.damage)}`, "#ffb7b7");

        if (player.hp <= 0) {
          player.hp = 0;
          triggerGameOver();
          return;
        }
      }
    }
  }
}

function updatePickups(dt) {
  const player = state.player;

  for (let i = state.pickups.length - 1; i >= 0; i -= 1) {
    const pickup = state.pickups[i];
    pickup.life -= dt;
    if (pickup.life <= 0) {
      state.pickups.splice(i, 1);
      continue;
    }

    const dx = player.x - pickup.x;
    const dy = player.y - pickup.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= player.magnetRange || pickup.magnetized) {
      const pull = normalizeVector(dx, dy);
      pickup.x += pull.x * 220 * dt;
      pickup.y += pull.y * 220 * dt;
    }

    if (dist <= player.radius + pickup.radius + 10) {
      collectPickup(pickup);
      state.pickups.splice(i, 1);
    }
  }
}

function collectPickup(pickup) {
  const player = state.player;
  playSound("pickup");

  if (pickup.type === "xp") {
    gainXp(pickup.value);
    spawnFloatingText(player.x, player.y - 26, t("float.exp", { v: pickup.value }), "#89f6ff");
    return;
  }

  if (pickup.type === "heal") {
    player.hp = Math.min(player.maxHp, player.hp + pickup.value);
    message.textContent = t("msg.pickupHeal");
    spawnFloatingText(player.x, player.y - 26, t("float.hp", { v: pickup.value }), "#a5ffb1");
    return;
  }

  if (pickup.type === "magnet") {
    message.textContent = t("msg.magnetStart");
    for (const orb of state.pickups) {
      if (orb.type === "xp") {
        orb.magnetized = true;
      }
    }
    player.magnetRange += 10;
    spawnFloatingText(player.x, player.y - 26, t("float.magnetShort"), "#d1a8ff");
    return;
  }

  if (pickup.type === "cache") {
    grantBossLoot();
  }
}

function grantBossLoot() {
  const player = state.player;
  const locked = getLockedWeaponTypes();
  if (locked.length > 0) {
    const weaponType = locked[Math.floor(Math.random() * locked.length)];
    player.weapons.push(createWeapon(weaponType));
    discoverWeapon(weaponType);
    message.textContent = t("msg.bossLootUnlock", { weapon: weaponName(weaponType) });
    spawnFloatingText(player.x, player.y - 26, t("float.unlock", { w: weaponName(weaponType) }), "#ffd98e");
  } else {
    const weapon = player.weapons[Math.floor(Math.random() * player.weapons.length)];
    const definition = weaponDefinitions[weapon.type];
    if (weapon.level < definition.maxLevel) {
      weapon.level += 1;
      message.textContent = t("msg.bossLootLevel", {
        weapon: weaponName(weapon.type),
        level: weapon.level,
      });
      spawnFloatingText(
        player.x,
        player.y - 26,
        t("float.wpnLevel", { w: weaponName(weapon.type), lv: weapon.level }),
        "#ffd98e"
      );
    } else {
      player.damageMultiplier *= 1.08;
      message.textContent = t("msg.bossLootBuff");
      spawnFloatingText(player.x, player.y - 26, t("float.buffAll"), "#ffd98e");
    }
  }

  player.hp = Math.min(player.maxHp, player.hp + 18);
  gainXp(24);
  updateHud();
}

function spawnFloatingText(x, y, text, color) {
  state.damageTexts.push({
    x,
    y,
    text,
    color,
    life: 0.7,
    maxLife: 0.7,
  });
}

function updateFloatingTexts(dt) {
  for (let i = state.damageTexts.length - 1; i >= 0; i -= 1) {
    const text = state.damageTexts[i];
    text.y -= 26 * dt;
    text.life -= dt;
    if (text.life <= 0) {
      state.damageTexts.splice(i, 1);
    }
  }
}

function gainXp(amount) {
  const player = state.player;
  player.xp += amount;

  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level += 1;
    player.xpToNext = Math.floor(player.xpToNext * 1.24 + 18);
    state.pendingLevelUps += 1;
  }

  if (state.pendingLevelUps > 0 && state.phase === "playing") {
    showLevelUp();
  }
}

function createStatUpgradeChoices() {
  return [
    {
      title: t("upgrade.damage.title"),
      description: t("upgrade.damage.desc"),
      apply() {
        state.player.damageMultiplier *= 1.12;
      },
    },
    {
      title: t("upgrade.fire.title"),
      description: t("upgrade.fire.desc"),
      apply() {
        state.player.fireRate *= 1.1;
      },
    },
    {
      title: t("upgrade.boots.title"),
      description: t("upgrade.boots.desc"),
      apply() {
        state.player.moveSpeed += 24;
      },
    },
    {
      title: t("upgrade.med.title"),
      description: t("upgrade.med.desc"),
      apply() {
        state.player.maxHp += 18;
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + 18);
      },
    },
    {
      title: t("upgrade.regen.title"),
      description: t("upgrade.regen.desc"),
      apply() {
        state.player.regen += 0.35;
      },
    },
    {
      title: t("upgrade.magnet.title"),
      description: t("upgrade.magnet.desc"),
      apply() {
        state.player.magnetRange += 45;
      },
    },
  ];
}

function buildUpgradeChoices() {
  const pool = createStatUpgradeChoices();

  for (const weaponType of Object.keys(weaponDefinitions)) {
    const definition = weaponDefinitions[weaponType];
    const ownedWeapon = getWeapon(weaponType);

    if (!ownedWeapon) {
      pool.push({
        title: t("upgrade.unlockTitle", { name: weaponName(weaponType) }),
        description: weaponUnlockText(weaponType),
        apply() {
          state.player.weapons.push(createWeapon(weaponType));
          discoverWeapon(weaponType);
        },
      });
      continue;
    }

    if (ownedWeapon.level < definition.maxLevel) {
      pool.push({
        title: t("upgrade.levelTitle", { name: weaponName(weaponType) }),
        description: t("upgrade.levelDesc", {
          name: weaponName(weaponType),
          next: ownedWeapon.level + 1,
        }),
        apply() {
          ownedWeapon.level += 1;
        },
      });
    }
  }

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 3);
}

function showLevelUp() {
  if (state.pendingLevelUps <= 0 || state.phase === "gameover") {
    return;
  }

  state.pendingLevelUps -= 1;
  state.phase = "levelup";
  playSound("levelup");
  message.textContent = t("msg.levelUpPick");

  const choices = buildUpgradeChoices();
  showOverlay(t("level.title"), t("level.subtitle"), choices.map((choice) => ({
    label: choice.title,
    description: choice.description,
    onClick() {
      choice.apply();
      updateHud();
      message.textContent = t("msg.gotUpgrade", { title: choice.title });

      if (state.pendingLevelUps > 0) {
        showLevelUp();
      } else {
        state.phase = "playing";
        hideOverlay();
      }
    },
  })));
}

function showGameOverOverlay() {
  const g = state.lastGameOver;
  if (!g) {
    return;
  }
  const loc = currentLocale === "en" ? "en-US" : "zh-CN";
  showOverlay(
    t("go.title"),
    t("go.body", {
      score: g.finalScore.toLocaleString(loc),
      time: formatTime(g.elapsed),
      wave: g.wave,
      kills: g.kills,
    }),
    [
      {
        label: t("go.again.label"),
        description: t("go.again.desc"),
        onClick: startRun,
      },
      {
        label: t("go.menu.label"),
        description: t("go.menu.desc"),
        onClick: showStartMenu,
      },
    ]
  );
}

function triggerGameOver() {
  recordLeaderboardEntry();
  const finalScore = computeRunScore();
  state.lastGameOver = {
    finalScore,
    elapsed: state.elapsed,
    wave: state.wave,
    kills: state.kills,
  };
  state.phase = "gameover";
  playSound("gameover");
  updateHud();
  showGameOverOverlay();
}

function update(dt) {
  if (state.phase !== "playing") {
    updateFloatingTexts(dt);
    return;
  }

  state.elapsed += dt;
  updateWave(dt);
  updatePlayer(dt);
  updateSpawning(dt);
  updateProjectiles(dt);
  updateEnemies(dt);
  updatePickups(dt);
  updateFloatingTexts(dt);
  updateCombo(dt);
  updateDashTrailParticles(dt);
  updateLaserHitParticles(dt);
  updateChainArcs(dt);

  const laserLockFacing = state.player.weapons.some(
    (w) => w.type === "laser" && w.beamTimeLeft > 0
  );
  const dashing = state.player.dashTimeLeft > 0;
  const target = getNearestEnemyInRange(9999);
  if (!laserLockFacing && !dashing && target) {
    state.player.facing = Math.atan2(target.y - state.player.y, target.x - state.player.x);
  }

  if (!target && Math.floor(state.elapsed) % 6 === 0) {
    message.textContent = t("msg.noTargets");
  }

  updateBossBar();
  updateHud();
}

function drawGrid(cameraX, cameraY) {
  const size = 64;
  const startX = Math.floor((cameraX - canvas.width / 2) / size) * size;
  const endX = cameraX + canvas.width / 2 + size;
  const startY = Math.floor((cameraY - canvas.height / 2) / size) * size;
  const endY = cameraY + canvas.height / 2 + size;

  ctx.strokeStyle = "rgba(147, 176, 228, 0.08)";
  ctx.lineWidth = 1;

  for (let x = startX; x <= endX; x += size) {
    ctx.beginPath();
    ctx.moveTo(x - cameraX + canvas.width / 2, 0);
    ctx.lineTo(x - cameraX + canvas.width / 2, canvas.height);
    ctx.stroke();
  }

  for (let y = startY; y <= endY; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y - cameraY + canvas.height / 2);
    ctx.lineTo(canvas.width, y - cameraY + canvas.height / 2);
    ctx.stroke();
  }
}

function drawPickups(cameraX, cameraY) {
  for (const pickup of state.pickups) {
    const x = pickup.x - cameraX + canvas.width / 2;
    const y = pickup.y - cameraY + canvas.height / 2;

    if (pickup.type === "xp") {
      ctx.fillStyle = "#6ee9ff";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, TAU);
      ctx.fill();
      continue;
    }

    if (pickup.type === "heal") {
      ctx.fillStyle = "#7bff96";
      ctx.fillRect(x - 7, y - 7, 14, 14);
      ctx.fillStyle = "#0b1020";
      ctx.fillRect(x - 2, y - 5, 4, 10);
      ctx.fillRect(x - 5, y - 2, 10, 4);
      continue;
    }

    if (pickup.type === "magnet") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#c08cff";
      ctx.fillRect(-7, -7, 14, 14);
      ctx.restore();
      continue;
    }

    ctx.fillStyle = "#ffd27e";
    ctx.fillRect(x - 8, y - 8, 16, 16);
    ctx.strokeStyle = "#fff1c8";
    ctx.strokeRect(x - 8, y - 8, 16, 16);
  }
}

function drawProjectiles(cameraX, cameraY) {
  for (const projectile of state.projectiles) {
    const sx = projectile.x - cameraX + canvas.width / 2;
    const sy = projectile.y - cameraY + canvas.height / 2;
    if (projectile.kind === "plasma") {
      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = hexToRgba(projectile.color, 0.65);
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(sx, sy, projectile.radius, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(235, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(2, projectile.radius * 0.45), 0, TAU);
      ctx.fill();
      ctx.restore();
      continue;
    }
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(sx, sy, projectile.radius, 0, TAU);
    ctx.fill();
  }
}

function drawEnemies(cameraX, cameraY) {
  for (const enemy of state.enemies) {
    const x = enemy.x - cameraX + canvas.width / 2;
    const y = enemy.y - cameraY + canvas.height / 2;

    if (x < -70 || x > canvas.width + 70 || y < -70 || y > canvas.height + 70) {
      continue;
    }

    ctx.fillStyle = enemy.tint;
    ctx.beginPath();
    ctx.arc(x, y, enemy.radius, 0, TAU);
    ctx.fill();

    if ((enemy.laserFlash || 0) > 0) {
      const alpha = Math.min(0.85, enemy.laserFlash / 0.08);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, enemy.radius * 0.92, 0, TAU);
      ctx.fill();
    }

    if ((enemy.shockFlash || 0) > 0) {
      const alpha = Math.min(0.7, enemy.shockFlash / 0.14);
      ctx.strokeStyle = `rgba(142, 246, 255, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, enemy.radius + 3, 0, TAU);
      ctx.stroke();
    }

    if ((enemy.slowTimer || 0) > 0) {
      const slowAlpha = Math.min(0.34, enemy.slowTimer * 0.14);
      ctx.fillStyle = `rgba(120, 225, 255, ${slowAlpha * 0.22})`;
      ctx.beginPath();
      ctx.arc(x, y, enemy.radius + 6, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = `rgba(144, 232, 255, ${slowAlpha})`;
      ctx.lineWidth = 2;
      for (let spark = 0; spark < 3; spark += 1) {
        const base = state.elapsed * 5.2 + enemy.id * 0.9 + spark * 2.1;
        const r = enemy.radius + 5;
        const ax = x + Math.cos(base) * r;
        const ay = y + Math.sin(base) * r;
        const bx = x + Math.cos(base + 0.22) * (r + 4);
        const by = y + Math.sin(base + 0.22) * (r + 4);
        const cx = x + Math.cos(base + 0.44) * r;
        const cy = y + Math.sin(base + 0.44) * r;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }
    }

    if (enemy.kind === "boss") {
      ctx.strokeStyle = "#ffd6dd";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (enemy.kind === "brute" || enemy.kind === "boss") {
      const hpWidth = enemy.radius * 2.4;
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(x - hpWidth / 2, y - enemy.radius - 12, hpWidth, 5);
      ctx.fillStyle = enemy.kind === "boss" ? "#ff6d7f" : "#ffb067";
      ctx.fillRect(x - hpWidth / 2, y - enemy.radius - 12, hpWidth * (enemy.hp / enemy.maxHp), 5);
    }
  }
}

function drawPlayer() {
  const player = state.player;
  const x = canvas.width / 2;
  const y = canvas.height / 2;

  ctx.save();
  ctx.translate(x, y);

  if (player.dashTimeLeft > 0) {
    const glowRadius = player.radius + 4;
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(100, 200, 255, 0.55)";
    ctx.strokeStyle = "rgba(185, 240, 255, 0.88)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, TAU);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(140, 210, 255, 0.2)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius + 2, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = player.invulnerableTimer > 0 ? "#ffd7d7" : "#77b7ff";
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "#cfe7ff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(player.facing) * 22, Math.sin(player.facing) * 22);
  ctx.stroke();
  ctx.restore();
}

function drawFloatingTexts(cameraX, cameraY) {
  ctx.textAlign = "center";
  ctx.font = "bold 14px Arial";

  for (const item of state.damageTexts) {
    const alpha = item.life / item.maxLife;
    const x = item.x - cameraX + canvas.width / 2;
    const y = item.y - cameraY + canvas.height / 2;
    const rgb = item.color;
    ctx.fillStyle = hexToRgba(rgb, alpha);
    ctx.fillText(item.text, x, y);
  }
}

function drawWeaponHints() {
  const player = state.player;
  for (const weapon of player.weapons) {
    const stats = weaponDefinitions[weapon.type].getStats(weapon.level, player);
    if (!stats.range) {
      continue;
    }
    ctx.strokeStyle = "rgba(135, 188, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(stats.range, 420), 0, TAU);
    ctx.stroke();
  }
}

function drawLaserBeams() {
  const player = state.player;
  for (const weapon of player.weapons) {
    if (weapon.type !== "laser" || weapon.beamTimeLeft <= 0) {
      continue;
    }
    const stats = weaponDefinitions.laser.getStats(weapon.level, player);
    const cos = Math.cos(weapon.laserAngle);
    const sin = Math.sin(weapon.laserAngle);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const x1 = cx + cos * 20;
    const y1 = cy + sin * 20;
    const x2 = cx + cos * stats.range;
    const y2 = cy + sin * stats.range;

    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = hexToRgba(stats.color, 0.35);
    ctx.lineWidth = stats.beamHalfWidth * 2 + 10;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = hexToRgba(stats.color, 0.55);
    ctx.lineWidth = Math.max(6, stats.beamHalfWidth * 1.2);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(240, 255, 252, 0.92)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawWaveBanner() {
  if (state.waveAnnouncementTimer <= 0) {
    return;
  }

  const alpha = Math.min(1, state.waveAnnouncementTimer);
  ctx.fillStyle = `rgba(239, 245, 255, ${alpha})`;
  ctx.textAlign = "center";
  ctx.font = "bold 26px Arial";
  ctx.fillText(
    isBossWave(state.wave)
      ? t("banner.bossWave", { wave: state.wave })
      : t("banner.wave", { wave: state.wave }),
    canvas.width / 2,
    52
  );
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const expanded = value.length === 3
    ? value.split("").map((part) => part + part).join("")
    : value;
  const number = Number.parseInt(expanded, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#10182c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cameraX = state.player.x;
  const cameraY = state.player.y;

  drawGrid(cameraX, cameraY);
  drawWeaponHints();
  drawPickups(cameraX, cameraY);
  drawProjectiles(cameraX, cameraY);
  drawChainArcs(cameraX, cameraY);
  drawEnemies(cameraX, cameraY);
  drawDashTrailParticles(cameraX, cameraY);
  drawLaserHitParticles(cameraX, cameraY);
  drawLaserBeams();
  drawPlayer();
  drawFloatingTexts(cameraX, cameraY);
  drawWaveBanner();
}

function setTouchVector(clientX, clientY) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = clientX - centerX;
  const dy = clientY - centerY;
  const maxDistance = 34;
  const distance = Math.hypot(dx, dy);
  const ratio = distance > maxDistance ? maxDistance / distance : 1;
  const clampedX = dx * ratio;
  const clampedY = dy * ratio;

  state.touch.x = clampedX / maxDistance;
  state.touch.y = clampedY / maxDistance;
  joystickKnob.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
}

function resetTouchVector() {
  state.touch.active = false;
  state.touch.id = null;
  state.touch.x = 0;
  state.touch.y = 0;
  joystickKnob.style.transform = "translate(-50%, -50%)";
}

function setupTouchControls() {
  const startTouch = (event) => {
    ensureAudio();
    document.body.classList.add("touch-enabled");
    const touch = event.changedTouches[0];
    state.touch.active = true;
    state.touch.id = touch.identifier;
    setTouchVector(touch.clientX, touch.clientY);
    event.preventDefault();
  };

  const moveTouch = (event) => {
    if (!state.touch.active) {
      return;
    }

    for (const touch of event.changedTouches) {
      if (touch.identifier === state.touch.id) {
        setTouchVector(touch.clientX, touch.clientY);
        event.preventDefault();
        return;
      }
    }
  };

  const endTouch = (event) => {
    for (const touch of event.changedTouches) {
      if (touch.identifier === state.touch.id) {
        resetTouchVector();
        event.preventDefault();
        return;
      }
    }
  };

  joystick.addEventListener("touchstart", startTouch, { passive: false });
  joystick.addEventListener("touchmove", moveTouch, { passive: false });
  joystick.addEventListener("touchend", endTouch, { passive: false });
  joystick.addEventListener("touchcancel", endTouch, { passive: false });

  canvas.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false });
  canvas.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
}

let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (!event.repeat) {
    if (event.key === " " && state.phase === "playing") {
      event.preventDefault();
      tryStartDash();
      return;
    }
    if (state.phase === "playing" && (key === "p" || key === "escape")) {
      event.preventDefault();
      pauseGame();
      keys.delete(key);
      return;
    }
    if (state.phase === "paused" && (key === "p" || key === "escape")) {
      event.preventDefault();
      resumeGame();
      keys.delete(key);
      return;
    }
    if (state.phase === "paused_settings" && (key === "p" || key === "escape")) {
      event.preventDefault();
      state.phase = "paused";
      showPauseMenu();
      keys.delete(key);
      return;
    }
    if (state.phase === "menu_settings" && (key === "p" || key === "escape")) {
      event.preventDefault();
      state.phase = "menu";
      openMainMenuOverlay();
      keys.delete(key);
      return;
    }
  }

  keys.add(key);
  if (key === "enter" && state.phase === "menu") {
    startRun();
  }
  ensureAudio();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

window.addEventListener("touchstart", () => {
  document.body.classList.add("touch-enabled");
  ensureAudio();
}, { passive: true });

setupTouchControls();
requestAnimationFrame(() => {
  resizeCanvasToDisplay();
  applyStaticPageStrings();
  refreshHudLabels();
  showStartMenu();
  requestAnimationFrame(gameLoop);
});
