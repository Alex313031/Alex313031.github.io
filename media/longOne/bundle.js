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

// var coolorPath = 'https://coolors.co/010c26-ba1247-ff1d00-41d6ea-fcfffc'
// var coolorPath = 'https://coolors.co/app/1a535c-4ecdc4-fdfff7-ff6b6b-ffe66d'
var coolorPath = 'https://coolors.co/133c5a-6881a9-9f978a-f3f3f3-ff0141';
// var coolorPath = 'https://coolors.co/0c0f0a-ff206e-40c5e6-b3e3f1-ffffff'
// var coolorPath = 'https://coolors.co/0c0f0a-ff206e-fbff12-41ead4-ffffff'
// OUR SKETCH
var Sketch = function Sketch() {

  var coolors = (0, _coolorsToArray2.default)(coolorPath);

  var clock = new THREE.Clock();

  // camera
  var camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, //aspect
  0.1, 1000);
  camera.position.set(-25.410499275432407, 19.5437661356527, 97.5353859398621);
  camera.lookAt(new Vector3(0, 0, 0));

  // view - convenience object to setup the renderer
  var view = new _ThreeView2.default({
    container: 'container'
  });

  var renderer = view.renderer;
  renderer.setClearColor(coolors[4], 1);
  renderer.autoClear = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // scene
  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(renderer.getClearColor(), 250, 500);
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
    solverIterations: 10
  });
  cannon.world.gravity.set(0, 0, 0);

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
    // color: coolors[3],
    // map: groundMap,
    // bumpMap: groundMap,
    // bumpScale: 0.05,
    metalness: 0,
    roughness: 1
  }));

  groundPlane.receiveShadow = true;
  groundPlane.position.y = -10;
  groundPlane.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(groundPlane);
  cannon.addGround(groundPlane);

  var box = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 10), new THREE.MeshStandardMaterial({
    color: coolors[4]
  }));
  scene.add(box);
  box.castShadow = true;
  box.receiveShadow = true;

  cannon.addBoxMesh(box, { mass: 0 });

  var cubeCamera1 = new THREE.CubeCamera(1, 1000, 128);
  cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  cubeCamera1.renderTarget.texture.mapping = THREE.CubeReflectionMapping;
  scene.add(cubeCamera1);

  cubeCamera1.position.y = 10;

  var createSpotlight = function createSpotlight(hexVal, intensity) {

    var spotLight = new THREE.SpotLight(hexVal || 0xFFFFFF, intensity);
    spotLight.position.set(0, 30, 10);
    spotLight.angle = Math.PI / 10;
    spotLight.penumbra = 0.25;
    spotLight.decay = 1;
    spotLight.distance = 500;

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = 0;

    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 50;
    // spotLight.shadow.camera.fov = 60;

    scene.add(spotLight);

    return spotLight;
  };

  var spotLight = createSpotlight(0xffffff, 1);

  var hemi_light = new THREE.HemisphereLight(renderer.getClearColor(), coolors[1], 1);
  scene.add(hemi_light);

  // audio
  var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  var normalMaterial = new THREE.MeshNormalMaterial();
  // var debugCube = new THREE.Mesh(boxGeometry, new THREE.MeshBasicMaterial({
  //   color: 0xff00ff,
  //   wireframe: true
  // }))
  // debugCube.scale.multiplyScalar( 0.4 )

  var gradient = [];

  for (var i = 1; i < 4; i++) {
    // var c = randEl(coolors)
    var c = coolors[i];
    gradient.push.apply(gradient, _toConsumableArray(c.toArray().map(function (val) {
      return val * 255;
    })));
  }

  var dataTex = new THREE.DataTexture(new Uint8Array(gradient), 1, gradient.length / 3, THREE.RGBFormat);

  // dataTex.wrapS = dataTex.wrapT = THREE.RepeatWrapping
  // dataTex.repeat.set(1,1)
  dataTex.magFilter = dataTex.minFilter = THREE.LinearFilter;
  dataTex.needsUpdate = true;

  // load geometry
  var fbxLoader = new THREE.FBXLoader();
  var skin = null;

  function handleFBX(result) {

    scene.add(result);

    skin = result.getObjectByProperty("type", "SkinnedMesh");
    skin.castShadow = true;
    skin.receiveShadow = true;

    skin.material = new THREE.MeshStandardMaterial({
      skinning: true,
      color: new THREE.Color(),
      map: dataTex,
      metalness: 0.1,
      roughness: 0.5,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: dataTex,
      emissiveIntensity: 0.25
      // bumpMap: dataTex,
      // bumpScale: 0.125,
      // envMap: cubeCamera1.renderTarget.texture,
      // envMapIntensity: 1,
    });

    skin.skeleton.joints = [];

    // iterate through the bomnes and create colliders
    var p = new THREE.Vector3();
    var q = new THREE.Quaternion();
    var s = new THREE.Vector3();
    var invMat = new THREE.Matrix4();

    // create the colliders
    for (var i = 0; i < skin.skeleton.bones.length; i++) {

      var bone = skin.skeleton.bones[i];

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
          bone.collider = cannon.addBoxMesh(m, { mass: 1 });
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
    var angle = 1;
    var twistAngle = 1;

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

          var constraint = new CANNON.ConeTwistConstraint(a, b, {
            collideConnected: false,
            maxForce: Infinity,
            pivotA: localA,
            pivotB: localB,
            axisA: axisA,
            axisB: axisB,
            angle: angle,
            twistAngle: twistAngle
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

    skin.skeleton.bones.forEach(function (bone, i) {

      bone.collider.position.y += 15;
    });

    // console.log( "%c OKAY, WE GOT HERE ", 'background: #77ffaaaa; color: #ff00ff');
  }

  fbxLoader.load('static/longerOne.fbx', handleFBX);

  var scaledTime = 0;

  var boxRotGoal = new THREE.Vector3();
  var boxRotStart = new THREE.Vector3();
  var t = new _LilTween2.default({
    from: 0,
    to: 0.5,
    duration: 1000,
    ease: _eases.BounceOut,
    delay: 500,
    repeat: true,
    onStart: function onStart() {
      boxRotStart.copy(box.rotation);
      boxRotGoal.x = box.rotation.x + randf(-2, 2);
      boxRotGoal.y = box.rotation.y + randf(-2, 2);
    },
    onUpdate: function onUpdate(val, u) {

      var x = lerp(boxRotStart.x, boxRotGoal.x, u);
      var y = lerp(boxRotStart.y, boxRotGoal.y, u);

      box.collider.angularVelocity.x = 1000 * (box.rotation.x - x);
      box.collider.angularVelocity.y = 1000 * (box.rotation.y - y);

      box.rotation.x = x;
      box.rotation.y = y;
    }
  }).start();

  // UPDATE
  var deltaVec = new CANNON.Vec3();
  var attractPoint = new CANNON.Vec3(0, 0, 0);
  var lastRingTime = 0,
      nextRingTime = 1;
  var p = new THREE.Vector3();
  var q = new THREE.Quaternion();
  var scl = new THREE.Vector3();
  // var smoothing = 0.75
  var update = function update() {
    var delta = clock.getDelta();
    elapsedTime = clock.getElapsedTime();
    scaledTime += delta * timeScale;
    // groundPlane.position.y = sin(elapsedTime * 10) * 1 - 4
    // groundPlane.rotation.x = sin(elapsedTime * 4) * 0.5 - HALF_PI
    cannon.update(elapsedTime);

    // box.rotation.x = mapLinear( QuadraticInOut(sin(scaledTime) * 0.5 + 0.5), 0, 1, -1, 1)

    if (skin) {

      // attractPoint.x = sin(elapsedTime * 3) * 30
      // attractPoint.z = cos(elapsedTime * 3) * 30

      // var ROOT = skin.skeleton.bones[0]
      // attractPoint.vsub(ROOT.collider.position, deltaVec)
      // deltaVec.scale(100)
      // ROOT.collider.velocity.vadd(deltaVec, ROOT.collider.velocity)

      skin.skeleton.bones.forEach(function (bone, i) {

        if (bone.collider) {
          attractPoint.vsub(bone.collider.position, deltaVec);
          deltaVec.normalize();
          deltaVec.scale(0.2, deltaVec);

          bone.collider.velocity.vadd(deltaVec, bone.collider.velocity);
        }
      });

      skin.skeleton.joints.forEach(function (joint, i) {

        joint.update();

        var bone = skin.skeleton.bones[i];

        joint.transform.decompose(p, q, scl);

        // bone.position.lerp(p, smoothing)
        // bone.quaternion.slerp(q, smoothing)

        joint.transform.decompose(bone.position, bone.quaternion, new Vector3());
      });
    }
  };

  // draw function called once per rAf loop

  var draw = function draw() {

    if (!envRendered && skin) {

      envRendered = true;

      skin.visible = false;
      cubeCamera1.update(renderer, scene);
      skin.visible = true;
    }

    renderer.render(scene, camera, null, true);
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
        // setColors()
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
      "x": 0,
      "y": 9,
      "z": -4
    },
    "quaternion": {
      "x": 0,
      "y": 0,
      "z": 0,
      "w": 1
    }
  },
  "joint7": {
    "position": {
      "x": -3.8133470735474133,
      "y": 4.407961491078636,
      "z": 0.6291322558292463
    },
    "quaternion": {
      "x": 0.4849855175923957,
      "y": -0.21093553662315423,
      "z": 0.0171300096604098,
      "w": 0.848529203907663
    }
  },
  "joint8": {
    "position": {
      "x": -4.420811117529488,
      "y": 2.0854679573099455,
      "z": 2.2825601513162987
    },
    "quaternion": {
      "x": 0.3871301267272497,
      "y": -0.061303049280381106,
      "z": 0.07171778015001051,
      "w": 0.9171852381822473
    }
  },
  "joint9": {
    "position": {
      "x": -4.499911229608384,
      "y": 0.695438102394092,
      "z": 4.24546070724752
    },
    "quaternion": {
      "x": 0.15668581845168858,
      "y": -0.002140124035827941,
      "z": 0.014454589603266694,
      "w": 0.987540398669663
    }
  },
  "joint10": {
    "position": {
      "x": -4.503300763592835,
      "y": 0.3932096029740866,
      "z": 5.690606920808801
    },
    "quaternion": {
      "x": -0.0009638572569429733,
      "y": -0.0035897900123000046,
      "z": -0.0010790219267868741,
      "w": 0.9999925100212189
    }
  },
  "joint11": {
    "position": {
      "x": -4.497317238470219,
      "y": 0.39723993692409154,
      "z": 6.690496406411716
    },
    "quaternion": {
      "x": -0.003050508247861186,
      "y": 0.009570311274307228,
      "z": -0.00014620862311946753,
      "w": 0.9999495398091751
    }
  },
  "joint13": {
    "position": {
      "x": -1.8731934666201155,
      "y": 4.375742858347684,
      "z": 0.7259824965633197
    },
    "quaternion": {
      "x": 0.49006766435831983,
      "y": -0.0922702087575586,
      "z": 0.013291024937078925,
      "w": 0.8666852032787566
    }
  },
  "joint14": {
    "position": {
      "x": -2.031702292881518,
      "y": 2.0366390547489166,
      "z": 2.511585633677776
    },
    "quaternion": {
      "x": 0.37893993164865575,
      "y": -0.009357204589300824,
      "z": 0.07811405505908144,
      "w": 0.9220711281276585
    }
  },
  "joint15": {
    "position": {
      "x": -1.9679417137641055,
      "y": 0.6851023460440017,
      "z": 4.511939608772772
    },
    "quaternion": {
      "x": 0.15021888166254008,
      "y": 0.0005642109562577006,
      "z": -0.001586221849052268,
      "w": 0.988651330428629
    }
  },
  "joint16": {
    "position": {
      "x": -1.974542207651512,
      "y": 0.39422850759241285,
      "z": 5.96219917405631
    },
    "quaternion": {
      "x": -0.0007563652093666916,
      "y": -0.007241634525692502,
      "z": -0.001538635286717184,
      "w": 0.9999723092378713
    }
  },
  "joint17": {
    "position": {
      "x": -1.9898559095521207,
      "y": 0.39694402155976377,
      "z": 6.962084226350014
    },
    "quaternion": {
      "x": -0.00192270941752378,
      "y": -0.0080495822856465,
      "z": -0.0012650833359816173,
      "w": 0.9999649528746873
    }
  },
  "joint19": {
    "position": {
      "x": -0.04208971588203671,
      "y": 4.381207359217712,
      "z": 0.7718453090263825
    },
    "quaternion": {
      "x": 0.48533372587547663,
      "y": -0.013721098716448792,
      "z": -0.0033717046497924435,
      "w": 0.8742148120374053
    }
  },
  "joint20": {
    "position": {
      "x": -0.17911951266507395,
      "y": 2.0810336217455423,
      "z": 2.6422798789257955
    },
    "quaternion": {
      "x": 0.36530492451979846,
      "y": -0.030368258361558098,
      "z": -0.009933217713019716,
      "w": 0.9303394069862546
    }
  },
  "joint21": {
    "position": {
      "x": -0.3215887547671777,
      "y": 0.7218213476315768,
      "z": 4.664946192138323
    },
    "quaternion": {
      "x": 0.16894144605585673,
      "y": -0.02150126768997627,
      "z": -0.012043157864213708,
      "w": 0.9853179413980737
    }
  },
  "joint22": {
    "position": {
      "x": -0.37545252915388094,
      "y": 0.38574821882520205,
      "z": 6.100850595440358
    },
    "quaternion": {
      "x": 0.006984125637904027,
      "y": -0.008016899753406668,
      "z": -0.00168326282657941,
      "w": 0.9999420572881583
    }
  },
  "joint23": {
    "position": {
      "x": -0.3634218172009937,
      "y": 0.3896221682246464,
      "z": 7.100200025483128
    },
    "quaternion": {
      "x": -0.010835849532465247,
      "y": 0.020035186584774545,
      "z": -0.0011776143636850207,
      "w": 0.9997398606076651
    }
  },
  "joint25": {
    "position": {
      "x": 1.9118480970299563,
      "y": 4.378639614021742,
      "z": 0.7188279330368509
    },
    "quaternion": {
      "x": 0.4913843791175492,
      "y": 0.09855538833192239,
      "z": 0.0012486069311825603,
      "w": 0.865347715297577
    }
  },
  "joint26": {
    "position": {
      "x": 2.1906197083728864,
      "y": 2.051933935175798,
      "z": 2.5097086618052042
    },
    "quaternion": {
      "x": 0.3770362666621778,
      "y": 0.015961441658186182,
      "z": -0.020583632564859188,
      "w": 0.9258321662548102
    }
  },
  "joint27": {
    "position": {
      "x": 2.264304806671495,
      "y": 0.6969576954904,
      "z": 4.5099402703520814
    },
    "quaternion": {
      "x": 0.15472302932342033,
      "y": 0.03591498238831753,
      "z": -0.03372192709282699,
      "w": 0.9867288025948047
    }
  },
  "joint28": {
    "position": {
      "x": 2.373770467596273,
      "y": 0.3947192120444416,
      "z": 5.951367638065369
    },
    "quaternion": {
      "x": 0.0004571748871257161,
      "y": 0.049751426897212826,
      "z": -0.004624667227430132,
      "w": 0.99875081925666
    }
  },
  "joint29": {
    "position": {
      "x": 2.4978381812472312,
      "y": 0.3967437056370239,
      "z": 6.943314108509288
    },
    "quaternion": {
      "x": -0.00271476222001289,
      "y": 0.07462314746434914,
      "z": -0.00016246931846632354,
      "w": 0.9972080974061147
    }
  },
  "joint31": {
    "position": {
      "x": 3.8454656978934634,
      "y": 4.41047849986114,
      "z": 0.6081174846933709
    },
    "quaternion": {
      "x": 0.4904862504723648,
      "y": 0.21483479281051926,
      "z": -0.0011359702333466858,
      "w": 0.8445519282242218
    }
  },
  "joint32": {
    "position": {
      "x": 4.556270440286119,
      "y": 2.0802332591723873,
      "z": 2.2260470469533065
    },
    "quaternion": {
      "x": 0.389375724776761,
      "y": 0.08705770356677821,
      "z": -0.06423374084501723,
      "w": 0.9147029724130705
    }
  },
  "joint33": {
    "position": {
      "x": 4.808576744694304,
      "y": 0.6872472429236959,
      "z": 4.16716165010648
    },
    "quaternion": {
      "x": 0.15388051977409992,
      "y": 0.05235386025310763,
      "z": -0.015432711366942096,
      "w": 0.9865808078259559
    }
  },
  "joint34": {
    "position": {
      "x": 4.968181545892777,
      "y": 0.3918523421177009,
      "z": 5.604585920491217
    },
    "quaternion": {
      "x": -0.003125057584290625,
      "y": 0.0628113725204601,
      "z": -0.0017838559208906992,
      "w": 0.9980189293571763
    }
  },
  "joint35": {
    "position": {
      "x": 5.092665694384916,
      "y": 0.3975099881535796,
      "z": 6.596799577004324
    },
    "quaternion": {
      "x": -0.0026937187719606355,
      "y": 0.06188196746449536,
      "z": -0.000791108992489791,
      "w": 0.9980795259539508
    }
  },
  "joint37": {
    "position": {
      "x": -3.9987982248969827,
      "y": 6.234844475341125,
      "z": 0.7771264189847241
    },
    "quaternion": {
      "x": 0.39096965230923636,
      "y": -0.2869423707493358,
      "z": 0.05155714200057717,
      "w": 0.8730112645038882
    }
  },
  "joint38": {
    "position": {
      "x": -5.0061340519138735,
      "y": 3.809558971223724,
      "z": 2.124143398615481
    },
    "quaternion": {
      "x": 0.5148051586688601,
      "y": -0.2262205030132511,
      "z": 0.161412034401072,
      "w": 0.811015467038002
    }
  },
  "joint39": {
    "position": {
      "x": -5.620742481771164,
      "y": 1.662437744931237,
      "z": 3.1969093658293017
    },
    "quaternion": {
      "x": 0.3903246683094884,
      "y": -0.2752456504759675,
      "z": 0.1903115267901342,
      "w": 0.8577109116561112
    }
  },
  "joint40": {
    "position": {
      "x": -6.165820876082701,
      "y": 0.6731617190902265,
      "z": 4.103362332615272
    },
    "quaternion": {
      "x": 0.1932963013411804,
      "y": -0.27672298494976955,
      "z": 0.09529177274894075,
      "w": 0.9364723207520196
    }
  },
  "joint41": {
    "position": {
      "x": -6.659179391048006,
      "y": 0.42505728479377736,
      "z": 4.901961885602445
    },
    "quaternion": {
      "x": 0.043421062885863074,
      "y": -0.2760227924713609,
      "z": 0.010875210667183022,
      "w": 0.9601082017809859
    }
  },
  "joint43": {
    "position": {
      "x": -2.8930920996616276,
      "y": 5.284348502386823,
      "z": 0.7921419843627814
    },
    "quaternion": {
      "x": 0.443174054122274,
      "y": -0.18405316658133547,
      "z": 0.036638565272412264,
      "w": 0.8765721905005829
    }
  },
  "joint44": {
    "position": {
      "x": -3.4563707997625954,
      "y": 2.830205304645362,
      "z": 2.368372010711493
    },
    "quaternion": {
      "x": 0.4786401033671196,
      "y": -0.08561257767377593,
      "z": 0.07143928738514933,
      "w": 0.8709021565082192
    }
  },
  "joint45": {
    "position": {
      "x": -3.6265572039578813,
      "y": 1.0235436146058865,
      "z": 3.972120022943783
    },
    "quaternion": {
      "x": 0.27476042886407265,
      "y": -0.03542510424528749,
      "z": 0.03335313644199247,
      "w": 0.9602808636066448
    }
  },
  "joint46": {
    "position": {
      "x": -3.6895025654106735,
      "y": 0.4462088532987242,
      "z": 5.2968380222088465
    },
    "quaternion": {
      "x": 0.06315294555076079,
      "y": -0.014855567658086936,
      "z": 0.0018283023204387376,
      "w": 0.9978916148001464
    }
  },
  "joint47": {
    "position": {
      "x": -3.6993212263021116,
      "y": 0.3919849130454499,
      "z": 6.292080906884061
    },
    "quaternion": {
      "x": -0.00862692270403925,
      "y": 0.004776499154614689,
      "z": -0.0015027044457323183,
      "w": 0.9999502503324019
    }
  },
  "joint49": {
    "position": {
      "x": -1.9701983114036434,
      "y": 6.205321192852448,
      "z": 0.9580756242802095
    },
    "quaternion": {
      "x": 0.39415778485099673,
      "y": -0.1377608184826205,
      "z": 0.0378976299024626,
      "w": 0.9078685847522923
    }
  },
  "joint50": {
    "position": {
      "x": -2.514603757064232,
      "y": 3.776169728390115,
      "z": 2.564814436523267
    },
    "quaternion": {
      "x": 0.5271248696550117,
      "y": -0.09946573415067943,
      "z": 0.029535334094054483,
      "w": 0.8434296672283979
    }
  },
  "joint51": {
    "position": {
      "x": -2.785599170289837,
      "y": 1.6866643295882815,
      "z": 3.854733526322191
    },
    "quaternion": {
      "x": 0.4041471696360942,
      "y": -0.048425518225227206,
      "z": 0.03132732052588846,
      "w": 0.9128738321632518
    }
  },
  "joint52": {
    "position": {
      "x": -2.8648063465903664,
      "y": 0.7257720775560129,
      "z": 4.954877129364969
    },
    "quaternion": {
      "x": 0.2192190755400043,
      "y": -0.01944899908616304,
      "z": 0.011324190820650113,
      "w": 0.9754160630501171
    }
  },
  "joint53": {
    "position": {
      "x": -2.889538660333692,
      "y": 0.44905380797151484,
      "z": 5.894076276054623
    },
    "quaternion": {
      "x": 0.0663780790602118,
      "y": -0.008666288611172275,
      "z": -0.0017819737836550361,
      "w": 0.9977553160126075
    }
  },
  "joint55": {
    "position": {
      "x": -0.9904002878850319,
      "y": 5.264570589704822,
      "z": 0.8370490742453146
    },
    "quaternion": {
      "x": 0.45509470265824603,
      "y": -0.06917043926530167,
      "z": 0.01529195469142226,
      "w": 0.8876206498645485
    }
  },
  "joint56": {
    "position": {
      "x": -1.1574045683847036,
      "y": 2.818304027864423,
      "z": 2.544943092385807
    },
    "quaternion": {
      "x": 0.4609180597332396,
      "y": -0.016591671150916282,
      "z": 0.030401691493566935,
      "w": 0.8867665960186455
    }
  },
  "joint57": {
    "position": {
      "x": -1.1612680777676085,
      "y": 1.0703534105329442,
      "z": 4.240664937011918
    },
    "quaternion": {
      "x": 0.26630801241917373,
      "y": -0.002081520861930729,
      "z": 0.002692382940501688,
      "w": 0.9638819745520466
    }
  },
  "joint58": {
    "position": {
      "x": -1.1691136809851983,
      "y": 0.473132904241397,
      "z": 5.582427693601099
    },
    "quaternion": {
      "x": 0.08968960560870234,
      "y": -0.005425685258813724,
      "z": -0.0022878623721125854,
      "w": 0.9959523594384392
    }
  },
  "joint59": {
    "position": {
      "x": -1.1840108849579445,
      "y": 0.39002015885669294,
      "z": 6.573006602186748
    },
    "quaternion": {
      "x": -0.006183695194024087,
      "y": -0.009302672766051923,
      "z": -0.0011331399095799136,
      "w": 0.9999369671069774
    }
  },
  "joint61": {
    "position": {
      "x": -0.014897382805869426,
      "y": 6.210149772317187,
      "z": 0.9954747632980111
    },
    "quaternion": {
      "x": 0.3981486136097344,
      "y": -0.005225118408512784,
      "z": 0.000037957906477690845,
      "w": 0.9173060439010858
    }
  },
  "joint62": {
    "position": {
      "x": -0.10341077430787389,
      "y": 3.8449663702787165,
      "z": 2.8041809364969863
    },
    "quaternion": {
      "x": 0.4827174367974153,
      "y": -0.024719714501602204,
      "z": -0.0066503660061387,
      "w": 0.8754019559943176
    }
  },
  "joint63": {
    "position": {
      "x": -0.24511176002597712,
      "y": 1.9910888448280235,
      "z": 4.394380108076413
    },
    "quaternion": {
      "x": 0.3038743646169683,
      "y": -0.03340490539806242,
      "z": -0.006540465911750659,
      "w": 0.9521038310655185
    }
  },
  "joint64": {
    "position": {
      "x": -0.3423774862033727,
      "y": 1.2921179882526537,
      "z": 5.681508117631693
    },
    "quaternion": {
      "x": 0.12062509223192819,
      "y": -0.02913947415683783,
      "z": -0.0009728014140800067,
      "w": 0.9922698886025468
    }
  },
  "joint65": {
    "position": {
      "x": -0.38387881765143866,
      "y": 1.1799315144443516,
      "z": 6.661942720399681
    },
    "quaternion": {
      "x": -0.007167961477296023,
      "y": -0.012631619524051377,
      "z": -0.001007818268734214,
      "w": 0.9998940177932844
    }
  },
  "joint67": {
    "position": {
      "x": 0.9536160586961864,
      "y": 5.2563941306063775,
      "z": 0.8191309777041995
    },
    "quaternion": {
      "x": 0.4619171830925643,
      "y": 0.052831820492372415,
      "z": -0.010018479658236726,
      "w": 0.8852914462326119
    }
  },
  "joint68": {
    "position": {
      "x": 0.9118503757511751,
      "y": 2.7859310727366284,
      "z": 2.4622955181836907
    },
    "quaternion": {
      "x": 0.4764126463810668,
      "y": -0.035471129382459235,
      "z": -0.055317825844912655,
      "w": 0.8767626403379157
    }
  },
  "joint69": {
    "position": {
      "x": 0.6082468120164048,
      "y": 1.0256931119958432,
      "z": 4.096791258000839
    },
    "quaternion": {
      "x": 0.26619167298445523,
      "y": -0.05234873873806337,
      "z": -0.053131374856702815,
      "w": 0.961029999423591
    }
  },
  "joint70": {
    "position": {
      "x": 0.4545663012129751,
      "y": 0.4580444426933475,
      "z": 5.431136142142183
    },
    "quaternion": {
      "x": 0.07042191177979609,
      "y": -0.027585037025249726,
      "z": -0.0006514269475275314,
      "w": 0.9971355954515545
    }
  },
  "joint71": {
    "position": {
      "x": 0.42830932220486273,
      "y": 0.3946568319748024,
      "z": 6.424692313492728
    },
    "quaternion": {
      "x": -0.006763569501912483,
      "y": 0.0011609629419767663,
      "z": -0.0020615081789281797,
      "w": 0.9999743279088061
    }
  },
  "joint73": {
    "position": {
      "x": 1.987099762098593,
      "y": 6.244742753642584,
      "z": 0.9902791329486582
    },
    "quaternion": {
      "x": 0.3764050377772813,
      "y": 0.15073406395007835,
      "z": -0.0598876438388599,
      "w": 0.9121468958541751
    }
  },
  "joint74": {
    "position": {
      "x": 2.560324799087551,
      "y": 3.8976043954613013,
      "z": 2.713053446803076
    },
    "quaternion": {
      "x": 0.4820774469194714,
      "y": 0.16234134137774392,
      "z": -0.13075738243185006,
      "w": 0.8509695241257761
    }
  },
  "joint75": {
    "position": {
      "x": 2.9731872048949546,
      "y": 1.9072459534866337,
      "z": 4.12479634185385
    },
    "quaternion": {
      "x": 0.3569655010000746,
      "y": 0.1691984609853815,
      "z": -0.16567312929277028,
      "w": 0.9036038546433305
    }
  },
  "joint76": {
    "position": {
      "x": 3.2454322322767553,
      "y": 0.944626840255397,
      "z": 5.221735902582282
    },
    "quaternion": {
      "x": 0.26276698295469525,
      "y": 0.11366931417248555,
      "z": -0.08621440385942035,
      "w": 0.9542535702063725
    }
  },
  "joint77": {
    "position": {
      "x": 3.403750136446559,
      "y": 0.5304610739438279,
      "z": 6.106442687758271
    },
    "quaternion": {
      "x": 0.1573942168768907,
      "y": 0.07828494267990313,
      "z": -0.014307671836592518,
      "w": 0.9843240415482755
    }
  },
  "joint79": {
    "position": {
      "x": 2.8928166633553785,
      "y": 5.283760749988295,
      "z": 0.7916371473039308
    },
    "quaternion": {
      "x": 0.44268869926735355,
      "y": 0.18647490282778692,
      "z": -0.039130113164656484,
      "w": 0.8761978431838711
    }
  },
  "joint80": {
    "position": {
      "x": 3.5193522326771283,
      "y": 2.8236695488022074,
      "z": 2.34112656900376
    },
    "quaternion": {
      "x": 0.48098779724358426,
      "y": 0.11580052410420669,
      "z": -0.07851240907455742,
      "w": 0.8654922178398053
    }
  },
  "joint81": {
    "position": {
      "x": 3.857574648724568,
      "y": 1.0128458913710054,
      "z": 3.906731054387962
    },
    "quaternion": {
      "x": 0.2705876274538394,
      "y": 0.09427654527725884,
      "z": -0.041338649188801674,
      "w": 0.9571757335843468
    }
  },
  "joint82": {
    "position": {
      "x": 4.091709425285513,
      "y": 0.44339939680191226,
      "z": 5.214800731409325
    },
    "quaternion": {
      "x": 0.05910080453052953,
      "y": 0.08307663874439658,
      "z": -0.010225457858962858,
      "w": 0.9947365515604378
    }
  },
  "joint83": {
    "position": {
      "x": 4.236994590596406,
      "y": 0.392964623984625,
      "z": 6.1998718936988935
    },
    "quaternion": {
      "x": -0.009178665474064053,
      "y": 0.06386286958513061,
      "z": -0.0011187319408938838,
      "w": 0.9979158453633815
    }
  },
  "joint85": {
    "position": {
      "x": 4.004397575670297,
      "y": 6.240628811865961,
      "z": 0.7778047015303462
    },
    "quaternion": {
      "x": 0.3930060503112842,
      "y": 0.2840072508109633,
      "z": -0.04035564823206706,
      "w": 0.8736461226156118
    }
  },
  "joint86": {
    "position": {
      "x": 5.048569635454686,
      "y": 3.8204546914304363,
      "z": 2.113677143411897
    },
    "quaternion": {
      "x": 0.514740927468984,
      "y": 0.2337292695771159,
      "z": -0.15146091662897268,
      "w": 0.8108464693548522
    }
  },
  "joint87": {
    "position": {
      "x": 5.7888494464017795,
      "y": 1.676772189773005,
      "z": 3.116159766919484
    },
    "quaternion": {
      "x": 0.39575374481557896,
      "y": 0.3223270436037396,
      "z": -0.16114629014322115,
      "w": 0.8446988360351844
    }
  },
  "joint88": {
    "position": {
      "x": 6.493217541580558,
      "y": 0.6853603782535591,
      "z": 3.9064822162413138
    },
    "quaternion": {
      "x": 0.1941110396705652,
      "y": 0.3619126218693441,
      "z": -0.09555088940806017,
      "w": 0.9067580636217127
    }
  },
  "joint89": {
    "position": {
      "x": 7.1272326299619415,
      "y": 0.4295435939178935,
      "z": 4.594287802196107
    },
    "quaternion": {
      "x": 0.044708323046191226,
      "y": 0.3655386168659808,
      "z": -0.020659482593895936,
      "w": 0.9294922652766162
    }
  },
  "joint91": {
    "position": {
      "x": -4.14203844604828,
      "y": 7.983018549150843,
      "z": 0.8085315414144298
    },
    "quaternion": {
      "x": 0.3127608378007503,
      "y": -0.3424834575978836,
      "z": 0.10674949495526154,
      "w": 0.879482964551769
    }
  },
  "joint92": {
    "position": {
      "x": -5.47734142533709,
      "y": 5.677951148298128,
      "z": 1.9910596352638013
    },
    "quaternion": {
      "x": 0.559607183036862,
      "y": -0.2831174705029513,
      "z": 0.10683879395166149,
      "w": 0.7715372775806189
    }
  },
  "joint93": {
    "position": {
      "x": -6.095414104285014,
      "y": 3.288775591471414,
      "z": 2.3633372328925595
    },
    "quaternion": {
      "x": 0.6647183485006307,
      "y": -0.17838533313824467,
      "z": 0.10557492424386526,
      "w": 0.7177618863234895
    }
  },
  "joint94": {
    "position": {
      "x": -6.2287909454502435,
      "y": 1.7893668204861415,
      "z": 2.419191780308274
    },
    "quaternion": {
      "x": 0.6873984261266625,
      "y": -0.15584003765511292,
      "z": 0.1397695399786501,
      "w": 0.6954579513647082
    }
  },
  "joint95": {
    "position": {
      "x": -6.241508612919972,
      "y": 0.7894871562008681,
      "z": 2.4232998501127563
    },
    "quaternion": {
      "x": 0.6918010870182006,
      "y": -0.14317914846185714,
      "z": 0.14334513294895881,
      "w": 0.6930823618488776
    }
  },
  "joint97": {
    "position": {
      "x": -3.0370223259738975,
      "y": 7.143370417928668,
      "z": 0.9801686214886354
    },
    "quaternion": {
      "x": 0.3359298251185969,
      "y": -0.23695384079972814,
      "z": 0.07847977941428912,
      "w": 0.908209752286954
    }
  },
  "joint98": {
    "position": {
      "x": -3.958429628336007,
      "y": 4.8373645370777645,
      "z": 2.5465950313467567
    },
    "quaternion": {
      "x": 0.48809289352741253,
      "y": -0.2665080702523891,
      "z": 0.20744892326289638,
      "w": 0.804800422474697
    }
  },
  "joint99": {
    "position": {
      "x": -4.604785716524078,
      "y": 2.6414414785501386,
      "z": 3.549847581362746
    },
    "quaternion": {
      "x": 0.4152265997022149,
      "y": -0.32865423956627193,
      "z": 0.27100099490445057,
      "w": 0.8038231910536359
    }
  },
  "joint100": {
    "position": {
      "x": -5.130040605306254,
      "y": 1.4514198687957107,
      "z": 4.272819366626433
    },
    "quaternion": {
      "x": 0.2782732079145731,
      "y": -0.36963686991460004,
      "z": 0.3159634827940957,
      "w": 0.8283113446629203
    }
  },
  "joint101": {
    "position": {
      "x": -5.515875823641449,
      "y": 0.7482306200387789,
      "z": 4.867999179029249
    },
    "quaternion": {
      "x": 0.2837057737329964,
      "y": -0.33193935151835274,
      "z": 0.36832865446060925,
      "w": 0.8207687269672099
    }
  },
  "joint103": {
    "position": {
      "x": -2.121128366510278,
      "y": 8.077568277040458,
      "z": 1.1162268878393893
    },
    "quaternion": {
      "x": 0.2889535329749564,
      "y": -0.1880369408720843,
      "z": 0.07111954223462638,
      "w": 0.9359967817044547
    }
  },
  "joint104": {
    "position": {
      "x": -2.956360024057579,
      "y": 5.924202845250883,
      "z": 2.883139736186212
    },
    "quaternion": {
      "x": 0.5015842352530205,
      "y": -0.20223330808781384,
      "z": 0.10362194035894542,
      "w": 0.8347319554933483
    }
  },
  "joint105": {
    "position": {
      "x": -3.441808474245671,
      "y": 3.6537804720285094,
      "z": 3.7952802021832976
    },
    "quaternion": {
      "x": 0.5727976537074699,
      "y": -0.15446190810201754,
      "z": 0.10667384806561946,
      "w": 0.797912938227959
    }
  },
  "joint106": {
    "position": {
      "x": -3.6185219709774286,
      "y": 2.283383212497262,
      "z": 4.344549315208939
    },
    "quaternion": {
      "x": 0.4777863531387483,
      "y": -0.09842833783152144,
      "z": 0.07380301390738385,
      "w": 0.8698190491155534
    }
  },
  "joint107": {
    "position": {
      "x": -3.703380752135852,
      "y": 1.5031636173557326,
      "z": 4.952629943156842
    },
    "quaternion": {
      "x": 0.3879270045680939,
      "y": -0.04652492492105935,
      "z": 0.017675561462124886,
      "w": 0.9203453944117472
    }
  },
  "joint109": {
    "position": {
      "x": -1.0007256690873596,
      "y": 7.109441805449493,
      "z": 1.0543521115579024
    },
    "quaternion": {
      "x": 0.3623055180584471,
      "y": -0.07257417474424623,
      "z": 0.024754198970065762,
      "w": 0.9288998494875227
    }
  },
  "joint110": {
    "position": {
      "x": -1.179923883332263,
      "y": 4.740483492332354,
      "z": 2.7506571285975894
    },
    "quaternion": {
      "x": 0.5444865934723697,
      "y": -0.017557123670742077,
      "z": 0.027340632871139015,
      "w": 0.8381399565296183
    }
  },
  "joint111": {
    "position": {
      "x": -1.1692086139995468,
      "y": 2.585487669609636,
      "z": 3.967631555713116
    },
    "quaternion": {
      "x": 0.43179255209973216,
      "y": 0.00821102148998002,
      "z": -0.007393122130761502,
      "w": 0.9019052682086133
    }
  },
  "joint112": {
    "position": {
      "x": -1.1649148409478385,
      "y": 1.563686796719296,
      "z": 5.013837429871335
    },
    "quaternion": {
      "x": 0.24126869921241065,
      "y": -0.004570219015782615,
      "z": 0.0012937698551175407,
      "w": 0.9704467291088476
    }
  },
  "joint113": {
    "position": {
      "x": -1.1736558648541193,
      "y": 1.2510200047877917,
      "z": 5.93977703000137
    },
    "quaternion": {
      "x": 0.08313372701770926,
      "y": -0.0048757187758198366,
      "z": 0.000747444154245945,
      "w": 0.9965261923932558
    }
  },
  "joint115": {
    "position": {
      "x": 0.003734297333387559,
      "y": 8.083053648256808,
      "z": 1.1912059655145486
    },
    "quaternion": {
      "x": 0.3002209575976605,
      "y": 0.002152353904466927,
      "z": -0.003220365748725312,
      "w": 0.9538618208295467
    }
  },
  "joint116": {
    "position": {
      "x": 0.010543435740674921,
      "y": 5.914584577101258,
      "z": 3.098642385875948
    },
    "quaternion": {
      "x": 0.5228684918948668,
      "y": 0.007531547702306783,
      "z": -0.010339337223304624,
      "w": 0.8523173787261282
    }
  },
  "joint117": {
    "position": {
      "x": -0.07035316648658857,
      "y": 3.7040357801166923,
      "z": 4.246924709391357
    },
    "quaternion": {
      "x": 0.5052582187194213,
      "y": -0.02926784207322284,
      "z": -0.03415096212128714,
      "w": 0.8617953571602975
    }
  },
  "joint118": {
    "position": {
      "x": -0.21191454905574136,
      "y": 2.5362849733464645,
      "z": 5.106716392861431
    },
    "quaternion": {
      "x": 0.3156365556879386,
      "y": -0.051020305513330984,
      "z": -0.03574983095676626,
      "w": 0.9468328483556873
    }
  },
  "joint119": {
    "position": {
      "x": -0.3326639180497973,
      "y": 2.0910828201831424,
      "z": 5.967371935802561
    },
    "quaternion": {
      "x": 0.15510913273861107,
      "y": -0.0665190120408335,
      "z": 0.011833302555274093,
      "w": 0.9855842688115627
    }
  },
  "joint121": {
    "position": {
      "x": 1.0503140764371768,
      "y": 7.113413450084942,
      "z": 1.05536845242756
    },
    "quaternion": {
      "x": 0.35792671487859634,
      "y": 0.09438893589168246,
      "z": -0.03952491333699607,
      "w": 0.9281255177954946
    }
  },
  "joint122": {
    "position": {
      "x": 1.3658361938345769,
      "y": 4.750015671048364,
      "z": 2.7566138405101595
    },
    "quaternion": {
      "x": 0.5312657360751827,
      "y": 0.11737780393412323,
      "z": -0.12796858328476426,
      "w": 0.8292184335313507
    }
  },
  "joint123": {
    "position": {
      "x": 1.4384125270408132,
      "y": 2.5204819027055048,
      "z": 3.871416480281946
    },
    "quaternion": {
      "x": 0.4802324479818895,
      "y": 0.10806324496293879,
      "z": -0.2081531515529684,
      "w": 0.8452049434852877
    }
  },
  "joint124": {
    "position": {
      "x": 1.4248977041771915,
      "y": 1.330804919590873,
      "z": 4.751738953478798
    },
    "quaternion": {
      "x": 0.34104199085102166,
      "y": 0.10548313604320081,
      "z": -0.2754069955017376,
      "w": 0.892588738062255
    }
  },
  "joint125": {
    "position": {
      "x": 1.4036595746151197,
      "y": 0.7335997734180436,
      "z": 5.548663584525316
    },
    "quaternion": {
      "x": 0.26675871832492803,
      "y": 0.0577045991082321,
      "z": -0.2797373170945939,
      "w": 0.920465642413729
    }
  },
  "joint127": {
    "position": {
      "x": 2.1437252443164123,
      "y": 8.079609959516258,
      "z": 1.108464400004339
    },
    "quaternion": {
      "x": 0.2850727032348362,
      "y": 0.1998796507265185,
      "z": -0.08624489326799718,
      "w": 0.9334578177298747
    }
  },
  "joint128": {
    "position": {
      "x": 3.036803476540274,
      "y": 5.932321937423115,
      "z": 2.8553989496199286
    },
    "quaternion": {
      "x": 0.5059029926201418,
      "y": 0.20266797838164297,
      "z": -0.07788289694875074,
      "w": 0.8348186072192887
    }
  },
  "joint129": {
    "position": {
      "x": 3.630797193537053,
      "y": 3.6695762993936287,
      "z": 3.726274867567588
    },
    "quaternion": {
      "x": 0.5815056383631256,
      "y": 0.16795602257644954,
      "z": -0.06374944431022647,
      "w": 0.7934594982620916
    }
  },
  "joint130": {
    "position": {
      "x": 3.9119176344932605,
      "y": 2.2976624363728946,
      "z": 4.230300202210972
    },
    "quaternion": {
      "x": 0.4915841046763437,
      "y": 0.11335213938909981,
      "z": -0.022884511288724856,
      "w": 0.8631179871075263
    }
  },
  "joint131": {
    "position": {
      "x": 4.075866995084601,
      "y": 1.5072757759713002,
      "z": 4.808426252910852
    },
    "quaternion": {
      "x": 0.3935155716142466,
      "y": 0.1064060171473873,
      "z": -0.04655593860844069,
      "w": 0.9119516429023139
    }
  },
  "joint133": {
    "position": {
      "x": 3.0389683644860024,
      "y": 7.137137917357059,
      "z": 0.9813126911568465
    },
    "quaternion": {
      "x": 0.33463505545823696,
      "y": 0.23978792026753448,
      "z": -0.08465772211397429,
      "w": 0.907388672531626
    }
  },
  "joint134": {
    "position": {
      "x": 4.00434377586483,
      "y": 4.831986876279371,
      "z": 2.5373108005000904
    },
    "quaternion": {
      "x": 0.47990521111096096,
      "y": 0.28722943251853134,
      "z": -0.21533699935336706,
      "w": 0.800512472203347
    }
  },
  "joint135": {
    "position": {
      "x": 4.75967294222764,
      "y": 2.6489276192730764,
      "z": 3.5002918542910035
    },
    "quaternion": {
      "x": 0.39887488010429883,
      "y": 0.3704055611929632,
      "z": -0.27364220239441167,
      "w": 0.7929807660516381
    }
  },
  "joint136": {
    "position": {
      "x": 5.4003474260762685,
      "y": 1.4691753617350278,
      "z": 4.154137431859684
    },
    "quaternion": {
      "x": 0.2635131195168625,
      "y": 0.4292867038256965,
      "z": -0.31285326845489353,
      "w": 0.8052307707595697
    }
  },
  "joint137": {
    "position": {
      "x": 5.875272573263787,
      "y": 0.7325932236955738,
      "z": 4.633892154136701
    },
    "quaternion": {
      "x": 0.29809579867842395,
      "y": 0.4214330100145764,
      "z": -0.38146600798368463,
      "w": 0.7668225333369632
    }
  },
  "joint139": {
    "position": {
      "x": 4.147962985062822,
      "y": 7.985546028329722,
      "z": 0.8048332896994335
    },
    "quaternion": {
      "x": 0.31313441041628226,
      "y": 0.3438073937156506,
      "z": -0.1041782338911414,
      "w": 0.879141747742093
    }
  },
  "joint140": {
    "position": {
      "x": 5.505700905389833,
      "y": 5.685286114728033,
      "z": 1.9740838537431222
    },
    "quaternion": {
      "x": 0.555416015508527,
      "y": 0.29753726760006116,
      "z": -0.11545778167975215,
      "w": 0.7678893961732458
    }
  },
  "joint141": {
    "position": {
      "x": 6.163378769760229,
      "y": 3.301492766059049,
      "z": 2.320579779757565
    },
    "quaternion": {
      "x": 0.6626753166031454,
      "y": 0.20434819071362237,
      "z": -0.11706040579511523,
      "w": 0.7109149760077312
    }
  },
  "joint142": {
    "position": {
      "x": 6.322690153982172,
      "y": 1.8041495794979847,
      "z": 2.3604796285267677
    },
    "quaternion": {
      "x": 0.681251781374715,
      "y": 0.18491361471850562,
      "z": -0.16150212812512588,
      "w": 0.6896521065555944
    }
  },
  "joint143": {
    "position": {
      "x": 6.341665497963684,
      "y": 0.8044203912588087,
      "z": 2.362805412103605
    },
    "quaternion": {
      "x": 0.6862031329422147,
      "y": 0.1688268875120235,
      "z": -0.16772550202974892,
      "w": 0.687379733744137
    }
  },
  "joint145": {
    "position": {
      "x": -4.126997242238298,
      "y": 9.922605482946345,
      "z": 1.072702882727992
    },
    "quaternion": {
      "x": 0.1724496521358617,
      "y": -0.31917174913123586,
      "z": 0.16402752978340726,
      "w": 0.9173251776267133
    }
  },
  "joint146": {
    "position": {
      "x": -5.4196642930892525,
      "y": 8.03260626387223,
      "z": 2.7885513584018065
    },
    "quaternion": {
      "x": 0.4434506042447123,
      "y": -0.3163066263112502,
      "z": 0.23003741028025995,
      "w": 0.8064641775169844
    }
  },
  "joint147": {
    "position": {
      "x": -6.053593718281744,
      "y": 5.756204190797276,
      "z": 3.5742857254342266
    },
    "quaternion": {
      "x": 0.5562002623615051,
      "y": -0.32110819150932846,
      "z": 0.2789015108790937,
      "w": 0.7139641060473279
    }
  },
  "joint148": {
    "position": {
      "x": -6.262859711239981,
      "y": 4.280604101005837,
      "z": 3.801860821911068
    },
    "quaternion": {
      "x": 0.5920833877348125,
      "y": -0.3110762381344662,
      "z": 0.27408474242464154,
      "w": 0.6910473138697484
    }
  },
  "joint149": {
    "position": {
      "x": -6.406968706699686,
      "y": 3.30153562451337,
      "z": 3.942602857471099
    },
    "quaternion": {
      "x": 0.560421736645075,
      "y": -0.31280533710797526,
      "z": 0.24824209505997333,
      "w": 0.7255729876537022
    }
  },
  "joint151": {
    "position": {
      "x": -3.17562772786989,
      "y": 8.98588397435561,
      "z": 1.0775564084888059
    },
    "quaternion": {
      "x": 0.23642946408515286,
      "y": -0.2723043443450373,
      "z": 0.11272751343967954,
      "w": 0.9258747000955009
    }
  },
  "joint152": {
    "position": {
      "x": -4.336090613772342,
      "y": 6.944632169078421,
      "z": 2.757741898520596
    },
    "quaternion": {
      "x": 0.47790797698567883,
      "y": -0.28852327327917815,
      "z": 0.1761735937843109,
      "w": 0.8107534465932569
    }
  },
  "joint153": {
    "position": {
      "x": -5.02937213173647,
      "y": 4.653500727034679,
      "z": 3.466118009033239
    },
    "quaternion": {
      "x": 0.5722104169141378,
      "y": -0.31853868061575785,
      "z": 0.21262728942515682,
      "w": 0.7251882400578704
    }
  },
  "joint154": {
    "position": {
      "x": -5.429203872185763,
      "y": 3.2145771727618704,
      "z": 3.667967383655807
    },
    "quaternion": {
      "x": 0.5434799693445918,
      "y": -0.3800363527919106,
      "z": 0.1943100597273584,
      "w": 0.7228039112833952
    }
  },
  "joint155": {
    "position": {
      "x": -5.846652994806322,
      "y": 2.3188661071613677,
      "z": 3.8123256411760895
    },
    "quaternion": {
      "x": 0.48622457588903906,
      "y": -0.42344046791990136,
      "z": 0.15499161985032534,
      "w": 0.748506132042665
    }
  },
  "joint157": {
    "position": {
      "x": -2.1098005043559978,
      "y": 9.960651502795018,
      "z": 1.2696026017332525
    },
    "quaternion": {
      "x": 0.186933959622019,
      "y": -0.17518330984785396,
      "z": 0.09704012700028157,
      "w": 0.9617430615515525
    }
  },
  "joint158": {
    "position": {
      "x": -2.77202553518036,
      "y": 8.126247998949788,
      "z": 3.322142742007572
    },
    "quaternion": {
      "x": 0.46885547383260484,
      "y": -0.17137618895005122,
      "z": 0.17526338247846535,
      "w": 0.8485796917675836
    }
  },
  "joint159": {
    "position": {
      "x": -2.967219327934719,
      "y": 5.856611096734572,
      "z": 4.300573012032886
    },
    "quaternion": {
      "x": 0.5966439753898649,
      "y": -0.17944681626990344,
      "z": 0.22604718829488055,
      "w": 0.7488107073390128
    }
  },
  "joint160": {
    "position": {
      "x": -2.9464833066649634,
      "y": 4.376220194001589,
      "z": 4.5675166298968195
    },
    "quaternion": {
      "x": 0.6518062359368952,
      "y": -0.17930503114504626,
      "z": 0.22147439123094828,
      "w": 0.7028139374178142
    }
  },
  "joint161": {
    "position": {
      "x": -2.906118301117707,
      "y": 3.3791970135168117,
      "z": 4.631722067895599
    },
    "quaternion": {
      "x": 0.675939379935319,
      "y": -0.14797027374299485,
      "z": 0.18384804548864186,
      "w": 0.6981480136125046
    }
  },
  "joint163": {
    "position": {
      "x": -1.119304559469365,
      "y": 8.971760506706588,
      "z": 1.2186331863163071
    },
    "quaternion": {
      "x": 0.2594882830867961,
      "y": -0.10814130377655243,
      "z": 0.034298018111789445,
      "w": 0.9590594013468496
    }
  },
  "joint164": {
    "position": {
      "x": -1.5981365378430457,
      "y": 6.900941277836427,
      "z": 3.139143330202227
    },
    "quaternion": {
      "x": 0.52534857511475,
      "y": -0.07929894408136576,
      "z": 0.015116226243803852,
      "w": 0.8470490256157718
    }
  },
  "joint165": {
    "position": {
      "x": -1.8618468890536277,
      "y": 4.567026728209497,
      "z": 3.966569645100381
    },
    "quaternion": {
      "x": 0.6419260451922283,
      "y": -0.039798716745710304,
      "z": -0.010154174950347017,
      "w": 0.7656656629236666
    }
  },
  "joint166": {
    "position": {
      "x": -1.9562973502589736,
      "y": 3.078339396368843,
      "z": 4.174314588531148
    },
    "quaternion": {
      "x": 0.682414453765272,
      "y": 0.0068434059311394315,
      "z": -0.03135413833285343,
      "w": 0.7302606377841485
    }
  },
  "joint167": {
    "position": {
      "x": -1.9763844594787896,
      "y": 2.0797793039051933,
      "z": 4.211616369960908
    },
    "quaternion": {
      "x": 0.7049506712756047,
      "y": -0.0033902710708373714,
      "z": -0.0010654655717956029,
      "w": 0.709247433490778
    }
  },
  "joint169": {
    "position": {
      "x": 0.001957456902331074,
      "y": 10.020336788469603,
      "z": 1.3698341441058008
    },
    "quaternion": {
      "x": 0.18083372234602785,
      "y": 0.001240350438812991,
      "z": -0.003400734470990199,
      "w": 0.9835070215297532
    }
  },
  "joint170": {
    "position": {
      "x": 0.0065491003767850975,
      "y": 8.280275352997903,
      "z": 3.607728720091928
    },
    "quaternion": {
      "x": 0.46895875181002417,
      "y": 0.0035537344441246214,
      "z": -0.004755797473602145,
      "w": 0.8832001146188077
    }
  },
  "joint171": {
    "position": {
      "x": 0.011670724896938682,
      "y": 6.06519769541836,
      "z": 4.725956634433276
    },
    "quaternion": {
      "x": 0.6012164204781562,
      "y": 0.007764979027454597,
      "z": -0.008490855100320051,
      "w": 0.7990033956297066
    }
  },
  "joint172": {
    "position": {
      "x": 0.01631271126443814,
      "y": 4.605633474756458,
      "z": 5.095258470795927
    },
    "quaternion": {
      "x": 0.6382484418100332,
      "y": 0.013329952781487084,
      "z": -0.012561203700893888,
      "w": 0.7696125356616097
    }
  },
  "joint173": {
    "position": {
      "x": 0.02218075554762862,
      "y": 3.6323902781433763,
      "z": 5.32492664187698
    },
    "quaternion": {
      "x": 0.6020314925389108,
      "y": 0.018532675727148954,
      "z": -0.01876144618973744,
      "w": 0.7980367347801939
    }
  },
  "joint175": {
    "position": {
      "x": 1.1222205546574284,
      "y": 8.996805345773073,
      "z": 1.2342553813766473
    },
    "quaternion": {
      "x": 0.2502645497125835,
      "y": 0.11143029255512495,
      "z": -0.04495814607331922,
      "w": 0.960692307744726
    }
  },
  "joint176": {
    "position": {
      "x": 1.6112974218288478,
      "y": 6.9645668596342425,
      "z": 3.2029074790293026
    },
    "quaternion": {
      "x": 0.5006330305288482,
      "y": 0.13911810682723938,
      "z": -0.11113564930742897,
      "w": 0.847149094639971
    }
  },
  "joint177": {
    "position": {
      "x": 1.890825134696872,
      "y": 4.658863780035236,
      "z": 4.104865949483089
    },
    "quaternion": {
      "x": 0.6025418278347956,
      "y": 0.1776749908232378,
      "z": -0.15667955238680165,
      "w": 0.7621197157988616
    }
  },
  "joint178": {
    "position": {
      "x": 2.0384979749135255,
      "y": 3.1902882610509895,
      "z": 4.410446214801965
    },
    "quaternion": {
      "x": 0.5931505972017581,
      "y": 0.2293186272149355,
      "z": -0.1875190395785878,
      "w": 0.7486133488303418
    }
  },
  "joint179": {
    "position": {
      "x": 2.1974261064732734,
      "y": 2.234060129436724,
      "z": 4.6525001215087824
    },
    "quaternion": {
      "x": 0.5266482271430103,
      "y": 0.27562638888589835,
      "z": -0.22369748721368765,
      "w": 0.7724190396482506
    }
  },
  "joint181": {
    "position": {
      "x": 2.127878046196836,
      "y": 9.962215621311397,
      "z": 1.264413757395548
    },
    "quaternion": {
      "x": 0.18625031091157998,
      "y": 0.18058727749492365,
      "z": -0.09586449418824552,
      "w": 0.9609937854358597
    }
  },
  "joint182": {
    "position": {
      "x": 2.8383260475103493,
      "y": 8.12980351335314,
      "z": 3.3054559677644577
    },
    "quaternion": {
      "x": 0.4670861465921794,
      "y": 0.18269016008635608,
      "z": -0.1734707054425613,
      "w": 0.84756283036867
    }
  },
  "joint183": {
    "position": {
      "x": 3.0983532723611233,
      "y": 5.860196176874847,
      "z": 4.2706491314872626
    },
    "quaternion": {
      "x": 0.5936192469655969,
      "y": 0.19735895717798835,
      "z": -0.2241787362027704,
      "w": 0.7472680415273647
    }
  },
  "joint184": {
    "position": {
      "x": 3.127224490548193,
      "y": 4.378077431980505,
      "z": 4.525116781536862
    },
    "quaternion": {
      "x": 0.6395092931119646,
      "y": 0.23301902478092762,
      "z": -0.2516822935028724,
      "w": 0.6880305380219071
    }
  },
  "joint185": {
    "position": {
      "x": 3.125967773406642,
      "y": 3.3794875161385316,
      "z": 4.570251600778364
    },
    "quaternion": {
      "x": 0.6684882209337707,
      "y": 0.2114652812180492,
      "z": -0.21590688036476294,
      "w": 0.6795514346415064
    }
  },
  "joint187": {
    "position": {
      "x": 3.1850157290786103,
      "y": 8.989028904340827,
      "z": 1.0746013533914498
    },
    "quaternion": {
      "x": 0.23385270709856082,
      "y": 0.27649959781633426,
      "z": -0.11709429370680961,
      "w": 0.9247431049601741
    }
  },
  "joint188": {
    "position": {
      "x": 4.378910315987371,
      "y": 6.95536102076905,
      "z": 2.741159278632308
    },
    "quaternion": {
      "x": 0.47585712276689807,
      "y": 0.29815227799387795,
      "z": -0.1743626814364395,
      "w": 0.8088651761334306
    }
  },
  "joint189": {
    "position": {
      "x": 5.130503106057254,
      "y": 4.674057047455828,
      "z": 3.4221446540980103
    },
    "quaternion": {
      "x": 0.5698686389575723,
      "y": 0.33547517267797283,
      "z": -0.20529432102918668,
      "w": 0.7214987072770772
    }
  },
  "joint190": {
    "position": {
      "x": 5.583060602549223,
      "y": 3.246053923732661,
      "z": 3.587547694369566
    },
    "quaternion": {
      "x": 0.5449299689208665,
      "y": 0.40376118601848077,
      "z": -0.1810210065116426,
      "w": 0.7122216149755392
    }
  },
  "joint191": {
    "position": {
      "x": 6.043046957372914,
      "y": 2.364101541350753,
      "z": 3.679686519474923
    },
    "quaternion": {
      "x": 0.4913423043394974,
      "y": 0.4542625620939383,
      "z": -0.13815077489708347,
      "w": 0.7301661646786567
    }
  },
  "joint193": {
    "position": {
      "x": 4.129073645898761,
      "y": 9.925948661344478,
      "z": 1.0733205919901372
    },
    "quaternion": {
      "x": 0.17139022871367224,
      "y": 0.31954854194527965,
      "z": -0.16378094490818115,
      "w": 0.9174366032195928
    }
  },
  "joint194": {
    "position": {
      "x": 5.42833303873977,
      "y": 8.041513388201517,
      "z": 2.7923485915031416
    },
    "quaternion": {
      "x": 0.4407279669662442,
      "y": 0.3185677992976424,
      "z": -0.23189527916723915,
      "w": 0.8065345596342456
    }
  },
  "joint195": {
    "position": {
      "x": 6.070474109842115,
      "y": 5.769788239086962,
      "z": 3.587155560971652
    },
    "quaternion": {
      "x": 0.5512506644872105,
      "y": 0.3248387588416373,
      "z": -0.28355000811619857,
      "w": 0.7142841721289482
    }
  },
  "joint196": {
    "position": {
      "x": 6.28646205345206,
      "y": 4.297018245099448,
      "z": 3.829181890300138
    },
    "quaternion": {
      "x": 0.5849734825406107,
      "y": 0.31095408411764713,
      "z": -0.27467112324979004,
      "w": 0.6968998180137257
    }
  },
  "joint197": {
    "position": {
      "x": 6.4363847174577495,
      "y": 3.322442998114021,
      "z": 3.9927480041878574
    },
    "quaternion": {
      "x": 0.5500783348333133,
      "y": 0.30813834762408254,
      "z": -0.2480003088532887,
      "w": 0.7355001230993662
    }
  },
  "joint199": {
    "position": {
      "x": -4.107735031727418,
      "y": 11.861005261258903,
      "z": 1.2170317329777802
    },
    "quaternion": {
      "x": 0.06576988748475322,
      "y": -0.28904369273920655,
      "z": 0.18283898852607233,
      "w": 0.937388910678321
    }
  },
  "joint200": {
    "position": {
      "x": -5.3729549979107745,
      "y": 10.387240979339296,
      "z": 3.228075591772665
    },
    "quaternion": {
      "x": 0.3892100536543592,
      "y": -0.29233763892919695,
      "z": 0.233941270198898,
      "w": 0.8416208891759992
    }
  },
  "joint201": {
    "position": {
      "x": -5.990940906248365,
      "y": 8.23152938573684,
      "z": 4.264828129530396
    },
    "quaternion": {
      "x": 0.5414038512214758,
      "y": -0.2895502140312878,
      "z": 0.276788245468665,
      "w": 0.7392095850348314
    }
  },
  "joint202": {
    "position": {
      "x": -6.1404814079075924,
      "y": 6.7664157201723105,
      "z": 4.56503776574194
    },
    "quaternion": {
      "x": 0.5970603640825167,
      "y": -0.2996021270129357,
      "z": 0.31322374311890544,
      "w": 0.6750173137613279
    }
  },
  "joint203": {
    "position": {
      "x": -6.145182009467371,
      "y": 5.770486245344032,
      "z": 4.649135002885208
    },
    "quaternion": {
      "x": 0.6093251163724775,
      "y": -0.3136948875075874,
      "z": 0.34704882409780946,
      "w": 0.6402152245937272
    }
  },
  "joint205": {
    "position": {
      "x": -3.1615150362071116,
      "y": 10.920200369517065,
      "z": 1.2386258854347425
    },
    "quaternion": {
      "x": 0.12244715535621141,
      "y": -0.2513432629578366,
      "z": 0.1416783225008044,
      "w": 0.9496107156325889
    }
  },
  "joint206": {
    "position": {
      "x": -4.237223668629897,
      "y": 9.279027471700026,
      "z": 3.2521510478032805
    },
    "quaternion": {
      "x": 0.4321920890200254,
      "y": -0.2470998631441561,
      "z": 0.1862226822155821,
      "w": 0.8470376428772691
    }
  },
  "joint207": {
    "position": {
      "x": -4.751724718790387,
      "y": 7.064276404827449,
      "z": 4.228712786007814
    },
    "quaternion": {
      "x": 0.5784616186568784,
      "y": -0.2369265548638905,
      "z": 0.214858912004491,
      "w": 0.7503889733154655
    }
  },
  "joint208": {
    "position": {
      "x": -4.880635496412574,
      "y": 5.5885790677575455,
      "z": 4.487216017193305
    },
    "quaternion": {
      "x": 0.6361617192833812,
      "y": -0.2359170824751214,
      "z": 0.23230079612551233,
      "w": 0.6969058309659149
    }
  },
  "joint209": {
    "position": {
      "x": -4.898203447431989,
      "y": 4.590495384691775,
      "z": 4.536890586388377
    },
    "quaternion": {
      "x": 0.6529367756293262,
      "y": -0.25228327572082593,
      "z": 0.2567761910455685,
      "w": 0.6664028087684492
    }
  },
  "joint211": {
    "position": {
      "x": -2.1303740290712594,
      "y": 11.935481258411269,
      "z": 1.383458599221561
    },
    "quaternion": {
      "x": 0.07341298834812614,
      "y": -0.16743608650474803,
      "z": 0.1016624850845096,
      "w": 0.9778754671246305
    }
  },
  "joint212": {
    "position": {
      "x": -2.8681524210952687,
      "y": 10.576446954414616,
      "z": 3.6830146589904165
    },
    "quaternion": {
      "x": 0.41047992332142297,
      "y": -0.15573702130638029,
      "z": 0.12880412211284126,
      "w": 0.889191605263677
    }
  },
  "joint213": {
    "position": {
      "x": -3.186139525781735,
      "y": 8.461146645536965,
      "z": 4.901799195989367
    },
    "quaternion": {
      "x": 0.578983945495946,
      "y": -0.13054741857826732,
      "z": 0.13729249786684733,
      "w": 0.793023160059011
    }
  },
  "joint214": {
    "position": {
      "x": -3.227100897580664,
      "y": 7.003664696457185,
      "z": 5.261122367089059
    },
    "quaternion": {
      "x": 0.6526032758751091,
      "y": -0.10362648066690748,
      "z": 0.13117993334560876,
      "w": 0.7390279709923764
    }
  },
  "joint215": {
    "position": {
      "x": -3.1896605643001608,
      "y": 6.009201026802871,
      "z": 5.351291186857108
    },
    "quaternion": {
      "x": 0.6824457678607113,
      "y": -0.08652768418704476,
      "z": 0.13088168012741402,
      "w": 0.7138982557796709
    }
  },
  "joint217": {
    "position": {
      "x": -1.1273401846398619,
      "y": 10.975983606254337,
      "z": 1.3890400471981728
    },
    "quaternion": {
      "x": 0.1292653072434088,
      "y": -0.10613145998113037,
      "z": 0.04943012236425997,
      "w": 0.9846741880178413
    }
  },
  "joint218": {
    "position": {
      "x": -1.6180654097331335,
      "y": 9.420379836898547,
      "z": 3.6528820335607923
    },
    "quaternion": {
      "x": 0.4502185499971149,
      "y": -0.10205657008513332,
      "z": 0.06222163664197709,
      "w": 0.8848820156803657
    }
  },
  "joint219": {
    "position": {
      "x": -1.8755145762820604,
      "y": 7.232511460537061,
      "z": 4.764474164459282
    },
    "quaternion": {
      "x": 0.6067191744128971,
      "y": -0.08536502335090604,
      "z": 0.06144091446143687,
      "w": 0.7879274523826252
    }
  },
  "joint220": {
    "position": {
      "x": -1.9527237524243737,
      "y": 5.760627916102987,
      "z": 5.057078762559876
    },
    "quaternion": {
      "x": 0.6724125911336547,
      "y": -0.06875796558191855,
      "z": 0.054441296032887686,
      "w": 0.7349624444420406
    }
  },
  "joint221": {
    "position": {
      "x": -1.9749190164534793,
      "y": 4.762812945503901,
      "z": 5.10926196724796
    },
    "quaternion": {
      "x": 0.6986404739073677,
      "y": -0.053386777993002565,
      "z": 0.043501290993527404,
      "w": 0.7121509515797273
    }
  },
  "joint223": {
    "position": {
      "x": -0.0007099080157456481,
      "y": 11.97805008221306,
      "z": 1.467466268465301
    },
    "quaternion": {
      "x": 0.0746324301367547,
      "y": -0.0006016216809219353,
      "z": 0.005063786683642209,
      "w": 0.9971980728459406
    }
  },
  "joint224": {
    "position": {
      "x": -0.0025938021821878114,
      "y": 10.684810127806735,
      "z": 3.905257038675373
    },
    "quaternion": {
      "x": 0.4163034732169617,
      "y": -0.0005237405301510952,
      "z": 0.0001687302233765903,
      "w": 0.9092255580511709
    }
  },
  "joint225": {
    "position": {
      "x": -0.004802874908603768,
      "y": 8.59382850968293,
      "z": 5.196471058034659
    },
    "quaternion": {
      "x": 0.5875032567240743,
      "y": 0.0016646164505078592,
      "z": -0.0030631593129417946,
      "w": 0.809214291424529
    }
  },
  "joint226": {
    "position": {
      "x": -0.006103835616188618,
      "y": 7.139750722681837,
      "z": 5.568812173617068
    },
    "quaternion": {
      "x": 0.6616222114392094,
      "y": 0.005842134703069736,
      "z": -0.007140406450811869,
      "w": 0.749780590164962
    }
  },
  "joint227": {
    "position": {
      "x": -0.0069448906293089275,
      "y": 6.1440364535791145,
      "z": 5.650781285520794
    },
    "quaternion": {
      "x": 0.6929767188473753,
      "y": 0.005671231169162176,
      "z": -0.006589641682577794,
      "w": 0.7209075397684829
    }
  },
  "joint229": {
    "position": {
      "x": 1.117851117367639,
      "y": 10.97624398632263,
      "z": 1.3910773186759484
    },
    "quaternion": {
      "x": 0.12915932435082397,
      "y": 0.10337493504672739,
      "z": -0.050586153847790735,
      "w": 0.9849226024293539
    }
  },
  "joint230": {
    "position": {
      "x": 1.587625347764871,
      "y": 9.42103395618799,
      "z": 3.659645887779427
    },
    "quaternion": {
      "x": 0.44757306178989914,
      "y": 0.10861941592699492,
      "z": -0.08428765267666304,
      "w": 0.8836151698844649
    }
  },
  "joint231": {
    "position": {
      "x": 1.8242557712684795,
      "y": 7.233489307270621,
      "z": 4.776418824598861
    },
    "quaternion": {
      "x": 0.6005448511673027,
      "y": 0.11685944441021306,
      "z": -0.10890036096949626,
      "w": 0.7834733329024617
    }
  },
  "joint232": {
    "position": {
      "x": 1.8897914152817659,
      "y": 5.761717669686854,
      "z": 5.072385697351741
    },
    "quaternion": {
      "x": 0.662482268182577,
      "y": 0.12966922738663147,
      "z": -0.1264849776371607,
      "w": 0.7268457100683398
    }
  },
  "joint233": {
    "position": {
      "x": 1.906029896377887,
      "y": 4.763909573574489,
      "z": 5.126949814809936
    },
    "quaternion": {
      "x": 0.6851475455943083,
      "y": 0.142523464028103,
      "z": -0.13810264001657171,
      "w": 0.7008477465098811
    }
  },
  "joint235": {
    "position": {
      "x": 2.1122464126440956,
      "y": 11.93761933226457,
      "z": 1.3898025661005866
    },
    "quaternion": {
      "x": 0.07321625847722397,
      "y": 0.16169929510770745,
      "z": -0.10230582312456181,
      "w": 0.9787881466441413
    }
  },
  "joint236": {
    "position": {
      "x": 2.8064328507886396,
      "y": 10.582462119718786,
      "z": 3.7046332656819287
    },
    "quaternion": {
      "x": 0.4103081624021907,
      "y": 0.14498875487400437,
      "z": -0.12839446561119044,
      "w": 0.8911455178738433
    }
  },
  "joint237": {
    "position": {
      "x": 3.075137699124998,
      "y": 8.47072887245342,
      "z": 4.940605368372808
    },
    "quaternion": {
      "x": 0.5793504370487367,
      "y": 0.11452864871400355,
      "z": -0.13258734276251274,
      "w": 0.7960256630626668
    }
  },
  "joint238": {
    "position": {
      "x": 3.0876491807008177,
      "y": 7.015104680152246,
      "z": 5.309340433176817
    },
    "quaternion": {
      "x": 0.6528615606547762,
      "y": 0.08995448460793241,
      "z": -0.1271800021843638,
      "w": 0.7412861932902275
    }
  },
  "joint239": {
    "position": {
      "x": 3.0443655765723747,
      "y": 6.020971865446752,
      "z": 5.400419311982408
    },
    "quaternion": {
      "x": 0.6851391958655556,
      "y": 0.07203215317696109,
      "z": -0.11297482936298735,
      "w": 0.7159834768538968
    }
  },
  "joint241": {
    "position": {
      "x": 3.162779282068052,
      "y": 10.917081226357162,
      "z": 1.2363032512929255
    },
    "quaternion": {
      "x": 0.12343842594275577,
      "y": 0.2520341683410246,
      "z": -0.14157681667721106,
      "w": 0.9493143515026887
    }
  },
  "joint242": {
    "position": {
      "x": 4.240118416393176,
      "y": 9.270492524493477,
      "z": 3.2420151589815274
    },
    "quaternion": {
      "x": 0.4345286637366688,
      "y": 0.24707406457791461,
      "z": -0.1844203168102578,
      "w": 0.8462436964325216
    }
  },
  "joint243": {
    "position": {
      "x": 4.753534527249112,
      "y": 7.0510457221048135,
      "z": 4.206385036489485
    },
    "quaternion": {
      "x": 0.5848437621722269,
      "y": 0.22756877843773987,
      "z": -0.20231908671396348,
      "w": 0.7518225934885293
    }
  },
  "joint244": {
    "position": {
      "x": 4.879747001638005,
      "y": 5.5736006163973055,
      "z": 4.45461516181141
    },
    "quaternion": {
      "x": 0.647957673977021,
      "y": 0.2109145697344726,
      "z": -0.2047776624075558,
      "w": 0.7026606620459893
    }
  },
  "joint245": {
    "position": {
      "x": 4.898980420483811,
      "y": 4.575132253064134,
      "z": 4.495815963888338
    },
    "quaternion": {
      "x": 0.6736560423300313,
      "y": 0.20162403235365112,
      "z": -0.1994750689815664,
      "w": 0.6824551143221745
    }
  },
  "joint247": {
    "position": {
      "x": 4.107415437865254,
      "y": 11.861262418714567,
      "z": 1.2174793371329327
    },
    "quaternion": {
      "x": 0.06563111529719831,
      "y": 0.2888889601649945,
      "z": -0.18296107721441487,
      "w": 0.9374225139307115
    }
  },
  "joint248": {
    "position": {
      "x": 5.371919315017739,
      "y": 10.388276010675423,
      "z": 3.23035425316522
    },
    "quaternion": {
      "x": 0.3881081894824167,
      "y": 0.29295263725925963,
      "z": -0.23612840142754757,
      "w": 0.8413050360117883
    }
  },
  "joint249": {
    "position": {
      "x": 5.988449011573755,
      "y": 8.233665180559063,
      "z": 4.271231290806981
    },
    "quaternion": {
      "x": 0.5380858241445189,
      "y": 0.2934753199630398,
      "z": -0.2837566141131269,
      "w": 0.7374402120676357
    }
  },
  "joint250": {
    "position": {
      "x": 6.135873867738398,
      "y": 6.769207703195979,
      "z": 4.576428110793958
    },
    "quaternion": {
      "x": 0.5919020220108506,
      "y": 0.3062750260445855,
      "z": -0.3234307103931572,
      "w": 0.6717441330859784
    }
  },
  "joint251": {
    "position": {
      "x": 6.144706766789674,
      "y": 5.773163875391787,
      "z": 4.657454299858414
    },
    "quaternion": {
      "x": 0.6118247802291611,
      "y": 0.31700866141094075,
      "z": -0.340723789438904,
      "w": 0.6395961586801281
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
