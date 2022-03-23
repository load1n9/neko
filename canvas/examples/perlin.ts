import { Canvas } from "../mod.ts";

type Vector = {
    x: number,
    y: number
}

const canvas = new Canvas({
    title: "Perlin",
    width: 800,
    height: 800,
});
const ctx = canvas.getContext("2d")

const BATCH = 5
const WRAP = 100
const SIZE = 1
const TOTAL = WRAP * BATCH

function Shuffle(tab: number[]) {
    for (let e = tab.length - 1; e > 0; e--) {
        let index = Math.round(Math.random() * (e - 1)),
            temp = tab[e];

        tab[e] = tab[index];
        tab[index] = temp;
    }
}

function MakePermutation() {
    let P = [];
    for (let i = 0; i < 256; i++) {
        P.push(i);
    }
    Shuffle(P);
    for (let i = 0; i < 256; i++) {
        P.push(P[i]);
    }

    return P;
}
let P = MakePermutation();

function ConstantVector(v: number) {
    return [
        { x: 1, y: 1 },
        { x: -1, y: 1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 }
    ][v & 3]
}

const matrix: number[][] = []
for (let i = 0; i < TOTAL; i++) {
    const col = []
    for (let j = 0; j < TOTAL; j++) {
        col.push(0);
    }
    matrix.push(col)
}

function Calculate() {
    for (let i = 0; i < BATCH; i++) {
        for (let j = 0; j < BATCH; j++) {
            PerlinBatch(i, j)
        }
    }
}

function Draw() {
    ctx.fillStyle = `rgb(0, 0, 0)`
    ctx.fillRect(0, 0, 800, 800)
    for (let i = 0; i < TOTAL; i++) {
        for (let j = 0; j < TOTAL; j++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${matrix[i][j] + 0.5})`
            ctx.fillRect(i * SIZE, j * SIZE, SIZE, SIZE)
        }
    }
}

function PerlinBatch(batchX: number, batchY: number,) {
    const trv = ConstantVector(P[P[batchX + 1] + batchY + 1]);
    const tlv = ConstantVector(P[P[batchX] + batchY + 1]);
    const brv = ConstantVector(P[P[batchX + 1] + batchY]);
    const blv = ConstantVector(P[P[batchX] + batchY]);

    for (let x = 0; x < WRAP; x++) {
        for (let y = 0; y < WRAP; y++) {
            const currentX = x + batchX * WRAP;
            const currentY = y + batchY * WRAP;
            matrix[currentX][currentY] = Perlin(x / WRAP, y / WRAP, trv, tlv, brv, blv)
        }
    }
};

function Perlin(x: number, y: number, trv: Vector, tlv: Vector, brv: Vector, blv: Vector) {
    const tr = { x: x - 1, y: y - 1 }
    const tl = { x: x, y: y - 1 }
    const br = { x: x - 1, y: y }
    const bl = { x: x, y: y }

    const trd = Dot(trv, tr)
    const tld = Dot(tlv, tl)
    const brd = Dot(brv, br)
    const bld = Dot(blv, bl)

    const u = Fade(x);
    const v = Fade(y);

    const left = Lerp(bld, tld, v)
    const right = Lerp(brd, trd, v)
    return Lerp(left, right, u)
};

function Dot(a: Vector, b: Vector) {
    return a.x * b.x + a.y * b.y
}

function Lerp(a: number, b: number, x: number) {
    return a + (b - a) * x
}

function Fade(t: number) {
    return ((6 * t - 15) * t + 10) * t * t * t;
}

Calculate()
Draw();