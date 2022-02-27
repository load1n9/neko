import { World, Neko } from "../mod.ts";

const width = 800;
const height = 600;

const neko = new Neko({
    title: "Neko",
    width,
    height,
});
const frame = new Uint8Array(width * height * 4).fill(0x000000);
class Instance extends World {
    update() {
        frame[Math.round(Math.random() * frame.length)] = Math.round(Math.random() * 0xffffff);
        neko.setFrameBuffer(frame);
    }
}

new Instance().start(neko, 60);