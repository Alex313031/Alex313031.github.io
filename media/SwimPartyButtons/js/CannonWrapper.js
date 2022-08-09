// CannonWrapper.js

var glslify = require('glslify')

var FloatType = THREE.FloatType
var Quaternion = CANNON.Quaternion
var Vec3 = CANNON.Vec3
var mat4 = new THREE.Matrix4()
var ONES = new THREE.Vector3(1,1,1)
var quat = new THREE.Quaternion()
var pos = new THREE.Vector3()


class CannonWrapper {

  constructor( options ) {

    Object.assign( this, {

      gravity: new Vec3(0, -100, 0),

      fixedTimeStep: 1 / 60,

      maxSubSteps: 10,

      iterations: 10,

      world: undefined,

      lastTime: 0,

      springs: [],

      onUpdate: time => {
        // ...
      },

      updateBodies: (bodies, time) => {

        bodies.forEach( b => {

          if(b.mesh){
            b.mesh.position.copy( b.position )
            b.mesh.quaternion.copy( b.quaternion )
          }

        });

      }

    }, options || {} )

    if(!this.world) {

      this.setupWorld()

    }

    // console.log( this.gravity );

  }


  setupWorld() {

    this.world = this.world || new CANNON.World();

    this.world.gravity = this.gravity

    this.world.solver.iterations = this.iterations

  }

  update ( time ) {

    if(this.lastTime){

      this.world.step( this.fixedTimeStep, time - this.lastTime, this.maxSubSteps )
    }

    this.lastTime = time;

    this.onUpdate( time )

    this.updateBodies( this.world.bodies, time )

    // update springs
    this.springs.forEach( ( spring ) => {
      spring.applyForce();
    });


  }

  addBody( shape, options ){

    var body = new CANNON.Body( Object.assign({
      mass: 1
    }, options || {}) );

    body.addShape( shape );

    this.world.add( body );

    return body;
  }

  removeBody( body ){

    this.world.removeBody( body );

  }


  addConstraint( c ){

    this.world.addConstraint( c );

    return c;
  }

  removeConstraint( c ){

    this.world.removeConstraint( c );

  }



  addPointConstraint( bodyA, localPivotA, bodyB, localPivotB ){


    let c = new CANNON.PointToPointConstraint( bodyA, localPivotA, bodyB, localPivotB );

    return this.addConstraint( c );
  }


  // addConeConstraint( bodyA, pivotA, options ) {

  //   let c = new CANNON.ConeTwistConstraint( bodyA, bodyB );

  //   Object.assign( c, {
  //     pivotA: Vec3.ZERO,
  //     pivotB: Vec3.ZERO,
  //     axisA: Vec3.UNIT_Z,
  //     axisB: Vec3.UNIT_Z,
  //     maxForce: Infinity,
  //     collideConnected: false
  //   }, options || {} )

  //   return this.addConstraint( c );
  // }


  addLockConstraint( bodyA, bodyB, options ){

    var c = new CANNON.LockConstraint ( bodyA, bodyB );

    Object.assign( c, {
      maxForce: Infinity,
      collideConnected: false
    }, options || {} )

    return this.addConstraint( c );
  }



  addSphere( radius, options ){

    return this.addBody( new CANNON.Sphere( radius ), options );

  }

  addBox( halfExtents, options ){

    return this.addBody( new CANNON.Box( halfExtents ), options );

  }

  addPlane( options ){

    return this.addBody( new CANNON.Plane(), options );

  }

  addBoxMesh( m, options ) {

    if(!m.geometry.boundingBox){
      m.geometry.computeBoundingBox();
    }

    var extents = m.geometry.boundingBox.getSize()

    extents.multiply( m.scale ).multiplyScalar( 0.5 )

    let body = this.addBox( new Vec3().copy(extents), Object.assign({
      position: new Vec3().copy(m.position),
      quaternion: new Quaternion().copy( m.quaternion ),
      mass: extents.x * extents.y * extents.z * 2.0
    }, options ) );

    body.mesh = m

    return body

  }

  addSpring( bodyA, bodyB, options ) {

    /*
    localAnchorA: new CANNON.Vec3(0,0,0),
    localAnchorB: new CANNON.Vec3(0,0,0),
    restLength : 0,
    stiffness : 50,
    damping : 1,
     */

    var spring = new CANNON.Spring( bodyA, bodyB, options )

    this.springs.push(spring);

    return spring;
  }

  getBodyCount() {
    return this.world.bodies.length
  }

}

module.exports = CannonWrapper