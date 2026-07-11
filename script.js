"use strict";

const DEBUG_HITBOX = false;
const DEBUG_STAGE = false;
const DEBUG_GAMEPAD = false;
const DEBUG_DOG_LOGIC = false;
const RANDOM_SEED = null;

const CANVAS_CONFIG = {
  width: 960,
  height: 540
};

const GAME_STATE = {
  TITLE: "title",
  PLAYING: "playing",
  GAME_OVER: "gameOver",
  STAGE_CLEAR: "stageClear",
  ENDING: "ending"
};

const STORAGE_KEYS = {
  highScore: "ricca_mugi_game_high_score",
  muted: "ricca_mugi_game_muted"
};

const AUDIO_CONFIG = {
  bgmVolume: 0.35,
  tranceBgmVolume: 0.45,
  sfxVolume: 0.7
};

const BGM_TRACKS = {
  stage: [
    "assets/sounds/mugi_ricca_BGM_01.mp3",
    "assets/sounds/mugi_ricca_BGM_02.mp3",
    "assets/sounds/mugi_ricca_BGM_03.mp3",
    "assets/sounds/mugi_ricca_BGM_04.mp3",
    "assets/sounds/mugi_ricca_BGM_05.mp3",
    "assets/sounds/mugi_ricca_BGM_06.mp3"
  ],
  trance: "assets/sounds/ricca_trance_BGM.mp3"
};

const GAMEPAD_MAPPING = {
  A: 0,
  B: 1,
  SELECT: 8,
  START: 9,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15
};

const GAMEPAD_AXIS_THRESHOLD = 0.5;

const STAGE_CONFIG = {
  totalStages: 5,
  continuePenalty: 20,
  segmentWidth: 520,
  groundY: 438,
  snackScore: 10,
  awakeningItemScore: 30,
  fallLimit: 620,
  cameraLeadX: 380,
  goalWidth: 64,
  goalHeight: 128
};

const STAGE_GENERATION_CONFIGS = {
  1: { baseLength: 3200, length: 6400, holes: 2, obstacles: 3, platforms: 4, treats: 8, awakeningItems: 1, dogs: 2, dogTypes: ["A", "B", "C"], maxHoleWidth: 105, maxObstacleHeight: 46 },
  2: { baseLength: 3800, length: 7600, holes: 3, obstacles: 4, platforms: 5, treats: 10, awakeningItems: 2, dogs: 3, dogTypes: ["A", "B", "C"], maxHoleWidth: 120, maxObstacleHeight: 52 },
  3: { baseLength: 4400, length: 8800, holes: 3, obstacles: 5, platforms: 6, treats: 11, awakeningItems: 2, dogs: 4, dogTypes: ["A", "B", "C", "D"], maxHoleWidth: 130, maxObstacleHeight: 56 },
  4: { baseLength: 5000, length: 10000, holes: 4, obstacles: 6, platforms: 7, treats: 12, awakeningItems: 2, dogs: 5, dogTypes: ["A", "B", "C", "D"], maxHoleWidth: 140, maxObstacleHeight: 60 },
  5: { baseLength: 5600, length: 11200, holes: 5, obstacles: 7, platforms: 8, treats: 14, awakeningItems: 2, dogs: 6, dogTypes: ["A", "B", "C", "D"], maxHoleWidth: 145, maxObstacleHeight: 62 }
};

const AWAKENING_CONFIG = {
  requiredItems: 3,
  duration: 6000,
  messageDuration: 1200,
  auraScale: 1.08,
  riccaAwakenedStats: {
    moveSpeed: 480,
    jumpPower: 900,
    gravity: 1620,
    maxFallSpeed: 1040,
    acceleration: 3400,
    friction: 0.92,
    minSlideSpeed: 85
  }
};

const OTHER_DOG_CONFIG = {
  eventDistance: 90,
  cooldown: 3000,
  mugiStunDuration: 800,
  awakenedPenaltySlowScale: 0.72,
  normalPenaltySlowScale: 0.55,
  riccaFollowUpDelay: 500,
  bobAmplitude: 2,
  reactionDistance: 34
};

const OTHER_DOG_TYPES = {
  A: {
    id: "A",
    label: "犬A",
    description: "濃い茶色",
    color: "#5a3825",
    outlineColor: "#352116",
    width: 58,
    height: 44,
    scores: { mugi: -5, ricca: 10 },
    messages: {
      mugi: "犬A：むぎ ガウ！ -5",
      ricca: "犬A：りっか わん！ +10",
      riccaAwakenedPositive: "犬A：覚醒りっか！ +20"
    },
    imagePaths: ["assets/images/other_dog_a_01.png", "assets/images/other_dog_a_02.png"]
  },
  B: {
    id: "B",
    label: "犬B",
    description: "白っぽい",
    color: "#f3efe2",
    outlineColor: "#b7aa8a",
    width: 58,
    height: 44,
    scores: { mugi: 10, ricca: -5 },
    messages: {
      mugi: "犬B：むぎ なかよし！ +10",
      ricca: "犬B：りっか びっくり！ -5",
      riccaAwakenedNegative: "犬B：覚醒りっか 勢い余った！ -10"
    },
    imagePaths: ["assets/images/other_dog_b_01.png", "assets/images/other_dog_b_02.png"]
  },
  C: {
    id: "C",
    label: "犬C",
    description: "グレー",
    color: "#8f8f8f",
    outlineColor: "#5e5e5e",
    width: 58,
    height: 44,
    scores: { mugi: 10, ricca: 10 },
    messages: {
      mugi: "犬C：むぎ あそぼ！ +10",
      ricca: "犬C：りっか わん！ +10",
      riccaAwakenedPositive: "犬C：覚醒りっか！ +20"
    },
    imagePaths: ["assets/images/other_dog_c_01.png", "assets/images/other_dog_c_02.png"]
  },
  D: {
    id: "D",
    label: "犬D",
    description: "大型犬",
    color: "#8b5a2b",
    outlineColor: "#4f321c",
    colorVariants: ["#8b5a2b", "#f2f2e8", "#888888", "#222222"],
    width: 130,
    height: 100,
    scores: { mugi: -5, ricca: -5 },
    messages: {
      mugi: "犬D：むぎ ちょっと警戒… -5",
      ricca: "犬D：りっか あわわ… -5",
      riccaAwakenedNegative: "犬D：覚醒りっか 勢い余った！ -10"
    },
    imagePaths: ["assets/images/other_dog_d_01.png", "assets/images/other_dog_d_02.png"]
  }
};

const FLOATING_TEXT_CONFIG = {
  duration: 1,
  riseSpeed: 46
};

const CHARACTER_CONFIGS = {
  ricca: {
    displayName: "りっか",
    runImages: [
      "assets/images/ricca_run_01.png",
      "assets/images/ricca_run_02.png"
    ],
    fallbackColor: "#252525",
    drawWidth: 100,
    drawHeight: 74,
    hitboxWidth: 58,
    hitboxHeight: 42,
    moveSpeed: 300,
    jumpPower: 700,
    gravity: 1700,
    maxFallSpeed: 980,
    animationFrameInterval: 120
  },
  mugi: {
    displayName: "むぎ",
    runImages: [
      "assets/images/mugi_run_01.png",
      "assets/images/mugi_run_02.png"
    ],
    fallbackColor: "#d8aa68",
    drawWidth: 100,
    drawHeight: 74,
    hitboxWidth: 58,
    hitboxHeight: 42,
    moveSpeed: 390,
    jumpPower: 790,
    gravity: 1700,
    maxFallSpeed: 1000,
    animationFrameInterval: 100
  }
};

const CHARACTER_ORDER = ["ricca", "mugi"];
const START_POSITION = { x: 80, y: 360 };
let randomState = RANDOM_SEED;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const stageClearScreen = document.getElementById("stageClearScreen");
const endingScreen = document.getElementById("endingScreen");
const startButton = document.getElementById("startButton");
const titleSoundButton = document.getElementById("titleSoundButton");
const restartButton = document.getElementById("restartButton");
const continueButton = document.getElementById("continueButton");
const nextStageButton = document.getElementById("nextStageButton");
const clearRestartButton = document.getElementById("clearRestartButton");
const clearTitleButton = document.getElementById("clearTitleButton");
const gameOverTitleButton = document.getElementById("gameOverTitleButton");
const endingPlayAgainButton = document.getElementById("endingPlayAgainButton");
const endingTitleButton = document.getElementById("endingTitleButton");
const muteButton = document.getElementById("muteButton");
const stageText = document.getElementById("stageText");
const scoreText = document.getElementById("scoreText");
const characterText = document.getElementById("characterText");
const awakeningText = document.getElementById("awakeningText");
const awakeningBar = document.getElementById("awakeningBar");
const soundText = document.getElementById("soundText");
const padText = document.getElementById("padText");
const titleHighScoreText = document.getElementById("titleHighScoreText");
const finalScoreText = document.getElementById("finalScoreText");
const gameOverHighScoreText = document.getElementById("gameOverHighScoreText");
const clearTitle = document.getElementById("clearTitle");
const clearScoreText = document.getElementById("clearScoreText");
const clearHighScoreText = document.getElementById("clearHighScoreText");
const endingScoreText = document.getElementById("endingScoreText");
const endingHighScoreText = document.getElementById("endingHighScoreText");

