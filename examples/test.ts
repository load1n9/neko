import { Menu, Neko, World } from "../mod.ts";

const width = 800;
const height = 600;

const neko = new Neko({
  title: "Neko",
  width,
  height,
  resize: true,
  topmost: false,
});
const menu = new Menu("hi");
menu.addItem("hi", "h");
menu.addItem("hi2", "q");
neko.addMenu(menu);
neko.setIcon("./assets/test.ico");
const frame = new Uint8Array(width * height * 4).fill(0x000000);
class Instance extends World {
  updateSync() {
    frame[Math.round(Math.random() * frame.length)] = Math.round(
      Math.random() * 0xffffff,
    );
    neko.setFrameBuffer(frame);
    neko.setBackgroundColor(255, 0, 0);
  }
}

new Instance().startSync(neko, 60);
