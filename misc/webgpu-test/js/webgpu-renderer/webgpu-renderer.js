// Copyright 2020 Brandon Jones
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { Renderer } from '../renderer.js';
import { GPUTextureHelper } from './webgpu-texture-helper.js';
import { WEBGPU_VERTEX_SOURCE, WEBGPU_FRAGMENT_SOURCE, ATTRIB_MAP, UNIFORM_BLOCKS, GetDefinesForPrimitive } from './pbr-shader-wgsl.js';
import { vec2, vec3, vec4, mat4 } from '../third-party/gl-matrix/src/gl-matrix.js';

const SAMPLE_COUNT = 4;
const DEPTH_FORMAT = "depth24plus";
const GENERATE_MIPMAPS = true;

// Only used for comparing values from glTF, which uses WebGL enums natively.
const GL = WebGLRenderingContext;

let NEXT_SHADER_ID = 0;

const SHADER_ERROR_REGEX = /([0-9]*):([0-9*]*): (.*)$/gm;

function createShaderModuleDebug(device, code) {
  if (!device.pushErrorScope) {
    return device.createShaderModule({ code });
  }

  device.pushErrorScope('validation');

  const shaderModule = device.createShaderModule({ code });

  device.popErrorScope().then((error) => {
    if (error) {
      const codeLines = code.split('\n');

      // Find every line in the error that matches a known format. (line:char: message)
      const errorList = error.message.matchAll(SHADER_ERROR_REGEX);

      // Loop through the parsed error messages and show the relevant source code for each message.
      let errorMessage = '';
      let errorStyles = [];

      let lastIndex = 0;

      for (const errorMatch of errorList) {
        // Include out any content between the parsable lines
        if (errorMatch.index > lastIndex+1) {
          errorMessage += error.message.substring(lastIndex, errorMatch.index);
        }
        lastIndex = errorMatch.index + errorMatch[0].length;

        // Show the correlated line with an arrow that points at the indicated error position.
        const errorLine = parseInt(errorMatch[1], 10)-1;
        const errorChar = parseInt(errorMatch[2], 10);
        const errorPointer = '-'.repeat(errorChar-1) + '^';
        errorMessage += `${errorMatch[0]}\n%c${codeLines[errorLine]}\n%c${errorPointer}%c\n`;
        errorStyles.push(
          'color: grey;',
          'color: green; font-weight: bold;',
          'color: default;',
        );

      }

      // If no parsable errors were found, just print the whole message.
      if (lastIndex == 0) {
        console.error(error.message);
        return;
      }

      // Otherwise append any trailing message content.
      if (error.message.length > lastIndex+1) {
        errorMessage += error.message.substring(lastIndex+1, error.message.length);
      }

      // Finally, log to console as an error.
      console.error(errorMessage, ...errorStyles);
    }
  });

  return shaderModule;
}

class PBRShaderModule {
  constructor(device, defines) {
    this.id = NEXT_SHADER_ID++;

    this.vertexModule = createShaderModuleDebug(device, WEBGPU_VERTEX_SOURCE(defines));
    this.fragmentModule = createShaderModuleDebug(device, WEBGPU_FRAGMENT_SOURCE(defines));
  }
}

