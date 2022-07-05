// Skin.js

import skinDataToGeometry from './skinDataToGeometry.js'

import Joint from './Joint.js'

import JointMaterial from './JointMaterial.js'

import JointTexture from './JointTexture.js'

import FacingRatioMaterial from './FacingRatioMaterial.js'


var Vec3 = CANNON.Vec3;

var CVEC3 = (v) => {
  return new Vec3().copy(v);
}

const boneMaterial = new THREE.MeshBasicMaterial({
  color: 'cyan',
  wireframe: true,
  transparent: true,
  opacity: 0.5,
  blending: 2
})

var SkinAndBones = function ( json, options ) {

  THREE.Object3D.call( this );

  this.type = 'SkinAndBones';

  this.state = 'default';

  this.life = 1;

  this.cannonWorld = null;

  this.constraintUp = undefined;//Vec3.UNIT_Y

  this.attenuation = 1;

  this.smoothing = 0.5;

  this.bones = [];

  this.constraints = [];

  this.springs = [];

  this.joints = [];

  this.jointMap = {};

  this.jointTexture = null;

  this.raycastMeshes = [];

  this.debug = false;

  this.offset = undefined;

  this.frustumCulled = false;

  this.cannonMaterial = undefined;

  this.fragmentShader = THREE.ShaderLib['normal']['fragmentShader']

  this.onUpdate = (s) => {};

  Object.assign(this, options || {});

  this.load(json, this.offset);

};

SkinAndBones.prototype = Object.create( THREE.Object3D.prototype );

SkinAndBones.prototype.constructor = SkinAndBones;

module.exports = SkinAndBones;


SkinAndBones.prototype.load = function(json, offsetMatrix) {

  // create the joints
  json['joints'].forEach( this.addJoint, this )


  // DEBUG: add mesh to joints
  if(this.debug){
    var jointCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.2,0.2,0.2),
      new THREE.MeshBasicMaterial({
        color: 'red',
        wireframe: true
      }))
    for(let i in this.jointMap) {
      this.jointMap[i].add(jointCube.clone());
    }
  }




  // rigid bodies
  // create the rigid bodies

  var cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    boneMaterial);

  // create the rigid bodies
  for(let i in json['rigidBodies']) {

    let data = json['rigidBodies'][i];

    let b = new THREE.Object3D();
    b.name = i;

    b.applyMatrix(new THREE.Matrix4().fromArray(data['transform']))

    b.updateMatrixWorld(true);
    this.add(b)
    this.bones.push(b)


    let inv = new THREE.Matrix4().getInverse(b.matrixWorld)

    data.joints.forEach( j => {
      this.jointMap[j].applyMatrix(inv);
      b.add(this.jointMap[j])
    }, this)


    // debug rigid body bounds
    let c = cube.clone();
    c.scale.multiply( new THREE.Vector3().fromArray(data['extents']) );
    c.visible = this.debug;
    b.add(c);
    c.skin = this;
    this.raycastMeshes.push(c)


    // let d = c.clone();
    // d.position.y = 0.75;
    // d.scale.set(0.05,0.5,0.05)
    // c.add(d)


    b.body = this.addBoxMesh( c, {
      position: b.position,
      quaternion: b.quaternion,
      mass: data.mass,
      restitution: data.restitution,
      material: this.cannonMaterial
    });

    b.body.skin = this;

    c.body = b.body;
  }




  // set the initial joint offsets
  this.updateMatrixWorld(true);

  this.joints.forEach( j => {
    j.setOffset();
  }, this);

  var getUpVec = v => {

    var upVec = new Vec3();

    v.cross( Vec3.UNIT_X, upVec )

    return upVec;
  }

  // create the constraints
  for(var i in json['constraints']) {

    let c = json["constraints"][i]
    let a = this.getObjectByName(c['rigidBodyA']);
    let b = this.getObjectByName(c['rigidBodyB']);

    if(!a || !b){
      console.log( a, b, c['rigidBodyA'], c['rigidBodyB'] );
      continue;
    }

    var cPos = new Vec3(c['translate'][0], c['translate'][1], c['translate'][2]);
    var localA = new Vec3();
    var localB = new Vec3();

    a.body.pointToLocalFrame(cPos, localA);
    b.body.pointToLocalFrame(cPos, localB);

    var axisA = localA.clone();
    axisA.normalize()
    // axisA.negate(axisA);

    var axisB = localB.clone();
    axisB.normalize();
    axisB.negate(axisB);

    var upA = this.constraintUp ? this.constraintUp : getUpVec(axisA);
    var upB = this.constraintUp ? this.constraintUp : getUpVec(axisB);


    let constraint = new CANNON.ConeTwistConstraint (
      a.body,
      b.body,
      {
        collideConnected: false,
        maxForce: Infinity,
        pivotA: localA,
        pivotB: localB,
        axisA: axisA,
        axisB: axisB,
        upA: upA,
        upB: upB,
        angle: 0.1,
        twistAngle: 0.1,
      } );

    this.addConstraint(constraint)
  }


  // set the initial joint offsets
  this.updateMatrixWorld(true);

  this.joints.forEach( j => {
    j.setOffset();
  }, this);


  // put together the mesh
  let jointTransforms = this.joints.map(j => {
    return j.transform
  })


  let jointTexture = new JointTexture(jointTransforms);
  var jointMaterial = new FacingRatioMaterial(
    jointTexture,
    {
      wireframe: false,
      // opacity: 0.5,
      // transparent: true,
      side: 0,
      // emissive: 0x050505,
      metalness: 0,
      roughness: 1,
      // clearCoat:  0.1,
      clearCoatRoughness: 1,
      fragmentShader: this.fragmentShader
      // reflectivity: 0,
    });




  // create the geometry
  let geometry = this.geometry || skinDataToGeometry(json);

  // let mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
  let mesh = new THREE.Mesh(geometry, jointMaterial);
  mesh.customDepthMaterial = jointMaterial.getDepthMaterial();
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;




  this.add(mesh);
  this.geometry = geometry;
  this.material = jointMaterial;
  this.material = jointMaterial;
  this.mesh = mesh;
  this.jointTexture = jointTexture;

  this.skinLoaded = true;



  this.applyTransformMatrix(offsetMatrix || new THREE.Matrix4());


  this.bones.forEach( b => {
    b.position.copy(b.body.position);
    b.quaternion.copy(b.body.quaternion);
  });


  this.updateJoints();

  return this;

}


