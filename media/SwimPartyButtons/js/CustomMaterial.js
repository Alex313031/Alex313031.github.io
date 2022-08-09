
var CustomMaterial = function (parameters) {

  parameters = parameters || {}

  THREE.MeshStandardMaterial.call( this );

  this.type = 'CustomMaterial';

  // add standard THREE uniforms
  parameters.uniforms = Object.assign(
    {
      // color: {type: 'c', value: new THREE.Color()}
    },
    THREE.ShaderLib.standard.uniforms,
    parameters.uniforms || {} );


  // set the shaders
  Object.assign(this, {

    vertexShader: THREE.ShaderLib['physical']['vertexShader'],

    fragmentShader: THREE.ShaderLib['physical']['fragmentShader'],

  },  parameters);

  //
  this.setValues(parameters);

}


CustomMaterial.prototype = Object.create( THREE.MeshStandardMaterial.prototype );
CustomMaterial.prototype.constructor = CustomMaterial;
CustomMaterial.prototype.isMeshStandardMaterial = true;

module.exports = CustomMaterial