
var glslify = require('glslify')

import CustomMaterial from './CustomMaterial.js'

import skinDataToGeometry from './skinDataToGeometry.js'

import JointsToTexture from './JointsToTexture.js'

var Vec3 = CANNON.Vec3
var pos = new Vec3()
var quat = new THREE.Quaternion()
var scl = new Vec3()
var mat4 = new THREE.Matrix4()

var unitBox = new THREE.Mesh(
  new THREE.BoxGeometry(1,1,1),
  new THREE.MeshBasicMaterial({
    color: 'magenta',
    wireframe: true
  }))

var unitSphere = new THREE.Mesh( new THREE.SphereGeometry(1), unitBox.material )

var debugJointMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0.05,0.05,0.05),
  new THREE.MeshBasicMaterial({
    color: 'red',
    wireframe: false
  }) )

var cw = undefined


// this needs dome work...
var getUpVec = (v0, v1) => {

  var upVec = new Vec3();
  v0.cross( v1 || Vec3.UNIT_X, upVec )
  // upVec.normalize()
  return upVec;

}


var j2t = new JointsToTexture()
var bodyMap = {}

class SkinManager {

  constructor(cannonWrapper, options) {

    Object.assign( this, {

      skins: [],

      bodies: [],

      cw: cannonWrapper,

      group: new THREE.Object3D(),

      debug: false,

      fragmentShader: this.getFragmentShader(), //

      // smoothing: 0.5

    }, options || {} )

    cw = this.cw

  }


  update() {

    j2t.update()

  }


  buildSkin( json, options ) {

    var jointIndexOffset = j2t.getJointCount()

    options = Object.assign( {
      fragmentShader: THREE.ShaderLib['normal'].fragmentShader,
      constraintUp: Vec3.UNIT_Y,
      // offset: new THREE.Matrix4()
      debug: this.debug
    }, options || {} )

    // make our geometry forst thing, before we do anything else. don't fuck around
    let g = skinDataToGeometry( json, 0 )

    // move on to the details
    bodyMap = {}

    var debug = this.debug

    // ADD THE RIGID BODIES
    this.addBodies( json, options.offset, this.debug )

    // ADD THE JOINTS
    this.addJointsFromJson(json, debug)

    // ADD THE CONSTRAINTS
    this.addConstraintsFromJson( json, options.constraintUp )

    // make the skin
    let mat = new CustomMaterial({
      wireframe: this.debug,
      uniforms: {
        jointTexture: j2t.texture,
        jointTextureDim: j2t.textureDim,
        jointOffset: {value: jointIndexOffset }
      },
      vertexShader: this.getVertexShader(),
      fragmentShader: options.fragmentShader
    })

    let m = new THREE.Mesh( g, mat )
    m.frustumCulled = false
    this.group.add( m )
    this.skins.push( m )

    m.bodyMap = bodyMap


    // repostion
    if( options.offset ) {

      let p = new THREE.Vector3();
      let q = new THREE.Quaternion();
      let s = new THREE.Vector3();

      options.offset.decompose(p, q, s);

      for(let i in bodyMap) {

        let body = bodyMap[i]

        body.quaternion.mult(q, body.quaternion);
        body.position.x += p.x * s.x;
        body.position.y += p.y * s.y;
        body.position.z += p.z * s.z;

      }

    }

    return m

  }


  addBodies( json, offset, debug ) {

    var bodies = (json['rigidBodies'] || json['bodies'])

    for(let i in bodies ) {

      let bodyInfo = bodies[i]

      // create the rigid body
      var body = this.createRigidBody( bodyInfo, debug )

      bodyMap[i] = body

    }

  }


  createRigidBody ( bodyInfo, debug ) {

    switch (bodyInfo.type) {

      case "sphere":
        return this.createSphereRigidBody(bodyInfo, debug)

      case "box":
      default:
        return this.createBoxRigidBody(bodyInfo, debug)
    }

  }

