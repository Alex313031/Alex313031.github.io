// AnimationCurve.js


var mapLinear = function ( x, a1, a2, b1, b2 ) {

  if(a1 === a2) {
    return (b1 + b2) * 0.5;
  }

  return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

};

var lerp = function ( x, y, t ) {

  return ( 1 - t ) * x + t * y;

}

// smooth interpolation
var serp = ( x ) => {

  if ( x <= 0 ) return 0;
  if ( x >= 1 ) return 1;

  return x * x * ( 3 - 2 * x );
}


var AnimationCurve = function( options ) {

  this.u = 0;

  this.defaultEase = serp;

  this.curveIsNumeric = null;

  this.target = {x: 0, y: 0, z: 0};

  this.valueTemplate = this.target;

  this.needsUpdate = true;

  this.sortFunc = (a, b) => {
    return a.u - b.u;
  };

  this.controlPoints = []

  this.onSample = undefined;


  // overtwrite
  Object.assign(this, options || {});

}




AnimationCurve.prototype.addPoint = function(val, u, ease, onSample) {

  let cp = {
    value: val,
    u: u,
    ease: ease || this.defaultEase,
  }

  if(onSample)  cp['onSample'] = onSample

  this.controlPoints.push(cp)

  this.needsUpdate = true;

}

var lowIndex = 0,
    hiIndex = 0,
    low = 0,
    hi = 0,
    mixU = 0,
    updateEventArg = {prev: null, next: null, currentTime: 0};

AnimationCurve.prototype.getValue = function(u) {

  // TODO: maybe make this nicer at some point
  if(this.controlPoints.length === 0) return 0;

  // update the curve if needed
  if(this.needsUpdate) this.updateCurve()

  this.u = u;

  // interpolate
  lowIndex = this.getLowIndex(u);
  hiIndex = Math.min(this.controlPoints.length - 1, lowIndex + 1)

  low = this.controlPoints[lowIndex];
  hi = this.controlPoints[hiIndex];

  mixU = low.ease(mapLinear(u, low.u, hi.u, 0, 1));

  if(this.curveIsNumeric) {

    // if it's numeric return the value
    this.target = lerp(low.value, hi.value, mixU);

  } else {

    // interpolate the values based on the template
    for(var i in this.valueTemplate) {

      this.target[i] = lerp(low.value[i], hi.value[i], mixU)

    }
  }

  if(this.onSample){

    updateEventArg.prev = low
    updateEventArg.next = hi
    updateEventArg.currentTime = u
    this.onSample(updateEventArg)

  }

  return this.target;
}


AnimationCurve.prototype.getLowIndex = function(u) {

  if (u <= this.controlPoints[0].u){

    return 0;

  } else {

    for(let i=0; i<this.controlPoints.length - 1; i++) {
      if(u < this.controlPoints[i+1].u)  return i
    }

  }

  return Math.max(0,this.controlPoints.length - 1);
}


AnimationCurve.prototype.updateCurve = function() {

  this.needsUpdate = false;

  if(this.controlPoints.length === 0) return;

  if(this.curveIsNumeric === null) {

    this.curveIsNumeric = !isNaN(this.controlPoints[0].value)

  }

  // sort control points by u value from low to hi
  this.controlPoints.sort(this.sortFunc)

}


AnimationCurve.prototype.normalize = function() {

  // update the curve if needed
  if(this.needsUpdate) this.updateCurve();

  // get low and hi u values
  var lowU = this.controlPoints[0].u;
  var hiU = this.controlPoints[this.controlPoints.length-1].u;

  // remap the u values
  this.controlPoints.forEach( cp => {

    cp.u = mapLinear(cp.u, lowU, hiU, 0, 1)

  })
}


AnimationCurve.prototype.pointsFromArray = function(arr) {

  return arr.map( (val, i) => {

    return {
      u: i,
      value: val,
      ease: this.defaultEase || serp
    }
  });

}


AnimationCurve.prototype.eases = {

  zero: function() {
    return 0
  },

  one: function() {
    return 1
  },

  linear: function( k ) {
    return k
  },

  smooth: serp,

  smoother: function ( x ) {

    if ( x <= 0 ) return 0;
    if ( x >= 1 ) return 1;

    return x * x * x * ( x * ( x * 6 - 15 ) + 10 );
  },

}


module.exports = AnimationCurve;
