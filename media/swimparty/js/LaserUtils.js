// LaserUtils.js

var createElementFromString = strHTML => {
  return document.createRange().createContextualFragment(strHTML)
}

var appendTo = (parent, strHTML) => {
  parent.appendChild( createElementFromString( strHTML ) )
}


module.exports.createElementFromString = createElementFromString

module.exports.appendTo = appendTo;

module.exports.smoothStep = ( x ) => {
  if ( x <= 0 ) return 0;
  if ( x >= 1 ) return 1;
  return x * x * ( 3 - 2 * x );
}

module.exports.smootherStep = ( x ) => {
  if ( x <= 0 ) return 0;
  if ( x >= 1 ) return 1;
  return x * x * x * ( x * ( x * 6 - 15 ) + 10 );
}

module.exports.randomElement = obj => {

  if (Array.isArray(obj)) {

    return obj[Math.floor(Math.random() * obj.length)];

  } else if (obj instanceof Object) {

    return obj[randElement(Object.keys[obj])];

  }

  return obj;
};


/**
 * convenience function for making a DataTexture
 * @param  {Array} data
 * @param  {Number} w       1 pixel of rgba is 4 data values
 * @param  {Number} h       height
 * @param  {Object} options data texture options
 * @return {THREE.DataTexture}
 */
 module.exports.makeDataTexture = ( data, w, h, options ) => {

  options = Object.assign({
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    mapping: THREE.UVMapping,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    anisotropy: 1
  }, options || {} );

  var dt = new THREE.DataTexture(
    data,
    w,
    h,
    options.format,
    options.type,
    options.mapping,
    options.wrapS,
    options.wrapT,
    options.magFilter,
    options.minFilter,
    options.anisotropy );

  dt.needsUpdate = true;

  return dt;
}


// makePaletteTexture.js
// makes a palette texture from patterns matching this sites urls:
// https://coolors.co/ff6978-fffcf9-e5f4e3-5da9e9-495867
module.exports.makePaletteTexture = function( url, rotate) {

  let s = url.split('/').pop().split('-').map(str => {
    return parseInt("0x" + str)
  })

  // convert the hex data to 0-255
  var colorData = s.map( hex => {
    return new THREE.Color( hex ).toArray().map( v => {
      return parseInt( Math.min(255,v * 255) )
    })
  })

  // flatten the array
  colorData = [].concat.apply([], colorData);

  // create the texture
  var dataTexture;

  if(rotate){

    dataTexture = new THREE.DataTexture(
      new Uint8Array( colorData ),
      colorData.length / 3,
      1,
      THREE.RGBFormat );

  } else {

    dataTexture = new THREE.DataTexture(
      new Uint8Array( colorData ),
      1,
      colorData.length / 3,
      THREE.RGBFormat );
  }

  dataTexture.needsUpdate = true

  return dataTexture
}
