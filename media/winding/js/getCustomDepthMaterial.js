
module.exports = (mat, jointTransforms) => {

  return new THREE.ShaderMaterial({
      
      vertexShader: [

      // "uniform mat4 joints["+ jointTransforms.length +"];",

      "attribute vec3 jointWeights;",

      "attribute vec3 jointIndices;",

      'uniform sampler2D jointTexture;',

      'uniform vec2 jointTextureDim;',

      'void main() {',


      "mat4 jointMatrix = mat4( 0.0 );",

      "vec3 jw = normalize(jointWeights.xyz);",

      "for(int i=0; i<3; i++){",

      '  vec4 v0 = texture2D( jointTexture, vec2(0.0, jointIndices[i]) / jointTextureDim );',
      '  vec4 v1 = texture2D( jointTexture, vec2(1.0, jointIndices[i]) / jointTextureDim );',
      '  vec4 v2 = texture2D( jointTexture, vec2(2.0, jointIndices[i]) / jointTextureDim );',
      '  vec4 v3 = texture2D( jointTexture, vec2(3.0, jointIndices[i]) / jointTextureDim );',
      
      '  jointMatrix += jw[i] * mat4(v0, v1, v2, v3);',

      "}",

      'vec3 transformed = vec3( position );',

      'vec4 worldPosition = modelMatrix * jointMatrix * vec4( transformed, 1.0 );',
      
      "gl_Position = projectionMatrix * viewMatrix * worldPosition;",

      '}',

      ].join('\n'),
      
      fragmentShader: [

      THREE.ShaderChunk['common'],
      THREE.ShaderChunk['packing'],
      THREE.ShaderChunk['uv_pars_fragment'],
      THREE.ShaderChunk['map_pars_fragment'],
      THREE.ShaderChunk['alphamap_pars_fragment'],
      THREE.ShaderChunk['logdepthbuf_pars_fragment'],
      THREE.ShaderChunk['clipping_planes_pars_fragment'],

      'void main() {',

        THREE.ShaderChunk['clipping_planes_fragment'],

        'vec4 diffuseColor = vec4( 1.0 );',

        THREE.ShaderChunk['map_fragment'],
        THREE.ShaderChunk['alphamap_fragment'],
        THREE.ShaderChunk['alphatest_fragment'],

        THREE.ShaderChunk['logdepthbuf_fragment'],

        'gl_FragColor = packDepthToRGBA( gl_FragCoord.z );',

      '}',
      ].join('\n'),
      
      uniforms: mat.uniforms
  });
};
