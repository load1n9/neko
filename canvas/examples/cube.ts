import { Canvas } from "../mod.ts";

const canvas = new Canvas({
  title: "Cube",
  width: 800,
  height: 800,
});
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#fff";
ctx.strokeStyle = "#fff";

let theta = 0;
let thetaZ = theta * Math.PI / 180;
let thetaY = theta * Math.PI / 180;
let thetaX = theta * Math.PI / 180;
const d = 300;
const step = 200;
const steps = 1;
const matrix: [number, number, number][][][] = [];

for (let i = -step * steps / 2; i < step * steps; i += step) {
  const column: [number, number, number][][] = [];
  for (let j = -step * steps / 2; j < step * steps; j += step) {
    const row: [number, number, number][] = [];
    for (let k = -step * steps / 2; k < step * steps; k += step) {
      row.push([i, j, k]);
    }
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
        ctx.arc(x + d, y + d, 5, 0, 2 * Math.PI);
        ctx.fill();
        row2.push([x + d, y + d]);
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

ctx.clearRect(0, 0, canvas.width, canvas.height);

setInterval(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  theta += 3;
  if (theta > 360) {
    theta = 0;
  }
  thetaY = theta * Math.PI / 180;
  thetaZ = theta * Math.PI / 180;
  thetaX = theta * Math.PI / 180;
  Render();
}, 50);