const input = {
  left: false,
  right: false,
  jumpHeld: false,
  jumpPressed: false,
  switchPressed: false,
  soundTogglePressed: false,
  menuUpPressed: false,
  menuDownPressed: false,
  menuSelectPressed: false,
  menuBackPressed: false
};

let characterImages = {};
let activeCharacterId = "ricca";
let player;
let items = [];
let obstacles = [];
let otherDogs = [];
let otherDogImages = [];
let score = 0;
let highScore = 0;
let cameraX = 0;
let gameState = GAME_STATE.TITLE;
let lastTime = 0;
let currentLevelIndex = 0;
let currentLevel = null;
let switchEffectTime = 0;
let awakeningItemCount = 0;
let isAwakened = false;
let awakeningTimer = 0;
let awakeningMessageTimer = 0;
let statusMessage = "";
let statusMessageTimer = 0;
let mugiStunTimer = 0;
let messageManager;
let soundManager;
let gamepadManager;
let menuManager;
let floatingTexts = [];

class Player {
  constructor(characterId, images, state = {}) {
    this.characterId = characterId;
    this.images = images;
    this.x = state.x ?? START_POSITION.x;
    this.y = state.y ?? START_POSITION.y;
    this.vx = state.vx ?? 0;
    this.vy = state.vy ?? 0;
    this.facing = state.facing ?? "right";
    this.isOnGround = state.isOnGround ?? false;
    this.animationTime = 0;
    this.animationFrame = 0;
  }

  get config() {
    const baseConfig = CHARACTER_CONFIGS[this.characterId];
    if (this.characterId !== "ricca" || !isAwakened) {
      return baseConfig;
    }

    return {
      ...baseConfig,
      ...AWAKENING_CONFIG.riccaAwakenedStats,
      animationFrameInterval: 80
    };
  }

  update(deltaTime, currentInput, platforms) {
    const config = this.config;
    const awakenedRicca = this.characterId === "ricca" && isAwakened;

    if (awakenedRicca) {
      this.updateAwakenedHorizontalVelocity(deltaTime, currentInput, config);
    } else {
      this.vx = 0;

      if (currentInput.left) {
        this.vx = -config.moveSpeed;
        this.facing = "left";
      }

      if (currentInput.right) {
        this.vx = config.moveSpeed;
        this.facing = "right";
      }
    }

    if (currentInput.jumpPressed && this.isOnGround) {
      this.jump();
    }

    this.x += this.vx * deltaTime;
    this.x = Math.max(0, Math.min(this.x, getCurrentLevel().length - config.hitboxWidth));

    const previousY = this.y;
    this.vy = Math.min(this.vy + config.gravity * deltaTime, config.maxFallSpeed);
    this.y += this.vy * deltaTime;
    this.isOnGround = false;

    for (const platform of platforms) {
      if (this.isLandingOnPlatform(platform, previousY)) {
        this.y = platform.y - this.config.hitboxHeight;
        this.vy = 0;
        this.isOnGround = true;
      }
    }

    this.updateAnimation(deltaTime, currentInput);
  }

  updateAwakenedHorizontalVelocity(deltaTime, currentInput, config) {
    let direction = 0;
    if (currentInput.left) {
      direction -= 1;
    }
    if (currentInput.right) {
      direction += 1;
    }

    if (direction !== 0) {
      this.vx += direction * config.acceleration * deltaTime;
      this.facing = direction < 0 ? "left" : "right";
    } else {
      this.vx *= Math.pow(config.friction, deltaTime * 60);
    }

    const facingDirection = this.facing === "left" ? -1 : 1;
    if (Math.abs(this.vx) < config.minSlideSpeed) {
      this.vx = facingDirection * config.minSlideSpeed;
    }

    this.vx = clamp(this.vx, -config.moveSpeed, config.moveSpeed);
  }

  updateAnimation(deltaTime, currentInput) {
    if (!this.isOnGround) {
      this.animationFrame = 1;
      return;
    }

    if (!currentInput.left && !currentInput.right) {
      this.animationTime = 0;
      this.animationFrame = 0;
      return;
    }

    this.animationTime += deltaTime * 1000;
    if (this.animationTime >= this.config.animationFrameInterval) {
      this.animationTime = 0;
      this.animationFrame = this.animationFrame === 0 ? 1 : 0;
    }
  }

  draw(context, currentCameraX) {
    const config = this.config;
    const hitbox = this.getHitbox();
    const drawScale = this.characterId === "ricca" && isAwakened ? AWAKENING_CONFIG.auraScale : 1;
    const image = this.images[this.animationFrame];

    if (image && image.loaded) {
      const drawSize = getImageDrawSize(image.element, config.drawHeight * drawScale, config.drawWidth * drawScale);
      const footY = hitbox.y + hitbox.height + 8;
      const drawX = hitbox.x - currentCameraX + hitbox.width / 2 - drawSize.width / 2;
      const drawY = footY - drawSize.height;

      context.save();
      if (this.facing === "left") {
        context.translate(drawX + drawSize.width, drawY);
        context.scale(-1, 1);
        context.drawImage(image.element, 0, 0, drawSize.width, drawSize.height);
      } else {
        context.drawImage(image.element, drawX, drawY, drawSize.width, drawSize.height);
      }
      context.restore();
    } else {
      this.drawFallback(context, currentCameraX);
    }

    if (DEBUG_HITBOX) {
      context.strokeStyle = "#ff1744";
      context.lineWidth = 2;
      context.strokeRect(hitbox.x - currentCameraX, hitbox.y, hitbox.width, hitbox.height);
    }
  }

  drawFallback(context, currentCameraX) {
    const hitbox = this.getHitbox();
    const width = this.config.hitboxWidth;
    const height = this.config.hitboxHeight;
    const x = hitbox.x - currentCameraX + hitbox.width / 2 - width / 2;
    const y = hitbox.y + hitbox.height - height;
    context.fillStyle = this.config.fallbackColor;
    context.fillRect(x, y, width, height);
    context.fillStyle = "#f8f5ef";
    context.fillRect(x + (this.facing === "right" ? width - 16 : 8), y + 10, 8, 8);
  }

  jump() {
    if (!this.isOnGround) {
      return;
    }
    this.vy = -this.config.jumpPower;
    this.isOnGround = false;
    soundManager.playJump();
  }

  getHitbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.config.hitboxWidth,
      height: this.config.hitboxHeight
    };
  }

  isLandingOnPlatform(platform, previousY) {
    const hitbox = this.getHitbox();
    const previousBottom = previousY + this.config.hitboxHeight;
    const currentBottom = hitbox.y + hitbox.height;
    const overlapsX = hitbox.x + hitbox.width > platform.x && hitbox.x < platform.x + platform.width;
    return overlapsX && previousBottom <= platform.y && currentBottom >= platform.y && this.vy >= 0;
  }
}

class OtherDog {
  constructor(config, index) {
    this.x = config.x;
    this.groundY = config.groundY ?? config.y;
    this.type = normalizeOtherDogType(config.type);
    this.config = OTHER_DOG_TYPES[this.type];
    this.width = this.config.width;
    this.height = this.config.height;
    this.color = config.colorVariant || this.config.color;
    this.index = index;
    this.cooldownTimer = 0;
    this.reactionTimer = 0;
    this.reactionType = "idle";
    this.direction = index % 2 === 0 ? -1 : 1;
    this.animTime = 0;
  }

  update(deltaTime) {
    this.animTime += deltaTime * 1000;
    this.cooldownTimer = Math.max(0, this.cooldownTimer - deltaTime * 1000);
    this.reactionTimer = Math.max(0, this.reactionTimer - deltaTime * 1000);

    if (this.reactionTimer <= 0) {
      this.reactionType = "idle";
    }
  }

  draw(context, currentCameraX, images) {
    const x = this.getDrawX() - currentCameraX;
    const bobOffset = Math.sin(this.animTime * 0.005 + this.index) * OTHER_DOG_CONFIG.bobAmplitude;
    const y = this.groundY - this.height + bobOffset;
    const frame = Math.floor(performance.now() / 240) % 2;
    const image = images[this.type]?.[frame];

    if (image && image.loaded) {
      context.drawImage(image.element, x, y, this.width, this.height);
    } else {
      this.drawFallback(context, x, y);
    }

    if (DEBUG_HITBOX) {
      const area = this.getEventArea();
      context.strokeStyle = "#b965ff";
      context.lineWidth = 2;
      context.strokeRect(area.x - currentCameraX, area.y, area.width, area.height);
    }
  }