SkinAndBones.prototype.addJoint = function(j){

  let joint = new Joint({
    name: j.name,
    transform: new THREE.Matrix4().fromArray(j['transform']),
    rigidBody: j.rigidBody
  })

  this.joints.push(joint);

  this.jointMap[j.name] = joint;

}



SkinAndBones.prototype.updateJoints = function(){

  this.joints.forEach( j => {
    j.updateTransform();
  }, this);

  if(this.jointTexture)  this.jointTexture.update();
}


SkinAndBones.prototype.updateSkin = function(t, i) {



  this.springs.forEach( ( spring ) => {
    spring.applyForce();
  });


  this.updateJoints();


  // rigid bodiy transforms
  let q = new THREE.Quaternion();
  let w = 0;

  this.bones.forEach( (b, i)=>{

    b.body.velocity.x *= this.attenuation;
    b.body.velocity.y *= this.attenuation;
    b.body.velocity.z *= this.attenuation;

    b.body.angularVelocity.x *= this.attenuation;
    b.body.angularVelocity.y *= this.attenuation;
    b.body.angularVelocity.z *= this.attenuation;

    q.copy(b.body.quaternion)
    b.position.lerp(b.body.position, this.smoothing);
    b.quaternion.slerp(q, this.smoothing);

  });

  this.onUpdate(this, t, i)

}



SkinAndBones.prototype.addBoxMesh = function( boxMesh, options ){

  if(!boxMesh.geometry.boundingBox){
    boxMesh.geometry.computeBoundingBox();
  }

  var extents = boxMesh.geometry.boundingBox.getSize().multiply( boxMesh.scale );

  var halfExtents = new CANNON.Vec3( extents.x * 0.5, extents.y * 0.5, extents.z * 0.5 );

  var shape = new CANNON.Box( halfExtents );

  var body = new CANNON.Body( options );

  body.addShape( shape );

  this.cannonWorld.add( body );

  return body

}



SkinAndBones.prototype.addConstraint = function ( constraint ){

  this.cannonWorld.addConstraint( constraint );

  this.constraints.push(constraint);

  return constraint;
}



SkinAndBones.prototype.addSpring = function ( spring ){

  this.springs.push(spring);

  return spring;
}


SkinAndBones.prototype.applyTransformMatrix = function(m4) {

  let p = new THREE.Vector3();
  let q = new THREE.Quaternion();
  let s = new THREE.Vector3();

  m4.decompose(p, q, s);

  this.bones.forEach(bone => {

    bone.body.quaternion.mult(q, bone.body.quaternion);

    bone.body.position.x += p.x * s.x;
    bone.body.position.y += p.y * s.y;
    bone.body.position.z += p.z * s.z;

  })



  this.joints.forEach( j => {
    j.updateTransform();
  }, this);

  if(this.jointTexture)  this.jointTexture.update();
}
