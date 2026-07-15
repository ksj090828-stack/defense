(() => {
  "use strict";

  const app = document.getElementById("app");
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const shell = document.querySelector(".game-shell");

  const ui = {
    score: document.getElementById("score"),
    health: document.getElementById("health"),
    combo: document.getElementById("combo"),
    level: document.getElementById("level"),
    reaction: document.getElementById("reaction"),
    best: document.getElementById("best"),
    bestComboRecord: document.getElementById("bestComboRecord"),
    bestReactionRecord: document.getElementById("bestReactionRecord"),
    coins: document.getElementById("coins"),
    skillFill: document.getElementById("skillFill"),
    skillText: document.getElementById("skillText"),
    skillBtn: document.getElementById("skillBtn"),
    weaponName: document.getElementById("weaponName"),
    weaponHelp: document.getElementById("weaponHelp"),
    soundBtn: document.getElementById("soundBtn"),
    pauseBtn: document.getElementById("pauseBtn"),
    settingsBtn: document.getElementById("settingsBtn"),
    toast: document.getElementById("toast"),
    waveBanner: document.getElementById("waveBanner"),
    startOverlay: document.getElementById("startOverlay"),
    pauseOverlay: document.getElementById("pauseOverlay"),
    gameOverOverlay: document.getElementById("gameOverOverlay"),
    shopOverlay: document.getElementById("shopOverlay"),
    loadoutOverlay: document.getElementById("loadoutOverlay"),
    coreOverlay: document.getElementById("coreOverlay"),
    settingsOverlay: document.getElementById("settingsOverlay"),
    confirmOverlay: document.getElementById("confirmOverlay"),
    settingsCoins: document.getElementById("settingsCoins"),
    creditMultiplierSlider: document.getElementById("creditMultiplierSlider"),
    creditMultiplierValue: document.getElementById("creditMultiplierValue"),
    difficultyMultiplierSlider: document.getElementById("difficultyMultiplierSlider"),
    difficultyMultiplierValue: document.getElementById("difficultyMultiplierValue"),
    strikeLineToggle: document.getElementById("strikeLineToggle"),
    strikeLineStatus: document.getElementById("strikeLineStatus"),
    leftOrderToggle: document.getElementById("leftOrderToggle"),
    leftOrderStatus: document.getElementById("leftOrderStatus"),
    confirmTitle: document.getElementById("confirmTitle"),
    confirmMessage: document.getElementById("confirmMessage"),
    shopCoins: document.getElementById("shopCoins"),
    loadoutCoins: document.getElementById("loadoutCoins"),
    coreCoins: document.getElementById("coreCoins"),
    drawResult: document.getElementById("drawResult"),
    inventoryGrid: document.getElementById("inventoryGrid"),
    coreModuleGrid: document.getElementById("coreModuleGrid"),
    coreSkinGrid: document.getElementById("coreSkinGrid"),
    coreModuleEquipped: document.getElementById("coreModuleEquipped"),
    coreSkinEquipped: document.getElementById("coreSkinEquipped"),
    startModuleName: document.getElementById("startModuleName"),
    startSkinName: document.getElementById("startSkinName"),
    startCredits: document.getElementById("startCredits"),
    finalScore: document.getElementById("finalScore"),
    finalCombo: document.getElementById("finalCombo"),
    finalReaction: document.getElementById("finalReaction"),
    finalKills: document.getElementById("finalKills"),
    finalLevel: document.getElementById("finalLevel"),
    finalBest: document.getElementById("finalBest"),
    finalRecordCombo: document.getElementById("finalRecordCombo"),
    finalRecordReaction: document.getElementById("finalRecordReaction"),
    finalReward: document.getElementById("finalReward"),
    finalCoins: document.getElementById("finalCoins")
  };

  const buttons = {
    settings: document.getElementById("settingsBtn"),
    start: document.getElementById("startBtn"),
    startShop: document.getElementById("startShopBtn"),
    startLoadout: document.getElementById("startLoadoutBtn"),
    startCore: document.getElementById("startCoreBtn"),
    startSettings: document.getElementById("startSettingsBtn"),
    gameOverShop: document.getElementById("gameOverShopBtn"),
    gameOverLoadout: document.getElementById("gameOverLoadoutBtn"),
    gameOverCore: document.getElementById("gameOverCoreBtn"),
    gameOverSettings: document.getElementById("gameOverSettingsBtn"),
    shopLoadout: document.getElementById("shopLoadoutBtn"),
    loadoutShop: document.getElementById("loadoutShopBtn"),
    coreShop: document.getElementById("coreShopBtn"),
    coreModuleShop: document.getElementById("coreModuleShopBtn"),
    coreSkinShop: document.getElementById("coreSkinShopBtn"),
    closeShop: document.getElementById("closeShopBtn"),
    closeLoadout: document.getElementById("closeLoadoutBtn"),
    closeCore: document.getElementById("closeCoreBtn"),
    closeSettings: document.getElementById("closeSettingsBtn"),
    grantCredits: document.getElementById("grantCreditsBtn"),
    resetCredits: document.getElementById("resetCreditsBtn"),
    resetBest: document.getElementById("resetBestBtn"),
    resetItems: document.getElementById("resetItemsBtn"),
    confirmCancel: document.getElementById("confirmCancelBtn"),
    confirmAccept: document.getElementById("confirmAcceptBtn"),
    home: document.getElementById("homeBtn"),
    resume: document.getElementById("resumeBtn"),
    restart: document.getElementById("restartBtn"),
    pauseRestart: document.getElementById("pauseRestartBtn"),
    exitGame: document.getElementById("exitGameBtn")
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = performance.now();
  let running = false;
  let paused = false;
  let animationId = 0;
  let audioEnabled = true;
  let audioCtx = null;
  let toastTimer = null;
  const heldKeys = new Set();

  const TOP_NUMBER_KEYS = [
    "Digit1", "Digit2", "Digit3", "Digit4"
  ];
  const KEY_ENEMY_KEYS = [
    ...TOP_NUMBER_KEYS,
    "Digit5"
  ];
  const KEY_LABELS = {
    Digit1: "1",
    Digit2: "2",
    Digit3: "3",
    Digit4: "4",
    Digit5: "5"
  };

  const BAIT_ACTIONS = [
    { action: "left", label: "CLICK" },
    { action: "right", label: "R-CLICK" },
    { action: "wheelUp", label: "WHEEL ↑" },
    { action: "wheelDown", label: "WHEEL ↓" },
    {
      action: "key",
      key: "Digit5",
      label: "5"
    }
  ];

  const RHYTHM_PATTERNS = [
    [1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0]
  ];


  const LANE_COUNT = 4;
  const TOP_LANE_RATIO = .07;
  const BOTTOM_MARGIN_RATIO = .07;
  const STRIKE_WINDOW = 20;
  const WRONG_ACTION_DAMAGE_WAVE = 5;

  function coreWallX() {
    return Math.max(54, Math.min(78, width * .075));
  }

  function laneY(index) {
    const top = Math.max(42, height * TOP_LANE_RATIO);
    const bottom = height * (1 - BOTTOM_MARGIN_RATIO);
    const gap = (bottom - top) / (LANE_COUNT - 1);
    return top + gap * index;
  }

  function strikeLineXs() {
    const left = coreWallX();
    const usable = Math.max(220, width - left);
    return [
      left + usable * .29,
      left + usable * .61
    ];
  }

  function isInStrikeZone(enemy) {
    if (!numericStrikeLinesEnabled()) return true;
    return strikeLineXs().some(
      x => Math.abs(enemy.x - x) <= STRIKE_WINDOW
    );
  }

  function nextSpawnX(laneIndex, spacing = 74) {
    let farthest = width + 34;
    for (const enemy of enemies) {
      if (enemy.laneIndex === laneIndex) {
        farthest = Math.max(farthest, enemy.x + spacing);
      }
    }
    return farthest;
  }

  function loadBestScore() {
    try {
      return Number(window.localStorage.getItem("reactorDefenseBest") || 0);
    } catch {
      return 0;
    }
  }

  function saveBestScore(value) {
    try {
      window.localStorage.setItem("reactorDefenseBest", String(value));
    } catch {
      // 로컬 파일 저장이 제한된 환경에서도 게임은 계속 실행한다.
    }
  }

  const RARITIES = [
    { id: "common", name: "일반", chance: 0.42, refund: 25 },
    { id: "uncommon", name: "고급", chance: 0.25, refund: 40 },
    { id: "rare", name: "희귀", chance: 0.16, refund: 70 },
    { id: "epic", name: "영웅", chance: 0.09, refund: 120 },
    { id: "legendary", name: "전설", chance: 0.05, refund: 220 },
    { id: "mythic", name: "신화", chance: 0.02, refund: 450 },
    { id: "ancient", name: "고대", chance: 0.007, refund: 900 },
    { id: "transcendent", name: "초월", chance: 0.0025, refund: 2500 },
    { id: "cosmic", name: "성운", chance: 0.0005, refund: 8000 }
  ];

  const SHOP_ITEMS = {
    hitSound: [
      { id: "hit_default", name: "기본 리듬", rarity: "common", style: "default" },
      { id: "hit_soft", name: "소프트 탭", rarity: "common", style: "pulse" },
      { id: "hit_pulse", name: "펄스 클릭", rarity: "uncommon", style: "pulse" },
      { id: "hit_wood", name: "우드 블록", rarity: "uncommon", style: "bass" },
      { id: "hit_chip", name: "8비트 칩튠", rarity: "rare", style: "chip" },
      { id: "hit_bass", name: "딥 베이스", rarity: "rare", style: "bass" },
      { id: "hit_arcade", name: "네온 아케이드", rarity: "epic", style: "arcade" },
      { id: "hit_glitch", name: "글리치 스파크", rarity: "epic", style: "glitch" },
      { id: "hit_orchestra", name: "오케스트라 임팩트", rarity: "legendary", style: "orchestra" },
      { id: "hit_thunder", name: "썬더 크래시", rarity: "legendary", style: "thunder" },
      { id: "hit_celestial", name: "천상의 공명", rarity: "mythic", style: "celestial" },
      { id: "hit_dragon", name: "용의 포효", rarity: "mythic", style: "dragon" },
      { id: "hit_chronos", name: "크로노스 종", rarity: "ancient", style: "chronos" },
      { id: "hit_relic", name: "고대 유물음", rarity: "ancient", style: "relic" },
      { id: "hit_singularity", name: "특이점 붕괴음", rarity: "transcendent", style: "singularity" },
      { id: "hit_aurora", name: "오로라 합창", rarity: "transcendent", style: "aurora" },
      { id: "hit_genesis", name: "창세의 코드", rarity: "cosmic", style: "genesis" },
      { id: "hit_event", name: "사건의 지평선", rarity: "cosmic", style: "event" }
    ],
    empEffect: [
      { id: "emp_default", name: "청록 파동", rarity: "common", style: "wave", colors: ["#7cf5ff", "#bfffff"] },
      { id: "emp_mist", name: "백색 안개", rarity: "common", style: "mist", colors: ["#ffffff", "#bfefff"] },
      { id: "emp_ion", name: "이온 스톰", rarity: "uncommon", style: "ion", colors: ["#68a7ff", "#9bf7ff"] },
      { id: "emp_lime", name: "라임 쇼크", rarity: "uncommon", style: "ion", colors: ["#9dff80", "#e9ff9d"] },
      { id: "emp_plasma", name: "보라 플라즈마", rarity: "rare", style: "plasma", colors: ["#c679ff", "#ff8dde"] },
      { id: "emp_frost", name: "프로스트 노바", rarity: "rare", style: "frost", colors: ["#d9fbff", "#6dbbff"] },
      { id: "emp_arc", name: "아크 캐스케이드", rarity: "epic", style: "arc", colors: ["#79fff2", "#677dff", "#ffffff"] },
      { id: "emp_crimson", name: "크림슨 펄스", rarity: "epic", style: "plasma", colors: ["#ff5e75", "#ffac6d"] },
      { id: "emp_solar", name: "태양 폭발", rarity: "legendary", style: "solar", colors: ["#ffd467", "#ff6b45"] },
      { id: "emp_tempest", name: "천둥 폭풍", rarity: "legendary", style: "tempest", colors: ["#f5fbff", "#5a7cff", "#b886ff"] },
      { id: "emp_void", name: "공허 개화", rarity: "mythic", style: "void", colors: ["#ff5db1", "#7b5cff"] },
      { id: "emp_seraph", name: "세라프 링", rarity: "mythic", style: "seraph", colors: ["#fff4bf", "#ff9be7", "#ffffff"] },
      { id: "emp_ancient", name: "고대 봉인 해제", rarity: "ancient", style: "ancient", colors: ["#dfba66", "#76e2c5", "#ffffff"] },
      { id: "emp_dragon", name: "용맥 폭주", rarity: "ancient", style: "solar", colors: ["#ff5b33", "#ffd36b", "#8dffbe"] },
      { id: "emp_prism", name: "초월 프리즘", rarity: "transcendent", style: "prism", colors: ["#ffffff", "#65e8ff", "#bd76ff", "#ff6cae"] },
      { id: "emp_eclipse", name: "일식 붕괴", rarity: "transcendent", style: "eclipse", colors: ["#17142e", "#ff5ea8", "#ffffff"] },
      { id: "emp_cosmos", name: "우주 탄생", rarity: "cosmic", style: "cosmos", colors: ["#ffffff", "#5ef3ff", "#8d71ff", "#ff6ccf", "#ffe866"] },
      { id: "emp_omega", name: "오메가 리셋", rarity: "cosmic", style: "omega", colors: ["#ffffff", "#00ffc8", "#ff2f83", "#7c4dff"] }
    ],
    coreModule: [
      {
        id: "core_standard",
        name: "표준 코어 모듈",
        rarity: "common",
        ability: {},
        abilityText: "기본 균형형 · 최대 내구도 100 · 추가 보너스와 불이익 없음"
      },
      {
        id: "core_guardian",
        name: "가디언 모듈",
        rarity: "uncommon",
        ability: {
          maxHealth: 110,
          damageTakenMultiplier: .94,
          scoreMultiplier: .96,
          waveHeal: 5
        },
        abilityText: "최대 내구도 110 · 받는 피해 6% 감소 · 직접 점수 4% 감소"
      },
      {
        id: "core_bastion",
        name: "바스티온 모듈",
        rarity: "rare",
        ability: {
          maxHealth: 125,
          damageTakenMultiplier: .82,
          scoreMultiplier: .86,
          empChargeMultiplier: .82,
          waveHeal: 5
        },
        abilityText: "최대 내구도 125 · 받는 피해 18% 감소 · 점수 14%와 EMP 충전 18% 감소"
      },
      {
        id: "core_regrowth",
        name: "리그로스 모듈",
        rarity: "epic",
        ability: {
          maxHealth: 96,
          scoreMultiplier: .90,
          healEveryKills: 8,
          healAmount: 3,
          waveHeal: 8
        },
        abilityText: "직접 처치 8회마다 내구도 3 회복 · 웨이브 회복 8 · 점수 10% 감소"
      },
      {
        id: "core_chainburst",
        name: "체인버스트 모듈",
        rarity: "legendary",
        ability: {
          maxHealth: 90,
          scoreMultiplier: .96,
          key5Blast: true,
          blastCount: 2,
          blastRadius: 230,
          blastCooldown: 7
        },
        abilityText: "숫자 5 직접 처치 시 주변 일반 적 최대 2기 폭발 · 재사용 7초 · 최대 내구도 90"
      },
      {
        id: "core_bounty",
        name: "바운티 모듈",
        rarity: "mythic",
        ability: {
          maxHealth: 80,
          scoreMultiplier: 1.28,
          damageTakenMultiplier: 1.08,
          waveHeal: 3
        },
        abilityText: "직접 처치 점수 28% 증가 · 최대 내구도 80 · 받는 피해 8% 증가"
      },
      {
        id: "core_aegis",
        name: "이지스 플럭스",
        rarity: "ancient",
        ability: {
          maxHealth: 108,
          scoreMultiplier: 1.08,
          damageTakenMultiplier: .95,
          empChargeMultiplier: .88,
          waveHeal: 4
        },
        abilityText: "점수 8% 증가와 피해 5% 감소 · EMP 충전 12% 감소 · 최대 내구도 108"
      },
      {
        id: "core_overdrive",
        name: "오버드라이브 모듈",
        rarity: "transcendent",
        ability: {
          maxHealth: 86,
          scoreMultiplier: .94,
          empChargeMultiplier: 1.38,
          empScoreMultiplier: .70,
          waveHeal: 4
        },
        abilityText: "EMP 충전 38% 증가 · 직접 점수 6% 감소 · EMP 처치 점수 감소"
      },
      {
        id: "core_singularity",
        name: "싱귤래리티 드라이브",
        rarity: "cosmic",
        ability: {
          maxHealth: 72,
          scoreMultiplier: 1.42,
          damageTakenMultiplier: 1.15,
          empChargeMultiplier: .72,
          empScoreMultiplier: .55,
          waveHeal: 2
        },
        abilityText: "직접 점수 42% 증가 · 최대 내구도 72 · 피해 15% 증가 · EMP 효율 크게 감소"
      }
    ],
    coreSkin: [
      { id: "core_default", name: "아쿠아 코어", rarity: "common", colors: ["#0d3444", "#14536a", "#69e9ff", "#a8fbff"] },
      { id: "core_steel", name: "스틸 코어", rarity: "common", colors: ["#202d35", "#40515c", "#a8c5d1", "#e9f6ff"] },
      { id: "core_ember", name: "앰버 코어", rarity: "uncommon", colors: ["#3b2115", "#8a4521", "#ff9f58", "#ffe1a6"] },
      { id: "core_moss", name: "모스 코어", rarity: "uncommon", colors: ["#153226", "#2d6b4f", "#75d899", "#d0ffd9"] },
      { id: "core_cobalt", name: "코발트 코어", rarity: "rare", colors: ["#0c2342", "#164c8a", "#5da6ff", "#cce9ff"] },
      { id: "core_rose", name: "로즈 코어", rarity: "rare", colors: ["#3d172c", "#8b315e", "#ff79af", "#ffd4e6"] },
      { id: "core_neon", name: "네온 바이올렛", rarity: "epic", colors: ["#251536", "#59246f", "#c679ff", "#ffb3f4"] },
      { id: "core_toxic", name: "톡식 코어", rarity: "epic", colors: ["#17300b", "#3f7717", "#a7ff4d", "#edffc8"] },
      { id: "core_solar", name: "솔라 크라운", rarity: "legendary", colors: ["#473714", "#96721d", "#ffd467", "#fff3a8"] },
      { id: "core_glacier", name: "빙하 왕관", rarity: "legendary", colors: ["#0e2f3b", "#1d7183", "#88edff", "#ffffff"] },
      { id: "core_abyss", name: "심연의 심장", rarity: "mythic", colors: ["#160d2e", "#372069", "#8d67ff", "#ff67c8"] },
      { id: "core_seraph", name: "세라프 코어", rarity: "mythic", colors: ["#4a3a1a", "#b28b3d", "#fff2a3", "#ffffff"] },
      { id: "core_relic", name: "고대 성채", rarity: "ancient", colors: ["#322b17", "#756331", "#c7ab5b", "#e6ffd8"] },
      { id: "core_drake", name: "드레이크 코어", rarity: "ancient", colors: ["#35140e", "#7c2b1e", "#ff624a", "#ffc07a"] },
      { id: "core_quantum", name: "양자 성좌", rarity: "transcendent", colors: ["#071d26", "#295271", "#ffffff", "#65e8ff"] },
      { id: "core_eclipse", name: "이클립스 코어", rarity: "transcendent", colors: ["#0d0b19", "#35244d", "#ff5ba6", "#ffffff"] },
      { id: "core_genesis", name: "창세 반응로", rarity: "cosmic", colors: ["#061923", "#225b6c", "#ffffff", "#ffdff8"] },
      { id: "core_infinity", name: "무한 코어", rarity: "cosmic", colors: ["#16072b", "#533283", "#6fffe4", "#fff38d"] },
    ],
    backgroundSkin: [
      { id: "bg_default", name: "심해 네온", rarity: "common", style: "grid", colors: ["#0a2533", "#071b29", "#030910", "#69f3e5", "#ccefff"] },
      { id: "bg_midnight", name: "미드나이트", rarity: "common", style: "stars", colors: ["#151b35", "#0b1024", "#03050e", "#879cff", "#e4e9ff"] },
      { id: "bg_forest", name: "전자 숲", rarity: "uncommon", style: "grid", colors: ["#123529", "#09241f", "#03110d", "#79e693", "#cffff0"] },
      { id: "bg_copper", name: "코퍼 시티", rarity: "uncommon", style: "city", colors: ["#3a251c", "#20150f", "#0d0806", "#e39861", "#ffe5cf"] },
      { id: "bg_ocean", name: "심해 해구", rarity: "rare", style: "waves", colors: ["#063a55", "#05233e", "#020b19", "#5edcff", "#d6f8ff"] },
      { id: "bg_rose", name: "로즈 나이트", rarity: "rare", style: "nebula", colors: ["#3a1530", "#1d1026", "#09050f", "#ff77bd", "#ffe1f3"] },
      { id: "bg_arcade", name: "아케이드 그리드", rarity: "epic", style: "grid", colors: ["#24134c", "#101633", "#040611", "#df67ff", "#63f9ff"] },
      { id: "bg_holo", name: "홀로그램 공간", rarity: "epic", style: "holo", colors: ["#16354e", "#24133f", "#070818", "#7efff1", "#ffffff"] },
      { id: "bg_solar", name: "솔라 플레어", rarity: "legendary", style: "solar", colors: ["#573315", "#28140c", "#0d0503", "#ffd467", "#fff1bd"] },
      { id: "bg_glacier", name: "빙하 성역", rarity: "legendary", style: "waves", colors: ["#12405a", "#092536", "#031019", "#8cecff", "#ffffff"] },
      { id: "bg_void", name: "공허 균열", rarity: "mythic", style: "void", colors: ["#230d3e", "#110b28", "#03030a", "#c76dff", "#ffb8f1"] },
      { id: "bg_seraph", name: "세라프 궁전", rarity: "mythic", style: "rays", colors: ["#59441f", "#282344", "#0b0b16", "#fff0a6", "#ffffff"] },
      { id: "bg_relic", name: "고대 유적", rarity: "ancient", style: "city", colors: ["#40391e", "#202213", "#090b06", "#d8b76a", "#eaffcf"] },
      { id: "bg_dragon", name: "용맥 화산", rarity: "ancient", style: "solar", colors: ["#4a1710", "#24100c", "#090302", "#ff674c", "#ffd08a"] },
      { id: "bg_prism", name: "초월 프리즘", rarity: "transcendent", style: "holo", colors: ["#123c4e", "#241450", "#050615", "#65e8ff", "#ffffff"] },
      { id: "bg_eclipse", name: "일식의 경계", rarity: "transcendent", style: "void", colors: ["#170a25", "#080715", "#010104", "#ff5ca8", "#f9f3ff"] },
      { id: "bg_cosmos", name: "성운 탄생", rarity: "cosmic", style: "nebula", colors: ["#173a64", "#35145b", "#050516", "#72fff0", "#ffffff"] },
      { id: "bg_omega", name: "오메가 우주", rarity: "cosmic", style: "omega", colors: ["#270631", "#071d36", "#010107", "#ff3d99", "#fff824"] }
    ],
    enemySkin: [
      { id: "enemy_default", name: "기본 위협체", rarity: "common", palette: ["#ff6079", "#bd76ff", "#ffd25c", "#ff9f58", "#69f3e5", "#7aa7ff", "#ffffff"] },
      { id: "enemy_pastel", name: "파스텔 침입자", rarity: "common", palette: ["#ff9cae", "#d2a2ff", "#ffe39a", "#ffc08d", "#9ff7e9", "#a8c2ff", "#ffffff"] },
      { id: "enemy_forest", name: "포레스트 군단", rarity: "uncommon", palette: ["#71d38a", "#9a74d6", "#d8d45e", "#c58a4d", "#65e8c5", "#6a9be3", "#ecfff1"] },
      { id: "enemy_copper", name: "코퍼 드론", rarity: "uncommon", palette: ["#d1785f", "#a56bc7", "#e7bf59", "#c67b42", "#7dd6cb", "#7795ce", "#f6eadf"] },
      { id: "enemy_ocean", name: "심해 침입자", rarity: "rare", palette: ["#3ab8d7", "#7b68d4", "#69e2ff", "#5c91ff", "#3fffd0", "#58b4ff", "#e7ffff"] },
      { id: "enemy_candy", name: "캔디 러시", rarity: "rare", palette: ["#ff6fae", "#c56cff", "#ffe261", "#ff9d67", "#64ffd4", "#80a0ff", "#ffffff"] },
      { id: "enemy_neon", name: "네온 범죄단", rarity: "epic", palette: ["#ff255f", "#aa37ff", "#faff37", "#ff6d25", "#1effdb", "#2e6dff", "#ffffff"] },
      { id: "enemy_holo", name: "홀로그램 군체", rarity: "epic", palette: ["#f56fff", "#7d8cff", "#8afff1", "#ffb6e9", "#b1ff6f", "#6fe2ff", "#ffffff"] },
      { id: "enemy_royal", name: "로열 가디언", rarity: "legendary", palette: ["#d9506b", "#8f57d8", "#f4cc55", "#d77f43", "#64d7bd", "#537fd4", "#fff6d4"] },
      { id: "enemy_inferno", name: "인페르노 군단", rarity: "legendary", palette: ["#ff3c2d", "#d14bff", "#ffd83d", "#ff7a21", "#64ffe6", "#637bff", "#fff4df"] },
      { id: "enemy_dream", name: "드림 이터", rarity: "mythic", palette: ["#ff56c7", "#8c5bff", "#ffe56a", "#ff8c72", "#5dffe0", "#6e8fff", "#ffffff"] },
      { id: "enemy_angel", name: "세라프 침공", rarity: "mythic", palette: ["#ff9bba", "#b29bff", "#fff3a0", "#ffc879", "#b0fff2", "#b7caff", "#ffffff"] },
      { id: "enemy_relic", name: "고대 기계군", rarity: "ancient", palette: ["#ba6949", "#8069ad", "#c6ab54", "#a56a42", "#72b7a5", "#6177a7", "#e9dfbd"] },
      { id: "enemy_dragon", name: "용혈 군세", rarity: "ancient", palette: ["#ff4d3b", "#9c41dc", "#f6cf45", "#da6c2d", "#5de2c2", "#526fd5", "#fff0d1"] },
      { id: "enemy_prism", name: "초월 프리즘 군체", rarity: "transcendent", palette: ["#ff4f91", "#a15dff", "#fff26a", "#ff9b4f", "#53ffe0", "#65a0ff", "#ffffff"] },
      { id: "enemy_eclipse", name: "이클립스 침략자", rarity: "transcendent", palette: ["#ff3a74", "#7140d7", "#e6c946", "#c86135", "#3fd6bc", "#4964bd", "#faf6ff"] },
      { id: "enemy_cosmos", name: "성운 생명체", rarity: "cosmic", palette: ["#ff68d5", "#8a7bff", "#fff980", "#ffae70", "#63fff0", "#73baff", "#ffffff"] },
      { id: "enemy_omega", name: "오메가 군단", rarity: "cosmic", palette: ["#ff176f", "#8b37ff", "#fff31f", "#ff6b1f", "#00ffd5", "#267aff", "#ffffff"] }
    ]
  };

  const CATEGORY_LABELS = {
    hitSound: "타격 사운드·이펙트",
    empEffect: "EMP 이펙트",
    coreModule: "능력 코어 모듈",
    coreSkin: "코어 스킨",
    enemySkin: "적 스킨",
    backgroundSkin: "배경 스킨"
  };

  const CATEGORY_COSTS = {
    hitSound: 150,
    empEffect: 150,
    coreModule: 500,
    coreSkin: 200,
    enemySkin: 500,
    backgroundSkin: 350
  };

  function defaultProfile() {
    return {
      coins: 0,
      owned: {
        hitSound: ["hit_default"],
        empEffect: ["emp_default"],
        coreModule: ["core_standard"],
        coreSkin: ["core_default"],
        enemySkin: ["enemy_default"],
        backgroundSkin: ["bg_default"]
      },
      equipped: {
        hitSound: "hit_default",
        empEffect: "emp_default",
        coreModule: "core_standard",
        coreSkin: "core_default",
        enemySkin: "enemy_default",
        backgroundSkin: "bg_default"
      },
      settings: {
        creditMultiplier: 1,
        difficultyMultiplier: .75,
        strikeLinesEnabled: true,
        leftToRightNumbers: false
      },
      records: {
        bestCombo: 0,
        bestAverageReaction: null
      }
    };
  }

  function loadProfile() {
    const fallback = defaultProfile();
    const legacyModuleIds = new Set([
      "core_bastion",
      "core_regrowth",
      "core_chainburst",
      "core_bounty",
      "core_overdrive"
    ]);

    try {
      const parsed = JSON.parse(
        window.localStorage.getItem("reactorDefenseProfile") || "null"
      );
      if (!parsed || typeof parsed !== "object") return fallback;

      const parsedAverage = Number(parsed.records?.bestAverageReaction);
      const oldCoreInventory = parsed.owned?.coreSkin || [];
      const legacyModules = oldCoreInventory.filter(id =>
        legacyModuleIds.has(id)
      );
      const cosmeticCores = oldCoreInventory.filter(id =>
        !legacyModuleIds.has(id)
      );

      const oldEquippedCore = parsed.equipped?.coreSkin;
      const migratedModule =
        legacyModuleIds.has(oldEquippedCore)
          ? oldEquippedCore
          : null;

      return {
        coins: Math.max(0, Number(parsed.coins) || 0),
        owned: {
          hitSound: Array.from(
            new Set(["hit_default", ...(parsed.owned?.hitSound || [])])
          ),
          empEffect: Array.from(
            new Set(["emp_default", ...(parsed.owned?.empEffect || [])])
          ),
          coreModule: Array.from(
            new Set([
              "core_standard",
              ...(parsed.owned?.coreModule || []),
              ...legacyModules
            ])
          ),
          coreSkin: Array.from(
            new Set(["core_default", ...cosmeticCores])
          ),
          enemySkin: Array.from(
            new Set(["enemy_default", ...(parsed.owned?.enemySkin || [])])
          ),
          backgroundSkin: Array.from(
            new Set(["bg_default", ...(parsed.owned?.backgroundSkin || [])])
          )
        },
        equipped: {
          hitSound: parsed.equipped?.hitSound || "hit_default",
          empEffect: parsed.equipped?.empEffect || "emp_default",
          coreModule:
            parsed.equipped?.coreModule ||
            migratedModule ||
            "core_standard",
          coreSkin:
            migratedModule
              ? "core_default"
              : oldEquippedCore || "core_default",
          enemySkin: parsed.equipped?.enemySkin || "enemy_default",
          backgroundSkin:
            parsed.equipped?.backgroundSkin || "bg_default"
        },
        settings: {
          creditMultiplier: Math.max(
            0,
            Math.min(10, Number(parsed.settings?.creditMultiplier ?? 1) || 0)
          ),
          difficultyMultiplier: Math.max(
            .2,
            Math.min(
              2,
              Number(parsed.settings?.difficultyMultiplier ?? .75) || .75
            )
          ),
          strikeLinesEnabled:
            parsed.settings?.strikeLinesEnabled === undefined
              ? true
              : Boolean(parsed.settings.strikeLinesEnabled),
          leftToRightNumbers: Boolean(
            parsed.settings?.leftToRightNumbers ?? false
          )
        },
        records: {
          bestCombo: Math.max(0, Number(parsed.records?.bestCombo) || 0),
          bestAverageReaction:
            Number.isFinite(parsedAverage) && parsedAverage > 0
              ? parsedAverage
              : null
        }
      };
    } catch {
      return fallback;
    }
  }

  function saveProfile() {
    try {
      window.localStorage.setItem("reactorDefenseProfile", JSON.stringify(profile));
    } catch {
      // 저장이 제한된 환경에서도 현재 실행 중에는 유지한다.
    }
  }

  function findShopItem(category, id) {
    return SHOP_ITEMS[category].find(item => item.id === id) || SHOP_ITEMS[category][0];
  }

  function getRarity(id) {
    return RARITIES.find(rarity => rarity.id === id) || RARITIES[0];
  }

  function rollRarity() {
    const roll = Math.random();
    let cumulative = 0;
    for (const rarity of RARITIES) {
      cumulative += rarity.chance;
      if (roll < cumulative) return rarity.id;
    }
    return "transcendent";
  }

  const profile = loadProfile();

  function activeCoreItem() {
    return findShopItem("coreModule", profile.equipped.coreModule);
  }

  function activeCoreSkin() {
    return findShopItem("coreSkin", profile.equipped.coreSkin);
  }

  function activeCoreAbility() {
    return activeCoreItem().ability || {};
  }

  function coreMaxHealth() {
    return Math.max(50, Number(activeCoreAbility().maxHealth) || 100);
  }

  function coreScoreMultiplier() {
    return Math.max(0, Number(activeCoreAbility().scoreMultiplier) || 1);
  }

  function coreDamageTakenMultiplier() {
    return Math.max(
      .1,
      Number(activeCoreAbility().damageTakenMultiplier) || 1
    );
  }

  function coreEmpChargeMultiplier() {
    return Math.max(
      0,
      Number(activeCoreAbility().empChargeMultiplier) || 1
    );
  }

  function coreEmpScoreMultiplier() {
    return Math.max(
      0,
      Number(activeCoreAbility().empScoreMultiplier) || 1
    );
  }

  function coreWaveHeal() {
    const value = Number(activeCoreAbility().waveHeal);
    return Number.isFinite(value) ? Math.max(0, value) : 5;
  }

  const state = {
    score: 0,
    health: 100,
    combo: 0,
    bestCombo: 0,
    level: 1,
    wave: 1,
    waveBeat: 0,
    waveLength: 16,
    intermission: 0,
    kills: 0,
    charge: 0,
    lastReward: 0,
    rewardGranted: false,
    reactionTotal: 0,
    reactionCount: 0,
    spawnClock: 0,
    beatIndex: 0,
    beatPulse: 0,
    bpm: 108,
    elapsed: 0,
    shake: 0,
    flash: 0,
    primaryCooldown: 0,
    shockCooldown: 0,
    coreManualKills: 0,
    coreAbilityCooldown: 0,
    aimX: 0,
    aimY: 0,
    best: loadBestScore()
  };

  const enemies = [];
  const particles = [];
  const rings = [];
  let stars = [];

  const ENEMY_TYPES = {
    click: {
      color: "#ff6079", glow: "rgba(255,96,121,.55)",
      speed: 76, radius: 31, hp: 1, damage: 16, points: 260, action: "left"
    },
    right: {
      color: "#bd76ff", glow: "rgba(189,118,255,.55)",
      speed: 62, radius: 36, hp: 1, damage: 22, points: 310, action: "right"
    },
    wheelUp: {
      color: "#ffd25c", glow: "rgba(255,210,92,.55)",
      speed: 54, radius: 35, hp: 1, damage: 13, points: 175, action: "wheelUp"
    },
    wheelDown: {
      color: "#ff9f58", glow: "rgba(255,159,88,.55)",
      speed: 50, radius: 35, hp: 1, damage: 13, points: 175, action: "wheelDown"
    },
    key: {
      color: "#69f3e5", glow: "rgba(105,243,229,.55)",
      speed: 72, radius: 33, hp: 1, damage: 14, points: 70, action: "key"
    },
    key5: {
      color: "#7aa7ff", glow: "rgba(122,167,255,.58)",
      speed: 64, radius: 35, hp: 1, damage: 15, points: 95, action: "key"
    },
    bonus: {
      color: "#ffffff", glow: "rgba(255,255,255,.72)",
      speed: 58, radius: 24, hp: 1, damage: 0, points: 0, action: "bonus"
    }
  };

  function resize() {
    const rect = shell.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!state.aimX && !state.aimY) {
      state.aimX = width * .58;
      state.aimY = height / 2;
    } else {
      state.aimX = Math.max(coreWallX() + 22, Math.min(width - 18, state.aimX));
      state.aimY = Math.max(18, Math.min(height - 18, state.aimY));
    }

    const starCount = Math.max(35, Math.floor(width * height / 17000));
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.35 + .25,
      a: Math.random() * .55 + .1,
      s: Math.random() * .5 + .2
    }));
  }

  function resetState() {
    Object.assign(state, {
      score: 0,
      health: coreMaxHealth(),
      combo: 0,
      bestCombo: 0,
      level: 1,
      wave: 1,
      waveBeat: 0,
      waveLength: 16,
      intermission: 0,
      kills: 0,
      charge: 0,
      lastReward: 0,
      rewardGranted: false,
      // 평균 반응속도는 새 게임마다 반드시 초기화한다.
      reactionTotal: 0,
      reactionCount: 0,
      spawnClock: 0,
      beatIndex: 0,
      beatPulse: 0,
      bpm: 108,
      elapsed: 0,
      shake: 0,
      flash: 0,
      primaryCooldown: 0,
      shockCooldown: 0,
      coreManualKills: 0,
      coreAbilityCooldown: 0,
      aimX: width * .58,
      aimY: height / 2
    });
    enemies.length = 0;
    particles.length = 0;
    rings.length = 0;
    updateUI();
  }

  function startGame() {
    ensureAudio();
    resetState();
    running = true;
    paused = false;
    lastTime = performance.now();
    app.classList.remove("menu-mode");
    ui.startOverlay.classList.add("hidden");
    ui.gameOverOverlay.classList.add("hidden");
    ui.pauseOverlay.classList.add("hidden");
    ui.pauseBtn.textContent = "Ⅱ";
    showWaveBanner("WAVE 1");
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
  }

  function abandonGameToHome() {
    running = false;
    paused = false;
    cancelAnimationFrame(animationId);
    heldKeys.clear();
    enemies.length = 0;
    particles.length = 0;
    rings.length = 0;
    resetState();
    hideMenuOverlays();
    app.classList.add("menu-mode");
    ui.pauseBtn.textContent = "Ⅱ";
    ui.startOverlay.classList.remove("hidden");
    draw(performance.now());
  }

  function gameOver() {
    running = false;
    paused = false;
    app.classList.add("menu-mode");

    state.best = Math.max(state.best, Math.floor(state.score));
    saveBestScore(state.best);

    const roundAverage = averageReactionValue();
    profile.records.bestCombo = Math.max(
      profile.records.bestCombo,
      state.bestCombo
    );

    if (
      roundAverage !== null &&
      (
        profile.records.bestAverageReaction === null ||
        roundAverage < profile.records.bestAverageReaction
      )
    ) {
      profile.records.bestAverageReaction = roundAverage;
    }

    if (!state.rewardGranted) {
      state.lastReward = calculateGameReward();
      profile.coins += state.lastReward;
      state.rewardGranted = true;
    }

    saveProfile();
    updateUI();
    updateCurrencyUI();

    ui.finalScore.textContent = Math.floor(state.score).toLocaleString();
    ui.finalCombo.textContent = state.bestCombo;
    ui.finalReaction.textContent = averageReaction();
    ui.finalKills.textContent = state.kills;
    ui.finalLevel.textContent = state.wave;
    ui.finalBest.textContent = state.best.toLocaleString();
    ui.finalRecordCombo.textContent = profile.records.bestCombo.toLocaleString();
    ui.finalRecordReaction.textContent = bestAverageReactionText();
    ui.finalReward.textContent = "+" + state.lastReward.toLocaleString();
    ui.gameOverOverlay.classList.remove("hidden");
    sound(72, .28, "sawtooth", .08);
    setTimeout(() => sound(108, .3, "triangle", .04), 100);
  }

  function togglePause(force) {
    if (!running) return;
    const next = typeof force === "boolean" ? force : !paused;
    paused = next;
    ui.pauseOverlay.classList.toggle("hidden", !paused);
    ui.pauseBtn.textContent = paused ? "▶" : "Ⅱ";
    if (!paused) {
      lastTime = performance.now();
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(loop);
    }
  }

  function averageReactionValue() {
    if (!state.reactionCount) return null;
    return state.reactionTotal / state.reactionCount;
  }

  function averageReaction() {
    const value = averageReactionValue();
    return value === null ? "--" : Math.round(value) + "ms";
  }

  function updateUI() {
    ui.score.textContent = Math.floor(state.score).toLocaleString();
    ui.health.textContent = Math.max(0, Math.ceil(state.health));
    ui.combo.textContent = state.combo;
    ui.level.textContent = state.wave;
    ui.reaction.textContent = averageReaction();
    ui.best.textContent = state.best.toLocaleString();
    ui.bestComboRecord.textContent = profile.records.bestCombo.toLocaleString();
    ui.bestReactionRecord.textContent = bestAverageReactionText();
    ui.coins.textContent = profile.coins.toLocaleString();
    ui.skillFill.style.width = Math.min(100, state.charge) + "%";
    ui.skillText.textContent = Math.floor(state.charge) + " / 100";
    ui.skillBtn.classList.toggle("ready", state.charge >= 100 && running && !paused);

    ui.weaponName.textContent =
      "WAVE " + state.wave +
      " · " + Math.round(state.bpm) + " BPM" +
      " · 난이도 ×" + gameDifficulty().toFixed(2) +
      " · " + activeCoreItem().name;

    ui.weaponHelp.textContent = state.intermission > 0
      ? "다음 웨이브 " + state.intermission.toFixed(1) + "초"
      : "진행 " + state.waveBeat + " / " + state.waveLength +
        (numericStrikeLinesEnabled()
          ? " · 숫자 타격선 ON · 숫자 점수 ×1.8"
          : " · 숫자 타격선 OFF") +
        (leftToRightNumbersEnabled()
          ? " · 1~4 왼쪽 우선 ON · 5 제외"
          : "");
  }

  function showToast(text) {
    ui.toast.textContent = text;
    ui.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove("show"), 900);
  }

  function showWaveBanner(text) {
    ui.waveBanner.textContent = text;
    ui.waveBanner.classList.add("show");
    clearTimeout(showWaveBanner.timer);
    showWaveBanner.timer = setTimeout(() => ui.waveBanner.classList.remove("show"), 1150);
  }

  function calculateGameReward() {
    const scoreReward = Math.floor(state.score / 700);
    const killReward = Math.floor(state.kills * 1.5);
    const waveReward = state.wave * 24;
    const comboReward = Math.floor(state.bestCombo / 2);
    const baseReward = Math.max(
      20,
      scoreReward + killReward + waveReward + comboReward
    );

    return Math.floor(
      baseReward *
      gameCreditMultiplier() *
      gameDifficulty()
    );
  }

  function updateCurrencyUI() {
    ui.coins.textContent = profile.coins.toLocaleString();
    ui.shopCoins.textContent = profile.coins.toLocaleString();
    ui.loadoutCoins.textContent = profile.coins.toLocaleString();
    ui.coreCoins.textContent = profile.coins.toLocaleString();
    ui.startCredits.textContent = profile.coins.toLocaleString();
    ui.startModuleName.textContent = activeCoreItem().name;
    ui.startSkinName.textContent = activeCoreSkin().name;
    ui.settingsCoins.textContent = profile.coins.toLocaleString();
    ui.finalCoins.textContent = profile.coins.toLocaleString();
  }

  function gameCreditMultiplier() {
    return Math.max(
      0,
      Math.min(10, Number(profile.settings?.creditMultiplier ?? 1) || 0)
    );
  }

  function updateCreditMultiplierUI() {
    const multiplier = gameCreditMultiplier();
    ui.creditMultiplierSlider.value = String(multiplier);
    ui.creditMultiplierValue.textContent = "×" + multiplier.toFixed(2);
  }

  function gameDifficulty() {
    return Math.max(
      .2,
      Math.min(2, Number(profile.settings?.difficultyMultiplier ?? .75) || .75)
    );
  }

  function difficultyLabel(value = gameDifficulty()) {
    if (value < .4) return "연습";
    if (value < .65) return "매우 쉬움";
    if (value < .9) return "쉬움";
    if (value < 1.15) return "보통";
    if (value < 1.45) return "어려움";
    if (value < 1.75) return "매우 어려움";
    return "극한";
  }

  function updateDifficultyUI() {
    const difficulty = gameDifficulty();
    ui.difficultyMultiplierSlider.value = String(difficulty);
    ui.difficultyMultiplierValue.textContent =
      "×" + difficulty.toFixed(2) + " · " + difficultyLabel(difficulty);
  }

  function numericStrikeLinesEnabled() {
    return profile.settings?.strikeLinesEnabled !== false;
  }

  function updateStrikeLineUI() {
    const enabled = numericStrikeLinesEnabled();
    ui.strikeLineToggle.checked = enabled;
    ui.strikeLineStatus.textContent = enabled
      ? "켜짐 · 숫자 점수 ×1.8"
      : "꺼짐 · 위치 제한 없음";
  }

  function leftToRightNumbersEnabled() {
    return Boolean(profile.settings?.leftToRightNumbers);
  }

  function updateLeftOrderUI() {
    const enabled = leftToRightNumbersEnabled();
    ui.leftOrderToggle.checked = enabled;
    ui.leftOrderStatus.textContent = enabled
      ? "켜짐 · 가장 왼쪽부터"
      : "꺼짐 · 자유 입력";
  }

  function attackableNumberEnemies() {
    return enemies
      .map((enemy, index) => ({ enemy, index }))
      .filter(({ enemy }) =>
        enemy.type === "key" &&
        (!numericStrikeLinesEnabled() || isInStrikeZone(enemy))
      )
      .sort((a, b) => a.enemy.x - b.enemy.x);
  }

  function bestAverageReactionText() {
    const value = profile.records.bestAverageReaction;
    return Number.isFinite(value) && value > 0 ? Math.round(value) + "ms" : "--";
  }

  let pendingConfirmedAction = null;
  let settingsPausedGame = false;

  function currentMenuSurface() {
    if (!ui.settingsOverlay.classList.contains("hidden")) return "settings";
    if (!ui.shopOverlay.classList.contains("hidden")) return "shop";
    if (!ui.loadoutOverlay.classList.contains("hidden")) return "loadout";
    if (!ui.coreOverlay.classList.contains("hidden")) return "core";
    if (!ui.gameOverOverlay.classList.contains("hidden")) return "gameOver";
    if (!ui.startOverlay.classList.contains("hidden")) return "start";
    return running ? "game" : "start";
  }

  function hideMenuOverlays() {
    ui.startOverlay.classList.add("hidden");
    ui.gameOverOverlay.classList.add("hidden");
    ui.pauseOverlay.classList.add("hidden");
    ui.shopOverlay.classList.add("hidden");
    ui.loadoutOverlay.classList.add("hidden");
    ui.coreOverlay.classList.add("hidden");
    ui.settingsOverlay.classList.add("hidden");
    ui.confirmOverlay.classList.add("hidden");
  }

  function openShop(returnTo = null) {
    const source = returnTo || currentMenuSurface();
    hideMenuOverlays();
    ui.shopOverlay.dataset.returnTo = source === "loadout"
      ? (ui.loadoutOverlay.dataset.returnTo || "start")
      : source;
    ui.shopOverlay.classList.remove("hidden");
    renderShop();
  }

  function closeShop() {
    ui.shopOverlay.classList.add("hidden");
    const returnTo = ui.shopOverlay.dataset.returnTo;
    if (returnTo === "gameOver") {
      ui.gameOverOverlay.classList.remove("hidden");
    } else if (returnTo === "core") {
      ui.coreOverlay.classList.remove("hidden");
      renderCoreSelection();
    } else if (returnTo === "loadout") {
      ui.loadoutOverlay.classList.remove("hidden");
      renderLoadout();
    } else {
      ui.startOverlay.classList.remove("hidden");
    }
  }

  function openLoadout(returnTo = null) {
    const source = returnTo || currentMenuSurface();
    hideMenuOverlays();
    ui.loadoutOverlay.dataset.returnTo = source === "shop"
      ? (ui.shopOverlay.dataset.returnTo || "start")
      : source;
    ui.loadoutOverlay.classList.remove("hidden");
    renderLoadout();
  }

  function closeLoadout() {
    ui.loadoutOverlay.classList.add("hidden");
    const returnTo = ui.loadoutOverlay.dataset.returnTo;
    if (returnTo === "gameOver") ui.gameOverOverlay.classList.remove("hidden");
    else ui.startOverlay.classList.remove("hidden");
  }

  function openCoreSelection(returnTo = null) {
    const source = returnTo || currentMenuSurface();
    hideMenuOverlays();
    ui.coreOverlay.dataset.returnTo = source === "shop"
      ? (ui.shopOverlay.dataset.returnTo || "start")
      : source;
    ui.coreOverlay.classList.remove("hidden");
    renderCoreSelection();
  }

  function closeCoreSelection() {
    ui.coreOverlay.classList.add("hidden");
    const returnTo = ui.coreOverlay.dataset.returnTo;
    if (returnTo === "gameOver") {
      ui.gameOverOverlay.classList.remove("hidden");
    } else {
      ui.startOverlay.classList.remove("hidden");
    }
  }

  function openSettings(returnTo = null) {
    const source = returnTo || currentMenuSurface();
    settingsPausedGame = source === "game" && running && !paused;

    if (settingsPausedGame) {
      paused = true;
      cancelAnimationFrame(animationId);
    }

    hideMenuOverlays();
    ui.settingsOverlay.dataset.returnTo = source;
    ui.settingsOverlay.classList.remove("hidden");
    updateCurrencyUI();
    updateCreditMultiplierUI();
    updateDifficultyUI();
    updateStrikeLineUI();
    updateLeftOrderUI();
  }

  function closeSettings() {
    ui.settingsOverlay.classList.add("hidden");
    const returnTo = ui.settingsOverlay.dataset.returnTo;

    if (returnTo === "gameOver") {
      ui.gameOverOverlay.classList.remove("hidden");
    } else if (returnTo === "shop") {
      ui.shopOverlay.classList.remove("hidden");
    } else if (returnTo === "loadout") {
      ui.loadoutOverlay.classList.remove("hidden");
    } else if (returnTo === "core") {
      ui.coreOverlay.classList.remove("hidden");
      renderCoreSelection();
    } else if (returnTo === "game" && running) {
      if (settingsPausedGame) {
        paused = false;
        lastTime = performance.now();
        animationId = requestAnimationFrame(loop);
      }
    } else {
      ui.startOverlay.classList.remove("hidden");
    }

    settingsPausedGame = false;
  }

  function requestConfirmation(title, message, action) {
    pendingConfirmedAction = action;
    ui.confirmTitle.textContent = title;
    ui.confirmMessage.textContent = message;
    ui.confirmOverlay.classList.remove("hidden");
  }

  function cancelConfirmation() {
    pendingConfirmedAction = null;
    ui.confirmOverlay.classList.add("hidden");
  }

  function acceptConfirmation() {
    const action = pendingConfirmedAction;
    pendingConfirmedAction = null;
    ui.confirmOverlay.classList.add("hidden");
    if (typeof action === "function") action();
  }

  function renderShop() {
    updateCurrencyUI();
  }

  function renderLoadout() {
    updateCurrencyUI();
    const categories = [
      "hitSound",
      "empEffect",
      "backgroundSkin",
      "enemySkin"
    ];
    ui.inventoryGrid.innerHTML = "";

    for (const category of categories) {
      for (const item of SHOP_ITEMS[category]) {
        const owned = profile.owned[category].includes(item.id);
        const equipped = profile.equipped[category] === item.id;
        const rarity = getRarity(item.rarity);

        const row = document.createElement("div");
        row.className = "inventory-item" + (owned ? "" : " locked");

        const copy = document.createElement("div");
        const abilityDescription = "";

        copy.innerHTML = `
          <span class="item-name rarity-${rarity.id}">${owned ? item.name : "???"}</span>
          <span class="item-meta">${CATEGORY_LABELS[category]} · ${rarity.name}</span>
          ${owned ? abilityDescription : ""}
        `;
        row.appendChild(copy);

        if (owned) {
          const button = document.createElement("button");
          button.className = "equip-btn" + (equipped ? " equipped" : "");
          button.textContent = equipped ? "장착 중" : "장착";
          button.addEventListener("click", () => {
            profile.equipped[category] = item.id;
            saveProfile();
            renderLoadout();

            if (category === "hitSound") previewHitSound(item.id);
            if (category === "empEffect") playEmpSound(true);
            if (
              category === "backgroundSkin" ||
              category === "enemySkin"
            ) {
              showToast(item.name + " 장착");
              draw(performance.now());
            }
          });
          row.appendChild(button);
        }

        ui.inventoryGrid.appendChild(row);
      }
    }
  }

  function renderCoreSelection() {
    updateCurrencyUI();
    ui.coreModuleGrid.innerHTML = "";
    ui.coreSkinGrid.innerHTML = "";

    const module = activeCoreItem();
    const skin = activeCoreSkin();
    ui.coreModuleEquipped.textContent = module.name;
    ui.coreSkinEquipped.textContent = skin.name;

    for (const item of SHOP_ITEMS.coreModule) {
      const owned = profile.owned.coreModule.includes(item.id);
      const equipped = profile.equipped.coreModule === item.id;
      const rarity = getRarity(item.rarity);

      const row = document.createElement("div");
      row.className =
        "inventory-item core-module-item" +
        (owned ? "" : " locked") +
        (equipped ? " equipped-core" : "");

      const copy = document.createElement("div");
      copy.innerHTML = `
        <span class="item-name rarity-${rarity.id}">
          ${owned ? item.name : "미확인 모듈"}
        </span>
        <span class="item-meta">
          능력 모듈 · ${rarity.name}${equipped ? " · 장착 중" : ""}
        </span>
        ${
          owned
            ? `<span class="ability-meta">${item.abilityText}</span>`
            : `<span class="core-neutral-meta">캡슐에서 획득해야 능력이 공개됩니다.</span>`
        }
      `;
      row.appendChild(copy);

      if (owned) {
        const button = document.createElement("button");
        button.className = "equip-btn" + (equipped ? " equipped" : "");
        button.textContent = equipped ? "가동 중" : "장착";
        button.addEventListener("click", () => {
          profile.equipped.coreModule = item.id;
          saveProfile();
          renderCoreSelection();
          updateUI();
          showToast(item.name + " 가동");
        });
        row.appendChild(button);
      }

      ui.coreModuleGrid.appendChild(row);
    }

    for (const item of SHOP_ITEMS.coreSkin) {
      const owned = profile.owned.coreSkin.includes(item.id);
      const equipped = profile.equipped.coreSkin === item.id;
      const rarity = getRarity(item.rarity);

      const row = document.createElement("div");
      row.className =
        "inventory-item core-skin-item" +
        (owned ? "" : " locked") +
        (equipped ? " equipped-core" : "");

      const swatches = (item.colors || [])
        .map(color => `<i style="background:${color}"></i>`)
        .join("");

      const copy = document.createElement("div");
      copy.innerHTML = `
        <span class="item-name rarity-${rarity.id}">
          ${owned ? item.name : "미확인 스킨"}
        </span>
        <span class="item-meta">
          코어 스킨 · ${rarity.name}${equipped ? " · 적용 중" : ""}
        </span>
        ${
          owned
            ? `<span class="skin-swatches">${swatches}</span>`
            : `<span class="core-neutral-meta">성능 변화 없음 · 캡슐에서 획득</span>`
        }
      `;
      row.appendChild(copy);

      if (owned) {
        const button = document.createElement("button");
        button.className = "equip-btn" + (equipped ? " equipped" : "");
        button.textContent = equipped ? "적용 중" : "적용";
        button.addEventListener("click", () => {
          profile.equipped.coreSkin = item.id;
          saveProfile();
          renderCoreSelection();
          draw(performance.now());
          showToast(item.name + " 적용");
        });
        row.appendChild(button);
      }

      ui.coreSkinGrid.appendChild(row);
    }
  }

  function drawShopItem(category) {
    const cost = CATEGORY_COSTS[category] || 150;
    if (profile.coins < cost) {
      ui.drawResult.className = "draw-result-box";
      ui.drawResult.innerHTML =
        "<b>크레딧이 부족합니다.</b><br>" +
        CATEGORY_LABELS[category] + " 캡슐 가격: " +
        cost.toLocaleString() + " 크레딧";
      sound(105, .08, "square", .02);
      return;
    }

    profile.coins -= cost;
    const rarityId = rollRarity();
    const pool = SHOP_ITEMS[category].filter(item => item.rarity === rarityId);
    const item = pool[Math.floor(Math.random() * pool.length)];
    const rarity = getRarity(rarityId);
    const duplicate = profile.owned[category].includes(item.id);
    const refund = rarity.refund || 0;

    if (duplicate) profile.coins += refund;
    else profile.owned[category].push(item.id);

    saveProfile();
    updateCurrencyUI();
    renderShop();
    if (category === "coreModule" || category === "coreSkin") {
      renderCoreSelection();
    }

    ui.drawResult.className = "draw-result-box reveal";
    ui.drawResult.innerHTML = `
      <div>
        <div class="rarity-${rarity.id}"
             style="font-size:12px;font-weight:900;letter-spacing:.12em;">
          ${rarity.name}
        </div>
        <div style="margin-top:4px;font-size:22px;font-weight:900;">
          ${item.name}
        </div>
        <div style="margin-top:4px;font-size:11px;color:var(--muted);">
          ${CATEGORY_LABELS[category]} · 가격 ${cost.toLocaleString()}
          ${duplicate
            ? " · 중복 환급 +" + refund.toLocaleString()
            : " · 새 아이템 획득"}
        </div>
      </div>
    `;
    void ui.drawResult.offsetWidth;
    ui.drawResult.classList.add("reveal");

    const rarityIndex = RARITIES.findIndex(r => r.id === rarityId);
    const revealRoot = 280 + rarityIndex * 75;

    if (rarityId === "cosmic") {
      chordSound([523.25, 659.25, 783.99, 1046.5, 1318.5], .9, .14, "sine");
      sparkleSound(1318.5, 12);
      setTimeout(() => toneSweep(70, 1900, .9, "triangle", .08), 80);
    } else if (rarityId === "transcendent") {
      playComboFlourish(659.25);
      setTimeout(
        () => chordSound([523.25, 659.25, 783.99, 1046.5], .65, .09, "sine"),
        120
      );
    } else if (rarityId === "ancient") {
      chordSound([196, 293.66, 392, 587.33], .55, .08, "triangle");
      toneSweep(170, 620, .35, "sine", .04);
    } else if (rarityId === "mythic") {
      chordSound([440, 554.37, 659.25, 880], .45, .07, "sine");
      sparkleSound(880, 6);
    } else if (rarityId === "legendary") {
      chordSound([392, 493.88, 587.33, 783.99], .34, .06, "triangle");
    } else {
      sound(revealRoot, .14, "triangle", .035);
    }
  }


  function ensureAudio() {
    if (!audioEnabled) return;
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  }

  function sound(freq, duration = .07, type = "sine", volume = .035) {
    if (!audioEnabled) return;
    ensureAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function toneSweep(startFreq, endFreq, duration = .12, type = "sine", volume = .035) {
    if (!audioEnabled) return;
    ensureAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, startFreq), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  function noiseBeat(duration = .08, volume = .025, highpass = 900) {
    if (!audioEnabled) return;
    ensureAudio();
    if (!audioCtx) return;

    const sampleRate = audioCtx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = audioCtx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }

    const source = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = highpass;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);

    source.connect(filter).connect(gain).connect(audioCtx.destination);
    source.start(now);
  }


  function chordSound(freqs, duration = .18, volume = .018, type = "sine", delayMs = 0) {
    if (!audioEnabled) return;
    ensureAudio();
    if (!audioCtx) return;

    setTimeout(() => {
      if (!audioCtx || !audioEnabled) return;
      const now = audioCtx.currentTime;

      freqs.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const pan = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

        osc.type = index % 2 ? "triangle" : type;
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((index - (freqs.length - 1) / 2) * 4, now);

        gain.gain.setValueAtTime(volume / Math.max(1, freqs.length * .62), now);
        gain.gain.exponentialRampToValueAtTime(.0001, now + duration);

        if (pan) {
          pan.pan.value = freqs.length === 1 ? 0 : -0.55 + (index / (freqs.length - 1)) * 1.1;
          osc.connect(gain).connect(pan).connect(audioCtx.destination);
        } else {
          osc.connect(gain).connect(audioCtx.destination);
        }

        osc.start(now);
        osc.stop(now + duration);
      });
    }, delayMs);
  }

  function sparkleSound(root, notes = 4) {
    const ratios = [1, 1.25, 1.5, 2, 2.5];
    for (let i = 0; i < notes; i++) {
      setTimeout(() => {
        sound(root * ratios[i % ratios.length], .075, i % 2 ? "triangle" : "sine", .018);
      }, i * 34);
    }
  }

  function playComboFlourish(root) {
    chordSound([root, root * 1.25, root * 1.5, root * 2], .24, .052, "sine");
    sparkleSound(root * 2, 5);
    noiseBeat(.07, .018, 3200);
  }

  function playBeatTick(accent = false) {
    if (!audioEnabled || !running || paused) return;

    const barStep = state.beatIndex % 8;
    const bassRoots = [110, 110, 130.81, 98, 110, 146.83, 130.81, 98];
    const root = bassRoots[barStep];

    if (accent) {
      toneSweep(root * 1.65, root * .55, .14, "sine", .032);
      noiseBeat(.07, .016, 1500);
      chordSound([root * 2, root * 2.5, root * 3], .13, .023, "triangle");
    } else {
      sound(1250, .024, "square", .007);
      sound(root, .055, "triangle", .012);
    }

    if (barStep === 2 || barStep === 6) {
      noiseBeat(.045, .012, 3600);
    }
  }

  function playBaseKillSound(enemy) {
    const comboStep = Math.min(7, Math.floor(state.combo / 3));
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const note = scale[comboStep];

    if (enemy.type === "click") {
      toneSweep(210, 52, .16, "sine", .06);
      chordSound([note, note * 1.25, note * 1.5], .12, .032, "triangle");
      noiseBeat(.045, .018, 1900);
    } else if (enemy.type === "right") {
      noiseBeat(.14, .05, 520);
      chordSound([185, 277.5, 370], .15, .035, "sawtooth");
      setTimeout(() => toneSweep(520, 180, .08, "square", .017), 30);
    } else if (enemy.type === "wheelUp") {
      noiseBeat(.06, .026, 2800);
      toneSweep(note, note * 2.15, .14, "triangle", .035);
      sparkleSound(note * 1.5, 3);
    } else if (enemy.type === "wheelDown") {
      noiseBeat(.07, .027, 2100);
      toneSweep(note * 2.1, note * .62, .16, "triangle", .038);
      chordSound([note * .5, note, note * 1.25], .12, .023, "sine", 28);
    } else if (enemy.type === "key" || enemy.type === "key5") {
      const keyIndex = Math.max(0, KEY_ENEMY_KEYS.indexOf(enemy.requiredKey));
      const keyNotes = [523.25, 587.33, 659.25, 783.99, 880];
      const root = keyNotes[keyIndex];

      chordSound([root, root * 1.25, root * 1.5, root * 2], .18, .052, "sine");
      sparkleSound(root * 2, 4);
      noiseBeat(.045, .015, 4200);

      if (state.combo > 0 && state.combo % 4 === 0) {
        chordSound([root * .5, root, root * 1.5, root * 2], .28, .058, "triangle", 55);
      }
    }

    if (state.combo > 0 && state.combo % 10 === 0) {
      setTimeout(() => playComboFlourish(note), 70);
    }
  }

  function previewHitSound(id) {
    const fakeEnemy = {
      type: "key",
      requiredKey: "Digit1",
      x: width * .55,
      y: height * .5,
      radius: 33
    };
    const previous = profile.equipped.hitSound;
    profile.equipped.hitSound = id;
    playEquippedHitSound(fakeEnemy);
    createEquippedHitEffect(fakeEnemy);
    draw(performance.now());
    profile.equipped.hitSound = previous;
  }

  function playEquippedHitSound(enemy) {
    const item = findShopItem("hitSound", profile.equipped.hitSound);
    const style = item.style || "default";

    const keyIndex = Math.max(0, KEY_ENEMY_KEYS.indexOf(enemy.requiredKey));
    const root = enemy.type === "key" || enemy.type === "key5"
      ? [523.25, 587.33, 659.25, 783.99, 880][keyIndex]
      : enemy.type === "right" ? 293.66
      : enemy.type === "wheelUp" ? 440
      : enemy.type === "wheelDown" ? 329.63
      : 392;

    if (style === "default") {
      playBaseKillSound(enemy);
    } else if (style === "pulse") {
      toneSweep(root * .8, root * 1.3, .09, "sine", .03);
    } else if (style === "chip") {
      sound(root, .07, "square", .035);
      setTimeout(() => sound(root * 2, .045, "square", .018), 28);
    } else if (style === "bass") {
      toneSweep(root * .65, root * .25, .14, "triangle", .052);
      sound(root, .05, "square", .018);
    } else if (style === "arcade") {
      toneSweep(root * .75, root * 1.8, .12, "square", .038);
      noiseBeat(.035, .012, 3300);
    } else if (style === "glitch") {
      sound(root * 1.7, .035, "square", .028);
      setTimeout(() => sound(root * .75, .045, "sawtooth", .026), 20);
      setTimeout(() => sound(root * 2.2, .04, "square", .018), 43);
    } else if (style === "orchestra") {
      chordSound([root * .5, root, root * 1.25, root * 1.5], .24, .065, "triangle");
      toneSweep(120, 52, .16, "sine", .035);
    } else if (style === "thunder") {
      noiseBeat(.16, .055, 260);
      toneSweep(root * 1.4, 48, .22, "sawtooth", .055);
    } else if (style === "celestial") {
      chordSound([root, root * 1.25, root * 1.5, root * 2, root * 2.5], .34, .07, "sine");
      sparkleSound(root * 2, 6);
    } else if (style === "dragon") {
      toneSweep(root * .8, 44, .36, "sawtooth", .07);
      chordSound([root * .5, root, root * 1.5], .28, .06, "triangle");
    } else if (style === "chronos") {
      chordSound([root, root * 1.333, root * 2], .48, .07, "sine");
      setTimeout(() => sound(root * 2.5, .3, "sine", .028), 90);
    } else if (style === "relic") {
      sound(root * .5, .28, "triangle", .045);
      noiseBeat(.12, .02, 620);
      setTimeout(() => sound(root * 1.5, .18, "sine", .03), 55);
    } else if (style === "singularity") {
      toneSweep(root * 4, 38, .38, "sawtooth", .065);
      chordSound([root * .5, root, root * 1.414, root * 2], .45, .09, "sine");
      noiseBeat(.18, .045, 180);
      setTimeout(() => sparkleSound(root * 2, 8), 60);
    } else if (style === "aurora") {
      chordSound([root, root * 1.2, root * 1.5, root * 2.4], .52, .085, "sine");
      sparkleSound(root * 2.5, 9);
    } else if (style === "genesis") {
      chordSound([root * .5, root, root * 1.25, root * 1.5, root * 2, root * 3], .72, .12, "sine");
      toneSweep(48, root * 4, .65, "triangle", .07);
      sparkleSound(root * 3, 10);
    } else if (style === "event") {
      toneSweep(root * 5, 28, .8, "sawtooth", .095);
      chordSound([root * .25, root * .5, root, root * 2], .75, .12, "sine");
      noiseBeat(.3, .06, 100);
    }
  }


  const ENEMY_SKIN_INDEX = {
    click: 0,
    right: 1,
    wheelUp: 2,
    wheelDown: 3,
    key: 4,
    key5: 5,
    bonus: 6
  };

  function enemyVisual(type) {
    const skin = findShopItem("enemySkin", profile.equipped.enemySkin);
    const index = ENEMY_SKIN_INDEX[type] ?? 0;
    const color =
      skin.palette?.[index] ||
      ENEMY_TYPES[type]?.color ||
      "#ffffff";

    return {
      color,
      glow: color
    };
  }

  function randomEnemyType() {
    const roll = Math.random();

    // 하단 레인에는 마우스·휠·숫자 5·소량의 흰색 아이템이 등장한다.
    if (roll < .08) return "click";
    if (roll < .14) return "right";
    if (roll < .40) return "wheelUp";
    if (roll < .66) return "wheelDown";
    if (roll < .91) return "key5";
    return "bonus";
  }

  function spawnEnemy(typeOverride = null, laneOverride = null) {
    let typeName = typeOverride || randomEnemyType();

    if ((typeName === "click" || typeName === "right") &&
        enemies.some(enemy => enemy.type === "click" || enemy.type === "right")) {
      typeName = Math.random() < .5 ? "wheelUp" : "wheelDown";
    }

    const spec = ENEMY_TYPES[typeName];

    let laneIndex;
    if (typeName === "key") {
      laneIndex = 0;
    } else if (Number.isInteger(laneOverride)) {
      laneIndex = Math.max(1, Math.min(LANE_COUNT - 1, laneOverride));
    } else {
      laneIndex = 1 + Math.floor(Math.random() * (LANE_COUNT - 1));
    }

    const difficultySpeed =
      (1 + (state.wave - 1) * .065) * gameDifficulty();
    const laneSpeedVariation =
      typeName === "key" || typeName === "key5"
        ? .96
        : .9 + Math.random() * .14;

    const spacing = typeName === "key" ? 102
      : typeName === "key5" ? 126
      : typeName === "click" || typeName === "right" ? 208
      : typeName === "bonus" ? 128
      : typeName === "wheelUp" || typeName === "wheelDown" ? 136
      : 118;

    const bait = typeName === "bonus"
      ? BAIT_ACTIONS[Math.floor(Math.random() * BAIT_ACTIONS.length)]
      : null;

    const rewardRoll = Math.random();
    const rewardType = rewardRoll < .42 ? "score" : rewardRoll < .72 ? "coins" : "emp";

    enemies.push({
      x: nextSpawnX(laneIndex, spacing),
      y: laneY(laneIndex),
      targetY: laneY(laneIndex),
      laneIndex,
      type: typeName,
      radius: spec.radius,
      speed: spec.speed * difficultySpeed * laneSpeedVariation,
      hp: spec.hp,
      maxHp: spec.hp,
      damage: spec.damage,
      points: spec.points,
      born: performance.now(),
      pulse: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      hitFlash: 0,
      slowTimer: 0,
      requiredKey: typeName === "key"
        ? TOP_NUMBER_KEYS[Math.floor(Math.random() * TOP_NUMBER_KEYS.length)]
        : typeName === "key5"
          ? "Digit5"
          : bait?.key || null,
      baitAction: bait?.action || null,
      baitLabel: bait?.label || null,
      rewardType
    });
  }

  function createParticles(
    x,
    y,
    color,
    amount = 12,
    force = 1,
    shape = "circle",
    sizeMultiplier = 1
  ) {
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = (35 + Math.random() * 145) * force;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: .45 + Math.random() * .45,
        maxLife: .9,
        radius: (1.5 + Math.random() * 3.6) * sizeMultiplier,
        color,
        shape,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - .5) * 9
      });
    }
  }

  function createEquippedHitEffect(enemy) {
    const item = findShopItem("hitSound", profile.equipped.hitSound);
    const rarity = getRarity(item.rarity);
    const visual = enemyVisual(enemy.type);
    const style = item.style || "default";
    const rarityIndex = Math.max(
      0,
      RARITIES.findIndex(entry => entry.id === rarity.id)
    );

    const amount = 12 + rarityIndex * 3;
    const force = 1 + rarityIndex * .08;
    const ringCount = 1 + Math.floor(rarityIndex / 2);

    let shape = "circle";
    if (["chip", "arcade", "glitch"].includes(style)) shape = "square";
    if (["orchestra", "celestial", "aurora", "genesis"].includes(style)) {
      shape = "star";
    }
    if (["thunder", "dragon", "event", "singularity"].includes(style)) {
      shape = "diamond";
    }
    if (["chronos", "relic"].includes(style)) shape = "line";

    createParticles(
      enemy.x,
      enemy.y,
      visual.color,
      amount,
      force,
      shape,
      1 + rarityIndex * .07
    );

    for (let i = 0; i < ringCount; i++) {
      rings.push({
        x: enemy.x,
        y: enemy.y,
        r: enemy.radius * (.35 + i * .2),
        life: .28 + i * .055,
        color: i % 2 ? "#ffffff" : visual.color,
        speed: 150 + i * 34,
        sides:
          style === "chip" || style === "glitch"
            ? 4
            : style === "dragon" || style === "thunder"
              ? 6
              : 0,
        dash: style === "chronos" || style === "event"
      });
    }

    if (rarityIndex >= 6) {
      createParticles(
        enemy.x,
        enemy.y,
        "#ffffff",
        8 + rarityIndex * 2,
        1.35,
        rarityIndex >= 8 ? "star" : "diamond",
        1.35
      );
    }
  }

  function destroyEnemyByCoreAbility(index) {
    const enemy = enemies[index];
    if (!enemy || enemy.type === "bonus") return false;

    const visual = enemyVisual(enemy.type);
    state.score += enemy.points * .35;
    state.kills++;

    createParticles(
      enemy.x,
      enemy.y,
      visual.color,
      16,
      1.25,
      "diamond",
      1.1
    );
    rings.push({
      x: enemy.x,
      y: enemy.y,
      r: enemy.radius,
      life: .38,
      color: "#ffb16d",
      speed: 220,
      sides: 6
    });

    enemies.splice(index, 1);
    return true;
  }

  function triggerCoreKillAbility(enemy) {
    const ability = activeCoreAbility();
    state.coreManualKills++;

    if (
      ability.healEveryKills &&
      state.coreManualKills % ability.healEveryKills === 0
    ) {
      const before = state.health;
      state.health = Math.min(
        coreMaxHealth(),
        state.health + (ability.healAmount || 0)
      );
      const healed = Math.max(0, Math.ceil(state.health - before));

      if (healed > 0) {
        showToast("코어 재생 · 내구도 +" + healed);
        rings.push({
          x: coreWallX(),
          y: height / 2,
          r: 20,
          life: .5,
          color: "#78e4a1",
          speed: 130
        });
      }
    }

    if (
      ability.key5Blast &&
      enemy.type === "key5" &&
      state.coreAbilityCooldown <= 0
    ) {
      const candidates = enemies
        .map((target, index) => ({
          target,
          index,
          distance: Math.hypot(
            target.x - enemy.x,
            target.y - enemy.y
          )
        }))
        .filter(entry =>
          entry.target.type !== "bonus" &&
          entry.distance <= (ability.blastRadius || 220)
        )
        .sort((a, b) => a.distance - b.distance)
        .slice(0, ability.blastCount || 2)
        .sort((a, b) => b.index - a.index);

      let destroyed = 0;
      for (const candidate of candidates) {
        if (destroyEnemyByCoreAbility(candidate.index)) destroyed++;
      }

      state.coreAbilityCooldown = ability.blastCooldown || 7;

      if (destroyed > 0) {
        createParticles(
          enemy.x,
          enemy.y,
          "#ff9b5e",
          30,
          1.6,
          "star",
          1.3
        );
        rings.push({
          x: enemy.x,
          y: enemy.y,
          r: 24,
          life: .62,
          color: "#ff734f",
          speed: 300,
          sides: 8
        });
        state.shake = Math.max(state.shake, 10);
        showToast("체인버스트 · 추가 처치 " + destroyed);
        chordSound(
          [164.81, 246.94, 329.63, 493.88],
          .28,
          .07,
          "sawtooth"
        );
      }
    }
  }

  function destroyEnemy(index, byEmp = false) {
    const enemy = enemies[index];
    if (!enemy) return;

    // EMP 처치는 반응속도·콤보·일반 처치 효과음 통계에서 완전히 제외한다.
    if (!byEmp) {
      const reaction = Math.max(80, performance.now() - enemy.born);
      state.reactionTotal += reaction;
      state.reactionCount++;
      state.combo++;
      state.bestCombo = Math.max(state.bestCombo, state.combo);

      const speedBonus = Math.max(0, 220 - reaction * .12);
      const comboMultiplier = 1 + Math.min(state.combo, 40) * .025;
      const strikeScoreMultiplier =
        enemy.type === "key" && numericStrikeLinesEnabled() ? 1.8 : 1;
      state.score +=
        (enemy.points * strikeScoreMultiplier + speedBonus) *
        comboMultiplier *
        coreScoreMultiplier();

      const baseCharge =
        enemy.type === "key" || enemy.type === "key5" ? 8 : 12;
      const waveChargeFactor = Math.max(
        .18,
        1 - (state.wave - 1) * .065
      );
      state.charge = Math.min(
        100,
        state.charge +
        baseCharge *
        waveChargeFactor *
        coreEmpChargeMultiplier()
      );
    } else {
      state.score +=
        enemy.points *
        .45 *
        coreEmpScoreMultiplier();
    }

    state.kills++;
    const visual = enemyVisual(enemy.type);

    if (byEmp) {
      createParticles(
        enemy.x,
        enemy.y,
        visual.color,
        enemy.type === "right" ? 12 : 8,
        .82,
        "circle",
        .8
      );
    } else {
      createEquippedHitEffect(enemy);
    }

    enemies.splice(index, 1);

    if (!byEmp) {
      playEquippedHitSound(enemy);
      triggerCoreKillAbility(enemy);
    }
    updateUI();
  }

  function playEmpSound(preview = false) {
    const item = findShopItem("empEffect", profile.equipped.empEffect);
    const style = item.style || "wave";

    if (style === "wave" || style === "mist") {
      toneSweep(95, 310, .55, "sawtooth", .075);
      setTimeout(() => chordSound([110, 220, 440], .36, .055, "sine"), 70);
    } else if (style === "ion" || style === "arc") {
      noiseBeat(.34, .05, 900);
      toneSweep(70, 760, .58, "square", .06);
      setTimeout(() => sparkleSound(880, 7), 90);
    } else if (style === "plasma") {
      chordSound([92.5, 138.75, 185, 277.5], .56, .09, "sawtooth");
      toneSweep(620, 82, .62, "triangle", .07);
    } else if (style === "frost") {
      toneSweep(980, 120, .65, "sine", .06);
      sparkleSound(1046.5, 8);
      noiseBeat(.18, .025, 3100);
    } else if (style === "solar" || style === "tempest") {
      toneSweep(58, 980, .72, "sine", .085);
      chordSound([220, 277.18, 329.63, 440, 659.25], .62, .095, "triangle", 75);
      noiseBeat(.22, .042, style === "tempest" ? 1300 : 500);
    } else if (style === "void" || style === "eclipse") {
      toneSweep(760, 32, .85, "sawtooth", .09);
      chordSound([55, 82.41, 110, 164.81], .75, .1, "sine");
      setTimeout(() => toneSweep(42, 520, .45, "triangle", .055), 190);
    } else if (style === "seraph") {
      chordSound([261.63, 329.63, 392, 523.25, 659.25], .8, .105, "sine");
      sparkleSound(1046.5, 10);
    } else if (style === "ancient") {
      chordSound([98, 146.83, 196, 293.66], .85, .11, "triangle");
      noiseBeat(.3, .04, 280);
      setTimeout(() => toneSweep(90, 780, .55, "sine", .05), 120);
    } else if (style === "prism") {
      chordSound([130.81, 164.81, 196, 261.63, 329.63, 392, 523.25], .9, .13, "sine");
      sparkleSound(1046.5, 10);
      setTimeout(() => toneSweep(55, 1660, .8, "triangle", .075), 70);
      noiseBeat(.3, .045, 2600);
    } else if (style === "cosmos" || style === "omega") {
      chordSound([65.41, 98, 130.81, 196, 261.63, 392, 523.25, 783.99], 1.05, .16, "sine");
      sparkleSound(1567.98, 14);
      toneSweep(38, 2100, 1, style === "omega" ? "sawtooth" : "triangle", .1);
      noiseBeat(.45, .06, style === "omega" ? 120 : 3400);
    }

    if (preview) showToast(item.name);
  }

  function createEmpVisual() {
    const item = findShopItem("empEffect", profile.equipped.empEffect);
    const colors = item.colors || ["#7cf5ff"];
    const rarity = getRarity(item.rarity);
    const rarityIndex = Math.max(
      0,
      RARITIES.findIndex(entry => entry.id === rarity.id)
    );
    const count = 2 + Math.min(8, rarityIndex);

    for (let i = 0; i < count; i++) {
      rings.push({
        x: coreWallX(),
        y: height / 2,
        r: 20 + i * 18,
        life: .7 + i * .08,
        color: colors[i % colors.length],
        speed: Math.max(width, height) * (.8 + i * .12)
      });
    }

    const particleCount = 35 + count * 10;
    for (let i = 0; i < particleCount; i++) {
      const lane = i % LANE_COUNT;
      createParticles(
        coreWallX() + Math.random() * width * .7,
        laneY(lane),
        colors[i % colors.length],
        1,
        1.2
      );
    }
  }

  function activateEMP() {
    if (!running || paused || state.charge < 100) return;

    state.charge = 0;
    state.flash = 1;
    state.shake = Math.max(state.shake, 13);
    createEmpVisual();

    // EMP는 일반 적만 제거하며 흰색 아이템은 그대로 통과시킨다.
    // EMP 처치에서는 개별 적의 타격 효과음을 재생하지 않는다.
    for (let i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i].type === "bonus") continue;
      destroyEnemy(i, true);
    }

    showToast("EMP 발동!");
    playEmpSound();
    updateUI();
  }

  function collectBaitReward(enemyIndex) {
    const enemy = enemies[enemyIndex];
    if (!enemy) return;

    let message = "";
    if (enemy.rewardType === "coins") {
      const baseReward = 5 + Math.floor(state.wave * .75);
      const reward = Math.floor(
        baseReward * gameCreditMultiplier() * gameDifficulty()
      );
      profile.coins += reward;
      saveProfile();
      message = "미끼 통과 · 크레딧 +" + reward;
    } else if (enemy.rewardType === "emp") {
      const reward = Math.max(6, 18 - Math.floor(state.wave * .45));
      state.charge = Math.min(100, state.charge + reward);
      message = "미끼 통과 · EMP +" + reward;
    } else {
      const reward = 220 + state.wave * 55;
      state.score += reward;
      message = "미끼 통과 · 점수 +" + reward;
    }

    createParticles(coreWallX() + 12, enemy.y, "#ffffff", 24, 1.05);
    rings.push({ x: coreWallX() + 12, y: enemy.y, r: 20, life: .45, color: "#ffffff", speed: 150 });
    enemies.splice(enemyIndex, 1);
    showToast(message);
    chordSound([523.25, 659.25, 783.99], .17, .04, "sine");
    updateCurrencyUI();
    updateUI();
  }

  function missCore(enemyIndex) {
    const enemy = enemies[enemyIndex];
    if (!enemy) return;

    if (enemy.type === "bonus") {
      collectBaitReward(enemyIndex);
      return;
    }

    const receivedDamage =
      enemy.damage * coreDamageTakenMultiplier();
    state.health -= receivedDamage;
    state.combo = 0;
    state.shake = Math.max(state.shake, enemy.type === "right" ? 18 : 10);
    state.flash = Math.max(state.flash, .45);

    createParticles(coreWallX() + 8, enemy.y, "#ff5d76", enemy.type === "right" ? 26 : 16, 1.2);
    rings.push({ x: coreWallX() + 8, y: enemy.y, r: 30, life: .45, color: "#ff5d76" });
    enemies.splice(enemyIndex, 1);

    sound(90, .2, "square", .055);
    updateUI();

    if (state.health <= 0) {
      state.health = 0;
      updateUI();
      gameOver();
    }
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (width / rect.width),
      y: (event.clientY - rect.top) * (height / rect.height)
    };
  }

  function applyWrongActionDamage() {
    if (state.wave < WRONG_ACTION_DAMAGE_WAVE) return;

    const damage = 2 + Math.floor((state.wave - WRONG_ACTION_DAMAGE_WAVE) / 3);
    state.health = Math.max(0, state.health - damage);
    state.flash = Math.max(state.flash, .25);
    state.shake = Math.max(state.shake, 5);

    if (state.health <= 0) {
      updateUI();
      gameOver();
    }
  }

  function registerWrongInput(
    x,
    y,
    message = "입력이 맞지 않습니다",
    damageCore = true
  ) {
    state.combo = 0;
    rings.push({ x, y, r: 7, life: .18, color: "#ff7b8e" });

    const shouldDamage =
      damageCore && state.wave >= WRONG_ACTION_DAMAGE_WAVE;

    if (shouldDamage) applyWrongActionDamage();

    showToast(message + (shouldDamage ? " · 내구도 감소" : ""));
    sound(112, .05, "square", .018);
    updateUI();
  }

  function hitZoneRadius(enemy) {
    if (enemy.type === "wheelUp" || enemy.type === "wheelDown") {
      return Math.max(30, enemy.radius * 1.02);
    }

    if (enemy.type === "click" || enemy.type === "right") {
      return Math.max(17, enemy.radius * .64);
    }

    return Math.max(12, enemy.radius * .54);
  }

  function enemyUnderPoint(x, y, extraRadius = 0) {
    let index = -1;
    let nearest = Infinity;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      const dist = Math.hypot(x - enemy.x, y - enemy.y);
      const zone = hitZoneRadius(enemy) + extraRadius;

      if (dist <= zone && dist < nearest) {
        nearest = dist;
        index = i;
      }
    }
    return index;
  }

  function spoilBait(index, damageCore = true) {
    const enemy = enemies[index];
    if (!enemy || enemy.type !== "bonus") return false;

    createParticles(enemy.x, enemy.y, "#ffffff", 18, 1.05);
    rings.push({
      x: enemy.x,
      y: enemy.y,
      r: 12,
      life: .32,
      color: "#ff5d76",
      speed: 160
    });
    enemies.splice(index, 1);
    registerWrongInput(
      enemy.x,
      enemy.y,
      "흰색 미끼의 지시를 따랐습니다",
      damageCore
    );
    return true;
  }

  function hitEnemy(index, x, y) {
    const enemy = enemies[index];
    if (!enemy || enemy.type === "bonus") return false;
    if (enemy.type === "key" && !isInStrikeZone(enemy)) return false;

    enemy.hp--;
    enemy.hitFlash = .14;
    createParticles(x, y, "#ecfbff", 7, .5);
    sound(enemy.hp <= 0 ? 480 : 180, .05, "square", .025);

    if (enemy.hp <= 0) destroyEnemy(index);
    else {
      state.score += 35;
      updateUI();
    }
    return true;
  }

  function primaryAttack(x, y) {
    if (!running || paused || state.primaryCooldown > 0) return;
    ensureAudio();
    state.primaryCooldown = .08;

    const anyIndex = enemyUnderPoint(x, y, 1);
    if (anyIndex < 0) {
      registerWrongInput(x, y, "빨강 적을 정확히 노리세요", false);
      return;
    }

    const enemy = enemies[anyIndex];
    if (enemy.type === "bonus") {
      if (enemy.baitAction === "left") spoilBait(anyIndex, false);
      else registerWrongInput(x, y, "흰색 미끼는 건드리지 마세요", false);
      return;
    }

    if (ENEMY_TYPES[enemy.type].action !== "left") {
      registerWrongInput(x, y, "이 적은 좌클릭 대상이 아닙니다", false);
      return;
    }

    hitEnemy(anyIndex, x, y);
  }

  function shockwave(x, y) {
    if (!running || paused) return;
    if (state.shockCooldown > 0) {
      showToast("우클릭 재사용 " + state.shockCooldown.toFixed(1) + "초");
      sound(105, .05, "square", .018);
      return;
    }

    const anyIndex = enemyUnderPoint(x, y, 2);
    if (anyIndex < 0) {
      registerWrongInput(x, y, "보라 적을 정확히 노리세요", false);
      return;
    }

    const enemy = enemies[anyIndex];
    if (enemy.type === "bonus") {
      if (enemy.baitAction === "right") spoilBait(anyIndex, false);
      else registerWrongInput(x, y, "흰색 미끼는 건드리지 마세요", false);
      return;
    }

    if (ENEMY_TYPES[enemy.type].action !== "right") {
      registerWrongInput(x, y, "이 적은 우클릭 대상이 아닙니다", false);
      return;
    }

    ensureAudio();
    state.shockCooldown = .75;
    state.shake = Math.max(state.shake, 6);
    rings.push({ x, y, r: 10, life: .34, color: "#bd76ff", speed: 210 });
    hitEnemy(anyIndex, x, y);
    sound(150, .16, "sawtooth", .045);
  }

  function wheelAttack(x, y, direction) {
    if (!running || paused) return;
    ensureAudio();

    const anyIndex = enemyUnderPoint(x, y, 2);
    if (anyIndex < 0) {
      registerWrongInput(x, y, direction === "wheelUp"
        ? "노랑 적 위에서 휠을 올리세요"
        : "주황 적 위에서 휠을 내리세요", false);
      return;
    }

    const enemy = enemies[anyIndex];
    if (enemy.type === "bonus") {
      if (enemy.baitAction === direction) spoilBait(anyIndex, false);
      else registerWrongInput(x, y, "흰색 미끼는 건드리지 마세요", false);
      return;
    }

    const required = ENEMY_TYPES[enemy.type].action;
    if (required !== direction) {
      registerWrongInput(x, y, direction === "wheelUp"
        ? "이 적은 휠 위 대상이 아닙니다"
        : "이 적은 휠 아래 대상이 아닙니다", false);
      return;
    }

    rings.push({
      x, y, r: 8, life: .28,
      color: direction === "wheelUp" ? "#ffd25c" : "#ff9f58",
      speed: 180
    });
    hitEnemy(anyIndex, x, y);
    sound(direction === "wheelUp" ? 560 : 360, .08, "triangle", .03);
  }

  function keyboardEnemyAttack(code) {
    if (!running || paused || !KEY_ENEMY_KEYS.includes(code)) return false;

    // 숫자 5는 하단 레인 전용이며 타격선과 왼쪽 우선 규칙을 사용하지 않는다.
    if (code === "Digit5") {
      let targetIndex = -1;
      let nearestDistance = Infinity;

      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.type !== "key5") continue;

        const distance = enemy.x - coreWallX();
        if (distance < nearestDistance) {
          nearestDistance = distance;
          targetIndex = i;
        }
      }

      if (targetIndex >= 0) {
        const enemy = enemies[targetIndex];
        rings.push({
          x: enemy.x,
          y: enemy.y,
          r: 12,
          life: .34,
          color: "#7aa7ff",
          speed: 210
        });
        hitEnemy(targetIndex, enemy.x, enemy.y);
        sound(880, .09, "sine", .04);
        return true;
      }

      let baitIndex = -1;
      let baitDistance = Infinity;
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (
          enemy.type !== "bonus" ||
          enemy.baitAction !== "key" ||
          enemy.requiredKey !== "Digit5"
        ) continue;

        const distance = enemy.x - coreWallX();
        if (distance < baitDistance) {
          baitDistance = distance;
          baitIndex = i;
        }
      }

      if (baitIndex >= 0) {
        spoilBait(baitIndex, true);
        return false;
      }

      registerWrongInput(
        state.aimX,
        state.aimY,
        "5 대상이 없습니다",
        true
      );
      return false;
    }

    // 아래의 타격선·왼쪽 우선 규칙은 1~4에만 적용된다.
    if (leftToRightNumbersEnabled()) {
      const available = attackableNumberEnemies();
      const leftmost = available[0];

      if (!leftmost) {
        const sameEnemy = enemies.find(
          enemy => enemy.type === "key" && enemy.requiredKey === code
        );
        registerWrongInput(
          sameEnemy?.x ?? state.aimX,
          sameEnemy?.y ?? state.aimY,
          numericStrikeLinesEnabled() && sameEnemy
            ? KEY_LABELS[code] + " 적이 타격선 밖에 있습니다"
            : KEY_LABELS[code] + " 대상이 없습니다",
          true
        );
        return false;
      }

      if (leftmost.enemy.requiredKey !== code) {
        registerWrongInput(
          leftmost.enemy.x,
          leftmost.enemy.y,
          "가장 왼쪽 숫자 " +
            KEY_LABELS[leftmost.enemy.requiredKey] +
            "부터 입력하세요",
          true
        );
        return false;
      }

      rings.push({
        x: leftmost.enemy.x,
        y: leftmost.enemy.y,
        r: 10,
        life: .34,
        color: "#69f3e5",
        speed: 210
      });
      hitEnemy(
        leftmost.index,
        leftmost.enemy.x,
        leftmost.enemy.y
      );
      sound(680, .08, "sine", .035);
      return true;
    }

    const targetIndices = [];

    if (numericStrikeLinesEnabled()) {
      const lineXs = strikeLineXs();

      for (const lineX of lineXs) {
        let bestIndex = -1;
        let bestDistance = Infinity;

        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          if (enemy.type !== "key" || enemy.requiredKey !== code) continue;

          const distance = Math.abs(enemy.x - lineX);
          if (distance <= STRIKE_WINDOW && distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
          }
        }

        if (bestIndex >= 0 && !targetIndices.includes(bestIndex)) {
          targetIndices.push(bestIndex);
        }
      }
    } else {
      let nearestIndex = -1;
      let nearestDistance = Infinity;

      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.type !== "key" || enemy.requiredKey !== code) continue;

        const distance = enemy.x - coreWallX();
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      if (nearestIndex >= 0) targetIndices.push(nearestIndex);
    }

    if (targetIndices.length > 0) {
      const targets = targetIndices
        .map(index => ({ index, enemy: enemies[index] }))
        .sort((a, b) => b.index - a.index);

      for (const target of targets) {
        rings.push({
          x: target.enemy.x,
          y: target.enemy.y,
          r: 10,
          life: .34,
          color: "#69f3e5",
          speed: 210
        });
        hitEnemy(target.index, target.enemy.x, target.enemy.y);
      }

      if (targets.length >= 2) {
        showToast(
          KEY_LABELS[code] +
          " 동시 처치 ×" + targets.length +
          " · 타격선 점수 보너스"
        );
        chordSound(
          [523.25, 659.25, 783.99, 1046.5],
          .22,
          .055,
          "sine"
        );
      } else {
        sound(680, .08, "sine", .035);
      }
      return true;
    }

    let baitIndex = -1;
    let baitDistance = Infinity;

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (
        enemy.type !== "bonus" ||
        enemy.baitAction !== "key" ||
        enemy.requiredKey !== code
      ) continue;

      const distance = enemy.x - coreWallX();
      if (distance < baitDistance) {
        baitDistance = distance;
        baitIndex = i;
      }
    }

    if (baitIndex >= 0) {
      spoilBait(baitIndex, true);
      return false;
    }

    const sameEnemy = enemies.find(
      enemy => enemy.type === "key" && enemy.requiredKey === code
    );

    registerWrongInput(
      sameEnemy?.x ?? state.aimX,
      sameEnemy?.y ?? state.aimY,
      sameEnemy && numericStrikeLinesEnabled()
        ? KEY_LABELS[code] + " 적이 두 타격선 밖에 있습니다"
        : KEY_LABELS[code] + " 대상이 없습니다",
      true
    );
    return false;
  }

  function handlePointer(event) {
    if (!running || paused) return;
    event.preventDefault();
    const p = pointerPosition(event);
    state.aimX = p.x;
    state.aimY = p.y;

    if (event.button === 2) shockwave(p.x, p.y);
    else if (event.button === 0 || event.pointerType === "touch") primaryAttack(p.x, p.y);
  }

  function handlePointerMove(event) {
    const p = pointerPosition(event);
    state.aimX = p.x;
    state.aimY = p.y;
  }

  function handleWheel(event) {
    event.preventDefault();
    if (!running || paused) return;
    const p = pointerPosition(event);
    state.aimX = p.x;
    state.aimY = p.y;
    wheelAttack(p.x, p.y, event.deltaY < 0 ? "wheelUp" : "wheelDown");
  }

  function update(dt, now) {
    state.elapsed += dt;
    state.primaryCooldown = Math.max(0, state.primaryCooldown - dt);
    state.coreAbilityCooldown = Math.max(
      0,
      state.coreAbilityCooldown - dt
    );

    const oldShockSecond = Math.ceil(state.shockCooldown * 10);
    state.shockCooldown = Math.max(0, state.shockCooldown - dt);
    if (Math.ceil(state.shockCooldown * 10) !== oldShockSecond) updateUI();

    const aimSpeed = 390;
    let moveX = 0;
    let moveY = 0;
    if (heldKeys.has("ArrowLeft")) moveX -= 1;
    if (heldKeys.has("ArrowRight")) moveX += 1;
    if (heldKeys.has("ArrowUp")) moveY -= 1;
    if (heldKeys.has("ArrowDown")) moveY += 1;

    if (moveX || moveY) {
      const length = Math.hypot(moveX, moveY) || 1;
      state.aimX = Math.max(coreWallX() + 22, Math.min(width - 18, state.aimX + moveX / length * aimSpeed * dt));
      state.aimY = Math.max(18, Math.min(height - 18, state.aimY + moveY / length * aimSpeed * dt));
    }

    if (state.intermission > 0) {
      state.intermission = Math.max(0, state.intermission - dt);
      if (state.intermission === 0) {
        state.wave++;
        state.level = state.wave;
        state.waveBeat = 0;
        state.waveLength = Math.min(36, 16 + (state.wave - 1) * 2);
        state.bpm = Math.min(
          220,
          (104 + (state.wave - 1) * 7) *
          (.45 + gameDifficulty() * .55)
        );
        state.health = Math.min(
          coreMaxHealth(),
          state.health + coreWaveHeal()
        );
        showWaveBanner("WAVE " + state.wave);
        chordSound([220, 277.18, 329.63, 440], .24, .045, "triangle");
        updateUI();
      }
    } else {
      state.bpm = Math.min(
        220,
        (104 + (state.wave - 1) * 7) *
        (.45 + gameDifficulty() * .55)
      );
      const beatInterval = 60 / state.bpm;
      state.spawnClock += dt;

      while (state.spawnClock >= beatInterval && state.intermission <= 0) {
        state.spawnClock -= beatInterval;
        state.beatIndex++;
        state.waveBeat++;
        state.beatPulse = 1;

        const beatInBar = state.beatIndex % 4;
        const accent = beatInBar === 0;
        playBeatTick(accent);

        // 맨 윗줄은 청록색 숫자 적 전용이다.
        spawnEnemy("key", 0);
        if (
          state.wave >= 9 &&
          accent &&
          Math.random() <
            Math.min(
              (.08 + state.wave * .012) * Math.max(.12, gameDifficulty()),
              .48
            )
        ) {
          spawnEnemy("key", 0);
        }

        const pattern = RHYTHM_PATTERNS[(state.wave - 1) % RHYTHM_PATTERNS.length];
        const patternStep = state.beatIndex % pattern.length;

        if (pattern[patternStep]) {
          const lowerLane = 1 + ((state.beatIndex + state.wave) % 3);
          spawnEnemy(null, lowerLane);

          const secondChance = Math.min(
            (.03 + state.wave * .028) *
            Math.max(.12, gameDifficulty()),
            .82
          );
          if (state.wave >= 4 && Math.random() < secondChance) {
            const secondLane = 1 + (lowerLane % 3);
            spawnEnemy(null, secondLane);
          }

          const thirdChance = Math.min(
            Math.max(0, state.wave - 9) *
            .018 *
            Math.max(.1, gameDifficulty()),
            .34
          );
          if (state.wave >= 10 && accent && Math.random() < thirdChance) {
            const thirdLane = 1 + ((lowerLane + 1) % 3);
            spawnEnemy(null, thirdLane);
          }
        }

        if (state.waveBeat >= state.waveLength) {
          state.intermission = Math.max(1.5, 3.2 - state.wave * .08);
          state.spawnClock = 0;
          showWaveBanner("WAVE " + state.wave + " CLEAR");
          state.score += state.wave * 350;
          state.charge = Math.min(100, state.charge + 18);
          updateUI();
          break;
        }
      }
    }

    const wallX = coreWallX();

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.slowTimer = Math.max(0, e.slowTimer - dt);
      const slowFactor = e.slowTimer > 0 ? .43 : 1;

      e.x -= e.speed * slowFactor * dt;
      e.y += (e.targetY - e.y) * Math.min(1, dt * 8);
      e.pulse += dt * 4;
      e.rotation += dt * ((e.type === "wheelUp" || e.type === "wheelDown") ? 5 : 2);
      e.hitFlash = Math.max(0, e.hitFlash - dt);

      if (e.x - e.radius <= wallX + 11) {
        missCore(i);
        if (!running) return;
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(.06, dt);
      p.vy *= Math.pow(.06, dt);
      p.rotation = (p.rotation || 0) + (p.spin || 0) * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life -= dt;
      r.r += (r.speed || 170) * dt;
      if (r.life <= 0) rings.splice(i, 1);
    }

    state.shake = Math.max(0, state.shake - dt * 32);
    state.flash = Math.max(0, state.flash - dt * 2.8);
    state.beatPulse = Math.max(0, state.beatPulse - dt * 3.4);

    stars.forEach(star => {
      star.y += star.s * dt * 7;
      if (star.y > height + 2) {
        star.y = -2;
        star.x = Math.random() * width;
      }
    });

    updateUI();
  }

  function drawBackground() {
    ctx.clearRect(0, 0, width, height);

    const background = findShopItem(
      "backgroundSkin",
      profile.equipped.backgroundSkin
    );
    const colors = background.colors || [
      "#0a2533",
      "#071b29",
      "#030910",
      "#69f3e5",
      "#ccefff"
    ];
    const style = background.style || "grid";

    const bg = ctx.createLinearGradient(0, 0, width, height * .35);
    bg.addColorStop(0, colors[0]);
    bg.addColorStop(.42, colors[1]);
    bg.addColorStop(1, colors[2]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    if (["nebula", "holo", "void", "omega", "solar", "rays"].includes(style)) {
      const clouds = style === "omega" ? 6 : 4;
      for (let i = 0; i < clouds; i++) {
        const x = width * (.18 + i * .2);
        const y = height * (.18 + ((i * 37) % 55) / 100);
        const radius = Math.max(width, height) * (.18 + i * .018);
        const cloud = ctx.createRadialGradient(x, y, 0, x, y, radius);
        cloud.addColorStop(0, colors[3] + (style === "void" ? "45" : "35"));
        cloud.addColorStop(.45, colors[0] + "1d");
        cloud.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = cloud;
        ctx.fillRect(0, 0, width, height);
      }
    }

    if (style === "solar" || style === "rays") {
      ctx.translate(width * .78, height * .28);
      ctx.globalAlpha = .12;
      for (let i = 0; i < 18; i++) {
        ctx.rotate(Math.PI / 9);
        ctx.fillStyle = colors[3];
        ctx.fillRect(0, -3, width * .55, 6);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.restore();

    ctx.save();
    for (const s of stars) {
      ctx.globalAlpha = Math.min(
        1,
        s.a * (style === "stars" || style === "cosmos" ? 1.45 : 1)
      );
      ctx.fillStyle = colors[4];
      ctx.beginPath();
      ctx.arc(
        s.x,
        s.y,
        s.r * (style === "holo" ? 1.25 : 1),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();

    const wallX = coreWallX();
    const lowerBoundary = (laneY(0) + laneY(1)) / 2;

    ctx.save();
    const topLaneGradient = ctx.createLinearGradient(wallX, 0, width, 0);
    topLaneGradient.addColorStop(0, colors[3] + "28");
    topLaneGradient.addColorStop(1, colors[3] + "08");
    ctx.fillStyle = topLaneGradient;
    ctx.fillRect(wallX, 0, width - wallX, lowerBoundary);

    ctx.fillStyle = colors[4];
    ctx.font = "800 10px system-ui";
    ctx.textAlign = "left";
    ctx.fillText("NUMBER LANE · 1 2 3 4", wallX + 16, 20);
    ctx.restore();

    ctx.save();
    for (let i = 0; i < LANE_COUNT; i++) {
      const y = laneY(i);
      ctx.strokeStyle = i === 0 ? colors[3] + "55" : colors[4] + "20";
      ctx.lineWidth = i === 0 ? 2 : 1;
      ctx.setLineDash(i === 0 ? [12, 8] : [7, 10]);
      ctx.beginPath();
      ctx.moveTo(wallX + 12, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.globalAlpha = i === 0 ? .14 : .065;
      for (let x = wallX + 120; x < width; x += 92) {
        ctx.beginPath();
        ctx.moveTo(x, y - 24);
        ctx.lineTo(x, y + 24);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.setLineDash([]);
    ctx.restore();

    if (numericStrikeLinesEnabled()) {
      ctx.save();
      const strikeXs = strikeLineXs();
      strikeXs.forEach((x, index) => {
        const pulse = .46 + Math.sin(state.elapsed * 5 + index) * .12;
        const gradient = ctx.createLinearGradient(x - 12, 0, x + 12, 0);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(.5, colors[3] + "88");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 12, 0, 24, height);

        ctx.strokeStyle = index === 0 ? colors[3] : colors[4];
        ctx.globalAlpha = .86;
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = colors[4];
        ctx.font = "900 9px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("STRIKE " + (index + 1), x, 15);
      });
      ctx.restore();
    }

    const wallGlow = ctx.createLinearGradient(0, 0, wallX + 80, 0);
    wallGlow.addColorStop(0, colors[3] + "35");
    wallGlow.addColorStop(.6, colors[3] + "12");
    wallGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = wallGlow;
    ctx.fillRect(0, 0, wallX + 80, height);
  }

  function drawCore(now) {
    const x = coreWallX();
    const centerY = height / 2;
    const wallWidth = Math.max(30, x * .58);
    const reactorRadius = Math.max(28, Math.min(42, height * .07));
    const pulse = Math.sin(now * .004) * 2;
    const skin = activeCoreSkin();
    const skinColors = skin.colors || ["#0d3444", "#14536a", "#69e9ff", "#a8fbff"];

    ctx.save();

    // 세로형 방어 코어 벽
    const wallGradient = ctx.createLinearGradient(0, 0, x + wallWidth, 0);
    wallGradient.addColorStop(0, skinColors[0]);
    wallGradient.addColorStop(.52, skinColors[1]);
    wallGradient.addColorStop(1, skinColors[2]);
    ctx.fillStyle = wallGradient;
    ctx.shadowBlur = 22;
    ctx.shadowColor = skinColors[2];
    ctx.fillRect(x - wallWidth / 2, 14, wallWidth, height - 28);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(194,249,255,.72)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - wallWidth / 2, 14, wallWidth, height - 28);

    // 레인별 충돌 포트
    for (let i = 0; i < LANE_COUNT; i++) {
      const y = laneY(i);
      ctx.fillStyle = i === 0 ? skinColors[3] : skinColors[2];
      ctx.globalAlpha = .42 + Math.sin(now * .004 + i) * .12;
      ctx.fillRect(x + wallWidth / 2 - 3, y - 16, 7, 32);
    }
    ctx.globalAlpha = 1;

    // 중앙 반응로
    ctx.translate(x, centerY);
    const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, reactorRadius * 2.8);
    aura.addColorStop(0, "rgba(230,255,255,.52)");
    aura.addColorStop(.28, "rgba(105,243,229,.26)");
    aura.addColorStop(1, "rgba(105,243,229,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, reactorRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    if (state.beatPulse > 0) {
      ctx.save();
      ctx.globalAlpha = state.beatPulse * .72;
      ctx.strokeStyle = state.beatIndex % 4 === 0 ? "#fff2a6" : "#77f7ff";
      ctx.lineWidth = 3 + state.beatPulse * 4;
      ctx.beginPath();
      ctx.arc(0, 0, reactorRadius + 16 + (1 - state.beatPulse) * 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = "#10384b";
    ctx.strokeStyle = "#bafaff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, reactorRadius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const inner = ctx.createRadialGradient(-8, -10, 2, 0, 0, reactorRadius);
    inner.addColorStop(0, "#ffffff");
    inner.addColorStop(.2, skinColors[3]);
    inner.addColorStop(1, skinColors[1]);
    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.arc(0, 0, reactorRadius * .56, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${Math.max(8, reactorRadius * .25)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      Math.max(0, Math.ceil(state.health)) +
      "/" +
      Math.ceil(coreMaxHealth()),
      0,
      1
    );

    ctx.restore();
  }

  function drawEnemy(e) {
    const spec = ENEMY_TYPES[e.type];
    const visual = enemyVisual(e.type);
    const pulse = 1 + Math.sin(e.pulse) * .06;

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rotation);

    ctx.shadowBlur = e.hitFlash > 0 ? 28 : 18;
    ctx.shadowColor = e.hitFlash > 0 ? "#ffffff" : visual.glow;
    ctx.fillStyle = e.hitFlash > 0 ? "#ffffff" : visual.color;
    ctx.strokeStyle = "rgba(255,255,255,.78)";
    ctx.lineWidth = 1.5;

    const r = e.radius * pulse;

    if (e.type === "click") {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (e.type === "right") {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (e.type === "wheelUp" || e.type === "wheelDown") {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 3;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (e.type === "bonus") {
      ctx.fillStyle = visual.color;
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.beginPath();
      const sides = 10;
      const polygonRadius = r * 1.28;
      for (let i = 0; i < sides; i++) {
        const angle = -Math.PI / 2 + i * Math.PI * 2 / sides;
        const px = Math.cos(angle) * polygonRadius;
        const py = Math.sin(angle) * polygonRadius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.rotate(-e.rotation);
    if (e.type !== "bonus") {
      ctx.fillStyle = "rgba(3,12,18,.68)";
      ctx.beginPath();
      ctx.arc(0, 0, r * .56, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = e.type === "bonus" ? "#07111d" : "#ffffff";
    ctx.font = e.type === "bonus"
      ? `900 ${Math.max(8, Math.round(r * .34))}px system-ui`
      : `900 ${Math.max(13, Math.round(r * .78))}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let label = "●";
    if (e.type === "right") label = "R";
    if (e.type === "wheelUp") label = "↑";
    if (e.type === "wheelDown") label = "↓";
    if (e.type === "key" || e.type === "key5") {
      label = KEY_LABELS[e.requiredKey];
    }
    if (e.type === "bonus") label = e.baitLabel || "IGNORE";
    ctx.fillText(label, 0, 1);

    // 실제 판정과 동일한 작은 타격 존
    if (e.type !== "key" && e.type !== "key5" && e.type !== "bonus") {
      ctx.strokeStyle = "rgba(255,255,255,.92)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([2.5, 2.5]);
      ctx.beginPath();
      ctx.arc(0, 0, hitZoneRadius(e), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    if (
      e.type === "key" &&
      numericStrikeLinesEnabled() &&
      isInStrikeZone(e)
    ) {
      ctx.strokeStyle = "#8ffcff";
      ctx.lineWidth = 2;
      ctx.globalAlpha = .82;
      ctx.beginPath();
      ctx.arc(0, 0, e.type === "bonus" ? r * 1.85 : r + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    ctx.save();
    ctx.globalAlpha = .13;
    ctx.strokeStyle = visual.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y);
    ctx.lineTo(coreWallX(), e.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawEffects() {
    for (const p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.shape === "square") {
        ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
      } else if (p.shape === "diamond") {
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 1.5);
        ctx.lineTo(p.radius, 0);
        ctx.lineTo(0, p.radius * 1.5);
        ctx.lineTo(-p.radius, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === "star") {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 ? p.radius * .45 : p.radius * 1.55;
          const angle = -Math.PI / 2 + i * Math.PI / 5;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === "line") {
        ctx.lineWidth = Math.max(1, p.radius * .45);
        ctx.beginPath();
        ctx.moveTo(-p.radius * 1.7, 0);
        ctx.lineTo(p.radius * 1.7, 0);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const r of rings) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, r.life * 2.5);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3;
      if (r.dash) ctx.setLineDash([6, 5]);
      ctx.beginPath();

      if (r.sides && r.sides >= 3) {
        for (let i = 0; i < r.sides; i++) {
          const angle = -Math.PI / 2 + i * Math.PI * 2 / r.sides;
          const px = r.x + Math.cos(angle) * r.r;
          const py = r.y + Math.sin(angle) * r.r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else {
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      }

      ctx.stroke();
      ctx.restore();
    }
  }

  function drawReticle() {
    const x = state.aimX;
    const y = state.aimY;

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "#bff8ff";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = .82;

    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.stroke();

    const gap = 7;
    const arm = 16;
    ctx.beginPath();
    ctx.moveTo(-gap, 0); ctx.lineTo(-arm, 0);
    ctx.moveTo(gap, 0); ctx.lineTo(arm, 0);
    ctx.moveTo(0, -gap); ctx.lineTo(0, -arm);
    ctx.moveTo(0, gap); ctx.lineTo(0, arm);
    ctx.stroke();

    if (state.shockCooldown <= 0) {
      ctx.globalAlpha = .22;
      ctx.strokeStyle = "#bd76ff";
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw(now) {
    ctx.save();
    if (state.shake > 0) {
      const amount = state.shake;
      ctx.translate((Math.random() - .5) * amount, (Math.random() - .5) * amount);
    }

    drawBackground();
    drawCore(now);
    for (const e of enemies) drawEnemy(e);
    drawEffects();
    drawReticle();
    ctx.restore();

    if (state.flash > 0) {
      ctx.save();
      ctx.globalAlpha = state.flash * .28;
      ctx.fillStyle = state.health <= 0 ? "#ff4d68" : "#9df6ff";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  function loop(now) {
    if (!running || paused) return;
    const dt = Math.min(.033, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;

    update(dt, now);
    draw(now);

    if (running && !paused) animationId = requestAnimationFrame(loop);
  }

  canvas.addEventListener("pointerdown", handlePointer, { passive: false });
  canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
  canvas.addEventListener("wheel", handleWheel, { passive: false });
  canvas.addEventListener("contextmenu", event => event.preventDefault());

  buttons.start.addEventListener("click", startGame);
  buttons.settings.addEventListener("click", () => {
    if (running && !paused) openSettings("game");
    else openSettings(currentMenuSurface());
  });
  buttons.startSettings.addEventListener("click", () => openSettings("start"));
  buttons.gameOverSettings.addEventListener("click", () => openSettings("gameOver"));
  buttons.closeSettings.addEventListener("click", closeSettings);
  buttons.confirmCancel.addEventListener("click", cancelConfirmation);
  buttons.confirmAccept.addEventListener("click", acceptConfirmation);

  ui.leftOrderToggle.addEventListener("change", event => {
    profile.settings.leftToRightNumbers = event.target.checked;
    saveProfile();
    updateLeftOrderUI();
    updateUI();

    showToast(
      event.target.checked
        ? "숫자 적 왼쪽 우선 입력 ON"
        : "숫자 적 자유 입력"
    );
    sound(event.target.checked ? 720 : 320, .1, "triangle", .03);
  });

  ui.strikeLineToggle.addEventListener("change", event => {
    profile.settings.strikeLinesEnabled = event.target.checked;
    saveProfile();
    updateStrikeLineUI();
    updateUI();
    draw(performance.now());

    showToast(
      event.target.checked
        ? "숫자 타격선 ON · 숫자 점수 ×1.8"
        : "숫자 타격선 OFF · 위치 제한 해제"
    );
    sound(event.target.checked ? 620 : 260, .1, "triangle", .03);
  });

  ui.difficultyMultiplierSlider.addEventListener("input", event => {
    const difficulty = Math.max(
      .2,
      Math.min(2, Number(event.target.value) || .75)
    );
    profile.settings.difficultyMultiplier = difficulty;
    ui.difficultyMultiplierValue.textContent =
      "×" + difficulty.toFixed(2) + " · " + difficultyLabel(difficulty);
  });

  ui.difficultyMultiplierSlider.addEventListener("change", event => {
    const difficulty = Math.max(
      .2,
      Math.min(2, Number(event.target.value) || .75)
    );
    profile.settings.difficultyMultiplier = difficulty;
    saveProfile();
    updateDifficultyUI();
    showToast(
      "난이도 ×" + difficulty.toFixed(2) +
      " · 크레딧 보상 ×" + difficulty.toFixed(2)
    );
    sound(300 + difficulty * 170, .1, "triangle", .03);
  });

  ui.creditMultiplierSlider.addEventListener("input", event => {
    const multiplier = Math.max(
      0,
      Math.min(10, Number(event.target.value) || 0)
    );
    profile.settings.creditMultiplier = multiplier;
    ui.creditMultiplierValue.textContent = "×" + multiplier.toFixed(2);
  });

  ui.creditMultiplierSlider.addEventListener("change", event => {
    const multiplier = Math.max(
      0,
      Math.min(10, Number(event.target.value) || 0)
    );
    profile.settings.creditMultiplier = multiplier;
    saveProfile();
    updateCreditMultiplierUI();
    showToast("게임 크레딧 배율 ×" + multiplier.toFixed(2));
    sound(420 + multiplier * 20, .08, "triangle", .025);
  });

  buttons.grantCredits.addEventListener("click", () => {
    requestConfirmation(
      "100,000 크레딧을 받으시겠습니까?",
      "현재 보유 크레딧에 100,000 크레딧이 추가됩니다.",
      () => {
        profile.coins += 100000;
        saveProfile();
        updateCurrencyUI();
        showToast("크레딧 +100,000");
        chordSound([392, 493.88, 587.33, 783.99], .34, .06, "triangle");
      }
    );
  });

  buttons.resetCredits.addEventListener("click", () => {
    requestConfirmation(
      "크레딧을 초기화하시겠습니까?",
      "보유 크레딧이 0으로 변경됩니다. 이 작업은 되돌릴 수 없습니다.",
      () => {
        profile.coins = 0;
        saveProfile();
        updateCurrencyUI();
        showToast("크레딧이 초기화되었습니다");
        sound(105, .12, "square", .025);
      }
    );
  });

  buttons.resetBest.addEventListener("click", () => {
    requestConfirmation(
      "최고 점수를 초기화하시겠습니까?",
      "저장된 최고 점수가 0으로 변경됩니다. 이 작업은 되돌릴 수 없습니다.",
      () => {
        state.best = 0;
        saveBestScore(0);
        ui.best.textContent = "0";
        ui.finalBest.textContent = "0";
        showToast("최고 점수가 초기화되었습니다");
        sound(105, .12, "square", .025);
      }
    );
  });

  buttons.resetItems.addEventListener("click", () => {
    requestConfirmation(
      "보유 아이템을 초기화하시겠습니까?",
      "획득한 타격음, EMP 이펙트, 코어 스킨이 삭제되고 기본 아이템만 남습니다. 크레딧과 최고 점수는 유지됩니다.",
      () => {
        const fresh = defaultProfile();
        profile.owned = fresh.owned;
        profile.equipped = fresh.equipped;
        saveProfile();
        renderLoadout();
        draw(performance.now());
        showToast("아이템이 기본 상태로 초기화되었습니다");
        sound(105, .12, "square", .025);
      }
    );
  });

  buttons.exitGame.addEventListener("click", () => {
    requestConfirmation(
      "현재 게임을 포기하시겠습니까?",
      "현재 점수와 진행 중인 웨이브는 저장되거나 보상으로 지급되지 않습니다.",
      abandonGameToHome
    );
  });
  buttons.startShop.addEventListener("click", () => openShop("start"));
  buttons.startLoadout.addEventListener("click", () => openLoadout("start"));
  buttons.startCore.addEventListener(
    "click",
    () => openCoreSelection("start")
  );
  buttons.gameOverShop.addEventListener("click", () => openShop("gameOver"));
  buttons.gameOverLoadout.addEventListener("click", () => openLoadout("gameOver"));
  buttons.gameOverCore.addEventListener(
    "click",
    () => openCoreSelection("gameOver")
  );
  buttons.shopLoadout.addEventListener(
    "click",
    () => openLoadout(ui.shopOverlay.dataset.returnTo || "start")
  );
  buttons.loadoutShop.addEventListener(
    "click",
    () => openShop(ui.loadoutOverlay.dataset.returnTo || "start")
  );
  buttons.coreShop.addEventListener(
    "click",
    () => openShop("core")
  );
  buttons.coreModuleShop.addEventListener("click", () => {
    openShop("core");
    const target = document.querySelector(
      '[data-draw-category="coreModule"]'
    );
    target?.scrollIntoView({ block: "center" });
    target?.focus();
  });
  buttons.coreSkinShop.addEventListener("click", () => {
    openShop("core");
    const target = document.querySelector(
      '[data-draw-category="coreSkin"]'
    );
    target?.scrollIntoView({ block: "center" });
    target?.focus();
  });
  buttons.closeShop.addEventListener("click", closeShop);
  buttons.closeLoadout.addEventListener("click", closeLoadout);
  buttons.closeCore.addEventListener("click", closeCoreSelection);
  buttons.home.addEventListener("click", () => {
    hideMenuOverlays();
    app.classList.add("menu-mode");
    ui.startOverlay.classList.remove("hidden");
    draw(performance.now());
  });

  document.querySelectorAll("[data-draw-category]").forEach(button => {
    button.addEventListener("click", () => drawShopItem(button.dataset.drawCategory));
  });
  buttons.restart.addEventListener("click", startGame);
  buttons.pauseRestart.addEventListener("click", startGame);
  buttons.resume.addEventListener("click", () => togglePause(false));
  ui.pauseBtn.addEventListener("click", () => togglePause());
  ui.skillBtn.addEventListener("click", activateEMP);

  ui.soundBtn.addEventListener("click", () => {
    audioEnabled = !audioEnabled;
    ui.soundBtn.textContent = audioEnabled ? "🔊" : "🔇";
    if (audioEnabled) {
      ensureAudio();
      sound(520, .08, "sine", .03);
    }
  });

  window.addEventListener("keydown", event => {
    const controlled = [
      "Space", "KeyF", "Enter",
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "Digit1", "Digit2", "Digit3", "Digit4", "Digit5",
      "KeyP", "Escape"
    ];
    if (controlled.includes(event.code)) event.preventDefault();

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
      heldKeys.add(event.code);
    }

    if (event.repeat && !["KeyF", "Enter"].includes(event.code)) return;

    if (event.code === "Space") {
      activateEMP();
    } else if (event.code === "KeyF" || (event.code === "Enter" && running)) {
      primaryAttack(state.aimX, state.aimY);
    } else if (KEY_ENEMY_KEYS.includes(event.code)) {
      keyboardEnemyAttack(event.code);
    } else if (event.code === "KeyP" || event.code === "Escape") {
      togglePause();
    } else if (event.code === "Enter" && !running) {
      startGame();
    }
  });

  window.addEventListener("keyup", event => heldKeys.delete(event.code));
  window.addEventListener("blur", () => heldKeys.clear());

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running && !paused) togglePause(true);
  });

  window.addEventListener("resize", resize);
  resize();
  updateUI();
  updateCurrencyUI();
  updateCreditMultiplierUI();
  updateDifficultyUI();
  updateStrikeLineUI();
  updateLeftOrderUI();
  renderShop();
  renderLoadout();
  renderCoreSelection();
  draw(performance.now());
})();
