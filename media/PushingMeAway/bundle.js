(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

// CannonHelper.js

var p = new THREE.Vector3(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3();

var CannonHelper = function () {
  function CannonHelper(options) {
    _classCallCheck(this, CannonHelper);

    // defaults
    options = Object.assign(this, {

      fixedTimeStep: 1 / 60, // seconds

      maxSubSteps: 3,

      lastTime: 0,

      solverIterations: 10,

      world: undefined,

      smoothing: 0.5

    }, options || {});

    // be the world you want to see in the cannon
    if (!this.world) {

      // Setup our world
      var world = new CANNON.World();
      world.quatNormalizeSkip = 0;
      world.quatNormalizeFast = false;
      world.gravity.set(0, -98, 0);
      world.broadphase = new CANNON.NaiveBroadphase();
      world.solver.iterations = this.solverIterations;
      this.world = world;
    }
  }

  // get count(){
  //   return this.world.bodies.length
  // }


  _createClass(CannonHelper, [{
    key: "update",
    value: function update(currentTime) {

      this.world.step(this.fixedTimeStep, currentTime - this.lastTime, this.maxSubSteps);
      this.lastTime = currentTime;

      // iterate through the bodies and update any constrained THREE objects
      this.world.bodies.forEach(function (body) {

        if (body.mesh && body.mesh.visible) {

          if (body.mass > 0) {

            // smoothing
            // body.mesh.position.lerp(body.position, this.smoothing)
            // body.mesh.quaternion.slerp(body.quaternion, this.smoothing)

            // active bodies
            body.mesh.position.copy(body.position);
            body.mesh.quaternion.copy(body.quaternion);
          } else {

            // hacky kinda static velocity
            // body.position.vsub(body.mesh.position, body.velocity)

            // static bodies
            body.mesh.matrixWorld.decompose(p, q, s);
            body.position.copy(p);
            body.quaternion.copy(q);

            // body.position.copy(body.mesh.position);
            // body.quaternion.copy(body.mesh.quaternion);
          }
        }
      });
    }
  }, {
    key: "addSphereMesh",
    value: function addSphereMesh(sphereMesh, options) {
      if (!sphereMesh.geometry.boundingSphere) {
        sphereMesh.geometry.computeBoundingSphere();
      }

      var body = this.addSphere(sphereMesh.geometry.boundingSphere.radius, options);
      body.position.copy(sphereMesh.position);
      body.quaternion.copy(sphereMesh.quaternion);
      body.mesh = sphereMesh;

      sphereMesh.collider = body;

      return body;

      // return this.addSphere( sphereMesh.geometry.boundingSphere.radius, options );
    }
  }, {
    key: "addSphere",
    value: function addSphere(radius, options) {
      return this.addBody(new CANNON.Sphere(radius), options);
    }
  }, {
    key: "addBoxMesh",
    value: function addBoxMesh(boxMesh, options) {

      if (!boxMesh.geometry.boundingBox) {
        boxMesh.geometry.computeBoundingBox();
      }

      var extents = new THREE.Vector3();
      boxMesh.geometry.boundingBox.getSize(extents);
      extents.multiply(boxMesh.scale);

      var halfExtents = new CANNON.Vec3(extents.x * 0.5, extents.y * 0.5, extents.z * 0.5);

      var body = this.addBox(halfExtents, options);
      body.position.copy(boxMesh.position);
      body.quaternion.copy(boxMesh.quaternion);
      body.mesh = boxMesh;

      boxMesh.collider = body;

      return body;
    }
  }, {
    key: "addBox",
    value: function addBox(halfExtents, options) {
      var box = new CANNON.Box(halfExtents || v3(0.5, 0.5, 0.5));
      return this.addBody(box, options);
    }
  }, {
    key: "addPlane",
    value: function addPlane(options) {
      var plane = new CANNON.Plane();
      return this.addBody(plane, options);
    }
  }, {
    key: "addBody",
    value: function addBody(shape, params) {

      var body = new CANNON.Body(Object.assign({
        mass: 1
      }, params));

      body.addShape(shape);
      this.world.add(body);
      return body;
    }
  }, {
    key: "removeBody",
    value: function removeBody(body) {
      this.world.removeBody(body);
      return body;
    }
  }, {
    key: "removeConstraint",
    value: function removeConstraint(constraint) {
      this.world.removeConstraint(constraint);
    }
  }, {
    key: "addConstraint",
    value: function addConstraint(constraint) {
      this.world.addConstraint(constraint);
      return constraint;
    }
  }, {
    key: "addPointConstraint",
    value: function addPointConstraint(bodyA, localPivotA, bodyB, localPivotB, collideConnected, options) {

      var constraint = new CANNON.PointToPointConstraint(bodyA, localPivotA, bodyB, localPivotB);

      constraint.collideConnected = collideConnected !== undefined ? collideConnected : false;

      return this.addConstraint(constraint);
    }
  }, {
    key: "addGround",
    value: function addGround(mesh, options) {

      var q = new CANNON.Quaternion();
      q.copy(mesh.quaternion);

      var p = new CANNON.Vec3();
      p.copy(mesh.position);

      var plane = this.addPlane(Object.assign({
        mass: 0,
        quaternion: q,
        position: p
      }, options || {}));

      plane.mesh = mesh;

      mesh.collider = plane;

      return plane;
    }
  }]);

  return CannonHelper;
}();

module.exports = CannonHelper;

},{}],2:[function(require,module,exports){
"use strict";

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var quat = new THREE.Quaternion();
var scl = new THREE.Vector3(1, 1, 1);

var Joint = function () {
  function Joint(options) {
    _classCallCheck(this, Joint);

    Object.assign(this, {

      transform: new THREE.Matrix4(),

      offset: new THREE.Matrix4(),

      bodyMatrix: new THREE.Matrix4(),

      localMatrix: new THREE.Matrix4(),

      matrixWorld: new THREE.Matrix4(),

      body: null,

      debugMesh: null

    }, options || {});

    this.setup(this.transform);
  }

  _createClass(Joint, [{
    key: "setup",
    value: function setup(transform) {

      this.composeBodyMatrix();

      var invParent = new THREE.Matrix4().getInverse(this.bodyMatrix);

      this.localMatrix.copy(invParent).multiply(transform);

      this.offset.getInverse(transform);
    }
  }, {
    key: "update",
    value: function update() {

      this.updateMatrixWorld();

      if (this.debugMesh) {

        this.matrixWorld.decompose(this.debugMesh.position, this.debugMesh.quaternion, this.debugMesh.scale);
      }

      this.transform.copy(this.matrixWorld).multiply(this.offset);
    }
  }, {
    key: "updateMatrixWorld",
    value: function updateMatrixWorld() {
      this.composeBodyMatrix();
      this.matrixWorld.copy(this.bodyMatrix).multiply(this.localMatrix);
    }
  }, {
    key: "composeBodyMatrix",
    value: function composeBodyMatrix() {

      this.bodyMatrix.compose(this.body.position, quat.copy(this.body.quaternion), scl);
    }
  }]);

  return Joint;
}();

module.exports = Joint;

},{}],3:[function(require,module,exports){
"use strict";

// import * as THREE from 'three';

var ThreeView = function ThreeView(options, rendererOptions) {
  var _this = this;

  //
  rendererOptions = Object.assign({
    antialias: true,
    autoClearColor: false,
    alpha: true
  }, rendererOptions || {});

  // create the porperties in this object
  Object.assign(this, {

    width: window.innerWidth,

    height: window.innerHeight,

    aspect: window.innerWidth / window.innerHeight,

    // renderer: new THREE.WebGLRenderer(),
    renderer: options && options.renderer ? options.renderer : new THREE.WebGLRenderer(rendererOptions),

    setSize: function setSize(w, h) {

      _this.width = w || window.innerWidth;

      _this.height = h || window.innerHeight;

      _this.aspect = _this.width / _this.height;

      if (_this.renderer) {

        _this.renderer.setSize(_this.width, _this.height);
      }
    },

    onResize: function onResize(event) {
      //...
    }

  }, options || {});

  // append the renderer to our container
  if (this.container) {

    if (typeof this.container === 'string') {
      this.container = document.getElementById(this.container);
    }

    this.container.appendChild(this.renderer.domElement);
  }

  (function () {
    var throttle = function throttle(type, name, obj) {
      obj = obj || window;
      var running = false;
      var func = function func() {
        if (running) {
          return;
        }
        running = true;
        requestAnimationFrame(function () {
          obj.dispatchEvent(new CustomEvent(name));
          running = false;
        });
      };
      obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "optimizedResize");
  })();

  // handle event
  var resizeTimeout = null;
  var resizeTimeStep = 50;
  window.addEventListener("optimizedResize", function (event) {
    if (!resizeTimeout) {
      resizeTimeout = setTimeout(function () {
        resizeTimeout = null;
        _this.setSize();
        _this.onResize(event, _this.width, _this.height);
      }, resizeTimeStep);
    }
    // this.setSize()
    // this.onResize( event, this.width, this.height );
  });

  // // window events
  // var resizeTimeout = null
  // var resizeTimeStep = 50
  // window.addEventListener('resize', event => {

  //   if ( !resizeTimeout ) {
  //     resizeTimeout = setTimeout( () => {
  //       resizeTimeout = null;
  //       this.setSize()
  //       this.onResize( event, this.width, this.height );
  //     }, resizeTimeStep);
  //   }
  // })


  // setup
  this.setSize();
};

module.exports = ThreeView;

},{}],4:[function(require,module,exports){
"use strict";

var _sketch = require("./sketch.js");

var _sketch2 = _interopRequireDefault(_sketch);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// var hideLoadingDiv = () => {
//   document.getElementById('loading_message').style.display = 'none'
// }
//

window.onload = function () {

  (0, _sketch2.default)();
};

},{"./sketch.js":5}],5:[function(require,module,exports){
'use strict';

var _saveAs = require('save-as');

var _saveAs2 = _interopRequireDefault(_saveAs);

var _ThreeView = require('./ThreeView.js');

var _ThreeView2 = _interopRequireDefault(_ThreeView);

var _touchEvents = require('./touchEvents.js');

var _touchEvents2 = _interopRequireDefault(_touchEvents);

var _randomElement = require('../lsr/randomElement.js');

var _randomElement2 = _interopRequireDefault(_randomElement);

var _CannonHelper = require('./CannonHelper.js');

var _CannonHelper2 = _interopRequireDefault(_CannonHelper);

var _eases = require('../lsr/eases.js');

var _LilTween = require('../lsr/LilTween.js');

var _LilTween2 = _interopRequireDefault(_LilTween);

var _coolorsToArray = require('../lsr/coolorsToArray.js');

var _coolorsToArray2 = _interopRequireDefault(_coolorsToArray);

var _Joint = require('./Joint.js');

var _Joint2 = _interopRequireDefault(_Joint);

var _boneInfo = require('./static/boneInfo.json');

var _boneInfo2 = _interopRequireDefault(_boneInfo);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }return arr2;
  } else {
    return Array.from(arr);
  }
}
/*

- [ ] ground texture (100km)
- [ ] substance painter textures
- [ ] environment map from cnetroid
- [ ] new color palette
- [ ] smooth the joints
 */

