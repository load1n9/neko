// ported from https://github.com/denoland/webgpu-examples/blob/main/cube/mod.ts
import * as gmath from "https://deno.land/x/gmath@0.1.11/mod.ts";
import { GPUWorld } from "../mod.ts";
import { createBufferInit, OPENGL_TO_WGPU_MATRIX } from "../utils.ts";

const vertex = (
  pos: [number, number, number],
  tc: [number, number],
): number[] => [...pos, 1, ...tc];

function createVertices(): {
  vertexData: Float32Array;
  indexData: Uint16Array;
} {
  const vertexData = new Float32Array([
    // top (0, 0, 1)
    ...vertex([-1, -1, 1], [0, 0]),
    ...vertex([1, -1, 1], [1, 0]),
    ...vertex([1, 1, 1], [1, 1]),
    ...vertex([-1, 1, 1], [0, 1]),
    // bottom (0, 0, -1)
    ...vertex([-1, 1, -1], [1, 0]),
    ...vertex([1, 1, -1], [0, 0]),
    ...vertex([1, -1, -1], [0, 1]),
    ...vertex([-1, -1, -1], [1, 1]),
    // right (1, 0, 0)
    ...vertex([1, -1, -1], [0, 0]),
    ...vertex([1, 1, -1], [1, 0]),
    ...vertex([1, 1, 1], [1, 1]),
    ...vertex([1, -1, 1], [0, 1]),
    // left (-1, 0, 0)
    ...vertex([-1, -1, 1], [1, 0]),
    ...vertex([-1, 1, 1], [0, 0]),
    ...vertex([-1, 1, -1], [0, 1]),
    ...vertex([-1, -1, -1], [1, 1]),
    // front (0, 1, 0)
    ...vertex([1, 1, -1], [1, 0]),
    ...vertex([-1, 1, -1], [0, 0]),
    ...vertex([-1, 1, 1], [0, 1]),
    ...vertex([1, 1, 1], [1, 1]),
    // back (0, -1, 0)
    ...vertex([1, -1, 1], [0, 0]),
    ...vertex([-1, -1, 1], [1, 0]),
    ...vertex([-1, -1, -1], [1, 1]),
    ...vertex([1, -1, -1], [0, 1]),
  ]);

  // deno-fmt-ignore
  const indexData = new Uint16Array([
      0, 1, 2, 2, 3, 0, // top
      4, 5, 6, 6, 7, 4, // bottom
      8, 9, 10, 10, 11, 8, // right
      12, 13, 14, 14, 15, 12, // left
      16, 17, 18, 18, 19, 16, // front
      20, 21, 22, 22, 23, 20, // back
    ]);

  return { vertexData, indexData };
}

function createTexels(size: number): Uint8Array {
  const texels = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i++) {
    const cx = 3 * (i % size) / (size - 1) - 2;
    const cy = 2 * Math.floor(i / size) / (size - 1) - 1;
    let count = 0;
    let x = cx;
    let y = cy;
    while (count < 0xFF && x * x + y * y < 4) {
      const oldX = x;
      x = x * x - y * y + cx;
      y = 2.0 * oldX * y + cy;
      count += 1;
    }
    texels[i] = count;
  }
  return texels;
}

function generateMatrix(aspectRatio: number): Float32Array {
  const mxProjection = new gmath.PerspectiveFov(
    new gmath.Deg(45),
    aspectRatio,
    1,
    1000,
  ).toPerspective().toMatrix4();
  const mxView = gmath.Matrix4.lookAtRh(
    new gmath.Vector3(1.5, -5, 3),
    new gmath.Vector3(0, 0, 0),
    gmath.Vector3.forward(),
  );
  return OPENGL_TO_WGPU_MATRIX.mul(mxProjection.mul(mxView)).toFloat32Array();
}

class Cube extends GPUWorld {
  pipeline!: GPURenderPipeline;
  bindGroup!: GPUBindGroup;
  indexBuffer!: GPUBuffer;
  vertexBuffer!: GPUBuffer;
  indexCount!: number;

