// JointMaterial.js
'use strict'

var glslify = require('glslify');

var JointMaterial = function(jointTransforms, options) {

  options = options || {}
  
  var mat = {

    transparent: true,

    blending: 0,

    wireframe: false,

    depthTest: true,

    depthWrite: true,

    side: 0,

    lights: true,

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
        emissive : { value: new THREE.Color( 0x111520 ) },
        specular : { value: new THREE.Color( 0x333333 ) },
        shininess: { value: 12 },
        joints: {type: 'm4v', value: jointTransforms },
        map: {type: 'c', value: options.map},
        hitVal: {type: 'f', value: 0}
      }
    ),

    vertexShader: [

    '#define PHONG',
        
    "#define USE_MAP",

    // "#define FLAT_SHADED",


    'varying vec3 vViewPosition;',

    // '#ifndef FLAT_SHADED',

      'varying vec3 vNormal;',

    // '#endif',


    "uniform mat4 joints[4];",

    // "attribute vec3 normal;",

    "attribute vec3 jointWeights;",

    "attribute vec3 jointIndices;",

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

      'vHitVal = hitVal * position.z / 40.0;',


      // THREE.ShaderChunk['begin_vertex'],
      "mat4 jointMatrix = mat4( 0.0 );",

      "for(int i=0; i<3; i++){",

        'jointMatrix += jointWeights[i] * joints[ int(jointIndices[i]) ];',

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

        'gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);',

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

        'gl_FragColor.xyz = mix(gl_FragColor.xyz, vec3(1.0,0.0,0.0), min(vHitVal, 0.66));',

        THREE.ShaderChunk['premultiplied_alpha_fragment'],
        THREE.ShaderChunk['tonemapping_fragment'],
        THREE.ShaderChunk['encodings_fragment'],
        THREE.ShaderChunk['fog_fragment'],

      '}',
    ].join( "\n" )

  };


  Object.assign(mat, options || {});

  THREE.ShaderMaterial.call(this, mat);

  this.castShadow = true;

  this.needsUpdate = true;


  // console.log(THREE.ShaderChunk['normalmap_pars_fragment']);


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