var gltfLoader = new THREE.GLTFLoader();

var elapsedTime = 0;
var timeScale = 1;
var envRendered = false;

var sin = Math.sin;
var cos = Math.cos;
var pow = Math.pow;
var abs = Math.abs;
var PI = Math.PI;
var TWO_PI = Math.PI * 2;
var HALF_PI = Math.PI * 0.5;
var random = Math.random;
var randf = THREE.Math.randFloat;
var randi = THREE.Math.randInt;
var lerp = THREE.Math.lerp;
var mapLinear = THREE.Math.mapLinear;
var clamp = THREE.Math.clamp;
var Vector3 = THREE.Vector3;
var Color = THREE.Color;
var Quaternion = THREE.Quaternion;
var Matrix4 = THREE.Matrix4;

var loadingManager = new THREE.LoadingManager();
var textureLoader = new THREE.TextureLoader(loadingManager);
var jsonLoader = new THREE.FileLoader(loadingManager);
jsonLoader.setResponseType('json');

var coolorPath = 'https://coolors.co/010c26-ba1247-ff1d00-41d6ea-fcfffc';
// coolorPath = 'https://coolors.co/c42936-ce1678-f91890-f940a3-fc80c2'
// var coolorPath = 'https://coolors.co/0c0f0a-ff206e-40c5e6-b3e3f1-ffffff'
// var coolorPath = 'https://coolors.co/0c0f0a-ff206e-fbff12-41ead4-ffffff'
// OUR SKETCH
var Sketch = function Sketch() {

  var coolors = (0, _coolorsToArray2.default)(coolorPath);

  var clock = new THREE.Clock();

  // scene
  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(coolors[0], 150, 350);
  // console.log( scene.fog );

  // camera
  var camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, //aspect
  0.1, 1000);
  camera.position.set(40.78442646420102, 50.130383544812055, 69.72493447423278);
  camera.lookAt(new Vector3(0, 0, 0));

  // view - convenience object to setup the renderer
  var view = new _ThreeView2.default({
    container: 'container'
  });

  var renderer = view.renderer;
  renderer.setClearColor(coolors[0]);
  renderer.autoClear = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // renderer.gammaOutput = true;
  // renderer.physicallyCorrectLights = true;

  // orbit controls
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  controls.enableDamping = true;
  controls.enableKeys = false;
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.maxPolarAngle = PI * 0.45;
  controls.minPolarAngle = PI * 0.25;
  controls.maxDistance = 200;
  controls.minDistance = 25;
  controls.dampingFactor = 0.95;

  // CANNON
  var cannon = new _CannonHelper2.default({
    solverIterations: 6
  });
  cannon.world.gravity.set(0, -40, 0);

  // ground
  var onGroundTexLoad = function onGroundTexLoad(tex) {

    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    var repeatCount = 100;
    tex.repeat.set(repeatCount, repeatCount);
    tex.offset.set(0.5, 0.5);
    tex.anisotropy = 16;
    envRendered = false;
  };
  var groundMap = textureLoader.load('./static/floor.png', onGroundTexLoad);
  // var groundBump = textureLoader.load('./static/floor.png', onGroundTexLoad)
  var groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshStandardMaterial({
    color: coolors[4],
    // map: groundMap,
    bumpMap: groundMap,
    bumpScale: 0.05,
    metalness: 0,
    roughness: 1
  }));

  groundPlane.receiveShadow = true;
  groundPlane.position.y = 0;
  groundPlane.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(groundPlane);
  cannon.addGround(groundPlane);

  var cubeCamera2 = new THREE.CubeCamera(1.5, scene.fog.far, 128);
  cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  // cubeCamera2.renderTarget.texture.mapping = THREE.CubeReflectionMapping;
  scene.add(cubeCamera2);

  var createSpotlight = function createSpotlight(hexVal, intensity) {

    var spotLight = new THREE.SpotLight(hexVal || 0xFFFFFF, intensity);
    spotLight.position.set(0, 20, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.decay = 1;
    spotLight.distance = 100;

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 5;
    spotLight.shadow.camera.far = 50;
    spotLight.shadow.camera.fov = 30;

    scene.add(spotLight);

    return spotLight;
  };

  var spotLight = createSpotlight(0xaaddff, 0.5);
  var spotLightTwo = createSpotlight(0xffddaa, 0.5);
  var lightTargets = [new THREE.Object3D(), new THREE.Object3D()];
  spotLight.target = lightTargets[0];

  var hemi_light = new THREE.HemisphereLight(coolors[0], coolors[4], 0.33);
  scene.add(hemi_light);

  var gradient = [];

  for (var i = 0; i < 16; i++) {
    var c = (0, _randomElement2.default)(coolors);
    gradient.push.apply(gradient, _toConsumableArray(c.toArray().map(function (val) {
      return val * 255;
    })));
  }

  var dataTex = new THREE.DataTexture(new Uint8Array(gradient), 1, gradient.length / 3, THREE.RGBFormat);

  dataTex.wrapS = dataTex.wrapT = THREE.RepeatWrapping;
  dataTex.repeat.set(2, 2);
  dataTex.needsUpdate = true;

  var stripeTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 1, 9, THREE.RGBFormat);

  stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping;
  stripeTex.needsUpdate = true;
  stripeTex.wrapS = stripeTex.wrapT = THREE.ClampToEdgeWrapping;

  var stripeTexTwo = stripeTex.clone();
  stripeTexTwo.needsUpdate = true;
  stripeTexTwo.wrapS = stripeTexTwo.wrapT = THREE.ClampToEdgeWrapping;

  var rad = 2;
  var sphere = new THREE.Mesh(new THREE.SphereGeometry(rad, 21, 21),
  // new THREE.IcosahedronGeometry(rad, 2),
  new THREE.MeshStandardMaterial({
    envMap: cubeCamera2.renderTarget.texture,
    envMapIntensity: 1,
    metalness: 0.75,
    roughness: 0.1,
    emissiveMap: stripeTex,
    emissive: new THREE.Color(0xdddfff)

  }));

  sphere.castShadow = true;
  sphere.receiveShadow = true;

  sphere.position.y = groundPlane.position.y + rad;
  scene.add(sphere);
  cannon.addSphereMesh(sphere);

  var teather = new CANNON.PointToPointConstraint(sphere.collider, sphere.collider.position, groundPlane.collider, CANNON.Vec3.ZERO, 10, {
    collideConnected: true
  });
  cannon.addConstraint(teather);

  // load geometry
  var fbxLoader = new THREE.FBXLoader();
  var skin = null,
      skins = [];

  function handleSkin(skin) {

    skins.push(skin);
    skin.skeleton.joints = [];

    // iterate through the bomnes and create colliders
    var p = new THREE.Vector3();
    var q = new THREE.Quaternion();
    var s = new THREE.Vector3();
    var invMat = new THREE.Matrix4();

    // create the colliders
    for (var i = 0; i < skin.skeleton.bones.length; i++) {

      var bone = skin.skeleton.bones[i];
      if (bone['name'] === "ROOT") {
        skin.skeleton.root = bone;
      }

      for (var j = 0; j < bone.children.length; j++) {

        if (bone.children[j].type === "Mesh") {

          // move the collider mesh into world space
          var m = bone.children[j];
          m.updateMatrixWorld();
          var mat4 = m.matrixWorld.clone();
          mat4.decompose(p, q, s);
          m.position.copy(p);
          m.quaternion.copy(q);
          m.scale.copy(s);

          scene.add(m);
          m.material.wireframe = true;
          m.visible = false;

          // create collider
          bone.collider = cannon.addBoxMesh(m, { mass: 10 });
        }
      }
    };

    // find the non collider ones and add a collider
    skin.skeleton.bones.forEach(function (bone, i) {

      if (bone.collider === undefined) {
        bone.collider = bone.parent.collider;
      }
      if (bone.parent.collider === undefined) {
        bone.parent.collider = bone.collider;
      }
    });

    // constrain between bones [parent]-[child]
    var angle = 0.5;
    var twistAngle = 0.5;

    skin.skeleton.bones.forEach(function (bone, i) {

      if (bone.parent.type === "Bone") {

        if (bone.collider && bone.parent.collider) {

          var wp = new Vector3(0, 0, 0);
          bone.localToWorld(wp);

          var worldSpace = new CANNON.Vec3(wp.x, wp.y, wp.z);

          var a = bone.collider;
          var b = bone.parent.collider;

          var localA = new CANNON.Vec3();
          var localB = new CANNON.Vec3();

          a.pointToLocalFrame(worldSpace, localA);
          b.pointToLocalFrame(worldSpace, localB);

          var axisA = localA.clone();
          axisA.normalize();

          var axisB = localB.clone();
          axisB.normalize();
          axisB.negate(axisB);

          var perpAxis = new CANNON.Vec3();
          localA.cross(CANNON.Vec3.UNIT_Y, perpAxis);

          var constraintType = "ConeTwistConstraint";
          // constraintType = "HingeConstraint"
          // constraintType = "LockConstraint"
          var constraint = new CANNON[constraintType](a, b, {
            collideConnected: false,
            maxForce: Infinity,
            pivotA: localA,
            pivotB: localB,
            axisA: axisA,
            axisB: axisB
            // angle: angle,
            // twistAngle: twistAngle,
          });

          cannon.addConstraint(constraint);

          // var d = debugCube.clone()
          // d.position.copy(localA)
          // a.mesh.add(d)
        } else {
          console.log("shit " + i, bone.parent.collider, bone.collider);
        }
      }
    });

    // JOINTS
    var jointDebug = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: "red", wireframe: true }));

    skin.skeleton.bones.forEach(function (bone, i) {

      bone.updateMatrixWorld();

      bone.matrixWorld.decompose(bone.position, bone.quaternion, bone.scale);

      scene.add(bone);

      skin.skeleton.boneInverses[i] = new THREE.Matrix4();

      // var db = jointDebug.clone()
      // scene.add(db)


      if (bone.collider) {

        var j = new _Joint2.default({
          transform: bone.matrixWorld,
          body: bone.collider
          // debugMesh: db
        });

        skin.skeleton.joints.push(j);
      } else {
        console.log("NO COLLIDER!!: ", bone);
      }
    });

    // cannon.addConstraint(pinConstraint)

    skin.skeleton.bones.forEach(function (bone, i) {

      var blah = _boneInfo2.default[bone.name];

      if (bone.collider && blah) {

        bone.collider.position.copy(blah.position);
        bone.collider.quaternion.copy(blah.quaternion);
      }
    });

    // console.log( "%c OKAY, WE GOT HERE ", 'background: #77ffaaaa; color: #ff00ff');
  }

  function handleFBX(result) {

    scene.add(result);

    skin = result.getObjectByProperty("type", "SkinnedMesh");
    skin.castShadow = true;
    skin.receiveShadow = true;

    skin.material = new THREE.MeshPhysicalMaterial({
      color: coolors[4],
      skinning: true,
      metalness: 0.1,
      roughness: 1,
      clearCoat: 1,
      clearCoatRoughness: 0.1,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: stripeTexTwo,
      emissiveIntensity: 0.9
      // map: dataTex,
      // metalnessMap: dataTex,
      // bumpMap: dataTex,
      // bumpScale: 0.05,
    });

    handleSkin(skin);
  }

  fbxLoader.load('static/test.fbx', handleFBX);

  var scaledTime = 0;

  // UPDATE
  var deltaVec = new CANNON.Vec3();
  var attractPoint = new CANNON.Vec3(0, -10, 0);
  var lastRingTime = 0,
      nextRingTime = 1;
  var p = new THREE.Vector3();
  var q = new THREE.Quaternion();
  var scl = new THREE.Vector3();
  // var smoothing = 0.75
  var update = function update() {

    var deltaTime = clock.getDelta();
    elapsedTime = clock.getElapsedTime();
    scaledTime += deltaTime * timeScale;

    // console.log( deltaTime );

    lightTargets[0].updateMatrixWorld();
    lightTargets[1].updateMatrixWorld();
    lightTargets[0].position.lerp(sphere.position, 0.025);

    cubeCamera2.position.copy(sphere.position);
    cannon.update(elapsedTime);

    var target = sphere.collider.position.clone(); // new CANNON.Vec3(sin(elapsedTime * 0.1), 0, cos(elapsedTime * 0.1))
    target.y = groundPlane.position.y;
    target.x += sin(elapsedTime * 2) * rad * 2;
    target.z += cos(elapsedTime * 2) * rad * 2;

    skins.forEach(function (skin) {

      var ROOT = skin.skeleton.root.collider;
      lightTargets[1].position.lerp(ROOT.position, 0.025);
      spotLightTwo.target = lightTargets[1];

      var delta = new Vector3().copy(ROOT.position);

      delta.sub(sphere.position);
      delta.multiplyScalar(-1000);

      var limit = 7500;
      if (delta.lengthSq() > limit * limit) {
        delta.setLength(limit);
      }

      delta.multiplyScalar(deltaTime / 0.01666);

      var wp = ROOT.position.clone();
      wp.y += 9;
      deltaVec.copy(delta);
      ROOT.applyForce(deltaVec, wp);

      skin.skeleton.joints.forEach(function (joint, i) {

        joint.update();

        var bone = skin.skeleton.bones[i];

        joint.transform.decompose(p, q, scl);

        joint.transform.decompose(bone.position, bone.quaternion, new Vector3());
      });
    });
  };

  // draw function called once per rAf loop

  var draw = function draw() {

    sphere.visible = false;
    cubeCamera2.update(renderer, scene);
    sphere.visible = true;

    renderer.render(scene, camera);
  };

  // events
  view.onResize = function (e, w, h) {
    camera.aspect = view.aspect;
    camera.updateProjectionMatrix();
  };

  var mousedown = false;

  var onMouseMove = function onMouseMove(e) {

    if (mousedown) {
      // drag stuff
    }
  };

  var onMouseDown = function onMouseDown(e) {
    mousedown = true;
  };

  var onMouseUp = function onMouseUp(e) {
    mousedown = false;
  };

  view.container.addEventListener('mousedown', onMouseDown, false);
  view.container.addEventListener('mousemove', onMouseMove, false);
  view.container.addEventListener('mouseup', onMouseUp, false);
  view.container.addEventListener('mouseout', onMouseUp, false);

  var touches = new _touchEvents2.default({

    element: view.container,

    onTouchStart: function onTouchStart(e) {

      e.preventDefault();
      // console.log("touchstart.");

      var touches = e.changedTouches;

      if (touches.length) {
        onMouseDown(touches[0]);
      }
    },

    onTouchMove: function onTouchMove(e) {

      e.preventDefault();
      var touches = e.changedTouches;

      if (touches.length) {
        onMouseMove(touches[0]);
      }
    },

    onTouchEnd: function onTouchEnd(e) {
      e.preventDefault();
      var touches = e.changedTouches;

      if (touches.length <= 1) {
        onMouseUp(touches[0]);
      }
    }

  });

  // window.addEventListener('wheel', onScroll )

  // keyboard inputs
  window.addEventListener('keypress', function (e) {

    switch (e.key) {

      case 's':
        break;

      case 'c':
        console.log(camera.position.toArray().join(', '));
        return;

      case 'p':
        var boneInfo = {};

        skin.skeleton.bones.forEach(function (bone) {

          // console.log( bone.position, bone.quaternion );
          boneInfo[bone.name] = {
            position: bone.collider.position,
            quaternion: bone.collider.quaternion
          };
        });

        var blob = new Blob([JSON.stringify(boneInfo, null, 2)], { type: 'application/json' });
        (0, _saveAs2.default)(blob, 'boneInfo.json');

        return;

      default:
        return;
    }
  });

  // rAf loop
  function animate() {
    requestAnimationFrame(animate);
    update();
    draw();
  }

  animate();
};

