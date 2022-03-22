// ported from https://codepen.io/lukasvait/pen/OJexNE
import { Canvas } from "../mod.ts";
const canvas = new Canvas({
  title: "Snake",
  width: 500,
  height: 500,
});
// deno-lint-ignore no-explicit-any
let loop: any = undefined;
const ctx = canvas.getContext("2d");
let direction = "";
let directionQueue = "";
const fps = 70;
// deno-lint-ignore no-explicit-any
let snake: any[] = [];
const snakeLength = 5;
const cellSize = 20;
const snakeColor = "#3498db";
const foodColor = "#ff3636";
// deno-lint-ignore no-explicit-any
const foodX: any[] = [];
// deno-lint-ignore no-explicit-any
const foodY: any[] = [];
const food = {
  x: 0,
  y: 0,
};
let score = 0;

for (let i = 0; i <= canvas.width - cellSize; i += cellSize) {
  foodX.push(i);
  foodY.push(i);
}
const drawSquare = (x: number, y: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, cellSize, cellSize);
};

const createFood = () => {
  food.x = foodX[Math.floor(Math.random() * foodX.length)];
  food.y = foodY[Math.floor(Math.random() * foodY.length)];
  for (const i in snake) {
    if (checkCollision(food.x, food.y, snake[i].x, snake[i].y)) {
      createFood();
    }
  }
};
const drawFood = () => {
  drawSquare(food.x, food.y, foodColor);
};

const setBackground = (color1: string, color2: string) => {
  ctx.fillStyle = color1;
  ctx.strokeStyle = color2;

  ctx.fillRect(0, 0, canvas.height, canvas.width);

  for (let x = 0.5; x < canvas.width; x += cellSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  for (let y = 0.5; y < canvas.height; y += cellSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }

  ctx.stroke();
};
const createSnake = () => {
  snake = [];
  for (let i = snakeLength; i > 0; i--) {
    snake.push({ x: i * cellSize, y: 0 });
  }
};
const drawSnake = () => {
  for (let i = 0; i < snake.length; i++) {
    drawSquare(snake[i].x, snake[i].y, snakeColor);
  }
};
const changeDirection = (keycode: string) => {
  if (keycode === "left" && direction != "right") directionQueue = "left";
  else if (keycode === "up" && direction != "down") directionQueue = "up";
  else if (keycode === "right" && direction != "left") directionQueue = "right";
  else if (keycode === "down" && direction != "top") directionQueue = "down";
};
const moveSnake = () => {
  let x = snake[0].x;
  let y = snake[0].y;

  direction = directionQueue;

  if (direction == "right") {
    x += cellSize;
  } else if (direction == "left") {
    x -= cellSize;
  } else if (direction == "up") {
    y -= cellSize;
  } else if (direction == "down") {
    y += cellSize;
  }
  const tail = snake.pop();
  tail.x = x;
  tail.y = y;
  snake.unshift(tail);
};

const checkCollision = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => (x1 === x2 && y1 === y2);
const game = () => {
  const head = snake[0];
  if (
    head.x < 0 || head.x > canvas.width - cellSize || head.y < 0 ||
    head.y > canvas.height - cellSize
  ) {
    setBackground("#ff3636", "#ff3636");
    createSnake();
    drawSnake();
    createFood();
    drawFood();
    directionQueue = "right";
    score = 0;
  }
  for (let i = 1; i < snake.length; i++) {
    if (head.x == snake[i].x && head.y == snake[i].y) {
      setBackground("#ff3636", "#ff3636");
      createSnake();
      drawSnake();
      createFood();
      drawFood();
      directionQueue = "right";
      score = 0;
    }
  }
  if (checkCollision(head.x, head.y, food.x, food.y)) {
    snake[snake.length] = { x: head.x, y: head.y };
    createFood();
    drawFood();
    score += 10;
  }

  if (canvas.window.isKeyDown("left")) {
    changeDirection("left");
  } else if (canvas.window.isKeyDown("right")) {
    changeDirection("right");
  } else if (canvas.window.isKeyDown("up")) {
    changeDirection("up");
  } else if (canvas.window.isKeyDown("down")) {
    changeDirection("down");
  }

  ctx.beginPath();
  setBackground("#fff", "#eee");
  drawSnake();
  drawFood();
  moveSnake();
};
function newGame() {
  direction = "right";
  directionQueue = "right";
  ctx.beginPath();
  createSnake();
  createFood();

  if (typeof loop != "undefined") {
    clearInterval(loop);
  } else {
    loop = setInterval(game, fps);
  }
}
newGame();
