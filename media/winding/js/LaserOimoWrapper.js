// LaserOimoWrapper.js

'use strict'

var LaserOimoWrapper = function( options ){

  options = options || {};

  this.bodies = [];



  // TimeStep, BroadPhaseType, Iterations, NoStat 
  this.world = new OIMO.World( options.timeStep || 1/60, 2, options.iterations || 10);
  // this.world = new OIMO.World();
  this.world.worldscale(100);

  this.gravity = this.world.gravity;

  this.defaultConfig = [
    1, // The density of the shape.
    0.4, // The coefficient of friction of the shape.
    0.25, // The coefficient of restitution of the shape.
    1, // The bits of the collision groups to which the shape belongs.
    0xffffffff // The bits of the collision groups with which the shape collides.
  ];

  this.defaultAxis = new OIMO.Vec3(1,0,0);



  for(var i in options){
    this[i] = options[i];
  }
  
}


LaserOimoWrapper.prototype.update = function(){
  this.world.step();

  // update mesh positions
}



LaserOimoWrapper.prototype.removeBody = function( b ){

  this.world.removeRigidBody( b );

}


LaserOimoWrapper.prototype.makeConfig = function(options) {
  let config = this.defaultConfig.slice();

  if(options.density !== undefined)       config[0] = options.density;
  if(options.friction !== undefined)      config[1] = options.friction;
  if(options.restitution !== undefined)   config[2] = options.restitution;
  if(options.belongsTo !== undefined)     config[3] = options.belongsTo;
  if(options.collidesWith !== undefined)  config[4] = options.collidesWith;

  return config;
};



LaserOimoWrapper.prototype.addBox = function(
  dimensions,
  pos,
  euler,
  options){

  let config = this.makeConfig(options);

  var b = {
    type:"box",
    size:[dimensions.x,dimensions.y,dimensions.z],
    pos:[pos.x,pos.y,pos.z],
    rot:[euler.x,euler.y,euler.z],
    move: options.move !== undefined ? options.move : true,
    config: config
  };

  Object.assign(b, options || {});

  return this.world.add( b );
}

LaserOimoWrapper.prototype.addSphere = function(
  rad,
  pos,
  euler,
  options){

  let config = this.makeConfig(options);

  var b = {
    type:"sphere",
    size:[rad,rad,rad],
    pos:[pos.x,pos.y,pos.z],
    rot:[euler.x,euler.y,euler.z],
    move: options.move !== undefined ? options.move : true,
    config: config
  };

  Object.assign(b, options || {});

  return this.world.add( b );
}

LaserOimoWrapper.prototype.addFromMesh = function(m, type, options) {
  
  if(!m.geometry.boundingBox){
    m.geometry.computeBoundingBox();
  }

  var dimensions = m.geometry.boundingBox.getSize().multiply(m.scale);

  var b;

  if(type === 'box' || type === undefined){
    b = this.addBox(dimensions, m.position, m.rotation, options);
  }
  else if( type === 'sphere' ){
    b = this.addSphere( dimensions.x * 0.5, m.position, m.rotation, options);
  }

  return b;
  
};

LaserOimoWrapper.prototype.getJointConfig = function(a, b, options){

  // https://github.com/lo-th/Oimo.js/blob/gh-pages/src/constraint/joint/JointConfig.js

  options = options || {};
  
  var jc = new OIMO.JointConfig();

  jc.body1 = a;
  
  jc.body2 = b;
  
  if(options.pointInA)  jc.localAnchorPoint1.copy( options.pointInA ).multiplyScalar(OIMO.INV_SCALE);
  
  if(options.pointInB)  jc.localAnchorPoint2.copy( options.pointInB ).multiplyScalar(OIMO.INV_SCALE);
  
  if(options.axisA) jc.localAxis1.copy(options.axisA);
  
  if(options.axisB) jc.localAxis2.copy(options.axisB);
  
  jc.allowCollision = options.allowCollision || false;

  return jc;
}


LaserOimoWrapper.prototype.pointToPoint = function( a, b, options ){

  options = options || {};
  
  var jc = this.getJointConfig(a, b, options);

  var joint = new OIMO.DistanceJoint( jc, options.min || 0, options.max || 0.001 );

  this.world.addJoint(joint);

  return joint;
}



LaserOimoWrapper.prototype.removeConstraint = function( constraint ){
  this.world.removeJoint(constraint);
}



LaserOimoWrapper.prototype.hingeJoint = function( a, b, options ){

  options = options || {};

  var spring = options.spring;
  var motor = options.motor;
  var min = (options.min || -60) * OIMO.degtorad;
  var max = (options.max || 60) * OIMO.degtorad;
  
  var jc = this.getJointConfig(a, b, options);

  var joint = new OIMO.HingeJoint( jc, min, max );

  if(spring) joint.limitMotor.setSpring(spring[0], spring[1]);// soften the joint ex: 100, 0.2

  if(motor) joint.limitMotor.setMotor(motor[0], motor[1]);

  this.world.addJoint(joint);

  return joint;
}



LaserOimoWrapper.prototype.distanceJoint = function( a, b, options ){

  options = options || {};

  var spring = options.spring;
  var motor = options.motor;
  var min = (options.min || -60) * OIMO.degtorad;
  var max = (options.max || 60) * OIMO.degtorad;
  
  var jc = this.getJointConfig(a, b, options);

  var joint = new OIMO.DistanceJoint( jc, min, max );

  if(spring) joint.limitMotor.setSpring(spring[0], spring[1]);

  if(motor) joint.limitMotor.setMotor(motor[0], motor[1]);

  this.world.addJoint(joint);

  return joint;
}


LaserOimoWrapper.prototype.slideJoint = function( a, b, options ){

  options = options || {};

  var min = (options.min || -60) * OIMO.degtorad;
  var max = (options.max || 60) * OIMO.degtorad;
  
  var jc = this.getJointConfig(a, b, options);

  var joint = new OIMO.SliderJoint( jc, min, max );

  this.world.addJoint(joint);

  return joint;
}


LaserOimoWrapper.prototype.PrismaticJoint = function( a, b, options ){

  options = options || {};

  var min = (options.min || -60) * OIMO.degtorad;
  var max = (options.max || 60) * OIMO.degtorad;
  
  var jc = this.getJointConfig(a, b, options);

  var joint = new OIMO.PrismaticJoint( jc, min, max );

  this.world.addJoint(joint);

  return joint;
}


LaserOimoWrapper.prototype.ballJoint = function( a, b, options ){

  options = options || {};

  var min = (options.min || -60) * OIMO.degtorad;
  var max = (options.max || 60) * OIMO.degtorad;
  
  var jc = this.getJointConfig(a, b, options);

  var joint = new OIMO.BallAndSocketJoint( jc, min, max );

  this.world.addJoint(joint);

  return joint;
}


module.exports = LaserOimoWrapper;
