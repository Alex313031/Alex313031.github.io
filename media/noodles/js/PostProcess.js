// PostProcess.js
//

var glslify = require('glslify');



var fullScreenMat = new THREE.MeshBasicMaterial({
  color: 'red',
  side: 2
})

var PostProcess = function (options){
  this.usePO2 = false;
  this.width = window.innerWidth;
  this.height = window.innerHeight;


  this.renderTargetOptions = {
    minFilter: THREE.LinearFilter,
    // minFilter: THREE.LinearMipMapLinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
  }


  this.uResolution = {
    type: 'v2',
    value: new THREE.Vector2(this.width, this.height)
  }

  this.uOpacity = {
    type: 'f',
    value: 1
  };

  this.fullScreenVertexShader = glslify('./PostMaterials/PassShader.vert');

  this.fullScreenFragmentShader = glslify('./PostMaterials/PostPassShader.frag')

  this.fullScreenMaterial = new THREE.ShaderMaterial({

      transparent: true,

      blending: 1,

      depthTest: false,

      depthWrite: false,

      side: 0,

      uniforms: {
        'resolution': this.uResolution,
        'opacity': this.uOpacity,
        'tDiffuse': {
          type: 't',
          value: null
        },
      },

      vertexShader: this.fullScreenVertexShader,

      fragmentShader: this.fullScreenFragmentShader
  })


  Object.assign(this, options);

  if(this.usePO2) {

    this.width = THREE.Math.nearestPowerOfTwo (this.width);
    this.height = THREE.Math.nearestPowerOfTwo (this.height);

  }


  // make the rendertargets
  this.readBuffer = new THREE.WebGLRenderTarget(
    this.width,
    this.height,
    this.renderTargetOptions)

  this.writeBuffer = this.readBuffer.clone();


  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry(2, 2), fullScreenMat );
  this.quad.frustumCulled = false;
  this.quad.scale.set(this.width, this.height, 1)

  this.quadScene = new THREE.Scene();
  this.quadScene.add( this.quad );


  // passes
  this.passes = []

  // this.addPass({
  //   fragmentShader: glslify('./PostMaterials/TestPass.frag')
  // })


}



PostProcess.prototype.addPass = function( pass ) {

  // var uniforms =

  pass.uniforms = Object.assign({}, pass.uniforms || {}, {

    tDiffuse: {  type: 't',  value: this.readBuffer },

    resolution: this.uResolution
  })

  pass = Object.assign({

    vertexShader: this.fullScreenVertexShader,

    fragmentShader: this.fullScreenFragmentShader,

  }, pass)


  var mat = new THREE.ShaderMaterial( pass );

  this.passes.push(mat);

  return mat;
}


PostProcess.prototype.pingPong = function(){

  // swap the render targets
  var swapper = this.writeBuffer;
  this.writeBuffer = this.readBuffer;
  this.readBuffer = swapper;

}


PostProcess.prototype.render = function(renderer, scene, camera, renderTarget, clear){

  renderer.render(scene, camera, this.writeBuffer, true );

  this.pingPong();



  this.passes.forEach( (mat, i) => {

    mat.uniforms['tDiffuse'].value = this.readBuffer.texture;

    this.quadScene.overrideMaterial = mat;

    renderer.render(this.quadScene, camera, this.writeBuffer, true );

    this.pingPong();

  });


  this.fullScreenMaterial.uniforms['tDiffuse'].value = this.readBuffer.texture;
  this.quadScene.overrideMaterial = this.fullScreenMaterial;
  renderer.render(this.quadScene, camera, renderTarget, clear !== false );

}



// PostProcess.prototype.drawToScreen = function(renderer, camera, clear){

//   // this.fullScreenMaterial.uniforms['tDiffuse'].value = this.readBuffer.texture;

//   // this.quadScene.overrideMaterial = this.fullScreenMaterial;

//   // renderer.render(this.quadScene, camera, null, clear !== false );
// }


PostProcess.prototype.setSize = function(w, h) {


  if(this.usePO2) {

    w = THREE.Math.nearestPowerOfTwo(w);
    h = THREE.Math.nearestPowerOfTwo(h);

  }

  this.readBuffer.setSize(w, h);
  this.writeBuffer.setSize(w, h);

  this.uResolution.value.set(w, h);

  this.passes.forEach( (pass, i) => {

    if(pass['resolution']) {
      pass['resolution'].value.set(w, h);
    }

  });
}


module.exports = PostProcess;
