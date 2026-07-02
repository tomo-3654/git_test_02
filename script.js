'use strict';

/**
 * 犬の横スクロールアクションゲーム Ver.0.1.1
 * ------------------------------------------------------------
 * Vanilla JavaScript + HTML5 Canvas の最小プロトタイプです。
 * 将来のキャラクター追加・画像差し替え・ステージ拡張に備えて、
 * 入力 / プレイヤー / ステージ / ゲーム本体をクラス分割しています。
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const titleScreen = document.getElementById('titleScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const finalScore = document.getElementById('finalScore');

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const PHYSICS = {
  gravity: 1650,
  moveSpeed: 295,
  jumpPower: 720
};

const PLAYER_CONFIG = {
  drawWidth: 96,
  drawHeight: 74,
  hitboxWidth: 58,
  hitboxHeight: 46
};

const ANIMATION = {
  frameInterval: 120
};

const ASSETS = {
  riccaRun: [
    'assets/images/ricca_run_01.png',
    'assets/images/ricca_run_02.png'
  ]
};

const DEBUG_HITBOX = false;
const FLOOR_Y = 426;

const GAME_STATE = {
  TITLE: 'title',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver'
};

/** 画像は存在しなくても遊べるように、読み込み失敗を通常状態として扱います。 */
function loadImage(src) {
  const image = new Image();
  const state = { image, loaded: false, failed: false };

  image.addEventListener('load', () => {
    state.loaded = true;
  });

  image.addEventListener('error', () => {
    state.failed = true;
  });

  image.src = src;
  return state;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

class InputManager {
  constructor() {
    this.keys = { left: false, right: false, jump: false };
    this.jumpPressed = false;
    this.bindKeyboard();
    this.bindTouchButtons();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(event.code)) {
        event.preventDefault();
      }

      if (event.code === 'ArrowLeft') this.keys.left = true;
      if (event.code === 'ArrowRight') this.keys.right = true;
      if (event.code === 'ArrowUp' || event.code === 'Space') this.pressJump();
    });

    window.addEventListener('keyup', (event) => {
      if (event.code === 'ArrowLeft') this.keys.left = false;
      if (event.code === 'ArrowRight') this.keys.right = false;
      if (event.code === 'ArrowUp' || event.code === 'Space') this.keys.jump = false;
    });
  }

  bindTouchButtons() {
    document.querySelectorAll('.control-button').forEach((button) => {
      const action = button.dataset.action;

      const press = (event) => {
        event.preventDefault();
        button.classList.add('is-pressed');
        if (action === 'jump') this.pressJump();
        if (action === 'left') this.keys.left = true;
        if (action === 'right') this.keys.right = true;
      };

      const release = (event) => {
        event.preventDefault();
        button.classList.remove('is-pressed');
        if (action === 'jump') this.keys.jump = false;
        if (action === 'left') this.keys.left = false;
        if (action === 'right') this.keys.right = false;
      };

      button.addEventListener('pointerdown', press);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('pointerleave', release);
    });
  }

  pressJump() {
    if (!this.keys.jump) {
      this.jumpPressed = true;
    }
    this.keys.jump = true;
  }

  consumeJumpPressed() {
    const wasPressed = this.jumpPressed;
    this.jumpPressed = false;
    return wasPressed;
  }
}

class RiccaRenderer {
  constructor() {
    this.frames = ASSETS.riccaRun.map((src) => loadImage(src));
  }

  draw(context, player, cameraX) {
    const drawX = Math.round(player.x - cameraX);
    const drawY = Math.round(player.y);
    const frame = this.frames[player.animationFrame] || this.frames[0];

    context.save();

    // 左向きは横反転。将来ジャンプ専用画像や待機画像を追加してもここを流用できます。
    if (player.facing === -1) {
      context.translate(drawX + player.width, drawY);
      context.scale(-1, 1);
      this.drawSpriteOrFallback(context, frame, 0, 0, player.width, player.height);
    } else {
      this.drawSpriteOrFallback(context, frame, drawX, drawY, player.width, player.height);
    }

    if (DEBUG_HITBOX) {
      const bounds = player.getBounds();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.strokeStyle = 'rgba(255, 0, 0, 0.9)';
      context.lineWidth = 2;
      context.strokeRect(bounds.x - cameraX, bounds.y, bounds.width, bounds.height);
    }

    context.restore();
  }

  drawSpriteOrFallback(context, frame, x, y, width, height) {
    if (frame && frame.loaded) {
      context.drawImage(frame.image, x, y, width, height);
      return;
    }

    // 画像未配置時の仮表示。黒いりっかをイメージした簡単な四角形です。
    context.fillStyle = '#242027';
    context.fillRect(x + width * 0.18, y + height * 0.22, width * 0.64, height * 0.62);
    context.fillStyle = '#332a34';
    context.beginPath();
    context.arc(x + width * 0.52, y + height * 0.22, width * 0.26, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffffff';
    context.fillRect(x + width * 0.58, y + height * 0.18, width * 0.08, height * 0.08);
    context.fillStyle = '#ffcf78';
    context.fillRect(x + width * 0.32, y + height * 0.78, width * 0.15, height * 0.14);
    context.fillRect(x + width * 0.58, y + height * 0.78, width * 0.15, height * 0.14);
  }
}

class Player {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;
    this.width = PLAYER_CONFIG.drawWidth;
    this.height = PLAYER_CONFIG.drawHeight;
    this.speed = PHYSICS.moveSpeed;
    this.jumpPower = PHYSICS.jumpPower;
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.renderer = new RiccaRenderer();
    this.reset();
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = false;
    this.animationFrame = 0;
    this.animationTimer = 0;
  }

