(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// var CANNON = require( 'cannon' );

var CannonController = function CannonController(options) {

  options = options || {};

  var fixedTimeStep = options.fixedTimeStep || 1 / 60; // seconds 
  var maxSubSteps = options.maxSubSteps || 4;

  var world = new CANNON.World();

  world.broadphase = new CANNON.NaiveBroadphase();

  world.gravity = options.gravity || new CANNON.Vec3(0, -982, 0); // m/s² 

  var bodies = world.bodies;

  var lastTime;

  var v3 = function v3(x, y, z) {
    new CANNON.Vec3(x, y, z);
  };

  function update(time) {

    if (lastTime !== undefined) {

      world.step(fixedTimeStep, time - lastTime, maxSubSteps);
    }

    lastTime = time;
  }

  function addBody(shape, params) {

    var body = new CANNON.Body(params);

    body.addShape(shape);

    world.add(body);

    return body;
  }

  function removeBody(body) {

    world.removeBody(body);
  }

  function removeConstraint(constraint) {
    world.removeConstraint(constraint);
  }

  function addConstraint(constraint) {

    world.addConstraint(constraint);

    return constraint;
  }

  function addPointConstraint(bodyA, localPivotA, bodyB, localPivotB, collideConnected, options) {

    var constraint = new CANNON.PointToPointConstraint(bodyA, localPivotA, bodyB, localPivotB);

    constraint.collideConnected = collideConnected !== undefined ? collideConnected : false;

    return addConstraint(constraint);
  }

  function addHingeConstraint(bodyA, pivotA, axisA, bodyB, pivotB, axisB, maxForce, collideConnected, enableMoter) {
    var constraint = new CANNON.HingeConstraint(bodyA, bodyB, {
      pivotA: pivotA,
      pivotB: pivotB,
      axisA: axisA, //new CANNON.Vec3(1,0,0),
      axisB: axisB, //new CANNON.Vec3(1,0,0),
      maxForce: maxForce
    });

    constraint.collideConnected = collideConnected !== undefined ? collideConnected : false;

    if (enableMoter === true) constraint.enableMotor();

    return addConstraint(constraint);
  }

  function addConeConstraint(bodyA, pivotA, axisA, bodyB, pivotB, axisB, maxForce, twistAngle, collideConnected) {

    var constraint = new CANNON.ConeTwistConstraint(bodyA, bodyB, {
      pivotA: pivotA,
      pivotB: pivotB,
      axisA: axisA,
      axisB: axisB,
      maxForce: maxForce || Infinity
    });

    constraint.twistAngle = twistAngle || 1;

    constraint.collideConnected = collideConnected !== undefined ? collideConnected : false;

    return addConstraint(constraint);
  }

  function addLockConstraint(bodyA, bodyB, maxForce, collideConnected) {
    var constraint = new CANNON.LockConstraint(bodyA, bodyB, {
      maxForce: maxForce
    });

    constraint.collideConnected = collideConnected !== undefined ? collideConnected : false;

    return addConstraint(constraint);
  }

  function addSphere(radius, options) {

    var sphereShape = new CANNON.Sphere(radius);

    return addBody(sphereShape, options);
  }

  function addBox(halfExtents, options) {

    var box = new CANNON.Box(halfExtents || v3(0.5, 0.5, 0.5));

    return addBody(box, options);
  }

  function addPlane(options) {

    var plane = new CANNON.Plane();

    return addBody(plane, options);
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

    addBoxMesh: function addBoxMesh(boxMesh, options) {

      if (!boxMesh.geometry.boundingBox) {
        boxMesh.geometry.computeBoundingBox();
      }

      var extents = boxMesh.geometry.boundingBox.getSize().multiply(boxMesh.scale);

      var halfExtents = new CANNON.Vec3(extents.x * 0.5, extents.y * 0.5, extents.z * 0.5);

      return addBox(halfExtents, options);
    }

  };
};

module.exports = CannonController;

},{}],2:[function(require,module,exports){
'use strict';

var Joint = function Joint(options) {

  THREE.Object3D.call(this);

  this.type = 'Joint';

  this.offset = new THREE.Matrix4();

  this.transform = new THREE.Matrix4();

  Object.assign(this, options || {});

  this.applyMatrix(this.transform);

  this.setOffset();
};

Joint.prototype = Object.create(THREE.Object3D.prototype);
Joint.prototype.constructor = Joint;

Joint.prototype.setOffset = function () {

  this.updateMatrixWorld();

  this.offset.getInverse(this.matrixWorld);
};

Joint.prototype.updateTransform = function () {

  this.updateMatrixWorld();

  this.transform.copy(this.matrixWorld).multiply(this.offset);
};

module.exports = Joint;

},{}],3:[function(require,module,exports){
// JointMaterial.js
'use strict';



var JointMaterial = function JointMaterial(jointTransforms, options) {

  options = options || {};

  var mat = {

    transparent: true,

    blending: 0,

    wireframe: false,

    depthTest: true,

    depthWrite: true,

    side: 0,

    lights: true,

    uniforms: Object.assign({}, THREE.UniformsLib.common, THREE.UniformsLib.aomap, THREE.UniformsLib.lightmap, THREE.UniformsLib.emissivemap, THREE.UniformsLib.bumpmap, THREE.UniformsLib.normalmap, THREE.UniformsLib.displacementmap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, {
      emissive: { value: new THREE.Color(0x111520) },
      specular: { value: new THREE.Color(0x333333) },
      shininess: { value: 12 },
      joints: { type: 'm4v', value: jointTransforms },
      map: { type: 'c', value: options.map },
      hitVal: { type: 'f', value: 0 }
    }),

    vertexShader: ['#define PHONG', "#define USE_MAP",

    // "#define FLAT_SHADED",


    'varying vec3 vViewPosition;',

    // '#ifndef FLAT_SHADED',

    'varying vec3 vNormal;',

    // '#endif',


    "uniform mat4 joints[4];",

    // "attribute vec3 normal;",

    "attribute vec3 jointWeights;", "attribute vec3 jointIndices;", 'uniform float hitVal;', 'varying float vHitVal;', THREE.ShaderChunk['common'], THREE.ShaderChunk['uv_pars_vertex'], THREE.ShaderChunk['uv2_pars_vertex'], THREE.ShaderChunk['displacementmap_pars_vertex'], THREE.ShaderChunk['envmap_pars_vertex'], THREE.ShaderChunk['color_pars_vertex'], THREE.ShaderChunk['morphtarget_pars_vertex'], THREE.ShaderChunk['skinning_pars_vertex'], THREE.ShaderChunk['shadowmap_pars_vertex'], THREE.ShaderChunk['logdepthbuf_pars_vertex'], THREE.ShaderChunk['clipping_planes_pars_vertex'], 'void main() {', THREE.ShaderChunk['uv_vertex'], THREE.ShaderChunk['uv2_vertex'], THREE.ShaderChunk['color_vertex'], 'vHitVal = hitVal * position.z / 40.0;',

    // THREE.ShaderChunk['begin_vertex'],
    "mat4 jointMatrix = mat4( 0.0 );", "for(int i=0; i<3; i++){", 'jointMatrix += jointWeights[i] * joints[ int(jointIndices[i]) ];', "}", 'vec3 transformed = vec3( position );',

    // THREE.ShaderChunk['beginnormal_vertex'],
    'vec3 objectNormal = (jointMatrix * vec4(normal, 0.)).xyz;', THREE.ShaderChunk['morphnormal_vertex'], THREE.ShaderChunk['skinbase_vertex'], THREE.ShaderChunk['skinnormal_vertex'],

    // THREE.ShaderChunk['defaultnormal_vertex'],
    'vec3 transformedNormal = normalMatrix * objectNormal;', THREE.ShaderChunk['displacementmap_vertex'], THREE.ShaderChunk['morphtarget_vertex'],
    // THREE.ShaderChunk['skinning_vertex'],
    // THREE.ShaderChunk['project_vertex'],


    // THREE.ShaderChunk['worldpos_vertex'],
    // 'vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );',
    'vec4 worldPosition = modelMatrix * jointMatrix * vec4( transformed, 1.0 );', "vec4 mvPosition = viewMatrix * worldPosition;", "gl_Position = projectionMatrix * mvPosition;", THREE.ShaderChunk['logdepthbuf_vertex'], THREE.ShaderChunk['clipping_planes_vertex'], " vViewPosition = -mvPosition.xyz;", 'vNormal = normalize( transformedNormal );', THREE.ShaderChunk['envmap_vertex'], THREE.ShaderChunk['shadowmap_vertex'], '}'].join('\n'),

    fragmentShader: ['#define PHONG', "#define USE_MAP", 'uniform vec3 diffuse;', 'uniform vec3 emissive;', 'uniform vec3 specular;', 'uniform float shininess;', 'uniform float opacity;', 'varying float vHitVal;', THREE.ShaderChunk['common'], THREE.ShaderChunk['packing'], THREE.ShaderChunk['color_pars_fragment'], THREE.ShaderChunk['uv_pars_fragment'], THREE.ShaderChunk['uv2_pars_fragment'], THREE.ShaderChunk['map_pars_fragment'], THREE.ShaderChunk['alphamap_pars_fragment'], THREE.ShaderChunk['aomap_pars_fragment'], THREE.ShaderChunk['lightmap_pars_fragment'], THREE.ShaderChunk['emissivemap_pars_fragment'], THREE.ShaderChunk['envmap_pars_fragment'], THREE.ShaderChunk['fog_pars_fragment'], THREE.ShaderChunk['bsdfs'], THREE.ShaderChunk['lights_pars'], THREE.ShaderChunk['lights_phong_pars_fragment'], THREE.ShaderChunk['shadowmap_pars_fragment'], THREE.ShaderChunk['bumpmap_pars_fragment'], THREE.ShaderChunk['normalmap_pars_fragment'], THREE.ShaderChunk['specularmap_pars_fragment'], THREE.ShaderChunk['logdepthbuf_pars_fragment'], THREE.ShaderChunk['clipping_planes_pars_fragment'], 'void main() {', 'gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);', THREE.ShaderChunk['clipping_planes_fragment'], 'vec4 diffuseColor = vec4( diffuse, opacity );', 'ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );', 'vec3 totalEmissiveRadiance = emissive;', THREE.ShaderChunk['logdepthbuf_fragment'], THREE.ShaderChunk['map_fragment'], THREE.ShaderChunk['color_fragment'], THREE.ShaderChunk['alphamap_fragment'], THREE.ShaderChunk['alphatest_fragment'], THREE.ShaderChunk['specularmap_fragment'], THREE.ShaderChunk['normal_flip'], THREE.ShaderChunk['normal_fragment'], THREE.ShaderChunk['emissivemap_fragment'],

    // accumulation
    THREE.ShaderChunk['lights_phong_fragment'], THREE.ShaderChunk['lights_template'],

    // modulation
    THREE.ShaderChunk['aomap_fragment'], 'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;', THREE.ShaderChunk['envmap_fragment'], 'gl_FragColor = vec4( outgoingLight, diffuseColor.a );', 'gl_FragColor.xyz = mix(gl_FragColor.xyz, vec3(1.0,0.0,0.0), min(vHitVal, 0.66));', THREE.ShaderChunk['premultiplied_alpha_fragment'], THREE.ShaderChunk['tonemapping_fragment'], THREE.ShaderChunk['encodings_fragment'], THREE.ShaderChunk['fog_fragment'], '}'].join("\n")

  };

  Object.assign(mat, options || {});

  THREE.ShaderMaterial.call(this, mat);

  this.castShadow = true;

  this.needsUpdate = true;

  // console.log(THREE.ShaderChunk['normalmap_pars_fragment']);

};

/**
 * @extends {THREE.ShaderMaterial}
 */
JointMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);

/**
 * common js
 */
module.exports = JointMaterial;

},{}],4:[function(require,module,exports){

'use strict';

var _Joint = require('./Joint.js');

var _Joint2 = _interopRequireDefault(_Joint);

var _skinDataToGeometry = require('./skinDataToGeometry.js');

var _skinDataToGeometry2 = _interopRequireDefault(_skinDataToGeometry);

var _CannonController = require('./CannonController.js');

var _CannonController2 = _interopRequireDefault(_CannonController);

var _JointMaterial = require('./JointMaterial.js');

var _JointMaterial2 = _interopRequireDefault(_JointMaterial);

var _randomElement = require('./randomElement.js');

var _randomElement2 = _interopRequireDefault(_randomElement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || function (p) {
  return p.toString() === "[object SafariRemoteNotification]";
}(!window['safari'] || safari.pushNotification);

StartAudioContext(Tone.context, '#container', function () {
  // if(isSafari)  alert('StartAudioContext')
});

var randf = THREE.Math.randFloat;

var Sketch = function Sketch(options) {

  options = options || {};

  var debug = false;

  var elapsedTime = 0;

  var container = options.container || $("#container");

  var globeRad = 10;

  var goalPos = new THREE.Vector3(0, 0, 0);

  var attenuation = 0.99;

  var hingeRange = 60;

  var shadowRes = 2048;

  var gain = new Tone.Volume(0).toMaster();
  gain.set('volume', -15);

  // tone
  var synth = new Tone.PolySynth(3, Tone.Synth).toMaster();
  synth.volume.value = -10;
  synth.set("detune", -1200);

  var dist = new Tone.Chorus(1, 100, 0.5).toMaster();
  var chorus = new Tone.PingPongDelay("4n", 0.05).connect(dist); //.toMaster();
  var duoSynth = new Tone.DuoSynth().connect(chorus);
  duoSynth.toMaster();
  duoSynth.volume.value = -10;

  var notes = ['A1', 'A2', 'A3', 'A4', 'C1', 'C2', 'C3', 'C4', 'E1', 'E2', 'E3', 'E4'];
  var playNote = function playNote() {
    duoSynth.triggerAttackRelease((0, _randomElement2.default)(notes), "16n");
  };

  // colors
  var c0 = new THREE.Color(0xffffff);
  var c1 = new THREE.Color(0xedff00);
  var orig_c0 = c0.clone();
  var orig_c1 = c1.clone();

  // three
  var view = new ThreeView(container); // boiler plate... couldn't this be passed in? then we could do a player...

  var renderer = view.setupRenderer();

  if (!isSafari) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  renderer.setClearColor(0x333333, 0.1);

  var clock = new THREE.Clock();

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(60, view.aspect, 1, 1000);
  camera.position.y = -5;
  camera.position.z = 40;
  camera.lookAt(new THREE.Vector3(camera.position.x, camera.position.y, 0));

  var makeSpot = function makeSpot() {
    var spot = new THREE.SpotLight();

    spot.castShadow = true;
    spot.shadow.mapSize.width = shadowRes;
    spot.shadow.mapSize.height = shadowRes;
    spot.shadow.camera.near = 0.1;
    spot.shadow.camera.far = 100;
    spot.shadow.camera.fov = 60;
    spot.shadow.bias = 0.000001;
    // scene.add( spot );

    return spot;
  };

  var spot = makeSpot();
  spot.color.set(0xBBFFEE).multiplyScalar(0.66);
  spot.position.lerp(camera.position, 0.75);
  spot.position.y += 10;
  spot.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(spot);

  var hemi = new THREE.HemisphereLight(0x555834, 0x181844, 1);
  scene.add(hemi);

  var box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({
    color: 'white',
    wireframe: true,
    side: 2
  }));

  // var oc = new OimoWrapper();
  // oc.gravity.set(0, 0, 0);

  var cc = (0, _CannonController2.default)({
    gravity: new CANNON.Vec3(0, -100, 0),
    maxSubSteps: isSafari ? 1 : 4
  });

  var debugSphere = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshBasicMaterial({
    color: 'red',
    wireframe: true
  }));
  debugSphere.visible = debug;
  debugSphere.position.z = -100;
  scene.add(debugSphere);
  debugSphere.body = cc.addSphere(10, { mass: 0 });

  var dragPlane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300, 10, 10), new THREE.MeshBasicMaterial({
    color: 'magenta',
    wireframe: true
  }));
  dragPlane.visible = false;

  scene.add(dragPlane);

  var dataTex = new THREE.DataTexture(new Uint8Array([255, 0, 255, 0, 255, 255]), 2, 1, THREE.RGBFormat /*, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy */);
  var updateDataTex = function updateDataTex() {

    var colorVals = c0.toArray().concat(c1.toArray());

    for (var i = 0; i < colorVals.length; i++) {
      dataTex.image.data[i] = colorVals[i] * 255;
    }
    dataTex.needsUpdate = true;
  };
  updateDataTex();

  var skinLoader = new THREE.XHRLoader();
  skinLoader.setResponseType('json');

  // debug meshes
  var cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
    color: 'cyan',
    wireframe: true
  }));

  var jointCube = new THREE.Mesh(cube.geometry, new THREE.MeshBasicMaterial({
    color: 'red',
    wireframe: true
  }));
  jointCube.scale.multiplyScalar(2);

  var skins = [];
  var intersectables = [];

  var createSkin = function createSkin(json, geometry) {
    var skin = {
      skinObj: new THREE.Object3D(),
      raycastIntersects: [],
      rigidBodies: [],
      constraints: [],
      loaded: false,
      joints: [],
      geometry: null,
      material: null,
      mesh: null
    };

    var skinObj = skin.skinObj;
    scene.add(skinObj);

    // create the joints
    var jointMap = {};
    var jointMatrices = [];

    json['joints'].forEach(function (j) {

      var joint = new _Joint2.default({
        name: j.name,
        transform: new THREE.Matrix4().fromArray(j['transform']),
        rigidBody: j.rigidBody
      });

      skin.joints.push(joint);

      jointMap[j.name] = joint;

      jointMatrices.push(joint.transform);

      // DEBUG
      if (debug) joint.add(jointCube.clone());
    });

    // create the rigid bodies

    var _loop = function _loop(_i) {

      var data = json['rigidBodies'][_i];

      var b = new THREE.Object3D();
      b.name = _i;
      b.applyMatrix(new THREE.Matrix4().fromArray(data['transform']));
      b.updateMatrixWorld(true);
      skinObj.add(b);
      skin.rigidBodies.push(b);

      var inv = new THREE.Matrix4().getInverse(b.matrixWorld);

      data.joints.forEach(function (j) {
        jointMap[j].applyMatrix(inv);
        b.add(jointMap[j]);
      });

      // debug rigid body bounds
      var c = cube.clone();
      c.scale.multiply(new THREE.Vector3().fromArray(data['extents']));
      c.visible = debug;
      b.add(c);

      // make the rigid body
      b.body = cc.addBoxMesh(c, {
        position: b.position,
        mass: data.mass
      });

      if (_i === 'bulletRigidBodyShape4') {

        b.body.addEventListener('collide', function (e) {

          skin.mesh.material.uniforms.hitVal.value = 2;

          playNote();
        });
      }

      c.body = b.body;
      skin.raycastIntersects.push(c);
    };

    for (var _i in json['rigidBodies']) {
      _loop(_i);
    }

    // create the constraints
    for (var i in json['constraints']) {

      var c = json["constraints"][i];
      var a = skinObj.getObjectByName(c['rigidBodyA']);
      var _b = skinObj.getObjectByName(c['rigidBodyB']);

      var dataA = json['rigidBodies'][c['rigidBodyA']];
      var dataB = json['rigidBodies'][c['rigidBodyB']];

      // TODO: local axis in rigid bodies..? 
      var constraintPos = new THREE.Vector3().fromArray(c['translate']);

      var invA = new THREE.Matrix4().getInverse(a.matrixWorld);
      var invB = new THREE.Matrix4().getInverse(_b.matrixWorld);

      var pointInA = constraintPos.clone().applyMatrix4(invA);
      var pointInB = constraintPos.clone().applyMatrix4(invB);

      var constraint = cc.addConeConstraint(a.body, pointInA, CANNON.Vec3.UNIT_Z, _b.body, pointInB, CANNON.Vec3.UNIT_Z, Infinity);

      constraint.angle = .5;
      constraint.twistAngle = 1;

      skin.constraints.push(constraint);
    }

    // set the initial joint offsets
    skinObj.updateMatrixWorld(true);

    skin.joints.forEach(function (j) {
      j.setOffset();
    });

    // put together the mesh
    var jointTransforms = skin.joints.map(function (j) {
      return j.transform;
    });

    var jointMaterial = new _JointMaterial2.default(jointTransforms, {
      map: dataTex
    });

    var mesh = new THREE.Mesh(geometry, jointMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.customDepthMaterial = new THREE.ShaderMaterial({

      vertexShader: ["uniform mat4 joints[4];", "attribute vec3 jointWeights;", "attribute vec3 jointIndices;", 'void main() {', "mat4 jointMatrix = mat4( 0.0 );", "for(int i=0; i<3; i++){", 'jointMatrix += jointWeights[i] * joints[ int(jointIndices[i]) ];', "}", 'vec3 transformed = vec3( position );', 'vec4 worldPosition = modelMatrix * jointMatrix * vec4( transformed, 1.0 );', "gl_Position = projectionMatrix * viewMatrix * worldPosition;", '}'].join('\n'),

      fragmentShader: [THREE.ShaderChunk['common'], THREE.ShaderChunk['packing'], THREE.ShaderChunk['uv_pars_fragment'], THREE.ShaderChunk['map_pars_fragment'], THREE.ShaderChunk['alphamap_pars_fragment'], THREE.ShaderChunk['logdepthbuf_pars_fragment'], THREE.ShaderChunk['clipping_planes_pars_fragment'], 'void main() {', THREE.ShaderChunk['clipping_planes_fragment'], 'vec4 diffuseColor = vec4( 1.0 );', THREE.ShaderChunk['map_fragment'], THREE.ShaderChunk['alphamap_fragment'], THREE.ShaderChunk['alphatest_fragment'], THREE.ShaderChunk['logdepthbuf_fragment'], 'gl_FragColor = packDepthToRGBA( gl_FragCoord.z );', '}'].join('\n'),

      uniforms: jointMaterial.uniforms
    });

    skinObj.add(mesh);
    skin.geometry = geometry;
    skin.material = jointMaterial;
    skin.material = jointMaterial;
    skin.mesh = mesh;

    skin.rigidBodies.forEach(function (rb) {

      // console.log( rb );

      if (rb.name === 'bulletRigidBodyShape4') {
        rb.body.mesh = skin.mesh;
      }
    });

    skin.loaded = true;

    intersectables = intersectables.concat(skin.raycastIntersects);

    return skin;
  };

  var tempPhong = new THREE.MeshPhongMaterial();
  var tempMesh = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 0.01), tempPhong);
  scene.add(tempMesh);

  tempMesh.position.z = -10;

  skinLoader.load('assets/mesh.json', function (json) {

    var geometry = (0, _skinDataToGeometry2.default)(json);
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
    geometry['attributes']['position'].dynamic = true;

    var step = 10;
    var countX = 8;
    var countY = 9;

    var q = new THREE.Quaternion();
    q.setFromEuler(new THREE.Euler(0, 0, Math.PI * 0.25));
    var q1 = new THREE.Quaternion();
    q1.setFromEuler(new THREE.Euler(0, 0, -Math.PI * 0.25));

    var _loop2 = function _loop2(_i2) {
      var _loop3 = function _loop3(j) {
        var skin = createSkin(json, geometry);
        skins.push(skin);

        skin.rigidBodies.forEach(function (rb) {
          rb.body.position.x += (_i2 - countX * 0.5 + j % 2 * 0.5) * step * 1.44;
          rb.body.position.y += (j - countY * 0.5) * step * 0.72;

          rb.body.quaternion.copy(_i2 % 2 ? q : q1);
        });
      };

      for (var j = 0; j < countY; j++) {
        _loop3(j);
      }
    };

    for (var _i2 = 0; _i2 < countX; _i2++) {
      _loop2(_i2);
    }

    for (var i = 0; i < 1; i++) {
      view.update();
    }
  });

  var updateSkin = function updateSkin(skin) {

    if (skin.loaded) {

      skin.joints.forEach(function (j) {
        j.updateTransform();
      });

      // rigid bodiy transforms
      skin.rigidBodies.forEach(function (b, i) {

        if (b.body) {

          if (b.body.orig_pos) {
            //   b.body.position.copy(b.body.orig_pos);
          }

          b.body.velocity.x *= attenuation;
          b.body.velocity.y *= attenuation;
          b.body.velocity.z *= attenuation;

          b.body.angularVelocity.x *= attenuation;
          b.body.angularVelocity.y *= attenuation;
          b.body.angularVelocity.z *= attenuation;

          b.position.copy(b.body.position);
          b.quaternion.copy(b.body.quaternion);
        }

        if (b.body.mesh) {

          b.body.mesh.material.uniforms.hitVal.value = Math.max(b.body.mesh.material.uniforms.hitVal.value - 0.05, 0.0);
        }
      });

      // skin.geometry['attributes']['normal'].needsUpdate = true;
    }
  };

  view.update = function () {

    if (Tone.context.state && Tone.context.state === "suspended") {
      Tone.context.resume().then(function () {
        console.log("AudioContext resumed!");
        // fire your callback here
      });
    }

    elapsedTime = clock.getElapsedTime();

    TWEEN.update();

    cc.update(elapsedTime);

    // controls.update();

    skins.forEach(function (skin) {

      updateSkin(skin);
    });

    debugSphere.body.velocity.copy(debugSphere.position);
    debugSphere.body.velocity.vsub(debugSphere.body.position);
    debugSphere.body.velocity.z += 30;
    debugSphere.body.velocity.scale(10);

    debugSphere.body.position.x = debugSphere.position.x;
    debugSphere.body.position.y = debugSphere.position.y;
    debugSphere.body.position.z = debugSphere.position.z;
  };

  view.draw = function () {

    renderer.render(scene, camera, null, true);
  };

  view.onResize = function () {

    camera.aspect = view.aspect;
    camera.updateProjectionMatrix();
  };

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var mousedown = false;
  var grabbed = false;
  var draggedBody, dragConstraint;

  var onPress = function onPress(e) {
    mousedown = true;
  };

  var onRelease = function onRelease(e) {
    mousedown = false;

    debugSphere.position.z = -50;
  };

  var onDrag = function onDrag(e) {

    if (mousedown) {

      if (e.type === 'touchmove') {
        mouse.x = e.touches[0].pageX / window.innerWidth * 2 - 1;
        mouse.y = -(e.touches[0].pageY / window.innerHeight) * 2 + 1;
      } else {
        mouse.x = e.pageX / window.innerWidth * 2 - 1;
        mouse.y = -(e.pageY / window.innerHeight) * 2 + 1;
      }

      raycaster.setFromCamera(mouse, camera);

      dragPlane.visible = true;
      var intersects = raycaster.intersectObject(dragPlane);
      dragPlane.visible = false;

      if (intersects.length) {

        var p = intersects[0].point;

        debugSphere.position.copy(p);

        debugSphere.position.z = 10;
      }
    }
  };

  $(window).on('mousedown', onPress);
  $(window).on('mouseup', onRelease);
  $(window).on('mousemove', onDrag);

  container.on('touchstart', onPress);
  container.on('touchend', onRelease);
  container.on('touchmove', onDrag);

  return {
    begin: function begin() {
      view.begin();
    }
  };
};