  // deno-lint-ignore require-await
  async init() {
    const { vertexData, indexData } = createVertices();
    this.indexCount = indexData.length;

    this.vertexBuffer = createBufferInit(this.device, {
      label: "Vertex Buffer",
      usage: GPUBufferUsage.VERTEX,
      contents: vertexData.buffer,
    });

    this.indexBuffer = createBufferInit(this.device, {
      label: "Index Buffer",
      usage: GPUBufferUsage.INDEX,
      contents: indexData.buffer,
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            minBindingSize: 64,
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: "uint",
          },
        },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    const size = 256;
    const texels = createTexels(size);
    const textureExtent = {
      width: size,
      height: size,
    };

    const texture = this.device.createTexture({
      size: textureExtent,
      format: "r8uint",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    const textureView = texture.createView();
    this.device.queue.writeTexture(
      {
        texture,
      },
      texels,
      {
        bytesPerRow: size,
        rowsPerImage: 0,
      },
      textureExtent,
    );

    const mxTotal = generateMatrix(
      this.dimensions.width / this.dimensions.height,
    );
    const uniformBuffer = createBufferInit(this.device, {
      label: "Uniform Buffer",
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      contents: mxTotal.buffer,
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer,
          },
        },
        {
          binding: 1,
          resource: textureView,
        },
      ],
    });

    const shader = this.device.createShaderModule({
      code: `
      struct VertexOutput {
        [[location(0)]] tex_coord: vec2<f32>;
        [[builtin(position)]] position: vec4<f32>;
    };
    
    struct Locals {
        transform: mat4x4<f32>;
    };
    [[group(0), binding(0)]]
    var<uniform> r_locals: Locals;
    
    [[stage(vertex)]]
    fn vs_main(
        [[location(0)]] position: vec4<f32>,
        [[location(1)]] tex_coord: vec2<f32>,
    ) -> VertexOutput {
        var out: VertexOutput;
        out.tex_coord = tex_coord;
        out.position = r_locals.transform * position;
        return out;
    }
    
    [[group(0), binding(1)]]
    var r_color: texture_2d<u32>;
    
    [[stage(fragment)]]
    fn fs_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
        let tex = textureLoad(r_color, vec2<i32>(in.tex_coord * 256.0), 0);
        let v = f32(tex.x) / 255.0;
        return vec4<f32>(1.0 - (v * 5.0), 1.0 - (v * 15.0), 1.0 - (v * 50.0), 1.0);
    }
    
    [[stage(fragment)]]
    fn fs_wire() -> [[location(0)]] vec4<f32> {
        return vec4<f32>(0.0, 0.5, 0.0, 0.5);
    }`,
    });
    const vertexBuffers: GPUVertexBufferLayout[] = [
      {
        arrayStride: 6 * 4,
        attributes: [
          {
            format: "float32x4",
            offset: 0,
            shaderLocation: 0,
          },
          {
            format: "float32x2",
            offset: 4 * 4,
            shaderLocation: 1,
          },
        ],
      },
    ];

    this.pipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shader,
        entryPoint: "vs_main",
        buffers: vertexBuffers,
      },
      fragment: {
        module: shader,
        entryPoint: "fs_main",
        targets: [
          {
            format: "rgba8unorm-srgb",
          },
        ],
      },
      primitive: {
        cullMode: "back",
      },
    });
  }

  render(encoder: GPUCommandEncoder, view: GPUTextureView) {
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: view,
          storeOp: "store",
          loadValue: [0.1, 0.2, 0.3, 1],
        },
      ],
    });

    renderPass.pushDebugGroup("Prepare data for draw.");
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.bindGroup);
    renderPass.setIndexBuffer(this.indexBuffer, "uint16");
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.popDebugGroup();
    renderPass.insertDebugMarker("Draw!");
    renderPass.drawIndexed(this.indexCount, 1);
    renderPass.endPass();
  }
}

const cube = new Cube({
  width: 1600,
  height: 1200,
}, await Cube.getDevice());
await cube.start();