module.exports = Sketch;

},{"../lsr/LilTween.js":8,"../lsr/coolorsToArray.js":9,"../lsr/eases.js":10,"../lsr/randomElement.js":11,"./CannonHelper.js":1,"./Joint.js":2,"./ThreeView.js":3,"./static/boneInfo.json":6,"./touchEvents.js":7,"save-as":12}],6:[function(require,module,exports){
module.exports={
  "ROOT": {
    "position": {
      "x": 5.658193521356009,
      "y": 1.1551556094171116,
      "z": 8.144666463937915
    },
    "quaternion": {
      "x": -0.629864557626063,
      "y": -0.04469459627384044,
      "z": -0.7083913902695919,
      "w": -0.3153643453251443
    }
  },
  "joint7": {
    "position": {
      "x": 4.642878366380113,
      "y": 0.23118447966875597,
      "z": 8.114418622128996
    },
    "quaternion": {
      "x": -0.5507941176809378,
      "y": 0.4140740540769535,
      "z": -0.5698868374066326,
      "w": -0.4476578048230809
    }
  },
  "joint8": {
    "position": {
      "x": 3.6686840877321347,
      "y": 0.11185512557099742,
      "z": 8.222829909421256
    },
    "quaternion": {
      "x": -0.5510572648115505,
      "y": 0.4321827917538063,
      "z": -0.4349562050466608,
      "w": -0.5660097394053442
    }
  },
  "joint9": {
    "position": {
      "x": 2.70308935531095,
      "y": 0.12220595232674299,
      "z": 8.560510352697776
    },
    "quaternion": {
      "x": -0.6020094156524282,
      "y": 0.3696713259482187,
      "z": -0.37231767813094974,
      "w": -0.6019196962956824
    }
  },
  "joint10": {
    "position": {
      "x": 1.8249660720820968,
      "y": 0.11983163624726859,
      "z": 9.07889662472377
    },
    "quaternion": {
      "x": -0.6392338764712464,
      "y": 0.31258055639316906,
      "z": -0.3152745628899577,
      "w": -0.6279135266348593
    }
  },
  "joint11": {
    "position": {
      "x": 0.9973923274415761,
      "y": 0.11191487376258745,
      "z": 9.812676681746707
    },
    "quaternion": {
      "x": -0.659301761161335,
      "y": 0.2722535170042441,
      "z": -0.2547765588097266,
      "w": -0.6529074324048209
    }
  },
  "joint12": {
    "position": {
      "x": 0.9973923274415761,
      "y": 0.11191487376258745,
      "z": 9.812676681746707
    },
    "quaternion": {
      "x": -0.659301761161335,
      "y": 0.2722535170042441,
      "z": -0.2547765588097266,
      "w": -0.6529074324048209
    }
  },
  "joint13": {
    "position": {
      "x": 4.926785336021037,
      "y": 0.6205543123028584,
      "z": 6.901436532385298
    },
    "quaternion": {
      "x": -0.6837709867877589,
      "y": 0.5344693811144923,
      "z": -0.4947660255074015,
      "w": -0.044791721132319356
    }
  },
  "joint14": {
    "position": {
      "x": 4.142131520023267,
      "y": 0.2818199353482121,
      "z": 6.637778841266235
    },
    "quaternion": {
      "x": -0.6858556864828367,
      "y": 0.4877778847853728,
      "z": -0.40068028831880137,
      "w": -0.3621187912636221
    }
  },
  "joint15": {
    "position": {
      "x": 3.2203466929107387,
      "y": 0.13010679991273122,
      "z": 6.869572443749243
    },
    "quaternion": {
      "x": -0.6409542926817511,
      "y": 0.406471950578097,
      "z": -0.3278678877921701,
      "w": -0.5625484834578919
    }
  },
  "joint16": {
    "position": {
      "x": 2.3784106679064387,
      "y": 0.12015138029108619,
      "z": 7.405834985140734
    },
    "quaternion": {
      "x": -0.6472754724801347,
      "y": 0.31251818621954225,
      "z": -0.27786914514304156,
      "w": -0.6373033690363963
    }
  },
  "joint17": {
    "position": {
      "x": 1.6015158489490329,
      "y": 0.12237092517317616,
      "z": 8.185784234952703
    },
    "quaternion": {
      "x": -0.6638977222718904,
      "y": 0.2415053771641561,
      "z": -0.24678817169182674,
      "w": -0.6633329220504589
    }
  },
  "joint18": {
    "position": {
      "x": 1.6015158489490329,
      "y": 0.12237092517317616,
      "z": 8.185784234952703
    },
    "quaternion": {
      "x": -0.6638977222718904,
      "y": 0.2415053771641561,
      "z": -0.24678817169182674,
      "w": -0.6633329220504589
    }
  },
  "joint19": {
    "position": {
      "x": 4.1179844449274325,
      "y": 1.1224703276830392,
      "z": 7.929917049676505
    },
    "quaternion": {
      "x": 0.5310007306705601,
      "y": -0.4732159428946582,
      "z": 0.6267665260354907,
      "w": 0.3182273043895724
    }
  },
  "joint20": {
    "position": {
      "x": 3.3726953442095224,
      "y": 0.7715480008961988,
      "z": 7.578632799908026
    },
    "quaternion": {
      "x": 0.6290004173844367,
      "y": -0.5352481102977079,
      "z": 0.5624434821718288,
      "w": -0.039054637565404934
    }
  },
  "joint21": {
    "position": {
      "x": 2.9630379960008066,
      "y": 0.4250118531742907,
      "z": 6.886574935190175
    },
    "quaternion": {
      "x": 0.5602993391919735,
      "y": -0.46265264953351276,
      "z": 0.5972029667789764,
      "w": -0.3396554030941463
    }
  },
  "joint22": {
    "position": {
      "x": 3.0187845869060217,
      "y": 0.19041725868155834,
      "z": 6.007649096682799
    },
    "quaternion": {
      "x": -0.4204962047921036,
      "y": 0.3704056624318546,
      "z": -0.6292686978591903,
      "w": 0.5385197237692002
    }
  },
  "joint23": {
    "position": {
      "x": 3.5221639600303836,
      "y": 0.12315996099246122,
      "z": 5.074551615441858
    },
    "quaternion": {
      "x": -0.32314328067565773,
      "y": 0.310034255216618,
      "z": -0.6267536061323237,
      "w": 0.6376810315091536
    }
  },
  "joint24": {
    "position": {
      "x": 3.5221639600303836,
      "y": 0.12315996099246122,
      "z": 5.074551615441858
    },
    "quaternion": {
      "x": -0.32314328067565773,
      "y": 0.310034255216618,
      "z": -0.6267536061323237,
      "w": 0.6376810315091536
    }
  },
  "joint25": {
    "position": {
      "x": 4.6605616762106346,
      "y": 0.8305560996462273,
      "z": 9.237200911953277
    },
    "quaternion": {
      "x": 0.45774356558229473,
      "y": -0.022167573866130774,
      "z": 0.7059047891911147,
      "w": 0.5400720835536169
    }
  },
  "joint26": {
    "position": {
      "x": 3.8318338541996986,
      "y": 0.43361144501149934,
      "z": 9.571497237521855
    },
    "quaternion": {
      "x": 0.45130936776643943,
      "y": -0.21621670987732208,
      "z": 0.6878662682954225,
      "w": 0.5257472642605118
    }
  },
  "joint27": {
    "position": {
      "x": 2.8903750930764422,
      "y": 0.1977700336525667,
      "z": 9.694557000639886
    },
    "quaternion": {
      "x": 0.42514434774592547,
      "y": -0.36550533674541885,
      "z": 0.6002220075054844,
      "w": 0.5704311300204399
    }
  },
  "joint28": {
    "position": {
      "x": 1.9060455932540958,
      "y": 0.23888534639305525,
      "z": 9.696170695507165
    },
    "quaternion": {
      "x": 0.3973362596081134,
      "y": -0.5085865073673089,
      "z": 0.500307092031946,
      "w": 0.5771970850472947
    }
  },
  "joint29": {
    "position": {
      "x": 0.8134552028230443,
      "y": 0.3643361505672833,
      "z": 9.626290493445135
    },
    "quaternion": {
      "x": 0.4602349449452053,
      "y": -0.5250964567097216,
      "z": 0.51061022597933,
      "w": 0.5017317049255673
    }
  },
  "joint30": {
    "position": {
      "x": 0.8134552028230443,
      "y": 0.3643361505672833,
      "z": 9.626290493445135
    },
    "quaternion": {
      "x": 0.4602349449452053,
      "y": -0.5250964567097216,
      "z": 0.51061022597933,
      "w": 0.5017317049255673
    }
  },
  "joint31": {
    "position": {
      "x": 7.215164801493042,
      "y": 0.8726737652356181,
      "z": 8.282293361284333
    },
    "quaternion": {
      "x": -0.7676664957931066,
      "y": -0.40527362772298214,
      "z": -0.3845853423855703,
      "w": 0.31390373099273544
    }
  },
  "joint32": {
    "position": {
      "x": 7.977815003442694,
      "y": 0.43645800771038484,
      "z": 7.999231285516916
    },
    "quaternion": {
      "x": -0.8020551671466574,
      "y": -0.2793105524145733,
      "z": -0.22894644498955272,
      "w": 0.4756854522579589
    }
  },
  "joint33": {
    "position": {
      "x": 8.492684810176856,
      "y": 0.17946074382510788,
      "z": 7.298256594398126
    },
    "quaternion": {
      "x": -0.7411213048313474,
      "y": -0.16247899384483763,
      "z": -0.12739613291607257,
      "w": 0.6388348874335844
    }
  },
  "joint34": {
    "position": {
      "x": 8.786924965699232,
      "y": 0.11904859511806491,
      "z": 6.370371941352385
    },
    "quaternion": {
      "x": -0.7013516287812118,
      "y": -0.07787888749485189,
      "z": -0.06760300114362536,
      "w": 0.7053159617681145
    }
  },
  "joint35": {
    "position": {
      "x": 9.039664033293352,
      "y": 0.12379554997326468,
      "z": 5.301687678850514
    },
    "quaternion": {
      "x": -0.7002359213005769,
      "y": -0.09305234573365867,
      "z": -0.09274911561258084,
      "w": 0.7017182604342571
    }
  },
  "joint36": {
    "position": {
      "x": 9.039664033293352,
      "y": 0.12379554997326468,
      "z": 5.301687678850514
    },
    "quaternion": {
      "x": -0.7002359213005769,
      "y": -0.09305234573365867,
      "z": -0.09274911561258084,
      "w": 0.7017182604342571
    }
  },
  "joint37": {
    "position": {
      "x": 6.088408203958124,
      "y": 2.399085347790853,
      "z": 8.357605300065256
    },
    "quaternion": {
      "x": 0.3942217665168652,
      "y": -0.6135635496448348,
      "z": 0.07617706911266243,
      "w": 0.679945603333794
    }
  },
  "joint38": {
    "position": {
      "x": 5.587605936788214,
      "y": 2.737305530078852,
      "z": 8.738780112772421
    },
    "quaternion": {
      "x": 0.7277853125493497,
      "y": -0.38211597974915246,
      "z": 0.24363294252142664,
      "w": 0.5147415916517158
    }
  },
  "joint39": {
    "position": {
      "x": 4.8565833186417455,
      "y": 2.378184951266903,
      "z": 9.233349006750581
    },
    "quaternion": {
      "x": 0.8587568355662035,
      "y": -0.2238698052456561,
      "z": 0.309058306091644,
      "w": 0.3419093024522091
    }
  },
  "joint40": {
    "position": {
      "x": 4.328833463186719,
      "y": 1.6197919943480714,
      "z": 9.62494358643151
    },
    "quaternion": {
      "x": 0.9103495468182196,
      "y": -0.1293658807350266,
      "z": 0.32221689547969073,
      "w": 0.22517647252087256
    }
  },
  "joint41": {
    "position": {
      "x": 3.977484059388162,
      "y": 0.6254500042993061,
      "z": 9.937556369709352
    },
    "quaternion": {
      "x": 0.9318487114842832,
      "y": -0.07783317368418978,
      "z": 0.31630934369786085,
      "w": 0.15983859067433143
    }
  },
  "joint42": {
    "position": {
      "x": 3.977484059388162,
      "y": 0.6254500042993061,
      "z": 9.937556369709352
    },
    "quaternion": {
      "x": 0.9318487114842832,
      "y": -0.07783317368418978,
      "z": 0.31630934369786085,
      "w": 0.15983859067433143
    }
  },
  "joint43": {
    "position": {
      "x": 6.48040489837865,
      "y": 0.29172669089207637,
      "z": 7.295792492964167
    },
    "quaternion": {
      "x": 0.7306558728927608,
      "y": 0.27021340893763623,
      "z": 0.31683037437514616,
      "w": -0.5410593524844791
    }
  },
  "joint44": {
    "position": {
      "x": 7.086691012827366,
      "y": 0.16248359111044094,
      "z": 6.618988477298565
    },
    "quaternion": {
      "x": 0.6757931795163028,
      "y": 0.21482122659743477,
      "z": 0.2061580248788252,
      "w": -0.6742805706087648
    }
  },
  "joint45": {
    "position": {
      "x": 7.544959199899847,
      "y": 0.1682281671974599,
      "z": 5.763618323093651
    },
    "quaternion": {
      "x": 0.6892216742914394,
      "y": 0.14758903581879607,
      "z": 0.14453490463006474,
      "w": -0.6944786688852015
    }
  },
  "joint46": {
    "position": {
      "x": 7.913659060893847,
      "y": 0.17176406842861,
      "z": 4.8467054918195895
    },
    "quaternion": {
      "x": 0.6948324784724417,
      "y": 0.1347309778038297,
      "z": 0.1335619826597089,
      "w": -0.6936977636318826
    }
  },
  "joint47": {
    "position": {
      "x": 8.355088103211298,
      "y": 0.17123676301818344,
      "z": 3.844483072968312
    },
    "quaternion": {
      "x": 0.6883814630606179,
      "y": 0.15951579037722333,
      "z": 0.16133268095294329,
      "w": -0.6889538736311662
    }
  },
  "joint48": {
    "position": {
      "x": 8.355088103211298,
      "y": 0.17123676301818344,
      "z": 3.844483072968312
    },
    "quaternion": {
      "x": 0.6883814630606179,
      "y": 0.15951579037722333,
      "z": 0.16133268095294329,
      "w": -0.6889538736311662
    }
  },
  "joint49": {
    "position": {
      "x": 6.267712564297999,
      "y": 0.35666813490587207,
      "z": 9.103819440381297
    },
    "quaternion": {
      "x": 0.5654159585151209,
      "y": 0.5844437680206518,
      "z": 0.5809684346758875,
      "w": 0.03472684535771754
    }
  },
  "joint50": {
    "position": {
      "x": 6.8716361269497535,
      "y": 0.20952386780267804,
      "z": 9.772827050261604
    },
    "quaternion": {
      "x": 0.4376975969544234,
      "y": 0.6861809193984078,
      "z": 0.56479094148509,
      "w": -0.13633690582620814
    }
  },
  "joint51": {
    "position": {
      "x": 7.596272324776466,
      "y": 0.19764184136991428,
      "z": 10.39392799984524
    },
    "quaternion": {
      "x": 0.37692817319505356,
      "y": 0.6630121718258504,
      "z": 0.6008218668224985,
      "w": -0.2394850655271359
    }
  },
  "joint52": {
    "position": {
      "x": 8.317742648381737,
      "y": 0.1845620784273596,
      "z": 11.04172309035238
    },
    "quaternion": {
      "x": 0.2952335878994615,
      "y": 0.6535245052671768,
      "z": 0.6508647388045763,
      "w": -0.24923471141105827
    }
  },
  "joint53": {
    "position": {
      "x": 9.026940863012907,
      "y": 0.1720541999518222,
      "z": 11.86337272829668
    },
    "quaternion": {
      "x": 0.23423940079213026,
      "y": 0.667699506844944,
      "z": 0.6683044931404887,
      "w": -0.22951770329061072
    }
  },
  "joint54": {
    "position": {
      "x": 9.026940863012907,
      "y": 0.1720541999518222,
      "z": 11.86337272829668
    },
    "quaternion": {
      "x": 0.23423940079213026,
      "y": 0.667699506844944,
      "z": 0.6683044931404887,
      "w": -0.22951770329061072
    }
  },
  "joint55": {
    "position": {
      "x": 5.981826823773983,
      "y": 1.234160814988214,
      "z": 9.697157512153293
    },
    "quaternion": {
      "x": 0.42061131950412933,
      "y": -0.5155065621998056,
      "z": -0.6697368500482342,
      "w": 0.3298357984230975
    }
  },
  "joint56": {
    "position": {
      "x": 5.923712500140781,
      "y": 0.8422618282201344,
      "z": 10.662786369592187
    },
    "quaternion": {
      "x": 0.5067820940975187,
      "y": -0.4712779085498789,
      "z": -0.6668640090015946,
      "w": 0.2763357297080981
    }
  },
  "joint57": {
    "position": {
      "x": 5.755214384458465,
      "y": 0.4216794394334056,
      "z": 11.621348555527746
    },
    "quaternion": {
      "x": 0.5458399134441302,
      "y": -0.5038230623954815,
      "z": -0.5812466581671529,
      "w": 0.3322249735634879
    }
  },
  "joint58": {
    "position": {
      "x": 5.528638500144929,
      "y": 0.18767841766559448,
      "z": 12.600173610833712
    },
    "quaternion": {
      "x": 0.5466578531086477,
      "y": -0.543757735435072,
      "z": -0.5039032029212059,
      "w": 0.38932541514126295
    }
  },
  "joint59": {
    "position": {
      "x": 5.309524547983829,
      "y": 0.12420947012254746,
      "z": 13.678759229962807
    },
    "quaternion": {
      "x": 0.5344106069149804,
      "y": -0.5428227531752394,
      "z": -0.4664563795623946,
      "w": 0.44963007886212253
    }
  },
  "joint60": {
    "position": {
      "x": 5.309524547983829,
      "y": 0.12420947012254746,
      "z": 13.678759229962807
    },
    "quaternion": {
      "x": 0.5344106069149804,
      "y": -0.5428227531752394,
      "z": -0.4664563795623946,
      "w": 0.44963007886212253
    }
  },
  "joint61": {
    "position": {
      "x": 4.650259272388324,
      "y": 1.7306356327615988,
      "z": 8.996167683407123
    },
    "quaternion": {
      "x": -0.6552651635122823,
      "y": 0.297531053516986,
      "z": -0.3836400280600002,
      "w": -0.5787254673421729
    }
  },
  "joint62": {
    "position": {
      "x": 3.843692407380409,
      "y": 1.4121459151009652,
      "z": 9.45798151435839
    },
    "quaternion": {
      "x": -0.772961628596539,
      "y": 0.2936046865245021,
      "z": -0.3996914608622939,
      "w": -0.3956934986602643
    }
  },
  "joint63": {
    "position": {
      "x": 3.021897747649548,
      "y": 0.8976825962408412,
      "z": 9.756286931357725
    },
    "quaternion": {
      "x": -0.7582515803364672,
      "y": 0.3913647902499956,
      "z": -0.3981434251699116,
      "w": -0.3367045512965304
    }
  },
  "joint64": {
    "position": {
      "x": 2.116358328671136,
      "y": 0.5498171422422954,
      "z": 9.947516732498885
    },
    "quaternion": {
      "x": -0.695260740526466,
      "y": 0.523272725469032,
      "z": -0.3332427054279131,
      "w": -0.362970324877787
    }
  },
  "joint65": {
    "position": {
      "x": 1.0407726591865365,
      "y": 0.46407164605331974,
      "z": 10.077242814658486
    },
    "quaternion": {
      "x": -0.619471650677733,
      "y": 0.6004524299970515,
      "z": -0.3272428003062721,
      "w": -0.38551770771904903
    }
  },
  "joint66": {
    "position": {
      "x": 1.0407726591865365,
      "y": 0.46407164605331974,
      "z": 10.077242814658486
    },
    "quaternion": {
      "x": -0.619471650677733,
      "y": 0.6004524299970515,
      "z": -0.3272428003062721,
      "w": -0.38551770771904903
    }
  },
  "joint67": {
    "position": {
      "x": 6.592624870903235,
      "y": 1.5520439476889734,
      "z": 7.017724101480075
    },
    "quaternion": {
      "x": 0.7667288210033711,
      "y": 0.43019504254827823,
      "z": -0.17395020572914568,
      "w": -0.4436219858578399
    }
  },
  "joint68": {
    "position": {
      "x": 6.947195327066134,
      "y": 1.2448810666423495,
      "z": 6.299246737745716
    },
    "quaternion": {
      "x": 0.7751129632326987,
      "y": 0.19214649909868453,
      "z": -0.47569431581599064,
      "w": -0.368774368704091
    }
  },
  "joint69": {
    "position": {
      "x": 6.753384154008869,
      "y": 0.6851062086610513,
      "z": 5.703088364568805
    },
    "quaternion": {
      "x": 0.6469583377069293,
      "y": -0.1107595330403187,
      "z": -0.6145582401272675,
      "w": -0.43760187911371373
    }
  },
  "joint70": {
    "position": {
      "x": 6.041148810569258,
      "y": 0.2538459386825891,
      "z": 5.418349386343398
    },
    "quaternion": {
      "x": 0.5409150712861727,
      "y": -0.3670585319602917,
      "z": -0.5841572843188324,
      "w": -0.4810812685481291
    }
  },
  "joint71": {
    "position": {
      "x": 4.982441383073559,
      "y": 0.11480343860730768,
      "z": 5.408558218259065
    },
    "quaternion": {
      "x": 0.4692764395616465,
      "y": -0.5018902040752994,
      "z": -0.5310638710572588,
      "w": -0.49583970311309084
    }
  },
  "joint72": {
    "position": {
      "x": 4.982441383073559,
      "y": 0.11480343860730768,
      "z": 5.408558218259065
    },
    "quaternion": {
      "x": 0.4692764395616465,
      "y": -0.5018902040752994,
      "z": -0.5310638710572588,
      "w": -0.49583970311309084
    }
  },
  "joint73": {
    "position": {
      "x": 4.998111141953434,
      "y": 1.8567072685450816,
      "z": 7.123019940965952
    },
    "quaternion": {
      "x": 0.18312080990102456,
      "y": 0.4655472904918734,
      "z": -0.7212780304498505,
      "w": -0.47905165910082437
    }
  },
  "joint74": {
    "position": {
      "x": 4.5481716211493834,
      "y": 1.6213974777321707,
      "z": 6.371036943138714
    },
    "quaternion": {
      "x": 0.33001613540774744,
      "y": 0.3470984275688184,
      "z": -0.8245742220686254,
      "w": -0.30114678190163346
    }
  },
  "joint75": {
    "position": {
      "x": 4.425714042004026,
      "y": 1.0417245999599027,
      "z": 5.661547229078463
    },
    "quaternion": {
      "x": 0.4565735456723398,
      "y": 0.39380736454124876,
      "z": -0.7931754661150965,
      "w": -0.0856097948739715
    }
  },
  "joint76": {
    "position": {
      "x": 4.785600166798072,
      "y": 0.49058674640468924,
      "z": 5.040111598963566
    },
    "quaternion": {
      "x": 0.4748696458373387,
      "y": 0.5142372630569761,
      "z": -0.6965684243775185,
      "w": 0.15764290947014362
    }
  },
  "joint77": {
    "position": {
      "x": 5.617103351393407,
      "y": 0.21732222090786807,
      "z": 4.494504383047501
    },
    "quaternion": {
      "x": 0.42135778285804515,
      "y": 0.5826252494398996,
      "z": -0.6168368695879987,
      "w": 0.3201838750732545
    }
  },
  "joint78": {
    "position": {
      "x": 5.617103351393407,
      "y": 0.21732222090786807,
      "z": 4.494504383047501
    },
    "quaternion": {
      "x": 0.42135778285804515,
      "y": 0.5826252494398996,
      "z": -0.6168368695879987,
      "w": 0.3201838750732545
    }
  }
}
},{}],7:[function(require,module,exports){
'use strict';

// touchEvents.js

var ongoingTouches = [];

module.exports = function (options) {
  var _this = this;

  var touchStartCallback = function touchStartCallback(e) {
    _this.onTouchStart(e);
  };
  var touchMoveCallback = function touchMoveCallback(e) {
    _this.onTouchMove(e);
  };
  var touchEndCallback = function touchEndCallback(e) {
    _this.onTouchEnd(e);
  };

  Object.assign(this, {

    element: null,

    onToushStart: function onToushStart(e) {},

    onTouchMove: function onTouchMove(e) {},

    onTouchEnd: function onTouchEnd(e) {},

    addListeners: function addListeners(el) {

      if (_this.element !== el) {
        _this.removeListeners();
      }

      _this.element = el;

      el.addEventListener('touchstart', touchStartCallback, false);
      el.addEventListener('touchend', touchEndCallback, false);
      el.addEventListener('touchmove', touchMoveCallback, false);
    },

    removeListeners: function removeListeners() {

      if (_this.element) {

        _this.element.removeEventListener('touchstart', touchStartCallback, false);
        _this.element.removeEventListener('touchend', touchEndCallback, false);
        _this.element.removeEventListener('touchmove', touchMoveCallback, false);
      }

      _this.element = null;
    }

  }, options || {});

  // setup
  if (this.element) {

    this.addListeners(this.element);
  }
};

},{}],8:[function(require,module,exports){
"use strict";

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

// LilTween.js

function mapLinear(x, a1, a2, b1, b2) {
  return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
}

function lerp(x, y, t) {
  return (1 - t) * x + t * y;
}

function noEase(u) {
  return u;
}

// const elapsedTime = 0

var LilTween = function () {
  function LilTween(options) {
    _classCallCheck(this, LilTween);

    Object.assign(this, {
      from: 0,
      to: 1,
      delay: 0, // TODO
      duration: 1000,
      ease: noEase,
      elapsedTime: 0,
      onStart: null,
      onUpdate: null,
      onComplete: null,
      repeat: false,
      startTime: Date.now(),
      _stopped: false,
      u: 0,
      value: 0,
      chainedTweens: [],
      target: null
    }, options || {});
  }

  _createClass(LilTween, [{
    key: "chain",
    value: function chain(tween) {
      this.chainedTweens.push(tween);
      return this;
    }
  }, {
    key: "start",
    value: function start() {
      this.startTime = Date.now() + this.delay;
      this._stopped = false;
      if (this.onStart) {
        this.onStart(this);
      }
      this.update();
      return this;
    }
  }, {
    key: "stop",
    value: function stop() {
      this._stopped = true;
      return this;
    }
  }, {
    key: "update",
    value: function update() {

      if (this._stopped) {
        return;
      }

      var t = Date.now();
      this.elapsedTime = Math.max(t - this.startTime, 0);
      // console.log( this.elapsedTime );

      if (t < this.startTime) {} else if (this.elapsedTime < this.duration) {

        this.u = this.ease(mapLinear(this.elapsedTime, 0, this.duration, 0, 1));

        this.value = lerp(this.from, this.to, this.u);

        // console.log( this.ca );

        if (this.onUpdate) {
          this.onUpdate(this.value, this.u, this);
        }
      } else if (this.elapsedTime < 0) {} else {

        this._stopped = true;

        if (this.onUpdate) {
          this.onUpdate(this.value, 1, this);
        }

        if (this.onComplete) {
          this.onComplete(this);
        }

        if (this.chainedTweens.length) {

          this.chainedTweens.forEach(function (t) {
            t.start();
          });
        }

        if (this.repeat) {
          this.start();
        }
      }

      window.requestAnimationFrame(this.update.bind(this));
    }
  }, {
    key: "clone",
    value: function clone(options) {
      var t = new LilTween(this);

      if (options) Object.assign(t, options);

      return t;
    }
  }]);

  return LilTween;
}();

module.exports = LilTween;

},{}],9:[function(require,module,exports){
'use strict';

// coolorsToArray.js

// var str = "https://coolors.co/010b13-f46e42-f5f7f7-262422-5fc5e1"

module.exports = function (str) {
  return str.split('/').pop().split('-').map(function (hex) {
    return new THREE.Color('#' + hex);
  });
};

},{}],10:[function(require,module,exports){
"use strict";

var zero = function zero() {
  return 0;
};

var one = function one() {
  return 1;
};

var linear = function linear(k) {
  return k;
};

var smooth = function smooth(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
};

var smoother = function smoother(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * x * (x * (x * 6 - 15) + 10);
};

var QuadraticIn = function QuadraticIn(k) {
  return k * k;
};

var QuadraticOut = function QuadraticOut(k) {
  return k * (2 - k);
};

var QuadraticInOut = function QuadraticInOut(k) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k;
  }

  return -0.5 * (--k * (k - 2) - 1);
};

