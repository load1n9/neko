import { Neko } from "./Neko.ts";
import { WorldSettings } from "./types.ts";

export class World {
  async start(renderer: Neko, settingsOrFps: number | WorldSettings = 60) {
    const settings = typeof settingsOrFps === "number"
      ? { fps: settingsOrFps }
      : settingsOrFps;
    const fps = typeof settingsOrFps === "number"
      ? settingsOrFps
      : settingsOrFps.fps;
    await (settings.setup || this.setup)();
    setInterval(async () => {
      if (renderer.open) {
        await (settings.update || this.update)();
      } else {
        Deno.exit(0);
      }
    }, 1 / fps * 1000);
  }
  startSync(renderer: Neko, settingsOrFps: number | WorldSettings = 60) {
    const settings = typeof settingsOrFps === "number"
      ? { fps: settingsOrFps }
      : settingsOrFps;
    const fps = typeof settingsOrFps === "number"
      ? settingsOrFps
      : settingsOrFps.fps;
    (settings.setupSync || this.setupSync)();
    setInterval(() => {
      if (renderer.open) {
        (settings.updateSync || this.updateSync)();
      } else {
        Deno.exit(0);
      }
    }, 1 / fps * 1000);
  }
  async setup() {
  }
  setupSync() {
  }
  async update() {
  }
  updateSync() {
  }
}