const LightSprite = {
  vertexCount: 4,

  vertexSource: `
  var<private> pos : array<vec2<f32>, 4> = array<vec2<f32>, 4>(
    vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 1.0), vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0)
  );

  struct FrameUniforms {
    projectionMatrix : mat4x4<f32>,
    viewMatrix : mat4x4<f32>,
    cameraPosition : vec3<f32>,
  };
  @binding(0) @group(0) var<uniform> frame : FrameUniforms;

  struct Light {
    position : vec3<f32>,
    color : vec3<f32>,
  };

  struct LightUniforms {
    lights : array<Light, 5>,
    lightAmbient : f32,
  };
  @binding(1) @group(0) var<uniform> light : LightUniforms;

  struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) vPos : vec2<f32>,
    @location(1) vColor : vec3<f32>,
  };

  @vertex
  fn main(@builtin(vertex_index) vertexIndex : u32, @builtin(instance_index) instanceIndex : u32) -> VertexOutput {
    let lightSize : f32 = 0.2;

    var output : VertexOutput;

    output.vPos = pos[vertexIndex];
    output.vColor = light.lights[instanceIndex].color;
    var worldPos : vec3<f32> = vec3<f32>(output.vPos, 0.0) * lightSize;

    // Generate a billboarded model view matrix
    var bbModelViewMatrix : mat4x4<f32>;
    bbModelViewMatrix[3] = vec4<f32>(light.lights[instanceIndex].position, 1.0);
    bbModelViewMatrix = frame.viewMatrix * bbModelViewMatrix;
    bbModelViewMatrix[0][0] = 1.0;
    bbModelViewMatrix[0][1] = 0.0;
    bbModelViewMatrix[0][2] = 0.0;

    bbModelViewMatrix[1][0] = 0.0;
    bbModelViewMatrix[1][1] = 1.0;
    bbModelViewMatrix[1][2] = 0.0;

    bbModelViewMatrix[2][0] = 0.0;
    bbModelViewMatrix[2][1] = 0.0;
    bbModelViewMatrix[2][2] = 1.0;

    output.position = frame.projectionMatrix * bbModelViewMatrix * vec4<f32>(worldPos, 1.0);
    return output;
  }`,

  fragmentSource: `
  struct VertexOutput {
    @location(0) vPos : vec2<f32>,
    @location(1) vColor : vec3<f32>,
  };

  @fragment
  fn main(input : VertexOutput) -> @location(0) vec4<f32> {
    let distToCenter : f32 = length(input.vPos);
    let fade : f32 = (1.0 - distToCenter) * (1.0 / (distToCenter * distToCenter));
    return vec4<f32>(input.vColor * fade, fade);
  }`,
};

export class WebGPURenderer extends Renderer {
  constructor() {
    super();

    this.context = this.canvas.getContext('webgpu');

    this.programs = new Map();

    this.pipelines = new Map(); // Map<String -> GPURenderPipeline>
    this.pipelineMaterials = new WeakMap(); // WeakMap<GPURenderPipeline, Map<Material, Primitive[]>>

    this.opaquePipelines = [];
    this.blendedPipelines = [];
  }