var CubicIn = function CubicIn(k) {
  return k * k * k;
};

var CubicOut = function CubicOut(k) {
  return --k * k * k + 1;
};

var CubicInOut = function CubicInOut(k) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k;
  }
  return 0.5 * ((k -= 2) * k * k + 2);
};

var QuarticIn = function QuarticIn(k) {
  return k * k * k * k;
};

var QuarticOut = function QuarticOut(k) {
  return 1 - --k * k * k * k;
};

var QuarticInOut = function QuarticInOut(k) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k * k;
  }
  return -0.5 * ((k -= 2) * k * k * k - 2);
};

var QuinticIn = function QuinticIn(k) {
  return k * k * k * k * k;
};

var QuinticOut = function QuinticOut(k) {
  return --k * k * k * k * k + 1;
};

var QuinticInOut = function QuinticInOut(k) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k * k * k;
  }
  return 0.5 * ((k -= 2) * k * k * k * k + 2);
};

var SinusoidalIn = function SinusoidalIn(k) {
  return 1 - Math.cos(k * Math.PI / 2);
};

var SinusoidalOut = function SinusoidalOut(k) {
  return Math.sin(k * Math.PI / 2);
};

var SinusoidalInOut = function SinusoidalInOut(k) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
};

var ExponentialIn = function ExponentialIn(k) {
  return k === 0 ? 0 : Math.pow(1024, k - 1);
};

