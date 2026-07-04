"use strict";

const DEBUG_HITBOX = false;

const CANVAS_CONFIG = {
  width: 960,
  height: 540
};

const STAGE_CONFIG = {
  snackScore: 10,
  fallLimit: 620,
  cameraLeadX: 380,
  goalWidth: 64,
  goalHeight: 128
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
    snacks: [
      { x: 240, y: 385 },
      { x: 690, y: 385 },
      { x: 960, y: 292 },
      { x: 1320, y: 248 },
      { x: 1770, y: 282 },
      { x: 2040, y: 190 },
      { x: 2470, y: 276 },
      { x: 2890, y: 186 },
      { x: 2860, y: 154 }
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
    snacks: [
      { x: 230, y: 385 },
      { x: 650, y: 288 },
      { x: 1160, y: 254 },
      { x: 1660, y: 386 },
      { x: 2110, y: 188 },
      { x: 2580, y: 270 },
      { x: 3030, y: 200 },
      { x: 3190, y: 136 },
      { x: 3290, y: 385 }
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
const stageText = document.getElementById("stageText");
const scoreText = document.getElementById("scoreText");
const characterText = document.getElementById("characterText");
const finalScoreText = document.getElementById("finalScoreText");
const clearTitle = document.getElementById("clearTitle");
const clearScoreText = document.getElementById("clearScoreText");

const input = {
  left: false,
  right: false,
  jumpPressed: false,
  switchPressed: false
};

let characterImages = {};
let activeCharacterId = "ricca";
let player;
let snacks = [];
let score = 0;
let cameraX = 0;
let gameState = "title";
let lastTime = 0;
let currentLevelIndex = 0;
let switchEffectTime = 0;

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
    return CHARACTER_CONFIGS[this.characterId];
  }

  update(deltaTime, currentInput, platforms) {
    this.vx = 0;

    if (currentInput.left) {
      this.vx = -this.config.moveSpeed;
      this.facing = "left";
    }

    if (currentInput.right) {
      this.vx = this.config.moveSpeed;
      this.facing = "right";
    }

    if (currentInput.jumpPressed) {
      this.jump();
      currentInput.jumpPressed = false;
    }

    this.x += this.vx * deltaTime;
    this.x = Math.max(0, Math.min(this.x, getCurrentLevel().length - this.config.hitboxWidth));

    const previousY = this.y;
    this.vy = Math.min(this.vy + this.config.gravity * deltaTime, this.config.maxFallSpeed);
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
    const drawX = this.x - currentCameraX - (config.drawWidth - config.hitboxWidth) / 2;
    const drawY = this.y - (config.drawHeight - config.hitboxHeight) + 8;
    const image = this.images[this.animationFrame];

    if (image && image.loaded) {
      context.save();
      if (this.facing === "left") {
        context.translate(drawX + config.drawWidth, drawY);
        context.scale(-1, 1);
        context.drawImage(image.element, 0, 0, config.drawWidth, config.drawHeight);
      } else {
        context.drawImage(image.element, drawX, drawY, config.drawWidth, config.drawHeight);
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

function resetGame(options = {}) {
  if (options.resetScore) {
    score = 0;
  }
  activeCharacterId = options.characterId ?? "ricca";
  input.left = false;
  input.right = false;
  input.jumpPressed = false;
  input.switchPressed = false;
  snacks = getCurrentLevel().snacks.map((snack) => ({ ...snack, collected: false }));
  cameraX = 0;
  player = new Player(activeCharacterId, characterImages[activeCharacterId]);
  switchEffectTime = 0;
  updateHud();
}

function startGame() {
  currentLevelIndex = 0;
  resetGame({ resetScore: true, characterId: "ricca" });
  gameState = "playing";
  titleScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  stageClearScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  lastTime = performance.now();
}

function endGame() {
  gameState = "gameover";
  finalScoreText.textContent = String(score);
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
}

function clearLevel() {
  gameState = "clear";
  clearScoreText.textContent = String(score);
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
  gameState = "playing";
  stageClearScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  lastTime = performance.now();
}

function update(deltaTime) {
  const level = getCurrentLevel();

  if (input.switchPressed) {
    switchCharacter();
    input.switchPressed = false;
  }

  player.update(deltaTime, input, level.platforms);
  cameraX = clamp(player.x - STAGE_CONFIG.cameraLeadX, 0, level.length - CANVAS_CONFIG.width);
  switchEffectTime = Math.max(0, switchEffectTime - deltaTime);

  collectSnacks();

  if (isTouchingGoal()) {
    clearLevel();
    return;
  }

  if (isTouchingObstacle() || player.y > STAGE_CONFIG.fallLimit) {
    endGame();
  }
}

function switchCharacter() {
  if (gameState !== "playing" || !player.isOnGround) {
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

function collectSnacks() {
  const hitbox = player.getHitbox();
  for (const snack of snacks) {
    if (!snack.collected && circleIntersectsRect(snack.x, snack.y, 16, hitbox)) {
      snack.collected = true;
      score += STAGE_CONFIG.snackScore;
      updateHud();
    }
  }
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
  drawSnacks();
  drawObstacles();
  drawGoalFlag();
  player.draw(ctx, cameraX);
  drawSwitchEffect();
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

function drawSnacks() {
  for (const snack of snacks) {
    if (snack.collected) {
      continue;
    }

    const x = snack.x - cameraX;
    ctx.fillStyle = "#f1a93c";
    ctx.beginPath();
    ctx.arc(x, snack.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff0c7";
    ctx.beginPath();
    ctx.arc(x - 5, snack.y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }
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

function gameLoop(currentTime) {
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.033);
  lastTime = currentTime;

  if (gameState === "playing") {
    update(deltaTime);
    draw();
  }

  requestAnimationFrame(gameLoop);
}

function updateHud() {
  stageText.textContent = getCurrentLevel().name;
  scoreText.textContent = String(score);
  characterText.textContent = CHARACTER_CONFIGS[activeCharacterId].displayName;
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

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft") {
    input.left = true;
  }
  if (event.code === "ArrowRight") {
    input.right = true;
  }
  if (event.code === "Space" || event.code === "ArrowUp") {
    input.jumpPressed = true;
  }
  if ((event.code === "KeyC" || event.code === "Tab") && !event.repeat) {
    input.switchPressed = true;
  }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyC", "Tab"].includes(event.code)) {
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
});

window.addEventListener("contextmenu", (event) => event.preventDefault());

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
nextStageButton.addEventListener("click", goToNextStage);
setButtonHold(document.getElementById("leftButton"), "left");
setButtonHold(document.getElementById("rightButton"), "right");
setTapButton(document.getElementById("jumpButton"), () => {
  input.jumpPressed = true;
});
setTapButton(document.getElementById("switchButton"), () => {
  input.switchPressed = true;
});

loadCharacterImages().then((images) => {
  characterImages = images;
  resetGame({ resetScore: true, characterId: "ricca" });
  draw();
  requestAnimationFrame((time) => {
    lastTime = time;
    gameLoop(time);
  });
});