  drawFallback(context, x, y) {
    context.save();
    context.fillStyle = this.color;
    context.strokeStyle = this.config.outlineColor;
    context.lineWidth = 3;
    context.beginPath();
    context.ellipse(x + this.width * 0.48, y + this.height * 0.55, this.width * 0.48, this.height * 0.34, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(x + this.width * 0.78, y + this.height * 0.32, this.height * 0.28, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = "#25313d";
    context.beginPath();
    context.arc(x + this.width * 0.84, y + this.height * 0.28, 3, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = this.config.outlineColor;
    context.fillRect(x + this.width * 0.18, y + this.height * 0.8, this.width * 0.12, this.height * 0.22);
    context.fillRect(x + this.width * 0.62, y + this.height * 0.8, this.width * 0.12, this.height * 0.22);
    context.fillStyle = this.type === "B" ? "#25313d" : "#ffffff";
    context.strokeStyle = "#25313d";
    context.lineWidth = 2;
    context.font = `bold ${this.height > 50 ? 22 : 16}px system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(this.config.id, x + this.width * 0.44, y + this.height * 0.53);
    context.strokeText(this.config.id, x + this.width * 0.44, y + this.height * 0.53);
    context.restore();
  }

  getDrawX() {
    if (this.reactionType === "mugi") {
      return this.x + this.direction * OTHER_DOG_CONFIG.reactionDistance;
    }
    if (this.reactionType === "awakened") {
      return this.x + this.direction * OTHER_DOG_CONFIG.reactionDistance * 1.5;
    }
    return this.x;
  }

  getCenter() {
    return {
      x: this.getDrawX() + this.width / 2,
      y: this.groundY - this.height / 2
    };
  }

  getEventArea() {
    const center = this.getCenter();
    return {
      x: center.x - OTHER_DOG_CONFIG.eventDistance,
      y: center.y - OTHER_DOG_CONFIG.eventDistance,
      width: OTHER_DOG_CONFIG.eventDistance * 2,
      height: OTHER_DOG_CONFIG.eventDistance * 2
    };
  }

  canTrigger() {
    return this.cooldownTimer <= 0;
  }

  triggerReaction(type) {
    this.reactionType = type;
    this.reactionTimer = 650;
    this.cooldownTimer = OTHER_DOG_CONFIG.cooldown;
  }
}

class MessageManager {
  constructor() {
    this.messages = [];
  }

  add(text, duration = 1.4, delay = 0) {
    this.messages.push({ text, duration, remaining: duration, delay });
  }

  update(deltaTime) {
    for (const message of this.messages) {
      if (message.delay > 0) {
        message.delay -= deltaTime;
      } else {
        message.remaining -= deltaTime;
      }
    }
    this.messages = this.messages.filter((message) => message.delay > 0 || message.remaining > 0);
  }

  draw(context) {
    context.save();
    context.textAlign = "center";
    context.font = "bold 28px system-ui, sans-serif";
    this.messages.forEach((message, index) => {
      if (message.delay > 0) {
        return;
      }
      const alpha = Math.min(1, message.remaining / 0.25);
      context.globalAlpha = alpha;
      context.fillStyle = "#1e425b";
      context.fillText(message.text, CANVAS_CONFIG.width / 2, 246 + index * 34);
    });
    context.restore();
  }
}

class FloatingText {
  constructor(text, x, y, options = {}) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.startY = y;
    this.duration = options.duration ?? FLOATING_TEXT_CONFIG.duration;
    this.remaining = this.duration;
    this.color = options.color ?? "#1e425b";
    this.world = options.world ?? true;
  }

  update(deltaTime) {
    this.remaining -= deltaTime;
    const progress = 1 - this.remaining / this.duration;
    this.y = this.startY - progress * FLOATING_TEXT_CONFIG.riseSpeed;
  }

  draw(context, currentCameraX) {
    const alpha = clamp(this.remaining / 0.25, 0, 1);
    const drawX = this.world ? this.x - currentCameraX : this.x;
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = this.color;
    context.font = "bold 24px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText(this.text, drawX, this.y);
    context.restore();
  }

  isAlive() {
    return this.remaining > 0;
  }
}

class SoundManager {
  constructor() {
    this.context = null;
    this.enabled = false;
    this.muted = readStoredBoolean(STORAGE_KEYS.muted, false);
    this.stageBgm = null;
    this.tranceBgm = null;
    this.currentStageTrackPath = null;
    this.previousStageTrackPath = null;
    this.isTranceBgmPlaying = false;
  }

  init() {
    if (this.context || this.enabled) {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }
      this.context = new AudioContextClass();
      this.enabled = true;
    } catch (error) {
      this.enabled = false;
      this.context = null;
    }
  }

  resume() {
    this.init();
    if (!this.context || this.context.state !== "suspended") {
      return;
    }

    try {
      this.context.resume().catch(() => {});
    } catch (error) {
      // Audio is optional. Keep the game running silently if resume fails.
    }
  }

  setMuted(value) {
    this.muted = value;
    writeStoredBoolean(STORAGE_KEYS.muted, value);
    if (this.muted) {
      this.pauseBgm();
    } else if (gameState === GAME_STATE.PLAYING) {
      this.resumeBgm();
    }
    updateSoundHud();
  }

  toggleMuted() {
    this.setMuted(!this.muted);
  }

  playJump() {
    this.playToneSequence([
      { frequency: 520, start: 0, duration: 0.05, type: "triangle", gain: 0.08 },
      { frequency: 760, start: 0.04, duration: 0.08, type: "triangle", gain: 0.07 }
    ]);
  }

  playTreat() {
    this.playToneSequence([
      { frequency: 880, start: 0, duration: 0.08, type: "sine", gain: 0.07 }
    ]);
  }

  playAwakeningItem() {
    this.playToneSequence([
      { frequency: 740, start: 0, duration: 0.07, type: "sine", gain: 0.07 },
      { frequency: 1040, start: 0.07, duration: 0.09, type: "sine", gain: 0.06 }
    ]);
  }

  playAwakenStart() {
    this.playToneSequence([
      { frequency: 440, start: 0, duration: 0.12, type: "triangle", gain: 0.08 },
      { frequency: 660, start: 0.11, duration: 0.14, type: "triangle", gain: 0.08 },
      { frequency: 990, start: 0.24, duration: 0.18, type: "triangle", gain: 0.07 }
    ]);
  }

  playGau() {
    this.playToneSequence([
      { frequency: 190, start: 0, duration: 0.09, type: "sawtooth", gain: 0.05 },
      { frequency: 140, start: 0.08, duration: 0.08, type: "sawtooth", gain: 0.04 }
    ]);
  }

  playCombo() {
    this.playToneSequence([
      { frequency: 620, start: 0, duration: 0.07, type: "square", gain: 0.05 },
      { frequency: 840, start: 0.07, duration: 0.1, type: "square", gain: 0.05 }
    ]);
  }

  playBreak() {
    this.playToneSequence([
      { frequency: 240, start: 0, duration: 0.06, type: "square", gain: 0.07 },
      { frequency: 420, start: 0.05, duration: 0.08, type: "triangle", gain: 0.07 },
      { frequency: 760, start: 0.12, duration: 0.1, type: "triangle", gain: 0.06 }
    ]);
  }

  playGameOver() {
    this.playToneSequence([
      { frequency: 260, start: 0, duration: 0.14, type: "triangle", gain: 0.08 },
      { frequency: 160, start: 0.14, duration: 0.18, type: "triangle", gain: 0.08 }
    ]);
  }

  playGoal() {
    this.playToneSequence([
      { frequency: 520, start: 0, duration: 0.1, type: "triangle", gain: 0.08 },
      { frequency: 660, start: 0.1, duration: 0.1, type: "triangle", gain: 0.08 },
      { frequency: 780, start: 0.2, duration: 0.18, type: "triangle", gain: 0.08 }
    ]);
  }

  startStageBgm() {
    this.resume();
    const trackPath = this.chooseStageTrack();
    this.previousStageTrackPath = this.currentStageTrackPath;
    this.currentStageTrackPath = trackPath;
    this.isTranceBgmPlaying = false;
    this.stopAudio(this.tranceBgm, true);
    this.tranceBgm = null;
    this.stopAudio(this.stageBgm, true);
    this.stageBgm = this.createLoopingAudio(trackPath, AUDIO_CONFIG.bgmVolume);
    this.playAudio(this.stageBgm);
  }

  switchToTranceBgm() {
    this.resume();
    this.isTranceBgmPlaying = true;
    this.pauseAudio(this.stageBgm);
    this.stopAudio(this.tranceBgm, true);
    this.tranceBgm = this.createLoopingAudio(BGM_TRACKS.trance, AUDIO_CONFIG.tranceBgmVolume);
    this.playAudio(this.tranceBgm);
  }

  returnToStageBgm() {
    this.isTranceBgmPlaying = false;
    this.stopAudio(this.tranceBgm, true);
    this.tranceBgm = null;
    if (gameState === GAME_STATE.PLAYING) {
      this.playAudio(this.stageBgm);
    }
  }

  stopBgm() {
    this.isTranceBgmPlaying = false;
    this.stopAudio(this.stageBgm, false);
    this.stopAudio(this.tranceBgm, true);
    this.tranceBgm = null;
  }

  pauseBgm() {
    this.pauseAudio(this.stageBgm);
    this.pauseAudio(this.tranceBgm);
  }

  resumeBgm() {
    if (this.isTranceBgmPlaying) {
      this.playAudio(this.tranceBgm);
    } else {
      this.playAudio(this.stageBgm);
    }
  }

  chooseStageTrack() {
    if (BGM_TRACKS.stage.length === 0) {
      return "";
    }

    const availableTracks = BGM_TRACKS.stage.length > 1
      ? BGM_TRACKS.stage.filter((track) => track !== this.currentStageTrackPath)
      : BGM_TRACKS.stage;
    return availableTracks[Math.floor(Math.random() * availableTracks.length)];
  }

  createLoopingAudio(src, volume) {
    if (!src) {
      return null;
    }

    try {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = volume;
      audio.preload = "auto";
      return audio;
    } catch (error) {
      return null;
    }
  }

  playAudio(audio) {
    if (!audio || this.muted) {
      return;
    }

    try {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } catch (error) {
      // BGM is optional. Continue silently if playback is unavailable.
    }
  }

  pauseAudio(audio) {
    if (!audio) {
      return;
    }

    try {
      audio.pause();
    } catch (error) {
      // Ignore optional audio failures.
    }
  }

  stopAudio(audio, resetToStart) {
    if (!audio) {
      return;
    }

    try {
      audio.pause();
      if (resetToStart) {
        audio.currentTime = 0;
      }
    } catch (error) {
      // Ignore optional audio failures.
    }
  }

  playToneSequence(notes) {
    if (this.muted) {
      return;
    }

    this.resume();
    if (!this.context || !this.enabled) {
      return;
    }

    try {
      const now = this.context.currentTime;
      for (const note of notes) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = note.type;
        oscillator.frequency.setValueAtTime(note.frequency, now + note.start);
        gain.gain.setValueAtTime(0.0001, now + note.start);
        gain.gain.exponentialRampToValueAtTime(note.gain * AUDIO_CONFIG.sfxVolume, now + note.start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
        oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.start(now + note.start);
        oscillator.stop(now + note.start + note.duration + 0.02);
      }
    } catch (error) {
      // Sound is decorative; ignore failures.
    }
  }
}

class GamepadManager {
  constructor() {
    this.connected = false;
    this.currentButtons = {};
    this.previousButtons = {};
    this.leftHeld = false;
    this.rightHeld = false;
    this.lastDebugTime = 0;
  }

  update() {
    this.previousButtons = { ...this.currentButtons };
    this.currentButtons = {};
    this.leftHeld = false;
    this.rightHeld = false;

    const gamepad = this.getPrimaryGamepad();
    this.connected = Boolean(gamepad);
    if (!gamepad) {
      updateGamepadHud();
      return;
    }

    this.currentButtons.A = this.isButtonDown(gamepad, GAMEPAD_MAPPING.A);
    this.currentButtons.B = this.isButtonDown(gamepad, GAMEPAD_MAPPING.B);
    this.currentButtons.SELECT = this.isButtonDown(gamepad, GAMEPAD_MAPPING.SELECT);
    this.currentButtons.START = this.isButtonDown(gamepad, GAMEPAD_MAPPING.START);
    this.currentButtons.DPAD_UP = this.isButtonDown(gamepad, GAMEPAD_MAPPING.DPAD_UP) || this.getAxis(gamepad, 1) < -GAMEPAD_AXIS_THRESHOLD;
    this.currentButtons.DPAD_DOWN = this.isButtonDown(gamepad, GAMEPAD_MAPPING.DPAD_DOWN) || this.getAxis(gamepad, 1) > GAMEPAD_AXIS_THRESHOLD;
    this.currentButtons.DPAD_LEFT = this.isButtonDown(gamepad, GAMEPAD_MAPPING.DPAD_LEFT) || this.getAxis(gamepad, 0) < -GAMEPAD_AXIS_THRESHOLD;
    this.currentButtons.DPAD_RIGHT = this.isButtonDown(gamepad, GAMEPAD_MAPPING.DPAD_RIGHT) || this.getAxis(gamepad, 0) > GAMEPAD_AXIS_THRESHOLD;
    this.leftHeld = this.currentButtons.DPAD_LEFT;
    this.rightHeld = this.currentButtons.DPAD_RIGHT;

    if (DEBUG_GAMEPAD) {
      this.debug(gamepad);
    }
    updateGamepadHud();
  }

  getPrimaryGamepad() {
    if (!navigator.getGamepads) {
      return null;
    }

    try {
      return Array.from(navigator.getGamepads()).find((gamepad) => gamepad && gamepad.connected) ?? null;
    } catch (error) {
      return null;
    }
  }

  isButtonDown(gamepad, buttonIndex) {
    const button = gamepad.buttons?.[buttonIndex];
    return Boolean(button?.pressed || button?.value > 0.5);
  }

  getAxis(gamepad, axisIndex) {
    return gamepad.axes?.[axisIndex] ?? 0;
  }

  isPressed(buttonName) {
    return Boolean(this.currentButtons[buttonName] && !this.previousButtons[buttonName]);
  }

  isHeld(buttonName) {
    return Boolean(this.currentButtons[buttonName]);
  }

  debug(gamepad) {
    const now = performance.now();
    if (now - this.lastDebugTime < 500) {
      return;
    }
    this.lastDebugTime = now;
    const pressedButtons = gamepad.buttons
      .map((button, index) => button.pressed ? index : null)
      .filter((index) => index !== null);
    if (pressedButtons.length || Math.abs(this.getAxis(gamepad, 0)) > 0.1 || Math.abs(this.getAxis(gamepad, 1)) > 0.1) {
      console.log("Gamepad", {
        id: gamepad.id,
        pressedButtons,
        axes: gamepad.axes
      });
    }
  }
}

class MenuManager {
  constructor() {
    this.selectedIndexByState = {
      [GAME_STATE.TITLE]: 0,
      [GAME_STATE.GAME_OVER]: 0,
      [GAME_STATE.STAGE_CLEAR]: 0,
      [GAME_STATE.ENDING]: 0
    };
  }

  resetForState(state) {
    this.selectedIndexByState[state] = 0;
    this.updateSelection();
  }

  getButtons() {
    if (gameState === GAME_STATE.TITLE) {
      return [startButton, titleSoundButton];
    }
    if (gameState === GAME_STATE.GAME_OVER) {
      return [continueButton, restartButton, gameOverTitleButton];
    }
    if (gameState === GAME_STATE.STAGE_CLEAR) {
      return [nextStageButton, clearRestartButton, clearTitleButton];
    }
    if (gameState === GAME_STATE.ENDING) {
      return [endingPlayAgainButton, endingTitleButton];
    }
    return [];
  }

  move(direction) {
    const buttons = this.getButtons();
    if (buttons.length === 0) {
      return;
    }
    const currentIndex = this.selectedIndexByState[gameState] ?? 0;
    this.selectedIndexByState[gameState] = (currentIndex + direction + buttons.length) % buttons.length;
    this.updateSelection();
  }

  select() {
    const buttons = this.getButtons();
    if (buttons.length === 0) {
      return;
    }
    const currentIndex = this.selectedIndexByState[gameState] ?? 0;
    buttons[currentIndex]?.click();
  }

  back() {
    if (gameState === GAME_STATE.TITLE) {
      return;
    }
    showTitleScreen();
  }

  updateSelection() {
    for (const button of document.querySelectorAll(".menu-button.selected")) {
      button.classList.remove("selected");
    }

    const buttons = this.getButtons();
    if (buttons.length === 0) {
      return;
    }
    const currentIndex = clamp(this.selectedIndexByState[gameState] ?? 0, 0, buttons.length - 1);
    this.selectedIndexByState[gameState] = currentIndex;
    buttons[currentIndex]?.classList.add("selected");
  }
}

function readStoredNumber(key, fallbackValue) {
  try {
    const value = window.localStorage.getItem(key);
    const number = Number(value);
    return Number.isFinite(number) ? number : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function writeStoredNumber(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch (error) {
    // Storage is optional.
  }
}

function readStoredBoolean(key, fallbackValue) {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) {
      return fallbackValue;
    }
    return value === "true";
  } catch (error) {
    return fallbackValue;
  }
}

function writeStoredBoolean(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch (error) {
    // Storage is optional.
  }
}

function addScore(amount, label, x, y) {
  score = Math.max(0, score + amount);
  floatingTexts.push(new FloatingText(label, x, y, {
    color: amount < 0 ? "#d94c4c" : "#1e8f5a"
  }));
  updateHud();
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    writeStoredNumber(STORAGE_KEYS.highScore, highScore);
  }
  updateTitleHighScore();
}

function updateTitleHighScore() {
  titleHighScoreText.textContent = String(highScore);
}

function updateSoundHud() {
  if (!soundManager) {
    return;
  }
  const label = soundManager.muted ? "OFF" : "ON";
  soundText.textContent = label;
  muteButton.textContent = soundManager.muted ? "音OFF" : "音ON";
  titleSoundButton.textContent = soundManager.muted ? "SOUND OFF" : "SOUND ON";
}

function updateGamepadHud() {
  if (!padText || !gamepadManager) {
    return;
  }
  padText.textContent = gamepadManager.connected ? "ON" : "OFF";
}

function createRandom() {
  if (RANDOM_SEED === null) {
    return Math.random;
  }

  randomState = randomState ?? RANDOM_SEED;
  return () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0;
    return randomState / 4294967296;
  };
}

function randomBetween(random, min, max) {
  return min + (max - min) * random();
}

function randomInt(random, min, max) {
  return Math.floor(randomBetween(random, min, max + 1));
}

function chooseRandom(random, values) {
  return values[Math.floor(random() * values.length)];
}

function isNearHole(x, holes, padding = 70) {
  return holes.some((hole) => x > hole.x - padding && x < hole.x + hole.width + padding);
}

function isFarEnough(x, values, minDistance) {
  return values.every((value) => Math.abs(value - x) >= minDistance);
}

function getGroundPlatformSegments(length, holes) {
  const platforms = [];
  let startX = 0;

  for (const hole of holes) {
    if (hole.x > startX) {
      platforms.push({
        x: startX,
        y: STAGE_CONFIG.groundY,
        width: hole.x - startX,
        height: 42,
        type: "ground"
      });
    }
    startX = hole.x + hole.width;
  }

  if (startX < length) {
    platforms.push({
      x: startX,
      y: STAGE_CONFIG.groundY,
      width: length - startX,
      height: 42,
      type: "ground"
    });
  }

  return platforms.filter((platform) => platform.width >= 80);
}

function getSafeGroundX(random, length, holes, usedX = [], options = {}) {
  const minX = options.minX ?? 680;
  const maxX = options.maxX ?? length - 560;
  const minDistance = options.minDistance ?? 180;
  const holePadding = options.holePadding ?? 110;

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const x = randomBetween(random, minX, maxX);
    if (!isNearHole(x, holes, holePadding) && isFarEnough(x, usedX, minDistance)) {
      usedX.push(x);
      return x;
    }
  }

  const fallbackX = Math.min(maxX, Math.max(minX, usedX.length ? usedX[usedX.length - 1] + minDistance : minX));
  usedX.push(fallbackX);
  return fallbackX;
}


function getLengthScaledCount(config, key) {
  const baseLength = config.baseLength ?? config.length;
  const scale = config.length / baseLength;
  return Math.max(1, Math.round(config[key] * scale));
}

function getStageGenerationCounts(config) {
  return {
    holes: getLengthScaledCount(config, "holes"),
    obstacles: getLengthScaledCount(config, "obstacles"),
    platforms: getLengthScaledCount(config, "platforms"),
    treats: getLengthScaledCount(config, "treats"),
    awakeningItems: config.awakeningItems,
    dogs: getLengthScaledCount(config, "dogs")
  };
}

function generateStage(stageNumber) {
  const random = createRandom();
  const config = STAGE_GENERATION_CONFIGS[stageNumber];
  const length = config.length;
  const counts = getStageGenerationCounts(config);
  const holes = [];
  const usedX = [];

  for (let i = 0; i < counts.holes; i += 1) {
    const x = getSafeGroundX(random, length, holes, usedX, {
      minX: 700,
      maxX: length - 900,
      minDistance: 520,
      holePadding: 190
    });
    holes.push({
      x: Math.round(x),
      width: randomInt(random, 80, config.maxHoleWidth)
    });
  }
  holes.sort((a, b) => a.x - b.x);

  const platforms = getGroundPlatformSegments(length, holes);
  const upperPlatforms = [];

  for (let i = 0; i < counts.platforms; i += 1) {
    const isUpper = i % 3 === 2;
    const y = isUpper ? randomInt(random, 238, 270) : randomInt(random, 310, 346);
    const width = randomInt(random, 220, 330);
    const x = getSafeGroundX(random, length, holes, usedX, {
      minX: 760,
      maxX: length - 760,
      minDistance: 260,
      holePadding: 80
    });
    const platform = {
      x: Math.round(x),
      y,
      width,
      height: isUpper ? 24 : 28,
      type: isUpper ? "upper" : "middle"
    };
    upperPlatforms.push(platform);
    platforms.push(platform);
  }

  const obstacles = [];
  for (let i = 0; i < counts.obstacles; i += 1) {
    const height = randomInt(random, 38, config.maxObstacleHeight);
    const x = getSafeGroundX(random, length, holes, usedX, {
      minX: 760,
      maxX: length - 720,
      minDistance: 240,
      holePadding: 140
    });
    obstacles.push({
      x: Math.round(x),
      y: STAGE_CONFIG.groundY - height,
      width: randomInt(random, 38, 52),
      height
    });
  }

  const items = [];
  for (let i = 0; i < counts.treats; i += 1) {
    const platform = upperPlatforms.length && random() < 0.45 ? chooseRandom(random, upperPlatforms) : null;
    if (platform) {
      items.push({
        type: "treat",
        x: Math.round(platform.x + platform.width * randomBetween(random, 0.25, 0.75)),
        y: platform.y - 48
      });
    } else {
      const x = getSafeGroundX(random, length, holes, usedX, {
        minX: 360,
        maxX: length - 420,
        minDistance: 120,
        holePadding: 70
      });
      items.push({ type: "treat", x: Math.round(x), y: STAGE_CONFIG.groundY - 52 });
    }
  }

  for (let i = 0; i < counts.awakeningItems; i += 1) {
    const platform = upperPlatforms.length && random() < 0.55 ? chooseRandom(random, upperPlatforms) : null;
    if (platform) {
      items.push({
        type: "awakening",
        x: Math.round(platform.x + platform.width * randomBetween(random, 0.28, 0.72)),
        y: platform.y - 52
      });
    } else {
      const x = getSafeGroundX(random, length, holes, usedX, {
        minX: 820,
        maxX: length - 620,
        minDistance: 220,
        holePadding: 90
      });
      items.push({ type: "awakening", x: Math.round(x), y: STAGE_CONFIG.groundY - 52 });
    }
  }

  const otherDogs = [];
  const dogTypes = [...config.dogTypes];
  if (stageNumber >= 3 && !dogTypes.includes("D")) {
    dogTypes.push("D");
  }

  for (let i = 0; i < counts.dogs; i += 1) {
    const mustPlaceD = stageNumber >= 3 && i === counts.dogs - 1 && !otherDogs.some((dog) => dog.type === "D");
    const type = normalizeOtherDogType(mustPlaceD ? "D" : chooseRandom(random, dogTypes));
    const typeConfig = OTHER_DOG_TYPES[type];
    const canUsePlatform = type !== "D" && upperPlatforms.length && random() < 0.2;
    const platform = canUsePlatform ? chooseRandom(random, upperPlatforms) : null;
    const x = platform
      ? Math.round(platform.x + platform.width / 2 - typeConfig.width / 2)
      : Math.round(getSafeGroundX(random, length, holes, usedX, {
        minX: 900,
        maxX: length - 740,
        minDistance: type === "D" ? 420 : 260,
        holePadding: type === "D" ? 190 : 110
      }));

    otherDogs.push({
      type,
      x,
      groundY: platform ? platform.y : STAGE_CONFIG.groundY,
      colorVariant: type === "D" ? chooseRandom(random, typeConfig.colorVariants) : undefined
    });
  }

  const level = {
    name: `Stage ${stageNumber} / ${STAGE_CONFIG.totalStages}`,
    stageNumber,
    length,
    goal: {
      x: length - 220,
      y: 310,
      width: STAGE_CONFIG.goalWidth,
      height: STAGE_CONFIG.goalHeight
    },
    platforms,
    holes,
    obstacles,
    items,
    otherDogs
  };

  if (DEBUG_STAGE) {
    console.log("Generated stage", {
      stageNumber,
      holes: holes.length,
      obstacles: obstacles.length,
      platforms: platforms.length,
      items: items.length,
      otherDogs: otherDogs.length,
      goalX: level.goal.x
    });
  }

  return level;
}

function generateCurrentStage() {
  currentLevel = generateStage(currentLevelIndex + 1);
}

soundManager = new SoundManager();
gamepadManager = new GamepadManager();
menuManager = new MenuManager();
highScore = readStoredNumber(STORAGE_KEYS.highScore, 0);
updateTitleHighScore();
updateSoundHud();
updateGamepadHud();
debugPrintDogScoreTable();
menuManager.updateSelection();

function resetGame(options = {}) {
  if (options.resetScore) {
    score = 0;
  }
  if (options.resetAwakeningItems) {
    awakeningItemCount = 0;
  }
  if (options.resetScore || options.resetAwakening) {
    isAwakened = false;
    awakeningTimer = 0;
    awakeningMessageTimer = 0;
    statusMessage = "";
    statusMessageTimer = 0;
  }
  activeCharacterId = options.characterId ?? "ricca";
  input.left = false;
  input.right = false;
  input.jumpHeld = false;
  input.jumpPressed = false;
  input.switchPressed = false;
  if (!currentLevel) {
    generateCurrentStage();
  }
  items = getCurrentLevel().items.map((item) => ({ ...item, collected: false }));
  obstacles = getCurrentLevel().obstacles.map((obstacle) => ({ ...obstacle, destroyed: false }));
  otherDogs = getCurrentLevel().otherDogs.map((otherDog, index) => new OtherDog(otherDog, index));
  cameraX = 0;
  player = new Player(activeCharacterId, characterImages[activeCharacterId]);
  switchEffectTime = 0;
  mugiStunTimer = 0;
  messageManager = new MessageManager();
  floatingTexts = [];
  updateHud();
}

function startGame() {
  soundManager.resume();
  currentLevelIndex = 0;
  randomState = RANDOM_SEED;
  generateCurrentStage();
  resetGame({ resetScore: true, resetAwakening: true, resetAwakeningItems: true, characterId: "ricca" });
  gameState = GAME_STATE.PLAYING;
  soundManager.startStageBgm();
  titleScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  stageClearScreen.classList.add("hidden");
  endingScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  menuManager.updateSelection();
  lastTime = performance.now();
}

function endGame() {
  gameState = GAME_STATE.GAME_OVER;
  updateHighScore();
  soundManager.stopBgm();
  soundManager.playGameOver();
  finalScoreText.textContent = String(score);
  gameOverHighScoreText.textContent = String(highScore);
  gameScreen.classList.add("hidden");
  endingScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
  menuManager.resetForState(GAME_STATE.GAME_OVER);
}

function clearLevel() {
  if (currentLevelIndex >= STAGE_CONFIG.totalStages - 1) {
    showEnding();
    return;
  }

  gameState = GAME_STATE.STAGE_CLEAR;
  soundManager.stopBgm();
  soundManager.playGoal();
  clearScoreText.textContent = String(score);
  clearHighScoreText.textContent = String(highScore);
  clearTitle.textContent = `STAGE ${currentLevelIndex + 1} / ${STAGE_CONFIG.totalStages} CLEAR`;
  nextStageButton.textContent = "NEXT STAGE";
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  endingScreen.classList.add("hidden");
  stageClearScreen.classList.remove("hidden");
  menuManager.resetForState(GAME_STATE.STAGE_CLEAR);
}

function goToNextStage() {
  if (currentLevelIndex >= STAGE_CONFIG.totalStages - 1) {
    showEnding();
    return;
  }

  currentLevelIndex += 1;
  generateCurrentStage();
  resetGame({ characterId: activeCharacterId, resetAwakening: true });
  gameState = GAME_STATE.PLAYING;
  soundManager.startStageBgm();
  stageClearScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  menuManager.updateSelection();
  lastTime = performance.now();
}

function continueCurrentStage() {
  soundManager.resume();
  score = Math.max(0, score - STAGE_CONFIG.continuePenalty);
  generateCurrentStage();
  resetGame({ characterId: "ricca", resetAwakening: true });
  gameState = GAME_STATE.PLAYING;
  soundManager.startStageBgm();
  titleScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  stageClearScreen.classList.add("hidden");
  endingScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  menuManager.updateSelection();
  lastTime = performance.now();
}

function showTitleScreen() {
  gameState = GAME_STATE.TITLE;
  soundManager.stopBgm();
  input.left = false;
  input.right = false;
  input.jumpHeld = false;
  input.jumpPressed = false;
  input.switchPressed = false;
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  stageClearScreen.classList.add("hidden");
  endingScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  updateTitleHighScore();
  menuManager.resetForState(GAME_STATE.TITLE);
}

function showEnding() {
  gameState = GAME_STATE.ENDING;
  updateHighScore();
  soundManager.stopBgm();
  soundManager.playGoal();
  endingScoreText.textContent = String(score);
  endingHighScoreText.textContent = String(highScore);
  titleScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  stageClearScreen.classList.add("hidden");
  endingScreen.classList.remove("hidden");
  menuManager.resetForState(GAME_STATE.ENDING);
}

function update(deltaTime) {
  const level = getCurrentLevel();

  if (input.switchPressed) {
    switchCharacter();
    input.switchPressed = false;
  }

  const movementInput = {
    ...input,
    left: input.left || Boolean(gamepadManager?.leftHeld),
    right: input.right || Boolean(gamepadManager?.rightHeld)
  };
  if (activeCharacterId === "mugi" && mugiStunTimer > 0) {
    movementInput.left = false;
    movementInput.right = false;
  }

  player.update(deltaTime, movementInput, level.platforms);
  input.jumpPressed = false;
  input.switchPressed = false;
  input.soundTogglePressed = false;
  input.menuUpPressed = false;
  input.menuDownPressed = false;
  input.menuSelectPressed = false;
  input.menuBackPressed = false;
  cameraX = clamp(player.x - STAGE_CONFIG.cameraLeadX, 0, level.length - CANVAS_CONFIG.width);
  switchEffectTime = Math.max(0, switchEffectTime - deltaTime);
  mugiStunTimer = Math.max(0, mugiStunTimer - deltaTime * 1000);
  updateAwakening(deltaTime);
  statusMessageTimer = Math.max(0, statusMessageTimer - deltaTime);
  messageManager.update(deltaTime);
  updateFloatingTexts(deltaTime);

  collectItems();
  updateOtherDogs(deltaTime);
  handleOtherDogEvents();

  if (isTouchingGoal()) {
    clearLevel();
    return;
  }

  if (resolveObstacleCollision() || player.y > STAGE_CONFIG.fallLimit) {
    endGame();
  }
}

function updateOtherDogs(deltaTime) {
  for (const otherDog of otherDogs) {
    otherDog.update(deltaTime);
  }
}

function updateFloatingTexts(deltaTime) {
  for (const floatingText of floatingTexts) {
    floatingText.update(deltaTime);
  }
  floatingTexts = floatingTexts.filter((floatingText) => floatingText.isAlive());
}

function handleOtherDogEvents() {
  const hitbox = player.getHitbox();
  const playerCenter = {
    x: hitbox.x + hitbox.width / 2,
    y: hitbox.y + hitbox.height / 2
  };

  for (const otherDog of otherDogs) {
    if (!otherDog.canTrigger()) {
      continue;
    }

    const dogCenter = otherDog.getCenter();
    const distance = Math.hypot(playerCenter.x - dogCenter.x, playerCenter.y - dogCenter.y);
    if (distance > OTHER_DOG_CONFIG.eventDistance) {
      continue;
    }

    triggerOtherDogEvent(otherDog);
    break;
  }
}

function triggerOtherDogEvent(otherDog) {
  if (!otherDog.canTrigger()) {
    return;
  }

  const awakenedRicca = activeCharacterId === "ricca" && isAwakened;
  const scoreChange = getOtherDogScoreDelta(activeCharacterId, awakenedRicca, otherDog.type);
  const scoreLabel = scoreChange > 0 ? `+${scoreChange}` : String(scoreChange);
  const displayMessage = getOtherDogMessage(activeCharacterId, awakenedRicca, otherDog.type, scoreChange);

  messageManager.add(displayMessage, 1.3);
  if (activeCharacterId === "ricca" && !awakenedRicca && scoreChange > 0) {
    messageManager.add("むぎも反応した！", 1.3, OTHER_DOG_CONFIG.riccaFollowUpDelay / 1000);
  }

  addScore(scoreChange, scoreLabel, player.x, player.y - 10);
  applyOtherDogReaction(scoreChange, awakenedRicca);
  soundManager[scoreChange >= 0 ? "playCombo" : "playGau"]();
  otherDog.triggerReaction(awakenedRicca ? "awakened" : activeCharacterId);
  updateHud();
}

function normalizeOtherDogType(type) {
  if (Object.prototype.hasOwnProperty.call(OTHER_DOG_TYPES, type)) {
    return type;
  }
  if (DEBUG_DOG_LOGIC) {
    console.warn("Unknown other dog type. Falling back to A.", type);
  }
  return "A";
}

function getOtherDogScoreDelta(characterId, awakenedRicca, otherDogType) {
  const dogConfig = OTHER_DOG_TYPES[normalizeOtherDogType(otherDogType)];
  if (characterId === "mugi") {
    return dogConfig.scores.mugi;
  }

  const baseScore = dogConfig.scores.ricca;
  return characterId === "ricca" && awakenedRicca ? baseScore * 2 : baseScore;
}

function getOtherDogMessage(characterId, awakenedRicca, otherDogType, scoreChange) {
  const dogConfig = OTHER_DOG_TYPES[normalizeOtherDogType(otherDogType)];
  if (characterId === "mugi") {
    return dogConfig.messages.mugi;
  }
  if (awakenedRicca) {
    const key = scoreChange >= 0 ? "riccaAwakenedPositive" : "riccaAwakenedNegative";
    return dogConfig.messages[key] ?? `覚醒中 ${dogConfig.messages.ricca.replace(/[+-]\d+$/, scoreChange > 0 ? `+${scoreChange}` : String(scoreChange))}`;
  }
  return dogConfig.messages.ricca;
}

function applyOtherDogReaction(scoreChange, awakenedRicca) {
  if (scoreChange >= 0) {
    return;
  }

  const slowScale = awakenedRicca ? OTHER_DOG_CONFIG.awakenedPenaltySlowScale : OTHER_DOG_CONFIG.normalPenaltySlowScale;
  player.vx *= slowScale;
}

function debugPrintDogScoreTable() {
  if (!DEBUG_DOG_LOGIC) {
    return;
  }
  for (const type of ["A", "B", "C", "D"]) {
    console.log(type, {
      mugi: getOtherDogScoreDelta("mugi", false, type),
      ricca: getOtherDogScoreDelta("ricca", false, type),
      riccaAwakened: getOtherDogScoreDelta("ricca", true, type)
    });
  }
}

function switchCharacter() {
  if (gameState !== GAME_STATE.PLAYING || !player.isOnGround) {
    return;
  }

  if (isAwakened) {
    statusMessage = "覚醒中は交代できません";
    statusMessageTimer = 1.2;
    return;
  }

  const currentIndex = CHARACTER_ORDER.indexOf(activeCharacterId);
  activeCharacterId = CHARACTER_ORDER[(currentIndex + 1) % CHARACTER_ORDER.length];
  player = new Player(activeCharacterId, characterImages[activeCharacterId], {
    x: player.x,
    y: player.y,
    vx: player.vx,
    vy: player.vy,
    facing: player.facing,
    isOnGround: player.isOnGround
  });
  switchEffectTime = 0.9;
  updateHud();
}

function collectItems() {
  const hitbox = player.getHitbox();
  for (const item of items) {
    const radius = item.type === "awakening" ? 18 : 16;
    if (!item.collected && circleIntersectsRect(item.x, item.y, radius, hitbox)) {
      item.collected = true;
      if (item.type === "awakening") {
        addScore(STAGE_CONFIG.awakeningItemScore, "+30", item.x, item.y - 22);
        soundManager.playAwakeningItem();
        collectAwakeningItem();
      } else {
        addScore(STAGE_CONFIG.snackScore, "+10", item.x, item.y - 22);
        soundManager.playTreat();
      }
      updateHud();
    }
  }
}

function collectAwakeningItem() {
  if (isAwakened) {
    return;
  }

  awakeningItemCount += 1;
  if (awakeningItemCount >= AWAKENING_CONFIG.requiredItems) {
    startAwakening();
  }
}

function startAwakening() {
  awakeningItemCount = 0;
  isAwakened = true;
  awakeningTimer = AWAKENING_CONFIG.duration;
  awakeningMessageTimer = AWAKENING_CONFIG.messageDuration;
  statusMessage = "りっか覚醒！";
  statusMessageTimer = AWAKENING_CONFIG.messageDuration / 1000;
  soundManager.switchToTranceBgm();
  soundManager.playAwakenStart();

  if (activeCharacterId !== "ricca") {
    activeCharacterId = "ricca";
    player = new Player("ricca", characterImages.ricca, {
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      facing: player.facing,
      isOnGround: player.isOnGround
    });
  }

  const direction = player.facing === "left" ? -1 : 1;
  player.vx = direction * AWAKENING_CONFIG.riccaAwakenedStats.minSlideSpeed;
  switchEffectTime = 0.9;
  updateHud();
}

function updateAwakening(deltaTime) {
  if (!isAwakened) {
    return;
  }

  awakeningTimer = Math.max(0, awakeningTimer - deltaTime * 1000);
  awakeningMessageTimer = Math.max(0, awakeningMessageTimer - deltaTime * 1000);

  if (awakeningTimer <= 0) {
    isAwakened = false;
    awakeningTimer = 0;
    statusMessage = "りっか通常モード";
    statusMessageTimer = 1.2;
    player.vx *= 0.35;
    soundManager.returnToStageBgm();
  }

  updateHud();
}

function resolveObstacleCollision() {
  const hitbox = player.getHitbox();
  for (const obstacle of obstacles) {
    if (obstacle.destroyed || !rectanglesOverlap(hitbox, obstacle)) {
      continue;
    }

    if (activeCharacterId === "ricca" && isAwakened) {
      obstacle.destroyed = true;
      addScore(10, "+10", obstacle.x + obstacle.width / 2, obstacle.y - 12);
      messageManager.add("BREAK! +10", 1.2);
      soundManager.playBreak();
      return false;
    }

    return true;
  }

  return false;
}

function isTouchingGoal() {
  return rectanglesOverlap(player.getHitbox(), getCurrentLevel().goal);
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);
  drawBackground();
  drawPlatforms();
  drawItems();
  drawObstacles();
  drawOtherDogs();
  drawGoalFlag();
  drawAwakeningAura();
  player.draw(ctx, cameraX);
  drawSwitchEffect();
  drawAwakeningMessage();
  drawStatusMessage();
  messageManager.draw(ctx);
  drawFloatingTexts();
}

function drawBackground() {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_CONFIG.height);
  skyGradient.addColorStop(0, "#9ed7fb");
  skyGradient.addColorStop(0.72, "#dff6ff");
  skyGradient.addColorStop(1, "#f5efd9");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  drawCloud(140 - cameraX * 0.18, 94, 46);
  drawCloud(520 - cameraX * 0.14, 138, 36);
  drawCloud(930 - cameraX * 0.16, 82, 42);
}

function drawCloud(x, y, size) {
  const wrappedX = ((x % 1120) + 1120) % 1120 - 80;
  ctx.beginPath();
  ctx.arc(wrappedX, y, size * 0.55, 0, Math.PI * 2);
  ctx.arc(wrappedX + size * 0.55, y - size * 0.22, size * 0.7, 0, Math.PI * 2);
  ctx.arc(wrappedX + size * 1.22, y, size * 0.52, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlatforms() {
  for (const platform of getCurrentLevel().platforms) {
    const x = platform.x - cameraX;
    if (x + platform.width < -40 || x > CANVAS_CONFIG.width + 40) {
      continue;
    }

    const color = platform.type === "upper" ? "#6aa65f" : platform.type === "middle" ? "#78b96c" : "#6d9e58";
    ctx.fillStyle = color;
    ctx.fillRect(x, platform.y, platform.width, platform.height);
    ctx.fillStyle = "#4c713e";
    ctx.fillRect(x, platform.y + platform.height - 10, platform.width, 10);
    ctx.fillStyle = "#ebd7a5";
    ctx.fillRect(x, platform.y + platform.height, platform.width, 22);
  }

  for (const hole of getCurrentLevel().holes) {
    const x = hole.x - cameraX;
    ctx.fillStyle = "rgba(37, 49, 61, 0.35)";
    ctx.fillRect(x, 438, hole.width, 76);
  }
}

function drawObstacles() {
  for (const obstacle of obstacles) {
    if (obstacle.destroyed) {
      continue;
    }

    const x = obstacle.x - cameraX;
    ctx.fillStyle = "#8e6b4d";
    ctx.fillRect(x, obstacle.y, obstacle.width, obstacle.height);
    ctx.fillStyle = "#6e4f38";
    ctx.fillRect(x + 8, obstacle.y - 10, obstacle.width - 16, 10);

    if (DEBUG_HITBOX) {
      ctx.strokeStyle = "#ff1744";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, obstacle.y, obstacle.width, obstacle.height);
    }
  }
}

function drawOtherDogs() {
  for (const otherDog of otherDogs) {
    otherDog.draw(ctx, cameraX, otherDogImages);
  }
}

function drawItems() {
  for (const item of items) {
    if (item.collected) {
      continue;
    }

    if (item.type === "awakening") {
      drawAwakeningItem(item.x - cameraX, item.y);
    } else {
      drawTreat(item.x - cameraX, item.y);
    }
  }
}

function drawTreat(x, y) {
  ctx.fillStyle = "#f1a93c";
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff0c7";
  ctx.beginPath();
  ctx.arc(x - 5, y - 5, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawAwakeningItem(x, y) {
  const pulse = 1 + Math.sin(performance.now() / 140) * 0.08;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "rgba(255, 207, 79, 0.28)";
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b965ff";
  drawStar(0, 0, 18, 8, 5);
  ctx.fillStyle = "#ffef8a";
  drawStar(0, 0, 10, 4, 5);
  ctx.restore();
}

function drawStar(x, y, outerRadius, innerRadius, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}

function drawGoalFlag() {
  const goal = getCurrentLevel().goal;
  const x = goal.x - cameraX;
  if (x > CANVAS_CONFIG.width + 80 || x + goal.width < -80) {
    return;
  }

  ctx.fillStyle = "#315f7d";
  ctx.fillRect(x, goal.y, 10, goal.height);
  ctx.fillStyle = "#ffcf4f";
  ctx.fillRect(x + 10, goal.y, goal.width - 10, 34);
  ctx.fillStyle = "#e08b36";
  ctx.fillRect(x + 10, goal.y + 34, goal.width - 28, 12);

  if (DEBUG_HITBOX) {
    ctx.strokeStyle = "#ff1744";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, goal.y, goal.width, goal.height);
  }
}

function drawSwitchEffect() {
  if (switchEffectTime <= 0) {
    return;
  }

  const hitbox = player.getHitbox();
  const centerX = hitbox.x - cameraX + hitbox.width / 2;
  const centerY = hitbox.y + hitbox.height / 2;
  const progress = 1 - switchEffectTime / 0.9;
  ctx.save();
  ctx.globalAlpha = switchEffectTime / 0.9;
  ctx.strokeStyle = "#ffcf4f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 28 + progress * 28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#1e425b";
  ctx.font = "bold 24px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${CHARACTER_CONFIGS[activeCharacterId].displayName}!`, centerX, centerY - 44);
  ctx.restore();
}

function drawAwakeningAura() {
  if (!isAwakened || activeCharacterId !== "ricca") {
    return;
  }

  const hitbox = player.getHitbox();
  const centerX = hitbox.x - cameraX + hitbox.width / 2;
  const centerY = hitbox.y + hitbox.height / 2;
  const pulse = Math.sin(performance.now() / 90) * 6;

  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.strokeStyle = "#ffcf4f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 54 + pulse, 40 + pulse * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#b965ff";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 70 + pulse, 48 + pulse * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAwakeningMessage() {
  if (awakeningMessageTimer <= 0) {
    return;
  }

  const alpha = awakeningMessageTimer / AWAKENING_CONFIG.messageDuration;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#1e425b";
  ctx.font = "bold 54px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("りっか覚醒！", CANVAS_CONFIG.width / 2, 128);
  ctx.fillStyle = "#ffcf4f";
  ctx.font = "bold 34px system-ui, sans-serif";
  ctx.fillText("TRANCE!", CANVAS_CONFIG.width / 2, 174);
  ctx.restore();
}

function drawStatusMessage() {
  if (statusMessageTimer <= 0 || !statusMessage) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = Math.min(1, statusMessageTimer);
  ctx.fillStyle = "#1e425b";
  ctx.font = "bold 24px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(statusMessage, CANVAS_CONFIG.width / 2, 220);
  ctx.restore();
}

function drawFloatingTexts() {
  for (const floatingText of floatingTexts) {
    floatingText.draw(ctx, cameraX);
  }
}

function handleGamepadInput() {
  input.soundTogglePressed = false;
  input.menuUpPressed = false;
  input.menuDownPressed = false;
  input.menuSelectPressed = false;
  input.menuBackPressed = false;

  if (!gamepadManager?.connected) {
    return;
  }

  if (gameState === GAME_STATE.PLAYING) {
    if (gamepadManager.isPressed("A")) {
      input.jumpPressed = true;
    }
    if (gamepadManager.isPressed("B")) {
      input.switchPressed = true;
    }
    if (gamepadManager.isPressed("SELECT")) {
      input.soundTogglePressed = true;
      soundManager.resume();
      soundManager.toggleMuted();
    }
    return;
  }

  if (gamepadManager.isPressed("DPAD_UP")) {
    input.menuUpPressed = true;
    menuManager.move(-1);
  }
  if (gamepadManager.isPressed("DPAD_DOWN") || gamepadManager.isPressed("SELECT")) {
    input.menuDownPressed = true;
    menuManager.move(1);
  }
  if (gamepadManager.isPressed("A") || gamepadManager.isPressed("START")) {
    input.menuSelectPressed = true;
    soundManager.resume();
    menuManager.select();
  }
  if (gamepadManager.isPressed("B")) {
    input.menuBackPressed = true;
    menuManager.back();
  }
}

function gameLoop(currentTime) {
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.033);
  lastTime = currentTime;

  gamepadManager.update();
  handleGamepadInput();

  if (gameState === GAME_STATE.PLAYING) {
    update(deltaTime);
    draw();
  }

  requestAnimationFrame(gameLoop);
}

function updateHud() {
  stageText.textContent = getCurrentLevel().name;
  scoreText.textContent = String(score);
  const displayName = CHARACTER_CONFIGS[activeCharacterId].displayName;
  characterText.textContent = isAwakened && activeCharacterId === "ricca" ? `${displayName} 覚醒中！` : displayName;

  if (isAwakened) {
    const remainingSeconds = (awakeningTimer / 1000).toFixed(1);
    awakeningText.textContent = `${remainingSeconds}s`;
    awakeningBar.classList.add("active");
    awakeningBar.classList.toggle("warning", awakeningTimer < 1500);
    awakeningBar.style.transform = `scaleX(${awakeningTimer / AWAKENING_CONFIG.duration})`;
  } else {
    awakeningText.textContent = `${awakeningItemCount}/${AWAKENING_CONFIG.requiredItems}`;
    awakeningBar.classList.remove("active");
    awakeningBar.classList.remove("warning");
    awakeningBar.style.transform = `scaleX(${awakeningItemCount / AWAKENING_CONFIG.requiredItems})`;
  }
  updateSoundHud();
}

function getCurrentLevel() {
  if (!currentLevel) {
    generateCurrentStage();
  }
  return currentLevel;
}

function rectanglesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function circleIntersectsRect(circleX, circleY, radius, rect) {
  const closestX = clamp(circleX, rect.x, rect.x + rect.width);
  const closestY = clamp(circleY, rect.y, rect.y + rect.height);
  const dx = circleX - closestX;
  const dy = circleY - closestY;
  return dx * dx + dy * dy <= radius * radius;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getImageDrawSize(imageElement, targetHeight, fallbackWidth) {
  const sourceWidth = imageElement?.naturalWidth || imageElement?.width || 0;
  const sourceHeight = imageElement?.naturalHeight || imageElement?.height || 0;

  if (!imageElement || sourceWidth <= 0 || sourceHeight <= 0) {
    return {
      width: fallbackWidth,
      height: targetHeight
    };
  }

  const aspectRatio = sourceWidth / sourceHeight;
  return {
    width: targetHeight * aspectRatio,
    height: targetHeight
  };
}

function loadCharacterImages() {
  const entries = Object.entries(CHARACTER_CONFIGS).map(([characterId, config]) => {
    return Promise.all(config.runImages.map(loadSpriteImage)).then((images) => [characterId, images]);
  });

  return Promise.all(entries).then((loadedEntries) => Object.fromEntries(loadedEntries));
}

function loadOtherDogImages() {
  const entries = Object.entries(OTHER_DOG_TYPES).map(([type, config]) => {
    return Promise.all(config.imagePaths.map(loadSpriteImage)).then((images) => [type, images]);
  });

  return Promise.all(entries).then((loadedEntries) => Object.fromEntries(loadedEntries));
}

function loadSpriteImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ element: removeGreenBackground(image), loaded: true });
    image.onerror = () => resolve({ element: null, loaded: false });
    image.src = src;
  });
}

