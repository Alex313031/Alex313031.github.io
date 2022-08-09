// touchEvents.js

var ongoingTouches = [];

module.exports = function(options) {

  var touchStartCallback = e => {
    this.onTouchStart( e )
  }
  var touchMoveCallback = e => {
    this.onTouchMove( e )
  }
  var touchEndCallback = e => {
    this.onTouchEnd( e )
  }

  Object.assign( this, {

    element: null,

    onToushStart: e => {},

    onTouchMove: e => {},

    onTouchEnd: e => {},

    addListeners: ( el ) =>{

      if(this.element !== el) {
        this.removeListeners()
      }

      this.element = el;

      el.addEventListener( 'touchstart', touchStartCallback, false );
      el.addEventListener( 'touchend', touchEndCallback, false );
      el.addEventListener( 'touchmove', touchMoveCallback, false );
    },

    removeListeners: () => {

      if(this.element) {

        this.element.removeEventListener( 'touchstart', touchStartCallback, false );
        this.element.removeEventListener( 'touchend', touchEndCallback, false );
        this.element.removeEventListener( 'touchmove', touchMoveCallback, false );

      }

      this.element = null
    }

  }, options || {} )


  // setup
  if(this.element) {

    this.addListeners( this.element )

  }

}
