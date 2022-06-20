// ported from https://github.com/denoland/webgpu-examples/blob/main/hello-triangle/mod.ts

import { Neko, World } from "../mod.ts";
import { copyToBuffer, createCapture, getRowPadding } from "../webgpu/utils.ts";
import { Dimensions } from "../webgpu/types.ts";

const dimensions: Dimensions = {
  width: 200,
  height: 200,
};

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter?.requestDevice();

if (!device) {
  console.error("no suitable adapter found");
  Deno.exit(0);
}

const shaderCode = `
  [[stage(vertex)]]
  fn vs_main([[builtin(vertex_index)]] in_vertex_index: u32) -> [[builtin(position)]] vec4<f32> {
      let x = f32(i32(in_vertex_index) - 1);
      let y = f32(i32(in_vertex_index & 1u) * 2 - 1);
      return vec4<f32>(x, y, 0.0, 1.0);
  }
  [[stage(fragment)]]
  fn fs_main() -> [[location(0)]] vec4<f32> {
      return vec4<f32>(1.0, 0.0, 0.0, 1.0);
  }
  `;

const shaderModule = device.createShaderModule({
  code: shaderCode,
});

const pipelineLayout = device.createPipelineLayout({
  bindGroupLayouts: [],
});

const renderPipeline = device.createRenderPipeline({
  layout: pipelineLayout,
  vertex: {
    module: shaderModule,
    entryPoint: "vs_main",
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fs_main",
    targets: [
      {
        format: "rgba8unorm-srgb",
      },
    ],
  },
});

const { texture, outputBuffer: buf } = createCapture(device, dimensions);

const encoder = device.createCommandEncoder();
const renderPass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: texture.createView(),
      storeOp: "store",
      loadValue: [0, 1, 0, 1],
    },
  ],
});
renderPass.setPipeline(renderPipeline);
renderPass.draw(3, 1);
renderPass.endPass();

copyToBuffer(encoder, texture, buf, dimensions);

device.queue.submit([encoder.finish()]);

const neko = new Neko({
  ...dimensions,
  title: "Triangle",
});

class Instance extends World {
  async update() {
    await buf.mapAsync(1);
    const inputBuffer = new Uint8Array(buf.getMappedRange());
    const { padded, unpadded } = getRowPadding(dimensions.width);
    const outputBuffer = new Uint8Array(unpadded * dimensions.height);

    for (let i = 0; i < dimensions.height; i++) {
      const slice = inputBuffer
        .slice(i * padded, (i + 1) * padded)
        .slice(0, unpadded);

      outputBuffer.set(slice, i * unpadded);
    }
    neko.setFrameBuffer(outputBuffer);
    buf.unmap();
  }
}
await new Instance().start(neko, 60);
