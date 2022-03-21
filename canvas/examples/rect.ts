import { Canvas } from "../mod.ts";

const canvas = new Canvas({
    title: "Neko",
    width: 200,
    height: 200,
    fps: 60,
});

const ctx = canvas.getContext("2d");

ctx.fillStyle = "red";
ctx.fillRect(10, 10, 50, 50);