function removeGreenBackground(image) {
  const sourceCanvas = document.createElement("canvas");
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  sourceContext.drawImage(image, 0, 0);

  try {
    const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const data = imageData.data;
    let minX = sourceCanvas.width;
    let minY = sourceCanvas.height;
    let maxX = 0;
    let maxY = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const isGreenKey = g > 160 && r < 90 && b < 120;

      if (isGreenKey) {
        data[i + 3] = 0;
      } else if (data[i + 3] > 20) {
        const pixelIndex = i / 4;
        const x = pixelIndex % sourceCanvas.width;
        const y = Math.floor(pixelIndex / sourceCanvas.width);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    sourceContext.putImageData(imageData, 0, 0);

    if (maxX <= minX || maxY <= minY) {
      return sourceCanvas;
    }

    const padding = 12;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(sourceCanvas.width, maxX + padding);
    maxY = Math.min(sourceCanvas.height, maxY + padding);

    const trimmedCanvas = document.createElement("canvas");
    trimmedCanvas.width = maxX - minX;
    trimmedCanvas.height = maxY - minY;
    trimmedCanvas.getContext("2d").drawImage(
      sourceCanvas,
      minX,
      minY,
      trimmedCanvas.width,
      trimmedCanvas.height,
      0,
      0,
      trimmedCanvas.width,
      trimmedCanvas.height
    );
    return trimmedCanvas;
  } catch (error) {
    return image;
  }
}

function setButtonHold(button, keyName) {
  const press = (event) => {
    event.preventDefault();
    input[keyName] = true;
    button.classList.add("pressed");
  };
  const release = (event) => {
    event.preventDefault();
    input[keyName] = false;
    button.classList.remove("pressed");
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

function setTapButton(button, action) {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    action();
    button.classList.add("pressed");
  });

  const release = (event) => {
    event.preventDefault();
    button.classList.remove("pressed");
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

function setJumpButton(button) {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!input.jumpHeld) {
      input.jumpPressed = true;
    }
    input.jumpHeld = true;
    button.classList.add("pressed");
  });

  const release = (event) => {
    event.preventDefault();
    input.jumpHeld = false;
    button.classList.remove("pressed");
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft") {
    input.left = true;
  }
  if (event.code === "ArrowRight") {
    input.right = true;
  }
  if (event.code === "Space" || event.code === "ArrowUp") {
    if (!input.jumpHeld) {
      input.jumpPressed = true;
    }
    input.jumpHeld = true;
  }
  if ((event.code === "KeyC" || event.code === "Tab") && !event.repeat) {
    input.switchPressed = true;
  }
  if (event.code === "KeyM" && !event.repeat) {
    soundManager.resume();
    soundManager.toggleMuted();
  }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyC", "KeyM", "Tab"].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft") {
    input.left = false;
  }
  if (event.code === "ArrowRight") {
    input.right = false;
  }
  if (event.code === "Space" || event.code === "ArrowUp") {
    input.jumpHeld = false;
  }
});

