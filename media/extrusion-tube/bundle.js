(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"./sketch.js":3}],3:[function(require,module,exports){
'use strict';

var _ThreeView = require('./ThreeView.js');

var _ThreeView2 = _interopRequireDefault(_ThreeView);

var _touchEvents = require('./touchEvents.js');

var _touchEvents2 = _interopRequireDefault(_touchEvents);

var _eases = require('../lsr/eases.js');

var _LilTween = require('../lsr/LilTween.js');

var _LilTween2 = _interopRequireDefault(_LilTween);

var _coolorsToArray = require('../lsr/coolorsToArray.js');

var _coolorsToArray2 = _interopRequireDefault(_coolorsToArray);

var _startaudiocontext = require('startaudiocontext');

var _startaudiocontext2 = _interopRequireDefault(_startaudiocontext);

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
// import * as THREE from 'three';
// window.THREE = THREE
// var glslify = require('glslify')

(0, _startaudiocontext2.default)(Tone.context, "#container", function () {
  console.log('started audio context');
});

var gltfLoader = new THREE.GLTFLoader();

var elapsedTime = 0;

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
var Quaternion = THREE.Quaternion;
var Matrix4 = THREE.Matrix4;

var loadingManager = new THREE.LoadingManager();
var textureLoader = new THREE.TextureLoader(loadingManager);
var jsonLoader = new THREE.FileLoader(loadingManager);
jsonLoader.setResponseType('json');

// OUR SKETCH
var Sketch = function Sketch() {

  var clock = new THREE.Clock();

  // scene
  var scene = new THREE.Scene();
  // scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

  // camera
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, //aspect
  0.001, 100);
  camera.position.set(-0.03110212238058743, 0.005475206276408082, 0.015089072193270995);
  camera.lookAt(new Vector3(0, 0, 0));

  // view - convenience object to setup the renderer
  var view = new _ThreeView2.default({
    container: 'container'
  });

  var renderer = view.renderer;
  renderer.setClearColor(new THREE.Color(0x000000), 0);
  renderer.autoClear = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.gammaOutput = false;
  renderer.physicallyCorrectLights = false;

  // orbit controls
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  controls.enableDamping = true;
  controls.enableKeys = false;
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.maxPolarAngle = PI * 0.5;
  controls.minPolarAngle = PI * 0.5;
  controls.maxDistance = 0.035;
  controls.minDistance = 0.01;
  controls.dampingFactor = 0.8;

  var coolors = (0, _coolorsToArray2.default)('https://coolors.co/010b13-f5f7f7-262422-5fc5e1-f46e42');

  var light = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2);
  light.position.set(0, 0.5, 0.5).multiplyScalar(0.075);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 0.01, 2));
  light.shadow.bias = 0.00001;
  light.shadow.mapSize.width = light.shadow.mapSize.height = 1024 * 2;
  scene.add(light);

  var hemi_light = new THREE.HemisphereLight(coolors[0], coolors[4], 1);
  scene.add(hemi_light);

  var synth = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 50,
    detune: 0,
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 0.01,
      decay: 0.01,
      sustain: 0.9,
      release: 0.15
    },
    modulation: {
      type: "sine"
    },
    modulationEnvelope: {
      attack: 0.5,
      decay: 0.9,
      sustain: 1,
      release: 0.5
    }
  }).toMaster();
  synth.volume.value = -5;

  var loader = new THREE.GLTFLoader();

  var mixer = null;

  var skel = null;
  var originalPositions = [];

  var meshes = [];

  // https://coolors.co/b8d8d8-7a9e9f-4f6367-eef5db-fe5f55 =>
  var gradient = [];
  gradient.push.apply(gradient, _toConsumableArray(coolors[0].toArray().map(function (val) {
    return val * 255;
  })));
  // gradient.push(...coolors[2].toArray().map(val => val * 255))
  // gradient.push(...coolors[1].toArray().map(val => val * 255))
  gradient.push.apply(gradient, _toConsumableArray(coolors[3].toArray().map(function (val) {
    return val * 255;
  })));

  var dataTex = new THREE.DataTexture(new Uint8Array(gradient), gradient.length / 3, 1, THREE.RGBFormat /*, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy */);

  dataTex.magFilter = THREE.LinearFilter;
  dataTex.minFilter = THREE.LinearFilter;
  dataTex.needsUpdate = true;

  var mat = new THREE.MeshStandardMaterial({
    emissive: new THREE.Color(0xffffff).multiplyScalar(0),
    skinning: true,
    emissiveMap: dataTex,
    // clearCoat: 0.1,
    // clearCoatRoughness: 0.5,
    map: dataTex,
    side: 0,
    metalness: 0.5,
    roughness: 0.5
  });

  var skin = null;

  var bound = new THREE.Box3();
  var center = new Vector3();

  loader.load('static/knobTube.glb', function (gltf) {

    var model = gltf.scene;
    scene.add(model);

    var armature = model.getObjectByName("Armature");
    skin = armature.getObjectByProperty("type", "SkinnedMesh");

    skin.castShadow = true;
    skin.receiveShadow = true;
    skin.material = mat;

    skin.skeleton.update();

    var rotMat = new Matrix4().makeRotationZ(HALF_PI);
    skin.skeleton.originalBones = [];
    skin.skeleton.worldPositions = [];
    skin.skeleton.bones.forEach(function (bone, i) {
      skin.skeleton.originalBones[i] = bone.clone();

      bone.updateMatrixWorld();

      var wp = new Vector3();
      bone.getWorldPosition(wp);
      skin.skeleton.worldPositions[i] = wp;

      if (bone.name.includes("Armature_mid_")) {

        bone.qTo = bone.quaternion.clone();

        bone.orgPos = bone.position.clone();

        var m = new Matrix4();
        m.compose(new Vector3(0, 0, 0), bone.quaternion, new Vector3(1, 1, 1));
        m.multiply(rotMat);
        m.decompose(new Vector3(), bone.qTo, new Vector3());
      }

      if (i > 0) {
        bound.expandByPoint(wp);
      }
    });

    skin.receiveShadow = true;
  }, undefined, function (error) {
    // console.log( 'An error happened' );
  });

  var freq = {
    synth: synth,
    isActive: false,
    value: 0,
    pos: 0,
    osc: 10
  };

  var nextSynthTrigger = 0;
  var q = new THREE.Quaternion();

  // update function called once per rAf loop
  var black = new THREE.Color("black");
  var max_freq = 100;
  var min_freq = 20;
  var minExrtude = 0.5;
  var scaledTime = 0;
  var freeverb = new Tone.Freeverb().toMaster();
  var synth2 = new Tone.MembraneSynth({
    "octaves": 4,
    "pitchDecay": 0.9
  }).connect(freeverb);
  synth2.volume.value = -30;

  var update = function update() {
    var delta = clock.getDelta();
    elapsedTime = clock.getElapsedTime();

    scaledTime += delta * freq.value * 0.5;

    var u1Time = scaledTime * -0.2 + elapsedTime * 0.2;

    if (skin) {

      if (!freq.isActive) {
        mat.emissive.lerp(black, 0.1);
      }

      if (freq.isActive && elapsedTime > nextSynthTrigger) {
        synth2.triggerAttack(freq.value * 5 + 200 + randf(-50, 50));
        nextSynthTrigger = elapsedTime + randf(0.1, 0.4) * (1 - freq.value / 100) * 2;
      }

      skin.skeleton.bones.forEach(function (bone, i) {

        bone.quaternion.copy(skin.skeleton.originalBones[i].quaternion);

        if (i > 0) {
          // not ROOT


          if (bone.qTo) {

            var wp = skin.skeleton.worldPositions[i].z;

            // reset the rotation
            q.copy(bone.quaternion);
            bone.quaternion.copy(q);

            var u = (0, _eases.QuadraticIn)(sin(scaledTime + i) * 0.5 + 0.5);

            var p = mapLinear(freq.value, min_freq, max_freq, 2, -2);
            var osc = 0;

            // var u = sin(elapsedTime * 4 + skin.skeleton.worldPositions[i].z * 2) * 0.5 + 0.5
            var u1 = sin(u1Time + skin.skeleton.worldPositions[i].z * 2) * 0.5 + 0.5;

            p = clamp(1.5 - Math.abs(wp - p), 0, 1);
            u = freq.isActive ? p * u * 2 + minExrtude : minExrtude;

            // u1 *= 1 - p
            bone.scale.x = u;

            bone.scale.x;
            q.copy(bone.quaternion);
            q.slerp(bone.qTo, u1 - 0.5);

            bone.quaternion.copy(q);

            bone.position.copy(bone.orgPos);

            bone.position.x += (bone.orgPos.x - center.x) * (1 - u1) * 0.5;
            bone.position.z += (bone.orgPos.z - center.z) * (1 - u1) * 0.5;

            // bone.scale.x = lerp(0.1, 2.5, u * u * ( sin(elapsedTime * 22 + i) * 0.5 + 0.5 ))
          }
        }
      });
    }
  };

  // draw function called once per rAf loop
  var draw = function draw() {
    renderer.render(scene, camera, null, true);
  };

  // events
  view.onResize = function (e, w, h) {
    console.log('resize', w, h);
    camera.aspect = view.aspect;
    camera.updateProjectionMatrix();
  };

  // var onScroll = e => {
  //   console.log( e.type );
  // }

  var trackedTouches = null;

  var ongoingTouches = [];
  function copyTouch(touch) {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
  }
  function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
      var id = ongoingTouches[i].identifier;

      if (id == idToFind) {
        return i;
      }
    }
    return -1; // not found
  }

  var getFreq = function getFreq(touch) {
    return mapLinear(touch.clientY, 0, window.innerHeight, max_freq, min_freq);
  };

  var mousedown = false;

  var onMouseMove = function onMouseMove(e) {

    if (mousedown) {

      freq.isActive = true;
      freq.value = getFreq(e);
      freq.synth.oscillator.frequency.value = freq.value;
      freq.position = mapLinear(freq.value, min_freq, max_freq, 1, -1);
      freq.osc = mapLinear(freq.value, min_freq, max_freq, 10, 90);
    }
  };

  var onMouseDown = function onMouseDown(e) {

    mousedown = true;
    onMouseMove(e);
    freq.synth.triggerRelease();
    freq.synth.triggerAttack(freq.value);

    mat.emissive.copy(coolors[3]).offsetHSL(randf(0, 1), 0, 0).multiplyScalar(1.2);
  };

  var onMouseUp = function onMouseUp(e) {
    mousedown = false;
    freq.isActive = false;
    freq.value = 0;
    freq.synth.triggerRelease();
    synth2.triggerRelease();
  };

  view.container.addEventListener('mousedown', onMouseDown, false);
  view.container.addEventListener('mousemove', onMouseMove, false);
  view.container.addEventListener('mouseup', onMouseUp, false);
  view.container.addEventListener('mouseout', onMouseUp, false);

  var touches = new _touchEvents2.default({

    element: view.container,

    onTouchStart: function onTouchStart(e) {

      e.preventDefault();
      console.log("touchstart.");

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
        console.log(camera.position.x, camera.position.y, camera.position.z);
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

},{"../lsr/LilTween.js":5,"../lsr/coolorsToArray.js":6,"../lsr/eases.js":7,"./ThreeView.js":1,"./touchEvents.js":4,"startaudiocontext":8}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
      startTime: new Date(),
      _stopped: false,
      u: 0,
      value: 0,
      chainedTweens: []
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
      this.startTime = new Date();
      this._stopped = false;
      if (this.onStart) this.onStart();
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

      this.elapsedTime = Math.min(new Date() - this.startTime, this.duration);

      if (this.elapsedTime < this.duration) {

        this.u = this.ease(mapLinear(this.elapsedTime, 0, this.duration, 0, 1));

        this.value = lerp(this.from, this.to, this.u);

        // console.log( this.ca );

        if (this.onUpdate) {
          this.onUpdate(this.value, this.u);
        }
      } else {

        this._stopped = true;

        if (this.onUpdate) {
          this.onUpdate(this.value, 1);
        }

        if (this.onComplete) {
          this.onComplete(this.value, 1);
        }

        if (this.chainedTweens.length) {

          this.chainedTweens.forEach(function (t) {
            t.start();
          });

          // var next = this.chainedTweens.shift()
          // next.start()
        }

        if (this.repeat) {
          this.start();
        }
      }

      window.requestAnimationFrame(this.update.bind(this));
    }
  }]);

  return LilTween;
}();

module.exports = LilTween;

},{}],6:[function(require,module,exports){
'use strict';

// coolorsToArray.js

// var str = "https://coolors.co/010b13-f46e42-f5f7f7-262422-5fc5e1"

module.exports = function (str) {
  return str.split('/').pop().split('-').map(function (hex) {
    return new THREE.Color('#' + hex);
  });
};

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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
},{}]},{},[2]);

//# sourceMappingURL=bundle.js.map
