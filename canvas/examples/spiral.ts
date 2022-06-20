// ported from https://codepen.io/hakimel/pen/QdWpRv
import { Canvas } from "../mod.ts";
const canvas = new Canvas({
  title: "spiral",
  width: 1000,
  height: 1000,
});
const context = canvas.getContext("2d");

let time = 0;
let velocity = 0.1;
const velocityTarget = 0.1;
// deno-lint-ignore no-explicit-any
let width: any;
// deno-lint-ignore no-explicit-any
let height: any;
// deno-lint-ignore no-explicit-any no-unused-vars
let lastX: any;
// deno-lint-ignore no-explicit-any no-unused-vars
let lastY: any;

const MAX_OFFSET = 400;
const SPACING = 4;
const POINTS = MAX_OFFSET / SPACING;
const PEAK = MAX_OFFSET * 0.25;
const POINTS_PER_LAP = 6;
const SHADOW_STRENGTH = 6;

setup();

function setup() {
  resize();
  step();
}

function resize() {
  width = canvas.width;
  height = canvas.height;
}

function step() {
  time += velocity;
  velocity += (velocityTarget - velocity) * 0.3;

  clear();
  render();
}

function clear() {
  context.clearRect(0, 0, width, height);
}

function render() {
  // deno-lint-ignore prefer-const
  let x, y, cx = width / 2, cy = height / 2;

  context.globalCompositeOperation = "lighter";
  context.strokeStyle = "#fff";
  context.shadowColor = "#fff";
  context.lineWidth = 2;
  context.beginPath();

  for (let i = POINTS; i > 0; i--) {
    const value = i * SPACING + (time % SPACING);

    const ax = Math.sin(value / POINTS_PER_LAP) * Math.PI;
    const ay = Math.cos(value / POINTS_PER_LAP) * Math.PI;

    x = ax * value, y = ay * value * 0.35;

    const o = 1 - (Math.min(value, PEAK) / PEAK);

    y -= Math.pow(o, 2) * 200;
    y += 200 * value / MAX_OFFSET;
    y += x / cx * width * 0.1;

    context.globalAlpha = 1 - (value / MAX_OFFSET);
    context.shadowBlur = SHADOW_STRENGTH * o;

    context.lineTo(cx + x, cy + y);
    context.stroke();

    context.beginPath();
    context.moveTo(cx + x, cy + y);
  }

  context.lineTo(cx, cy - 200);
  context.lineTo(cx, 0);
  context.stroke();
}

setInterval(step, 1000 / 60);
