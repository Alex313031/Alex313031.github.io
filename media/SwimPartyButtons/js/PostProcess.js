// PostProcess.js

var glslify = require('glslify');



var fullScreenMat = new THREE.MeshBasicMaterial({
  color: 'red',
  side: 2
})

var PostProcess = function (options){

  this.usePO2 = true;

  this.width = window.innerWidth;

  this.height = window.innerHeight;


  this.renderTargetOptions = {
    // minFilter: THREE.LinearFilter,
    minFilter: THREE.LinearMipMapLinearFilter,
    // magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
  }


  this.uResolution = {
    type: 'v2',
    value: new THREE.Vector2(this.width, this.height)
  }

  this.uOpacity = {
    type: 'f',
    value: 1
  };

  this.fullScreenFragmentShader = glslify(`
    #pragma glslify: fxaa = require(glsl-fxaa)
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      vec4 c = fxaa(tDiffuse, vUv * resolution, resolution);
      gl_FragColor = c;//vec4(c.xyz, opacity);
    }
    `);

  this.fullScreenVertexShader = glslify(`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4( position, 1.0 );
    }`);


  // override defaults
  Object.assign(this, options);


  // resize to nearest power of two
  if(this.usePO2) {
    this.width = THREE.Math.nearestPowerOfTwo (this.width);
    this.height = THREE.Math.nearestPowerOfTwo (this.height);
  }


  this.fullScreenMaterial = new THREE.ShaderMaterial({

      transparent: true,

      blending: 0,

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


PostProcess.prototype.doPasses = function(renderer, scene, camera){

  renderer.render(scene, camera, this.writeBuffer, true );

  this.pingPong();

  this.passes.forEach( (mat, i) => {

    mat.uniforms['tDiffuse'].value = this.readBuffer.texture;

    this.quadScene.overrideMaterial = mat;

    renderer.render(this.quadScene, camera, this.writeBuffer, true );

    this.pingPong();

  });
}


PostProcess.prototype.render = function(renderer, scene, camera, renderTarget){

  this.doPasses(renderer, scene, camera);

  this.fullScreenMaterial.uniforms['tDiffuse'].value = this.readBuffer.texture;
  this.quadScene.overrideMaterial = this.fullScreenMaterial;
  renderer.render(this.quadScene, camera, renderTarget, true );

}


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