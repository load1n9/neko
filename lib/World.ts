import { Neko } from "./Neko.ts";
import { WorldSettings } from "./types.ts";

export class World {
    start(renderer: Neko, settingsOrFps: number | WorldSettings = 60) {
      const settings = typeof settingsOrFps === "number" ? { fps: settingsOrFps } : settingsOrFps;
      const fps = typeof settingsOrFps === "number" ? settingsOrFps : settingsOrFps.fps;
      (settings.setup || this.setup)();
        setInterval(() => {
            if (renderer.open) {
              (settings.update || this.update)();
            } else {
              Deno.exit(0)
            }
          }, 1 / fps * 1000)
    }
    setup() {
        
    }
    update() {

    }
}