window.onload = function () {

  var sketch = new Sketch();

  sketch.begin();
};

},{"./CannonController.js":1,"./Joint.js":2,"./JointMaterial.js":3,"./randomElement.js":5,"./skinDataToGeometry.js":6}],5:[function(require,module,exports){
"use strict";

/**
 * returns a random element from an array or object
 * @param  {Array|Object} obj
 * @return {object}
 */
module.exports = function (obj) {

  if (Array.isArray(obj)) {

    return obj[Math.floor(Math.random() * obj.length)];
  } else if (obj instanceof Object) {

    return obj[randElement(Object.keys[obj])];
  }

  return obj;
};

},{}],6:[function(require,module,exports){
'use strict';

// SkinDataToGeometry.js


module.exports = function (json) {

  var faces = json['meshData']['faces'];
  var v = json['meshData']['position'];
  var n = json['meshData']['normal'];
  var uv = json['meshData']['uv'][Object.keys(json['meshData']['uv'])[0]];
  var sw = json['skinWeights'];
  var si = json['skinIndices'];

  var positions = [];
  var normals = [];
  var uvs = [];

  var jointWeights = [];
  var jointIndices = [];

  var addPos = function addPos(p) {
    positions.push(p[0], p[1], p[2]);
  };

  var addNorm = function addNorm(n) {
    normals.push(n[0], n[1], n[2]);
  };

  var addUV = function addUV(uv) {
    uvs.push(uv[0], uv[1]);
  };

  var addJointWeights = function addJointWeights(jw) {
    jointWeights.push(jw[0] || 0, jw[1] || 0, jw[2] || 0);
  };

  var addJointIndices = function addJointIndices(ji) {
    jointIndices.push(ji[0] || 0, ji[1] || 0, ji[2] || 0);
  };

  // interate through the faces
  var v0, v1, v2, i, j;
  faces.forEach(function (f) {

    // iterate through the face triangles
    for (i = 1, j = 2; j < f[0].length; i++, j++) {

      // positions
      addPos(v[f[0][0]]);
      addPos(v[f[0][i]]);
      addPos(v[f[0][j]]);

      // normals
      addNorm(n[f[1][0]]);
      addNorm(n[f[1][i]]);
      addNorm(n[f[1][j]]);

      // uvs
      addUV(uv[f[2][0]]);
      addUV(uv[f[2][i]]);
      addUV(uv[f[2][j]]);

      // joint weights
      addJointWeights(sw[f[0][0]]);
      addJointWeights(sw[f[0][i]]);
      addJointWeights(sw[f[0][j]]);

      // joint indices
      addJointIndices(si[f[0][0]]);
      addJointIndices(si[f[0][i]]);
      addJointIndices(si[f[0][j]]);
    }
  });

  // create the Buffer mesh
  var geometry = new THREE.BufferGeometry();

  geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.addAttribute('orig_position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.addAttribute('orgPos', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
  geometry.addAttribute('jointWeights', new THREE.BufferAttribute(new Float32Array(jointWeights), 3));
  geometry.addAttribute('jointIndices', new THREE.BufferAttribute(new Float32Array(jointIndices), 3));
  geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));

  return geometry;
};

},{}]},{},[4])


//# sourceMappingURL=bundle.js.map