var ExponentialOut = function ExponentialOut(k) {
  return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
};

var ExponentialInOut = function ExponentialInOut(k) {
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  if ((k *= 2) < 1) {
    return 0.5 * Math.pow(1024, k - 1);
  }
  return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
};

var CircularIn = function CircularIn(k) {
  return 1 - Math.sqrt(1 - k * k);
};

var CircularOut = function CircularOut(k) {
  return Math.sqrt(1 - --k * k);
};

var CircularInOut = function CircularInOut(k) {
  if ((k *= 2) < 1) {
    return -0.5 * (Math.sqrt(1 - k * k) - 1);
  }
  return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
};

var ElasticIn = function ElasticIn(k) {
  if (k === 0) {
    return 0;
  }

  if (k === 1) {
    return 1;
  }

  return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
};

var ElasticOut = function ElasticOut(k) {
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
};

var ElasticInOut = function ElasticInOut(k) {
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  k *= 2;
  if (k < 1) {
    return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
  }
  return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
};

var BackIn = function BackIn(k) {
  var s = 1.70158;
  return k * k * ((s + 1) * k - s);
};

var BackOut = function BackOut(k) {
  var s = 1.70158;
  return --k * k * ((s + 1) * k + s) + 1;
};

var BackInOut = function BackInOut(k) {
  var s = 1.70158 * 1.525;
  if ((k *= 2) < 1) {
    return 0.5 * (k * k * ((s + 1) * k - s));
  }
  return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
};

