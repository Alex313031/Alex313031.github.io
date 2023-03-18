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
import { ShaderProgram } from '../webgl-renderer/shader-program.js';
import { WEBGL2_VERTEX_SOURCE, WEBGL2_FRAGMENT_SOURCE, ATTRIB_MAP, SAMPLER_MAP, UNIFORM_BLOCKS, GetDefinesForPrimitive } from '../pbr-shader.js';
import { vec2, vec3, vec4, mat4 } from '../third-party/gl-matrix/src/gl-matrix.js';

export class PBRShaderProgram extends ShaderProgram {
  constructor(gl, defines) {
    super(gl, {
      vertexSource: WEBGL2_VERTEX_SOURCE(defines),
      fragmentSource: WEBGL2_FRAGMENT_SOURCE(defines)
    });

    this.opaqueMaterials = new Map(); // Material -> Primitives
    this.blendedMaterials = new Map(); // Material -> Primitives
  }
}

const LightSprite = {
  vertexCount: 6,
  vertexArray: new Float32Array([
  // x   y
    -1, -1,
    -1,  1,
     1,  1,

     1,  1,
     1, -1,
    -1, -1,
  ]),
  vertexSource: `#version 300 es
  layout(location = ${ATTRIB_MAP.POSITION}) in vec2 POSITION;

  layout(std140) uniform FrameUniforms {
    mat4 projectionMatrix;
    mat4 viewMatrix;
    vec3 cameraPosition;
  };

  struct Light {
    vec3 position;
    vec3 color;
  };

  layout(std140) uniform LightUniforms {
    Light lights[5];
    float lightAmbient;
  };

  const float lightSize = 0.2;

  out vec2 vPos;
  out vec3 vColor;

  void main() {
    vPos = POSITION;
    vColor = lights[gl_InstanceID].color;
    vec3 worldPos = vec3(POSITION, 0.0) * lightSize;

    // Generate a billboarded model view matrix
    mat4 bbModelViewMatrix = mat4(1.0);
    bbModelViewMatrix[3] = vec4(lights[gl_InstanceID].position, 1.0);

    bbModelViewMatrix = viewMatrix * bbModelViewMatrix;
    bbModelViewMatrix[0][0] = 1.0;
    bbModelViewMatrix[0][1] = 0.0;
    bbModelViewMatrix[0][2] = 0.0;

    bbModelViewMatrix[1][0] = 0.0;
    bbModelViewMatrix[1][1] = 1.0;
    bbModelViewMatrix[1][2] = 0.0;

    bbModelViewMatrix[2][0] = 0.0;
    bbModelViewMatrix[2][1] = 0.0;
    bbModelViewMatrix[2][2] = 1.0;

    gl_Position = projectionMatrix * bbModelViewMatrix * vec4(worldPos, 1.0);
  }`,
  fragmentSource: `#version 300 es
  precision highp float;

  in vec2 vPos;
  in vec3 vColor;

  out vec4 outColor;

  void main() {
    float distToCenter = length(vPos);
    float fade = (1.0 - distToCenter) * (1.0 / (distToCenter * distToCenter));
    outColor = vec4(vColor * fade, fade);
  }`
};

export class WebGL2Renderer extends Renderer {
  constructor() {
    super();

    const gl = this.gl = this.canvas.getContext('webgl2', {
      powerPreference: "high-performance"
    });
    gl.clearColor(0.0, 0.5, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.programs = new Map();

    this.frameUniformBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.frameUniformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, this.frameUniforms, gl.DYNAMIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, UNIFORM_BLOCKS.FrameUniforms, this.frameUniformBuffer);

    this.lightUniformBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.lightUniformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, this.lightUniforms, gl.DYNAMIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, UNIFORM_BLOCKS.LightUniforms, this.lightUniformBuffer);

