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

      attenuation: 0.99,

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
      var _this = this;

      this.world.step(this.fixedTimeStep, currentTime - this.lastTime, this.maxSubSteps);
      this.lastTime = currentTime;

      // iterate through the bodies and update any constrained THREE objects
      this.world.bodies.forEach(function (body) {

        // body.force.scale( this.attenuation, body.force )
        // body.torque.scale( this.attenuation, body.torque )
        body.velocity.scale(_this.attenuation, body.velocity);
        body.angularVelocity.scale(_this.attenuation, body.angularVelocity);

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

var _startaudiocontext = require('startaudiocontext');

var _startaudiocontext2 = _interopRequireDefault(_startaudiocontext);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
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

// import boneInfo from './static/boneInfo.json'

(0, _startaudiocontext2.default)(Tone.context, "#container", function () {
  console.log('started audio context');
});

var gltfLoader = new THREE.GLTFLoader();

var elapsedTime = 0;
var timeScale = 0.82;
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

var coolorPath = '';
// coolorPath = 'https://coolors.co/010c26-ba1247-ff1d00-41d6ea-fcfffc'
// coolorPath = 'https://coolors.co/133c5a-6881a9-9f978a-f3f3f3-ff0141'
// coolorPath = 'https://coolors.co/133c5a-6881a9-9f978a-ff0141-f3f3f3'
coolorPath = 'https://coolors.co/0c0f0a-ff206e-40c5e6-b3e3f1-ffffff';
// coolorPath = 'https://coolors.co/0c0f0a-ff206e-fbff12-ffffff-41ead4'

// coolorPath = 'https://coolors.co/59b9ff-59ff82-ff5969-ff7280-ffdb9e'
// coolorPath = 'https://coolors.co/0c0f0a-59ff82-ff5969-ff7280-f3f3f3'

// OUR SKETCH
var Sketch = function Sketch() {

  var coolors = (0, _coolorsToArray2.default)(coolorPath);

  var clock = new THREE.Clock();

  // camera
  var camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, //aspect
  0.1, 1000);
  camera.position.set(-25.2097312871983, 14.601854055254915, 34.58687845364841);
  camera.lookAt(new Vector3(0, 0, 0));

  // view - convenience object to setup the renderer
  var view = new _ThreeView2.default({
    container: 'container'
  });

  var renderer = view.renderer;
  renderer.setClearColor(coolors[0], 1);
  renderer.autoClear = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // scene
  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(renderer.getClearColor(), 150, 450);
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
  controls.maxPolarAngle = PI * 0.9;
  controls.minPolarAngle = PI * 0.1;
  controls.maxDistance = 150;
  controls.minDistance = 25;
  controls.dampingFactor = 0.95;

  // CANNON
  var cannon = new _CannonHelper2.default({
    solverIterations: 5
    // attenuation: 0.925
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
  var groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 100, 100), new THREE.MeshStandardMaterial({
    color: coolors[4].clone().multiplyScalar(0.66),
    map: groundMap,
    bumpMap: groundMap,
    bumpScale: 0.05,
    wireframe: false,
    metalness: 0,
    roughness: 1
  }));

  groundPlane.receiveShadow = true;
  // groundPlane.position.y = -10
  groundPlane.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(groundPlane);
  cannon.addGround(groundPlane);

  //Create a DirectionalLight and turn on shadows for the light
  var light = new THREE.DirectionalLight(coolors[4], 0.75);
  light.position.set(0, 10, 0); //default; light shining from top
  light.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(light);

  //Set up shadow properties for the light
  var lightcamSize = 20;
  var bias = 0;
  light.castShadow = true; // default false
  light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 1; // default
  light.shadow.camera.far = 100; // default
  light.shadow.camera.left = -lightcamSize;
  light.shadow.camera.right = lightcamSize;
  light.shadow.camera.bottom = -lightcamSize;
  light.shadow.camera.top = lightcamSize;
  light.bias = bias;

  var hemi_light = new THREE.HemisphereLight(coolors[2].clone().multiplyScalar(0.75), coolors[4], 0.5);
  scene.add(hemi_light);

  // audio
  var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  var normalMaterial = new THREE.MeshNormalMaterial();

  // load geometry
  var fbxLoader = new THREE.FBXLoader();
  var skin = null;

  var endBones = [];

  function handleSkin(skin) {

    skin.castShadow = true;
    skin.receiveShadow = true;

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

          m.material.wireframe = true;
          m.visible = false;
          scene.add(m);

          // create collider
          bone.collider = cannon.addBoxMesh(m, {
            mass: 1,
            linearDamping: 0.99
          });
        }
      }
    };

    // find the non collider ones and add a collider
    skin.skeleton.bones.forEach(function (bone, i) {
      if (bone.collider === undefined) {
        bone.collider = bone.parent.collider;
      }
    });
    skin.skeleton.bones.forEach(function (bone, i) {
      if (bone.collider === undefined) {
        // traverse up and get it
        bone.traverseAncestors(function (b) {
          if (bone.collider === false && b.collider) {
            bone.collider = b.collider;
          }
        });
      }

      bone.isEnd = bone.name.includes("mid");

      if (bone.isEnd) {
        endBones.push(bone);
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

          var constraint = new CANNON.ConeTwistConstraint(a, b, {
            collideConnected: false,
            maxForce: 10000,
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

      // skin.skeleton.boneInverses[i].identity()
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

    skin.frustumCulled = false;

    skins.push(skin);

    // if( boneInfo[skins.length -1] ) {

    //   var bi = boneInfo[skins.length -1]

    //   skin.skeleton.bones.forEach( ( bone, i ) => {

    //     bone.collider.position.copy( bi[bone.name].position)
    //     bone.collider.quaternion.copy( bi[bone.name].quaternion)

    //   });
    // }


    // skin.skeleton.bones.forEach( ( bone, i ) => {

    //   bone.collider.position.y += 55

    // });

    return skin;
  }

  function getDecendantsOfType(obj, type) {

    var decendants = [];

    obj.traverse(function (child) {
      if (type === child.type) {
        decendants.push(child);
      }
    });

    return decendants;
  }

  var cloneSkin = function cloneSkin(skin) {};

  var skins = [];
  function handleFBX(result) {

    scene.add(result);

    var gradient = [];
    gradient.push.apply(gradient, _toConsumableArray(coolors[3].toArray().map(function (val) {
      return val * 255;
    })));
    gradient.push.apply(gradient, _toConsumableArray(coolors[2].toArray().map(function (val) {
      return val * 255;
    })));
    gradient.push.apply(gradient, _toConsumableArray(coolors[1].toArray().map(function (val) {
      return val * 255;
    })));
    gradient.push.apply(gradient, _toConsumableArray(coolors[1].toArray().map(function (val) {
      return val * 255;
    })));
    // for(var i=1; i<4; i++) {
    //   var c = randEl(coolors)
    //   gradient.push(...c.toArray().map(val => val * 255))
    // }


    var dataTex = new THREE.DataTexture(new Uint8Array(gradient), 1, gradient.length / 3, THREE.RGBFormat);

    // dataTex.wrapS = dataTex.wrapT = THREE.RepeatWrapping
    // dataTex.repeat.set(1,1)
    dataTex.magFilter = dataTex.minFilter = THREE.LinearFilter;
    dataTex.needsUpdate = true;

    getDecendantsOfType(result, 'SkinnedMesh').forEach(function (skin) {
      var _ref;

      var s = handleSkin(skin);
      s.material = new THREE.MeshStandardMaterial((_ref = {
        skinning: true
      }, _defineProperty(_ref, 'skinning', true), _defineProperty(_ref, 'color', new THREE.Color()), _defineProperty(_ref, 'map', dataTex), _defineProperty(_ref, 'metalness', 0.1), _defineProperty(_ref, 'roughness', 0.5), _defineProperty(_ref, 'emissive', new THREE.Color()), _defineProperty(_ref, 'emissiveMap', dataTex), _defineProperty(_ref, 'emissiveIntensity', 0.35), _ref));
    });

    // console.log( endBones );
  }

  fbxLoader.load('static/radial.fbx', handleFBX);

  var scaledTime = 0;

  var laserMesh = new THREE.Mesh(new THREE.CylinderGeometry(), new THREE.MeshBasicMaterial({
    color: "blue",
    transparent: true,
    opacity: 0,
    blending: 2
    // depthwrite: false,
  }));
  laserMesh.scale.x = laserMesh.scale.z = 0.04;
  laserMesh.scale.y = 100;

  var rotLaser = new THREE.Object3D();
  rotLaser.position.z = 0.25 + laserMesh.scale.y / 2;
  rotLaser.rotation.x = HALF_PI;
  rotLaser.add(laserMesh);

  var laserCylinder = new THREE.Object3D();
  laserCylinder.visible = false;
  laserCylinder.add(rotLaser);
  scene.add(laserCylinder);

  var attractPoint = new CANNON.Vec3(0, 0, 0);

  var localForce = new CANNON.Vec3(0, 1, -100);
  var localPoint = new CANNON.Vec3(0, 0, 1);

  var rootCollider = undefined;

  function startLaserTween(laserObject, note) {

    var panner = new Tone.Panner(1).toMaster();
    var synth = new Tone.PolySynth(3, Tone.Synth, {
      "oscillator": {
        "type": "fatsawtooth",
        "count": 4,
        "spread": 60
      },
      "envelope": {
        "attack": 0.01,
        "decay": 0.1,
        "sustain": 0.95,
        "release": 0.4,
        "attackCurve": "exponential"
      }
    }).connect(panner);

    synth.volume.value = -20;

    // var fmOsc = new Tone.FatOscillator().connect(panner);
    // console.log( fmOsc );
    // fmOsc.volume.value = -10
    // fmOsc.start();


    new _LilTween2.default({
      laserObject: laserObject,
      from: -10,
      to: -1,
      duration: 1000,
      ease: _eases.QuadraticIn,
      delay: 500,
      repeat: true,
      onStart: function onStart() {

        this.target = (0, _randomElement2.default)(endBones);
        if (this.target) {
          this.duration = randf(400, 1600);
          this.delay = randf(400, 1600);
          rootCollider = skins[0].skeleton.bones[0].collider;
          synth.triggerAttackRelease((0, _randomElement2.default)(["Eb4", "G4", "C3", 'c1', 'a2']), this.duration * 0.001);
          // fmOsc.start()
          // fmOsc.stop( Date.now() + 1 )
        }
      },
      onUpdate: function onUpdate(val, u) {

        if (this.target && this.target.collider) {

          this.laserObject.visible = true;

          var wf = this.target.collider.position.clone();
          wf.vsub(rootCollider.position, wf);
          wf.normalize();

          panner.pan.value = wf.x;

          wf.scale(val, wf);

          rootCollider.velocity.vadd(wf, rootCollider.velocity);

          this.laserObject.position.copy(this.target.collider.position);
          this.laserObject.quaternion.copy(this.target.collider.quaternion);
        }
      },
      onComplete: function onComplete() {
        this.laserObject.visible = false;
        // fmOsc.stop()
      }
    }).start();
  }

  function cloneLaserMesh(obj, color) {

    var o = obj.clone();

    var o2 = o.children[0].clone();

    var m = o2.children[0].clone();

    o.add(o2);
    o2.add(m);

    m.material = new THREE.MeshBasicMaterial({
      color: color.clone().multiplyScalar(1.25),
      transparent: true,
      opacity: 0.75,
      blending: 2
    });
    // m.material.color.setRGB(0xff0000)

    scene.add(o);
    return o;
  }

  // var laserMesh2 = laserMesh.clone()
  // laserMesh2.material = laserMesh.material.clone()
  // laserMesh2.material.color.setRGB(0xff0000)

  // var rotLaser2 = rotLaser.clone()
  // rotLaser2.add(laserMesh2)

  // var laserCylinder2 = laserCylinder.clone()
  // laserCylinder2.add(rotLaser2)
  // scene.add(laserCylinder2)

  startLaserTween(cloneLaserMesh(laserCylinder, coolors[1]));
  startLaserTween(cloneLaserMesh(laserCylinder, coolors[2]));
  startLaserTween(cloneLaserMesh(laserCylinder, coolors[3]));
  // startLaserTween( cloneLaserMesh( laserCylinder, coolors[1]) )
  // startLaserTween( cloneLaserMesh( laserCylinder, coolors[2]) )


  // new Tween({
  //   laserMesh: laserCylinder2,
  //   target: randEl(endBones),
  //   from: -10,
  //   to: -1,
  //   duration: 500,
  //   ease: QuadraticIn,
  //   delay: 1000,
  //   repeat: true,
  //   onStart: function(t){

  //     this.target = randEl(endBones)
  //     if(this.target) {
  //       this.duration = randf(400, 1600)
  //       this.delay = randf(400, 800)
  //       rootCollider = skins[0].skeleton.bones[0].collider
  //     }
  //   },
  //   onUpdate: function(val, u){

  //     if(this.target && this.target.collider) {

  //       this.laserMesh.visible = true

  //       var wf = this.target.collider.position.clone()
  //       wf.vsub(rootCollider.position, wf)
  //       wf.normalize()
  //       wf.scale(val, wf)

  //       rootCollider.velocity.vadd(wf, rootCollider.velocity)

  //       this.laserMesh.position.copy(this.target.collider.position)
  //       this.laserMesh.quaternion.copy(this.target.collider.quaternion)

  //     }
  //   },
  //   onComplete: function() {
  //     this.laserMesh.visible = false
  //   }
  // }).start()


  // UPDATE
  var deltaVec = new CANNON.Vec3();
  var lastRingTime = 0,
      nextRingTime = 1;
  var p = new THREE.Vector3();
  var q = new THREE.Quaternion();
  var eular = new THREE.Euler();
  var scl = new THREE.Vector3();

  var rootVelLimit = 150;

  var smoothing = 0.99;
  // var smoothing = 0.75
  var update = function update() {

    var delta = clock.getDelta();

    elapsedTime = clock.getElapsedTime();

    scaledTime += delta * timeScale;

    // fucking limits
    if (rootCollider && rootCollider.velocity.length() > rootVelLimit) {
      rootCollider.velocity.normalize();
      rootCollider.velocity.scale(rootVelLimit, rootCollider.velocity);
    }

    cannon.update(elapsedTime);

    light.updateMatrixWorld();

    cannon.world.bodies.forEach(function (body) {

      body.force.scale(0.95, body.force);
    });

    skins.forEach(function (skin, index) {

      var c = skin.skeleton.bones[0].collider;

      skin.skeleton.joints.forEach(function (joint, i) {

        joint.update();

        var bone = skin.skeleton.bones[i];

        joint.transform.decompose(p, q, scl);

        // bone.position.lerp(p, smoothing)
        // bone.quaternion.slerp(q, smoothing)

        joint.transform.decompose(bone.position, bone.quaternion, new Vector3());

        if (bone.name === "ROOT") {
          controls.target.lerp(bone.collider.position, 0.05);
          camera.position.y = Math.max(1, camera.position.y);
          controls.update();

          p.copy(bone.collider.position);
          light.position.x = bone.collider.position.x;
          light.position.y = bone.collider.position.y + 10;
          light.position.z = bone.collider.position.z;
          p.copy(bone.collider.position);
          light.lookAt(p);
        }
      });
    });
  };

  // draw function called once per rAf loop

  var draw = function draw() {

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

        skins.forEach(function (skin, i) {

          boneInfo[i] = {};

          skin.skeleton.bones.forEach(function (bone) {

            // console.log( bone.position, bone.quaternion );
            boneInfo[i][bone.name] = {
              position: bone.collider.position,
              quaternion: bone.collider.quaternion
            };
          });
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

},{"../lsr/LilTween.js":7,"../lsr/coolorsToArray.js":8,"../lsr/eases.js":9,"../lsr/randomElement.js":10,"./CannonHelper.js":1,"./Joint.js":2,"./ThreeView.js":3,"./touchEvents.js":6,"save-as":11,"startaudiocontext":12}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
      this._started = false;
      // if(this.onStart){
      //   this.onStart( this )
      // }
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

      if (t < this.startTime) {
        // console.log( "should be delayed" );
      } else if (this.elapsedTime <= this.duration) {

        if (!this._started) {

          this._started = true;
          this.onStart(this);
        }

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

},{}],8:[function(require,module,exports){
'use strict';

// coolorsToArray.js

// var str = "https://coolors.co/010b13-f46e42-f5f7f7-262422-5fc5e1"

module.exports = function (str) {
  return str.split('/').pop().split('-').map(function (hex) {
    return new THREE.Color('#' + hex);
  });
};

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
/**
 *  StartAudioContext.js
 *  @author Yotam Mann
 *  @license http://opensource.org/licenses/MIT MIT License
 *  @copyright 2016 Yotam Mann
 */
(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define([], factory)
	 } else if (typeof module === "object" && module.exports) {
        module.exports = factory()
	} else {
		root.StartAudioContext = factory()
  }
}(this, function () {

	//TAP LISTENER/////////////////////////////////////////////////////////////

	/**
	 * @class  Listens for non-dragging tap ends on the given element
	 * @param {Element} element
	 * @internal
	 */
	var TapListener = function(element, context){

		this._dragged = false

		this._element = element

		this._bindedMove = this._moved.bind(this)
		this._bindedEnd = this._ended.bind(this, context)

		element.addEventListener("touchstart", this._bindedEnd)
		element.addEventListener("touchmove", this._bindedMove)
		element.addEventListener("touchend", this._bindedEnd)
		element.addEventListener("mouseup", this._bindedEnd)
	}

	/**
	 * drag move event
	 */
	TapListener.prototype._moved = function(e){
		this._dragged = true
	};

	/**
	 * tap ended listener
	 */
	TapListener.prototype._ended = function(context){
		if (!this._dragged){
			startContext(context)
		}
		this._dragged = false
	};

	/**
	 * remove all the bound events
	 */
	TapListener.prototype.dispose = function(){
		this._element.removeEventListener("touchstart", this._bindedEnd)
		this._element.removeEventListener("touchmove", this._bindedMove)
		this._element.removeEventListener("touchend", this._bindedEnd)
		this._element.removeEventListener("mouseup", this._bindedEnd)
		this._bindedMove = null
		this._bindedEnd = null
		this._element = null
	};

	//END TAP LISTENER/////////////////////////////////////////////////////////

	/**
	 * Plays a silent sound and also invoke the "resume" method
	 * @param {AudioContext} context
	 * @private
	 */
	function startContext(context){
		// this accomplishes the iOS specific requirement
		var buffer = context.createBuffer(1, 1, context.sampleRate)
		var source = context.createBufferSource()
		source.buffer = buffer
		source.connect(context.destination)
		source.start(0)

		// resume the audio context
		if (context.resume){
			context.resume()
		}
	}

	/**
	 * Returns true if the audio context is started
	 * @param  {AudioContext}  context
	 * @return {Boolean}
	 * @private
	 */
	function isStarted(context){
		 return context.state === "running"
	}

	/**
	 * Invokes the callback as soon as the AudioContext
	 * is started
	 * @param  {AudioContext}   context
	 * @param  {Function} callback
	 */
	function onStarted(context, callback){

		function checkLoop(){
			if (isStarted(context)){
				callback()
			} else {
				requestAnimationFrame(checkLoop)
				if (context.resume){
					context.resume()
				}
			}
		}

		if (isStarted(context)){
			callback()
		} else {
			checkLoop()
		}
	}

	/**
	 * Add a tap listener to the audio context
	 * @param  {Array|Element|String|jQuery} element
	 * @param {Array} tapListeners
	 */
	function bindTapListener(element, tapListeners, context){
		if (Array.isArray(element) || (NodeList && element instanceof NodeList)){
			for (var i = 0; i < element.length; i++){
				bindTapListener(element[i], tapListeners, context)
			}
		} else if (typeof element === "string"){
			bindTapListener(document.querySelectorAll(element), tapListeners, context)
		} else if (element.jquery && typeof element.toArray === "function"){
			bindTapListener(element.toArray(), tapListeners, context)
		} else if (Element && element instanceof Element){
			//if it's an element, create a TapListener
			var tap = new TapListener(element, context)
			tapListeners.push(tap)
		} 
	}

	/**
	 * @param {AudioContext} context The AudioContext to start.
	 * @param {Array|String|Element|jQuery=} elements For iOS, the list of elements
	 *                                               to bind tap event listeners
	 *                                               which will start the AudioContext. If
	 *                                               no elements are given, it will bind
	 *                                               to the document.body.
	 * @param {Function=} callback The callback to invoke when the AudioContext is started.
	 * @return {Promise} The promise is invoked when the AudioContext
	 *                       is started.
	 */
	function StartAudioContext(context, elements, callback){

		//the promise is invoked when the AudioContext is started
		var promise = new Promise(function(success) {
			onStarted(context, success)
		})

		// The TapListeners bound to the elements
		var tapListeners = []

		// add all the tap listeners
		if (!elements){
			elements = document.body
		}
		bindTapListener(elements, tapListeners, context)

		//dispose all these tap listeners when the context is started
		promise.then(function(){
			for (var i = 0; i < tapListeners.length; i++){
				tapListeners[i].dispose()
			}
			tapListeners = null

			if (callback){
				callback()
			}
		})

		return promise
	}

	return StartAudioContext
}))
},{}]},{},[4]);
