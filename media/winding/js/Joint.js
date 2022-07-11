'use strict';


var Joint = function ( options ) {

  THREE.Object3D.call( this );

  this.type = 'Joint';

  this.offset = new THREE.Matrix4();

  this.transform = new THREE.Matrix4();

  Object.assign(this, options || {});

  this.applyMatrix(this.transform);

  this.setOffset();

};

Joint.prototype = Object.create( THREE.Object3D.prototype );
Joint.prototype.constructor = Joint;

Joint.prototype.setOffset = function(){

  this.updateMatrixWorld();

  this.offset.getInverse( this.matrixWorld );

}

Joint.prototype.updateTransform = function() {

  this.updateMatrixWorld();

  this.transform.copy( this.matrixWorld ).multiply( this.offset ); 

}


module.exports = Joint;
