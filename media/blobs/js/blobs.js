
tdl.require('tdl.fast');
tdl.require('tdl.fps');
tdl.require('tdl.math');
tdl.require('tdl.primitives');
tdl.require('tdl.shader');
tdl.require('tdl.programs');
tdl.require('tdl.log');
tdl.require('tdl.models');
tdl.require('tdl.buffers');
tdl.require('tdl.framebuffers');
tdl.require('tdl.textures');
tdl.require('tdl.webgl');

var gl;
var canvas;
var aspect;

// Use this to refer to the backbuffer as if it were another framebuffer
var backbuffer;
var quad;
var imm;
var g_numBlobs;
var g_resolution;
var g_requestId;

if (!window.Float32Array) {
  // This just makes some errors go away when there is no WebGL.
  window.Float32Array = function() { };
}

// Useful global math constants
var up = new Float32Array([0, 1, 0])

var output = alert
var curBeat = 0
var then = 0.0;
var singleEffect = null
var g_fpsTimer;           // object to measure frames per second;

function mainloop() {
  var BPM = 60.0;
  var timeStart = 0.0;  // at what time does the beat start?

  var timeScale = BPM / 60.0;
  var frameCount = 0;
  var totalFrameCount = 0;

  var fpsElem = document.getElementById("fps");

  function render() {
    var now = (new Date()).getTime() * 0.001;
    var elapsedTime;
    if(then == 0.0) {
      elapsedTime = 0.0;
    } else {
      elapsedTime = now - then;
    }
    then = now;
    frameCount++;
    g_fpsTimer.update(elapsedTime);
    fpsElem.innerHTML = g_fpsTimer.averageFPS;

    aspect = canvas.clientWidth / canvas.clientHeight
    singleEffect.render(null, now, g_numBlobs)
    frameCount++;
    totalFrameCount++;
    g_requestId = requestAnimationFrame(render);
  }

  // Repeatedly run render(), attempt to hold 60 but the demo is
  // framerate independent so we will still keep sync even if we
  // lose frames.
  render();
}

function initializeGraphics() {
  canvas = document.getElementById('render_area');
  gl = tdl.webgl.setupWebGL(canvas);
  if (!gl) {
    return false;
  }

  aspect = canvas.clientWidth / canvas.clientHeight
  backbuffer = tdl.framebuffers.getBackBuffer(canvas)
  imm = new ImmSim()

  // Set some sane defaults.
  gl.disable(gl.BLEND);
  gl.depthFunc(gl.LEQUAL);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return true;
}

function setSetting(elem, id) {
  switch (id) {
  case 0:
  case 1:
  case 2:
  case 3:
    g_numBlobs = Math.pow(10, id);
    for (var ii = 0; ii < 4; ++ii) {
      g_setSettingElements[ii].style.color = "gray";
    }
    elem.style.color = "red";
    break;
  case 4:
  case 5:
  case 6:
  case 7:
  case 8:
    var resolution = {"4":16,"5":24,"6":32,"7":40,"8":48}[id]
    singleEffect = new MarchingCubesEffect(resolution);
    for (var ii = 4; ii < 9; ii++) {
      g_setSettingElements[ii].style.color = "gray"
    }
    elem.style.color = "red"
  }
}

/**
 * Sets up the count buttons.
 */
function setupCountButtons() {
  g_setSettingElements = [];
  for (var ii = 0; ii < 100; ++ii) {
    var elem = document.getElementById("setSetting" + ii);
    if (!elem) {
      break;
    }
    g_setSettingElements.push(elem);
    elem.onclick = function(elem, id) {
      return function () {
        setSetting(elem, id);
      }}(elem, ii);
  }
  setSetting(document.getElementById("setSetting1"), 1);
  setSetting(document.getElementById("setSetting5"), 6);
}

var g_setSettingElements = [];

function setup() {
  if (initializeGraphics()) {
    singleEffect = new MarchingCubesEffect(24);
    setupCountButtons();
    // Kick it off!
    mainloop()
  }
}

window.onload = function() {
  g_fpsTimer = new tdl.fps.FPSTimer();
  canvas = document.getElementById('render_area');

  //canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
  // tell the simulator when to lose context.
  //canvas.loseContextInNCalls(1);

  tdl.webgl.registerContextLostHandler(canvas, handleContextLost);
  tdl.webgl.registerContextRestoredHandler(canvas, handleContextRestored);

  setup();
}

function handleContextLost() {
  tdl.log("context lost");
  cancelAnimationFrame(g_requestId);
}

function handleContextRestored() {
  tdl.log("context restored");
  setup();
}