  createSphereRigidBody ( bodyInfo, debug ) {

    // get our transforms
    var transform = new THREE.Matrix4().fromArray( bodyInfo['transform'] )
    transform.decompose( pos, quat, scl )

    let radius = bodyInfo['radius']

    let body = cw.addSphere( radius || 1.0, {
      mass: bodyInfo['mass'],
      position: pos,
      quaternion: new CANNON.Quaternion().copy( quat ),
    })

    if(debug) {
      body.mesh = unitSphere.clone()
      body.mesh.scale.multiplyScalar( radius )
      this.group.add( body.mesh )
    }

    return body
  }

  createBoxRigidBody ( bodyInfo, debug ) {

    // box extents
    var extents = new THREE.Vector3().fromArray( bodyInfo['extents'] )
    var halfExtents = new Vec3().copy( extents )
    halfExtents.scale( 0.5, halfExtents )

    // get our transforms
    var transform = new THREE.Matrix4().fromArray( bodyInfo['transform'] )
    transform.decompose( pos, quat, scl )

    let body = cw.addBox( halfExtents, {
      mass: bodyInfo['mass'] || 0,
      position: pos,
      quaternion: new CANNON.Quaternion().copy( quat ),
      // transform: transform
    })


    if(debug) {
      body.mesh = unitBox.clone()
      body.mesh.scale.copy( extents )
      this.group.add( body.mesh )
    }

    return body
  }


  addConstraintsFromJson(json, upVec) {

    for(let i in json['constraints'] ) {

      let c = json['constraints'][i]

      let a = bodyMap[ c['rigidBodyA'] ];
      let b = bodyMap[ c['rigidBodyB'] ];
      let pos = new Vec3(c['translate'][0], c['translate'][1], c['translate'][2] )

      let angle = c['angle'] || 1
      let twistAngle = c['twistAngle'] || 0.33

      var localA = new Vec3();
      var localB = new Vec3();

      a.pointToLocalFrame(pos, localA);
      b.pointToLocalFrame(pos, localB);

      var axisA = localA.clone();
      axisA.normalize()

      var axisB = localB.clone();
      axisB.normalize();
      axisB.negate(axisB);

      var upA = getUpVec( axisA, upVec );
      var upB = getUpVec( axisB, upVec );

      let constraint = new CANNON.ConeTwistConstraint ( a, b, {
          collideConnected: false,
          maxForce: Infinity,
          pivotA: localA,
          pivotB: localB,
          axisA: axisA,
          axisB: axisB,
          upA: upA,
          upB: upB,
          angle: angle,
          twistAngle: twistAngle,
        } );

      cw.addConstraint( constraint )

    }

  }


  addJointsFromJson(json, debug){

    // make the joints and
    var newJoints = json.joints.map( ( j ) => {

      let transform = new THREE.Matrix4().fromArray(j.transform)
      let joint = j2t.addJoint( bodyMap[ j['rigidBody'] ], transform )

      return joint

    });

    // for debugging it helps to have little meshes at the joints
    if(debug) {
      newJoints.forEach( ( j ) => {
        j.debugMesh = debugJointMesh.clone()
        this.group.add( j.debugMesh )
      });
    }

  }


  getVertexShader() {
    return glslify( './SkinPhysical.vert' )
  }

  getFragmentShader() {
    return `
    uniform vec3 diffuse;
    uniform float opacity;

    varying vec4 mvPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    vec3 getColor( float u ) {

      float su = fract(u * 5.0);

      float c = cos(su * 6.28) * 3.0;

      return vec3(c);
    }

    void main() {

      float fr = dot(normalize(mvPosition.xyz), -vNormal);

      // float uVal = fract(vUv.x * 6.0);

      float u = smoothstep(0.0,1.0,vUv.x);

      gl_FragColor = vec4( getColor( u ) * fr * fr, 1.0 );

    }
    `
  }

}


module.exports = SkinManager
