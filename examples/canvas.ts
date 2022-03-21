import { World, Neko } from "../mod.ts";
import { createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";

const canvas = createCanvas(200, 200);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "red";
ctx.fillRect(10, 10, 200 - 20, 200 - 20);

const width = 200;
const height = 200;

const neko = new Neko({
    title: "Neko",
    width,
    height,
});
class Instance extends World {
    update() {
        neko.setFrameBuffer(canvas.getRawBuffer(0, 0, width, height));
    }
}

new Instance().start(neko, 60);