  async init() {
    this.adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance"
    });
    this.device = await this.adapter.requestDevice();

    this.contextFormat = 'bgra8unorm';
    if (navigator.gpu.getPreferredCanvasFormat) {
      this.contextFormat = navigator.gpu.getPreferredCanvasFormat();
    } else if (this.context.getPreferredFormat) {
      this.contextFormat = this.context.getPreferredFormat(this.adapter);
    }

    this.context.configure({
      device: this.device,
      format: this.contextFormat,
      alphaMode: 'opaque',
    });

    this.colorAttachment = {
      // view is acquired and set in onResize.
      view: undefined,
      // resolveTarget is acquired and set in onFrame.
      resolveTarget: undefined,
      clearValue: { r: 0.0, g: 0.0, b: 0.5, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store',
    };

    this.depthAttachment = {
      // view is acquired and set in onResize.
      view: undefined,
      depthClearValue: 1.0,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
    };

    this.renderPassDescriptor = {
      colorAttachments: [this.colorAttachment],
      depthStencilAttachment: this.depthAttachment
    };

    this.frameUniformsBindGroupLayout = this.device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {}
      }]
    });

    this.materialUniformsBindGroupLayout = this.device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {}
      },
      {
        binding: 1, // defaultSampler
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {}
      },
      {
        binding: 2, // baseColorTexture
        visibility: GPUShaderStage.FRAGMENT,
        texture: {}
      },
      {
        binding: 3, // normalTexture
        visibility: GPUShaderStage.FRAGMENT,
        texture: {}
      },
      {
        binding: 4, // metallicRoughnessTexture
        visibility: GPUShaderStage.FRAGMENT,
        texture: {}
      },
      {
        binding: 5, // occlusionTexture
        visibility: GPUShaderStage.FRAGMENT,
        texture: {}
      },
      {
        binding: 6, // emissiveTexture
        visibility: GPUShaderStage.FRAGMENT,
        texture: {}
      }]
    });

    this.primitiveUniformsBindGroupLayout = this.device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {}
      }]
    });

    this.lightUniformsBindGroupLayout = this.device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {}
      }]
    });

    this.pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [
        this.frameUniformsBindGroupLayout, // set 0
        this.materialUniformsBindGroupLayout, // set 1
        this.primitiveUniformsBindGroupLayout, // set 2
        this.lightUniformsBindGroupLayout, // set 3
      ]
    });

    this.frameUniformsBuffer = this.device.createBuffer({
      size: this.frameUniforms.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    });

    this.lightUniformsBuffer = this.device.createBuffer({
      size: this.lightUniforms.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    });

    this.frameUniformBindGroup = this.device.createBindGroup({
      layout: this.frameUniformsBindGroupLayout,
      entries: [{
        binding: 0,
        resource: {
          buffer: this.frameUniformsBuffer,
        },
      }],
    });

    this.lightUniformBindGroup = this.device.createBindGroup({
      layout: this.lightUniformsBindGroupLayout,
      entries: [{
        binding: 0,
        resource: {
          buffer: this.lightUniformsBuffer,
        },
      }],
    });

    // TODO: Will probably need to be per-material later
    this.textureHelper = new GPUTextureHelper(this.device);

    this.blackTextureView = this.textureHelper.generateColorTexture(0, 0, 0, 0).createView();
    this.whiteTextureView = this.textureHelper.generateColorTexture(1.0, 1.0, 1.0, 1.0).createView();
    this.blueTextureView = this.textureHelper.generateColorTexture(0, 0, 1.0, 0).createView();

    this.buildLightSprite();
  }

  buildLightSprite() {
    const lightSpriteBindGroupLayout = this.device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {}
      }, {
        binding: 1,
        visibility: GPUShaderStage.VERTEX,
        buffer: {}
      }]
    });

    this.lightSpriteBindGroup = this.device.createBindGroup({
      layout: lightSpriteBindGroupLayout,
      entries: [{
        binding: 0,
        resource: {
          buffer: this.frameUniformsBuffer,
        },
      }, {
        binding: 1,
        resource: {
          buffer: this.lightUniformsBuffer,
        },
      }],
    });

    this.lightSpritePipeline = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [lightSpriteBindGroupLayout] }),
      vertex: {
        module: createShaderModuleDebug(this.device, LightSprite.vertexSource),
        entryPoint: 'main'
      },
      fragment: {
        module: createShaderModuleDebug(this.device, LightSprite.fragmentSource),
        entryPoint: 'main',
        targets: [{
          format: this.contextFormat,
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one',
            },
            alpha: {
              srcFactor: 'zero',
              dstFactor: 'one',
            },
          }
        }],
      },
      primitive: {
        topology: 'triangle-strip',
        stripIndexFormat: 'uint32',
      },
      depthStencil: {
        format: DEPTH_FORMAT,
        depthWriteEnabled: false,
        depthCompare: 'less',
      },
      multisample: {
        count: SAMPLE_COUNT,
      },
    });
  }

  onResize(width, height) {
    if (!this.device) return;

    const msaaColorTexture = this.device.createTexture({
      size: { width, height },
      sampleCount: SAMPLE_COUNT,
      format: this.contextFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.colorAttachment.view = msaaColorTexture.createView();

    const depthTexture = this.device.createTexture({
      size: { width, height },
      sampleCount: SAMPLE_COUNT,
      format: DEPTH_FORMAT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT
    });
    this.depthAttachment.view = depthTexture.createView();
  }

  async setGltf(gltf) {
    const gl = this.gl;
    const resourcePromises = [];

    for (let bufferView of gltf.bufferViews) {
      resourcePromises.push(this.initBufferView(bufferView));
    }

    for (let image of gltf.images) {
      resourcePromises.push(this.initImage(image));
    }

    for (let sampler of gltf.samplers) {
      this.initSampler(sampler);
    }

    this.initNode(gltf.scene);

    await Promise.all(resourcePromises);

    for (let material of gltf.materials) {
      this.initMaterial(material);
    }

    for (let primitive of gltf.primitives) {
      this.initPrimitive(primitive);
    }

    // Create a bundle we can use to replay our scene drawing each frame
    const renderBundleEncoder = this.device.createRenderBundleEncoder({
      colorFormats: [ this.contextFormat ],
      depthStencilFormat: DEPTH_FORMAT,
      sampleCount: SAMPLE_COUNT
    });

    renderBundleEncoder.setBindGroup(UNIFORM_BLOCKS.FrameUniforms, this.frameUniformBindGroup);
    renderBundleEncoder.setBindGroup(UNIFORM_BLOCKS.LightUniforms, this.lightUniformBindGroup);

    // Opaque primitives first
    for (let pipeline of this.opaquePipelines) {
      this.drawPipelinePrimitives(renderBundleEncoder, pipeline);
    }

    // Blended primitives next
    for (let pipeline of this.blendedPipelines) {
      this.drawPipelinePrimitives(renderBundleEncoder, pipeline);
    }

    // Last, render a sprite for all of the lights
    renderBundleEncoder.setPipeline(this.lightSpritePipeline);
    renderBundleEncoder.setBindGroup(0, this.lightSpriteBindGroup);
    renderBundleEncoder.draw(4, this.lightCount, 0, 0);

    this.renderBundle = renderBundleEncoder.finish();
  }

  async initBufferView(bufferView) {
    let usage = 0;
    if (bufferView.usage.has('vertex')) {
      usage |= GPUBufferUsage.VERTEX;
    }
    if (bufferView.usage.has('index')) {
      usage |= GPUBufferUsage.INDEX;
    }

    if (!usage) {
      return;
    }

    // Oh FFS. Buffer copies have to be 4 byte aligned, I guess. >_<
    const alignedLength = Math.ceil(bufferView.byteLength / 4) * 4;

    const gpuBuffer = this.device.createBuffer({
      size: alignedLength,
      usage: usage | GPUBufferUsage.COPY_DST
    });
    bufferView.renderData.gpuBuffer = gpuBuffer;

    // TODO: Pretty sure this can all be handled more efficiently.
    const copyBuffer = this.device.createBuffer({
      size: alignedLength,
      usage: GPUBufferUsage.COPY_SRC,
      mappedAtCreation: true
    });
    const copyBufferArray = new Uint8Array(copyBuffer.getMappedRange());

    const bufferData = await bufferView.dataView;

    const srcByteArray = new Uint8Array(bufferData.buffer, bufferData.byteOffset, bufferData.byteLength);
    copyBufferArray.set(srcByteArray);
    copyBuffer.unmap();

    const commandEncoder = this.device.createCommandEncoder({});
    commandEncoder.copyBufferToBuffer(copyBuffer, 0, gpuBuffer, 0, alignedLength);
    this.device.queue.submit([commandEncoder.finish()]);
  }

  async initImage(image) {
    //await image.decode();
    const imageBitmap = await createImageBitmap(image);

    if (GENERATE_MIPMAPS) {
      image.gpuTextureView = this.textureHelper.generateMipmappedTexture(imageBitmap).createView();
    } else {
      image.gpuTextureView = this.textureHelper.generateTexture(imageBitmap).createView();
    }
  }

  initSampler(sampler) {
    const samplerDescriptor = {};

    switch (sampler.minFilter) {
      case undefined:
        samplerDescriptor.minFilter = 'linear';
        samplerDescriptor.mipmapFilter = 'linear';
        break;
      case GL.LINEAR:
      case GL.LINEAR_MIPMAP_NEAREST:
        samplerDescriptor.minFilter = 'linear';
        break;
      case GL.NEAREST_MIPMAP_LINEAR:
        samplerDescriptor.mipmapFilter = 'linear';
        break;
      case GL.LINEAR_MIPMAP_LINEAR:
        samplerDescriptor.minFilter = 'linear';
        samplerDescriptor.mipmapFilter = 'linear';
        break;
    }

    if (!sampler.magFilter || sampler.magFilter == GL.LINEAR) {
      samplerDescriptor.magFilter = 'linear';
    }

    switch (sampler.wrapS) {
      case GL.REPEAT:
        samplerDescriptor.addressModeU = 'repeat';
        break;
      case GL.MIRRORED_REPEAT:
        samplerDescriptor.addressModeU = 'mirror-repeat';
        break;
    }

    switch (sampler.wrapT) {
      case GL.REPEAT:
        samplerDescriptor.addressModeV = 'repeat';
        break;
      case GL.MIRRORED_REPEAT:
        samplerDescriptor.addressModeV = 'mirror-repeat';
        break;
    }

    sampler.renderData.gpuSampler = this.device.createSampler(samplerDescriptor);
  }

  initMaterial(material) {
    // Can reuse these for every PBR material
    const materialUniforms = new Float32Array(4 + 4 + 4);
    const baseColorFactor = new Float32Array(materialUniforms.buffer, 0, 4);
    const metallicRoughnessFactor = new Float32Array(materialUniforms.buffer, 4 * 4, 2);
    const emissiveFactor = new Float32Array(materialUniforms.buffer, 8 * 4, 3);

    vec4.copy(baseColorFactor, material.baseColorFactor);
    vec2.copy(metallicRoughnessFactor, material.metallicRoughnessFactor);
    vec3.copy(emissiveFactor, material.emissiveFactor);

    const materialUniformsBuffer = this.device.createBuffer({
      size: materialUniforms.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(materialUniformsBuffer, 0, materialUniforms);

    // FYI: This is how you'd do it without using writeBuffer
    /*const materialUniformsSrcBuffer = this.device.createBuffer({
      size: materialUniforms.byteLength,
      usage: GPUBufferUsage.COPY_SRC,
      mappedAtCreation: true,
    });

    materialUniformsSrcArray = new Float32Array(materialUniformsSrcBuffer.getMappedRange());
    materialUniformsSrcArray.set(materialUniforms);
    materialUniformsSrcBuffer.unmap();

    const commandEncoder = this.device.createCommandEncoder({});
    commandEncoder.copyBufferToBuffer(materialUniformsSrcBuffer, 0, materialUniformsBuffer, 0, materialUniforms.byteLength);
    this.device.queue.submit([commandEncoder.finish()]);*/

    const materialBindGroup = this.device.createBindGroup({
      layout: this.materialUniformsBindGroupLayout,
      entries: [{
        binding: 0,
        resource: {
          buffer: materialUniformsBuffer,
        },
      },
      {
        binding: 1,
        // TODO: Do we really need to pass one sampler per texture for accuracy? :(
        resource: material.baseColorTexture.sampler.renderData.gpuSampler,
      },
      {
        binding: 2,
        resource: material.baseColorTexture ? material.baseColorTexture.image.gpuTextureView : this.whiteTextureView,
      },
      {
        binding: 3,
        resource: material.normalTexture ? material.normalTexture.image.gpuTextureView : this.blueTextureView,
      },
      {
        binding: 4,
        resource: material.metallicRoughnessTexture ? material.metallicRoughnessTexture.image.gpuTextureView : this.whiteTextureView,
      },
      {
        binding: 5,
        resource: material.occlusionTexture ? material.occlusionTexture.image.gpuTextureView : this.whiteTextureView,
      },
      {
        binding: 6,
        resource: material.emissiveTexture ? material.emissiveTexture.image.gpuTextureView : this.blackTextureView,
      }],
    });

    material.renderData.gpuBindGroup = materialBindGroup;
  }

  initPrimitive(primitive) {
    const material = primitive.material;

    function attributeToFormat(attrib) {
      const count = attrib.componentCount > 1 ? `x${attrib.componentCount}` : '';
      const intType = attrib.normalized ? 'norm' : 'int';
      switch(attrib.componentType) {
        case GL.BYTE:
          return `s${intType}8${count}`;
        case GL.UNSIGNED_BYTE:
          return `u${intType}8${count}`;
        case GL.SHORT:
          return `s${intType}16${count}`;
        case GL.UNSIGNED_SHORT:
          return `u${intType}16${count}`;
        case GL.UNSIGNED_INT:
          return `u${intType}32${count}`;
        case GL.FLOAT:
          return `float32${count}`;
      }
    }

    const vertexBuffers = [];
    for (let [bufferView, attributes] of primitive.attributeBuffers) {
      let arrayStride = bufferView.byteStride;

      const attributeLayouts = [];
      for (let attribName in attributes) {
        const attribute = attributes[attribName];
        const format = attributeToFormat(attribute);

        attributeLayouts.push({
          shaderLocation: ATTRIB_MAP[attribName],
          offset: attribute.byteOffset,
          format
        });

        if (!bufferView.byteStride) {
          arrayStride += attribute.packedByteStride;
        }
      }

      vertexBuffers.push({
        arrayStride,
        attributes: attributeLayouts,
      });
    }

    primitive.renderData.gpuBuffers = vertexBuffers;

    if (primitive.indices) {
      primitive.indices.gpuType = primitive.indices.type == GL.UNSIGNED_SHORT ? 'uint16' : 'uint32';
    }

    /*if (primitive.indices && primitive.indices.type == GL.UNSIGNED_SHORT) {
      primitive.renderData.gpuVertexState.indexFormat = 'uint16';
    }*/

    const defines = GetDefinesForPrimitive(primitive);
    defines.LIGHT_COUNT = this.lightCount;

    let key = '';
    for (let define in defines) {
      key += `${define}=${defines[define]},`;
    }

    let program = this.programs.get(key);
    if (!program) {
      program = new PBRShaderModule(this.device, defines);
      this.programs.set(key, program);
    }

    primitive.renderData.gpuShaderModule = program;

    const bufferSize = 16 * 4;

    // TODO: Support multiple instances
    if (primitive.renderData.instances.length) {
      const primitiveUniformsBuffer = this.device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      this.device.queue.writeBuffer(primitiveUniformsBuffer, 0, primitive.renderData.instances[0]);

      const primitiveBindGroup = this.device.createBindGroup({
        layout: this.primitiveUniformsBindGroupLayout,
        entries: [{
          binding: 0,
          resource: {
            buffer: primitiveUniformsBuffer,
          },
        }],
      });

      primitive.renderData.gpuBindGroup = primitiveBindGroup;

      // TODO: This needs some SERIOUS de-duping
      this.createPipeline(primitive);
    }
  }

  createPipeline(primitive) {
    const material = primitive.material;
    const shaderModule = primitive.renderData.gpuShaderModule;
    const buffers = primitive.renderData.gpuBuffers;

    let topology;
    let stripIndexFormat = undefined;
    switch (primitive.mode) {
      case GL.TRIANGLES:
        topology = 'triangle-list';
        break;
      case GL.TRIANGLE_STRIP:
        topology = 'triangle-strip';
        stripIndexFormat = primitive.indices.gpuType;
        break;
      case GL.LINES:
        topology = 'line-list';
        break;
      case GL.LINE_STRIP:
        topology = 'line-strip';
        stripIndexFormat = primitive.indices.gpuType;
        break;
      case GL.POINTS:
        topology = 'point-list';
        break;
      default:
        // LINE_LOOP and TRIANGLE_FAN are straight up unsupported.
        return;
    }
    const cullMode = material.cullFace ? 'back' : 'none';
    let blend = undefined;
    if (material.blend) {
      blend = {
        color: {
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha'
        },
        alpha: {
          srcFactor: 'zero',
          dstFactor: 'one'
        }
      };
    }

    // Generate a key that describes this pipeline's layout/state
    let pipelineKey = `${shaderModule.id}|${topology}|${cullMode}|${material.blend}|`;
    let i = 0;
    for (let vertexBuffer of buffers) {
      pipelineKey += `${i}:${vertexBuffer.arrayStride}`;
      for (let attribute of vertexBuffer.attributes) {
        pipelineKey += `:${attribute.shaderLocation},${attribute.offset},${attribute.format}`;
      }
      pipelineKey += '|'
      i++;
    }

    if (stripIndexFormat) {
      pipelineKey += `${stripIndexFormat}`;
    }

    let pipeline = this.pipelines.get(pipelineKey);

    if (!pipeline) {
      pipeline = this.device.createRenderPipeline({
        layout: this.pipelineLayout,
        vertex: {
          module: shaderModule.vertexModule,
          entryPoint: 'main',
          buffers,
        },
        fragment: {
          module: shaderModule.fragmentModule,
          entryPoint: 'main',
          targets: [{
            format: this.contextFormat,
            blend
          }],
        },

        primitve: {
          topology,
          stripIndexFormat,
          cullMode,
        },
        depthStencil: {
          format: DEPTH_FORMAT,
          depthWriteEnabled: true,
          depthCompare: 'less',
        },
        multisample: {
          count: SAMPLE_COUNT,
        },
      });

      this.pipelines.set(pipelineKey, pipeline);
      if (material.blend) {
        this.blendedPipelines.push(pipeline);
      } else {
        this.opaquePipelines.push(pipeline);
      }
      this.pipelineMaterials.set(pipeline, new Map());
    }

    let pipelineMaterialPrimitives = this.pipelineMaterials.get(pipeline);

    let materialPrimitives = pipelineMaterialPrimitives.get(primitive.material);
    if (!materialPrimitives) {
      materialPrimitives = [];
      pipelineMaterialPrimitives.set(primitive.material, materialPrimitives);
    }

    materialPrimitives.push(primitive);
  }

  initNode(node) {
    for (let primitive of node.primitives) {
      if (!primitive.renderData.instances) {
        primitive.renderData.instances = [];
      }
      primitive.renderData.instances.push(node.worldMatrix);
    }

    for (let childNode of node.children) {
      this.initNode(childNode);
    }
  }

  onFrame(timestamp) {
    // TODO: If we want multisampling this should attach to the resolveTarget,
    // but there seems to be a bug with that right now?
    this.colorAttachment.resolveTarget = this.context.getCurrentTexture().createView();

    // Update the FrameUniforms buffer with the values that are used by every
    // program and don't change for the duration of the frame.
    this.device.queue.writeBuffer(this.frameUniformsBuffer, 0, this.frameUniforms);

    // Update the light unforms as well
    this.device.queue.writeBuffer(this.lightUniformsBuffer, 0, this.lightUniforms);

    const commandEncoder = this.device.createCommandEncoder({});

    const passEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);

    if (this.renderBundle) {
      passEncoder.executeBundles([this.renderBundle]);
    }

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }

  drawPipelinePrimitives(passEncoder, pipeline) {
    passEncoder.setPipeline(pipeline);
    const materialPrimitives = this.pipelineMaterials.get(pipeline);
    for (let [material, primitives] of materialPrimitives) {
      passEncoder.setBindGroup(UNIFORM_BLOCKS.MaterialUniforms, material.renderData.gpuBindGroup);

      for (let primitive of primitives) {
        passEncoder.setBindGroup(UNIFORM_BLOCKS.PrimitiveUniforms, primitive.renderData.gpuBindGroup);

        let i = 0;
        for (let bufferView of primitive.attributeBuffers.keys()) {
          passEncoder.setVertexBuffer(i, bufferView.renderData.gpuBuffer);
          i++;
        }

        if (primitive.indices) {
          passEncoder.setIndexBuffer(primitive.indices.bufferView.renderData.gpuBuffer,
                                     primitive.indices.gpuType, primitive.indices.byteOffset);
          passEncoder.drawIndexed(primitive.elementCount, 1, 0, 0, 0);
        } else {
          passEncoder.draw(primitive.elementCount, 1, 0, 0);
        }
      }
    }
  }
}