    this.buildLightSprite();
  }

  buildLightSprite() {
    const gl = this.gl;
    this.lightBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lightBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, LightSprite.vertexArray, gl.STATIC_DRAW);

    this.lightProgram = new ShaderProgram(gl, {
      vertexSource: LightSprite.vertexSource,
      fragmentSource: LightSprite.fragmentSource,
      defines: { LIGHT_COUNT: this.lightCount }
    });
    gl.uniformBlockBinding(this.lightProgram.program, this.lightProgram.uniformBlock.LightUniforms, UNIFORM_BLOCKS.LightUniforms);

    this.lightVertexArray = gl.createVertexArray();
    gl.bindVertexArray(this.lightVertexArray);
    gl.enableVertexAttribArray(ATTRIB_MAP.POSITION);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lightBuffer);
    gl.vertexAttribPointer(ATTRIB_MAP.POSITION, 2, gl.FLOAT, false, 8, 0);
    gl.bindVertexArray(null);
  }

  init() {

  }

  onResize(width, height) {
    this.gl.viewport(0, 0, width, height);
  }

  setGltf(gltf) {
    const gl = this.gl;
    const resourcePromises = [];

    for (let bufferView of gltf.bufferViews) {
      if (bufferView.usage.has('vertex')) {
        resourcePromises.push(this.initGLBuffer(bufferView, gl.ARRAY_BUFFER));
      } else if (bufferView.usage.has('index')) {
        resourcePromises.push(this.initGLBuffer(bufferView, gl.ELEMENT_ARRAY_BUFFER));
      }
    }

    for (let image of gltf.images) {
      resourcePromises.push(this.initImage(image));
    }

    for (let sampler of gltf.samplers) {
      this.initSampler(sampler);
    }

    this.initMaterials(gltf.materials);

    for (let primitive of gltf.primitives) {
      this.initPrimitive(primitive);
    }

    this.initNode(gltf.scene);

    return Promise.all(resourcePromises);
  }

  async initGLBuffer(bufferView, target) {
    const gl = this.gl;
    const glBuffer = gl.createBuffer();
    bufferView.renderData.glBuffer = glBuffer;

    const bufferData = await bufferView.dataView;
    gl.bindBuffer(target, glBuffer);
    gl.bufferData(target, bufferData, gl.STATIC_DRAW);
  }

  async initImage(image) {
    const gl = this.gl;
    const glTexture = gl.createTexture();
    image.glTexture = glTexture;

    //await image.decode();
    const imgBitmap = await createImageBitmap(image);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgBitmap);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  initSampler(sampler) {
    const gl = this.gl;
    const glSampler = gl.createSampler();
    sampler.renderData.glSampler = glSampler;

    const minFilter = sampler.minFilter || gl.LINEAR_MIPMAP_LINEAR;
    const wrapS = sampler.wrapS || gl.REPEAT;
    const wrapT = sampler.wrapT || gl.REPEAT;

    gl.samplerParameteri(glSampler, gl.TEXTURE_MAG_FILTER, sampler.magFilter || gl.LINEAR);
    gl.samplerParameteri(glSampler, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_S, wrapS);
    gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_T, wrapT);
  }

  initMaterials(materials) {
    const gl = this.gl;

    const materialUniforms = new Float32Array(4 + 4 + 4 + 4);
    const baseColorFactor = new Float32Array(materialUniforms.buffer, 0, 4);
    const metallicRoughnessFactor = new Float32Array(materialUniforms.buffer, 4 * 4, 2);
    const emissiveFactor = new Float32Array(materialUniforms.buffer, 8 * 4, 3);
    const occlusionStrength = new Float32Array(materialUniforms.buffer, 12 * 4, 1);

    for (let material of materials) {
      vec4.copy(baseColorFactor, material.baseColorFactor);
      vec2.copy(metallicRoughnessFactor, material.metallicRoughnessFactor);
      vec3.copy(emissiveFactor, material.emissiveFactor);
      occlusionStrength[0] = material.occlusionStrength;

      const materialUniformBuffer = gl.createBuffer();
      gl.bindBuffer(gl.UNIFORM_BUFFER, materialUniformBuffer);
      gl.bufferData(gl.UNIFORM_BUFFER, materialUniforms, gl.STATIC_DRAW);

      material.renderData.glUniformBuffer = materialUniformBuffer;
    }
  }

  initPrimitive(primitive) {
    const gl = this.gl;
    const defines = GetDefinesForPrimitive(primitive);
    defines.LIGHT_COUNT = this.lightCount;
    const material = primitive.material;

    primitive.renderData.instances = [];

    let key = '';
    for (let define in defines) {
      key += `${define}=${defines[define]},`;
    }

    let program = this.programs.get(key);
    if (!program) {
      program = new PBRShaderProgram(this.gl, defines);
      this.programs.set(key, program);

      // Once the program is linked we can set the sampler indices and uniform
      // block bind points once and they'll apply for the lifetime of the
      // program.
      program.use();
      for (let samplerName in SAMPLER_MAP) {
        if (program.uniform[samplerName]) {
          this.gl.uniform1i(program.uniform[samplerName], SAMPLER_MAP[samplerName]);
        }
      }

      for (let uniformBlockName in UNIFORM_BLOCKS) {
        if(uniformBlockName in program.uniformBlock) {
          gl.uniformBlockBinding(program.program, program.uniformBlock[uniformBlockName], UNIFORM_BLOCKS[uniformBlockName]);
        }
      }
    }

    const glVertexArray = gl.createVertexArray();
    gl.bindVertexArray(glVertexArray);
    this.bindPrimitive(primitive); // Populates the vertex buffer bindings for the VertexArray
    gl.bindVertexArray(null);
    primitive.renderData.glVertexArray = glVertexArray;

    let primitiveList;
    if (material.blend) {
      primitiveList = program.blendedMaterials.get(material);
      if (!primitiveList) {
        primitiveList = [];
        program.blendedMaterials.set(material, primitiveList);
      }
    } else {
      primitiveList = program.opaqueMaterials.get(material);
      if (!primitiveList) {
        primitiveList = [];
        program.opaqueMaterials.set(material, primitiveList);
      }
    }
    primitiveList.push(primitive);
  }

  initNode(node) {
    for (let primitive of node.primitives) {
      primitive.renderData.instances.push(node.worldMatrix);
    }

    for (let childNode of node.children) {
      this.initNode(childNode);
    }
  }

  bindMaterial(program, material) {
    const gl = this.gl;
    const uniform = program.uniform;

    if (material.cullFace) {
      gl.enable(gl.CULL_FACE);
    } else {
      gl.disable(gl.CULL_FACE);
    }

    gl.bindBufferBase(gl.UNIFORM_BUFFER, UNIFORM_BLOCKS.MaterialUniforms, material.renderData.glUniformBuffer);

    if (material.baseColorTexture) {
      gl.activeTexture(gl.TEXTURE0 + SAMPLER_MAP.baseColorTexture);
      gl.bindTexture(gl.TEXTURE_2D, material.baseColorTexture.image.glTexture);
      gl.bindSampler(SAMPLER_MAP.baseColorTexture, material.baseColorTexture.sampler.renderData.glSampler);
    }

    if (material.normalTexture) {
      gl.activeTexture(gl.TEXTURE0 + SAMPLER_MAP.normalTexture);
      gl.bindTexture(gl.TEXTURE_2D, material.normalTexture.image.glTexture);
      gl.bindSampler(SAMPLER_MAP.normalTexture, material.normalTexture.sampler.renderData.glSampler);
    }

    if (material.metallicRoughnessTexture) {
      gl.activeTexture(gl.TEXTURE0 + SAMPLER_MAP.metallicRoughnessTexture);
      gl.bindTexture(gl.TEXTURE_2D, material.metallicRoughnessTexture.image.glTexture);
      gl.bindSampler(SAMPLER_MAP.metallicRoughnessTexture, material.metallicRoughnessTexture.sampler.renderData.glSampler);
    }

    if (material.occlusionTexture) {
      gl.activeTexture(gl.TEXTURE0 + SAMPLER_MAP.occlusionTexture);
      gl.bindTexture(gl.TEXTURE_2D, material.occlusionTexture.image.glTexture);
      gl.bindSampler(SAMPLER_MAP.occlusionTexture, material.occlusionTexture.sampler.renderData.glSampler);
    }

    if (uniform.emissiveTex) {
      gl.activeTexture(gl.TEXTURE0 + SAMPLER_MAP.emissiveTexture);
      gl.bindTexture(gl.TEXTURE_2D, material.emissiveTexture.image.glTexture);
      gl.bindSampler(SAMPLER_MAP.emissiveTexture, material.emissiveTexture.sampler.renderData.glSampler);
    }
  }

  bindPrimitive(primitive) {
    const gl = this.gl;

    for (let [bufferView, attributes] of primitive.attributeBuffers) {
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferView.renderData.glBuffer);

      for (let attribName in attributes) {
        const attribute = attributes[attribName];
        const attribIndex = ATTRIB_MAP[attribName];
        gl.enableVertexAttribArray(attribIndex);
        gl.vertexAttribPointer(
          attribIndex, attribute.componentCount, attribute.componentType,
          attribute.normalized, bufferView.byteStride, attribute.byteOffset);
      }
    }

    if (primitive.indices) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.indices.bufferView.renderData.glBuffer);
    }
  }

  onFrame(timestamp) {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update the FrameUniforms buffer with the values that are used by every
    // program and don't change for the duration of the frame.
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.frameUniformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, this.frameUniforms, gl.DYNAMIC_DRAW);

    // Update the light unforms as well
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.lightUniformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, this.lightUniforms, gl.DYNAMIC_DRAW);

    // Loop through the render tree to bind and render every primitive instance

    // Opaque primitives first
    for (let program of this.programs.values()) {
      if (program.opaqueMaterials.size) {
        gl.disable(gl.BLEND);
        this.drawRenderTree(program, program.opaqueMaterials);
      }
    }

    // Blended primitives next
    for (let program of this.programs.values()) {
      if (program.blendedMaterials.size) {
        gl.enable(gl.BLEND);
        this.drawRenderTree(program, program.blendedMaterials);
      }
    }

    // Last, render a sprite for all of the lights
    this.lightProgram.use();
    gl.bindVertexArray(this.lightVertexArray);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, LightSprite.vertexCount, this.lightCount);
  }

  drawRenderTree(program, materialList) {
    const gl = this.gl;

    program.use();

    for (let [material, primitives] of materialList) {
      this.bindMaterial(program, material);

      for (let primitive of primitives) {
        gl.bindVertexArray(primitive.renderData.glVertexArray);

        for (let worldMatrix of primitive.renderData.instances) {
          gl.uniformMatrix4fv(program.uniform.modelMatrix, false, worldMatrix);

          // Draw primitive
          if (primitive.indices) {
            gl.drawElements(primitive.mode, primitive.elementCount,
              primitive.indices.type, primitive.indices.byteOffset);
          } else {
            gl.drawArrays(primitive.mode, 0, primitive.elementCount);
          }
        }
      }
    }
    gl.bindVertexArray(null);
  }
}