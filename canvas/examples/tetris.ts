// deno-lint-ignore-file no-explicit-any
import { Canvas } from "../mod.ts";

const COLS = 20;
const ROWS = 20;
const board: any = [];
let score = 0;
let lose = false;
let interval: any;
let intervalRender: any;
let intervalRotate: any;
let current: any;
let currentX: number | undefined;
let currentY: number | undefined;
let freezed: boolean | undefined;
const shapes = [
  [1, 1, 1, 1],
  [1, 1, 1, 0, 1],
  [1, 1, 1, 0, 0, 0, 1],
  [1, 1, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 1, 1],
  [0, 1, 1, 0, 1, 1],
  [0, 1, 0, 0, 1, 1, 1],
];
const colors = [
  "cyan",
  "orange",
  "blue",
  "yellow",
  "red",
  "green",
  "purple",
];
function newShape() {
  const id = Math.floor(Math.random() * shapes.length);
  const shape = shapes[id];
  current = [];
  for (let y = 0; y < 4; ++y) {
    current[y] = [];
    for (let x = 0; x < 4; ++x) {
      const i = 4 * y + x;
      if (typeof shape[i] != "undefined" && shape[i]) {
        current[y][x] = id + 1;
      } else {
        current[y][x] = 0;
      }
    }
  }
  freezed = false;
  currentX = 5;
  currentY = 0;
}

function init() {
  for (let y = 0; y < ROWS; ++y) {
    board[y] = [];
    for (let x = 0; x < COLS; ++x) {
      board[y][x] = 0;
    }
  }
}

function tick() {
  if (valid(0, 1)) {
    (currentY!)++;
  }
  else {
    freeze();
    valid(0, 1);
    clearLines();
    if (lose) {
      clearAllIntervals();
      return false;
    }
    newShape();
  }
}

function freeze() {
  for (let y = 0; y < 4; ++y) {
    for (let x = 0; x < 4; ++x) {
      if (current[y][x]) {
        board[y + currentY!][x + currentX!] = current[y][x];
      }
    }
  }
  freezed = true;
}

function rotate(current: any) {
  const newCurrent: any = [];
  for (let y = 0; y < 4; ++y) {
    newCurrent[y] = [];
    for (let x = 0; x < 4; ++x) {
      newCurrent[y][x] = current[3 - x][y];
    }
  }

  return newCurrent;
}

function clearLines() {
  for (let y = ROWS - 1; y >= 0; --y) {
    let rowFilled = true;
    for (let x = 0; x < COLS; ++x) {
      if (board[y][x] == 0) {
        rowFilled = false;
        break;
      }
    }
    if (rowFilled) {
      for (let yy = y; yy > 0; --yy) {
        for (let x = 0; x < COLS; ++x) {
          board[yy][x] = board[yy - 1][x];
        }
      }
      y++;
    }
  }
}

function keyPress(key: string) {
  switch (key) {
    case "left":
      if (valid(-1)) {
        (currentX!)--;
      }
      break;
    case "right":
      if (valid(1)) {
        (currentX!)++;
      }
      break;
    case "down":
      if (valid(0, 1)) {
        (currentY!)++;
      }
      break;
    // deno-lint-ignore no-case-declarations
    case "rotate":
      const rotated = rotate(current);
      if (valid(0, 0, rotated)) {
        current = rotated;
      }
      break;
    case "drop":
      while (valid(0, 1)) {
        (currentY!)++;
      }
      tick();
      break;
  }
}
function checkForKeyPress() {
  if(canvas.window.isKeyDown("up")) {
    keyPress("rotate");
  }
}
function valid(offsetX = 0, offsetY = 0, newCurrent?: any) {
  offsetX = currentX! + offsetX;
  offsetY = currentY! + offsetY;
  newCurrent = newCurrent || current;

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (newCurrent[y][x]) {
        if (
          typeof board[y + offsetY] == "undefined" ||
          typeof board[y + offsetY][x + offsetX] == "undefined" ||
          board[y + offsetY][x + offsetX] ||
          x + offsetX < 0 ||
          y + offsetY >= ROWS ||
          x + offsetX >= COLS
        ) {
          if (offsetY == 1 && freezed) {
            lose = true;
          }
          return false;
        }
      }
    }
  }
  return true;
}

function playButtonClicked() {
  newGame();
}

function newGame() {
  clearAllIntervals();
  intervalRender = setInterval(render, 30);
  intervalRotate = setInterval(checkForKeyPress, 70);
  init();
  newShape();
  lose = false;
  interval = setInterval(tick, 400);
}

function clearAllIntervals() {
  clearInterval(interval);
  clearInterval(intervalRender);
  clearInterval(intervalRotate);
}

const canvas = new Canvas({
  title: "Tetris",
  width: 300,
  height: 300,
});
const ctx = canvas.getContext("2d");
const W = 300;
const H = 300;
const BLOCK_W = W / COLS;
const BLOCK_H = H / ROWS;

function drawBlock(x: number, y: number) {
  ctx.fillRect(BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1, BLOCK_H - 1);
  ctx.strokeRect(BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1, BLOCK_H - 1);
}

function render() {
  ctx.clearRect(0, 0, W, H);
  if(canvas.window.isKeyDown("space")) {
    keyPress("drop");
  }
  if(canvas.window.isKeyDown("left")) {
    keyPress("left");
  }
  if(canvas.window.isKeyDown("right")) {
    keyPress("right");
  }
  if(canvas.window.isKeyDown("down")) {
    keyPress("down");
  }
  ctx.strokeStyle = "black";
  for (let x = 0; x < COLS; ++x) {
    for (let y = 0; y < ROWS; ++y) {
      if (board[y][x]) {
        ctx.fillStyle = colors[board[y][x] - 1];
        drawBlock(x, y);
      }
    }
  }

  ctx.fillStyle = "red";
  ctx.strokeStyle = "black";
  for (let y = 0; y < 4; ++y) {
    for (let x = 0; x < 4; ++x) {
      if (current[y][x]) {
        ctx.fillStyle = colors[current[y][x] - 1];
        drawBlock(currentX! + x, currentY! + y);
      }
    }
  }
}
playButtonClicked();
