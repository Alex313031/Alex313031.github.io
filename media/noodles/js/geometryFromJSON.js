// geometryFromJSON.js


module.exports = json => {

  var faces = json['faces']
  var v = json['position'];
  var n = json['normal'];
  var uv = json['uv'][Object.keys(json['uv'])[0]];
  var c = json['colors']


  var positions = [];
  var normals = [];
  var uvs = [];
  var colors = []

  var addPos = p => {
    positions.push(p[0], p[1], p[2])
  }

  var addNorm = n => {
    normals.push(n[0], n[1], n[2])
  }

  var addUV = uv => {
    uvs.push(uv[0], uv[1])
  }

  var addColors = c => {
    colors.push(c[0], c[1], c[2])
  }

  // interate through the faces
  var v0, v1, v2, i, j;
  faces.forEach( function( f ) {

    for(i=1, j=2; j<f[0].length; i++, j++) {

      // positions
      addPos( v[ f[0][0] ] );
      addPos( v[ f[0][i] ] );
      addPos( v[ f[0][j] ] );

      // normals
      addNorm( n[ f[1][0] ] );
      addNorm( n[ f[1][i] ] );
      addNorm( n[ f[1][j] ] );

      // uvs
      addUV( uv[ f[2][0] ] );
      addUV( uv[ f[2][i] ] );
      addUV( uv[ f[2][j] ] );

    }

  });



  if( c ) {

    faces.forEach( function( f ){

        // colors
        for(i=1, j=2; j<f[0].length; i++, j++) {

          addColors( c[ f[3][0] ] );
          addColors( c[ f[3][i] ] );
          addColors( c[ f[3][j] ] );

        }

    });
  }

  // create the Buffer mesh
  var g = new THREE.BufferGeometry();

  g.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(positions), 3 ) );
  g.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array(normals), 3 ) );
  g.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array(uvs), 2 ) );

  // g.addAttribute( 'uv2', new THREE.BufferAttribute( new Float32Array(uvs), 2 ) );

  if( c ) {
    g.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array(colors), 3 ) );
  }


  return g;
}
