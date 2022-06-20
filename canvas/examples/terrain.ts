import { Canvas } from "../mod.ts";

type Vector = {
  x: number;
  y: number;
};

const canvas = new Canvas({
  title: "Terrain",
  width: 800,
  height: 800,
});
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#fff";
ctx.strokeStyle = "#fff";

const BATCH = 5;
const WRAP = 4;
const TOTAL = WRAP * BATCH;
const theta = 40;
const thetaZ = theta * Math.PI / 180;
const thetaY = theta * Math.PI / 180;
const thetaX = theta * Math.PI / 180;
const sx = 200;
const sy = 40;
const step = 20;
const steps = 20;
const radius = 2;

const matrix: [number, number, number][][][] = [];
const matrix2: number[][] = [];
for (let i = 0; i < TOTAL; i++) {
  const col: number[] = [];
  for (let j = 0; j < TOTAL; j++) {
    col.push(0);
  }
  matrix2.push(col);
}

function Shuffle(tab: number[]) {
  for (let e = tab.length - 1; e > 0; e--) {
    const index = Math.round(Math.random() * (e - 1)),
      temp = tab[e];

    tab[e] = tab[index];
    tab[index] = temp;
  }
}

function MakePermutation() {
  const P = [];
  for (let i = 0; i < 256; i++) {
    P.push(i);
  }
  Shuffle(P);
  for (let i = 0; i < 256; i++) {
    P.push(P[i]);
  }

  return P;
}
const P = MakePermutation();

function ConstantVector(v: number) {
  return [
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
  ][v & 3];
}

function Calculate() {
  for (let i = 0; i < TOTAL; i++) {
    for (let j = 0; j < TOTAL; j++) {
      matrix2[i][j] = PerlinBatch(i, j);
    }
  }
}

function PerlinBatch(posX: number, posY: number) {
  const batchX = Math.floor(posX / WRAP);
  const batchY = Math.floor(posY / WRAP);
  const trv = ConstantVector(P[P[batchX + 1] + batchY + 1]);
  const tlv = ConstantVector(P[P[batchX] + batchY + 1]);
  const brv = ConstantVector(P[P[batchX + 1] + batchY]);
  const blv = ConstantVector(P[P[batchX] + batchY]);

  const currentX = posX / WRAP - batchX;
  const currentY = posY / WRAP - batchY;
  return Perlin(currentX, currentY, trv, tlv, brv, blv);
}

function Perlin(
  x: number,
  y: number,
  trv: Vector,
  tlv: Vector,
  brv: Vector,
  blv: Vector,
) {
  const tr = { x: x - 1, y: y - 1 };
  const tl = { x: x, y: y - 1 };
  const br = { x: x - 1, y: y };
  const bl = { x: x, y: y };

  const trd = Dot(trv, tr);
  const tld = Dot(tlv, tl);
  const brd = Dot(brv, br);
  const bld = Dot(blv, bl);

  const u = Fade(x);
  const v = Fade(y);

  const left = Lerp(bld, tld, v);
  const right = Lerp(brd, trd, v);
  return Lerp(left, right, u);
}

function Dot(a: Vector, b: Vector) {
  return a.x * b.x + a.y * b.y;
}

function Lerp(a: number, b: number, x: number) {
  return a + (b - a) * x;
}

function Fade(t: number) {
  return ((6 * t - 15) * t + 10) * t * t * t;
}

for (let i = 0; i < steps; i += 1) {
  const column: [number, number, number][][] = [];
  for (let j = 0; j < steps; j += 1) {
    const row: [number, number, number][] = [];
    const x = i * step;
    const y = j * step;
    row.push([x, y, -PerlinBatch(i, j) * 40]);
    column.push(row);
  }
  matrix.push(column);
}

function Render() {
  const matrix2 = [];
  for (const column of matrix) {
    const column2 = [];
    for (const row of column) {
      const row2 = [];
      for (const point of row) {
        let x = point[0];
        let y = point[1];
        let z = point[2];
        x = x * Math.cos(thetaX) - z * Math.sin(thetaX);
        z = point[0] * Math.sin(thetaX) + z * Math.cos(thetaX);
        y = y * Math.cos(thetaY) - z * Math.sin(thetaY);
        z = point[1] * Math.sin(thetaY) + z * Math.cos(thetaY);
        const x2 = x;
        x = x * Math.cos(thetaZ) - y * Math.sin(thetaZ);
        y = x2 * Math.sin(thetaZ) + y * Math.cos(thetaZ);

        ctx.beginPath();
        ctx.arc(x + sx, y + sy, radius, 0, 2 * Math.PI);
        ctx.fill();
        row2.push([x + sx, y + sy]);
      }
      column2.push(row2);
    }
    matrix2.push(column2);
  }

  for (let i = 0; i < matrix2.length; i++) {
    for (let j = 0; j < matrix2[i].length; j++) {
      for (let k = 0; k < matrix2[i][j].length; k++) {
        const point = matrix2[i][j][k];
        const point2 = matrix2[i][j][k + 1];
        if (point2) {
          ctx.beginPath();
          ctx.moveTo(point[0], point[1]);
          ctx.lineTo(point2[0], point2[1]);
          ctx.stroke();
        }
      }
      const point = matrix2[i][j];
      const point2 = matrix2[i][j + 1];
      if (point2) {
        for (let k = 0; k < matrix2[i][j].length; k++) {
          ctx.beginPath();
          ctx.moveTo(point[k][0], point[k][1]);
          ctx.lineTo(point2[k][0], point2[k][1]);
          ctx.stroke();
        }
      }
    }
    const point = matrix2[i];
    const point2 = matrix2[i + 1];
    if (point2) {
      for (let j = 0; j < matrix2[i].length; j++) {
        for (let k = 0; k < matrix2[i][j].length; k++) {
          ctx.beginPath();
          ctx.moveTo(point[j][k][0], point[j][k][1]);
          ctx.lineTo(point2[j][k][0], point2[j][k][1]);
          ctx.stroke();
        }
      }
    }
  }
}

Calculate();
Render();