  getBounds() {
    return {
      x: this.x + (this.width - PLAYER_CONFIG.hitboxWidth) / 2,
      y: this.y + this.height - PLAYER_CONFIG.hitboxHeight,
      width: PLAYER_CONFIG.hitboxWidth,
      height: PLAYER_CONFIG.hitboxHeight
    };
  }

  isMoving() {
    return Math.abs(this.vx) > 1;
  }

  isJumping() {
    return !this.onGround;
  }

  updateAnimation(deltaTime) {
    if (this.isJumping()) {
      this.animationFrame = 1;
      this.animationTimer = 0;
      return;
    }

    if (!this.isMoving()) {
      this.animationFrame = 0;
      this.animationTimer = 0;
      return;
    }

    this.animationTimer += deltaTime * 1000;
    if (this.animationTimer >= ANIMATION.frameInterval) {
      this.animationTimer = 0;
      this.animationFrame = this.animationFrame === 0 ? 1 : 0;
    }
  }

  update(deltaTime, input, stage) {
    const move = (input.keys.right ? 1 : 0) - (input.keys.left ? 1 : 0);
    this.vx = move * this.speed;

    if (move !== 0) {
      this.facing = Math.sign(move);
    }

    if (input.consumeJumpPressed() && this.onGround) {
      this.vy = -this.jumpPower;
      this.onGround = false;
    }

    this.x += this.vx * deltaTime;
    this.x = Math.max(0, Math.min(this.x, stage.width - this.width));

    const previousBottom = this.y + this.height;
    this.vy += PHYSICS.gravity * deltaTime;
    this.y += this.vy * deltaTime;
    this.resolvePlatforms(stage, previousBottom);
    this.updateAnimation(deltaTime);
  }

  resolvePlatforms(stage, previousBottom) {
    this.onGround = false;
    const bounds = this.getBounds();

    stage.platforms.forEach((platform) => {
      const wasAbove = previousBottom <= platform.y + 8;
      const isFalling = this.vy >= 0;
      const overlapsX = bounds.x < platform.x + platform.width && bounds.x + bounds.width > platform.x;
      const crossesTop = bounds.y + bounds.height >= platform.y && bounds.y + bounds.height <= platform.y + Math.max(24, this.vy / 30);

      if (wasAbove && isFalling && overlapsX && crossesTop) {
        this.y = platform.y - this.height;
        this.vy = 0;
        this.onGround = true;
      }
    });
  }

  draw(context, cameraX) {
    this.renderer.draw(context, this, cameraX);
  }
}

class Stage {
  constructor() {
    this.width = 2600;
    this.platforms = [
      { x: 0, y: FLOOR_Y, width: 610, height: GAME_HEIGHT - FLOOR_Y, level: '下段' },
      { x: 760, y: FLOOR_Y, width: 620, height: GAME_HEIGHT - FLOOR_Y, level: '下段' },
      { x: 1530, y: FLOOR_Y, width: 1070, height: GAME_HEIGHT - FLOOR_Y, level: '下段' },
      { x: 980, y: 326, width: 330, height: 28, level: '中段' },
      { x: 1340, y: 246, width: 310, height: 28, level: '上段' },
      { x: 1840, y: 326, width: 340, height: 28, level: '中段' },
      { x: 2200, y: 246, width: 270, height: 28, level: '上段' }
    ];
    this.holes = [
      { x: 610, width: 150 },
      { x: 1380, width: 150 }
    ];
    this.obstacles = [
      { x: 430, y: FLOOR_Y - 34, width: 46, height: 34 },
      { x: 870, y: FLOOR_Y - 42, width: 46, height: 42 },
      { x: 1150, y: 326 - 34, width: 44, height: 34 },
      { x: 1980, y: 326 - 38, width: 46, height: 38 }
    ];
    this.treats = [];
    this.resetTreats();
  }

  resetTreats() {
    const treatData = [
      { x: 250, y: FLOOR_Y - 126 },
      { x: 520, y: FLOOR_Y - 126 },
      { x: 910, y: FLOOR_Y - 126 },
      { x: 1070, y: 326 - 74 },
      { x: 1450, y: 246 - 74 },
      { x: 1710, y: FLOOR_Y - 126 },
      { x: 1930, y: 326 - 74 },
      { x: 2280, y: 246 - 74 },
      { x: 2480, y: FLOOR_Y - 126 }
    ];

    this.treats = treatData.map(({ x, y }) => ({
      x,
      y,
      width: 34,
      height: 34,
      collected: false
    }));
  }

