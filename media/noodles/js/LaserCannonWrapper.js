'use strict';

// var CANNON = require( 'cannon' );
//
//


// this is in need of a re-write. pretty much should just be ripped up

var LaserCannonWrapper = function(options){

  options = options || {};

  var fixedTimeStep = options.fixedTimeStep ||  1 / 60; // seconds

  var maxSubSteps = options.maxSubSteps ||  10;

  var world = new CANNON.World();

  // world.broadphase = new CANNON.NaiveBroadphase();

  world.gravity = options.gravity ||  new CANNON.Vec3(0, -982, 0); // m/s²

  world.solver.iterations = options.iterations || 20;

  world.defaultContactMaterial.contactEquationStiffness = 5e6;

  world.defaultContactMaterial.contactEquationRelaxation = 10;


  var bodies = world.bodies;

  var lastTime;

  var v3 = function(x,y,z){ new CANNON.Vec3(x,y,z); };

  function update( time ){

    if(lastTime !== undefined){

       world.step( fixedTimeStep, time - lastTime, maxSubSteps );

    }

    lastTime = time;

  }

  function addBody( shape, params ){

    var body = new CANNON.Body( params );

    body.addShape( shape );

    world.add( body );

    return body;
  }

  function removeBody( body ){

    world.removeBody( body );

  }

  function removeConstraint( constraint ){
    world.removeConstraint(constraint);
  }


  function addConstraint( constraint ){

    world.addConstraint( constraint );

    return constraint;
  }


  function addPointConstraint( bodyA, localPivotA, bodyB, localPivotB, collideConnected, options ){

    var constraint = new CANNON.PointToPointConstraint(
      bodyA,
      localPivotA,
      bodyB,
      localPivotB);

    constraint.collideConnected = collideConnected !== undefined? collideConnected : false;

    return addConstraint( constraint );
  }

  function addHingeConstraint( bodyA, pivotA, axisA, bodyB, pivotB, axisB, maxForce, collideConnected, enableMoter)
  {
    var constraint = new CANNON.HingeConstraint( bodyA, bodyB, {
      pivotA: pivotA,
      pivotB: pivotB,
      axisA: axisA, //new CANNON.Vec3(1,0,0),
      axisB: axisB, //new CANNON.Vec3(1,0,0),
      maxForce: maxForce
    });

    constraint.collideConnected = collideConnected !== undefined? collideConnected : false;

    if(enableMoter === true)  constraint.enableMotor();

    return addConstraint( constraint );
  }

  function addConeConstraint( bodyA, pivotA, axisA, bodyB, pivotB, axisB, maxForce, twistAngle, collideConnected ){

    var constraint = new CANNON.ConeTwistConstraint( bodyA, bodyB, {
        pivotA: pivotA,
        pivotB: pivotB,
        axisA: axisA,
        axisB: axisB,
        maxForce: maxForce || Infinity,
        // collideConnected: collideConnected !== undefined? collideConnected : false
    });

    constraint.twistAngle = twistAngle || 1;

    constraint.collideConnected = collideConnected !== undefined? collideConnected : false;

    return addConstraint( constraint );
  }

  function addLockConstraint( bodyA, bodyB, maxForce, collideConnected ){
    var constraint = new CANNON.LockConstraint ( bodyA, bodyB, {
      maxForce: maxForce
    } );

    constraint.collideConnected = collideConnected !== undefined? collideConnected : false;

    return addConstraint( constraint );
  }

  function addSphere( radius, options ){

    var sphereShape = new CANNON.Sphere( radius );

    return addBody( sphereShape, options );
  }

  function addBox( halfExtents, options ){

    var box = new CANNON.Box( halfExtents || v3( 0.5, 0.5, 0.5 ) );

    return addBody( box, options );
  }

  function addPlane( options ){

    var plane = new CANNON.Plane();

    return addBody( plane, options );

  }

  return {

    world: world,

    gravity: world.gravity,

    bodies: bodies,

    update: update,

    addBody: addBody,

    removeBody: removeBody,

    removeConstraint: removeConstraint,

    addConstraint: addConstraint,

    addPointConstraint: addPointConstraint,

    addConeConstraint: addConeConstraint,

    addHingeConstraint: addHingeConstraint,

    addLockConstraint: addLockConstraint,

    addSphere: addSphere,

    addBox: addBox,

    addPlane: addPlane,

    addBoxMesh: function( boxMesh, options ){

      if(!boxMesh.geometry.boundingBox){
        boxMesh.geometry.computeBoundingBox();
      }

      var extents = boxMesh.geometry.boundingBox.getSize().multiply( boxMesh.scale );

      var halfExtents = new CANNON.Vec3( extents.x * 0.5, extents.y * 0.5, extents.z * 0.5 );

      return addBox( halfExtents, options );

    }

  };

};


module.exports = LaserCannonWrapper;
