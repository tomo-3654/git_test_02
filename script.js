"use strict";

const DEBUG_HITBOX = false;

const CANVAS_CONFIG = {
  width: 960,
  height: 540
};

const GAME_STATE = {
  TITLE: "title",
  PLAYING: "playing",
  GAME_OVER: "gameOver",
  STAGE_CLEAR: "stageClear"
};

const STORAGE_KEYS = {
  highScore: "ricca_mugi_game_high_score",
  muted: "ricca_mugi_game_muted"
};

const STAGE_CONFIG = {
  snackScore: 10,
  awakeningItemScore: 30,
  fallLimit: 620,
  cameraLeadX: 380,
  goalWidth: 64,
  goalHeight: 128
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
  riccaFollowUpDelay: 500,
  mugiPenalty: 5,
  riccaComboBonus: 10,
  awakenedBonus: 10,
  drawWidth: 58,
  drawHeight: 44,
  bobAmplitude: 2,
  fallbackColor: "#f4f0e8",
  reactionDistance: 34
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
const OTHER_DOG_IMAGE_PATHS = [
  "assets/images/dog_friend_01.png",
  "assets/images/dog_friend_02.png"
];

const LEVELS = [
  {
    name: "Stage 1",
    length: 3200,
    goal: { x: 3070, y: 310, width: STAGE_CONFIG.goalWidth, height: STAGE_CONFIG.goalHeight },
    platforms: [
      { x: 0, y: 438, width: 520, height: 42, type: "ground" },
      { x: 620, y: 438, width: 760, height: 42, type: "ground" },
      { x: 1460, y: 438, width: 720, height: 42, type: "ground" },
      { x: 2260, y: 438, width: 940, height: 42, type: "ground" },
      { x: 860, y: 344, width: 270, height: 28, type: "middle" },
      { x: 1220, y: 300, width: 280, height: 28, type: "middle" },
      { x: 1660, y: 334, width: 300, height: 28, type: "middle" },
      { x: 1940, y: 240, width: 270, height: 28, type: "upper" },
      { x: 2380, y: 326, width: 320, height: 28, type: "middle" },
      { x: 2760, y: 236, width: 300, height: 28, type: "upper" }
    ],
    holes: [
      { x: 520, width: 100 },
      { x: 1380, width: 80 },
      { x: 2180, width: 80 }
    ],
    obstacles: [
      { x: 360, y: 394, width: 40, height: 44 },
      { x: 760, y: 390, width: 42, height: 48 },
      { x: 1530, y: 394, width: 46, height: 44 },
      { x: 2520, y: 388, width: 48, height: 50 }
    ],
    items: [
      { type: "treat", x: 240, y: 385 },
      { type: "treat", x: 690, y: 385 },
      { type: "awakening", x: 960, y: 292 },
      { type: "treat", x: 1320, y: 248 },
      { type: "awakening", x: 1770, y: 282 },
      { type: "treat", x: 2040, y: 190 },
      { type: "treat", x: 2470, y: 276 },
      { type: "awakening", x: 2660, y: 386 },
      { type: "treat", x: 2890, y: 186 },
      { type: "treat", x: 2860, y: 154 },
      { type: "treat", x: 3000, y: 116 }
    ],
    otherDogs: [
      { x: 1180, groundY: 438 },
      { x: 2320, groundY: 438 }
    ]
  },
  {
    name: "Stage 2",
    length: 3500,
    goal: { x: 3370, y: 310, width: STAGE_CONFIG.goalWidth, height: STAGE_CONFIG.goalHeight },
    platforms: [
      { x: 0, y: 438, width: 700, height: 42, type: "ground" },
      { x: 800, y: 438, width: 680, height: 42, type: "ground" },
      { x: 1580, y: 438, width: 540, height: 42, type: "ground" },
      { x: 2220, y: 438, width: 1280, height: 42, type: "ground" },
      { x: 620, y: 340, width: 260, height: 28, type: "middle" },
      { x: 1040, y: 306, width: 260, height: 28, type: "middle" },
      { x: 1700, y: 330, width: 280, height: 28, type: "middle" },
      { x: 2020, y: 238, width: 260, height: 28, type: "upper" },
      { x: 2460, y: 320, width: 330, height: 28, type: "middle" },
      { x: 2920, y: 250, width: 280, height: 28, type: "upper" },
      { x: 3090, y: 184, width: 210, height: 24, type: "upper" }
    ],
    holes: [
      { x: 700, width: 100 },
      { x: 1480, width: 100 },
      { x: 2120, width: 100 }
    ],
    obstacles: [
      { x: 420, y: 392, width: 42, height: 46 },
      { x: 980, y: 392, width: 44, height: 46 },
      { x: 1760, y: 388, width: 48, height: 50 },
      { x: 2640, y: 384, width: 50, height: 54 },
      { x: 3160, y: 388, width: 48, height: 50 }
    ],
    items: [
      { type: "treat", x: 230, y: 385 },
      { type: "awakening", x: 650, y: 288 },
      { type: "treat", x: 1160, y: 254 },
      { type: "awakening", x: 1660, y: 386 },
      { type: "treat", x: 2110, y: 188 },
      { type: "treat", x: 2580, y: 270 },
      { type: "awakening", x: 2860, y: 386 },
      { type: "treat", x: 3030, y: 200 },
      { type: "treat", x: 3190, y: 136 },
      { type: "treat", x: 3290, y: 385 }
    ],
    otherDogs: [
      { x: 1340, groundY: 438 },
      { x: 2380, groundY: 438 },
      { x: 3050, groundY: 250 }
    ]
  }
];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const stageClearScreen = document.getElementById("stageClearScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const nextStageButton = document.getElementById("nextStageButton");
const clearRestartButton = document.getElementById("clearRestartButton");
const clearTitleButton = document.getElementById("clearTitleButton");
const gameOverTitleButton = document.getElementById("gameOverTitleButton");
const muteButton = document.getElementById("muteButton");
const stageText = document.getElementById("stageText");
const scoreText = document.getElementById("scoreText");
const characterText = document.getElementById("characterText");
const awakeningText = document.getElementById("awakeningText");
const awakeningBar = document.getElementById("awakeningBar");
const soundText = document.getElementById("soundText");
const titleHighScoreText = document.getElementById("titleHighScoreText");
const finalScoreText = document.getElementById("finalScoreText");
const gameOverHighScoreText = document.getElementById("gameOverHighScoreText");
const clearTitle = document.getElementById("clearTitle");
const clearScoreText = document.getElementById("clearScoreText");
const clearHighScoreText = document.getElementById("clearHighScoreText");

const input = {
  left: false,
  right: false,
  jumpHeld: false,
  jumpPressed: false,
  switchPressed: false
};

let characterImages = {};
let activeCharacterId = "ricca";
let player;
let items = [];
let otherDogs = [];
let otherDogImages = [];
let score = 0;
let highScore = 0;
let cameraX = 0;
let gameState = GAME_STATE.TITLE;
let lastTime = 0;
let currentLevelIndex = 0;
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
    const drawWidth = config.drawWidth * drawScale;
    const drawHeight = config.drawHeight * drawScale;
    const drawX = this.x - currentCameraX - (drawWidth - config.hitboxWidth) / 2;
    const drawY = this.y - (drawHeight - config.hitboxHeight) + 8;
    const image = this.images[this.animationFrame];

    if (image && image.loaded) {
      context.save();
      if (this.facing === "left") {
        context.translate(drawX + drawWidth, drawY);
        context.scale(-1, 1);
        context.drawImage(image.element, 0, 0, drawWidth, drawHeight);
      } else {
        context.drawImage(image.element, drawX, drawY, drawWidth, drawHeight);
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
    const x = hitbox.x - currentCameraX;
    context.fillStyle = this.config.fallbackColor;
    context.fillRect(x, hitbox.y, hitbox.width, hitbox.height);
    context.fillStyle = "#f8f5ef";
    context.fillRect(x + (this.facing === "right" ? 42 : 10), hitbox.y + 10, 8, 8);
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
    const y = this.groundY - OTHER_DOG_CONFIG.drawHeight + bobOffset;
    const frame = Math.floor(performance.now() / 240) % 2;
    const image = images[frame];

    if (image && image.loaded) {
      context.drawImage(image.element, x, y, OTHER_DOG_CONFIG.drawWidth, OTHER_DOG_CONFIG.drawHeight);
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
    context.fillStyle = OTHER_DOG_CONFIG.fallbackColor;
    context.beginPath();
    context.ellipse(x + 28, y + 24, 28, 20, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#7a5b45";
    context.beginPath();
    context.arc(x + 46, y + 14, 16, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#25313d";
    context.beginPath();
    context.arc(x + 51, y + 11, 3, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#d8aa68";
    context.fillRect(x + 8, y + 38, 8, 12);
    context.fillRect(x + 38, y + 38, 8, 12);
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
      x: this.getDrawX() + OTHER_DOG_CONFIG.drawWidth / 2,
      y: this.groundY - OTHER_DOG_CONFIG.drawHeight / 2
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
        gain.gain.exponentialRampToValueAtTime(note.gain, now + note.start + 0.01);
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
}

soundManager = new SoundManager();
highScore = readStoredNumber(STORAGE_KEYS.highScore, 0);
updateTitleHighScore();
updateSoundHud();

function resetGame(options = {}) {
  if (options.resetScore) {
    score = 0;
    awakeningItemCount = 0;
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
  items = getCurrentLevel().items.map((item) => ({ ...item, collected: false }));
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
  resetGame({ resetScore: true, characterId: "ricca" });
  gameState = GAME_STATE.PLAYING;
  titleScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  stageClearScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  lastTime = performance.now();
}

function endGame() {
  gameState = GAME_STATE.GAME_OVER;
  updateHighScore();
  soundManager.playGameOver();
  finalScoreText.textContent = String(score);
  gameOverHighScoreText.textContent = String(highScore);
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
}

function clearLevel() {
  gameState = GAME_STATE.STAGE_CLEAR;
  updateHighScore();
  soundManager.playGoal();
  clearScoreText.textContent = String(score);
  clearHighScoreText.textContent = String(highScore);
  const isLastLevel = currentLevelIndex >= LEVELS.length - 1;
  clearTitle.textContent = isLastLevel ? "ALL CLEAR" : "STAGE CLEAR";
  nextStageButton.textContent = isLastLevel ? "RESTART" : "NEXT STAGE";
  gameScreen.classList.add("hidden");
  stageClearScreen.classList.remove("hidden");
}

function goToNextStage() {
  if (currentLevelIndex >= LEVELS.length - 1) {
    startGame();
    return;
  }

  currentLevelIndex += 1;
  resetGame({ characterId: activeCharacterId });
  gameState = GAME_STATE.PLAYING;
  stageClearScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  lastTime = performance.now();
}

function restartCurrentStage() {
  soundManager.resume();
  resetGame({ resetScore: true, characterId: "ricca" });
  gameState = GAME_STATE.PLAYING;
  titleScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  stageClearScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  lastTime = performance.now();
}

function showTitleScreen() {
  gameState = GAME_STATE.TITLE;
  input.left = false;
  input.right = false;
  input.jumpHeld = false;
  input.jumpPressed = false;
  input.switchPressed = false;
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  stageClearScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  updateTitleHighScore();
}

function update(deltaTime) {
  const level = getCurrentLevel();

  if (input.switchPressed) {
    switchCharacter();
    input.switchPressed = false;
  }

  const movementInput = { ...input };
  if (activeCharacterId === "mugi" && mugiStunTimer > 0) {
    movementInput.left = false;
    movementInput.right = false;
  }

  player.update(deltaTime, movementInput, level.platforms);
  input.jumpPressed = false;
  input.switchPressed = false;
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

  if (isTouchingObstacle() || player.y > STAGE_CONFIG.fallLimit) {
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
  }
}

function triggerOtherDogEvent(otherDog) {
  if (activeCharacterId === "mugi") {
    messageManager.add("むぎ：ガウ！", 1.3);
    mugiStunTimer = OTHER_DOG_CONFIG.mugiStunDuration;
    addScore(-OTHER_DOG_CONFIG.mugiPenalty, "-5", player.x, player.y - 10);
    soundManager.playGau();
    otherDog.triggerReaction("mugi");
  } else if (isAwakened) {
    messageManager.add("りっか覚醒中：ビューン！", 1.3);
    addScore(OTHER_DOG_CONFIG.awakenedBonus, "+10", player.x, player.y - 10);
    soundManager.playCombo();
    otherDog.triggerReaction("awakened");
  } else {
    messageManager.add("りっか：わん！", 1.3);
    messageManager.add("むぎ：ガウ！", 1.3, OTHER_DOG_CONFIG.riccaFollowUpDelay / 1000);
    addScore(OTHER_DOG_CONFIG.riccaComboBonus, "+10 Combo!", player.x, player.y - 10);
    soundManager.playCombo();
    soundManager.playGau();
    otherDog.triggerReaction("ricca");
  }

  updateHud();
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
  }

  updateHud();
}

function isTouchingObstacle() {
  const hitbox = player.getHitbox();
  return getCurrentLevel().obstacles.some((obstacle) => rectanglesOverlap(hitbox, obstacle));
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
  for (const obstacle of getCurrentLevel().obstacles) {
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

function gameLoop(currentTime) {
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.033);
  lastTime = currentTime;

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
  return LEVELS[currentLevelIndex];
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

function loadCharacterImages() {
  const entries = Object.entries(CHARACTER_CONFIGS).map(([characterId, config]) => {
    return Promise.all(config.runImages.map(loadSpriteImage)).then((images) => [characterId, images]);
  });

  return Promise.all(entries).then((loadedEntries) => Object.fromEntries(loadedEntries));
}

function loadOtherDogImages() {
  return Promise.all(OTHER_DOG_IMAGE_PATHS.map(loadSpriteImage));
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

window.addEventListener("contextmenu", (event) => event.preventDefault());

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartCurrentStage);
nextStageButton.addEventListener("click", goToNextStage);
clearRestartButton.addEventListener("click", restartCurrentStage);
clearTitleButton.addEventListener("click", showTitleScreen);
gameOverTitleButton.addEventListener("click", showTitleScreen);
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
  resetGame({ resetScore: true, characterId: "ricca" });
  draw();
  requestAnimationFrame((time) => {
    lastTime = time;
    gameLoop(time);
  });
});