var BounceOut = function BounceOut(k) {
  if (k < 1 / 2.75) {
    return 7.5625 * k * k;
  } else if (k < 2 / 2.75) {
    return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
  } else if (k < 2.5 / 2.75) {
    return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
  } else {
    return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
  }
};

var BounceIn = function BounceIn(k) {
  return 1 - BounceOut(1 - k);
};

var BounceInOut = function BounceInOut(k) {
  if (k < 0.5) {
    return BounceIn(k * 2) * 0.5;
  }
  return BounceOut(k * 2 - 1) * 0.5 + 0.5;
};

module.exports = {
  zero: zero,
  one: one,
  linear: linear,
  smooth: smooth,
  smoother: smoother,
  QuadraticIn: QuadraticIn,
  QuadraticOut: QuadraticOut,
  QuadraticInOut: QuadraticInOut,
  CubicIn: CubicIn,
  CubicOut: CubicOut,
  CubicInOut: CubicInOut,
  QuarticIn: QuarticIn,
  QuarticOut: QuarticOut,
  QuarticInOut: QuarticInOut,
  QuinticIn: QuinticIn,
  QuinticOut: QuinticOut,
  QuinticInOut: QuinticInOut,
  SinusoidalIn: SinusoidalIn,
  SinusoidalOut: SinusoidalOut,
  SinusoidalInOut: SinusoidalInOut,
  ExponentialIn: ExponentialIn,
  ExponentialOut: ExponentialOut,
  ExponentialInOut: ExponentialInOut,
  CircularIn: CircularIn,
  CircularOut: CircularOut,
  CircularInOut: CircularInOut,
  ElasticIn: ElasticIn,
  ElasticOut: ElasticOut,
  ElasticInOut: ElasticInOut,
  BackIn: BackIn,
  BackOut: BackOut,
  BackInOut: BackInOut,
  BounceOut: BounceOut,
  BounceIn: BounceIn,
  BounceInOut: BounceInOut
};

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* FileSaver.js
 * A saveAs() FileSaver implementation.
 *
 * By Eli Grey, http://eligrey.com
 * ES6ified by Cole Chamberlain, https://github.com/cchamberlain
 *
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = exports.saveAs = window.saveAs || function (view) {
  // IE <10 is explicitly unsupported
  if (typeof navigator !== 'undefined' && /MSIE [1-9]\./.test(navigator.userAgent)) return;
  var doc = view.document;
  // only get URL when necessary in case Blob.js hasn't overridden it yet
  var get_URL = function get_URL() {
    return view.URL || view.webkitURL || view;
  };
  var save_link = doc.createElementNS('http://www.w3.org/1999/xhtml', 'a');
  var can_use_save_link = 'download' in save_link;
  var click = function click(node) {
    var event = new MouseEvent('click');
    node.dispatchEvent(event);
  };
  var is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent);
  var webkit_req_fs = view.webkitRequestFileSystem;
  var req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem;
  var throw_outside = function throw_outside(ex) {
    (view.setImmediate || view.setTimeout)(function () {
      throw ex;
    }, 0);
  };
  var force_saveable_type = 'application/octet-stream';
  var fs_min_size = 0;
  // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
  var arbitrary_revoke_timeout = 1000 * 40; // in ms
  var revoke = function revoke(file) {
    var revoker = function revoker() {
      if (typeof file === 'string') // file is an object URL
        get_URL().revokeObjectURL(file);else // file is a File
        file.remove();
    };
    /* // Take note W3C:
    var
      uri = typeof file === "string" ? file : file.toURL()
    , revoker = function(evt) {
      // idealy DownloadFinishedEvent.data would be the URL requested
      if (evt.data === uri) {
        if (typeof file === "string") { // file is an object URL
          get_URL().revokeObjectURL(file);
        } else { // file is a File
          file.remove();
        }
      }
    }
    ;
    view.addEventListener("downloadfinished", revoker);
    */
    setTimeout(revoker, arbitrary_revoke_timeout);
  };
  var dispatch = function dispatch(filesaver, event_types, event) {
    event_types = [].concat(event_types);
    var i = event_types.length;
    while (i--) {
      var listener = filesaver['on' + event_types[i]];
      if (typeof listener === 'function') {
        try {
          listener.call(filesaver, event || filesaver);
        } catch (ex) {
          throw_outside(ex);
        }
      }
    }
  };
  var auto_bom = function auto_bom(blob) {
    // prepend BOM for UTF-8 XML and text/* types (including HTML)
    if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) return new Blob(['﻿', blob], { type: blob.type });
    return blob;
  };

  var FileSaver = function FileSaver(blob, name, no_auto_bom) {
    _classCallCheck(this, FileSaver);

    if (!no_auto_bom) blob = auto_bom(blob);
    // First try a.download, then web filesystem, then object URLs
    var filesaver = this,
        type = blob.type,
        blob_changed = false,
        object_url,
        target_view,
        dispatch_all = function dispatch_all() {
      dispatch(filesaver, 'writestart progress write writeend'.split(' '));
    }
    // on any filesys errors revert to saving with object URLs
    ,
        fs_error = function fs_error() {
      if (target_view && is_safari && typeof FileReader !== 'undefined') {
        // Safari doesn't allow downloading of blob urls
        var reader = new FileReader();
        reader.onloadend = function () {
          var base64Data = reader.result;
          target_view.location.href = 'data:attachment/file' + base64Data.slice(base64Data.search(/[,;]/));
          filesaver.readyState = filesaver.DONE;
          dispatch_all();
        };
        reader.readAsDataURL(blob);
        filesaver.readyState = filesaver.INIT;
        return;
      }
      // don't create more object URLs than needed
      if (blob_changed || !object_url) {
        object_url = get_URL().createObjectURL(blob);
      }
      if (target_view) {
        target_view.location.href = object_url;
      } else {
        var new_tab = view.open(object_url, '_blank');
        if (new_tab === undefined && is_safari) {
          //Apple do not allow window.open, see http://bit.ly/1kZffRI
          view.location.href = object_url;
        }
      }
      filesaver.readyState = filesaver.DONE;
      dispatch_all();
      revoke(object_url);
    },
        abortable = function abortable(func) {
      return function () {
        if (filesaver.readyState !== filesaver.DONE) {
          return func.apply(this, arguments);
        }
      };
    },
        create_if_not_found = { create: true, exclusive: false },
        slice;

    filesaver.readyState = filesaver.INIT;
    if (!name) {
      name = 'download';
    }
    if (can_use_save_link) {
      object_url = get_URL().createObjectURL(blob);
      setTimeout(function () {
        save_link.href = object_url;
        save_link.download = name;
        click(save_link);
        dispatch_all();
        revoke(object_url);
        filesaver.readyState = filesaver.DONE;
      });
      return;
    }
    // Object and web filesystem URLs have a problem saving in Google Chrome when
    // viewed in a tab, so I force save with application/octet-stream
    // http://code.google.com/p/chromium/issues/detail?id=91158
    // Update: Google errantly closed 91158, I submitted it again:
    // https://code.google.com/p/chromium/issues/detail?id=389642
    if (view.chrome && type && type !== force_saveable_type) {
      slice = blob.slice || blob.webkitSlice;
      blob = slice.call(blob, 0, blob.size, force_saveable_type);
      blob_changed = true;
    }
    // Since I can't be sure that the guessed media type will trigger a download
    // in WebKit, I append .download to the filename.
    // https://bugs.webkit.org/show_bug.cgi?id=65440
    if (webkit_req_fs && name !== 'download') {
      name += '.download';
    }
    if (type === force_saveable_type || webkit_req_fs) {
      target_view = view;
    }
    if (!req_fs) {
      fs_error();
      return;
    }
    fs_min_size += blob.size;
    req_fs(view.TEMPORARY, fs_min_size, abortable(function (fs) {
      fs.root.getDirectory('saved', create_if_not_found, abortable(function (dir) {
        var save = function save() {
          dir.getFile(name, create_if_not_found, abortable(function (file) {
            file.createWriter(abortable(function (writer) {
              writer.onwriteend = function (event) {
                target_view.location.href = file.toURL();
                filesaver.readyState = filesaver.DONE;
                dispatch(filesaver, 'writeend', event);
                revoke(file);
              };
              writer.onerror = function () {
                var error = writer.error;
                if (error.code !== error.ABORT_ERR) {
                  fs_error();
                }
              };
              'writestart progress write abort'.split(' ').forEach(function (event) {
                writer['on' + event] = filesaver['on' + event];
              });
              writer.write(blob);
              filesaver.abort = function () {
                writer.abort();
                filesaver.readyState = filesaver.DONE;
              };
              filesaver.readyState = filesaver.WRITING;
            }), fs_error);
          }), fs_error);
        };
        dir.getFile(name, { create: false }, abortable(function (file) {
          // delete file if it already exists
          file.remove();
          save();
        }), abortable(function (ex) {
          if (ex.code === ex.NOT_FOUND_ERR) {
            save();
          } else {
            fs_error();
          }
        }));
      }), fs_error);
    }), fs_error);
  };

  var FS_proto = FileSaver.prototype;
  var saveAs = function saveAs(blob, name, no_auto_bom) {
    return new FileSaver(blob, name, no_auto_bom);
  };

  // IE 10+ (native saveAs)
  if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
    return function (blob, name, no_auto_bom) {
      if (!no_auto_bom) blob = auto_bom(blob);
      return navigator.msSaveOrOpenBlob(blob, name || 'download');
    };
  }

  FS_proto.abort = function () {
    var filesaver = this;
    filesaver.readyState = filesaver.DONE;
    dispatch(filesaver, 'abort');
  };
  FS_proto.readyState = FS_proto.INIT = 0;
  FS_proto.WRITING = 1;
  FS_proto.DONE = 2;

  FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;

  return saveAs;
}(typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || undefined.content);
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

exports.default = saveAs;
},{}]},{},[4]);

//# sourceMappingURL=bundle.js.map
