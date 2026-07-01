'use strict';

/**
 * 犬の横スクロールアクションゲーム Ver.0.1
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
const GRAVITY = 1850;
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
    this.sprite = loadImage('assets/images/ricca_run_01.png');
  }

  draw(context, player, cameraX) {
    const drawX = Math.round(player.x - cameraX);
    const drawY = Math.round(player.y);

    context.save();

    // 左向きは横反転。将来アニメーションフレームを持たせる場合もここを拡張します。
    if (player.facing === -1) {
      context.translate(drawX + player.width, drawY);
      context.scale(-1, 1);
      this.drawSpriteOrFallback(context, 0, 0, player.width, player.height);
    } else {
      this.drawSpriteOrFallback(context, drawX, drawY, player.width, player.height);
    }

    context.restore();
  }

  drawSpriteOrFallback(context, x, y, width, height) {
    if (this.sprite.loaded) {
      context.drawImage(this.sprite.image, x, y, width, height);
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
    this.width = 64;
    this.height = 72;
    this.speed = 245;
    this.jumpPower = 690;
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
  }

  getBounds() {
    return { x: this.x + 10, y: this.y + 8, width: this.width - 20, height: this.height - 10 };
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

    this.vy += GRAVITY * deltaTime;
    this.y += this.vy * deltaTime;
    this.resolveGround(stage);
  }

  resolveGround(stage) {
    this.onGround = false;
    const feetX = this.x + this.width / 2;
    const isOverHole = stage.holes.some((hole) => feetX > hole.x && feetX < hole.x + hole.width);

    if (!isOverHole && this.y + this.height >= FLOOR_Y && this.vy >= 0) {
      this.y = FLOOR_Y - this.height;
      this.vy = 0;
      this.onGround = true;
    }
  }

  draw(context, cameraX) {
    this.renderer.draw(context, this, cameraX);
  }
}

class Stage {
  constructor() {
    this.width = 2600;
    this.holes = [
      { x: 650, width: 150 },
      { x: 1320, width: 190 },
      { x: 2060, width: 170 }
    ];
    this.obstacles = [
      { x: 940, y: FLOOR_Y - 52, width: 58, height: 52 },
      { x: 1710, y: FLOOR_Y - 70, width: 70, height: 70 },
      { x: 2280, y: FLOOR_Y - 58, width: 62, height: 58 }
    ];
    this.treats = [];
    this.resetTreats();
  }

  resetTreats() {
    this.treats = [250, 470, 880, 1160, 1580, 1880, 2180, 2440].map((x) => ({
      x,
      y: FLOOR_Y - 126,
      width: 34,
      height: 34,
      collected: false
    }));
  }

  draw(context, cameraX) {
    this.drawBackground(context, cameraX);
    this.drawGround(context, cameraX);
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

  drawGround(context, cameraX) {
    context.fillStyle = '#65c86f';
    context.fillRect(0, FLOOR_Y, GAME_WIDTH, 22);
    context.fillStyle = '#8b5a2b';
    context.fillRect(0, FLOOR_Y + 22, GAME_WIDTH, GAME_HEIGHT - FLOOR_Y - 22);

    this.holes.forEach((hole) => {
      const x = hole.x - cameraX;
      context.fillStyle = '#142638';
      context.fillRect(x, FLOOR_Y, hole.width, GAME_HEIGHT - FLOOR_Y);
      context.fillStyle = '#4aa95a';
      context.fillRect(x - 10, FLOOR_Y, 10, 22);
      context.fillRect(x + hole.width, FLOOR_Y, 10, 22);
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
    this.player = new Player(90, FLOOR_Y - 72);
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