window.addEventListener("gamepadconnected", () => {
  gamepadManager.update();
  updateGamepadHud();
});

window.addEventListener("gamepaddisconnected", () => {
  gamepadManager.update();
  updateGamepadHud();
});

window.addEventListener("contextmenu", (event) => event.preventDefault());

startButton.addEventListener("click", startGame);
titleSoundButton.addEventListener("click", () => {
  soundManager.resume();
  soundManager.toggleMuted();
  menuManager.updateSelection();
});
restartButton.addEventListener("click", startGame);
continueButton.addEventListener("click", continueCurrentStage);
nextStageButton.addEventListener("click", goToNextStage);
clearRestartButton.addEventListener("click", startGame);
clearTitleButton.addEventListener("click", showTitleScreen);
gameOverTitleButton.addEventListener("click", showTitleScreen);
endingPlayAgainButton.addEventListener("click", startGame);
endingTitleButton.addEventListener("click", showTitleScreen);
muteButton.addEventListener("click", () => {
  soundManager.resume();
  soundManager.toggleMuted();
});
setButtonHold(document.getElementById("leftButton"), "left");
setButtonHold(document.getElementById("rightButton"), "right");
setJumpButton(document.getElementById("jumpButton"));
setTapButton(document.getElementById("switchButton"), () => {
  input.switchPressed = true;
});

Promise.all([loadCharacterImages(), loadOtherDogImages()]).then(([images, loadedOtherDogImages]) => {
  characterImages = images;
  otherDogImages = loadedOtherDogImages;
  generateCurrentStage();
  resetGame({ resetScore: true, resetAwakening: true, resetAwakeningItems: true, characterId: "ricca" });
  draw();
  requestAnimationFrame((time) => {
    lastTime = time;
    gameLoop(time);
  });
});
