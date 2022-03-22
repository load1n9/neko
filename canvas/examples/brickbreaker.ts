// ported from https://github.com/AleikovStudio/Brick-breaker-game-JS-HTML-Canvas
import { Canvas } from "../mod.ts";
const canvas = new Canvas({
  title: "Brick Breaker",
  width: 500,
  height: 500,
});
const ctx = canvas.getContext("2d");

let x = canvas.width / 2;
let y = canvas.height - 80;
const paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false; 
let leftPressed = false;
const ballRadius = 10;
const brickRowCount = 7;
const brickColumnCount = 5;

let count = brickRowCount * brickColumnCount;
let rem = count;

let score = 0;
let lives = 3;

const brickWidth = 80;
const brickHeight = 20;
const brickPadding = 7;
const brickOffsetTop = 30;
const brickOffsetLeft = 40;
let speedup1 = 0;
let speedup2 = 0;
let speedup3 = 0;
let speedup4 = 0;
let speedup5 = 0;
let speedup6 = 0;
const _speedup7 = 0;

// deno-lint-ignore no-explicit-any
const bricks: any = [];
for (let c = 0; c < brickColumnCount; ++c) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; ++r) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

let dx = 3.5;
let dy = -3.5;

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#00ffff";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; ++c) {
    for (let r = 0; r < brickRowCount; ++r) {
      if (bricks[c][r].status == 1) {
        const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        if (c % 2 != 0) {
          ctx.fillStyle = "#fff";
        } else {
          ctx.fillStyle = "#C2AA83";
        }
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; ++c) {
    for (let r = 0; r < brickRowCount; ++r) {
      const b = bricks[c][r];

      if (b.status == 1) {
        if (
          x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          count--;
          ctx.beginPath();
          ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#00ffff";
          ctx.fill();
          ctx.closePath();
          if (count <= (rem - rem / 7) && speedup1 == 0) {
            if (dy < 0) {
              dy -= 0.5;
            } else {
              dy += 0.5;
            }
            if (dx < 0) {
              dx -= 0.5;
            } else {
              dx += 0.5;
            }
            paddleWidth += 2;
            speedup1 = 1;
          }
          if (count <= (rem - 2 * rem / 7) && speedup2 == 0) {
            if (dy < 0) {
              dy -= 1;
            } else {
              dy += 1;
            }
            if (dx < 0) {
              dx -= 1;
            } else {
              dx += 1;
            }

            paddleWidth += 3;
            speedup2 = 1;
          }
          if (count <= (rem - 3 * rem / 7) && speedup3 == 0) {
            if (dy < 0) {
              dy -= 1;
            } else {
              dy += 1;
            }
            if (dx < 0) {
              dx -= 1;
            } else {
              dx += 1;
            }

            paddleWidth += 4;
            speedup3 = 1;
          }

          if (count <= (rem - 4 * rem / 7) && speedup4 == 0) {
            if (dy < 0) {
              dy -= 1;
            } else {
              dy += 1;
            }
            if (dx < 0) {
              dx -= 1;
            } else {
              dx += 1;
            }
            paddleWidth += 5;
            speedup4 = 1;
          }

          if (count <= (rem - 5 * rem / 7) && speedup5 == 0) {
            if (dy < 0) {
              dy -= 1;
            } else {
              dy += 1;
            }
            if (dx < 0) {
              dx -= 1;
            } else {
              dx += 1;
            }
            paddleWidth += 6;
            speedup5 = 1;
          }

          if (count <= (rem - 6 * rem / 7) && speedup6 == 0) {
            if (dy < 0) {
              dy -= 1;
            } else {
              dy += 1;
            }
            if (dx < 0) {
              dx -= 1;
            } else {
              dx += 1;
            }
            paddleWidth += 7;
            speedup6 = 1;
          }

          if (count <= 0) {
            console.log("You Win!");
            Deno.exit(0);
          }
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = "18px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("score: " + score, 40, 20);
}

function drawLives() {
  ctx.font = "18px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(
    "lives: " + lives,
    canvas.width - 310,
    20,
  );
}

function draw() {
  keyHandler();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();

  collisionDetection();

  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x >= paddleX && x <= paddleX + paddleWidth) {
      dy = -dy;
    } else {
      lives--;
      if (lives <= 0) {
        console.log("Sorry, you've lost...\nTry again! :-)");
        Deno.exit(0);
      } else {
        x = canvas.width / 2;
        y = canvas.height - 30;
        paddleWidth = 80;
        rem = count;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  } else {
    y += dy;
  }

  if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
    dx = -dx;
  } else {
    x += dx;
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }
}

function keyHandler() {
  if (canvas.window.isKeyDown("right")) {
    rightPressed = true;
  } else {
    rightPressed = false;
  }
  if (canvas.window.isKeyDown("left")) {
    leftPressed = true;
  } else {
    leftPressed = false;
  }
}

setInterval(draw, 20);
