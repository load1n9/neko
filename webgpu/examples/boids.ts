// ported from https://github.com/denoland/webgpu-examples/blob/main/boids/mod.ts
import { GPUWorld } from "../mod.ts";
import { createBufferInit } from "../utils.ts";
import type { Dimensions } from "../types.ts";

class Boids extends GPUWorld {
  particleCount: number;
  particlesPerGroup: number;

  computePipeline!: GPUComputePipeline;
  particleBindGroups: GPUBindGroup[] = [];
  renderPipeline!: GPURenderPipeline;
  particleBuffers: GPUBuffer[] = [];
  verticesBuffer!: GPUBuffer;

  frameNum = 0;

  constructor(options: {
    particleCount: number;
    particlesPerGroup: number;
    dimensions: Dimensions;
  }, device: GPUDevice) {
    super(options.dimensions, device);

    this.particleCount = options.particleCount;
    this.particlesPerGroup = options.particlesPerGroup;
  }

  // deno-lint-ignore require-await
  async init() {
    const computeShader = this.device.createShaderModule({
      code: `
      struct Particle {
        pos : vec2<f32>;
        vel : vec2<f32>;
      };
      
      struct SimParams {
        deltaT : f32;
        rule1Distance : f32;
        rule2Distance : f32;
        rule3Distance : f32;
        rule1Scale : f32;
        rule2Scale : f32;
        rule3Scale : f32;
      };
      
      struct Particles {
        particles : [[stride(16)]] array<Particle>;
      };
      
      [[group(0), binding(0)]] var<uniform> params : SimParams;
      [[group(0), binding(1)]] var<storage, read> particlesSrc : Particles;
      [[group(0), binding(2)]] var<storage, read_write> particlesDst : Particles;
      
      // https://github.com/austinEng/Project6-Vulkan-Flocking/blob/master/data/shaders/computeparticles/particle.comp
      [[stage(compute), workgroup_size(64)]]
      fn main([[builtin(global_invocation_id)]] global_invocation_id: vec3<u32>) {
        let total = arrayLength(&particlesSrc.particles);
        let index = global_invocation_id.x;
        if (index >= total) {
          return;
        }
      
        var vPos : vec2<f32> = particlesSrc.particles[index].pos;
        var vVel : vec2<f32> = particlesSrc.particles[index].vel;
      
        var cMass : vec2<f32> = vec2<f32>(0.0, 0.0);
        var cVel : vec2<f32> = vec2<f32>(0.0, 0.0);
        var colVel : vec2<f32> = vec2<f32>(0.0, 0.0);
        var cMassCount : i32 = 0;
        var cVelCount : i32 = 0;
      
        var i : u32 = 0u;
        loop {
          if (i >= total) {
            break;
          }
          if (i == index) {
            continue;
          }
      
          let pos = particlesSrc.particles[i].pos;
          let vel = particlesSrc.particles[i].vel;
      
          if (distance(pos, vPos) < params.rule1Distance) {
            cMass = cMass + pos;
            cMassCount = cMassCount + 1;
          }
          if (distance(pos, vPos) < params.rule2Distance) {
            colVel = colVel - (pos - vPos);
          }
          if (distance(pos, vPos) < params.rule3Distance) {
            cVel = cVel + vel;
            cVelCount = cVelCount + 1;
          }
      
          continuing {
            i = i + 1u;
          }
        }
        if (cMassCount > 0) {
          cMass = cMass * (1.0 / f32(cMassCount)) - vPos;
        }
        if (cVelCount > 0) {
          cVel = cVel * (1.0 / f32(cVelCount));
        }
      
        vVel = vVel + (cMass * params.rule1Scale) +
            (colVel * params.rule2Scale) +
            (cVel * params.rule3Scale);
      
        // clamp velocity for a more pleasing simulation
        vVel = normalize(vVel) * clamp(length(vVel), 0.0, 0.1);
      
        // kinematic update
        vPos = vPos + (vVel * params.deltaT);
      
        // Wrap around boundary
        if (vPos.x < -1.0) {
          vPos.x = 1.0;
        }
        if (vPos.x > 1.0) {
          vPos.x = -1.0;
        }
        if (vPos.y < -1.0) {
          vPos.y = 1.0;
        }
        if (vPos.y > 1.0) {
          vPos.y = -1.0;
        }
      
        // Write back
        particlesDst.particles[index].pos = vPos;
        particlesDst.particles[index].vel = vVel;
      }`,
    });

    const drawShader = this.device.createShaderModule({
      code: `[[stage(vertex)]]
            fn main_vs(
                [[location(0)]] particle_pos: vec2<f32>,
                [[location(1)]] particle_vel: vec2<f32>,
                [[location(2)]] position: vec2<f32>,
            ) -> [[builtin(position)]] vec4<f32> {
                let angle = -atan2(particle_vel.x, particle_vel.y);
                let pos = vec2<f32>(
                    position.x * cos(angle) - position.y * sin(angle),
                    position.x * sin(angle) + position.y * cos(angle)
                );
                return vec4<f32>(pos + particle_pos, 0.0, 1.0);
            }

            [[stage(fragment)]]
            fn main_fs() -> [[location(0)]] vec4<f32> {
                return vec4<f32>(1.0, 1.0, 1.0, 1.0);
            }`,
    });

    const simParamData = new Float32Array([
      0.04, // deltaT
      0.1, // rule1Distance
      0.025, // rule2Distance
      0.025, // rule3Distance
      0.02, // rule1Scale
      0.05, // rule2Scale
      0.005, // rule3Scale
    ]);

    const simParamBuffer = createBufferInit(this.device, {
      label: "Simulation Parameter Buffer",
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      contents: simParamData.buffer,
    });

    const computeBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            minBindingSize: simParamData.length * 4,
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "read-only-storage",
            minBindingSize: this.particleCount * 16,
          },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "storage",
            minBindingSize: this.particleCount * 16,
          },
        },
      ],
    });
    const computePipelineLayout = this.device.createPipelineLayout({
      label: "compute",
      bindGroupLayouts: [computeBindGroupLayout],
    });
    const renderPipelineLayout = this.device.createPipelineLayout({
      label: "render",
      bindGroupLayouts: [],
    });
    this.renderPipeline = this.device.createRenderPipeline({
      layout: renderPipelineLayout,
      vertex: {
        module: drawShader,
        entryPoint: "main_vs",
        buffers: [
          {
            arrayStride: 4 * 4,
            stepMode: "instance",
            attributes: [
              {
                format: "float32x2",
                offset: 0,
                shaderLocation: 0,
              },
              {
                format: "float32x2",
                offset: 8,
                shaderLocation: 1,
              },
            ],
          },
          {
            arrayStride: 2 * 4,
            attributes: [
              {
                format: "float32x2",
                offset: 0,
                shaderLocation: 2,
              },
            ],
          },
        ],
      },
      fragment: {
        module: drawShader,
        entryPoint: "main_fs",
        targets: [
          {
            format: "rgba8unorm-srgb",
          },
        ],
      },
    });
    this.computePipeline = this.device.createComputePipeline({
      label: "Compute pipeline",
      layout: computePipelineLayout,
      compute: {
        module: computeShader,
        entryPoint: "main",
      },
    });
    const vertexBufferData = new Float32Array([
      -0.01,
      -0.02,
      0.01,
      -0.02,
      0.00,
      0.02,
    ]);
    this.verticesBuffer = createBufferInit(this.device, {
      label: "Vertex Buffer",
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      contents: vertexBufferData.buffer,
    });

    const initialParticleData = new Float32Array(4 * this.particleCount);
    for (let i = 0; i < initialParticleData.length; i += 4) {
      initialParticleData[i] = 2.0 * (Math.random() - 0.5); // posx
      initialParticleData[i + 1] = 2.0 * (Math.random() - 0.5); // posy
      initialParticleData[i + 2] = 2.0 * (Math.random() - 0.5) * 0.1; // velx
      initialParticleData[i + 3] = 2.0 * (Math.random() - 0.5) * 0.1;
    }

    for (let i = 0; i < 2; i++) {
      this.particleBuffers.push(createBufferInit(this.device, {
        label: "Particle Buffer " + i,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE |
          GPUBufferUsage.COPY_DST,
        contents: initialParticleData.buffer,
      }));
    }

    for (let i = 0; i < 2; i++) {
      this.particleBindGroups.push(this.device.createBindGroup({
        layout: computeBindGroupLayout,
        entries: [
          {
            binding: 0,
            resource: {
              buffer: simParamBuffer,
            },
          },
          {
            binding: 1,
            resource: {
              buffer: this.particleBuffers[i],
            },
          },
          {
            binding: 2,
            resource: {
              buffer: this.particleBuffers[(i + 1) % 2],
            },
          },
        ],
      }));
    }
  }

  render(encoder: GPUCommandEncoder, view: GPUTextureView) {
    encoder.pushDebugGroup("compute boid movement");
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.particleBindGroups[this.frameNum % 2]);
    computePass.dispatch(
      Math.ceil(this.particleCount / this.particlesPerGroup),
    );
    computePass.endPass();
    encoder.popDebugGroup();

    encoder.pushDebugGroup("render boids");
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: view,
          storeOp: "store",
          loadValue: "load",
        },
      ],
    });
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setVertexBuffer(
      0,
      this.particleBuffers[(this.frameNum + 1) % 2],
    );
    renderPass.setVertexBuffer(1, this.verticesBuffer);
    renderPass.draw(3, this.particleCount);
    renderPass.endPass();
    encoder.popDebugGroup();

    this.frameNum += 1;
  }
}

const boids = new Boids({
  particleCount: 150,
  particlesPerGroup: 64,
  dimensions: {
    width: 1600 / 2,
    height: 1200 / 2,
  },
}, await Boids.getDevice());
await boids.start();
