

var FacingRatioMaterial = function (jointTexture, parameters) {

  parameters = parameters || {}

  THREE.MeshStandardMaterial.call( this );

  this.vertexShader = this.getVertexShader();

  this.fragmentShader = THREE.ShaderLib['physical']['fragmentShader'];
  // this.fragmentShader = THREE.ShaderLib['normal']['fragmentShader'];

  this.type = 'FacingRatioMaterial';

  this.depthPacking = 3201;


  // add standard THREE uniforms
  parameters.uniforms = Object.assign( {

      jointTexture: {type: 't', value: jointTexture.texture},

      jointTextureDim: {type: 'v2', value: new THREE.Vector2( jointTexture.texture.image.width, jointTexture.texture.image.height ) }

    },
    THREE.ShaderLib.standard.uniforms,
    parameters.uniforms || {} );

  Object.assign(this, parameters);

  this.type = 'FacingRatioMaterial';

  this.setValues(parameters);

}



FacingRatioMaterial.prototype = Object.create( THREE.MeshStandardMaterial.prototype );
FacingRatioMaterial.prototype.constructor = FacingRatioMaterial;
FacingRatioMaterial.prototype.MeshStandardMaterial = true;



FacingRatioMaterial.prototype.computeJointMatrix = function () {
  return [
    ' mat4 jointMatrix = mat4( 0.0 );',

    ' vec3 jw = normalize(jointWeights.xyz);',

    ' for(int i=0; i<3; i++){',

    '  vec4 v0 = texture2D( jointTexture, vec2(0.0, jointIndices[i]) / jointTextureDim );',
    '  vec4 v1 = texture2D( jointTexture, vec2(1.0, jointIndices[i]) / jointTextureDim );',
    '  vec4 v2 = texture2D( jointTexture, vec2(2.0, jointIndices[i]) / jointTextureDim );',
    '  vec4 v3 = texture2D( jointTexture, vec2(3.0, jointIndices[i]) / jointTextureDim );',

    '  jointMatrix += jw[i] * mat4(v0, v1, v2, v3);',

    ' }'].join('\n')
}



FacingRatioMaterial.prototype.jointAtrtibutes = function () {

  return [

  'attribute vec3 jointWeights;',

  'attribute vec3 jointIndices;',

  'uniform sampler2D jointTexture;',

  'uniform vec2 jointTextureDim;',
  ].join('\n')

}



FacingRatioMaterial.prototype.getVertexShader = function () {

  return [

    '#define PHYSICAL',

    'varying vec3 vViewPosition;',

    '#ifndef FLAT_SHADED',

    '  varying vec3 vNormal;',

    '#endif',

    THREE.ShaderChunk['common'],
    THREE.ShaderChunk['uv_pars_vertex'],
    THREE.ShaderChunk['uv2_pars_vertex'],
    THREE.ShaderChunk['displacementmap_pars_vertex'],
    THREE.ShaderChunk['color_pars_vertex'],
    THREE.ShaderChunk['fog_pars_vertex'],
    THREE.ShaderChunk['morphtarget_pars_vertex'],
    THREE.ShaderChunk['skinning_pars_vertex'],
    THREE.ShaderChunk['shadowmap_pars_vertex'],
    THREE.ShaderChunk['specularmap_pars_fragment'],
    THREE.ShaderChunk['logdepthbuf_pars_vertex'],
    THREE.ShaderChunk['clipping_planes_pars_vertex'],

    // CUSTOM: joint attributes
    this.jointAtrtibutes(),


    'void main() {',

    // Custom: get the jointMatrix
    this.computeJointMatrix(),


    THREE.ShaderChunk['uv_vertex'],
    THREE.ShaderChunk['uv2_vertex'],
    THREE.ShaderChunk['color_vertex'],


    // CUSTOM: using jointMatrix
    // THREE.ShaderChunk['beginnormal_vertex'],
    'vec3 objectNormal = (jointMatrix * vec4(normal, 0.)).xyz;',

    THREE.ShaderChunk['morphnormal_vertex'],
    THREE.ShaderChunk['skinbase_vertex'],
    THREE.ShaderChunk['skinnormal_vertex'],
    THREE.ShaderChunk['defaultnormal_vertex'],

    '#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED',

    '  vNormal = normalize( transformedNormal );',

    '#endif',


    THREE.ShaderChunk['begin_vertex'],
    THREE.ShaderChunk['displacementmap_vertex'],
    THREE.ShaderChunk['morphtarget_vertex'],
    THREE.ShaderChunk['skinning_vertex'],


    // CUSTOM: using jointMatrix
    // THREE.ShaderChunk['project_vertex'],
    'vec4 mvPosition = modelViewMatrix * jointMatrix * vec4( transformed, 1.0 );',
    'gl_Position = projectionMatrix * mvPosition;',




    THREE.ShaderChunk['logdepthbuf_vertex'],
    THREE.ShaderChunk['clipping_planes_vertex'],

    '  vViewPosition = - mvPosition.xyz;',


    // CUSTOM: using jointMatrix
    // THREE.ShaderChunk['worldpos_vertex'],
    'vec4 worldPosition = modelMatrix * jointMatrix * vec4( transformed, 1.0 );',



    THREE.ShaderChunk['shadowmap_vertex'],
    THREE.ShaderChunk['fog_vertex'],

    '}'].join('\n')
}


FacingRatioMaterial.prototype.getDepthMaterial = function() {

  var depthMat = new THREE.ShaderMaterial({

    side: 1,

    uniforms: this.uniforms,

    // TODO: get THREE packing value
    fragmentShader: '#define DEPTH_PACKING ' + this.depthPacking + ' \n' + THREE.ShaderLib['depth']['fragmentShader'],

    vertexShader: [

      THREE.ShaderChunk['common'],
      THREE.ShaderChunk['uv_pars_vertex'],
      THREE.ShaderChunk['displacementmap_pars_vertex'],
      THREE.ShaderChunk['morphtarget_pars_vertex'],
      THREE.ShaderChunk['skinning_pars_vertex'],
      THREE.ShaderChunk['logdepthbuf_pars_vertex'],
      THREE.ShaderChunk['clipping_planes_pars_vertex'],


      // CUSTOM: joint attributes
      this.jointAtrtibutes(),


      'void main() {',

      // CUSTOM: get the jointMatrix
      this.computeJointMatrix(),


      THREE.ShaderChunk['uv_vertex'],

      THREE.ShaderChunk['skinbase_vertex'],

      THREE.ShaderChunk['begin_vertex'],
      THREE.ShaderChunk['displacementmap_vertex'],
      THREE.ShaderChunk['morphtarget_vertex'],
      THREE.ShaderChunk['skinning_vertex'],


      // CUSTOM: using jointMatrix
      // THREE.ShaderChunk['project_vertex'],
      'vec4 mvPosition = modelViewMatrix * jointMatrix * vec4( transformed, 1.0 );',
      'gl_Position = projectionMatrix * mvPosition;',



      THREE.ShaderChunk['logdepthbuf_vertex'],
      THREE.ShaderChunk['clipping_planes_vertex'],

      '}'].join('\n')
  });


  // depthMat.type = 'MeshDepthMaterial';
  depthMat.isMeshDepthMaterial = true;

  // depthMat.depthPacking = THREE.BasicDepthPacking;

  return depthMat;
}

module.exports = FacingRatioMaterial;
