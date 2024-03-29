// ported from https://github.com/denoland/webgpu-examples/blob/main/hello-triangle/mod.ts

import { Neko, World } from "../mod.ts";
import {
  copyToBuffer,
  createCapture,
  setGPUBuffer,
} from "../webgpu/utils.ts";
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
@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32> {
    let x = f32(i32(in_vertex_index) - 1);
    let y = f32(i32(in_vertex_index & 1u) * 2 - 1);
    return vec4<f32>(x, y, 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
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
  primitive: {
    topology: "triangle-list",
  },
});

const neko = new Neko({
  ...dimensions,
  title: "Triangle",
});

class Instance extends World {
  async update() {
    if (!device) {
      console.error("no suitable adapter found");
      Deno.exit(0);
    }
    const { texture, outputBuffer: buf } = createCapture(device, dimensions);

    const encoder = device.createCommandEncoder();
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: texture.createView(),
          storeOp: "store",
          clearValue: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
        },
      ],
    });
    renderPass.setPipeline(renderPipeline);
    renderPass.draw(3, 1, 0, 0);
    renderPass.end();

    copyToBuffer(encoder, texture, buf, dimensions);

    device.queue.submit([encoder.finish()]);
    await setGPUBuffer(neko, buf, dimensions);
  }
}
await new Instance().start(neko, 60);
