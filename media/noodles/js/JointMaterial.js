// JointMaterial.js
'use strict'

var glslify = require('glslify');

var JointMaterial = function(options) {

  options = options || {}

  var mat = {

    blending: 2,

    wireframe: false,

    depthTest: true,

    depthWrite: true,

    side: 0,

    lights: true,

    opacity: 1,

    transparent: false,



    // map: options.map,

    // jointTexture: options.jointTexture,



    uniforms: Object.assign( {},
      THREE.UniformsLib.common,
      THREE.UniformsLib.aomap,
      THREE.UniformsLib.lightmap,
      THREE.UniformsLib.emissivemap,
      THREE.UniformsLib.bumpmap,
      THREE.UniformsLib.normalmap,
      THREE.UniformsLib.displacementmap,
      THREE.UniformsLib.fog,
      THREE.UniformsLib.lights,
      {
        color : { value: new THREE.Color( 0xFFFFFF ) },
        emissive : { value: new THREE.Color( 0x111520 ) },
        specular : { value: new THREE.Color( 0x333333 ) },
        shininess: { value: 12 },
        hitVal: {type: 'f', value: 0},
        hitColor: {type: 'c', value: new THREE.Color(0xFF0000)},
        map: {type: 't', value: undefined},
        jointTexture: {type: 't', value: undefined},
        jointTextureDim: {type: 'v2', value: options.jointTextureDim || new THREE.Vector2( 4, 64 ) }
      }
    ),

    vertexShader: [

    '#define PHONG',

    "#define USE_MAP",

    "#define ALPHATEST",

    // "#define FLAT_SHADED",


    'varying vec3 vViewPosition;',

    // '#ifndef FLAT_SHADED',

      'varying vec3 vNormal;',

    // '#endif',


    // "attribute vec3 normal;",

    "attribute vec3 jointWeights;",

    "attribute vec3 jointIndices;",

    'uniform sampler2D jointTexture;',

    'uniform vec2 jointTextureDim;',

    'uniform float hitVal;',

    'varying float vHitVal;',


    THREE.ShaderChunk['common'],
    THREE.ShaderChunk['uv_pars_vertex'],
    THREE.ShaderChunk['uv2_pars_vertex'],
    THREE.ShaderChunk['displacementmap_pars_vertex'],
    THREE.ShaderChunk['envmap_pars_vertex'],
    THREE.ShaderChunk['color_pars_vertex'],
    THREE.ShaderChunk['morphtarget_pars_vertex'],
    THREE.ShaderChunk['skinning_pars_vertex'],
    THREE.ShaderChunk['shadowmap_pars_vertex'],
    THREE.ShaderChunk['logdepthbuf_pars_vertex'],
    THREE.ShaderChunk['clipping_planes_pars_vertex'],

    'void main() {',

      THREE.ShaderChunk['uv_vertex'],
      THREE.ShaderChunk['uv2_vertex'],
      THREE.ShaderChunk['color_vertex'],

      'vHitVal = max(0.0, hitVal * max(0.0,1.5 * (uv.y + 0.1)));',


      // THREE.ShaderChunk['begin_vertex'],
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


      // THREE.ShaderChunk['beginnormal_vertex'],
      'vec3 objectNormal = (jointMatrix * vec4(normal, 0.)).xyz;',

      THREE.ShaderChunk['morphnormal_vertex'],
      THREE.ShaderChunk['skinbase_vertex'],
      THREE.ShaderChunk['skinnormal_vertex'],

      // THREE.ShaderChunk['defaultnormal_vertex'],
      'vec3 transformedNormal = normalMatrix * objectNormal;',

      THREE.ShaderChunk['displacementmap_vertex'],
      THREE.ShaderChunk['morphtarget_vertex'],
      // THREE.ShaderChunk['skinning_vertex'],
      // THREE.ShaderChunk['project_vertex'],


      // THREE.ShaderChunk['worldpos_vertex'],
      // 'vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );',
      'vec4 worldPosition = modelMatrix * jointMatrix * vec4( transformed, 1.0 );',
      "vec4 mvPosition = viewMatrix * worldPosition;",
      "gl_Position = projectionMatrix * mvPosition;",


      THREE.ShaderChunk['logdepthbuf_vertex'],
      THREE.ShaderChunk['clipping_planes_vertex'],


      " vViewPosition = -mvPosition.xyz;",

      'vNormal = normalize( transformedNormal );',

      THREE.ShaderChunk['envmap_vertex'],
      THREE.ShaderChunk['shadowmap_vertex'],

    '}',

    ].join('\n'),

    fragmentShader: [
      '#define PHONG',

      "#define USE_MAP",

      'uniform vec3 diffuse;',
      'uniform vec3 emissive;',
      'uniform vec3 specular;',
      'uniform float shininess;',
      'uniform float opacity;',

      'uniform vec3 hitColor;',
      'varying float vHitVal;',

      THREE.ShaderChunk['common'],
      THREE.ShaderChunk['packing'],
      THREE.ShaderChunk['color_pars_fragment'],
      THREE.ShaderChunk['uv_pars_fragment'],
      THREE.ShaderChunk['uv2_pars_fragment'],
      THREE.ShaderChunk['map_pars_fragment'],
      THREE.ShaderChunk['alphamap_pars_fragment'],
      THREE.ShaderChunk['aomap_pars_fragment'],
      THREE.ShaderChunk['lightmap_pars_fragment'],
      THREE.ShaderChunk['emissivemap_pars_fragment'],
      THREE.ShaderChunk['envmap_pars_fragment'],
      THREE.ShaderChunk['fog_pars_fragment'],
      THREE.ShaderChunk['bsdfs'],
      THREE.ShaderChunk['lights_pars'],
      THREE.ShaderChunk['lights_phong_pars_fragment'],
      THREE.ShaderChunk['shadowmap_pars_fragment'],
      THREE.ShaderChunk['bumpmap_pars_fragment'],
      THREE.ShaderChunk['normalmap_pars_fragment'],
      THREE.ShaderChunk['specularmap_pars_fragment'],
      THREE.ShaderChunk['logdepthbuf_pars_fragment'],
      THREE.ShaderChunk['clipping_planes_pars_fragment'],

      'void main() {',

        // 'gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);',

        THREE.ShaderChunk['clipping_planes_fragment'],

        'vec4 diffuseColor = vec4( diffuse, opacity );',
        'ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );',
        'vec3 totalEmissiveRadiance = emissive;',

        THREE.ShaderChunk['logdepthbuf_fragment'],
        THREE.ShaderChunk['map_fragment'],
        THREE.ShaderChunk['color_fragment'],
        THREE.ShaderChunk['alphamap_fragment'],
        THREE.ShaderChunk['alphatest_fragment'],
        THREE.ShaderChunk['specularmap_fragment'],
        THREE.ShaderChunk['normal_flip'],
        THREE.ShaderChunk['normal_fragment'],
        THREE.ShaderChunk['emissivemap_fragment'],

        // accumulation
        THREE.ShaderChunk['lights_phong_fragment'],
        THREE.ShaderChunk['lights_template'],

        // modulation
        THREE.ShaderChunk['aomap_fragment'],

        'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;',

        THREE.ShaderChunk['envmap_fragment'],

        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',

        THREE.ShaderChunk['premultiplied_alpha_fragment'],
        THREE.ShaderChunk['tonemapping_fragment'],
        THREE.ShaderChunk['encodings_fragment'],
        THREE.ShaderChunk['fog_fragment'],

        // 'gl_FragColor.xyz = mix(gl_FragColor.xyz, hitColor, min(0.66, vHitVal));',

      '}',
    ].join( "\n" )

  };


  Object.assign(mat, options || {});

  THREE.ShaderMaterial.call(this, mat);

  this.castShadow = true;

  this.needsUpdate = true;


};


/**
 * @extends {THREE.ShaderMaterial}
 */
JointMaterial.prototype = Object.create(
    THREE.ShaderMaterial.prototype);


/**
 * common js
 */
module.exports = JointMaterial;
