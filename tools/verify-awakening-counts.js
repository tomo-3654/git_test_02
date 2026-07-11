#!/usr/bin/env node
"use strict";

const fs = require("fs");
const vm = require("vm");

function noop() {}

function createElementStub() {
  return {
    classList: { add: noop, remove: noop, toggle: noop },
    style: {},
    dataset: {},
    textContent: "",
    disabled: false,
    addEventListener: noop,
    appendChild: noop,
    querySelectorAll: () => [],
    getContext: () => ({
      save: noop, restore: noop, clearRect: noop, fillRect: noop, strokeRect: noop,
      beginPath: noop, arc: noop, ellipse: noop, fill: noop, stroke: noop, moveTo: noop,
      lineTo: noop, quadraticCurveTo: noop, closePath: noop, drawImage: noop, fillText: noop,
      createLinearGradient: () => ({ addColorStop: noop }),
      createRadialGradient: () => ({ addColorStop: noop }),
      measureText: () => ({ width: 0 })
    })
  };
}

const sandbox = {
  console,
  Math,
  performance: { now: () => 0 },
  setTimeout,
  clearTimeout,
  requestAnimationFrame: noop,
  Image: class { set src(value) { this._src = value; if (this.onload) this.onload(); } get src() { return this._src; } },
  Audio: class { play() { return Promise.resolve(); } pause() {} addEventListener() {} },
  localStorage: { getItem: () => null, setItem: noop },
  navigator: { getGamepads: () => [] },
  window: { addEventListener: noop, innerWidth: 960, innerHeight: 540 },
  document: {
    getElementById: () => createElementStub(),
    querySelectorAll: () => [],
    addEventListener: noop,
    createElement: () => createElementStub()
  }
};
sandbox.window.document = sandbox.document;
sandbox.globalThis = sandbox;

const browserSource = fs.readFileSync("script.js", "utf8");
const source = browserSource.split("Promise.all([loadCharacterImages(), loadOtherDogImages()]")[0]
  + `\nglobalThis.__verify = { generateStage, STAGE_CONFIG, STAGE_GENERATION_CONFIGS };`;
vm.runInNewContext(source, sandbox, { filename: "script.js" });

const expectedRanges = {
  1: [3, 3],
  2: [3, 4],
  3: [4, 4],
  4: [4, 5],
  5: [5, 6]
};

for (let stage = 1; stage <= sandbox.__verify.STAGE_CONFIG.totalStages; stage += 1) {
  const [min, max] = expectedRanges[stage];
  for (let sample = 0; sample < 50; sample += 1) {
    const level = sandbox.__verify.generateStage(stage);
    const count = level.items.filter((item) => item.type === "awakening").length;
    if (count < min || count > max) {
      throw new Error(`Stage ${stage} generated ${count} awakening items; expected ${min}-${max}`);
    }
  }
  console.log(`Stage ${stage}: awakening item count stayed within ${min}-${max} across 50 generations`);
}
