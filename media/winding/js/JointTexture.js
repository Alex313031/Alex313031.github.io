

var JointTexture = function(jointTransforms) {
    
  this.transforms = jointTransforms;

  let w = 4; // 4 pixels needed for 1 matrix
  let h = THREE.Math.nextPowerOfTwo(jointTransforms.length);

  this.jointData = new Float32Array(w * h * 4);

  for(var i=0; i<this.transforms.length; i++) {
    this.transforms[i].toArray( this.jointData, i * 16 );
  }

  this.texture = new THREE.DataTexture( this.jointData, w, h, THREE.RGBAFormat, THREE.FloatType );

  this.texture.minFilter = this.texture.magFilter = THREE.NearestFilter;

};



JointTexture.prototype.constructor = JointTexture;



JointTexture.prototype.update = function(){
  
  for(var i=0; i<this.transforms.length; i++) {
  
    this.transforms[i].toArray( this.jointData, i * 16 );
  
  }

  this.texture.needsUpdate = true;

}



module.exports = JointTexture;
