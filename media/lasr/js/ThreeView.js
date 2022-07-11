
// ThreeView

var ThreeView = function(options, rendererOptions) {

  //
  rendererOptions = Object.assign( {
    antialias: true,
    autoClearColor: false
  }, rendererOptions || {} )

  // create the porperties in this object
  Object.assign( this, {

    width: window.innerWidth,

    height: window.innerHeight,

    aspect: window.innerWidth / window.innerHeight,

    // renderer: new THREE.WebGLRenderer(),
    renderer: (options && options.renderer) ? options.renderer : new THREE.WebGLRenderer(rendererOptions),

    setSize: (w, h) => {

      this.width = w || window.innerWidth

      this.height = h || window.innerHeight

      this.aspect = this.width / this.height

      if (this.renderer) {

        this.renderer.setSize(this.width, this.height)

      }
    },

    onResize: event => {
      //...
    }

  }, options || {} )


  // append the renderer to our container
  if(this.container) {

    if(typeof this.container === 'string') {
      this.container = document.getElementById( this.container )
    }

    this.container.appendChild( this.renderer.domElement )

  }


  // window events
  var resizeTimeout = null
  var resizeTimeStep = 50
  window.addEventListener('resize', event => {

    if ( !resizeTimeout ) {

      resizeTimeout = setTimeout( () => {

      resizeTimeout = null;

      this.setSize()

      this.onResize( event, this.width, this.height );

      }, resizeTimeStep);
    }
  })



  // setup
  this.setSize()

}

module.exports = ThreeView