  draw(context, cameraX) {
    this.drawBackground(context, cameraX);
    this.drawPlatforms(context, cameraX);
    this.drawTreats(context, cameraX);
    this.drawObstacles(context, cameraX);
  }

  drawBackground(context, cameraX) {
    const gradient = context.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#92dcff');
    gradient.addColorStop(1, '#e9fbff');
    context.fillStyle = gradient;
    context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    context.fillStyle = 'rgba(255, 255, 255, 0.72)';
    for (let x = -((cameraX * 0.25) % 320); x < GAME_WIDTH + 320; x += 320) {
      context.beginPath();
      context.arc(x + 70, 95, 28, 0, Math.PI * 2);
      context.arc(x + 104, 88, 38, 0, Math.PI * 2);
      context.arc(x + 144, 100, 26, 0, Math.PI * 2);
      context.fill();
    }
  }

  drawPlatforms(context, cameraX) {
    this.platforms.forEach((platform) => {
      const x = platform.x - cameraX;
      context.fillStyle = platform.y === FLOOR_Y ? '#65c86f' : '#79d889';
      context.fillRect(x, platform.y, platform.width, 22);
      context.fillStyle = platform.y === FLOOR_Y ? '#8b5a2b' : '#9d6a38';
      context.fillRect(x, platform.y + 22, platform.width, platform.height);
      context.fillStyle = 'rgba(255,255,255,0.34)';
      context.font = 'bold 14px system-ui, sans-serif';
      context.fillText(platform.level, x + 14, platform.y + 17);
    });

    this.holes.forEach((hole) => {
      const x = hole.x - cameraX;
      context.fillStyle = '#142638';
      context.fillRect(x, FLOOR_Y, hole.width, GAME_HEIGHT - FLOOR_Y);
    });
  }

  drawObstacles(context, cameraX) {
    context.fillStyle = '#9d5940';
    this.obstacles.forEach((obstacle) => {
      context.fillRect(obstacle.x - cameraX, obstacle.y, obstacle.width, obstacle.height);
      context.fillStyle = 'rgba(255,255,255,0.16)';
      context.fillRect(obstacle.x - cameraX + 8, obstacle.y + 8, obstacle.width - 16, 8);
      context.fillStyle = '#9d5940';
    });
  }

  drawTreats(context, cameraX) {
    this.treats.forEach((treat) => {
      if (treat.collected) return;
      const x = treat.x - cameraX;
      context.fillStyle = '#ffcf4a';
      context.beginPath();
      context.arc(x + treat.width / 2, treat.y + treat.height / 2, treat.width / 2, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#d97926';
      context.fillRect(x + 10, treat.y + 14, 14, 6);
    });
  }
}

class Game {
  constructor() {
    this.input = new InputManager();
    this.stage = new Stage();
    this.player = new Player(90, FLOOR_Y - PLAYER_CONFIG.drawHeight);
    this.state = GAME_STATE.TITLE;
    this.score = 0;
    this.cameraX = 0;
    this.lastTime = 0;

    startButton.addEventListener('click', () => this.start());
    restartButton.addEventListener('click', () => this.start());
    requestAnimationFrame((time) => this.loop(time));
  }

  start() {
    this.score = 0;
    this.cameraX = 0;
    this.player.reset();
    this.stage.resetTreats();
    this.state = GAME_STATE.PLAYING;
    titleScreen.classList.remove('is-visible');
    gameOverScreen.classList.remove('is-visible');
  }

  gameOver() {
    this.state = GAME_STATE.GAME_OVER;
    finalScore.textContent = String(this.score);
    gameOverScreen.classList.add('is-visible');
  }

  loop(currentTime) {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000 || 0, 0.033);
    this.lastTime = currentTime;

    if (this.state === GAME_STATE.PLAYING) {
      this.update(deltaTime);
    }

    this.render();
    requestAnimationFrame((time) => this.loop(time));
  }

  update(deltaTime) {
    this.player.update(deltaTime, this.input, this.stage);
    this.cameraX = Math.max(0, Math.min(this.player.x - GAME_WIDTH * 0.38, this.stage.width - GAME_WIDTH));

    this.stage.treats.forEach((treat) => {
      if (!treat.collected && rectsOverlap(this.player.getBounds(), treat)) {
        treat.collected = true;
        this.score += 10;
      }
    });

    if (this.stage.obstacles.some((obstacle) => rectsOverlap(this.player.getBounds(), obstacle))) {
      this.gameOver();
    }

    if (this.player.y > GAME_HEIGHT + 80) {
      this.gameOver();
    }
  }

  render() {
    this.stage.draw(ctx, this.cameraX);
    this.player.draw(ctx, this.cameraX);
    this.drawHud();
  }

  drawHud() {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
    ctx.fillRect(22, 18, 178, 48);
    ctx.strokeStyle = 'rgba(32, 48, 64, 0.18)';
    ctx.strokeRect(22, 18, 178, 48);
    ctx.fillStyle = '#203040';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(`SCORE ${this.score}`, 42, 50);
    ctx.restore();
  }
}

new Game();
