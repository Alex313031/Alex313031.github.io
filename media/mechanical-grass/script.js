// Draw Worm
// Originally forked from flash project - http://wonderfl.net/c/9os2
//
//
// Click to clear the canvas.
//
function DrawWorm() {
  var canvas;
  var context;

  var width;
  var height;

  var mouse = { x: 0, y: window.innerHeight - 20 };

  //Expose the mouse to demo the app.
  this.mouse = mouse;

  var interval;

  var vms = [];

  var MAX_NUM = 100;
  var N = 80;

  var px = 500;
  var py = 500;

  this.initialize = function() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    canvas.addEventListener("mousemove", MouseMove, false);
    canvas.addEventListener("click", MouseDown, false);

    //Set interval - Bad! - I know!
    var interval = setInterval(Draw, 20);
  };

  var Draw = function() {
    var len = vms.length;
    var i;

    for (i = 0; i < len; i++) {
      var o = vms[i];

      if (o.count < N) {
        DrawWorm(o);
        o.count++;
      } else {
        len--;
        vms.splice(i, 1);
        i--;
      }
    }

    Check();
  };

  //Takes a worm (obj) param
  var DrawWorm = function(obj) {
    if (Math.random() > 0.9) {
      obj.tmt.rotate(-obj.r * 2);
      obj.r *= -1;
    }

    obj.vmt.prependMatrix(obj.tmt);

    var cc1x = -obj.w * obj.vmt.c + obj.vmt.tx;
    var cc1y = -obj.w * obj.vmt.d + obj.vmt.ty;

    var pp1x = (obj.c1x + cc1x) / 2;
    var pp1y = (obj.c1y + cc1y) / 2;

    var cc2x = obj.w * obj.vmt.c + obj.vmt.tx;
    var cc2y = obj.w * obj.vmt.d + obj.vmt.ty;

    var pp2x = (obj.c2x + cc2x) / 2;
    var pp2y = (obj.c2y + cc2y) / 2;

    context.fillStyle = "#000000";
    context.strokeStyle = "#000000";
    context.beginPath();

    context.moveTo(obj.p1x, obj.p1y);
    context.quadraticCurveTo(obj.c1x, obj.c1y, pp1x, pp1y);

    context.lineTo(pp2x, pp2y);

    context.quadraticCurveTo(obj.c2x, obj.c2y, obj.p2x, obj.p2y);

    context.closePath();
    context.fill();

    obj.c1x = cc1x;
    obj.c1y = cc1y;
    obj.p1x = pp1x;
    obj.p1y = pp1y;
    obj.c2x = cc2x;
    obj.c2y = cc2y;
    obj.p2x = pp2x;
    obj.p2y = pp2y;
  };

  var Check = function() {
    var x0 = mouse.x;
    var y0 = mouse.y;

    var vx = x0 - px;
    var vy = y0 - py;

    var len = Math.min(Magnitude(vx, vy), 50) + 8;

    if (len < 10) {
      return;
    }

    var matrix = new Matrix2D();

    matrix.rotate(-Math.atan2(vx, vy));

    matrix.translate(x0, y0);

    createWorm(matrix, len);
    context.beginPath();
    context.strokeStyle = "#000000";
    context.moveTo(px, py);
    context.lineTo(x0, y0);
    context.stroke();
    context.closePath();

    px = x0;
    py = y0;

    //More logic here for afterwards?
  };

  var createWorm = function(mtx, len) {
    var angle = Math.random() * (Math.PI / 6 - Math.PI / 64) + Math.PI / 64;

    if (Math.random() > 0.5) {
      angle *= -1;
    }

    var tmt = new Matrix2D();
    tmt.scale(0.95, 0.95);
    //tmt.rotate(angle);
    tmt.translate(12, 0);

    var w = 0.5;

    var obj = new Worm();

    obj.c1x = -w * mtx.c + mtx.tx;
    obj.p1x = -w * mtx.c + mtx.tx;

    obj.c1y = -w * mtx.d + mtx.ty;
    obj.p1y = -w * mtx.d + mtx.ty;

    obj.c2x = w * mtx.c + mtx.tx;
    obj.p2x = w * mtx.c + mtx.tx;

    obj.c2y = w * mtx.d + mtx.ty;
    obj.p2y = w * mtx.d + mtx.ty;

    obj.vmt = mtx;
    obj.tmt = tmt;

    obj.r = angle;
    obj.w = len / 20;
    obj.count = 0;

    vms.push(obj);

    if (vms.length > MAX_NUM) {
      vms.shift();
    }
  };

  //Not sure why they do this kinda thing in flash.
  var Worm = function() {
    this.c1x = null;
    this.c1y = null;
    this.c2x = null;
    this.c2y = null;
    this.p1x = null;
    this.p1y = null;
    this.p2x = null;
    this.p2y = null;

    this.w = null;
    this.r = null;

    this.count = null;
    this.vmt = null;
    this.tmt = null;
  };

  //Clear the screen,
  var MouseDown = function(e) {
    e.preventDefault();
    canvas.width = canvas.width;
    vms = [];
  };

  var MouseMove = function(e) {
    mouse.x = e.layerX - canvas.offsetLeft;
    mouse.y = e.layerY - canvas.offsetTop;
  };

  //Returns Magnitude
  var Magnitude = function(x, y) {
    return Math.sqrt(x * x + y * y);
  };
}

function demoApp() {
  app.mouse.x += 20;
  if (app.mouse.x >= window.innerWidth) {
    window.clearInterval(interval);
  }
}

// Start the demo.
var app, interval;
setTimeout(function() {
  app = new DrawWorm();
  app.initialize();
  interval = setInterval(demoApp, 20);
}, 10);