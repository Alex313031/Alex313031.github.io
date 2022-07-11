'use strict';

/**
 * @constructor
 * @param {Element} container dom element
 * @param {object} options
 */
var ThreeView = function( container, options ) {

  this.container = container;

  this.needsStop = false;

  this.setup = function() {
    // overwrite.
  };

  this.update = function() {
    // overwrite.
  };

  this.draw = function() {
    // overwrite.
  };

  this.onResize = function(){
    // overwrite
  }

  this.setSize();

  this.autoResize = true;

  for (var i in options) {
    this[i] = options[i];
  }

  this.resizeTimeout;

  if(this.autoResize){

    $(window).on('resize', function(e){

      if(this.resizeTimeout){
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(function(){
        this.setSize();
      }.bind(this), 10);

    }.bind(this));

  }

};


/**
 * raf animation loop
 */
ThreeView.prototype.animate = function() {

  if (this.needsStop) {
    // break the raf loop
    this.needsStop = false;
    return;
  }

  this.update();

  this.draw();

  requestAnimationFrame(this.animate.bind(this));

};


/**
 * initialize the THREE.WebGLRenderer
 * @param  {Object} options
 * @return {THREE.WebGLRenderer}
 */
ThreeView.prototype.setupRenderer = function( options ) {

  // default renderer settings
  var renderOptions = {
    'canvas': undefined,
    'context': undefined,
    'precision': 'highp',
    'alpha': true,
    'premultipliedAlpha': true,
    'antialias': true,
    'stencil': true,
    'preserveDrawingBuffer': false,
    'depth': true,
    'logarithmicDepthBuffer': false,
    'autoClear':false,
    'autoClearDepth': true,
    'clearColor': 0x000000,
    'opacity': 0,
    'sortObjects': true,
    'useShadows': false,
    'shadowMapType': THREE.PCFShadowMap,
    'width': this.container.width(),
    'height': this.container.height(),
  };

  // overwrite with custom renderer settings
  for (var i in options || {}) {
    renderOptions[i] = options[i];
  }

  // setup the renderer
  var renderer = new THREE.WebGLRenderer( renderOptions );

  renderer.autoClear = renderOptions.autoClear;

  renderer.autoClearDepth = renderOptions.autoClearDepth;

  renderer.setClearColor( renderOptions.clearColor, renderOptions.opacity );

  renderer.sortObjects = renderOptions.sortObjects;

  renderer.setPixelRatio( window.devicePixelRatio );

  renderer.shadowMap.enabled = renderOptions.useShadows;

  renderer.shadowMap.type = renderOptions.shadowMapType;

  this.renderer = renderer;

  this.setSize( renderOptions.width, renderOptions.height );

  this.container.append( renderer.domElement );

  this.renderer = renderer;

  return this.renderer;
};


/**
 * setup the renderer and bgine the raf loop
 * @param  {Object} renderOptions
 */
ThreeView.prototype.begin = function( renderOptions ) {

  if ( !this.renderer && renderOptions ) {
    this.setupRenderer(renderOptions);
  }

  this.setup();

  this.animate();

};


/**
 * (re)start the animation loop
 */
ThreeView.prototype.play = function() {

  this.needsStop = false;

  ThreeView.prototype.animate();

};


/**
 * stop the animation loop
 */
ThreeView.prototype.stop = function() {

  this.needsStop = true;

};

/**
 * set the renderer size
 * @param {Number} w width
 * @param {Number} h height
 */
ThreeView.prototype.setSize = function( w, h ) {

  w = w || this.container.width();

  h = h || this.container.height();

  this.width = w;

  this.height = h;

  this.aspect = this.width / this.height;

  if (this.renderer) {

    this.renderer.setSize(w, h);

  }

  this.onResize();
};



// /**
//  * common js
//  */
// module.exports = ThreeView;
