import { Neko, World } from "../mod.ts";
import { createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import type {
  CanvasRenderingContext2D,
  EmulatedCanvas2D,
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
interface Config {
  title?: string;
  width?: number;
  height?: number;
  fps?: number;
}
export class Canvas {
  #title: string;
  #ctx: CanvasRenderingContext2D;
  #canvas: EmulatedCanvas2D;
  window: Neko;
  #world: World;
  #width: number;
  #height: number;
  #fps: number;
  constructor(config: Partial<Config> = {}) {
    this.#world = new World();
    this.#height = config.height || 200;
    this.#width = config.width || 200;
    this.#title = config.title || "Neko";
    this.#fps = config.fps || 60;
    this.#canvas = createCanvas(this.#width, this.#height);
    this.#ctx = this.#canvas.getContext("2d");
    this.window = new Neko({
      title: this.#title,
      width: this.#width,
      height: this.#height,
    });
    this.#world.start(this.window, {
      fps: this.#fps,
      update: () => {
        this.window.setFrameBuffer(
          this.#canvas.getRawBuffer(0, 0, this.#width, this.#height),
        );
      },
    });
  }
  getContext(_type = "2d"): CanvasRenderingContext2D {
    return this.#ctx;
  }
  get canvas(): EmulatedCanvas2D {
    return this.#canvas;
  }
  get width(): number {
    return this.#width;
  }
  get height(): number {
    return this.#height;
  }
}