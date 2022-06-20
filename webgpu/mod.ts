import { WorldSettings } from "../mod.ts";
import { Neko } from "../mod.ts";
import { Dimensions } from "./types.ts";
import { copyToBuffer, createCapture, setGPUBuffer } from "./utils.ts";

export class GPUWorld {
  device: GPUDevice;
  dimensions: Dimensions;
  neko: Neko;
  firstRender = true;

  constructor(dimensions: Dimensions, device: GPUDevice, title = "Neko") {
    this.dimensions = dimensions;
    this.device = device;
    this.neko = new Neko({
      title,
      ...dimensions,
    });
  }

  async init() {}
  render(_encoder: GPUCommandEncoder, _view: GPUTextureView) {}

  async renderWindow() {
    if (this.firstRender) await this.init();
    this.firstRender = false;
    const { texture, outputBuffer } = createCapture(
      this.device,
      this.dimensions,
    );
    const encoder = this.device.createCommandEncoder();
    this.render(encoder, texture.createView());
    copyToBuffer(encoder, texture, outputBuffer, this.dimensions);
    this.device.queue.submit([encoder.finish()]);
    await setGPUBuffer(this.neko, outputBuffer, this.dimensions);
  }
  async setup() {}
  async start(settingsOrFps: number | WorldSettings = 60) {
    const fps = typeof settingsOrFps === "number"
      ? settingsOrFps
      : settingsOrFps.fps;
    await this.setup();
    setInterval(async () => {
      if (this.neko.open) {
        await this.update();
      } else {
        Deno.exit(0);
      }
    }, 1 / fps * 1000);
  }
  startSync(_settingsOrFps: number | WorldSettings = 60) {
    throw new Error("WebGPU wrapper does not support sync start");
  }
  async update() {
    await this.renderWindow();
  }
  updateSync() {
    throw new Error("WebGPU wrapper does not support sync update");
  }
  static async getDevice({
    requiredFeatures,
    optionalFeatures,
  }: {
    requiredFeatures?: GPUFeatureName[];
    optionalFeatures?: GPUFeatureName[];
  } = {}): Promise<GPUDevice> {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice({
      requiredFeatures: (requiredFeatures ?? []).concat(
        optionalFeatures?.filter((feature) => adapter.features.has(feature)) ??
          [],
      ),
    });

    if (!device) {
      throw new Error("no suitable adapter found");
    }

    return device;
  }
}
