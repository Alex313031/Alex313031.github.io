// makePaletteTexture.js


// makes a palette texture from patterns matching this sites urls:
// https://coolors.co/ff6978-fffcf9-e5f4e3-5da9e9-495867



module.exports = function( url, rotate) {

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
